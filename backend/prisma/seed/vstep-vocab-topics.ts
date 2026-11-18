/**
 * Từ vựng VSTEP (B1–C1) theo 12 chủ đề hay ra trong đề Viết/Nói.
 * Dữ liệu: data/vstep-vocab-topics.json → { slug chủ đề: [{ headword, pos, ipaUk, ipaUs, meaningVi, meaningEn, exampleEn, exampleVi, level }] }.
 *
 * - Gọi trong seed (index.ts).
 * - Chạy riêng trên CSDL đang dùng (an toàn chạy lại: chỉ thêm/cập nhật, không xoá từ hay tiến độ học):
 *     npx tsx prisma/seed/vstep-vocab-topics.ts
 */
import path from 'node:path';
import type { CefrLevel } from '@prisma/client';
import { prisma, readJson, cut } from './lib';

export const VSTEP_TOPICS: { slug: string; name: string; icon: string; gradient: string }[] = [
  { slug: 'education', name: 'Giáo dục & học tập', icon: 'GraduationCap', gradient: 'from-indigo-500 to-blue-600' },
  { slug: 'environment', name: 'Môi trường & khí hậu', icon: 'Leaf', gradient: 'from-emerald-500 to-green-700' },
  { slug: 'health', name: 'Sức khoẻ & lối sống', icon: 'HeartPulse', gradient: 'from-rose-500 to-red-600' },
  { slug: 'technology', name: 'Công nghệ & mạng xã hội', icon: 'Laptop', gradient: 'from-violet-500 to-indigo-600' },
  { slug: 'work', name: 'Công việc & nghề nghiệp', icon: 'Briefcase', gradient: 'from-slate-500 to-slate-700' },
  { slug: 'family', name: 'Gia đình & các mối quan hệ', icon: 'Users', gradient: 'from-pink-500 to-rose-600' },
  { slug: 'travel', name: 'Du lịch & giao thông', icon: 'Plane', gradient: 'from-sky-500 to-cyan-600' },
  { slug: 'culture', name: 'Văn hoá & xã hội', icon: 'Landmark', gradient: 'from-amber-500 to-orange-600' },
  { slug: 'media', name: 'Truyền thông & quảng cáo', icon: 'Megaphone', gradient: 'from-orange-500 to-rose-500' },
  { slug: 'economy', name: 'Kinh tế & tiêu dùng', icon: 'ShoppingBag', gradient: 'from-teal-500 to-emerald-600' },
  { slug: 'city', name: 'Đô thị & nhà ở', icon: 'Building2', gradient: 'from-yellow-600 to-amber-700' },
  { slug: 'leisure', name: 'Giải trí, thể thao & sở thích', icon: 'Trophy', gradient: 'from-fuchsia-500 to-purple-600' },
];

type Entry = { headword: string; pos: string; ipaUk?: string; ipaUs?: string; meaningVi: string; meaningEn?: string; exampleEn?: string; exampleVi?: string; level?: string };
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export async function applyVstepVocabTopics() {
  const data: Record<string, Entry[]> = readJson(path.join(__dirname, 'data', 'vstep-vocab-topics.json'));
  let added = 0;
  let updated = 0;
  for (const [i, t] of VSTEP_TOPICS.entries()) {
    const list = data[t.slug] ?? [];
    const topic = await prisma.vocabTopic.upsert({
      where: { slug: `vstep-topic-${t.slug}` },
      create: { slug: `vstep-topic-${t.slug}`, name: t.name, icon: t.icon, themeGradient: t.gradient, examType: 'VSTEP', isFree: true, orderIndex: 40 + i },
      update: { name: t.name, icon: t.icon, themeGradient: t.gradient, examType: 'VSTEP', orderIndex: 40 + i, deletedAt: null },
    });
    const existing = new Map((await prisma.word.findMany({ where: { topicId: topic.id }, select: { id: true, headword: true, pos: true } })).map((w) => [`${w.headword}|${w.pos}`, w.id]));
    for (const [j, e] of list.entries()) {
      const headword = cut(e.headword.trim(), 80)!;
      const pos = cut(e.pos.trim(), 12)!;
      const row = {
        ipaUk: cut(e.ipaUk ?? null, 80),
        ipaUs: cut(e.ipaUs ?? null, 80),
        meaningVi: e.meaningVi,
        meaningEn: e.meaningEn ?? null,
        exampleEn: e.exampleEn ?? null,
        exampleVi: e.exampleVi ?? null,
        level: (e.level && LEVELS.has(e.level) ? e.level : null) as CefrLevel | null,
        orderInTopic: j + 1,
      };
      const id = existing.get(`${headword}|${pos}`);
      if (id) {
        await prisma.word.update({ where: { id }, data: row });
        updated++;
      } else {
        await prisma.word.create({ data: { ...row, topicId: topic.id, headword, pos } });
        added++;
      }
    }
  }
  await prisma.$executeRawUnsafe(`UPDATE vocab_topics v SET words_count = (SELECT count(*) FROM words w WHERE w.topic_id = v.id) WHERE v.slug LIKE 'vstep-topic-%'`);
  return { added, updated };
}

if (require.main === module) {
  applyVstepVocabTopics()
    .then((r) => console.log(`Từ vựng VSTEP: thêm ${r.added} từ, cập nhật ${r.updated} từ.`))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
