/**
 * Trích các nội dung NGẮN trong CSDL cần dịch theo ngôn ngữ giao diện (tên khoá / chương / bài, mô tả, gói, FAQ, nhãn,
 * tiêu đề + ghi chú kiến thức…). Nội dung học dài (giải thích đáp án, bài đọc, blog, nghĩa tiếng Việt của từ) giữ nguyên.
 * Chạy: npx tsx prisma/seed/i18n-extract.ts <file-json-ra>
 */
import fs from 'node:fs';
import { prisma } from './lib';

const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const out = new Set<string>();
const add = (s: unknown) => {
  if (typeof s !== 'string') return;
  // đoạn văn tách theo dòng trống như khi hiển thị
  for (const part of s.split(/\n{2,}/)) {
    const t = part.replace(/\s+/g, ' ').trim();
    if (t && VI.test(t) && t.length <= 400) out.add(t);
  }
};

type Point = { title?: string; note?: string };
async function main() {
  const courses = await prisma.course.findMany({ where: { deletedAt: null } });
  courses.forEach((c) => [c.title, c.description, c.trackGroup].forEach(add));
  (await prisma.courseSection.findMany()).forEach((s) => [s.title, s.partTitle].forEach(add));
  const lessons = await prisma.lesson.findMany({ where: { deletedAt: null } });
  for (const l of lessons) {
    [l.title, l.summary, l.contentMd].forEach(add);
    const k = l.knowledge as Record<string, unknown> | null;
    if (k) {
      for (const key of ['grammar', 'pronunciation', 'phrases', 'tips', 'clauses'])
        ((k[key] as Point[] | undefined) ?? []).forEach((p) => [p.title, p.note].forEach(add));
      // quy tắc của a / an / the (giải thích), không lấy nghĩa tiếng Việt của từng từ
      ((k.articles as { meaningVi?: string; example?: string }[] | undefined) ?? []).forEach((r) => [r.meaningVi, r.example].forEach(add));
    }
    // yêu cầu câu bài tập (không lấy giải thích)
    ((l.exercises as { prompt?: string }[] | null) ?? []).forEach((e) => add(e.prompt));
  }
  (await prisma.skillTag.findMany()).forEach((t) => add(t.name));
  (await prisma.grammarTopic.findMany()).forEach((g) => [g.title, g.summary, g.category].forEach(add));
  (await prisma.vocabTopic.findMany()).forEach((v) => add(v.name));
  (await prisma.faq.findMany()).forEach((f) => [f.question, f.answer, f.category].forEach(add));
  for (const p of await prisma.subscriptionPlan.findMany()) {
    [p.name, p.description, p.badge].forEach(add);
    ((p.featuresDisplay as { text?: string }[] | null) ?? []).forEach((f) => add(f.text));
  }
  (await prisma.post.findMany()).forEach((p) => [p.title, p.excerpt, p.category, ...(p.tags ?? [])].forEach(add));
  for (const s of await prisma.systemSetting.findMany()) {
    [s.label, s.description, s.groupName].forEach(add);
    ((s.options as string[] | null) ?? []).forEach(add);
  }
  (await prisma.department.findMany()).forEach((d) => [d.name, d.description].forEach(add));
  (await prisma.material.findMany()).forEach((m) => [m.title, m.description, m.category].forEach(add));
  (await prisma.rubric.findMany()).forEach((r) => add(r.name));
  for (const t of await prisma.mockTest.findMany({ where: { deletedAt: null } })) {
    [t.level, ...(t.tags ?? [])].forEach(add);
    ((t.sections as { title?: string }[] | null) ?? []).forEach((s) => add(s.title));
  }
  // tên đề, quy tắc ngữ pháp, bảng quy đổi / tương đương điểm, thông báo hệ thống
  (await prisma.mockTest.findMany({ where: { deletedAt: null } })).forEach((t) => add(t.title));
  const walkJson = (v: unknown): void => {
    if (typeof v === 'string') add(v);
    else if (Array.isArray(v)) v.forEach(walkJson);
    else if (v && typeof v === 'object') Object.values(v).forEach(walkJson);
  };
  (await prisma.grammarTopic.findMany()).forEach((g) => walkJson(g.rules));
  (await prisma.systemSetting.findMany({ where: { valueType: 'JSON' } })).forEach((s) => walkJson(s.value));
  (await prisma.notification.findMany({ distinct: ['title'], take: 500 })).forEach((n) => [n.title, n.message].forEach(add));
  fs.writeFileSync(process.argv[2], JSON.stringify([...out].sort(), null, 1));
  console.log(out.size);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
