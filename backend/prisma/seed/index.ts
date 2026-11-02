/**
 * Seed CSDL OrbiLingo: xoá sạch rồi nạp lại (idempotent).
 *   npx tsx prisma/seed/index.ts      (hoặc: npx prisma db seed)
 * Nguồn: dữ liệu nền (mục 10.13) + nội dung biên tập của web (data/mocks.json) + dữ liệu thật trong SEED_DATA_DIR.
 * Không tạo dữ liệu hoạt động giả (bài làm, điểm, XP, streak…): các bảng đó được ghi khi người dùng dùng hệ thống.
 */
import { DEMO_PASSWORD, seedBase } from './base';
import { seedCourses, seedGrammar, seedVstep } from './content';
import { importDictation, importGrammarExercises, importReading, importSpeaking, importToeicTests, importVideoCourse, importVocabulary, importWriting } from './import-data';
import { DATA_DIR, exists, log, prisma } from './lib';

async function truncateAll() {
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (rows.length) await prisma.$executeRawUnsafe(`TRUNCATE ${rows.map((r) => `"${r.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`);
}

async function refreshCaches() {
  // Số câu theo nhãn kỹ năng, tổng câu của đề
  await prisma.$executeRawUnsafe(`UPDATE skill_tags t SET questions_count = (SELECT count(*) FROM questions q WHERE t.id = ANY (q.tag_ids) AND q.deleted_at IS NULL)`);
  await prisma.$executeRawUnsafe(`UPDATE mock_tests m SET total_questions = (SELECT count(*) FROM mock_test_questions x WHERE x.test_id = m.id)`);
  await prisma.$executeRawUnsafe(`UPDATE vocab_topics v SET words_count = (SELECT count(*) FROM words w WHERE w.topic_id = v.id)`);
  await prisma.$executeRawUnsafe(`UPDATE courses c SET lessons_count = s.n, duration_min = s.m FROM (
      SELECT cs.course_id, count(l.id) n, coalesce(sum(l.duration_min), 0) m FROM course_sections cs LEFT JOIN lessons l ON l.section_id = cs.id GROUP BY cs.course_id) s WHERE s.course_id = c.id`);
  await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_question_stats`);
  await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_class_stats`);
}

async function main() {
  const t0 = Date.now();
  if (!exists(DATA_DIR)) throw new Error(`Không tìm thấy thư mục dữ liệu ${DATA_DIR} (đặt biến SEED_DATA_DIR)`);
  await truncateAll();
  const ctx = await seedBase();
  await seedCourses(ctx);
  const topicTag = await seedGrammar(ctx);
  const { examVocab } = await importToeicTests(ctx);
  await importVocabulary(ctx, examVocab);
  await importVideoCourse(ctx);
  await importGrammarExercises(ctx, topicTag);
  await importReading(ctx);
  await importDictation(ctx);
  await importWriting(ctx);
  await importSpeaking(ctx);
  await seedVstep(ctx);
  await ctx.flushTags();
  await refreshCaches();

  const counts = await prisma.$queryRawUnsafe<{ table: string; rows: number }[]>(`
    SELECT relname AS table, n_live_tup::int AS rows FROM pg_stat_user_tables WHERE relname <> '_prisma_migrations' ORDER BY relname`);
  // n_live_tup có thể trễ → đếm chính xác
  const exact: Record<string, number> = {};
  for (const c of counts) exact[c.table] = Number((await prisma.$queryRawUnsafe<{ n: bigint }[]>(`SELECT count(*) n FROM "${c.table}"`))[0].n);
  console.table(Object.entries(exact).filter(([, n]) => n > 0).map(([table, rows]) => ({ table, rows })));
  log(`Xong sau ${((Date.now() - t0) / 1000).toFixed(1)}s. Mật khẩu chung các tài khoản: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
