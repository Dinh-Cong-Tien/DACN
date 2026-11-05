/**
 * Bài luyện tập theo đề TOEIC trong khoá (trước đây là bài "video" chưa có video):
 *  - Part 1 / Part 2: câu thật trong ngân hàng (ảnh + audio), chỉ hiện lựa chọn (A)(B)(C)(D) như đề thật — lời thoại hiện trong giải thích.
 *  - Part 5: câu thật có giải thích tiếng Việt.
 *  - Part 6: 4 đoạn văn soạn mới (ngân hàng chỉ có bản dịch, không có văn bản gốc).
 * Đổi tên bài cho đúng số câu, xếp bài lý thuyết đứng trước bài luyện tương ứng.
 * Chạy: npx tsx prisma/seed/lesson-practice.ts
 */
import { Prisma, type Question } from '@prisma/client';
import { prisma } from './lib';
import { authoredChoice, type LessonExercise } from '../../src/modules/catalog/lesson-exercises';
import { PART6_SETS } from './data/toeic-part6';

const KEYS = ['A', 'B', 'C', 'D'];
type Opt = { key: string; text: string };
const optsOf = (q: Question) => ((q.options as Opt[] | null) ?? []).filter((o) => o && o.key);
const keyOf = (q: Question) => ((q.correctAnswer as { keys?: string[]; key?: string } | null)?.keys?.[0] ?? (q.correctAnswer as { key?: string } | null)?.key ?? '');
const json = (v: unknown) => v as Prisma.InputJsonValue;

/** Câu nghe Part 1 / 2: lựa chọn chỉ là chữ cái, lời thoại nằm trong giải thích */
function listening(q: Question, part: 1 | 2, no: number): LessonExercise | null {
  const opts = optsOf(q);
  const key = keyOf(q);
  if (!q.audioUrl || opts.length < 3 || !key) return null;
  const letters = opts.map((o) => `(${o.key})`);
  const right = opts.find((o) => o.key === key);
  const script = [part === 2 ? `Câu hỏi: ${q.stem}` : null, ...opts.map((o) => `(${o.key}) ${o.text}`)].filter(Boolean).join('\n');
  return {
    id: `sgk-bank-${q.id}`,
    type: part === 1 ? 'toeic-p1' : 'toeic-p2',
    prompt: part === 1 ? 'Look at the picture and listen to the four statements. Choose the one that best describes the picture.' : 'Listen to the question or statement and the three responses. Choose the best response.',
    text: `Question ${no}`,
    options: letters,
    answer: opts.findIndex((o) => o.key === key),
    explain: `Lời thoại:\n${script}\n\nĐáp án: (${key}) ${right?.text ?? ''}`,
    passage: { id: `q-${q.id}`, content: '', ...(q.imageUrl ? { imageUrl: q.imageUrl } : {}), audioUrl: q.audioUrl },
  };
}

/** Câu Part 5: giữ đúng thứ tự (A)–(D) vì giải thích nhắc theo chữ cái */
function part5(q: Question): LessonExercise | null {
  const opts = optsOf(q);
  const i = opts.findIndex((o) => o.key === keyOf(q));
  if (opts.length !== 4 || i < 0 || !q.explanationMd) return null;
  return { id: `sgk-bank-${q.id}`, type: 'toeic-p5', prompt: 'Choose the word or phrase that best completes the sentence.', text: q.stem, options: opts.map((o) => `(${o.key}) ${o.text}`), answer: i, explain: q.explanationMd };
}

const PEOPLE = /^(the|a|an|some|two|several|one of the|both)?\s*(wom[ae]n|m[ae]n|people|person|workers?|customers?|shoppers?|passengers?|employees?|chefs?|girl|boy|children|they|he|she|cyclists?|diners?|musicians?)\b/i;
const isPeople = (q: Question) => optsOf(q).filter((o) => PEOPLE.test(o.text)).length >= 2;
const WH = /^(who|what|when|where|why|how|which|whose)\b/i;

/** Tên mới (đúng số câu) + cách lấy câu cho từng bài luyện */
type Plan = { title: string; summary: string; pick: () => Promise<LessonExercise[]> };

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { deletedAt: null, section: { course: { slug: { in: ['toeic-part-1-2', 'toeic-part-5-6'] } } } },
    include: { section: true },
    orderBy: [{ section: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
  });
  const used = new Set<string>();
  const take = <T extends { id: string }>(xs: T[], n: number) => {
    const out: T[] = [];
    for (const x of xs) if (!used.has(x.id) && out.length < n) (used.add(x.id), out.push(x));
    return out;
  };
  const byId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);

  const p1 = (await prisma.question.findMany({ where: { part: 'TOEIC_P1', status: 'PUBLISHED', imageUrl: { not: null }, audioUrl: { not: null } } })).sort(byId);
  const p2 = (await prisma.question.findMany({ where: { part: 'TOEIC_P2', status: 'PUBLISHED', audioUrl: { not: null } } })).sort(byId);
  const p5 = (await prisma.question.findMany({ where: { part: 'TOEIC_P5', status: 'PUBLISHED', explanationMd: { not: null } } })).sort(byId);

  const listen = (qs: Question[], part: 1 | 2) => qs.map((q, i) => listening(q, part, i + 1)).filter((x): x is LessonExercise => !!x);
  let p5no = 0;
  let p6no = 0;
  const plans: [RegExp, () => Plan][] = [
    [/^(Tranh tả người \(4 bài|Luyện tập: Tranh tả người)/i, () => ({ title: 'Luyện tập: Tranh tả người', summary: '10 câu Part 1 thật, tranh có người: nghe 4 câu mô tả, chọn câu đúng', pick: async () => listen(take(p1.filter(isPeople), 10), 1) })],
    [/^(Tranh tả cảnh vật \(4 bài|Luyện tập: Tranh tả cảnh vật)/i, () => ({ title: 'Luyện tập: Tranh tả cảnh vật', summary: '10 câu Part 1 thật, tranh cảnh vật / đồ vật', pick: async () => listen(take(p1.filter((q) => !isPeople(q)), 10), 1) })],
    [/^(Luyện nghe tranh tả cảnh vật|Luyện nghe: Tranh tả cảnh vật nâng cao)/i, () => ({ title: 'Luyện nghe: Tranh tả cảnh vật nâng cao', summary: '10 câu Part 1 thật về cảnh vật, đồ vật — nhận diện thể bị động và trạng thái', pick: async () => listen(take(p1.filter((q) => !isPeople(q)), 10), 1) })],
    [/^(Luyện tập TOEIC Part 1|Luyện tập tổng hợp Part 1)/i, () => ({ title: 'Luyện tập tổng hợp Part 1', summary: '10 câu Part 1 thật, trộn tranh người và cảnh vật', pick: async () => listen(take(p1, 10), 1) })],
    [/^(Luyện nghe chuyên sâu từng dạng câu hỏi \(175|Luyện nghe: Câu hỏi Wh-)/i, () => ({ title: 'Luyện nghe: Câu hỏi Wh-', summary: '15 câu Part 2 thật với Who / What / When / Where / Why / How', pick: async () => listen(take(p2.filter((q) => WH.test(q.stem)), 15), 2) })],
    [/^(Luyện nghe chuyên sâu từng dạng câu hỏi tiếp theo|Luyện nghe: Câu hỏi Yes\/No)/i, () => ({ title: 'Luyện nghe: Câu hỏi Yes/No, câu hỏi đuôi, câu trần thuật', summary: '15 câu Part 2 thật không bắt đầu bằng từ để hỏi', pick: async () => listen(take(p2.filter((q) => !WH.test(q.stem)), 15), 2) })],
    [/^(Luyện tập 20 đề TOEIC Part 2|Luyện tập tổng hợp Part 2)/i, () => ({ title: 'Luyện tập tổng hợp Part 2', summary: '25 câu Part 2 thật — đúng bằng một phần Part 2 trong đề', pick: async () => listen(take(p2, 25), 2) })],
    [
      /^(Câu 1\d\d[ -]1\d\d test|Luyện Part 5:)/i,
      () => {
        const n = p5no++;
        const from = 101 + (n % 3) * 10;
        return {
          title: `Luyện Part 5: câu ${from}–${from + 9} (đề ${Math.floor(n / 3) + 1})`,
          summary: '10 câu Part 5 thật, có giải thích tiếng Việt từng câu',
          pick: async () => take(p5, 10).map(part5).filter((x): x is LessonExercise => !!x),
        };
      },
    ],
    [
      /^(part 6 test 1 bài \d|Luyện Part 6:)/i,
      () => {
        const set = PART6_SETS[p6no++ % PART6_SETS.length];
        return {
          title: `Luyện Part 6: ${({ 'e-mail': 'email', notice: 'thông báo', advertisement: 'quảng cáo', memo: 'thư nội bộ' } as Record<string, string>)[set.title.match(/following (.+)\.$/)?.[1] ?? ''] ?? 'đoạn văn'} (câu ${set.questions[0].no}–${set.questions[3].no})`,
          summary: '1 đoạn văn Part 6, 4 câu (có 1 câu điền nguyên câu), có giải thích',
          pick: async () =>
            set.questions.map((q) =>
              authoredChoice(`sgk-p6-${q.no}`, { type: 'toeic-p6', prompt: 'Read the text and choose the best option for each blank.', text: `Question ${q.no}`, options: q.options, explain: q.explain, passage: { id: `p6-${set.questions[0].no}`, title: set.title, content: set.content } })
            ),
        };
      },
    ],
  ];

  const done: string[] = [];
  for (const l of lessons) {
    // tên bài có thể lưu dạng dấu tách rời (NFD) → chuẩn hoá trước khi so khớp
    const name = l.title.normalize('NFC');
    const hit = plans.find(([re]) => re.test(name));
    if (!hit) continue;
    const plan = hit[1]();
    const exercises = await plan.pick();
    if (!exercises.length) {
      done.push(`! không đủ câu: ${l.title}`);
      continue;
    }
    await prisma.lesson.update({
      where: { id: l.id },
      data: { title: plan.title.startsWith('Luyện Part') ? plan.title : `${plan.title} (${exercises.length} câu)`, summary: plan.summary.replace(/^\d+ câu/, `${exercises.length} câu`), type: 'QUIZ', videoUrl: null, status: 'PUBLISHED', exercises: json(exercises), passScorePct: 60, durationMin: Math.max(8, exercises.length * 1), knowledge: Prisma.DbNull, isFreePreview: false },
    });
    done.push(`${plan.title} — ${exercises.length} câu`);
  }

  // bài lý thuyết "X" đứng trước bài luyện tương ứng "Luyện tập: X (…)"
  for (const sec of await prisma.courseSection.findMany({ where: { course: { slug: 'toeic-part-1-2' } }, include: { lessonSections: { where: { deletedAt: null }, orderBy: { orderIndex: 'asc' } } } })) {
    const list = [...sec.lessonSections];
    for (const t of list.filter((l) => l.type !== 'QUIZ')) {
      const pi = list.findIndex((l) => l.type === 'QUIZ' && l.title.normalize('NFC').includes(`: ${t.title.normalize('NFC')} (`));
      const ti = list.indexOf(t);
      if (pi >= 0 && pi < ti) {
        list.splice(ti, 1);
        list.splice(pi, 0, t);
      }
    }
    await prisma.lesson.updateMany({ where: { sectionId: sec.id }, data: { orderIndex: { increment: 500 } } });
    for (const [i, l] of list.entries()) await prisma.lesson.update({ where: { id: l.id }, data: { orderIndex: i } });
  }
  console.log(done.join('\n'));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
