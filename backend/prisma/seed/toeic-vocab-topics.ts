/**
 * Chia 800 từ TOEIC cốt lõi (trước đây xếp "Bộ 1–10" theo thứ tự nguồn) thành bộ theo CHỦ ĐỀ.
 * Phân loại nằm ở data/toeic-vocab-topics.json: { slug chủ đề: ["headword|pos", ...] }.
 *
 * - Gọi trong seed (index.ts) sau importVocabulary.
 * - Chạy riêng trên CSDL đang dùng (an toàn chạy lại nhiều lần, không xoá từ hay tiến độ học):
 *     npx tsx prisma/seed/toeic-vocab-topics.ts
 *   Từ chỉ được chuyển sang bộ chủ đề (giữ nguyên id → thẻ ôn SRS của học viên không đổi);
 *   bộ "Bộ 1–10" được ẩn (deleted_at) sau khi chuyển; bản từ trùng giữa các bộ cũ (nếu có) ở lại bộ đã ẩn.
 */
import path from 'node:path';
import { prisma, readJson } from './lib';

export const TOEIC_TOPICS: { slug: string; name: string; icon: string; gradient: string }[] = [
  { slug: 'office', name: 'Văn phòng & công việc', icon: 'Briefcase', gradient: 'from-slate-500 to-slate-700' },
  { slug: 'hr', name: 'Nhân sự & tuyển dụng', icon: 'Users', gradient: 'from-teal-500 to-emerald-600' },
  { slug: 'meetings', name: 'Hội họp, sự kiện & hợp đồng', icon: 'Presentation', gradient: 'from-indigo-500 to-blue-600' },
  { slug: 'marketing', name: 'Marketing & bán hàng', icon: 'Megaphone', gradient: 'from-orange-500 to-rose-500' },
  { slug: 'finance', name: 'Tài chính, kế toán & ngân hàng', icon: 'Landmark', gradient: 'from-emerald-500 to-teal-700' },
  { slug: 'shopping', name: 'Mua sắm & chăm sóc khách hàng', icon: 'ShoppingBag', gradient: 'from-pink-500 to-fuchsia-600' },
  { slug: 'travel', name: 'Du lịch, đi lại & khách sạn', icon: 'Plane', gradient: 'from-sky-500 to-cyan-600' },
  { slug: 'dining', name: 'Nhà hàng & ẩm thực', icon: 'Utensils', gradient: 'from-amber-500 to-orange-600' },
  { slug: 'manufacturing', name: 'Sản xuất, kho bãi & vận chuyển', icon: 'Factory', gradient: 'from-zinc-500 to-stone-700' },
  { slug: 'property', name: 'Nhà cửa, xây dựng & bảo trì', icon: 'Building2', gradient: 'from-yellow-600 to-amber-700' },
  { slug: 'health', name: 'Sức khoẻ, y tế & an toàn', icon: 'HeartPulse', gradient: 'from-rose-500 to-red-600' },
  { slug: 'tech', name: 'Công nghệ & truyền thông', icon: 'Laptop', gradient: 'from-violet-500 to-indigo-600' },
  { slug: 'general', name: 'Từ vựng thông dụng', icon: 'BookOpen', gradient: 'from-blue-500 to-indigo-600' },
];

const key = (headword: string, pos: string) => `${headword.trim().toLowerCase()}|${pos.trim().toLowerCase()}`;

export async function applyToeicVocabTopics() {
  const map: Record<string, string[]> = readJson(path.join(__dirname, 'data', 'toeic-vocab-topics.json'));
  const topicOf = new Map<string, string>();
  for (const [slug, list] of Object.entries(map)) for (const k of list) topicOf.set(k.toLowerCase(), slug);

  // Bộ chủ đề (tạo mới hoặc cập nhật tên/icon)
  const ids = new Map<string, string>();
  for (const [i, t] of TOEIC_TOPICS.entries()) {
    const row = await prisma.vocabTopic.upsert({
      where: { slug: `toeic-topic-${t.slug}` },
      create: { slug: `toeic-topic-${t.slug}`, name: t.name, icon: t.icon, themeGradient: t.gradient, examType: 'TOEIC', isFree: true, orderIndex: i + 1 },
      update: { name: t.name, icon: t.icon, themeGradient: t.gradient, examType: 'TOEIC', orderIndex: i + 1, deletedAt: null },
    });
    ids.set(t.slug, row.id);
  }

  // Chuyển từ của "Bộ 1–10" sang bộ chủ đề (giữ thứ tự gốc)
  const sets = await prisma.vocabTopic.findMany({ where: { slug: { startsWith: 'toeic-vocab-set-' } }, orderBy: { orderIndex: 'asc' } });
  const words = await prisma.word.findMany({ where: { topicId: { in: sets.map((s) => s.id) } }, orderBy: [{ orderInTopic: 'asc' }] });
  const setOrder = new Map(sets.map((s, i) => [s.id, i]));
  words.sort((a, b) => (setOrder.get(a.topicId!)! - setOrder.get(b.topicId!)!) || (a.orderInTopic ?? 0) - (b.orderInTopic ?? 0));
  const counters = new Map<string, number>();
  const existing = await prisma.word.groupBy({ by: ['topicId'], where: { topicId: { in: [...ids.values()] } }, _count: true });
  for (const e of existing) counters.set(e.topicId!, e._count);
  // Từ đã có trong bộ chủ đề (lần chạy trước) → bản trùng ở bộ cũ để nguyên, bộ cũ bị ẩn nên không hiện lại
  const taken = new Set((await prisma.word.findMany({ where: { topicId: { in: [...ids.values()] } }, select: { topicId: true, headword: true, pos: true } })).map((w) => `${w.topicId}|${w.headword}|${w.pos}`));
  let moved = 0;
  for (const w of words) {
    const slug = topicOf.get(key(w.headword, w.pos)) ?? 'general';
    const topicId = ids.get(slug)!;
    if (taken.has(`${topicId}|${w.headword}|${w.pos}`)) continue;
    taken.add(`${topicId}|${w.headword}|${w.pos}`);
    const n = (counters.get(topicId) ?? 0) + 1;
    counters.set(topicId, n);
    await prisma.word.update({ where: { id: w.id }, data: { topicId, orderInTopic: n } });
    moved++;
  }

  // Đếm lại số từ; ẩn các bộ cũ đã rỗng
  await prisma.$executeRawUnsafe(`UPDATE vocab_topics v SET words_count = (SELECT count(*) FROM words w WHERE w.topic_id = v.id) WHERE v.slug LIKE 'toeic-topic-%' OR v.slug LIKE 'toeic-vocab-set-%'`);
  const hidden = await prisma.vocabTopic.updateMany({ where: { slug: { startsWith: 'toeic-vocab-set-' }, deletedAt: null }, data: { deletedAt: new Date() } });
  return { moved, hiddenSets: hidden.count };
}

if (require.main === module) {
  applyToeicVocabTopics()
    .then((r) => console.log(`Đã chuyển ${r.moved} từ sang bộ chủ đề, ẩn ${r.hiddenSets} bộ cũ.`))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
