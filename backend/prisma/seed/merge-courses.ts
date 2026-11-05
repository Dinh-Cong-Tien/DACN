/**
 * Khoá học trọn gói như khoá học thật: mỗi kỳ thi (TOEIC, VSTEP) một khoá chứa đủ bài giảng / bài tập từ nền tảng tới
 * từng phần thi — các khoá nhỏ trước đây (Nền tảng, Phát âm, Part 1–2…) thành các chặng bên trong.
 * Giữ nguyên bài học + tiến độ (theo bài), chuyển lớp học, ghi danh, bài giao, chứng chỉ sang khoá gộp; khoá nhỏ lưu trữ
 * (đường dẫn cũ tự chuyển sang khoá gộp — OLD_SLUG ở catalog/courses.ts). Chạy lại không đổi gì thêm.
 * Gọi ở cuối course-tracks.ts; chạy riêng: npx tsx prisma/seed/merge-courses.ts
 */
import { Prisma, type CourseCategory, type CourseTrack } from '@prisma/client';
import { prisma } from './lib';

type Merge = { slug: string; keep: string; title: string; description: string; track: CourseTrack; category: CourseCategory; stages: [string, string][] };

export const MERGES: Merge[] = [
  {
    slug: 'luyen-thi-toeic',
    keep: 'nen-tang-toeic',
    title: 'Luyện thi TOEIC toàn diện',
    description: 'Lộ trình trọn gói từ nền tảng tới đủ 7 Part: ngữ pháp, từ vựng công việc, phát âm, nghe tranh và hỏi – đáp, hội thoại, bài nói, hoàn thành câu, đọc hiểu — mỗi bài có bài tập, luyện câu đề thật.',
    track: 'TOEIC',
    category: 'EXAM_PREP',
    stages: [
      ['nen-tang-toeic', 'Nền tảng tiếng Anh công việc'],
      ['toeic-phat-am', 'Phát âm cho Listening'],
      ['toeic-part-1-2', 'Part 1–2 · Mô tả tranh, Hỏi – đáp'],
      ['toeic-part-3-4', 'Part 3–4 · Hội thoại, Bài nói ngắn'],
      ['toeic-part-5-6', 'Part 5–6 · Ngữ pháp, Hoàn thành câu'],
      ['toeic-part-7', 'Part 7 · Đọc hiểu'],
    ],
  },
  {
    slug: 'luyen-thi-vstep',
    keep: 'nen-tang-vstep',
    title: 'Luyện thi VSTEP toàn diện',
    description: 'Lộ trình trọn gói A2 → B2 cho đủ 4 kỹ năng: nền tảng, ngữ pháp, Nghe Part 1–3, Đọc, Viết Task 1–2, Nói Part 1–3 — mỗi bài có bài tập theo dạng đề VSTEP.',
    track: 'VSTEP',
    category: 'EXAM_PREP',
    stages: [
      ['nen-tang-vstep', 'Nền tảng tiếng Anh'],
      ['vstep-ngu-phap', 'Ngữ pháp A2 → B2'],
      ['vstep-listening', 'Nghe · Listening Part 1–3'],
      ['vstep-reading', 'Đọc · Reading'],
      ['vstep-writing', 'Viết · Writing Task 1–2'],
      ['vstep-speaking', 'Nói · Speaking Part 1–3'],
    ],
  },
];

/** slug khoá nhỏ cũ → slug khoá gộp */
export const MERGED_SLUG: Record<string, string> = Object.fromEntries(MERGES.flatMap((m) => m.stages.map(([s]) => [s, m.slug])));

export async function mergeCourses(): Promise<string[]> {
  const log: string[] = [];
  for (const m of MERGES) {
    const target = (await prisma.course.findFirst({ where: { slug: m.slug, deletedAt: null } })) ?? (await prisma.course.findFirst({ where: { slug: m.keep, deletedAt: null } }));
    if (!target) continue;
    const sources = (await prisma.course.findMany({ where: { slug: { in: m.stages.map(([s]) => s) }, deletedAt: null, id: { not: target.id } } })).sort(
      (a, b) => m.stages.findIndex(([s]) => s === a.slug) - m.stages.findIndex(([s]) => s === b.slug)
    );
    const targetSlugBefore = target.slug;

    await prisma.$transaction(
      async (tx) => {
        // 1) chương: khoá nhỏ → chặng (part_title) của khoá gộp, theo đúng thứ tự lộ trình
        if (sources.length) {
          const bySlug = new Map([...sources, target].map((c) => [c.id === target.id ? targetSlugBefore : c.slug, c]));
          await tx.courseSection.updateMany({ where: { courseId: { in: [target.id, ...sources.map((s) => s.id)] } }, data: { orderIndex: { increment: 1000 } } });
          let order = 0;
          for (const [k, [slug, stage]] of m.stages.entries()) {
            const c = bySlug.get(slug);
            if (!c) continue;
            const secs = await tx.courseSection.findMany({ where: { courseId: c.id }, orderBy: { orderIndex: 'asc' } });
            for (const s of secs) await tx.courseSection.update({ where: { id: s.id }, data: { courseId: target.id, orderIndex: order++, partNo: k + 1, partTitle: `Chặng ${k + 1} · ${stage}` } });
          }
        }

        // 2) lớp học, bài giao "Bài giảng", chứng chỉ, ghi danh → khoá gộp
        const srcIds = sources.map((s) => s.id);
        if (srcIds.length) {
          await tx.class.updateMany({ where: { courseId: { in: srcIds } }, data: { courseId: target.id } });
          await tx.certificate.updateMany({ where: { courseId: { in: srcIds } }, data: { courseId: target.id } });
          for (const a of await tx.assignment.findMany({ where: { type: 'LESSON', targetId: { in: srcIds } } })) {
            const cfg = (a.targetConfig ?? {}) as Record<string, unknown>;
            await tx.assignment.update({ where: { id: a.id }, data: { targetId: target.id, targetConfig: { ...cfg, courseId: m.slug } as Prisma.InputJsonObject } });
          }
          const has = new Set((await tx.courseEnrollment.findMany({ where: { courseId: target.id }, select: { userId: true } })).map((e) => e.userId));
          for (const e of await tx.courseEnrollment.findMany({ where: { courseId: { in: srcIds } }, orderBy: { createdAt: 'asc' } })) {
            if (has.has(e.userId)) await tx.courseEnrollment.delete({ where: { id: e.id } });
            else {
              await tx.courseEnrollment.update({ where: { id: e.id }, data: { courseId: target.id } });
              has.add(e.userId);
            }
          }
          // khoá nhỏ: lưu trữ (giữ slug để đường dẫn cũ chuyển sang khoá gộp)
          await tx.course.updateMany({ where: { id: { in: srcIds } }, data: { deletedAt: new Date(), status: 'ARCHIVED' } });
        }

        // 3) thông tin khoá gộp
        await tx.course.update({
          where: { id: target.id },
          data: { slug: m.slug, title: m.title, description: m.description, track: m.track, trackGroup: 'Lộ trình trọn gói', trackOrder: 1, category: m.category, examType: m.track === 'THPT' ? null : m.track, level: null, isSequential: true, status: 'PUBLISHED' },
        });

        // 4) số liệu: bài học, học thử 2 bài đầu, % hoàn thành của từng học viên
        const lessons = await tx.lesson.findMany({ where: { deletedAt: null, section: { courseId: target.id } }, orderBy: [{ section: { orderIndex: 'asc' } }, { orderIndex: 'asc' }], select: { id: true, status: true, durationMin: true, isFreePreview: true } });
        const published = lessons.filter((l) => l.status === 'PUBLISHED');
        for (const [i, l] of published.entries()) if (l.isFreePreview !== i < 2) await tx.lesson.update({ where: { id: l.id }, data: { isFreePreview: i < 2 } });
        const ids = published.map((l) => l.id);
        for (const e of await tx.courseEnrollment.findMany({ where: { courseId: target.id } })) {
          const done = new Set((await tx.lessonProgress.findMany({ where: { userId: e.userId, lessonId: { in: ids }, status: 'COMPLETED' }, select: { lessonId: true } })).map((p) => p.lessonId));
          const pct = ids.length ? Math.round((done.size / ids.length) * 10000) / 100 : 0;
          await tx.courseEnrollment.update({ where: { id: e.id }, data: { progressPct: pct, currentLessonId: ids.find((id) => !done.has(id)) ?? ids.at(-1) ?? null, completedAt: pct >= 100 ? (e.completedAt ?? new Date()) : null } });
        }
        await tx.course.update({
          where: { id: target.id },
          data: { lessonsCount: lessons.length, durationMin: lessons.reduce((t, l) => t + l.durationMin, 0), studentsCount: await tx.courseEnrollment.count({ where: { courseId: target.id } }) },
        });
      },
      { timeout: 120_000 }
    );
    if (sources.length) log.push(`${m.title}: gộp ${sources.length + 1} khoá → ${m.stages.length} chặng`);
  }
  return log;
}

if (require.main === module)
  mergeCourses()
    .then((r) => console.log(r.join('\n') || 'Khoá học đã gộp sẵn'))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
