/**
 * GraphRAG cho mạo từ (a / an / the) của một bài học.
 *
 * Bám 2 pha của GraphRAG (Edge et al., 2024 — "From Local to Global: A Graph RAG Approach to Query-Focused Summarization"):
 *
 *  PHA 1 — INDEXING (backend chạy khi trả bài học, có cache):
 *    1. Text units      : chia nguồn (bài giảng viết, lời thoại video, câu ví dụ, bảng từ vựng) thành câu.
 *    2. Extraction      : từ mỗi text unit trích thực thể (ARTICLE, NOUN, RULE), quan hệ và claim
 *                         ("mạo từ X đi với danh từ Y vì quy tắc Z", kèm text unit làm dẫn chứng).
 *    3. Entity resolution + summarization: gộp danh từ trùng (số ít / số nhiều), gộp mô tả.
 *    4. Graph           : đồ thị vô hướng có trọng số; degree của thực thể, rank quan hệ = combined degree.
 *    5. Communities     : Leiden phân cấp (Traag et al., 2019 — local moving → refinement → aggregation),
 *                         cộng đồng lớn hơn MAX_CLUSTER_SIZE được chia tiếp ở cấp dưới.
 *    6. Community reports: mỗi cộng đồng một báo cáo (tiêu đề, tóm tắt, phát hiện, mức quan trọng).
 *
 *  PHA 2 — QUERY (frontend chạy khi học viên bấm):
 *    - globalSearch: map-reduce trên các community report → tổng quan mạo từ trong bài.
 *    - localSearch : thực thể khớp truy vấn → mở rộng hàng xóm, quan hệ, text unit, community report
 *                    → xếp hạng, cắt theo ngân sách ngữ cảnh → câu trả lời kèm dẫn chứng.
 *
 * Khác bản gốc: bước trích xuất và bước viết câu trả lời dùng bộ luật ngữ pháp (deterministic)
 * thay cho LLM — chạy offline, không tốn phí, kết quả kiểm chứng được. Hàm `extract` là điểm thay thế
 * nếu sau này gắn LLM (AI-01).
 */

// ==========================================
// 1. CONTRACT (dùng chung backend ↔ frontend)
// ==========================================
export type ArticleWord = 'a' | 'an' | 'the';
export type ArticleRuleId =
  | 'A_CONSONANT'
  | 'A_ADJ'
  | 'A_YU'
  | 'AN_VOWEL'
  | 'AN_ADJ'
  | 'AN_SILENT_H'
  | 'A_CLASSIFY'
  | 'A_RATE'
  | 'THE_ANAPHORA'
  | 'THE_SUPERLATIVE'
  | 'THE_ORDINAL'
  | 'THE_UNIQUE'
  | 'THE_FIXED'
  | 'THE_POSTMOD'
  | 'THE_CONTEXT';
export type ArticleTextSource = 'video' | 'bai-giang' | 'vi-du' | 'tu-vung';
export type ArticleEntityType = 'ARTICLE' | 'NOUN' | 'RULE';

export interface ArticleTextUnit {
  id: string;
  text: string;
  source: ArticleTextSource;
  /** Thứ tự xuất hiện trong bài */
  order: number;
  /** Đoạn chứa câu (cả video là 1 đoạn) — chỉ câu cùng đoạn mới xét "đã nhắc ở trước" */
  block: number;
  /** Câu thoại video: mốc thời gian */
  startMs?: number;
}
export interface ArticleEntity {
  id: string;
  type: ArticleEntityType;
  title: string;
  description: string;
  meaningVi?: string;
  ipa?: string;
  textUnitIds: string[];
  /** Số hàng xóm trong đồ thị */
  degree: number;
  /** Cộng đồng theo từng cấp Leiden: [cấp 0, cấp 1, …] */
  communities: number[];
}
export interface ArticleRelationship {
  id: string;
  source: string;
  target: string;
  kind: 'USED_WITH' | 'EXPLAINED_BY' | 'APPLIES';
  weight: number;
  description: string;
  textUnitIds: string[];
  /** combined degree (degree nguồn + degree đích) — cách GraphRAG xếp hạng quan hệ */
  rank: number;
}
/** Claim (covariate): một lần dùng mạo từ cụ thể, có dẫn chứng */
export interface ArticleClaim {
  id: string;
  article: ArticleWord;
  /** Cụm đầy đủ: "an important meeting" */
  phrase: string;
  /** Từ ngay sau mạo từ — quyết định a hay an */
  nextWord: string;
  /** Phiên âm của nextWord (nếu có trong bảng từ vựng) */
  nextIpa?: string;
  nounId: string;
  /** Quy tắc giải thích, quy tắc chính đứng đầu */
  rules: ArticleRuleId[];
  textUnitId: string;
  /** Suy ra từ phiên âm trong bảng từ vựng (không có câu dùng thật trong bài) */
  inferred?: boolean;
}
export interface ArticleFinding {
  ruleId: ArticleRuleId;
  summary: string;
  explanation: string;
  /** Số lần quy tắc xuất hiện trong bài */
  count: number;
  /** Các cụm trong bài theo quy tắc này */
  phrases: string[];
  /** Câu dẫn chứng (câu dùng thật đầu tiên) */
  proofUnitId?: string;
}
export interface ArticleCommunityReport {
  id: number;
  level: number;
  parent?: number;
  title: string;
  summary: string;
  /** Mức quan trọng 1–10 (thay cho "impact rating" do LLM chấm trong bản gốc) */
  rating: number;
  findings: ArticleFinding[];
  entityIds: string[];
  textUnitIds: string[];
}
export interface ArticleGraphIndex {
  version: 1;
  textUnits: ArticleTextUnit[];
  entities: ArticleEntity[];
  relationships: ArticleRelationship[];
  claims: ArticleClaim[];
  communities: ArticleCommunityReport[];
}

/** Nguồn để index: lấy thẳng từ bài học */
export interface ArticleCorpus {
  /** Bài giảng viết (markdown) */
  content?: string;
  /** Lời thoại video */
  transcript?: { startMs: number; en: string }[];
  /** Câu ví dụ của các mục kiến thức */
  examples?: string[];
  /** Bảng từ vựng của bài */
  vocab?: { word: string; ipa?: string; pos?: string; meaningVi: string; example?: string }[];
}

// ==========================================
// 2. TRI THỨC NGỮ PHÁP (bộ luật thay cho LLM)
// ==========================================
/** Tầng giữa của sơ đồ: dạng "mạo từ + …" gặp trong video (a + phụ âm, a + tính từ + danh từ, the + so sánh nhất…) */
export const ARTICLE_RULES: Record<ArticleRuleId, { article: ArticleWord | 'a/an'; title: string; description: string }> = {
  A_CONSONANT: { article: 'a', title: 'a + phụ âm', description: 'Dùng a trước danh từ đếm được số ít bắt đầu bằng phụ âm: a book, a car.' },
  A_ADJ: { article: 'a', title: 'a + tính từ + danh từ', description: 'Có tính từ đứng trước danh từ thì xét chữ đầu của tính từ: a busy day, a new office.' },
  A_YU: { article: 'a', title: 'a + u / eu / one (đọc như phụ âm)', description: 'Chữ đầu là nguyên âm nhưng đọc /juː/ hoặc /w/ nên vẫn dùng a: a university, a European, a one-way ticket.' },
  AN_VOWEL: { article: 'an', title: 'an + nguyên âm', description: 'Dùng an trước danh từ đếm được số ít bắt đầu bằng nguyên âm (u, e, o, a, i): an apple, an office.' },
  AN_ADJ: { article: 'an', title: 'an + tính từ + danh từ', description: 'Tính từ bắt đầu bằng nguyên âm đứng trước danh từ thì dùng an: an important meeting, an old friend.' },
  AN_SILENT_H: { article: 'an', title: 'an + h câm', description: 'Chữ h không đọc nên từ bắt đầu bằng nguyên âm: an hour, an honest man.' },
  A_CLASSIFY: { article: 'a/an', title: 'be + a / an + nghề nghiệp', description: 'Sau be / become / as để nói ai đó làm nghề gì, thuộc loại nào: She is a teacher, He is an engineer.' },
  A_RATE: { article: 'a/an', title: 'số lần / giá + a / an + đơn vị', description: 'a / an nghĩa là "mỗi": twice a week, $10 an hour.' },
  THE_ANAPHORA: { article: 'the', title: 'the + danh từ đã nhắc ở trước', description: 'Danh từ đã nói tới ở câu trước (thường với a / an), lần sau dùng the: a report → the report.' },
  THE_SUPERLATIVE: { article: 'the', title: 'the + so sánh nhất', description: 'Luôn dùng the trước so sánh nhất: the best option, the most popular product.' },
  THE_ORDINAL: { article: 'the', title: 'the + first / next / last / only / same', description: 'Dùng the với số thứ tự và các từ chỉ duy nhất: the first time, the same day, the only way.' },
  THE_UNIQUE: { article: 'the', title: 'the + vật duy nhất', description: 'Vật duy nhất mà ai cũng biết: the sun, the internet, the environment.' },
  THE_FIXED: { article: 'the', title: 'Cụm cố định có the', description: 'Cụm quen dùng với the: in the morning, at the moment, on the phone, play the piano.' },
  THE_POSTMOD: { article: 'the', title: 'the + danh từ + of / who / that…', description: 'Phần phía sau cho biết đúng là cái nào: the price of the ticket, the man who called.' },
  THE_CONTEXT: { article: 'the', title: 'the + danh từ người nghe đã biết', description: 'Cả hai bên đều biết đang nói tới người / vật nào nhờ tình huống: the manager, the office.' },
};

const VI_CHAR = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const VOWEL_IPA = /^[aeiouæɑɒɔəɜʌɪʊɛ]/;
const SILENT_H = new Set(['hour', 'hours', 'hourly', 'honest', 'honestly', 'honesty', 'honour', 'honor', 'honorable', 'honourable', 'heir', 'heiress']);
const YU_START = /^(uni(?!n)|use|usu|uti|ure|uro|eu|ewe|one\b|once\b|ufo\b)/;
const VOWEL_LETTER_NAME = new Set('AEFHILMNORSX'.split(''));

const STOP = new Set(['is', 'are', 'was', 'were', 'be', 'been', 'am', 'has', 'have', 'had', 'will', 'would', 'can', 'could', 'should', 'must', 'may', 'might', 'do', 'does', 'did', 'and', 'or', 'but', 'so', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'about', 'into', 'than', 'as', 'that', 'who', 'which', 'whom', 'whose', 'where', 'when', 'what', 'how', 'why', 'you', 'we', 'i', 'he', 'she', 'it', 'they', 'not', 'very', 'too', 'also', 'if', 'then', 'there', 'this', 'these', 'those']);
const PRONOUN = new Set(['my', 'your', 'his', 'her', 'its', 'our', 'their', 'one', 'ones', 'other', 'others']);
/** a few / a lot / a little … là lượng từ, không phải mạo từ + danh từ */
const QUANT = new Set(['lot', 'lots', 'few', 'little', 'bit', 'number', 'couple', 'quarter', 'half', 'variety', 'range', 'kind', 'sort', 'type']);
const QUANT_IF_OF = new Set(['great', 'good', 'deal', 'majority', 'series', 'pair', 'group', 'list', 'set', 'piece']);
const VERBISH = new Set(['said', 'says', 'told', 'asked', 'called', 'went', 'came', 'made', 'took', 'gave', 'got', 'found', 'left', 'needs', 'wants', 'starts', 'started', 'begins', 'began', 'shows', 'showed', 'looks', 'seems', 'opens', 'closes', 'arrived', 'arrives', 'includes', 'included']);
/** Từ không thể nằm trong cụm danh từ phía sau mạo từ (an important meeting every week) */
const PHRASE_END = new Set(['every', 'each', 'all', 'some', 'any', 'no', 'today', 'tomorrow', 'yesterday', 'tonight', 'here', 'now', 'again', 'together', 'also', 'always', 'never', 'often', 'usually', 'soon', 'yet', 'still', 'just', 'even']);
/** Từ -ing vừa làm bổ nghĩa (meeting room) vừa là danh từ (an important meeting) */
const ING_NOUN = new Set(['meeting', 'training', 'booking', 'parking', 'shopping', 'building', 'opening', 'painting', 'recording', 'wedding', 'morning', 'evening', 'ceiling', 'listing', 'setting', 'offering', 'finding', 'ending', 'beginning', 'warning', 'reading', 'hearing', 'filling', 'heading', 'housing', 'marketing', 'advertising', 'printing', 'packaging']);
const COMPARATIVE = new Set(['better', 'worse', 'more', 'less', 'earlier', 'later', 'sooner', 'faster', 'bigger', 'higher', 'lower', 'longer', 'harder', 'easier']);
const ORDINAL = new Set(['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'last', 'next', 'only', 'same', 'following', 'final', 'previous']);
const SUPERLATIVE_EXCEPT = new Set(['interest', 'test', 'request', 'guest', 'forest', 'west', 'east', 'rest', 'chest', 'contest', 'suggest', 'nest', 'best-seller', 'protest', 'harvest', 'honest', 'modest', 'arrest', 'invest', 'manifest', 'quest', 'digest', 'latest-news']);
const UNIQUE = new Set(['sun', 'moon', 'earth', 'world', 'sky', 'internet', 'sea', 'ocean', 'environment', 'government', 'police', 'public', 'universe', 'atmosphere', 'equator', 'web']);
const FIXED: RegExp[] = [
  /\b(by|at|until|till|towards?) the (end|time|way)\b/i,
  /\bin the (end|middle|center|centre|background|foreground|corner)\b/i,
  /\b(in|during) the (morning|afternoon|evening|past|future|end|meantime)\b/i,
  /\bat the (moment|end|beginning|weekend|same time|top|bottom|front|back)\b/i,
  /\bon the (phone|internet|radio|other hand|way|left|right|whole)\b/i,
  /\b(play|plays|played|playing) the (piano|guitar|violin|drums|flute)\b/i,
  /\ball the (time|way)\b/i,
  /\bthe same\b/i,
];
const UNCOUNTABLE = new Set(['equipment', 'luggage', 'baggage', 'furniture', 'information', 'advice', 'pollution', 'privacy', 'money', 'water', 'food', 'music', 'news', 'work', 'homework', 'traffic', 'weather', 'english', 'feedback', 'research', 'software', 'merchandise', 'staff', 'knowledge', 'management', 'evidence', 'progress', 'transportation', 'accommodation', 'machinery', 'clothing', 'stuff', 'health', 'happiness', 'education', 'decision-making', 'time management']);
const PLURAL_ONLY = new Set(['customs', 'headquarters', 'goods', 'clothes', 'people', 'police', 'premises', 'earnings', 'savings', 'belongings', 'surroundings', 'news']);
const NO_ARTICLE_HEAD = new Set(['english', 'listening', 'reading', 'writing', 'speaking', 'summer', 'winter', 'spring', 'autumn', 'lunch', 'dinner', 'breakfast', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
/** Đuôi tính từ: dùng khi mở rộng cụm (a comfortable chair) và khi loại cụm kết thúc bằng tính từ */
const ADJ_EXT = /(ous|ful|less|ical|ive|ible|able|ed|al|ic|ary)$/;
const ADJ_HEAD = /(ous|ful|less|ical|[a-z]{4}ed)$/;
const VI_ONLY_TOKEN = /^(nh|ng|kh|gh)[a-z]*$|nh$/i;
const COMMON_ADJ = new Set(['new', 'old', 'good', 'bad', 'big', 'small', 'short', 'long', 'great', 'free', 'high', 'low', 'best', 'worst', 'same', 'next', 'last', 'first', 'second', 'third', 'main', 'local', 'quick', 'strong', 'heavy', 'busy', 'nice', 'young', 'whole', 'real', 'full', 'open', 'hot', 'cold', 'warm', 'cheap', 'expensive', 'large', 'little', 'late', 'early', 'easy', 'hard', 'fast', 'slow', 'clean', 'safe', 'right', 'wrong', 'major', 'minor', 'key', 'top', 'most', 'least', 'only', 'following', 'final', 'previous', 'sales', 'return', 'wooden', 'popular', 'important', 'unique', 'serious', 'private', 'public', 'local', 'daily', 'weekly', 'monthly', 'yearly', 'one-way', 'two-day', 'part-time', 'full-time', 'well-known', 'interesting', 'exciting', 'boring', 'amazing', 'missing', 'existing', 'upcoming', 'outstanding', 'leading', 'growing', 'increasing', 'remaining', 'working', 'living', 'shopping', 'parking', 'waiting', 'meeting', 'training', 'booking', 'nearby', 'online', 'annual', 'national', 'international', 'personal', 'professional', 'different', 'excellent', 'efficient', 'convenient', 'recent', 'current', 'urgent', 'pleasant', 'relevant', 'significant', 'honest', 'happy', 'angry', 'ugly', 'elderly', 'empty', 'hourly', 'unusual', 'unhappy', 'ordinary', 'eager', 'easy', 'early', 'old', 'only', 'open', 'average', 'extra', 'entire', 'urban', 'overall']);
const NEGATIVE_CUE = /(không nói|không dùng|sai|tránh|✗|❌|~~)\s*[:：]?\s*["“*_`(]*\s*$/i;
const BE = new Set(['is', 'am', 'are', 'was', 'were', 'be', 'been', 'become', 'becomes', 'became', 'as']);
const RATE_NOUN = new Set(['hour', 'day', 'week', 'month', 'year', 'time', 'minute', 'night', 'person', 'piece', 'kilo', 'kilogram']);
const RATE_BEFORE = /(\$|£|€|\d|once|twice|three times|times|dollars?|cents?|euros?|km|miles?)$/i;

// ==========================================
// 3. TIỆN ÍCH NGÔN NGỮ
// ==========================================
const lower = (s: string) => s.toLowerCase();
/** Đưa danh từ về số ít để gộp thực thể (entity resolution) */
export function lemmaOf(word: string): string {
  const w = lower(word);
  if (PLURAL_ONLY.has(w) || w.length <= 3 || /(ss|us|is)$/.test(w)) return w;
  if (/ies$/.test(w)) return w.slice(0, -3) + 'y';
  if (/(ches|shes|xes|sses|zes)$/.test(w)) return w.slice(0, -2);
  if (/s$/.test(w)) return w.slice(0, -1);
  return w;
}
/** Từ bắt đầu bằng ÂM nguyên âm? Ưu tiên phiên âm IPA của bài; không có thì dùng luật chính tả + ngoại lệ */
export function startsWithVowelSound(word: string, ipa?: string): boolean {
  if (ipa) {
    const p = ipa.replace(/[/[\]ˈˌ.\s]/g, '');
    if (p) return VOWEL_IPA.test(p);
  }
  if (/^[A-Z]{2,}$/.test(word)) return VOWEL_LETTER_NAME.has(word[0]);
  const w = lower(word);
  if (SILENT_H.has(w)) return true;
  if (YU_START.test(w)) return false;
  return /^[aeiou]/.test(w);
}
const isSuperlative = (w: string) => w === 'most' || w === 'least' || w === 'best' || w === 'worst' || (/[a-z]{2,}est$/.test(w) && !SUPERLATIVE_EXCEPT.has(w));

/** Bỏ định dạng markdown, giữ chữ */
function plain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]+/g, '')
    .replace(/^\s*(#{1,6}|>|[-+]|\d+\.)\s+/gm, '')
    .replace(/[ \t]+/g, ' ');
}

/**
 * Bài giảng viết là tiếng Việt xen ví dụ tiếng Anh → chỉ lấy các đoạn tiếng Anh:
 * chuỗi ≥ 3 từ không dấu tiếng Việt và có ít nhất một từ chức năng tiếng Anh.
 * Bỏ đoạn đứng sau "không nói / sai / tránh" (ví dụ SAI trong bài).
 */
function englishFragments(line: string): string[] {
  const out: string[] = [];
  const tokens = line.split(/(\s+)/);
  let run: string[] = [];
  let runStart = 0;
  let pos = 0;
  const flush = () => {
    const words = run.filter((t) => t.trim());
    if (words.length >= 3) {
      const text = run.join('').trim().replace(/^[^A-Za-z0-9"“$£€]+/, '').replace(/[^A-Za-z0-9.!?"”)]+$/, '');
      const before = line.slice(0, runStart);
      const fn = words.some((t) => STOP.has(lower(t.replace(/[^A-Za-z']/g, ''))) || /^(the|a|an)$/i.test(t.replace(/[^A-Za-z]/g, '')));
      if (text && fn && !NEGATIVE_CUE.test(before)) out.push(text);
    }
    run = [];
  };
  for (const t of tokens) {
    if (t.trim() && (VI_CHAR.test(t) || /[|]/.test(t) || VI_ONLY_TOKEN.test(t.replace(/[^A-Za-z]/g, '')))) flush();
    else {
      if (!run.length) runStart = pos;
      run.push(t);
    }
    pos += t.length;
  }
  flush();
  return out;
}
const sentencesOf = (s: string) => s.split(/(?<=[.!?])\s+(?=[A-Z"“])/).map((x) => x.trim()).filter((x) => x.length > 3);

// ==========================================
// 4. INDEXING
// ==========================================
/** Bước 1 — text units (chunk theo câu, giữ thứ tự xuất hiện trong bài) */
export function buildTextUnits(c: ArticleCorpus): ArticleTextUnit[] {
  const units: ArticleTextUnit[] = [];
  const seen = new Set<string>();
  const add = (text: string, source: ArticleTextSource, block: number, startMs?: number) => {
    // "câu sai → câu đúng": chỉ giữ câu đúng
    const t = (source === 'tu-vung' ? text : (text.split('→').pop() ?? '').replace(/^[\s.…]+/, '')).replace(/\s+/g, ' ').trim();
    const key = lower(t).replace(/[^a-z0-9]+/g, ' ').trim();
    if (source !== 'tu-vung') {
      if (!/\b(a|an|the)\b/i.test(t)) return;
      // dòng phương án trắc nghiệm "(A) … (B) …" và câu còn chỗ trống không phải câu dùng thật
      if (/(^|\s)\(?[A-D]\)\s/.test(t) || /_{2,}|\.{3,}\s*\w+\s*\.{3,}/.test(t)) return;
    }
    if (!key || seen.has(key)) return;
    seen.add(key);
    units.push({ id: `tu${units.length + 1}`, text: t, source, order: units.length, block, ...(startMs !== undefined ? { startMs } : {}) });
  };
  let block = 0;
  // lời thoại video là một mạch nói liên tục → 1 đoạn
  (c.transcript ?? []).forEach((cue) => sentencesOf(cue.en).forEach((s) => add(s, 'video', 0, cue.startMs)));
  if (c.content)
    plain(c.content)
      .split(/\n\s*\n/)
      .forEach((para) => {
        block++;
        para.split('\n').forEach((line) => englishFragments(line).forEach((f) => sentencesOf(f).forEach((s) => add(s, 'bai-giang', block))));
      });
  (c.examples ?? []).forEach((e) => {
    if (!e || VI_CHAR.test(e) || /[+…]/.test(e)) return;
    block++;
    sentencesOf(e).forEach((s) => add(s, 'vi-du', block));
  });
  (c.vocab ?? []).forEach((v) => {
    if (!v.example || VI_CHAR.test(v.example)) return;
    block++;
    sentencesOf(v.example).forEach((s) => add(s, 'vi-du', block));
  });
  // bảng từ vựng: mỗi danh từ 1 text unit (để suy a/an từ phiên âm khi bài không có câu dùng thật)
  (c.vocab ?? []).forEach((v) => {
    if (v.pos && /\bn\b/.test(v.pos) && /^[A-Za-z][A-Za-z-]*$/.test(v.word))
      add(`${v.word}${v.ipa ? ` ${v.ipa}` : ''} (${v.pos}): ${v.meaningVi}`, 'tu-vung', ++block);
  });
  return units;
}

type VocabInfo = { ipa?: string; meaningVi: string; pos?: string };

/** Bước 2 — trích claim từ một text unit (điểm thay thế bằng LLM) */
function extract(unit: ArticleTextUnit, vocab: Map<string, VocabInfo>, lessonAdj: Set<string>, mentioned: Map<string, { block: number; order: number }>): Omit<ArticleClaim, 'id'>[] {
  if (unit.source === 'tu-vung') return [];
  const out: Omit<ArticleClaim, 'id'>[] = [];
  const isNoun = (w: string) => !!vocab.get(w)?.pos && /\bn\b/.test(vocab.get(w)!.pos!);
  const confirmedAdj = (w: string) => COMMON_ADJ.has(w) || lessonAdj.has(w) || isSuperlative(w) || ORDINAL.has(w) || /^\d+$/.test(w) || (w.includes('-') && !isNoun(w));
  const isModifier = (w: string) => confirmedAdj(w) || (ADJ_EXT.test(w) && !isNoun(w) && !SUPERLATIVE_EXCEPT.has(w));
  const isAdjHead = (w: string) => !isNoun(w) && !ING_NOUN.has(w) && (COMMON_ADJ.has(w) || lessonAdj.has(w) || ADJ_HEAD.test(w));
  // lookahead: chỉ "ăn" mạo từ, để cụm lồng nhau vẫn được xét (the price of the ticket)
  const re = /\b(a|an|the)\s+(?=((?:[A-Za-z][A-Za-z'-]*\s+){0,4}[A-Za-z][A-Za-z'-]*))/gi;
  for (const m of unit.text.matchAll(re)) {
    const article = lower(m[1]) as ArticleWord;
    // "A" viết hoa giữa câu có thể là nhãn đáp án (A, B, C) → chỉ nhận đầu câu
    if (m[1] === 'A' && m.index! > 0 && !/[.!?"“]\s*$/.test(unit.text.slice(0, m.index))) continue;
    const toks = m[2].split(/\s+/);
    const first = lower(toks[0]);
    if (STOP.has(first) || PRONOUN.has(first) || first.length < 2) continue;
    if (QUANT.has(first) || (QUANT_IF_OF.has(first) && (toks[1] === undefined || /^(of|deal)$/i.test(toks[1])))) continue;
    if (article === 'the' && COMPARATIVE.has(first)) continue; // the more…, the better…
    const take = [toks[0]];
    for (let i = 1; i < toks.length; i++) {
      const prev = lower(take[i - 1]);
      const cur = lower(toks[i]);
      if (STOP.has(cur) || PRONOUN.has(cur) || VERBISH.has(cur) || PHRASE_END.has(cur)) break;
      // "the meeting lasts", "a training starts": từ -ing đứng trước động từ chia ngôi → hết cụm
      if (/ing$/.test(prev) && /(ed|s)$/.test(cur)) break;
      // từ trước còn là bổ nghĩa (tính từ, so sánh nhất, số thứ tự, danh từ ghép trong bảng từ vựng) → lấy thêm
      if (confirmedAdj(prev) || (vocab.has(prev) && vocab.has(cur))) take.push(toks[i]);
      else if (isModifier(prev) && !/(ed|s)$/.test(cur)) take.push(toks[i]);
      else break;
    }
    const head = lower(take[take.length - 1]);
    if (STOP.has(head) || PRONOUN.has(head) || NO_ARTICLE_HEAD.has(head)) continue;
    if (isAdjHead(head) || ORDINAL.has(head) || isSuperlative(head) || /^\d+$/.test(head)) continue; // cụm kết thúc bằng tính từ / số (the best, the first)
    if (article === 'the' && /^\s+of the two\b/i.test(unit.text.slice(m.index! + m[0].length + take.join(' ').length))) continue; // the taller of the two
    const lemma = lemmaOf(head);
    if (article !== 'the' && (UNCOUNTABLE.has(lemma) || PLURAL_ONLY.has(head) || UNIQUE.has(lemma))) continue;
    const nextWord = take[0];
    const phrase = `${article} ${take.join(' ')}`;
    // từ đứng ngay trước mạo từ và ngay sau cụm
    const prevWords = unit.text.slice(0, m.index).trim().split(/\s+/);
    const before = (prevWords[prevWords.length - 1] ?? '').replace(/[^A-Za-z0-9$£€]/g, '');
    const before2 = lower((prevWords[prevWords.length - 2] ?? '').replace(/[^A-Za-z]/g, ''));
    const rest = unit.text.slice(m.index! + m[0].length + take.join(' ').length);
    const after = lower(rest.match(/^\s*([A-Za-z]+)/)?.[1] ?? '');
    const rules: ArticleRuleId[] = [];
    const nextIpa = vocab.get(lower(nextWord))?.ipa;
    if (article !== 'the') {
      const vowel = startsWithVowelSound(nextWord, nextIpa);
      // claim mâu thuẫn (văn bản dùng sai a/an) → bỏ, không dạy sai
      if ((article === 'an') !== vowel) continue;
      // mỗi cụm thuộc đúng 1 dạng "a / an + …" (dạng đặc biệt xét trước)
      const w0 = lower(nextWord);
      if (RATE_NOUN.has(lemma) && RATE_BEFORE.test(before)) rules.push('A_RATE');
      // "There is a vacancy" không phải nói nghề nghiệp / phân loại
      else if (BE.has(lower(before)) && before2 !== 'there') rules.push('A_CLASSIFY');
      else if (vowel && /^h/.test(w0)) rules.push('AN_SILENT_H');
      else if (!vowel && /^[aeiou]/.test(w0)) rules.push('A_YU');
      else if (take.length > 1) rules.push(vowel ? 'AN_ADJ' : 'A_ADJ');
      else rules.push(vowel ? 'AN_VOWEL' : 'A_CONSONANT');
      mentioned.set(lemma, { block: unit.block, order: unit.order });
    } else {
      const mods = take.slice(0, -1).map(lower);
      const window = `the ${take.join(' ')}${after ? ` ${after}` : ''}`;
      if (mods.some(isSuperlative)) rules.push('THE_SUPERLATIVE');
      else if (mods.some((x) => ORDINAL.has(x))) rules.push('THE_ORDINAL');
      else if (UNIQUE.has(lemma)) rules.push('THE_UNIQUE');
      else if (FIXED.some((f) => f.test(`${before} ${window}`))) rules.push('THE_FIXED');
      else if (mentioned.get(lemma)?.block === unit.block && mentioned.get(lemma)!.order <= unit.order) rules.push('THE_ANAPHORA');
      else if (/^(of|that|which|who|whom|whose|where)$/.test(after)) rules.push('THE_POSTMOD');
      else rules.push('THE_CONTEXT');
    }
    out.push({ article, phrase, nextWord, ...(nextIpa ? { nextIpa } : {}), nounId: `n:${lemma}`, rules, textUnitId: unit.id });
  }
  return out;
}

// ---------- Leiden ----------
type WGraph = { n: number; adj: Map<number, number>[]; self: number[] };
const strength = (g: WGraph, v: number) => {
  let k = 2 * g.self[v];
  g.adj[v].forEach((w) => (k += w));
  return k;
};
const totalWeight = (g: WGraph) => {
  let m = 0;
  for (let v = 0; v < g.n; v++) {
    m += g.self[v];
    g.adj[v].forEach((w, u) => u > v && (m += w));
  }
  return m;
};
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(n: number, rnd: () => number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pha 1 của Leiden: di chuyển nút nhanh (hàng đợi), tối đa hoá modularity */
function moveNodesFast(g: WGraph, part: number[], gamma: number, m: number, rnd: () => number) {
  const k = Array.from({ length: g.n }, (_, v) => strength(g, v));
  const tot = new Map<number, number>();
  part.forEach((c, v) => tot.set(c, (tot.get(c) ?? 0) + k[v]));
  const queue = shuffled(g.n, rnd);
  const inQ = new Array(g.n).fill(true);
  let nextId = Math.max(...part) + 1;
  while (queue.length) {
    const v = queue.shift()!;
    inQ[v] = false;
    const cur = part[v];
    const links = new Map<number, number>();
    g.adj[v].forEach((w, u) => links.set(part[u], (links.get(part[u]) ?? 0) + w));
    tot.set(cur, tot.get(cur)! - k[v]);
    const gain = (c: number) => (links.get(c) ?? 0) - (gamma * k[v] * (tot.get(c) ?? 0)) / (2 * m);
    let best = cur;
    let bestGain = gain(cur);
    links.forEach((_, c) => {
      const d = gain(c);
      if (d > bestGain + 1e-12) {
        best = c;
        bestGain = d;
      }
    });
    if (bestGain < -1e-12) {
      best = nextId++; // cộng đồng rỗng (gain = 0)
      bestGain = 0;
    }
    tot.set(best, (tot.get(best) ?? 0) + k[v]);
    if (best !== cur) {
      part[v] = best;
      g.adj[v].forEach((_, u) => {
        if (part[u] !== best && !inQ[u]) {
          queue.push(u);
          inQ[u] = true;
        }
      });
    }
  }
  return part;
}

/** Pha 2 của Leiden: tinh chỉnh — chỉ gộp nút trong cùng cộng đồng, bảo đảm cộng đồng liên thông tốt */
function refinePartition(g: WGraph, part: number[], gamma: number, m: number, rnd: () => number, theta = 0.01) {
  const k = Array.from({ length: g.n }, (_, v) => strength(g, v));
  const refined = Array.from({ length: g.n }, (_, v) => v);
  const members = new Map<number, number[]>();
  part.forEach((c, v) => members.set(c, [...(members.get(c) ?? []), v]));
  const g2m = gamma / (2 * m);
  members.forEach((S) => {
    const inS = new Set(S);
    const KS = S.reduce((s, v) => s + k[v], 0);
    const rTot = new Map<number, number>(); // tổng strength của cộng đồng tinh chỉnh
    const rOut = new Map<number, number>(); // trọng số từ cộng đồng tinh chỉnh ra phần còn lại của S
    const singleton = new Set(S);
    S.forEach((v) => {
      rTot.set(v, k[v]);
      let o = 0;
      g.adj[v].forEach((w, u) => inS.has(u) && (o += w));
      rOut.set(v, o);
    });
    for (const v of shuffled(S.length, rnd).map((i) => S[i])) {
      if (!singleton.has(v)) continue;
      // v phải liên thông tốt với S
      if (rOut.get(v)! < g2m * k[v] * (KS - k[v])) continue;
      const links = new Map<number, number>();
      g.adj[v].forEach((w, u) => inS.has(u) && links.set(refined[u], (links.get(refined[u]) ?? 0) + w));
      const own = refined[v];
      const cands: { c: number; d: number }[] = [];
      links.forEach((wvc, c) => {
        if (c === own) return;
        const T = rTot.get(c)!;
        if (rOut.get(c)! < g2m * T * (KS - T)) return; // T phải liên thông tốt
        const d = wvc - g2m * k[v] * T;
        if (d >= 0) cands.push({ c, d });
      });
      if (!cands.length) continue;
      // chọn ngẫu nhiên theo xác suất ∝ exp(ΔH / θ) — đặc trưng của Leiden
      const maxD = Math.max(...cands.map((x) => x.d));
      const ws = cands.map((x) => Math.exp((x.d - maxD) / theta));
      let r = rnd() * ws.reduce((a, b) => a + b, 0);
      let pick = cands[cands.length - 1].c;
      for (let i = 0; i < cands.length; i++) if ((r -= ws[i]) <= 0) { pick = cands[i].c; break; }
      // gộp v vào pick, cập nhật rTot / rOut
      let wvPick = 0;
      g.adj[v].forEach((w, u) => refined[u] === pick && (wvPick += w));
      rTot.set(pick, rTot.get(pick)! + k[v]);
      rOut.set(pick, rOut.get(pick)! + rOut.get(v)! - 2 * wvPick);
      rTot.delete(own);
      rOut.delete(own);
      refined[v] = pick;
      singleton.delete(v);
      singleton.delete(pick);
      S.forEach((u) => refined[u] === pick && singleton.delete(u));
    }
  });
  return refined;
}

function aggregate(g: WGraph, refined: number[]) {
  const ids = [...new Set(refined)];
  const idx = new Map(ids.map((c, i) => [c, i]));
  const ng: WGraph = { n: ids.length, adj: ids.map(() => new Map()), self: ids.map(() => 0) };
  for (let v = 0; v < g.n; v++) {
    const a = idx.get(refined[v])!;
    ng.self[a] += g.self[v];
    g.adj[v].forEach((w, u) => {
      if (u < v) return;
      const b = idx.get(refined[u])!;
      if (a === b) ng.self[a] += w;
      else {
        ng.adj[a].set(b, (ng.adj[a].get(b) ?? 0) + w);
        ng.adj[b].set(a, (ng.adj[b].get(a) ?? 0) + w);
      }
    });
  }
  return { ng, map: refined.map((c) => idx.get(c)!) };
}

/** Leiden (Traag, Waltman & van Eck, 2019) — trả về nhãn cộng đồng cho từng nút, đánh số 0..k-1 */
export function leiden(n: number, edges: [number, number, number][], opts: { gamma?: number; seed?: number; maxIter?: number } = {}): number[] {
  const gamma = opts.gamma ?? 1;
  const rnd = mulberry32(opts.seed ?? 42);
  const g: WGraph = { n, adj: Array.from({ length: n }, () => new Map()), self: new Array(n).fill(0) };
  edges.forEach(([a, b, w]) => {
    if (a === b) g.self[a] += w;
    else {
      g.adj[a].set(b, (g.adj[a].get(b) ?? 0) + w);
      g.adj[b].set(a, (g.adj[b].get(a) ?? 0) + w);
    }
  });
  const m = totalWeight(g);
  if (!m) return Array.from({ length: n }, (_, i) => i);
  // membership[v] = nút của đồ thị hiện tại chứa nút gốc v
  let membership = Array.from({ length: n }, (_, i) => i);
  let cur = g;
  let part = Array.from({ length: n }, (_, i) => i);
  for (let it = 0; it < (opts.maxIter ?? 20); it++) {
    part = moveNodesFast(cur, part, gamma, m, rnd);
    if (new Set(part).size === cur.n) break; // mỗi cộng đồng 1 nút → hội tụ
    const refined = refinePartition(cur, part, gamma, m, rnd);
    const { ng, map } = aggregate(cur, refined);
    // phân hoạch khởi tạo cho đồ thị gộp lấy theo phân hoạch CHƯA tinh chỉnh
    const nextPart = new Array(ng.n).fill(0);
    refined.forEach((_, v) => (nextPart[map[v]] = part[v]));
    membership = membership.map((x) => map[x]);
    cur = ng;
    part = nextPart;
  }
  const raw = membership.map((x) => part[x]);
  const renum = new Map<number, number>();
  return raw.map((c) => (renum.has(c) ? renum.get(c)! : (renum.set(c, renum.size), renum.size - 1)));
}

/** Modularity Q (để kiểm thử chất lượng phân hoạch) */
export function modularity(n: number, edges: [number, number, number][], part: number[], gamma = 1): number {
  const k = new Array(n).fill(0);
  let m = 0;
  let inW = 0;
  edges.forEach(([a, b, w]) => {
    k[a] += w;
    k[b] += w;
    m += w;
    if (part[a] === part[b]) inW += w;
  });
  if (!m) return 0;
  const tot = new Map<number, number>();
  part.forEach((c, v) => tot.set(c, (tot.get(c) ?? 0) + k[v]));
  let s = 0;
  tot.forEach((t) => (s += t * t));
  return inW / m - (gamma * s) / (4 * m * m);
}

const MAX_CLUSTER_SIZE = 10;
const MAX_LEVELS = 3;

/** Leiden phân cấp (như hierarchical_leiden của GraphRAG): cộng đồng > MAX_CLUSTER_SIZE được chia tiếp */
function hierarchicalLeiden(n: number, edges: [number, number, number][], seed = 42) {
  const levels: number[][] = []; // levels[l][v] = id cộng đồng (toàn cục) của v ở cấp l
  const parents = new Map<number, number | undefined>();
  let nextId = 0;
  const top = leiden(n, edges, { seed });
  const base = new Map<number, number>();
  levels.push(top.map((c) => (base.has(c) ? base.get(c)! : (base.set(c, nextId), parents.set(nextId, undefined), nextId++))));
  for (let l = 1; l < MAX_LEVELS; l++) {
    const prev = levels[l - 1];
    const next = [...prev];
    let split = false;
    new Set(prev).forEach((c) => {
      const nodes = prev.map((x, v) => (x === c ? v : -1)).filter((v) => v >= 0);
      if (nodes.length <= MAX_CLUSTER_SIZE) return;
      const local = new Map(nodes.map((v, i) => [v, i]));
      const sub = edges.filter(([a, b]) => local.has(a) && local.has(b)).map(([a, b, w]) => [local.get(a)!, local.get(b)!, w] as [number, number, number]);
      const lp = leiden(nodes.length, sub, { seed: seed + l });
      if (new Set(lp).size < 2) return;
      split = true;
      const ids = new Map<number, number>();
      nodes.forEach((v, i) => {
        if (!ids.has(lp[i])) {
          ids.set(lp[i], nextId);
          parents.set(nextId, c);
          nextId++;
        }
        next[v] = ids.get(lp[i])!;
      });
    });
    if (!split) break;
    levels.push(next);
  }
  return { levels, parents };
}

/** Index đầy đủ cho một bài học */
export function buildArticleGraph(corpus: ArticleCorpus): ArticleGraphIndex | null {
  // kiến thức lấy từ video: có lời thoại video thì chỉ dựa vào video; chưa có thì dựa vào bài giảng của video
  const allUnits = buildTextUnits(corpus);
  const textUnits = allUnits.some((u) => u.source === 'video') ? allUnits.filter((u) => u.source === 'video') : allUnits.filter((u) => u.source === 'bai-giang');
  const vocab = new Map<string, VocabInfo>();
  (corpus.vocab ?? []).forEach((v) => vocab.set(lower(v.word), { ipa: v.ipa, meaningVi: v.meaningVi.split(/[;(]/)[0].trim(), pos: v.pos }));
  const lessonAdj = new Set((corpus.vocab ?? []).filter((v) => v.pos && /adj/.test(v.pos)).map((v) => lower(v.word)));

  // ---- Bước 2: trích claim theo thứ tự text unit (để nhận "đã nhắc ở trước") ----
  const mentioned = new Map<string, { block: number; order: number }>();
  const claims: ArticleClaim[] = [];
  const pushClaim = (c: Omit<ArticleClaim, 'id'>) => claims.push({ id: `c${claims.length + 1}`, ...c });
  [...textUnits].sort((a, b) => a.order - b.order).forEach((u) => extract(u, vocab, lessonAdj, mentioned).forEach(pushClaim));
  if (!claims.length) return null;

  // ---- Bước 3: thực thể + gộp trùng + tóm tắt mô tả ----
  const ent = new Map<string, ArticleEntity>();
  const getEnt = (id: string, type: ArticleEntityType, title: string, description: string, extra: Partial<ArticleEntity> = {}) => {
    if (!ent.has(id)) ent.set(id, { id, type, title, description, textUnitIds: [], degree: 0, communities: [], ...extra });
    return ent.get(id)!;
  };
  const addUnit = (e: ArticleEntity, tu: string) => !e.textUnitIds.includes(tu) && e.textUnitIds.push(tu);
  const rel = new Map<string, ArticleRelationship>();
  const link = (a: string, b: string, kind: ArticleRelationship['kind'], w: number, tu: string, description: string) => {
    const [s, t] = a < b ? [a, b] : [b, a];
    const id = `${kind}:${s}|${t}`;
    const r = rel.get(id) ?? { id, source: a, target: b, kind, weight: 0, description, textUnitIds: [], rank: 0 };
    r.weight += w;
    if (!r.textUnitIds.includes(tu)) r.textUnitIds.push(tu);
    rel.set(id, r);
  };
  for (const c of claims) {
    const w = c.inferred ? 0.5 : 1;
    const lemma = c.nounId.slice(2);
    const art = getEnt(`a:${c.article}`, 'ARTICLE', c.article, `Mạo từ ${c.article === 'the' ? 'xác định' : 'không xác định'} “${c.article}”.`);
    const noun = getEnt(c.nounId, 'NOUN', lemma, '', { ...(vocab.get(lemma)?.meaningVi ? { meaningVi: vocab.get(lemma)!.meaningVi } : {}), ...(vocab.get(lemma)?.ipa ? { ipa: vocab.get(lemma)!.ipa } : {}) });
    addUnit(art, c.textUnitId);
    addUnit(noun, c.textUnitId);
    link(art.id, noun.id, 'USED_WITH', w, c.textUnitId, `${c.phrase}`);
    c.rules.forEach((r) => {
      const def = ARTICLE_RULES[r];
      const rule = getEnt(`r:${r}`, 'RULE', def.title, def.description);
      addUnit(rule, c.textUnitId);
      link(noun.id, rule.id, 'EXPLAINED_BY', w, c.textUnitId, `${c.phrase}: ${def.title.toLowerCase()}`);
      link(art.id, rule.id, 'APPLIES', w, c.textUnitId, `${c.article}: ${def.title.toLowerCase()}`);
    });
  }
  // tóm tắt mô tả danh từ từ mọi claim (bản gốc: LLM tóm tắt các mô tả trùng)
  ent.forEach((e) => {
    if (e.type !== 'NOUN') return;
    const mine = claims.filter((c) => c.nounId === e.id);
    const byArt = (['a', 'an', 'the'] as ArticleWord[])
      .map((a) => ({ a, n: mine.filter((c) => c.article === a && !c.inferred).length, inf: mine.some((c) => c.article === a && c.inferred) }))
      .filter((x) => x.n || x.inf)
      .map((x) => (x.n ? `${x.a} (${x.n} lần)` : `${x.a} (suy ra từ phiên âm)`));
    e.description = `${e.title}${e.ipa ? ` ${e.ipa}` : ''}${e.meaningVi ? ` — ${e.meaningVi}` : ''}. Trong bài đi với: ${byArt.join(', ')}.`;
  });

  // ---- Bước 4: đồ thị, degree, rank ----
  const entities = [...ent.values()];
  const index = new Map(entities.map((e, i) => [e.id, i]));
  const relationships = [...rel.values()];
  const nb = entities.map(() => new Set<number>());
  relationships.forEach((r) => {
    const a = index.get(r.source)!;
    const b = index.get(r.target)!;
    nb[a].add(b);
    nb[b].add(a);
  });
  entities.forEach((e, i) => (e.degree = nb[i].size));
  relationships.forEach((r) => (r.rank = ent.get(r.source)!.degree + ent.get(r.target)!.degree));

  // ---- Bước 5: Leiden phân cấp ----
  const edges = relationships.map((r) => [index.get(r.source)!, index.get(r.target)!, r.weight] as [number, number, number]);
  const { levels, parents } = hierarchicalLeiden(entities.length, edges);
  entities.forEach((e, i) => (e.communities = levels.map((l) => l[i])));

  // ---- Bước 6: báo cáo cộng đồng ----
  const unitById = new Map(textUnits.map((u) => [u.id, u]));
  const communities: ArticleCommunityReport[] = [];
  const innerWeight: number[] = [];
  levels.forEach((lv, level) => {
    new Set(lv).forEach((cid) => {
      if (communities.some((c) => c.id === cid)) return;
      const members = entities.filter((_, i) => lv[i] === cid);
      const ids = new Set(members.map((e) => e.id));
      const inner = relationships.filter((r) => ids.has(r.source) && ids.has(r.target));
      const memberClaims = claims.filter((c) => ids.has(c.nounId) && (ids.has(`a:${c.article}`) || c.rules.some((r) => ids.has(`r:${r}`))));
      const rulesHere = members.filter((e) => e.type === 'RULE').sort((a, b) => b.degree - a.degree);
      const artsHere = members.filter((e) => e.type === 'ARTICLE');
      const nounsHere = members.filter((e) => e.type === 'NOUN').sort((a, b) => b.degree - a.degree);
      const phrases = [...new Set(memberClaims.map((c) => c.phrase))];
      const title = [artsHere.map((a) => a.title).join(' / '), rulesHere[0]?.title ?? nounsHere[0]?.title].filter(Boolean).join(' · ') || members[0].title;
      const findings: ArticleFinding[] = rulesHere.map((r) => {
        const rid = r.id.slice(2) as ArticleRuleId;
        // thực thể quy tắc thuộc đúng 1 cộng đồng ở mỗi cấp → lấy mọi claim của quy tắc
        const ex = claims.filter((c) => c.rules.includes(rid));
        const proof = ex.find((c) => !c.inferred);
        const ph = [...new Set(ex.map((c) => c.phrase))];
        return {
          ruleId: rid,
          summary: r.title,
          explanation: `${r.description}${ph.length ? ` Trong bài: ${ph.slice(0, 4).join(', ')}.` : ''}${proof ? ` Dẫn chứng: “${unitById.get(proof.textUnitId)!.text}”` : ''}`,
          count: ex.length,
          phrases: ph.slice(0, 8),
          ...(proof ? { proofUnitId: proof.textUnitId } : {}),
        };
      });
      communities.push({
        id: cid,
        level,
        ...(parents.get(cid) !== undefined ? { parent: parents.get(cid) } : {}),
        title,
        summary: `${phrases.length} cụm có mạo từ${phrases.length ? `: ${phrases.slice(0, 5).join(', ')}${phrases.length > 5 ? '…' : ''}` : ''}.`,
        rating: 0,
        findings,
        entityIds: members.map((e) => e.id),
        textUnitIds: [...new Set(inner.flatMap((r) => r.textUnitIds))],
      });
      // mức quan trọng ∝ tổng trọng số cạnh trong cộng đồng (chuẩn hoá ở dưới)
      innerWeight.push(inner.reduce((s, r) => s + r.weight, 0));
    });
  });
  const maxW = Math.max(1, ...innerWeight);
  communities.forEach((c, i) => (c.rating = Math.max(1, Math.round((10 * innerWeight[i]) / maxW))));

  return { version: 1, textUnits, entities, relationships, claims, communities };
}

// ==========================================
// 5. QUERY
// ==========================================
export interface ArticleGlobalPoint {
  ruleId: ArticleRuleId;
  title: string;
  phrases: string[];
  count: number;
  score: number;
  communityId: number;
}
/** Global search: MAP từng community report → các ý kèm điểm; REDUCE gộp, xếp hạng, lấy top-K */
export function globalSearch(g: ArticleGraphIndex, topK = 4, level = 0): { lead: string; points: ArticleGlobalPoint[] } {
  const reports = g.communities.filter((c) => c.level === level);
  // MAP
  // điểm của một ý = mức quan trọng của cộng đồng × log(1 + số lần gặp)
  const mapped: ArticleGlobalPoint[] = reports.flatMap((r) =>
    r.findings.map((f) => ({ ruleId: f.ruleId, title: f.summary, phrases: f.phrases.slice(0, 4), count: f.count, score: r.rating * Math.log2(1 + f.count), communityId: r.id })),
  );
  // REDUCE: gộp ý trùng quy tắc, xếp theo điểm, lấy top-K
  const seen = new Set<string>();
  const points = mapped
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter((p) => (seen.has(p.ruleId) ? false : (seen.add(p.ruleId), true)))
    .slice(0, topK);
  const count = (a: ArticleWord) => g.claims.filter((c) => c.article === a && !c.inferred).length;
  const real = (['a', 'an', 'the'] as ArticleWord[]).filter((a) => count(a)).map((a) => `${a} ${count(a)} lần`);
  const fromVideo = g.textUnits.some((u) => u.source === 'video');
  const lead = `${fromVideo ? 'Trong video' : 'Trong bài giảng của video'}, mạo từ được dùng: ${real.join(', ')}.`;
  return { lead, points };
}

/** Câu giải thích riêng cho một cụm theo quy tắc (bản gốc: LLM viết từ ngữ cảnh) */
function explainFor(rule: ArticleRuleId, c: ArticleClaim, g: ArticleGraphIndex): string {
  const noun = c.phrase.split(' ').slice(1).join(' ');
  const words = c.phrase.split(' ').slice(1).map(lower);
  switch (rule) {
    case 'A_ADJ':
    case 'AN_ADJ':
      return `Có tính từ “${c.nextWord}” đứng trước danh từ “${c.nounId.slice(2)}” — chọn a hay an theo chữ đầu của “${c.nextWord}”, không theo danh từ.`;
    case 'A_YU':
      return `“${c.nextWord}” viết bằng nguyên âm nhưng đọc như phụ âm${c.nextIpa ? ` ${c.nextIpa}` : ''} nên dùng a.`;
    case 'AN_SILENT_H':
      return `Chữ h trong “${c.nextWord}” không đọc${c.nextIpa ? ` ${c.nextIpa}` : ''}, từ bắt đầu bằng nguyên âm nên dùng an.`;
    case 'A_CONSONANT':
    case 'AN_VOWEL':
      return `“${c.nextWord}”${c.nextIpa ? ` ${c.nextIpa}` : ''} bắt đầu bằng ${rule === 'AN_VOWEL' ? 'nguyên âm' : 'phụ âm'} nên dùng ${c.article}.`;
    case 'A_CLASSIFY':
      return `Đứng sau be / become / as để nói nghề nghiệp, thuộc loại nào (${c.phrase}).`;
    case 'A_RATE':
      return `“${c.phrase}” nghĩa là “mỗi ${c.nounId.slice(2)}”.`;
    case 'THE_ANAPHORA': {
      const first = g.claims.find((x) => x.nounId === c.nounId && x.article !== 'the' && !x.inferred);
      return `“${c.nounId.slice(2)}” đã được nhắc ở câu trước${first ? ` (“${first.phrase}”)` : ''}, nên lần này dùng the.`;
    }
    case 'THE_SUPERLATIVE':
      return `Có so sánh nhất “${words.slice(0, -1).filter(isSuperlative).join(' ') || words[0]}” nên dùng the.`;
    case 'THE_ORDINAL':
      return `Có “${words.find((w) => ORDINAL.has(w)) ?? words[0]}” chỉ đúng một người / vật nên dùng the.`;
    case 'THE_UNIQUE':
      return `“${noun}” là vật duy nhất, ai cũng biết.`;
    case 'THE_FIXED':
      return `“${c.phrase}” nằm trong cụm cố định quen dùng với the.`;
    case 'THE_POSTMOD':
      return `Phần đứng ngay sau “${c.phrase}” cho biết đúng là ${noun} nào.`;
    case 'THE_CONTEXT':
      return `Người nghe biết đang nói tới ${noun} nào nhờ tình huống trong câu.`;
  }
}

export interface ArticleLocalResult {
  /** Thực thể trung tâm của truy vấn */
  focus: ArticleEntity[];
  /** Câu trả lời (từng ý) */
  answer: string[];
  /** Dẫn chứng: câu trong bài + cụm cần tô */
  evidence: { unit: ArticleTextUnit; highlight: string[] }[];
  /** Thực thể liên quan (hàng xóm xếp hạng) */
  related: ArticleEntity[];
  report?: ArticleCommunityReport;
}
export interface ArticleLocalQuery {
  /** Id thực thể (a:the, n:report, r:THE_ANAPHORA) */
  entityId?: string;
  /** Cụm cụ thể ("the report") */
  phrase?: string;
  /** Giới hạn ngữ cảnh (thay cho token budget) */
  maxEvidence?: number;
  maxRelated?: number;
}

/** Local search: thực thể → hàng xóm, quan hệ, text unit, báo cáo cộng đồng → xếp hạng → trả lời */
export function localSearch(g: ArticleGraphIndex, q: ArticleLocalQuery): ArticleLocalResult {
  const byId = new Map(g.entities.map((e) => [e.id, e]));
  const units = new Map(g.textUnits.map((u) => [u.id, u]));
  const maxEvidence = q.maxEvidence ?? 3;
  const maxRelated = q.maxRelated ?? 6;

  // 1) ánh xạ truy vấn → thực thể
  let focusClaims: ArticleClaim[] = [];
  let focus: ArticleEntity[] = [];
  if (q.phrase) {
    focusClaims = g.claims.filter((c) => c.phrase.toLowerCase() === q.phrase!.toLowerCase());
    const c = focusClaims[0];
    if (c) focus = [byId.get(`a:${c.article}`)!, byId.get(c.nounId)!, ...c.rules.map((r) => byId.get(`r:${r}`)!)].filter(Boolean);
  } else if (q.entityId && byId.has(q.entityId)) {
    const e = byId.get(q.entityId)!;
    focus = [e];
    focusClaims = g.claims.filter((c) => (e.type === 'ARTICLE' ? `a:${c.article}` === e.id : e.type === 'NOUN' ? c.nounId === e.id : c.rules.includes(e.id.slice(2) as ArticleRuleId)));
  }
  if (!focus.length) return { focus: [], answer: [], evidence: [], related: [] };
  const focusIds = new Set(focus.map((e) => e.id));

  // 2) quan hệ: trong nhóm trước, rồi ra ngoài; xếp theo rank (combined degree) rồi weight
  const rels = g.relationships
    .filter((r) => focusIds.has(r.source) || focusIds.has(r.target))
    .sort((a, b) => {
      const inA = focusIds.has(a.source) && focusIds.has(a.target) ? 1 : 0;
      const inB = focusIds.has(b.source) && focusIds.has(b.target) ? 1 : 0;
      return inB - inA || b.rank - a.rank || b.weight - a.weight;
    });
  // 3) hàng xóm xếp theo tổng trọng số liên kết với nhóm trung tâm, rồi degree
  const score = new Map<string, number>();
  rels.forEach((r) => [r.source, r.target].forEach((x) => !focusIds.has(x) && score.set(x, (score.get(x) ?? 0) + r.weight)));
  const related = [...score.entries()]
    .map(([id, s]) => ({ e: byId.get(id)!, s }))
    .sort((a, b) => b.s - a.s || b.e.degree - a.e.degree)
    .slice(0, maxRelated)
    .map((x) => x.e);

  // 4) text unit: ưu tiên câu dùng thật, chứa claim của truy vấn, hỗ trợ nhiều quan hệ nhất
  const relCount = new Map<string, number>();
  rels.forEach((r) => r.textUnitIds.forEach((t) => relCount.set(t, (relCount.get(t) ?? 0) + 1)));
  const claimUnits = new Map<string, string[]>();
  focusClaims.forEach((c) => claimUnits.set(c.textUnitId, [...(claimUnits.get(c.textUnitId) ?? []), c.phrase]));
  const SRC_RANK: Record<ArticleTextSource, number> = { video: 3, 'bai-giang': 2, 'vi-du': 2, 'tu-vung': 0 };
  const evidence = [...claimUnits.keys()]
    .map((id) => units.get(id)!)
    .filter(Boolean)
    .sort((a, b) => SRC_RANK[b.source] - SRC_RANK[a.source] || (relCount.get(b.id) ?? 0) - (relCount.get(a.id) ?? 0) || a.order - b.order)
    .slice(0, maxEvidence)
    .map((unit) => ({ unit, highlight: [...new Set(claimUnits.get(unit.id) ?? [])] }));

  // 5) báo cáo cộng đồng chứa nhiều thực thể trung tâm nhất (cấp sâu nhất có thể)
  const report = g.communities
    .map((c) => ({ c, hit: c.entityIds.filter((id) => focusIds.has(id)).length }))
    .filter((x) => x.hit)
    .sort((a, b) => b.hit - a.hit || b.c.level - a.c.level || b.c.rating - a.c.rating)[0]?.c;

  // 6) viết câu trả lời từ ngữ cảnh đã truy hồi (bản gốc: LLM)
  const answer: string[] = [];
  const main = focus[0];
  if (q.phrase && focusClaims[0]) {
    const c = focusClaims[0];
    const rules = [...new Set(focusClaims.flatMap((x) => x.rules))];
    // dạng nghề nghiệp / "mỗi" không nói về âm đầu → thêm câu vì sao a hay an
    if (c.article !== 'the' && rules.every((r) => r === 'A_CLASSIFY' || r === 'A_RATE')) answer.push(explainFor(startsWithVowelSound(c.nextWord, c.nextIpa) ? 'AN_VOWEL' : 'A_CONSONANT', c, g));
    rules.forEach((r) => answer.push(explainFor(r, focusClaims.find((x) => x.rules.includes(r)) ?? c, g)));
  } else if (main.type === 'ARTICLE') {
    const ruleRels = rels.filter((r) => r.kind === 'APPLIES').sort((a, b) => b.weight - a.weight);
    answer.push(`“${main.title}” trong video đi với ${new Set(focusClaims.map((c) => c.nounId)).size} danh từ.`);
    ruleRels.forEach((r) => {
      const rule = byId.get(r.source === main.id ? r.target : r.source)!;
      answer.push(`${rule.title} — ${Math.round(r.weight)} cụm.`);
    });
  } else if (main.type === 'NOUN') {
    answer.push(main.description);
    const arts = [...new Set(focusClaims.map((c) => c.article))];
    if (arts.includes('the') && arts.some((a) => a !== 'the')) answer.push(`Lần đầu nhắc dùng ${arts.filter((a) => a !== 'the').join(' / ')}, khi người nghe đã biết là cái nào thì chuyển sang the.`);
  } else {
    answer.push(main.description);
    answer.push(`Gặp trong video: ${[...new Set(focusClaims.map((c) => c.phrase))].slice(0, 6).join(', ')}.`);
  }
  return { focus, answer, evidence, related, report };
}
