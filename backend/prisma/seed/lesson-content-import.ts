/**
 * Nạp bài học đã soạn (lessonsN.out.json): nội dung viết, kiến thức riêng, 6 câu bài tập riêng cho từng bài.
 *  - Bài "video" trỏ video mẫu hỏng / bài nháp chưa có video → bài học viết (READING), xuất bản; gắn video thật sau thì đổi lại VIDEO.
 *  - Bản dịch English của chuỗi ngắn → frontend/src/shared/i18n/locales/en/lessons.ts
 *  - Bài học thử: mỗi khoá 2 bài đầu.
 * Chạy: npx tsx prisma/seed/lesson-content-import.ts [thư-mục] (mặc định prisma/seed/data/lessons — nội dung đã soạn lưu trong repo)
 */
import fs from 'node:fs';
import path from 'node:path';
import { Prisma } from '@prisma/client';
import { prisma } from './lib';
import { authoredChoice, type ExerciseType } from '../../src/modules/catalog/lesson-exercises';
import type { LessonKnowledge } from '../../src/modules/catalog/lesson-knowledge';
import { articleTree } from './data/lesson-knowledge/articles';

type Out = {
  id: string;
  /** tên khoá + tên bài lúc soạn — dùng khi id đổi (dựng lại CSDL) */
  course?: string;
  title?: string;
  summary: string;
  contentMd: string;
  knowledge: Partial<LessonKnowledge>;
  exercises: { prompt: string; q: string; options: string[]; explain: string }[];
  en?: Record<string, string>;
};
const json = (v: unknown) => v as Prisma.InputJsonValue;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

async function main() {
  const dir = process.argv[2] ?? path.join(__dirname, 'data/lessons');
  const files = fs.readdirSync(dir).filter((f) => /^lessons\d+\.out\.json$/.test(f));
  const en: Record<string, string> = {};
  const problems: string[] = [];
  let ok = 0;
  for (const f of files) {
    const items = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Out[];
    for (const it of items) {
      // tìm theo id; CSDL dựng lại (id mới) thì tìm theo tên khoá + tên bài
      const inc = { section: { include: { course: true } } } as const;
      const l =
        (await prisma.lesson.findUnique({ where: { id: it.id }, include: inc })) ??
        (it.title && it.course ? await prisma.lesson.findFirst({ where: { deletedAt: null, title: it.title, section: { course: { title: it.course } } }, include: inc }) : null);
      if (!l) {
        problems.push(`${f}: không thấy bài ${it.id}`);
        continue;
      }
      // bài đã thành bài luyện đề (câu thật trong ngân hàng, lesson-practice.ts) → giữ nguyên
      if (l.type === 'QUIZ') {
        problems.push(`${f}: bỏ qua bài luyện đề — ${l.title}`);
        continue;
      }
      if (!it.contentMd || words(it.contentMd) < 300 || !Array.isArray(it.exercises) || it.exercises.length < 4) {
        problems.push(`${f}: nội dung thiếu — ${l.title}`);
        continue;
      }
      const k: LessonKnowledge = {
        grammar: it.knowledge.grammar ?? [],
        pronunciation: it.knowledge.pronunciation ?? [],
        phrases: it.knowledge.phrases ?? [],
        tips: it.knowledge.tips ?? [],
        vocab: it.knowledge.vocab ?? [],
        clauses: it.knowledge.clauses ?? [],
        articles: [],
      };
      k.articles = articleTree(k);
      // THPT: giữ kiến thức bám SGK đã soạn (từ vựng / ngữ pháp theo Unit), chỉ thêm bài giảng viết + bài tập
      const keepKnowledge = l.section.course.track === 'THPT' && l.knowledge;
      // nhãn câu bài tập theo loại bài
      const type: ExerciseType = k.pronunciation.length && !k.grammar.length ? 'phoneme' : k.vocab.length > k.grammar.length ? 'vocab-meaning' : 'grammar-gap';
      const exercises = it.exercises
        .filter((e) => e && Array.isArray(e.options) && e.options.length >= 2 && new Set(e.options).size === e.options.length)
        .map((e, i) => authoredChoice(`sgk-les-${l.id.slice(0, 8)}-${i + 1}`, { type, prompt: e.prompt, text: e.q, options: e.options, explain: e.explain }));
      // câu luyện soạn sẵn trước đó (vd câu điền chỗ trống theo Unit SGK) giữ ở đầu
      const earlier = ((l.exercises as { id?: string }[] | null) ?? []).filter((e) => e.id?.startsWith('sgk') && !e.id.startsWith('sgk-les'));
      await prisma.lesson.update({
        where: { id: l.id },
        data: {
          type: 'READING',
          videoUrl: null,
          status: 'PUBLISHED',
          summary: it.summary.slice(0, 300),
          contentMd: it.contentMd,
          knowledge: keepKnowledge ? (l.knowledge as Prisma.InputJsonValue) : json(k),
          exercises: json([...earlier, ...exercises]),
          durationMin: Math.max(10, Math.round(words(it.contentMd) / 120) + exercises.length),
        },
      });
      Object.assign(en, it.en ?? {});
      ok++;
    }
  }

  // bài học thử: 2 bài đầu mỗi khoá (trước đây có khoá để cả 14 bài học thử)
  for (const c of await prisma.course.findMany({ where: { deletedAt: null }, include: { courseSectionCourses: { orderBy: { orderIndex: 'asc' }, include: { lessonSections: { where: { deletedAt: null, status: 'PUBLISHED' }, orderBy: { orderIndex: 'asc' } } } } } })) {
    const flat = c.courseSectionCourses.flatMap((s) => s.lessonSections);
    for (const [i, l] of flat.entries()) if (l.isFreePreview !== i < 2) await prisma.lesson.update({ where: { id: l.id }, data: { isFreePreview: i < 2 } });
  }

  // bản dịch English (giữ bản cũ, thêm bản mới)
  const file = path.resolve(__dirname, '../../../frontend/src/shared/i18n/locales/en/lessons.ts');
  let prev: Record<string, string> = {};
  if (fs.existsSync(file)) {
    const m = /= (\{[\s\S]*\});\s*$/.exec(fs.readFileSync(file, 'utf8'));
    if (m) prev = JSON.parse(m[1]);
  }
  const merged = { ...prev, ...Object.fromEntries(Object.entries(en).filter(([k, v]) => k && v && /[^\x00-\x7F]/.test(k))) };
  fs.writeFileSync(
    file,
    `/** English — chuỗi ngắn của bài học viết (tóm tắt, tiêu đề / ghi chú kiến thức, yêu cầu bài tập); sinh bởi prisma/seed/lesson-content-import.ts */\nexport const LESSONS_EN: Record<string, string> = ${JSON.stringify(merged, null, 2)};\n`
  );
  console.log(`nạp ${ok} bài · ${Object.keys(merged).length} câu dịch`);
  if (problems.length) console.log(problems.join('\n'));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
