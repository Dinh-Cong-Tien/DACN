/**
 * Cây mạo từ cho từng video: a / an / the / không mạo từ → các danh từ của chính bài đó đi với mạo từ nào.
 * a hay an chọn theo ÂM ĐẦU trong phiên âm (IPA), không theo chữ cái (a university, an hour).
 */
import type { KnowledgeNode, LessonKnowledge } from '../../../../src/modules/catalog/lesson-knowledge';

/** Danh từ không đếm được / luôn số nhiều → không đi với a/an */
const UNCOUNTABLE = new Set(['equipment', 'luggage', 'baggage', 'furniture', 'information', 'advice', 'pollution', 'privacy', 'money', 'water', 'food', 'music', 'news', 'work', 'homework', 'traffic', 'weather', 'english', 'feedback', 'research', 'software', 'merchandise', 'staff', 'light']);
const PLURAL = new Set(['customs', 'minutes', 'headquarters', 'figures', 'people', 'goods', 'clothes', 'siblings', 'relatives']);
const VOWEL_SOUND = /^[aeiouæɑɒɔəɜʌɪʊ]/;

type Noun = { word: string; ipa: string; meaningVi: string; example?: string };

const nounsOf = (k: LessonKnowledge): Noun[] =>
  k.vocab
    .filter((v) => v.ipa && v.pos && /^n\b|\bn\b/.test(v.pos) && /^[a-zA-Z][a-zA-Z-]*$/.test(v.word))
    .map((v) => ({ word: v.word.toLowerCase(), ipa: v.ipa!.replace(/[/ˈˌ]/g, ''), meaningVi: v.meaningVi.split(/[;(]/)[0].trim(), example: v.example }));

/** Câu ví dụ của từ vựng nếu đúng là có dùng mạo từ đó với từ này */
const exampleWith = (n: Noun, art: string) => (n.example && new RegExp(`\\b${art} ${n.word}\\b`, 'i').test(n.example) ? n.example : undefined);

/** Cụm "a/an/the + (tính từ) + danh từ" xuất hiện trong chính các câu ví dụ của bài */
const ADJ = /(ble|ful|ive|ous|ical|ic|less|ly|est|ed)$/;
const COMMON_ADJ = new Set(['second', 'third', 'wooden', 'popular', 'important', 'unique', 'following', 'return', 'sales', 'serious', 'private', 'public', 'new', 'old', 'good', 'big', 'small', 'short', 'long', 'great', 'free', 'high', 'low', 'best', 'first', 'last', 'same', 'next', 'main', 'local', 'quick', 'strong', 'heavy', 'busy', 'nice', 'young', 'whole', 'few', 'little', 'lot']);
const STOP = new Set(['is', 'are', 'was', 'were', 'be', 'has', 'have', 'had', 'will', 'can', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'that', 'who', 'which', 'you', 'we', 'i']);
const COMPARATIVE = new Set(['better', 'worse', 'more', 'less', 'earlier', 'later', 'sooner', 'faster', 'bigger', 'higher', 'lower', 'longer', 'harder']);
const PRONOUN = new Set(['my', 'your', 'his', 'her', 'its', 'our', 'their', 'one']);
const QUANT = new Set(['lost', 'few', 'lot', 'little', 'bit', 'number', 'quarter']);
/** Danh từ luôn đi với the (duy nhất) hoặc không dùng mạo từ (môn học, ngôn ngữ, mùa…) — không gợi ý a/an */
const THE_ONLY = new Set(['sun', 'moon', 'earth', 'sky', 'internet']);
const NO_ARTICLE = new Set(['english', 'listening', 'reading', 'summer', 'winter', 'spring', 'autumn', 'time', 'rent', 'lunch', 'dinner', 'breakfast']);
type Phrase = { art: 'a' | 'an' | 'the'; phrase: string; sentence: string };
function phrasesOf(k: LessonKnowledge): Phrase[] {
  const lessonAdj = new Set(k.vocab.filter((v) => v.pos && /adj/.test(v.pos)).map((v) => v.word.toLowerCase()));
  const isAdj = (w: string) => ADJ.test(w) || COMMON_ADJ.has(w) || lessonAdj.has(w) || w === 'most' || w === 'more';
  const sentences = [...k.grammar.map((g) => g.example), ...k.vocab.map((v) => v.example), ...k.clauses.map((c) => c.example)].filter((s): s is string => !!s && !/[+…]/.test(s));
  const out: Phrase[] = [];
  for (const s of sentences)
    for (const m of s.matchAll(/\b(a|an|the)\s+([a-z][a-z-]*)(?:\s+([a-z][a-z-]*))?(?:\s+([a-z][a-z-]*))?(?:\s+([a-z][a-z-]*))?(?:\s+([a-z][a-z-]*))?/gi)) {
      const art = m[1].toLowerCase() as Phrase['art'];
      const words = [m[2], m[3], m[4], m[5], m[6]].filter(Boolean).map((w) => w.toLowerCase());
      if (STOP.has(words[0]) || QUANT.has(words[0]) || words[0].length < 2) continue;
      const take = [words[0]];
      // tính từ đứng trước → lấy thêm danh từ phía sau (a reliable supplier, the most popular product)
      for (let i = 1; i < words.length && isAdj(take[i - 1]) && !STOP.has(words[i]); i++) take.push(words[i]);
      const last = take[take.length - 1];
      // bỏ cụm không kết thúc bằng danh từ: so sánh kép (the earlier …, the better …), tính từ đứng cuối (the most popular)
      if (COMPARATIVE.has(take[0]) || PRONOUN.has(last) || STOP.has(last) || isAdj(last) || NO_ARTICLE.has(last) || (art !== 'the' && THE_ONLY.has(last))) continue;
      const phrase = `${art} ${take.join(' ')}`;
      if (!out.some((x) => x.phrase === phrase)) out.push({ art, phrase, sentence: s });
    }
  return out;
}

const leaf = (label: string, meaningVi?: string, example?: string): KnowledgeNode => ({ label, ...(meaningVi ? { meaningVi } : {}), ...(example ? { example } : {}) });

/** Ví dụ chung khi bài có ít danh từ */
/** Ví dụ chung (bài không có danh từ phù hợp) — ghi rõ để học viên không nhầm là từ trong video */
const general = (n: KnowledgeNode): KnowledgeNode => ({ ...n, meaningVi: `${n.meaningVi} (ví dụ chung)` });
const FALLBACK_RAW = {
  a: [leaf('a book', 'một quyển sách', 'I bought a book yesterday.'), leaf('a meeting', 'một cuộc họp', 'We have a meeting at 9.'), leaf('a report', 'một bản báo cáo', 'She wrote a report.')],
  an: [leaf('an apple', 'một quả táo'), leaf('an email', 'một email', 'I sent an email to the client.'), leaf('an office', 'một văn phòng', 'They rented an office downtown.')],
  the: [leaf('the book', 'quyển sách (đã nhắc tới)', 'The book I bought is very useful.'), leaf('the manager', 'người quản lý (ai cũng biết là ai)', 'The manager will call you.')],
  zero: [leaf('information', 'thông tin — không đếm được', 'We need more information.'), leaf('books', 'sách nói chung — số nhiều', 'Books are expensive here.')],
};

const FALLBACK = {
  a: FALLBACK_RAW.a.map(general),
  an: FALLBACK_RAW.an.map(general),
  the: FALLBACK_RAW.the.map(general),
  zero: FALLBACK_RAW.zero.map(general),
};

const NOTE = {
  a: leaf('Tính theo âm, không theo chữ', 'chữ nguyên âm nhưng đọc là phụ âm → vẫn dùng a', 'a university /ˌjuː-/, a European, a one-way ticket'),
  an: leaf('Tính theo âm, không theo chữ', 'h câm hoặc chữ viết tắt đọc bằng nguyên âm → dùng an', 'an hour, an honest person, an MBA'),
  the: leaf('Luôn dùng the', 'vật duy nhất, so sánh nhất, số thứ tự', 'the sun, the best option, the first time'),
  zero: leaf('Cụm cố định không có mạo từ', 'phương tiện, bữa ăn, nơi chốn quen thuộc', 'by bus, have lunch, at home, go to work'),
};

export function articleTree(k: LessonKnowledge): KnowledgeNode[] {
  const nouns = nounsOf(k);
  const countable = nouns.filter((n) => !UNCOUNTABLE.has(n.word) && !PLURAL.has(n.word) && !THE_ONLY.has(n.word) && !NO_ARTICLE.has(n.word));
  const aList = countable.filter((n) => !VOWEL_SOUND.test(n.ipa)).slice(0, 6);
  const anList = countable.filter((n) => VOWEL_SOUND.test(n.ipa)).slice(0, 6);
  const zeroList = nouns.filter((n) => UNCOUNTABLE.has(n.word) || PLURAL.has(n.word) || NO_ARTICLE.has(n.word)).slice(0, 6);
  const theList = nouns.filter((n) => !NO_ARTICLE.has(n.word)).slice(0, 6);

  const used = phrasesOf(k);
  const pick = (list: Noun[], art: 'a' | 'an' | 'the', fallback: KnowledgeNode[]) => {
    // 1) danh từ trong phần Từ vựng của bài (có nghĩa), 2) cụm có mạo từ trong câu ví dụ của bài, 3) ví dụ chung
    const nodes = list.map((n) => leaf(`${art} ${n.word}`, art === 'the' ? `${n.meaningVi} (đã xác định)` : `một ${n.meaningVi}`, exampleWith(n, art)));
    used.filter((u) => u.art === art && !nodes.some((x) => x.label === u.phrase)).forEach((u) => nodes.length < 6 && nodes.push(leaf(u.phrase, undefined, u.sentence)));
    return nodes.length ? nodes : fallback;
  };

  return [
    { label: 'a', meaningVi: 'trước danh từ đếm được số ít bắt đầu bằng âm phụ âm (nhắc lần đầu)', children: [...pick(aList, 'a', FALLBACK.a), NOTE.a] },
    { label: 'an', meaningVi: 'trước danh từ đếm được số ít bắt đầu bằng âm nguyên âm', children: [...pick(anList, 'an', FALLBACK.an), NOTE.an] },
    { label: 'the', meaningVi: 'khi người nghe đã biết là người / vật nào', children: [...pick(theList, 'the', FALLBACK.the), NOTE.the] },
    {
      label: 'Không dùng mạo từ',
      meaningVi: 'danh từ không đếm được hoặc số nhiều nói chung',
      children: [...(zeroList.length ? zeroList.map((n) => leaf(n.word, `${n.meaningVi} — không dùng a/an`, n.example)) : FALLBACK.zero), NOTE.zero],
    },
  ];
}
