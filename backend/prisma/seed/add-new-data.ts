/**
 * Nạp BỔ SUNG dữ liệu thật mới vào CSDL đang chạy — không xoá dữ liệu hiện có (khác index.ts là truncate + nạp lại).
 * Chạy: npx tsx prisma/seed/add-new-data.ts   (chạy lại nhiều lần không tạo trùng)
 *  - examenglish: luyện TOEIC theo Part có audio/ảnh thật
 *  - englishteststore Vocabulary Tests: từ vựng TOEIC, từ vựng cơ bản, trọng âm, động từ bất quy tắc
 *  - englishteststore Grammar Tests: phần còn lại trước đây bị giới hạn 40 câu/file
 */
import type { ExamType, SkillType } from '@prisma/client';
import { insertMany, log, prisma, uuid } from './lib';
import type { SeedCtx } from './base';
import { importGrammarExercises, importVocabQuiz } from './import-data';
import { importExamEnglish } from './import-examenglish';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

async function ctxFromDb(): Promise<SeedCtx> {
  const [admin, head, tagRows, rubricRows] = await Promise.all([
    prisma.user.findFirst({ where: { role: 'ADMIN', deletedAt: null }, orderBy: { createdAt: 'asc' } }),
    prisma.user.findFirst({ where: { role: 'HEAD_TEACHER', deletedAt: null }, orderBy: { createdAt: 'asc' } }),
    prisma.skillTag.findMany({ select: { id: true, slug: true } }),
    prisma.rubric.findMany({ select: { id: true, code: true } }),
  ]);
  if (!admin || !head) throw new Error('CSDL chưa có tài khoản quản trị / trưởng bộ môn — chạy seed đầy đủ trước');
  const tags = new Map(tagRows.map((t) => [t.slug, t.id]));
  const pending: any[] = [];
  return {
    userByName: new Map(),
    depts: new Map(),
    tags,
    rubrics: new Map(rubricRows.map((r) => [r.code, r.id])),
    adminId: admin.id,
    headId: head.id,
    addTag: (slug: string, name: string, skill: SkillType, examType: ExamType | null, parentId?: string) => {
      if (tags.has(slug)) return tags.get(slug)!;
      const id = uuid();
      tags.set(slug, id);
      pending.push({ id, slug, name, skill, examType, parentId });
      return id;
    },
    flushTags: async () => {
      const rows = pending.splice(0);
      await insertMany(prisma.skillTag, rows.filter((t) => !t.parentId));
      await insertMany(prisma.skillTag, rows.filter((t) => t.parentId));
    },
  } as SeedCtx;
}

async function main() {
  const ctx = await ctxFromDb();

  if (await prisma.mockTest.findUnique({ where: { slug: 'examenglish-toeic-luyen-theo-part' } })) log('examenglish: đã có, bỏ qua');
  else await importExamEnglish(ctx);

  const vocabTag = ctx.tags.get('vocab-toeic');
  if (vocabTag && (await prisma.question.count({ where: { tagIds: { has: vocabTag } } }))) log('vocabulary quiz: đã có, bỏ qua');
  else await importVocabQuiz(ctx);

  // Ngữ pháp: ghép tên file bài tập với chủ điểm như seedGrammar, bỏ đề đã có
  const topics = await prisma.grammarTopic.findMany({ select: { title: true, tagId: true } });
  const englishKey = topics
    .map((t) => ({ key: norm(/\(([^)]+)\)/.exec(t.title)?.[1] ?? (/^[A-Za-z ]+$/.test(t.title) ? t.title : '')), tagId: t.tagId! }))
    .filter((e) => e.key && e.tagId);
  const topicTagByKey = (fileTitle: string) => {
    const k = norm(fileTitle);
    return englishKey.find((e) => e.key === k)?.tagId ?? englishKey.find((e) => k.includes(e.key) && e.key.split(' ').length >= 2)?.tagId;
  };
  const existing = await prisma.question.findMany({ where: { skill: 'GRAMMAR', source: 'IMPORT', deletedAt: null }, select: { stem: true } });
  await importGrammarExercises(ctx, topicTagByKey, new Set(existing.map((q) => q.stem)));

  // Cập nhật số câu theo nhãn + thống kê câu hỏi
  await prisma.$executeRawUnsafe(`UPDATE skill_tags t SET questions_count = (SELECT count(*) FROM questions q WHERE q.deleted_at IS NULL AND t.id = ANY(q.tag_ids))`);
  await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_question_stats`);
  const total = await prisma.question.count({ where: { deletedAt: null } });
  log('Xong. Tổng câu hỏi hiện có:', total);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
