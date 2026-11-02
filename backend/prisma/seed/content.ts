/** Nội dung biên tập đang có trên web (frontend mocks) + danh mục ngữ pháp anhngu24h + nội dung VSTEP. */
import type { CefrLevel, ExamPart } from '@prisma/client';
import { MOCKS, cut, dataPath, exists, insertMany, log, prisma, readText, slugify, uuid } from './lib';
import type { SeedCtx } from './base';

const CEFR = /^(A1|A2|B1|B2|C1|C2)/;
const cefrOf = (s?: string): CefrLevel | null => (CEFR.exec(String(s ?? ''))?.[1] as CefrLevel) ?? null;

// ---------- Khoá học đang hiển thị trên trang học viên ----------
export async function seedCourses(ctx: SeedCtx) {
  const lessons: any[] = [];
  const sections: any[] = [];
  for (const c of MOCKS.MOCK_COURSES as any[]) {
    const id = uuid();
    let total = 0;
    let count = 0;
    (c.sections as any[]).forEach((s, si) => {
      const sid = uuid();
      const partNo = s.part === 'Luyện theo chủ đề' ? 2 : 1;
      sections.push({ id: sid, courseId: id, partNo, partTitle: s.part ?? null, title: s.title, orderIndex: si + 1 });
      (s.lessons as any[]).forEach((l, li) => {
        total += l.durationMin ?? 10;
        count++;
        lessons.push({
          sectionId: sid,
          title: cut(l.title, 200),
          type: l.type === 'QUIZ' && /kiểm tra giữa khoá/i.test(l.title) ? 'CHECKPOINT' : l.type,
          summary: cut(l.summary, 300),
          contentMd: l.content ?? null,
          videoUrl: l.videoUrl ?? null,
          transcript: l.transcript ? l.transcript.map((t: any) => ({ startMs: t.start * 1000, endMs: t.end * 1000, en: t.text, vi: t.textVi ?? null })) : undefined,
          passScorePct: l.type === 'QUIZ' ? 70 : null,
          durationMin: l.durationMin ?? 10,
          isFreePreview: !!l.isFree,
          orderIndex: li + 1,
          status: 'PUBLISHED',
        });
      });
    });
    await prisma.course.create({
      data: {
        id,
        slug: c.slug,
        title: c.title,
        category: c.category,
        examType: c.examType ?? null,
        level: cefrOf(c.level),
        description: c.description,
        coverUrl: c.coverUrl,
        themeGradient: c.gradient,
        isSequential: true,
        isFree: !!c.isFree,
        authorId: ctx.userByName.get(c.teacherName) ?? null,
        status: 'PUBLISHED',
        reviewedById: ctx.headId,
        lessonsCount: count,
        durationMin: total,
        publishedAt: new Date(),
      },
    });
  }
  await insertMany(prisma.courseSection, sections);
  await insertMany(prisma.lesson, lessons);
  log('courses', (MOCKS.MOCK_COURSES as any[]).length, 'lessons', lessons.length);
}

// ---------- Ngữ pháp: chủ điểm trên web + 41 chủ điểm anhngu24h ----------
const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

export async function seedGrammar(ctx: SeedCtx) {
  const rows: any[] = [];
  const englishKey: { key: string; tagId: string }[] = [];
  const titles = new Set<string>();
  (MOCKS.GRAMMAR_TOPICS as any[]).forEach((g, i) => {
    const tagId = ctx.addTag(`grammar-${g.slug}`, g.title, 'GRAMMAR', null);
    titles.add(norm(g.title));
    rows.push({
      slug: g.slug,
      title: g.title,
      category: g.category,
      level: cefrOf(g.level),
      summary: g.summary,
      rules: (g.rules as any[]).map((r) => ({ title: r.title, detailMd: r.detail, example: r.example, commonErrors: [] })),
      tagId,
      orderIndex: i + 1,
      status: 'PUBLISHED',
    });
  });

  // anhngu24h: "n / Tiêu đề / Beginner|Intermediate|Advanced / mô tả / nhóm"
  const file = dataPath('anhngu24h', 'du_lieu_full_da_login', 'Ngu_Phap', 'Ngữ pháp.txt');
  if (exists(file)) {
    const L = readText(file).split('\n').map((l) => l.trim()).filter(Boolean);
    const LEVEL: Record<string, CefrLevel> = { Beginner: 'A2', Intermediate: 'B1', Advanced: 'B2' };
    let order = rows.length;
    for (let i = 0; i + 4 < L.length; i++) {
      if (!/^\d+$/.test(L[i]) || !LEVEL[L[i + 2]]) continue;
      const title = L[i + 1];
      const english = /\(([^)]+)\)/.exec(title)?.[1] ?? (/^[A-Za-z ]+$/.test(title) ? title : '');
      const n = norm(title);
      if (titles.has(n)) continue;
      titles.add(n);
      let slug = slugify(title);
      if (rows.some((r) => r.slug === slug)) slug = `${slug}-${L[i]}`;
      const tagId = ctx.addTag(`grammar-${slug}`, title, 'GRAMMAR', 'TOEIC');
      if (english) englishKey.push({ key: norm(english), tagId });
      rows.push({
        slug,
        title: cut(title, 160),
        category: cut(L[i + 4], 40),
        level: LEVEL[L[i + 2]],
        summary: L[i + 3],
        rules: [{ title: 'Tổng quan', detailMd: L[i + 3], example: null, commonErrors: [] }],
        tagId,
        orderIndex: ++order,
        status: 'PUBLISHED',
      });
      i += 4;
    }
  }
  await ctx.flushTags();
  await insertMany(prisma.grammarTopic, rows);
  log('grammar topics', rows.length);

  // Ghép tên file bài tập englishteststore ("Present Simple", "Past Perfect"…) với chủ điểm có tên tiếng Anh trùng
  return (fileTitle: string) => {
    const k = norm(fileTitle);
    return englishKey.find((e) => e.key === k)?.tagId ?? englishKey.find((e) => k.includes(e.key) && e.key.split(' ').length >= 2)?.tagId;
  };
}

// ---------- VSTEP: câu hỏi mẫu trên web (Data không có VSTEP) ----------
const VSTEP_PART: Record<string, ExamPart> = {
  READING_PART_1: 'VSTEP_R1', READING_PART_2: 'VSTEP_R2', READING_PART_3: 'VSTEP_R3', READING_PART_4: 'VSTEP_R4',
  LISTENING_PART_1: 'VSTEP_L1', LISTENING_PART_2: 'VSTEP_L2', LISTENING_PART_3: 'VSTEP_L3',
};

export async function seedVstep(ctx: SeedCtx) {
  const testId = uuid();
  const passages = new Map<string, string>();
  const passageRows: any[] = [];
  const qRows: any[] = [];
  const links: any[] = [];
  let no = 0;
  const mcq = [...(MOCKS.VSTEP_LISTENING as any[]), ...(MOCKS.VSTEP_READING as any[])];
  for (const q of mcq) {
    const part = VSTEP_PART[q.partOrSkill] ?? 'VSTEP_R1';
    let passageId: string | null = null;
    if (q.passage) {
      passageId = passages.get(q.passage.id) ?? null;
      if (!passageId) {
        passageId = uuid();
        passages.set(q.passage.id, passageId);
        passageRows.push({ id: passageId, purpose: 'EXAM', examType: 'VSTEP', part, title: q.passage.title ?? null, contentMd: q.passage.content || null, audioUrl: q.passage.audioUrl ?? null, level: cefrOf(q.level), status: 'PUBLISHED', authorId: ctx.adminId });
      }
    }
    const id = uuid();
    qRows.push({
      id, passageId, examType: 'VSTEP', part, skill: q.skillType, type: 'SINGLE_CHOICE', level: cefrOf(q.level), stem: q.stem, options: q.options,
      correctAnswer: { keys: [q.correctAnswer?.key] }, explanationMd: q.explanation ?? null, source: 'ORIGINAL', status: 'PUBLISHED', authorId: ctx.adminId,
    });
    links.push({ testId, questionId: id, part, questionNo: ++no });
  }
  (MOCKS.VSTEP_WRITING_TASKS as any[]).forEach((w, i) => {
    const id = uuid();
    const part: ExamPart = i === 0 ? 'VSTEP_W1' : 'VSTEP_W2';
    qRows.push({
      id, examType: 'VSTEP', part, skill: 'WRITING', type: 'ESSAY', level: 'B2', stem: w.prompt,
      taskConfig: { title: w.task, minutes: w.minutes, minWords: w.minWords }, rubricId: ctx.rubrics.get(i === 0 ? 'VSTEP_WRITING_T1' : 'VSTEP_WRITING_T2'),
      source: 'ORIGINAL', status: 'PUBLISHED', authorId: ctx.adminId,
    });
    links.push({ testId, questionId: id, part, questionNo: ++no });
  });
  (MOCKS.VSTEP_SPEAKING_PARTS as any[]).forEach((s, i) => {
    const id = uuid();
    const part = (['VSTEP_S1', 'VSTEP_S2', 'VSTEP_S3'] as ExamPart[])[i] ?? 'VSTEP_S3';
    qRows.push({
      id, examType: 'VSTEP', part, skill: 'SPEAKING', type: 'SPEAKING_RESPONSE', level: 'B2', stem: s.prompt,
      taskConfig: { title: s.part, minutes: s.minutes, prepSec: i === 0 ? 0 : 60, responseSec: s.minutes * 60 }, rubricId: ctx.rubrics.get(`VSTEP_SPEAKING_P${i + 1}`),
      source: 'ORIGINAL', status: 'PUBLISHED', authorId: ctx.adminId,
    });
    links.push({ testId, questionId: id, part, questionNo: ++no });
  });

  const PART_TITLE: Partial<Record<ExamPart, [string, string]>> = {
    VSTEP_L1: ['Listening Part 1', 'LISTENING'], VSTEP_R1: ['Reading Part 1', 'READING'], VSTEP_W1: ['Writing Task 1', 'WRITING'], VSTEP_W2: ['Writing Task 2', 'WRITING'],
    VSTEP_S1: ['Speaking Part 1', 'SPEAKING'], VSTEP_S2: ['Speaking Part 2', 'SPEAKING'], VSTEP_S3: ['Speaking Part 3', 'SPEAKING'],
  };
  const usedParts = [...new Set(links.map((l) => l.part as ExamPart))];
  await prisma.mockTest.create({
    data: {
      id: testId,
      slug: 'vstep-de-mau-4-ky-nang',
      title: 'VSTEP — Đề mẫu 4 kỹ năng',
      examType: 'VSTEP',
      kind: 'MINI',
      level: 'B1–B2',
      durationMin: 60,
      totalQuestions: links.length,
      sections: usedParts.map((p, i) => ({ part: p, title: PART_TITLE[p]?.[0] ?? p, skill: PART_TITLE[p]?.[1] ?? 'READING', order: i + 1, questions: links.filter((l) => l.part === p).length })),
      isFree: true,
      tags: ['VSTEP', 'Đề mẫu'],
      status: 'PUBLISHED',
      authorId: ctx.adminId,
      reviewedById: ctx.headId,
    },
  });
  await insertMany(prisma.passage, passageRows);
  await insertMany(prisma.question, qRows);
  await insertMany(prisma.mockTestQuestion, links);
  log('vstep questions', qRows.length);
}
