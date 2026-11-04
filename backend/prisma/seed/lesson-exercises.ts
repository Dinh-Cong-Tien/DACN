/**
 * Nạp bài tập cho khoá học (lessons.exercises):
 *  - Mỗi bài video: bài tập sinh từ kiến thức của chính bài (từ vựng, ngữ pháp, mạo từ a/an, âm phát âm).
 *  - Mỗi bài "Kiểm tra" (QUIZ / CHECKPOINT): câu hỏi lấy từ bài tập của các bài video trước nó trong chặng
 *    (CHECKPOINT: trong cả khoá tới vị trí đó); đặt điểm đạt 70% nếu chưa có.
 * Chạy: npx tsx prisma/seed/lesson-exercises.ts
 */
import { Prisma } from '@prisma/client';
import { prisma } from './lib';
import { toKnowledge } from '../../src/modules/catalog/lesson-knowledge';
import { buildExercises, buildSectionQuiz, poolOf, type LessonExercise } from '../../src/modules/catalog/lesson-exercises';

const QUIZ_SIZE = { QUIZ: 10, CHECKPOINT: 15 } as const;

async function main() {
  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
    include: { courseSectionCourses: { orderBy: { orderIndex: 'asc' }, include: { lessonSections: { where: { deletedAt: null }, orderBy: { orderIndex: 'asc' } } } } },
  });
  const all = courses.flatMap((c) => c.courseSectionCourses.flatMap((s) => s.lessonSections));
  const pool = poolOf(all.map((l) => toKnowledge(l.knowledge)).filter((k): k is NonNullable<typeof k> => !!k));

  const ex = new Map<string, LessonExercise[]>();
  const stat = { video: 0, videoEmpty: 0, questions: 0, quiz: 0, quizEmpty: 0 };
  const byType: Record<string, number> = {};

  for (const l of all) {
    if (l.type !== 'VIDEO') continue;
    const k = toKnowledge(l.knowledge);
    const qs = k ? buildExercises(l.id, k, pool) : [];
    ex.set(l.id, qs);
    stat.video++;
    if (!qs.length) stat.videoEmpty++;
    stat.questions += qs.length;
    qs.forEach((q) => (byType[q.type] = (byType[q.type] ?? 0) + 1));
    await prisma.lesson.update({ where: { id: l.id }, data: { exercises: qs.length ? (qs as unknown as Prisma.InputJsonValue) : Prisma.DbNull } });
  }

  for (const c of courses) {
    const flat = c.courseSectionCourses.flatMap((s) => s.lessonSections.map((l) => ({ l, sectionId: s.id })));
    for (const [i, { l, sectionId }] of flat.entries()) {
      if (l.type !== 'QUIZ' && l.type !== 'CHECKPOINT') continue;
      const before = flat.slice(0, i).filter((x) => x.l.type === 'VIDEO' && (l.type === 'CHECKPOINT' || x.sectionId === sectionId));
      // chặng không có video phía trước (bài kiểm tra đứng đầu chặng) → lấy chặng trước đó
      const src = before.length ? before : flat.slice(0, i).filter((x) => x.l.type === 'VIDEO').slice(-6);
      const qs = buildSectionQuiz(l.id, src.map((x) => ex.get(x.l.id) ?? []).filter((xs) => xs.length), QUIZ_SIZE[l.type]);
      stat.quiz++;
      if (!qs.length) stat.quizEmpty++;
      await prisma.lesson.update({
        where: { id: l.id },
        data: {
          exercises: qs.length ? (qs as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
          passScorePct: l.passScorePct ?? 70,
          // mô tả cũ ghi số câu không khớp → ghi lại theo đề thật
          ...(qs.length ? { summary: `${qs.length} câu ôn tập nội dung ${l.type === 'CHECKPOINT' ? 'các chặng đã học' : 'chặng vừa học'}, đạt từ ${l.passScorePct ?? 70}% để mở bài tiếp theo.` } : {}),
        },
      });
    }
  }
  console.log(stat, byType);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
