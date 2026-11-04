/**
 * Nhận diện ngữ pháp được dùng trong CHÍNH các câu của bài (ví dụ từ vựng, mẫu câu, câu luyện phát âm…).
 * Mỗi điểm ngữ pháp lấy đúng câu trong bài làm ví dụ — không bịa câu mới.
 */
import type { GrammarPoint, LessonKnowledge } from '../../../../src/modules/catalog/lesson-knowledge';

const V3 = 'done|made|sent|held|given|taken|written|built|paid|sold|told|shown|known|found|left|kept|cut|put|set|seen|bought|brought|chosen|spoken|broken|stolen|lost|met|won|grown|drawn|driven|eaten|forgotten|hidden|read|run|sung|thrown|worn|been';
/** be + tính từ đuôi -ed / -ing — không phải bị động / tiếp diễn */
const ADJ_ED = /\b(tired|interested|excited|bored|worried|married|pleased|satisfied|surprised|confused|retired|crowded|used|supposed|located|scared|disappointed|amazed|closed|qualified|experienced|advanced|detailed)\b/i;
const ADJ_ING = /^(interesting|boring|exciting|amazing|surprising|confusing|tiring|relaxing|charming|missing|outstanding|willing|outgoing|ongoing|upcoming|morning|evening|nothing|something|anything|everything|thing|king|ring|spring|wedding|building|meeting|ceiling)$/i;

type Rule = GrammarPoint & { test: (s: string) => boolean };
const re = (r: RegExp) => (s: string) => r.test(s);

const RULES: Rule[] = [
  // cấu trúc đặc thù trước, thì cơ bản sau — mỗi câu chỉ gắn 1 cấu trúc nổi bật nhất
  { title: 'Câu điều kiện loại 1', formula: 'If + S + V (hiện tại), S + will / can + V', note: 'Điều kiện có thể xảy ra ở hiện tại hoặc tương lai', test: re(/\bif\b[^.?!]*\b(will|'ll|can)\b|\b(will|'ll)\b[^.?!]*\bif\b/i) },
  { title: 'Câu điều kiện loại 2', formula: 'If + S + V2 / were, S + would + V', note: 'Điều kiện không có thật ở hiện tại', test: (s) => /\bif\b/i.test(s) && /\bwould\b(?! like)/i.test(s) },
  { title: 'Câu bị động', formula: 'S + be + V3/ed (+ by O)', note: 'Nhấn mạnh đối tượng chịu tác động hơn người làm', test: (s) => new RegExp(`\\b(am|is|are|was|were|be|been|being)\\s+(\\w+ed|${V3})\\b`, 'i').test(s.replace(ADJ_ED, '')) && !/\b(is|are|was|were) been\b/i.test(s) },
  { title: 'Thì hiện tại hoàn thành', formula: 'S + have / has + V3/ed', note: 'Việc đã xảy ra, còn liên quan đến hiện tại (already, yet, for, since)', test: (s) => new RegExp(`\\b(have|has|'ve)\\s+(already\\s+|just\\s+|never\\s+)?(\\w+ed|${V3})\\b`, 'i').test(s) },
  { title: 'Thì quá khứ tiếp diễn', formula: 'S + was / were + V-ing', note: 'Việc đang diễn ra tại một thời điểm trong quá khứ', test: (s) => [...s.matchAll(/\b(was|were)\s+(\w+ing)\b/gi)].some((m) => !ADJ_ING.test(m[2])) },
  { title: 'Thì tương lai với be going to', formula: 'S + am / is / are + going to + V', note: 'Dự định đã có kế hoạch từ trước', test: re(/\b(am|is|are|'m|'re|'s)\s+going to\s+\w+/i) },
  { title: 'would like', formula: "S + would like ('d like) + to V / N", note: 'Diễn đạt mong muốn lịch sự hơn want', test: re(/\b(would like|'d like)\b/i) },
  { title: 'have to / has to', formula: 'S + have / has to + V', note: 'Bắt buộc do hoàn cảnh bên ngoài', test: re(/\b(have|has|had) to\s+\w+/i) },
  { title: 'Động từ + tân ngữ + to V', formula: 'ask / tell / want / remind + O + to V', note: 'Yêu cầu, nhờ ai làm gì', test: re(/\b(ask|asked|asks|tell|told|tells|want|wants|wanted|remind|reminded|invite|invited|allow|allowed)\s+(me|you|us|him|her|them|\w+)\s+to\s+\w+/i) },
  { title: 'Động từ + to V', formula: 'want / need / plan / decide / hope + to V', note: 'Một số động từ luôn theo sau là to V', test: re(/\b(want|wants|wanted|need|needs|needed|plan|plans|decide|decided|hope|try|tried|forget|remember|agree|learn)\s+to\s+\w+/i) },
  { title: 'Động từ + V-ing', formula: 'enjoy / like / mind / avoid / finish + V-ing', note: 'Một số động từ luôn theo sau là V-ing', test: re(/\b(enjoy|enjoys|enjoyed|like|likes|love|loves|mind|avoid|finish|finished|keep|suggest|recommend)\s+\w+ing\b/i) },
  { title: 'So sánh hơn', formula: 'adj-er / more + adj + than', note: 'So sánh hai người / vật', test: re(/\b(\w+er|more\s+\w+|less\s+\w+)\s+(\w+\s+)?than\b/i) },
  { title: 'So sánh nhất', formula: 'the + adj-est / the most + adj', note: 'So sánh từ ba người / vật trở lên', test: re(/\bthe\s+((?!(test|rest|guest|interest|request|west|chest|contest|forest|harvest|nest|quest|protest|suggest|invest|digest)\b)\w+est|most\s+\w+)\b/i) },
  { title: 'too + tính từ', formula: 'S + be + too + adj (+ to V)', note: 'Quá … (đến mức không thể)', test: re(/\btoo\s+\w+/i) },
  { title: 'There is / There are', formula: 'There is + N số ít / There are + N số nhiều', note: 'Nói có cái gì ở đâu', test: re(/\b(there (is|are|was|were|'s)|(is|are) there)\b/i) },
  { title: 'Danh động từ làm chủ ngữ', formula: 'V-ing (+ O) + V chia số ít', note: 'Hành động làm chủ ngữ thì dùng V-ing, động từ theo sau chia số ít', test: (s) => /^[A-Z][a-z]+ing\b.*\b(is|are|was|has|helps|makes|can|will|takes)\b/.test(s) && !ADJ_ING.test(s.split(' ')[0]) },
  { title: 'Nói về sở thích', formula: 'S + be into / be interested in / be keen on + N / V-ing', note: 'Sau giới từ là danh từ hoặc V-ing', test: re(/\b(am|is|are|'m|'re|'s)\s+(really\s+)?(into|interested in|keen on|fond of)\b/i) },
  { title: 'It làm chủ ngữ giả', formula: 'It + be + giờ / ngày / thời tiết / khoảng cách', note: 'Dùng It khi không có chủ ngữ thật', test: re(/\b(it's|it is|it was)\s+(a quarter|half|\d|[a-z]+ o'clock|cold|hot|warm|sunny|raining|monday|tuesday|wednesday|thursday|friday|saturday|sunday|time)\b/i) },
  { title: 'Câu hỏi đuôi', formula: "Mệnh đề khẳng định, trợ động từ phủ định + S?", note: 'Hỏi để xác nhận thông tin', test: re(/,\s*(isn't|aren't|don't|doesn't|didn't|won't|can't|wasn't|weren't|haven't|hasn't|is|are|do|does)\s+(it|you|they|he|she|we|there)\?/i) },
  { title: 'Thì tương lai đơn', formula: 'S + will + V', note: 'Quyết định ngay lúc nói, lời hứa, dự đoán', test: (s) => /\b(will|'ll)\s+(not\s+)?\w+/i.test(s) && !/\bif\b/i.test(s) },
  { title: 'Thì hiện tại tiếp diễn', formula: 'S + am / is / are + V-ing', note: 'Việc đang diễn ra lúc nói', test: (s) => [...s.matchAll(/\b(am|is|are|'m|'re)\s+(\w+ing)\b/gi)].some((m) => !ADJ_ING.test(m[2]) && !/^going$/i.test(m[2]) || (/^going$/i.test(m[2]) && !/going to/i.test(s))) },
  { title: 'Thì quá khứ đơn', formula: 'S + V2/ed', note: 'Việc đã kết thúc trong quá khứ (yesterday, ago, last…)', test: (s) => !/\b(have|has|'ve)\s+(already\s+|just\s+)?(?!to\b)\w+/i.test(s) && !/\bif\b/i.test(s) && !/\b(turn|on the|to the) left\b|lost and found/i.test(s) &&!/\b(was|were)\s+\w+ing\b/i.test(s) && (/\b(went|came|saw|got|took|bought|left|met|told|said|found|had|did|was|were|ate|gave|made|wrote|sent|paid)\b/i.test(s.replace(/\b(is|are|was|were|be|been)\s+(made|sent|paid|told|found|given|taken|written)\b/gi, '')) || /\b(I|you|we|they|he|she|it|the \w+|my \w+|[A-Z][a-z]+)\s+\w+[^e\s]ed\b/.test(s.replace(/^[A-Z]/, (c) => c.toLowerCase()))) },
  { title: 'Lời đề nghị lịch sự', formula: 'Could / Would / Can you + V …?', note: 'Nhờ ai làm gì một cách lịch sự', test: re(/\b(could|would|can) you\s+(please\s+)?\w+/i) },
  { title: 'Động từ khuyết thiếu', formula: 'S + can / could / should / must / may + V nguyên mẫu', note: 'Sau động từ khuyết thiếu luôn là V nguyên mẫu, không chia', test: re(/\b(I|you|we|they|he|she|it|[A-Z][a-z]+)\s+(can|can't|could|should|must|may|might)\s+(not\s+)?\w+/) },
  { title: 'Câu hỏi Wh-', formula: 'Wh- + trợ động từ / be + S + V?', note: 'Hỏi thông tin; cuối câu thường xuống giọng', test: re(/(^|[.!?]\s+|\/\s*)(what|where|when|why|how|who|which|whose)\b[^?]*\?/i) },
  { title: 'Câu hỏi Yes/No', formula: 'Trợ động từ / be / modal + S + …?', note: 'Trả lời Yes / No; cuối câu thường lên giọng', test: re(/(^|[.!?]\s+|\/\s*)(do|does|did|are|is|am|was|were|can|could|will|have|has|should|may)\s+(you|we|I|they|he|she|it|there|the|this|your)\b[^?]*\?/i) },
  { title: 'Câu mệnh lệnh', formula: "V nguyên mẫu + … / Don't + V / Let's + V", note: 'Ra lệnh, hướng dẫn, rủ rê — không có chủ ngữ', test: re(/(^|[.!?,;]\s+|\bso\s+)(please\s+)?(go|turn|take|show|check|call|send|let's|don't|keep|make|bring|fill|sign|press|wait|come|try|remember|listen|repeat|read|write|look|put|stop|tell|give|open|close|reduce|review|mark|use|avoid|save|recycle|protect|follow|choose|ask|answer|note)\b/i) },
  { title: 'Thì hiện tại đơn', formula: 'S + V / V-s,es (ngôi 3 số ít)', note: 'Thói quen, sự thật, công việc thường ngày', test: (s) => !s.endsWith('?') && !/\b(will|'ll|was|were|did|have|has)\s/i.test(s.replace(/\b(I|you|we|they) have\b/gi, '')) && (/\b(I|you|we|they)\s+(usually\s+|always\s+|often\s+|sometimes\s+|never\s+)?(?!am\b|are\b|was\b|were\b|will\b|would\b|can\b|could\b|should\b|must\b|had\b|did\b|may\b|might\b)[a-z]+\b(?<![^e\s]ed)/.test(s.replace(/^[A-Z]/, (c) => c.toLowerCase()).replace(/^i /, 'I ')) || /\b(he|she|it|the \w+|our \w+|my \w+|this \w+)\s+(usually\s+|always\s+|often\s+)?(is|has|takes|makes|gives|offers|serves|provides|includes|starts|opens|closes|works|lives|needs|wants|likes|goes|gets|watches|costs|means)\b/i.test(s) || /^[A-Z][a-z]+( [a-z]+)? (is|are) (a|an|very|really|\w+)\b/.test(s)) },
];

const split = (xs: (string | undefined)[], sep: RegExp) => xs.flatMap((s) => (s ? s.split(sep) : [])).map((s) => s.replace(/[↗↘]/g, '').trim());
const english = (s: string) => /[a-z]{2,} [a-z]{2,}/i.test(s) && !/[À-ỹ]/.test(s);

/** Câu tiếng Anh thật trong bài; sau cùng là các mẫu câu của bài (I'd like to talk about …) khi bài chỉ có mẫu câu */
export function lessonSentences(k: LessonKnowledge): string[] {
  const full = split([...k.phrases, ...k.pronunciation, ...k.tips, ...k.vocab, ...k.clauses].map((x) => x.example), /\s+\/\s+/).filter((s) => english(s) && /[.?!]$/.test(s) && !/…/.test(s));
  const patterns = split(k.phrases.map((x) => x.formula), /\s+\/\s+|;\s+/).filter((s) => english(s) && /^[A-Z]/.test(s) && !/\+/.test(s) && !/^[A-Z][a-z]+ing to\b/.test(s));
  return [...new Set([...full, ...patterns])];
}

/** Tối đa `max` điểm ngữ pháp, mỗi điểm kèm một câu khác nhau của bài */
export function detectGrammar(k: LessonKnowledge, max = 4): GrammarPoint[] {
  const sentences = lessonSentences(k);
  const used = new Set<string>();
  const out: GrammarPoint[] = [];
  for (const r of RULES) {
    if (out.length >= max) break;
    if (k.grammar.some((g) => g.title === r.title)) continue;
    const hit = sentences.filter((s) => r.test(s));
    // mỗi câu chỉ minh hoạ 1 cấu trúc — tránh 1 câu bị gắn nhiều thì mâu thuẫn
    const ex = hit.find((s) => !used.has(s));
    if (!ex) continue;
    used.add(ex);
    // câu ghi trọng âm bằng chữ IN HOA (I NEED to FINISH…) → viết thường lại khi làm ví dụ ngữ pháp
    out.push({ title: r.title, formula: r.formula, note: r.note, example: ex.replace(/\b(?!I\b)[A-Z]{2,}\b/g, (w) => w.toLowerCase()) });
  }
  return out;
}
