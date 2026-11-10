import type { GrammarPoint, KnowledgeNode, LessonKnowledge, VocabItem } from './lesson-knowledge';

/**
 * Bài tập sau mỗi bài học (lessons.exercises, JSONB) — sinh từ chính kiến thức của bài:
 * nghĩa từ, điền từ vào câu ví dụ của bài, công thức ngữ pháp, a / an, âm trong bài phát âm.
 * Chỉ ra câu khi đáp án duy nhất đúng (phương án nhiễu được lọc trùng nghĩa / trùng âm).
 */
export interface ExercisePassage {
  /** mã đoạn (câu khác nhau cùng mã thì dùng chung đoạn) — mặc định suy từ tiêu đề + nội dung */
  id?: string;
  title?: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  /** Câu nghe không có tệp audio: lời máy đọc (text-to-speech của trình duyệt) */
  speak?: string;
}
export type ExerciseType = 'vocab-meaning' | 'vocab-context' | 'grammar-formula' | 'grammar-name' | 'grammar-gap' | 'article' | 'phoneme'
  // dạng câu đề thi tốt nghiệp THPT
  | 'notice-cloze' | 'arrange' | 'text-cloze' | 'reading'
  // câu thật trong ngân hàng đề TOEIC
  | 'toeic-p1' | 'toeic-p2' | 'toeic-p5' | 'toeic-p6'
  // đề kiểm tra soạn riêng: nghe (máy đọc), nói, viết
  | 'listening' | 'speaking' | 'writing';
export interface LessonExercise {
  id: string;
  type: ExerciseType;
  /** Yêu cầu (tiếng Việt) */
  prompt: string;
  /** Câu / cụm cần xét (có ô trống "_____" nếu là câu điền) */
  text?: string;
  options: string[];
  /** Vị trí đáp án đúng trong options */
  answer: number;
  /** Giải thích hiện sau khi trả lời */
  explain: string;
  /** Đoạn văn dùng chung (bài đọc, quảng cáo, các câu cần sắp xếp; câu nghe: ảnh + audio) — câu cùng đoạn hiện đoạn văn một lần */
  passage?: ExercisePassage;
}

/** Kho phương án nhiễu lấy từ các bài khác (để bài ít từ vẫn đủ 4 lựa chọn) */
export interface ExercisePool {
  vocab: VocabItem[];
  grammar: GrammarPoint[];
  phonemes: { symbol: string; words: { word: string; ipa: string }[] }[];
}

const MAX = 8;
const BLANK = '_____';

/** Bộ sinh số giả ngẫu nhiên theo hạt giống (cùng bài → cùng đề) */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const shuffle = <T>(xs: T[], r: () => number) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const norm = (s: string) => s.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Ghép đáp án + phương án nhiễu (bỏ trùng), xáo thứ tự; thiếu phương án → null */
function choice(correct: string, wrong: string[], r: () => number, need = 3, ordered = false) {
  const seen = new Set([norm(correct)]);
  const picked: string[] = [];
  for (const w of ordered ? wrong : shuffle(wrong, r)) {
    const k = norm(w);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    picked.push(w);
    if (picked.length === need) break;
  }
  if (picked.length < need) return null;
  const options = shuffle([correct, ...picked], r);
  return { options, answer: options.indexOf(correct) };
}

/** Câu ví dụ chứa đúng từ cần điền (khớp nguyên từ, không phân biệt hoa thường) */
function blankOut(sentence: string, word: string) {
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^\\p{L}])(${esc})(?=$|[^\\p{L}])`, 'iu');
  const m = sentence.match(re);
  if (!m || m.index === undefined) return null;
  const at = m.index + m[1].length;
  return { text: sentence.slice(0, at) + BLANK + sentence.slice(at + m[2].length), form: sentence.slice(at, at + m[2].length) };
}

const posOf = (v: VocabItem) => (v.pos ?? '').toLowerCase().replace(/[^a-z]/g, '');
/** Từ vựng thật (không phải hậu tố, mẫu câu, ghi chú) — dùng làm câu hỏi và phương án nhiễu */
const isWord = (v: VocabItem) => /^[A-Za-z][A-Za-z' -]{0,30}$/.test(v.word) && !!v.meaningVi && v.meaningVi.length <= 40 && !/[…→?]|\.\.\.|hậu tố|tiền tố|cụm từ/i.test(v.meaningVi);
/** Mục ngữ pháp có tên cấu trúc rõ ràng + công thức thật (có dấu +) */
const GENERIC = /^(công thức|vị trí|dấu hiệu|cách dùng|lưu ý|phân biệt|ví dụ|chức năng|cấu trúc chung|dạng|hình thức)/i;
const isFormula = (g: GrammarPoint) => !!g.formula && g.formula.includes('+') && !g.formula.trim().startsWith('+') && !g.title.includes('+') && !GENERIC.test(g.title.trim()) && g.title.length <= 60 && g.formula.length <= 80;
/** Từ khoá ngữ pháp của công thức (bỏ ký hiệu chung S, V, N, O…) — 2 công thức chung từ khoá dễ cùng đúng */
const COMMON = new Set(['s', 'v', 'n', 'o', 'adj', 'adv', 'n', 'np', 'sb', 'sth', 'ed', 'es']);
const sig = (f: string) => new Set(f.toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w && !COMMON.has(w)));
const disjoint = (a: string, b: string) => {
  const x = sig(a);
  return ![...sig(b)].some((w) => x.has(w));
};
/** Ưu tiên phương án cùng loại; thiếu thì bổ sung từ phần còn lại */
const prefer = <T>(xs: T[], same: (x: T) => boolean) => [...xs.filter(same), ...xs.filter((x) => !same(x))];

function vocabQuestions(k: LessonKnowledge, pool: ExercisePool, r: () => number, id: (t: string) => string) {
  const out: LessonExercise[] = [];
  const others = [...k.vocab, ...pool.vocab].filter(isWord);
  // bài chỉ dạy từ vựng → hỏi đủ các từ; bài có cả ngữ pháp → 4 từ
  k.vocab.filter(isWord).slice(0, k.grammar.length ? 4 : 6).forEach((v, i) => {
    const ctx = v.example ? blankOut(v.example, v.word) : null;
    // xen kẽ: điền từ vào câu của bài / chọn nghĩa
    if (ctx && i % 2 === 0) {
      const samePos = others.filter((o) => norm(o.word) !== norm(v.word) && posOf(o) === posOf(v) && !o.word.includes(' ') === !v.word.includes(' '));
      const c = choice(ctx.form, shuffle(samePos, r).map((o) => o.word), r);
      if (c) {
        out.push({ id: id('vc'), type: 'vocab-context', prompt: `Chọn từ có nghĩa “${v.meaningVi}” điền vào chỗ trống`, text: ctx.text, ...c, explain: `“${v.word}”${v.ipa ? ` ${v.ipa}` : ''}: ${v.meaningVi}. Câu đầy đủ: ${v.example}` });
        return;
      }
    }
    const rest = shuffle(others.filter((o) => norm(o.word) !== norm(v.word) && norm(o.meaningVi) !== norm(v.meaningVi)), r);
    const c = choice(v.meaningVi, prefer(rest, (o) => posOf(o) === posOf(v)).map((o) => o.meaningVi), r, 3, true);
    if (c) out.push({ id: id('vm'), type: 'vocab-meaning', prompt: 'Chọn nghĩa đúng của từ', text: `${v.word}${v.ipa ? ` ${v.ipa}` : ''}${v.pos ? ` (${v.pos})` : ''}`, ...c, explain: `“${v.word}” nghĩa là “${v.meaningVi}”.${v.example ? ` Ví dụ: ${v.example}` : ''}` });
  });
  return out;
}

function grammarQuestions(k: LessonKnowledge, pool: ExercisePool, r: () => number, id: (t: string) => string) {
  const out: LessonExercise[] = [];
  const all = [...k.grammar, ...pool.grammar].filter(isFormula);
  k.grammar
    .filter(isFormula)
    .slice(0, 2)
    .forEach((g, i) => {
      // khác tên và khác công thức → không thể cùng đúng
      const rest = all.filter((o) => norm(o.title) !== norm(g.title) && disjoint(o.formula!, g.formula!));
      const ex = g.example ? ` Ví dụ trong bài: ${g.example}` : '';
      if (i % 2 === 0) {
        const c = choice(g.formula!, rest.map((o) => o.formula!), r);
        if (c) out.push({ id: id('gf'), type: 'grammar-formula', prompt: 'Chọn công thức đúng của cấu trúc', text: g.title, ...c, explain: `${g.title}: ${g.formula}.${g.note ? ` ${g.note}.` : ''}${ex}` });
      } else {
        const c = choice(g.title, rest.map((o) => o.title), r);
        if (c) out.push({ id: id('gn'), type: 'grammar-name', prompt: 'Công thức sau là của cấu trúc nào?', text: g.formula, ...c, explain: `${g.formula} là công thức của ${g.title.toLowerCase()}.${g.note ? ` ${g.note}.` : ''}${ex}` });
      }
    });
  return out;
}

/** a / an: chỉ hỏi giữa a và an (the luôn đúng ngữ pháp nên không đưa vào) */
function articleQuestions(k: LessonKnowledge, r: () => number, id: (t: string) => string, max: number) {
  const items: { art: 'a' | 'an'; node: KnowledgeNode }[] = [];
  for (const root of k.articles) if (root.label === 'a' || root.label === 'an') for (const c of root.children ?? []) items.push({ art: root.label, node: c });
  // ưu tiên từ của chính bài (bỏ ví dụ chung), có cả a và an
  const own = items.filter((x) => !/ví dụ chung/i.test(x.node.meaningVi ?? ''));
  const pick = shuffle(own.length ? own : items, r)
    .sort((x, y) => (x.art === y.art ? 0 : x.art === 'an' ? -1 : 1))
    .slice(0, max);
  return pick.flatMap(({ art, node }) => {
    const m = node.label.match(/^(a|an)\s+(.+)$/i);
    if (!m) return [];
    const options = ['a', 'an'];
    const vi = (node.meaningVi ?? '').replace(/\s*\(ví dụ chung\)/i, '').trim();
    return [
      {
        id: id('ar'),
        type: 'article' as const,
        prompt: 'Chọn mạo từ đúng',
        text: `${BLANK} ${m[2]}${vi ? ` (${vi})` : ''}`,
        options,
        answer: options.indexOf(art),
        explain: art === 'an' ? `Dùng “an” vì “${m[2]}” bắt đầu bằng nguyên âm.` : `Dùng “a” vì “${m[2]}” bắt đầu bằng phụ âm.`,
      },
    ];
  });
}

const ipaKey = (s: string) => s.replace(/[/ˈˌ.]/g, '').replace(/g/g, 'ɡ');
/** Âm /x/ + các từ của bài phát âm: "go /ɡəʊ/, bigger /ˈbɪɡər/" */
export function phonemeOf(k: LessonKnowledge) {
  const p = k.pronunciation.find((x) => /^Âm\s*\/[^/]+\//.test(x.title) && x.formula);
  if (!p) return null;
  const symbol = p.title.match(/\/([^/]+)\//)![1];
  const words = [...p.formula!.matchAll(/([A-Za-z'-]+)\s*(\/[^/]+\/)/g)].map((m) => ({ word: m[1], ipa: m[2] }));
  return words.length ? { symbol, words } : null;
}

function phonemeQuestions(k: LessonKnowledge, pool: ExercisePool, r: () => number, id: (t: string) => string) {
  const ph = phonemeOf(k);
  if (!ph) return [];
  const key = ipaKey(ph.symbol);
  // phương án nhiễu: từ của các âm khác mà phiên âm không chứa âm đang học
  const wrong = pool.phonemes.filter((o) => ipaKey(o.symbol) !== key).flatMap((o) => o.words.filter((w) => !ipaKey(w.ipa).includes(key)));
  return shuffle(ph.words, r)
    .slice(0, 2)
    .flatMap((w) => {
      const c = choice(
        w.word,
        wrong.filter((x) => norm(x.word) !== norm(w.word)).map((x) => x.word),
        r
      );
      return c ? [{ id: id('ph'), type: 'phoneme' as const, prompt: `Từ nào có chứa âm /${ph.symbol}/?`, ...c, explain: `“${w.word}” đọc là ${w.ipa}, có âm /${ph.symbol}/.` }] : [];
    });
}

/** Câu soạn tay (id bắt đầu "sgk") — giữ lại khi sinh lại bài tập */
export const isAuthored = (e: LessonExercise) => e.id.startsWith('sgk');
/** Câu điền chỗ trống soạn tay: "câu có ___ | đáp án đúng | sai…" → LessonExercise (xáo thứ tự cố định theo id) */
export function authoredGap(id: string, line: string, explain: string): LessonExercise | null {
  const [text, right, ...wrong] = line.split('|').map((x) => x.trim());
  const c = choice(right, wrong, rng(id), wrong.length);
  return c && text.includes('___') ? { id, type: 'grammar-gap', prompt: 'Chọn đáp án đúng điền vào chỗ trống', text: text.replace('___', BLANK), ...c, explain } : null;
}
/** Câu trắc nghiệm soạn tay bất kỳ: options[0] là đáp án đúng, thứ tự hiển thị xáo cố định theo id */
export function authoredChoice(id: string, e: { type: ExerciseType; prompt: string; text?: string; options: string[]; explain: string; passage?: ExercisePassage }): LessonExercise {
  const r = rng(id);
  const opts = shuffle(e.options, r);
  return { id, type: e.type, prompt: e.prompt, ...(e.text ? { text: e.text } : {}), options: opts, answer: opts.indexOf(e.options[0]), explain: e.explain, ...(e.passage ? { passage: e.passage } : {}) };
}

/** Sinh lại bài tập nhưng giữ câu soạn tay ở đầu */
export const withAuthored = (prev: unknown, generated: LessonExercise[]) => [...toExercises(prev).filter(isAuthored), ...generated].slice(0, 10);

/** Bài tập của một bài video (tối đa 8 câu, trộn dạng, cố định theo id bài) */
export function buildExercises(lessonId: string, k: LessonKnowledge, pool: ExercisePool): LessonExercise[] {
  const r = rng(lessonId);
  let n = 0;
  const id = (t: string) => `${t}${++n}`;
  const qs = [...phonemeQuestions(k, pool, r, id), ...vocabQuestions(k, pool, r, id), ...grammarQuestions(k, pool, r, id)];
  // a / an chỉ bổ sung: 1 câu, 2 câu khi bài ít nội dung khác
  qs.push(...articleQuestions(k, r, id, qs.length < 4 ? 2 : 1));
  return qs.slice(0, MAX);
}

/** Bài kiểm tra cuối chặng: lấy câu từ bài tập của các bài trước đó trong chặng (mỗi bài tối đa 3 câu) */
export function buildSectionQuiz(lessonId: string, sources: LessonExercise[][], size: number): LessonExercise[] {
  const r = rng(lessonId);
  // mỗi bài ưu tiên câu từ vựng / ngữ pháp / phát âm, câu a / an để sau
  const perLesson = sources.map((xs) => prefer(shuffle(xs, r), (x) => x.type !== 'article').slice(0, 3));
  // lấy xoay vòng giữa các bài để phủ đều nội dung chặng; tối đa 2 câu a / an, không trùng nội dung
  const out: LessonExercise[] = [];
  const seen = new Set<string>();
  let articles = 0;
  for (let round = 0; out.length < size && perLesson.some((xs) => xs.length > round); round++)
    for (const xs of perLesson) {
      const q = xs[round];
      if (!q || out.length >= size) continue;
      const key = `${q.prompt}|${q.text ?? ''}`;
      if (seen.has(key) || (q.type === 'article' && articles >= 2)) continue;
      seen.add(key);
      if (q.type === 'article') articles++;
      out.push({ ...q, id: `q${out.length + 1}` });
    }
  return out;
}

/** Kho phương án nhiễu từ kiến thức của nhiều bài */
export function poolOf(all: LessonKnowledge[]): ExercisePool {
  const phonemes = all.map(phonemeOf).filter((x): x is NonNullable<typeof x> => !!x);
  return { vocab: all.flatMap((k) => k.vocab), grammar: all.flatMap((k) => k.grammar), phonemes };
}

/** Đọc cột exercises (bỏ phần tử hỏng) */
export function toExercises(v: unknown): LessonExercise[] {
  if (!Array.isArray(v)) return [];
  return (v as LessonExercise[]).filter((e) => e && typeof e.prompt === 'string' && Array.isArray(e.options) && e.options.length >= 2 && Number.isInteger(e.answer) && e.answer >= 0 && e.answer < e.options.length);
}
