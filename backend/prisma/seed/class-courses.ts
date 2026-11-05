/**
 * Gắn lớp học vào khoá học (lớp nằm trong khoá): lớp chưa có khoá → khoá theo tên lớp, không khớp thì khoá nền tảng
 * cùng mục. Học viên đang trong lớp được ghi danh khoá đó (giữ tiến độ nếu đã học). Chạy lại không đổi lớp đã gắn khoá.
 * Gọi ở cuối course-tracks.ts; chạy riêng: npx tsx prisma/seed/class-courses.ts
 */
import { prisma } from './lib';
import { enrollClassCourse } from '../../src/modules/catalog/class-track';

/** Tên lớp (biểu thức) → slug khoá học */
const BY_NAME: [RegExp, string][] = [
  [/foundation|nền tảng|ngữ pháp nền tảng|500\+/i, 'nen-tang-toeic'],
  [/650\+/i, 'toeic-part-5-6'],
  [/850|intensive/i, 'toeic-part-7'],
  [/phát âm/i, 'toeic-phat-am'],
  [/vstep.*b1|cấp tốc/i, 'nen-tang-vstep'],
  [/vstep.*b2/i, 'vstep-ngu-phap'],
  [/c1|học thuật.*viết|writing/i, 'vstep-writing'],
  [/từ vựng học thuật|reading/i, 'vstep-reading'],
  [/lớp 10|10a|\b10\b/i, 'tieng-anh-lop-10'],
  [/lớp 11|11a|\b11\b/i, 'tieng-anh-lop-11'],
  [/ôn thi|tốt nghiệp/i, 'on-thi-tot-nghiep-thpt'],
  [/lớp 12|12a|\b12\b/i, 'tieng-anh-lop-12'],
];
const FALLBACK: Record<string, string> = { TOEIC: 'nen-tang-toeic', VSTEP: 'nen-tang-vstep', THPT: 'tieng-anh-lop-10' };

export async function linkClassCourses(): Promise<string[]> {
  const courses = await prisma.course.findMany({ where: { deletedAt: null, status: 'PUBLISHED' }, select: { id: true, slug: true, title: true, track: true, examType: true } });
  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  const out: string[] = [];
  for (const cl of await prisma.class.findMany({ where: { deletedAt: null, courseId: null } })) {
    const track = cl.track ?? cl.examType;
    const slug = BY_NAME.find(([re, s]) => re.test(cl.name) && (bySlug.get(s)?.track ?? track) === track)?.[1] ?? FALLBACK[track];
    const course = bySlug.get(slug);
    if (!course) continue;
    await prisma.$transaction(async (tx) => {
      await tx.class.update({ where: { id: cl.id }, data: { courseId: course.id, track: course.track ?? track } });
      const members = await tx.classMember.findMany({ where: { classId: cl.id, status: 'ACTIVE' }, select: { studentId: true } });
      await enrollClassCourse(tx, course.id, members.map((m) => m.studentId));
    });
    out.push(`Lớp ${cl.name} → ${course.title}`);
  }
  return out;
}

if (require.main === module)
  linkClassCourses()
    .then((r) => console.log(r.join('\n') || 'Không có lớp cần gắn khoá'))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
