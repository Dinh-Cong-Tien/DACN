/**
 * Xuất danh sách bài cần viết nội dung (bài "video" trỏ video mẫu hỏng + bài nháp chưa có video) kèm ngữ cảnh lộ trình,
 * chia thành nhiều phần để soạn song song. Bài luyện tập dùng câu hỏi ngân hàng (PRACTICE) không xuất ở đây.
 * Chạy: npx tsx prisma/seed/lesson-content-export.ts <thư-mục-ra> <số-phần>
 */
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from './lib';

/** Bài luyện tập theo đề (dùng câu thật trong ngân hàng) — xử lý ở lesson-practice.ts */
export const PRACTICE = /^(Câu 1\d\d[ -]1\d\d test|part 6 test|Luyện tập TOEIC Part 1|Luyện nghe chuyên sâu|Luyện tập 20 đề TOEIC Part 2|Tranh tả người \(4 bài|Tranh tả cảnh vật \(4 bài|Luyện nghe tranh tả cảnh vật)/i;

async function main() {
  const [outDir, nArg, mode] = process.argv.slice(2);
  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
    include: { courseSectionCourses: { orderBy: { orderIndex: 'asc' }, include: { lessonSections: { where: { deletedAt: null }, orderBy: { orderIndex: 'asc' } } } } },
  });
  const items: unknown[] = [];
  for (const c of courses) {
    const flat = c.courseSectionCourses.flatMap((s) => s.lessonSections.map((l) => ({ l, s })));
    flat.forEach(({ l, s }, i) => {
      const broken = l.videoUrl?.includes('googleapis') || l.status !== 'PUBLISHED';
      // chế độ "thin": bài học viết còn mỏng (chỉ có đoạn giới thiệu ngắn) — vd khoá THPT
      const thin = l.type === 'READING' && (l.contentMd?.length ?? 0) < 800;
      if (!(mode === 'thin' ? thin : broken) || l.type === 'QUIZ' || l.type === 'CHECKPOINT' || PRACTICE.test(l.title)) return;
      const k = (l.knowledge ?? {}) as Record<string, { title?: string; word?: string }[]>;
      items.push({
        id: l.id,
        course: c.title,
        track: c.track,
        level: c.level,
        section: s.title,
        part: s.partTitle,
        title: l.title,
        prev: flat[i - 1]?.l.title ?? null,
        next: flat[i + 1]?.l.title ?? null,
        // gợi ý từ kiến thức đang có (có thể dùng chung với bài khác — chỉ để tham khảo)
        // nội dung đang có (THPT: kiến thức bám SGK — bài giảng phải khớp đúng các từ / điểm ngữ pháp này)
        ...(mode === 'thin' ? { current: { summary: l.summary, content: l.contentMd, knowledge: l.knowledge } } : {}),
        hint: {
          grammar: (k.grammar ?? []).map((g) => g.title),
          vocab: (k.vocab ?? []).map((v) => v.word),
          pronunciation: (k.pronunciation ?? []).map((p) => p.title),
        },
      });
    });
  }
  const n = Number(nArg ?? 9);
  const size = Math.ceil(items.length / n);
  fs.mkdirSync(outDir, { recursive: true });
  for (let i = 0; i < n; i++) fs.writeFileSync(path.join(outDir, `lessons${i + 1}.json`), JSON.stringify(items.slice(i * size, (i + 1) * size), null, 1));
  console.log(items.length, 'bài →', n, 'phần');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
