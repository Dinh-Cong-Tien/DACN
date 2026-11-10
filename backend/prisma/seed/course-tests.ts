/**
 * Đề kiểm tra RIÊNG cho từng bài QUIZ / CHECKPOINT trong khoá:
 *  - không trùng bài tập trong bài học, không trùng bài kiểm tra khác, không lấy câu của đề thi thử;
 *  - chặng ngữ pháp / từ vựng: câu thật trong ngân hàng (chưa nằm trong đề thi thử nào), chọn theo chủ đề các bài của chặng;
 *  - chặng phát âm / nghe / nói / viết, Part 2: đề soạn riêng (data/course-tests/*.ts — câu nghe dùng giọng máy đọc);
 *  - Part 6: mỗi bài một đoạn văn khác nhau; Part 1 (tranh): ngân hàng chỉ có câu nằm trong đề thi thử → chọn không trùng nhau giữa các bài.
 * Đề do admin / giáo viên đã sửa (id sgk-adm-…) được giữ nguyên.
 * Chạy: npx tsx prisma/seed/course-tests.ts [--dry]
 */
import { Prisma, type Question } from '@prisma/client';
import { prisma } from './lib';
import { authoredChoice, toExercises, type ExerciseType, type LessonExercise } from '../../src/modules/catalog/lesson-exercises';
import { PART6_SETS } from './data/toeic-part6';
import type { AuthoredTest } from './data/course-tests/types';
import { TESTS as T1 } from './data/course-tests/toeic-pronunciation';
import { TESTS as T2 } from './data/course-tests/toeic-skills';
import { TESTS as T3 } from './data/course-tests/vstep-listening-speaking';
import { TESTS as T4 } from './data/course-tests/vstep-pron-writing-vocab';
import { TESTS as T5 } from './data/course-tests/thpt-full';

const DRY = process.argv.includes('--dry');
const AUTHORED = new Map<string, AuthoredTest>([...T1, ...T2, ...T3, ...T4, ...T5].map((t) => [t.lessonId, t]));
type Opt = { key: string; text: string };

/** Khoá so trùng: nội dung câu + phương án + đoạn văn / lời đọc (không phụ thuộc id, thứ tự phương án) */
const norm = (s?: string) => (s ?? '').toLowerCase().replace(/^\([a-d]\)\s*/, '').replace(/_+/g, '_').replace(/\s+/g, ' ').trim();
const keyOf = (e: LessonExercise) => [norm(e.text), [...e.options].map(norm).sort().join('|'), norm(e.passage?.content), norm(e.passage?.speak), e.passage?.audioUrl ?? '', e.passage?.imageUrl ?? ''].join('#');

// ---------- ngân hàng ----------
const optsOf = (q: Question) => ((q.options as Opt[] | null) ?? []).filter((o) => o && o.key && o.text);
const keyOfQ = (q: Question) => ((q.correctAnswer as { keys?: string[]; key?: string } | null)?.keys ?? []).concat((q.correctAnswer as { key?: string } | null)?.key ?? []).filter(Boolean);
const BAD_OPT = /^\s*[-–.]?\s*$|&|\bboth\b|\ball (of )?(the )?(above|answers)|none of|answers? (is|are) correct|^\s*[a-d]\s*(and|,)\s*[a-d]\b/i;
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịĩọỏốồổỗộớờởỡợụủũứừửữựỳỵỷỹ]/i;
const isVocab = (q: Question) => /^Chọn nghĩa đúng của từ/.test(q.stem);
function usable(q: Question) {
  const o = optsOf(q);
  const k = keyOfQ(q);
  if (o.length !== 4 || k.length !== 1 || !o.some((x) => x.key === k[0])) return false;
  if (new Set(o.map((x) => x.text.trim().toLowerCase())).size !== 4 || o.some((x) => BAD_OPT.test(x.text))) return false;
  if (q.stem.length > 220) return false;
  return isVocab(q) || (/_{2,}|\.{3,}|…/.test(q.stem) && !VI.test(q.stem));
}
const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};
function fromBank(q: Question, toeic: boolean): LessonExercise {
  const o = optsOf(q);
  const answer = o.findIndex((x) => x.key === keyOfQ(q)[0]);
  const right = o[answer].text;
  const explain = q.explanationMd?.trim() || `Đáp án đúng: “${right}”.${q.translationVi ? ` Dịch: ${q.translationVi}` : ''}`;
  if (isVocab(q)) return { id: `sgk-bank-${q.id}`, type: 'vocab-meaning', prompt: q.stem, options: o.map((x) => x.text), answer, explain };
  // chỗ trống viết lẫn "____……." → một ô "_____" có khoảng trắng hai bên
  const text = q.stem
    .replace(/\s*(?:_{2,}|\.{3,}|…+)[_.…]*(?:\s*(?:_{2,}|\.{3,}|…+)[_.…]*)*\s*/g, ' _____ ')
    .replace(/\s+([.,?!])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (toeic) return { id: `sgk-bank-${q.id}`, type: 'toeic-p5', prompt: 'Choose the word or phrase that best completes the sentence.', text, options: o.map((x) => `(${x.key}) ${x.text}`), answer, explain };
  return { id: `sgk-bank-${q.id}`, type: 'grammar-gap', prompt: 'Chọn đáp án đúng để hoàn thành câu', text, options: o.map((x) => x.text), answer, explain };
}

/** Chủ đề trong tên bài → tag ngân hàng */
const TOPICS: [RegExp, string[]][] = [
  [/hiện tại hoàn thành/, ['grammar-thi-hien-tai-hoan-thanh-present-perfect', 'grammar-hien-tai-hoan-thanh']],
  [/quá khứ hoàn thành/, ['grammar-thi-qua-khu-hoan-thanh-past-perfect']],
  [/quá khứ tiếp diễn/, ['grammar-thi-qua-khu-tiep-dien-past-continuous']],
  [/quá khứ/, ['grammar-thi-qua-khu-don-past-simple', 'vocab-irregular-verbs']],
  [/hiện tại tiếp diễn/, ['grammar-thi-hien-tai-tiep-dien-present-continuous']],
  [/hiện tại đơn|thì hiện tại|các thì hiện tại/, ['grammar-present-simple', 'grammar-thi-hien-tai-tiep-dien-present-continuous']],
  [/tương lai|will|be going to/, ['grammar-thi-tuong-lai-don-future-simple', 'grammar-be-going-to', 'grammar-thi-tuong-lai-tiep-dien-future-continuous']],
  [/các thì|12 thì|phối hợp thì|chia động từ/, ['grammar-verb-tenses', 'grammar-su-phoi-hop-thi-trong-tieng-anh-sequence-of-tenses']],
  [/to be|am, is, are/, ['grammar-am-is-are']],
  [/so sánh/, ['grammar-cau-truc-cau-so-sanh-comparison', 'grammar-mixed-comparisons']],
  [/mệnh đề quan hệ|mệnh đề tính từ/, ['grammar-menh-de-quan-he', 'grammar-relative-pronoun']],
  [/danh động từ|v-ing|to v\b|to-infinitive|to verb/, ['grammar-gerunds', 'grammar-infinitives']],
  [/phân từ/, ['grammar-participle-phrases']],
  [/khuyết thiếu|modal|should|must|can, could/, ['grammar-modal-verbs', 'grammar-must-have-to']],
  [/giới từ/, ['grammar-gioi-tu-prepositions']],
  [/much|many|lượng từ/, ['grammar-much-vs-many']],
  [/danh từ|đếm được/, ['grammar-danh-tu-nouns', 'grammar-plural-nouns']],
  [/tính từ/, ['grammar-tinh-tu-adjectives']],
  [/trạng từ/, ['grammar-trang-tu-adverbs']],
  [/từ loại|hậu tố/, ['grammar-tu-loai-word-form']],
  [/tường thuật/, ['grammar-cau-truc-cau-gian-tiep-reported-speech', 'grammar-tell-vs-say']],
  [/giả định|câu ước|wish|điều kiện/, ['grammar-cau-truc-cau-gia-dinh-subjunctive-mood']],
  [/there is|there are/, ['grammar-there-be']],
  [/mệnh lệnh|lời mời/, ['grammar-imperative']],
  [/số ít số nhiều|hoà hợp|hòa hợp/, ['grammar-subject-and-verb-agreement']],
  [/have got/, ['grammar-have-and-have-got']],
  [/since|for\b/, ['grammar-since-and-for']],
  [/cấu trúc câu|câu đơn|câu ghép|kiểu câu|thành phần câu/, ['grammar-sentence-patterns']],
  [/động từ/, ['grammar-dong-tu-verbs']],
];

async function main() {
  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    include: { courseSectionCourses: { orderBy: { orderIndex: 'asc' }, include: { lessonSections: { where: { deletedAt: null }, orderBy: { orderIndex: 'asc' } } } } },
  });
  const isTest = (t: string) => t === 'QUIZ' || t === 'CHECKPOINT';

  // 1) câu đã dùng: bài tập trong mọi bài học (không phải bài kiểm tra)
  const used = new Set<string>();
  const usedIn = new Map<string, string>();
  const mark = (e: LessonExercise, where: string) => (used.add(keyOf(e)), usedIn.set(keyOf(e), where));
  for (const c of courses) for (const s of c.courseSectionCourses) for (const l of s.lessonSections) if (!isTest(l.type)) toExercises(l.exercises).forEach((e) => mark(e, l.title));

  // 2) ngân hàng: câu nằm trong đề thi thử bị loại
  const inMock = new Set((await prisma.mockTestQuestion.findMany({ select: { questionId: true } })).map((x) => x.questionId));
  const tagRows = await prisma.skillTag.findMany({ select: { id: true, slug: true } });
  const slugOf = new Map(tagRows.map((t) => [t.id, t.slug]));
  const p5 = (await prisma.question.findMany({ where: { part: 'TOEIC_P5', status: 'PUBLISHED', deletedAt: null } })).filter((q) => !inMock.has(q.id) && usable(q));
  const byTag = new Map<string, Question[]>();
  p5.forEach((q) => q.tagIds.forEach((t) => byTag.set(slugOf.get(t) ?? '', [...(byTag.get(slugOf.get(t) ?? '') ?? []), q])));
  const takenBank = new Set<string>();
  const levelRank = (q: Question, toeic: boolean) => (toeic ? (q.level === 'B2' ? 0 : q.level === 'B1' ? 1 : 2) : q.level === 'A2' ? 0 : q.level === 'B1' ? 1 : 2);
  const pickTag = (slug: string, toeic: boolean, vocab: boolean) => {
    const xs = (byTag.get(slug) ?? []).filter((q) => !takenBank.has(q.id) && isVocab(q) === vocab).sort((a, b) => levelRank(a, toeic) - levelRank(b, toeic) || hash(a.id) - hash(b.id));
    for (const q of xs) {
      const e = fromBank(q, toeic);
      if (used.has(keyOf(e))) continue;
      takenBank.add(q.id);
      return e;
    }
    return null;
  };

  const report: string[] = [];
  const stat = { authored: 0, bank: 0, part: 0, kept: 0, short: 0 };
  let p6 = 0;
  const p1all = (await prisma.question.findMany({ where: { part: 'TOEIC_P1', status: 'PUBLISHED', deletedAt: null, imageUrl: { not: null }, audioUrl: { not: null } } })).sort((a, b) => hash(a.id) - hash(b.id));
  const PEOPLE = /^(the|a|an|some|two|several|one of the|both)?\s*(wom[ae]n|m[ae]n|people|person|workers?|customers?|shoppers?|passengers?|employees?|chefs?|girl|boy|children|they|he|she|cyclists?|diners?|musicians?)\b/i;
  const isPeople = (q: Question) => optsOf(q).filter((o) => PEOPLE.test(o.text)).length >= 2;
  const p1ex = (q: Question, no: number): LessonExercise | null => {
    const o = optsOf(q);
    const k = keyOfQ(q)[0];
    if (o.length < 3 || !k) return null;
    const right = o.find((x) => x.key === k);
    return { id: `sgk-bank-${q.id}`, type: 'toeic-p1', prompt: 'Look at the picture and listen to the four statements. Choose the one that best describes the picture.', text: `Question ${no}`, options: o.map((x) => `(${x.key})`), answer: o.findIndex((x) => x.key === k), explain: `Lời thoại:\n${o.map((x) => `(${x.key}) ${x.text}`).join('\n')}\n\nĐáp án: (${k}) ${right?.text ?? ''}`, passage: { id: `q-${q.id}`, content: '', imageUrl: q.imageUrl!, audioUrl: q.audioUrl! } };
  };

  for (const c of courses) {
    const toeic = c.examType === 'TOEIC' && c.track !== 'THPT';
    const vocabTag = toeic ? 'vocab-toeic' : 'vocab-basic';
    const fallback = toeic ? ['toeic-p5'] : ['grammar-high-school-grammar', 'grammar-total-english-grammar-pre-intermediate-level', 'grammar-total-english-grammar-basic-level'];
    const flat = c.courseSectionCourses.flatMap((s) => s.lessonSections.map((l) => ({ l, s })));
    for (const [i, { l, s }] of flat.entries()) {
      if (!isTest(l.type)) continue;
      const cur = toExercises(l.exercises);
      const size = l.type === 'CHECKPOINT' ? 15 : Math.max(cur.length, 10);
      let qs: LessonExercise[] = [];
      let how = '';
      const a = AUTHORED.get(l.id);
      const admin = cur.length && cur.every((e) => e.id.startsWith('sgk-adm-'));
      if (admin) {
        qs = cur;
        how = 'giữ đề admin/GV sửa';
        stat.kept++;
      } else if (a) {
        qs = a.questions.map((q, n) => {
          const id = `sgk-ct-${l.id.slice(0, 8)}-${n + 1}`;
          const type = (q.type ?? a.type) as ExerciseType;
          const passage = q.passage ? { id: `ct-${l.id.slice(0, 8)}-${hash(q.passage.content).toString(36)}`, ...(q.passage.title ? { title: q.passage.title } : {}), content: q.passage.content } : q.speak ? { id, content: '', speak: q.speak } : undefined;
          return authoredChoice(id, { type, prompt: q.prompt ?? a.prompt, text: q.text || undefined, options: q.options, explain: q.explain, ...(passage ? { passage } : {}) });
        });
        how = 'soạn riêng';
        stat.authored++;
      } else if (/^Luyện Part 6:/.test(l.title)) {
        const set = PART6_SETS[p6++ % PART6_SETS.length];
        qs = set.questions.map((q) => authoredChoice(`sgk-p6-${q.no}`, { type: 'toeic-p6', prompt: 'Read the text and choose the best option for each blank.', text: `Question ${q.no}`, options: q.options, explain: q.explain, passage: { id: `p6-${set.questions[0].no}`, title: set.title, content: set.content } }));
        how = 'Part 6 đoạn riêng';
        stat.part++;
      } else if (cur.some((e) => e.type === 'toeic-p1')) {
        const want = cur.length;
        const pool = /người/.test(l.title) ? p1all.filter(isPeople) : /cảnh vật/.test(l.title) ? p1all.filter((q) => !isPeople(q)) : p1all;
        for (const q of pool) {
          if (qs.length >= want || takenBank.has(q.id)) continue;
          const e = p1ex(q, qs.length + 1);
          if (e && !used.has(keyOf(e))) (takenBank.add(q.id), qs.push(e));
        }
        how = 'Part 1 (ảnh trong ngân hàng đề thi thử)';
        stat.part++;
      } else if (cur.length && cur.every((e) => e.id.startsWith('sgk') && !e.id.startsWith('sgk-bank-')) && c.slug === 'on-thi-tot-nghiep-thpt') {
        qs = cur;
        how = 'đề luyện THPT soạn sẵn';
        stat.kept++;
      } else {
        // chủ đề: bài của chặng (CHECKPOINT: cả khoá tới đây; chặng chỉ có bài kiểm tra → các bài kể từ bài kiểm tra trước)
        const lastTest = flat.slice(0, i).map((x) => isTest(x.l.type)).lastIndexOf(true);
        const scope = (l.type === 'CHECKPOINT' ? flat.slice(0, i) : flat.slice(0, i).filter((x) => x.s.id === s.id)).filter((x) => !isTest(x.l.type));
        const titles = (scope.length ? scope : flat.slice(lastTest + 1, i).filter((x) => !isTest(x.l.type))).map((x) => x.l.title.toLowerCase());
        const tags = [...new Set(titles.flatMap((t) => TOPICS.find(([re]) => re.test(t))?.[1] ?? []))];
        const part5 = /^Luyện Part 5/.test(l.title);
        const vocabSection = /từ vựng/i.test(s.title);
        const vocabShare = part5 ? 0 : vocabSection && !tags.length ? 1 : titles.some((t) => /từ vựng|300 từ|từ thông dụng/.test(t)) || vocabSection ? (tags.length ? 0.4 : 0.7) : 0;
        const nVocab = Math.round(size * vocabShare);
        const grammarTags = part5 ? ['toeic-p5'] : tags.length ? tags : fallback;
        for (let k = 0; qs.length < nVocab && k < nVocab * 3; k++) {
          const e = pickTag(vocabTag, toeic, true);
          if (e) qs.push(e);
        }
        for (let k = 0, miss = 0; qs.length < size && miss < grammarTags.length * 2 + fallback.length; k++) {
          const e = pickTag(grammarTags[k % grammarTags.length], toeic, false) ?? pickTag(fallback[k % fallback.length], toeic, false);
          if (e) qs.push(e);
          else miss++;
        }
        how = `ngân hàng: ${part5 ? 'Part 5' : tags.length ? tags.map((t) => t.replace(/^grammar-/, '')).slice(0, 4).join(', ') : 'tổng hợp'}${nVocab ? ` + ${nVocab} từ vựng` : ''}`;
        stat.bank++;
      }
      // kiểm tra trùng toàn cục
      const dup = qs.filter((e) => used.has(keyOf(e)));
      if (dup.length) {
        const msg = `${c.slug} / ${l.title}: ${dup.length} câu trùng (vd trùng "${usedIn.get(keyOf(dup[0]))}")`;
        if (!DRY) throw new Error(msg);
        report.push(`! ${msg}`);
        continue;
      }
      const own = new Set(qs.map(keyOf));
      if (own.size !== qs.length) throw new Error(`${c.slug} / ${l.title}: có câu lặp trong chính đề`);
      qs.forEach((e) => mark(e, `${l.title} (${c.slug})`));
      if (qs.length < Math.min(size, cur.length || size)) stat.short++;
      if (process.argv.includes('--show') && how.startsWith('ngân hàng')) qs.slice(0, 3).forEach((e) => report.push(`      · ${e.text ?? e.prompt} [${e.options.join(' / ')}] ✓${e.options[e.answer]}`));
      report.push(`${c.slug.padEnd(24)} ${l.type === 'CHECKPOINT' ? 'C' : 'Q'} ${String(qs.length).padStart(2)} câu | ${l.title.slice(0, 48).padEnd(48)} | ${how}`);
      if (!DRY && !admin && qs.length)
        await prisma.lesson.update({
          where: { id: l.id },
          data: {
            exercises: qs as unknown as Prisma.InputJsonValue,
            passScorePct: l.passScorePct ?? 70,
            ...(how.startsWith('ngân hàng') || how === 'soạn riêng' ? { summary: `${qs.length} câu kiểm tra riêng của bài, đạt từ ${l.passScorePct ?? 70}% để mở bài tiếp theo.` } : {}),
          },
        });
    }
  }
  console.log(report.join('\n'));
  console.log(stat, DRY ? '(chạy thử, chưa ghi)' : '(đã ghi)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
