/** /api/v1/admin — quản lý nội dung học tập (dùng cho CrudEditor và cây khoá học) */
import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest, handler, me, notFound, parse } from '../../core/http';
import { audit } from './audit';
import { gradientOf } from '../head/shared';
import { listQuestions, toQuestionRow } from '../head/head.routes';

export const contentRouter = Router();

const uuid = z.string().uuid();
const idOf = (req: Request) => parse(uuid, req.params.id);
export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) || 'muc';
export const uniqueSlug = (base: string) => `${slugify(base)}-${Date.now().toString(36).slice(-4)}`;
const CONTENT_STATUS = z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED']);
const EXAM = z.enum(['TOEIC', 'VSTEP']);
const CEFR = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const SKILL = z.enum(['LISTENING', 'READING', 'WRITING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR']);
const PART = z.enum(['TOEIC_P1', 'TOEIC_P2', 'TOEIC_P3', 'TOEIC_P4', 'TOEIC_P5', 'TOEIC_P6', 'TOEIC_P7', 'VSTEP_L1', 'VSTEP_L2', 'VSTEP_L3', 'VSTEP_R1', 'VSTEP_R2', 'VSTEP_R3', 'VSTEP_R4', 'VSTEP_W1', 'VSTEP_W2', 'VSTEP_S1', 'VSTEP_S2', 'VSTEP_S3']);

// ============================ KHOÁ HỌC ============================
const CATEGORY_LABEL: Record<string, string> = { FOUNDATION: 'Kiến thức nền tảng', GRAMMAR: 'Ngữ pháp', VOCABULARY: 'Từ vựng', SKILL: 'Kỹ năng', EXAM_PREP: 'Luyện thi' };
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

/** Cây Danh mục → Khoá học → Chương (CourseTreeNode); bài học trả kèm trong `lessons` của chương */
contentRouter.get(
  '/courses/tree',
  handler(async () => {
    const courses = await prisma.course.findMany({
      where: { deletedAt: null },
      include: { courseSectionCourses: { orderBy: { orderIndex: 'asc' }, include: { lessonSections: { where: { deletedAt: null }, orderBy: { orderIndex: 'asc' }, select: { id: true, title: true, type: true, durationMin: true, status: true, orderIndex: true, videoUrl: true, isFreePreview: true } } } } },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });
    const cats = [...new Set(courses.map((c) => c.category))];
    return cats.map((cat) => {
      const list = courses.filter((c) => c.category === cat);
      return {
        id: `cat-${cat}`,
        title: CATEGORY_LABEL[cat] ?? cat,
        type: 'CATEGORY' as const,
        category: cat,
        meta: `${list.length} khoá`,
        children: list.map((c) => ({
          id: c.id,
          title: c.title,
          type: 'COURSE' as const,
          slug: c.slug,
          status: c.status,
          meta: `${c.lessonsCount} bài · ${fmtK(c.studentsCount)} HV`,
          children: c.courseSectionCourses.map((s) => ({
            id: s.id,
            title: s.title,
            type: 'SECTION' as const,
            partTitle: s.partTitle ?? undefined,
            meta: `${s.lessonSections.length} bài`,
            lessons: s.lessonSections,
          })),
        })),
      };
    });
  })
);

const courseRow = (c: Prisma.CourseGetPayload<{ include: { author: { select: { fullName: true } } } }>) => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  category: c.category,
  examType: c.examType ?? undefined,
  level: c.level ?? '',
  description: c.description,
  gradient: c.themeGradient ?? gradientOf(c.slug),
  coverUrl: c.coverUrl ?? undefined,
  lessonsCount: c.lessonsCount,
  durationHours: Math.round((c.durationMin / 60) * 10) / 10,
  studentsCount: c.studentsCount,
  rating: Number(c.ratingAvg),
  isFree: c.isFree,
  isSequential: c.isSequential,
  teacherName: c.author?.fullName ?? '',
  status: c.status,
  publishedAt: c.publishedAt?.toISOString(),
});

contentRouter.get(
  '/courses',
  handler(async () => {
    const rows = await prisma.course.findMany({ where: { deletedAt: null }, include: { author: { select: { fullName: true } } }, orderBy: { createdAt: 'asc' } });
    return rows.map(courseRow);
  })
);

const courseBody = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().max(140).optional(),
  category: z.enum(['FOUNDATION', 'GRAMMAR', 'VOCABULARY', 'SKILL', 'EXAM_PREP']),
  examType: EXAM.nullish(),
  level: CEFR.nullish(),
  description: z.string().max(5000).default(''),
  coverUrl: z.string().url().nullish(),
  themeGradient: z.string().max(80).nullish(),
  isSequential: z.boolean().optional(),
  isFree: z.boolean().optional(),
  status: CONTENT_STATUS.optional(),
});
contentRouter.post(
  '/courses',
  handler(async (req) => {
    const b = parse(courseBody, req.body);
    const c = await prisma.course.create({
      data: { ...b, slug: b.slug ? slugify(b.slug) : uniqueSlug(b.title), authorId: me(req).id, publishedAt: b.status === 'PUBLISHED' ? new Date() : null },
      include: { author: { select: { fullName: true } } },
    });
    await audit(req, 'COURSE_CREATE', 'course', c.id, { after: { title: c.title } });
    return courseRow(c);
  })
);
contentRouter.patch(
  '/courses/:id',
  handler(async (req) => {
    const b = parse(courseBody.partial(), req.body);
    const cur = await prisma.course.findFirst({ where: { id: idOf(req), deletedAt: null }, select: { lessonsCount: true } });
    if (!cur) throw notFound('Khoá học');
    if ((b.status === 'PENDING_REVIEW' || b.status === 'PUBLISHED') && cur.lessonsCount === 0) throw badRequest('Khoá học chưa có bài học nào, hãy thêm bài trước khi gửi duyệt');
    const c = await prisma.course.update({
      where: { id: idOf(req) },
      data: { ...b, slug: b.slug ? slugify(b.slug) : undefined, publishedAt: b.status === 'PUBLISHED' ? new Date() : undefined },
      include: { author: { select: { fullName: true } } },
    });
    await audit(req, 'COURSE_UPDATE', 'course', c.id, { after: { title: c.title, fields: Object.keys(b) } });
    return courseRow(c);
  })
);
contentRouter.delete(
  '/courses/:id',
  handler(async (req) => {
    const c = await prisma.course.update({ where: { id: idOf(req) }, data: { deletedAt: new Date() } });
    await audit(req, 'COURSE_DELETE', 'course', c.id, { severity: 'WARN', after: { title: c.title } });
    return { ok: true };
  })
);

/** Chương */
const sectionBody = z.object({ courseId: uuid, title: z.string().trim().min(1).max(200), partNo: z.number().int().min(1).max(9).optional(), partTitle: z.string().max(120).nullish(), orderIndex: z.number().int().min(0).optional() });
contentRouter.post(
  '/sections',
  handler(async (req) => {
    const b = parse(sectionBody, req.body);
    if (!(await prisma.course.findFirst({ where: { id: b.courseId, deletedAt: null }, select: { id: true } }))) throw notFound('Khoá học');
    const last = await prisma.courseSection.aggregate({ where: { courseId: b.courseId }, _max: { orderIndex: true } });
    return prisma.courseSection.create({ data: { ...b, orderIndex: b.orderIndex ?? (last._max.orderIndex ?? -1) + 1 } });
  })
);
contentRouter.patch(
  '/sections/:id',
  handler(async (req) => {
    const b = parse(sectionBody.omit({ courseId: true }).partial(), req.body);
    return prisma.courseSection.update({ where: { id: idOf(req) }, data: b });
  })
);
contentRouter.delete(
  '/sections/:id',
  handler(async (req) => {
    const s = await prisma.courseSection.delete({ where: { id: idOf(req) } });
    await refreshCourseCache(s.courseId);
    return { ok: true };
  })
);

/** Bài học */
const lessonBody = z.object({
  sectionId: uuid,
  title: z.string().trim().min(1).max(200),
  type: z.enum(['VIDEO', 'READING', 'QUIZ', 'CHECKPOINT']),
  summary: z.string().max(300).nullish(),
  contentMd: z.string().nullish(),
  skill: SKILL.nullish(),
  videoUrl: z.string().nullish(),
  audioUrl: z.string().nullish(),
  quizTestId: uuid.nullish(),
  passScorePct: z.number().int().min(0).max(100).nullish(),
  durationMin: z.number().int().min(1).max(600).optional(),
  isFreePreview: z.boolean().optional(),
  orderIndex: z.number().int().min(0).optional(),
  status: CONTENT_STATUS.optional(),
});
async function refreshCourseCache(courseId: string) {
  const agg = await prisma.lesson.aggregate({ where: { deletedAt: null, section: { courseId } }, _count: true, _sum: { durationMin: true } });
  await prisma.course.update({ where: { id: courseId }, data: { lessonsCount: agg._count, durationMin: agg._sum.durationMin ?? 0 } });
}
contentRouter.post(
  '/lessons',
  handler(async (req) => {
    const b = parse(lessonBody, req.body);
    if (!(await prisma.courseSection.findUnique({ where: { id: b.sectionId }, select: { id: true } }))) throw notFound('Chương');
    if (b.quizTestId && !(await prisma.mockTest.findFirst({ where: { id: b.quizTestId, deletedAt: null }, select: { id: true } }))) throw notFound('Đề kiểm tra');
    if ((b.type === 'QUIZ' || b.type === 'CHECKPOINT') && b.passScorePct == null) b.passScorePct = 70;
    const last = await prisma.lesson.aggregate({ where: { sectionId: b.sectionId }, _max: { orderIndex: true } });
    const l = await prisma.lesson.create({ data: { ...b, orderIndex: b.orderIndex ?? (last._max.orderIndex ?? -1) + 1 }, include: { section: { select: { courseId: true } } } });
    await refreshCourseCache(l.section.courseId);
    return l;
  })
);
contentRouter.patch(
  '/lessons/:id',
  handler(async (req) => {
    const b = parse(lessonBody.omit({ sectionId: true }).partial(), req.body);
    const l = await prisma.lesson.update({ where: { id: idOf(req) }, data: b, include: { section: { select: { courseId: true } } } });
    await refreshCourseCache(l.section.courseId);
    return l;
  })
);
contentRouter.delete(
  '/lessons/:id',
  handler(async (req) => {
    const l = await prisma.lesson.update({ where: { id: idOf(req) }, data: { deletedAt: new Date() }, include: { section: { select: { courseId: true } } } });
    await refreshCourseCache(l.section.courseId);
    return { ok: true };
  })
);

// ============================ CÂU HỎI (gồm đề Viết / Nói) ============================
contentRouter.get('/questions', handler((req) => listQuestions(req.query)));

export const questionBody = z.object({
  examType: EXAM,
  part: PART,
  skill: SKILL,
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE_NOT_GIVEN', 'FILL_IN_BLANK', 'MATCHING', 'ESSAY', 'SPEAKING_RESPONSE']).default('SINGLE_CHOICE'),
  level: CEFR.nullish(),
  stem: z.string().trim().min(1),
  options: z.array(z.object({ key: z.string().max(4), text: z.string() })).nullish(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).nullish(),
  explanation: z.string().nullish(),
  translationVi: z.string().nullish(),
  audioUrl: z.string().nullish(),
  imageUrl: z.string().nullish(),
  passageId: uuid.nullish(),
  orderInPassage: z.number().int().nullish(),
  tagIds: z.array(uuid).optional(),
  taskConfig: z.record(z.unknown()).nullish(),
  rubricId: uuid.nullish(),
  status: CONTENT_STATUS.optional(),
});
export const toQuestionData = (b: Partial<z.infer<typeof questionBody>>) => {
  const { correctAnswer, explanation, options, taskConfig, ...rest } = b;
  return {
    ...rest,
    ...(options !== undefined ? { options: options ?? undefined } : {}),
    ...(taskConfig !== undefined ? { taskConfig: (taskConfig ?? undefined) as Prisma.InputJsonValue | undefined } : {}),
    ...(explanation !== undefined ? { explanationMd: explanation } : {}),
    ...(correctAnswer !== undefined ? { correctAnswer: correctAnswer === null ? undefined : { keys: Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer] } } : {}),
  };
};
contentRouter.get(
  '/questions/:id',
  handler(async (req) => {
    const q = await prisma.question.findFirst({ where: { id: idOf(req), deletedAt: null }, include: { passage: true } });
    if (!q) throw notFound('Câu hỏi');
    return { ...toQuestionRow(q), taskConfig: q.taskConfig ?? undefined, passage: q.passage ?? undefined };
  })
);
contentRouter.post(
  '/questions',
  handler(async (req) => {
    const b = parse(questionBody, req.body);
    const q = await prisma.question.create({ data: { ...toQuestionData(b), authorId: me(req).id, status: b.status ?? 'PUBLISHED' } as Prisma.QuestionUncheckedCreateInput, include: { passage: { select: { id: true, title: true } } } });
    await bumpTagCounts(q.tagIds);
    await audit(req, 'QUESTION_CREATE', 'question', q.id, { after: { title: q.stem.slice(0, 80) } });
    return toQuestionRow(q);
  })
);
contentRouter.patch(
  '/questions/:id',
  handler(async (req) => {
    const b = parse(questionBody.partial(), req.body);
    const q = await prisma.question.update({ where: { id: idOf(req) }, data: toQuestionData(b) as Prisma.QuestionUncheckedUpdateInput, include: { passage: { select: { id: true, title: true } } } });
    if (b.tagIds) await bumpTagCounts(q.tagIds);
    await audit(req, 'QUESTION_UPDATE', 'question', q.id, { after: { title: q.stem.slice(0, 80), version: q.version } });
    return toQuestionRow(q);
  })
);
contentRouter.delete(
  '/questions/:id',
  handler(async (req) => {
    const id = idOf(req);
    const inTests = await prisma.mockTestQuestion.count({ where: { questionId: id, test: { deletedAt: null } } });
    if (inTests) throw badRequest(`Câu hỏi đang nằm trong ${inTests} đề thi, hãy gỡ khỏi đề trước khi xoá`, 'IN_USE');
    const q = await prisma.question.update({ where: { id }, data: { deletedAt: new Date() } });
    await bumpTagCounts(q.tagIds);
    await audit(req, 'QUESTION_DELETE', 'question', id, { severity: 'WARN', after: { title: q.stem.slice(0, 80) } });
    return { ok: true };
  })
);
async function bumpTagCounts(tagIds: string[]) {
  for (const id of tagIds) {
    const n = await prisma.question.count({ where: { deletedAt: null, tagIds: { has: id } } });
    await prisma.skillTag.update({ where: { id }, data: { questionsCount: n } }).catch(() => undefined);
  }
}

// ============================ ĐỀ THI ============================
const PART_LABEL: Record<string, string> = { TOEIC_P1: 'Part 1', TOEIC_P2: 'Part 2', TOEIC_P3: 'Part 3', TOEIC_P4: 'Part 4', TOEIC_P5: 'Part 5', TOEIC_P6: 'Part 6', TOEIC_P7: 'Part 7' };
type Section = { part: string; title?: string };
export const testRow = (t: Prisma.MockTestGetPayload<object>) => {
  const sections = (t.sections ?? []) as Section[];
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    examType: t.examType,
    kind: t.kind,
    level: t.level ?? '',
    durationMinutes: t.durationMin,
    totalQuestions: t.totalQuestions,
    parts: sections.map((s) => s.title ?? PART_LABEL[s.part] ?? s.part),
    partIds: sections.map((s) => s.part),
    attempts: t.attemptsCount,
    isFree: t.isFree,
    year: t.year ?? new Date(t.createdAt).getFullYear(),
    tags: t.tags,
    coverUrl: t.coverUrl ?? undefined,
    status: t.status,
    version: t.version,
  };
};
contentRouter.get(
  '/tests',
  handler(async () => (await prisma.mockTest.findMany({ where: { deletedAt: null }, orderBy: [{ examType: 'asc' }, { createdAt: 'desc' }] })).map(testRow))
);
export const testBody = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().max(140).optional(),
  examType: EXAM,
  kind: z.enum(['FULL', 'MINI', 'PLACEMENT', 'DIAGNOSTIC', 'QUIZ', 'CHECKPOINT']).default('FULL'),
  level: z.string().max(20).nullish(),
  year: z.number().int().min(2000).max(2100).nullish(),
  durationMin: z.number().int().min(1).max(600),
  sections: z.array(z.object({ part: PART, title: z.string().optional(), skill: SKILL.optional(), order: z.number().int().optional(), durationMin: z.number().int().optional(), instructionsMd: z.string().optional(), audioUrl: z.string().optional() })).default([]),
  isFree: z.boolean().optional(),
  tags: z.array(z.string().max(40)).optional(),
  coverUrl: z.string().nullish(),
  status: CONTENT_STATUS.optional(),
});
contentRouter.get(
  '/tests/:id',
  handler(async (req) => {
    const t = await prisma.mockTest.findFirst({ where: { id: idOf(req), deletedAt: null }, include: { mockTestQuestionTests: { orderBy: { questionNo: 'asc' }, include: { question: { include: { passage: { select: { id: true, title: true } } } } } } } });
    if (!t) throw notFound('Đề thi');
    return { ...testRow(t), sections: t.sections, questions: t.mockTestQuestionTests.map((m) => ({ ...toQuestionRow(m.question), questionNo: m.questionNo, points: Number(m.points) })) };
  })
);
contentRouter.post(
  '/tests',
  handler(async (req) => {
    const b = parse(testBody, req.body);
    const t = await prisma.mockTest.create({ data: { ...b, slug: b.slug ? slugify(b.slug) : uniqueSlug(b.title), totalQuestions: 0, authorId: me(req).id, status: b.status ?? 'DRAFT' } });
    await audit(req, 'TEST_CREATE', 'mock_test', t.id, { after: { title: t.title } });
    return testRow(t);
  })
);
contentRouter.patch(
  '/tests/:id',
  handler(async (req) => {
    const b = parse(testBody.partial(), req.body);
    const cur = await prisma.mockTest.findFirst({ where: { id: idOf(req), deletedAt: null }, select: { totalQuestions: true } });
    if (!cur) throw notFound('Đề thi');
    if ((b.status === 'PENDING_REVIEW' || b.status === 'PUBLISHED') && cur.totalQuestions === 0) throw badRequest('Đề chưa có câu hỏi nào, hãy gán câu hỏi trước khi gửi duyệt');
    const t = await prisma.mockTest.update({ where: { id: idOf(req) }, data: { ...b, slug: b.slug ? slugify(b.slug) : undefined } });
    await audit(req, 'TEST_UPDATE', 'mock_test', t.id, { after: { title: t.title, fields: Object.keys(b) } });
    return testRow(t);
  })
);
contentRouter.delete(
  '/tests/:id',
  handler(async (req) => {
    const t = await prisma.mockTest.update({ where: { id: idOf(req) }, data: { deletedAt: new Date() } });
    await audit(req, 'TEST_DELETE', 'mock_test', t.id, { severity: 'WARN', after: { title: t.title } });
    return { ok: true };
  })
);
/** Gán danh sách câu cho đề (thay toàn bộ), đánh số câu theo thứ tự gửi lên */
contentRouter.put(
  '/tests/:id/questions',
  handler(async (req) => {
    const id = idOf(req);
    const { questionIds, points } = parse(z.object({ questionIds: z.array(uuid).max(300), points: z.number().min(0).max(10).default(1) }), req.body);
    const count = await setTestQuestions(id, questionIds, points);
    await audit(req, 'TEST_QUESTIONS_SET', 'mock_test', id, { after: { count } });
    return { count };
  })
);

/** Gán danh sách câu cho đề (thay toàn bộ). `allow` lọc thêm câu được phép (vd giáo viên: câu đã xuất bản hoặc của chính mình). */
export async function setTestQuestions(id: string, questionIds: string[], points = 1, allow?: Prisma.QuestionWhereInput) {
    const test = await prisma.mockTest.findFirst({ where: { id, deletedAt: null } });
    if (!test) throw notFound('Đề thi');
    if (new Set(questionIds).size !== questionIds.length) throw badRequest('Danh sách có câu hỏi bị trùng');
    const qs = await prisma.question.findMany({ where: { id: { in: questionIds }, deletedAt: null, ...(allow ?? {}) }, select: { id: true, part: true, examType: true } });
    if (qs.length !== questionIds.length) throw badRequest(allow ? 'Có câu hỏi không tồn tại, đã bị xoá hoặc chưa được duyệt' : 'Có câu hỏi không tồn tại hoặc đã bị xoá');
    if (qs.some((q) => q.examType !== test.examType)) throw badRequest(`Chỉ gán được câu hỏi ${test.examType} vào đề ${test.examType}`);
    const partOf = new Map(qs.map((q) => [q.id, q.part]));
    // Cấu trúc phần thi = các Part xuất hiện theo thứ tự câu, giữ tiêu đề/hướng dẫn cũ nếu đã có
    const oldSections = new Map(((test.sections ?? []) as Section[]).map((s) => [s.part, s]));
    const parts = [...new Set(questionIds.map((qid) => partOf.get(qid)!))];
    const sections = parts.map((p, i) => ({ ...(oldSections.get(p) ?? {}), part: p, title: oldSections.get(p)?.title ?? PART_LABEL[p] ?? p, order: i + 1 }));
    await prisma.$transaction([
      prisma.mockTestQuestion.deleteMany({ where: { testId: id } }),
      prisma.mockTestQuestion.createMany({ data: questionIds.map((qid, i) => ({ testId: id, questionId: qid, part: partOf.get(qid)!, questionNo: i + 1, points })) }),
      prisma.mockTest.update({ where: { id }, data: { totalQuestions: questionIds.length, sections, version: { increment: 1 } } }),
    ]);
    return questionIds.length;
}

/** Nhân bản đề (kèm danh sách câu hỏi), bản sao ở trạng thái nháp */
contentRouter.post(
  '/tests/:id/duplicate',
  handler(async (req) => {
    const src = await prisma.mockTest.findFirst({ where: { id: idOf(req), deletedAt: null }, include: { mockTestQuestionTests: true } });
    if (!src) throw notFound('Đề thi');
    const title = `${src.title} (bản sao)`.slice(0, 200);
    const copy = await prisma.$transaction(async (tx) => {
      const t = await tx.mockTest.create({
        data: {
          slug: uniqueSlug(title), title, examType: src.examType, kind: src.kind, level: src.level, year: src.year, durationMin: src.durationMin,
          totalQuestions: src.totalQuestions, sections: src.sections ?? [], scoreTable: src.scoreTable ?? undefined, isFree: src.isFree, tags: src.tags,
          coverUrl: src.coverUrl, status: 'DRAFT', authorId: me(req).id,
        },
      });
      if (src.mockTestQuestionTests.length)
        await tx.mockTestQuestion.createMany({ data: src.mockTestQuestionTests.map((m) => ({ testId: t.id, questionId: m.questionId, part: m.part, questionNo: m.questionNo, points: m.points })) });
      return t;
    });
    await audit(req, 'TEST_DUPLICATE', 'mock_test', copy.id, { after: { from: src.id, title } });
    return testRow(copy);
  })
);

// ============================ NHÃN KỸ NĂNG ============================
const tagRow = (t: Prisma.SkillTagGetPayload<object>) => ({ id: t.id, name: t.name, slug: t.slug, skill: t.skill, examType: t.examType ?? undefined, questionsCount: t.questionsCount, parentId: t.parentId });
contentRouter.get('/skill-tags', handler(async () => (await prisma.skillTag.findMany({ orderBy: [{ skill: 'asc' }, { name: 'asc' }] })).map(tagRow)));
const tagBody = z.object({ name: z.string().trim().min(1).max(160), slug: z.string().max(120).optional(), skill: SKILL, examType: EXAM.nullish(), parentId: uuid.nullish() });
contentRouter.post('/skill-tags', handler(async (req) => {
  const b = parse(tagBody, req.body);
  return tagRow(await prisma.skillTag.create({ data: { ...b, slug: b.slug ? slugify(b.slug) : uniqueSlug(b.name) } }));
}));
contentRouter.patch('/skill-tags/:id', handler(async (req) => {
  const b = parse(tagBody.partial(), req.body);
  return tagRow(await prisma.skillTag.update({ where: { id: idOf(req) }, data: { ...b, slug: b.slug ? slugify(b.slug) : undefined } }));
}));
contentRouter.delete('/skill-tags/:id', handler(async (req) => {
  const id = idOf(req);
  const used = await prisma.question.count({ where: { tagIds: { has: id }, deletedAt: null } });
  if (used) throw badRequest(`Nhãn đang gắn với ${used} câu hỏi`, 'IN_USE');
  await prisma.skillTag.delete({ where: { id } });
  return { ok: true };
}));

// ============================ NGỮ PHÁP ============================
type Rule = { title: string; detailMd?: string; detail?: string; example?: string };
const grammarRow = (g: Prisma.GrammarTopicGetPayload<object>, qCount = 0) => ({
  id: g.id,
  slug: g.slug,
  title: g.title,
  level: g.level ?? '',
  category: g.category,
  summary: g.summary,
  rules: ((g.rules ?? []) as Rule[]).map((r) => ({ title: r.title, detail: r.detail ?? r.detailMd ?? '', example: r.example ?? '' })),
  questionsCount: qCount,
  progress: 0,
  status: g.status,
  orderIndex: g.orderIndex,
  tagId: g.tagId ?? undefined,
});
contentRouter.get('/grammar', handler(async () => {
  const rows = await prisma.grammarTopic.findMany({ where: { deletedAt: null }, orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }] });
  const counts = await prisma.question.groupBy({ by: ['tagIds'], where: { deletedAt: null, skill: 'GRAMMAR' }, _count: true });
  const byTag = new Map<string, number>();
  for (const c of counts) for (const t of c.tagIds) byTag.set(t, (byTag.get(t) ?? 0) + c._count);
  return rows.map((g) => grammarRow(g, g.tagId ? (byTag.get(g.tagId) ?? 0) : 0));
}));
const grammarBody = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().max(120).optional(),
  category: z.string().trim().min(1).max(40),
  level: CEFR.nullish(),
  summary: z.string().default(''),
  rules: z.array(z.object({ title: z.string(), detail: z.string().default(''), example: z.string().default('') })).default([]),
  tagId: uuid.nullish(),
  orderIndex: z.number().int().optional(),
  status: CONTENT_STATUS.optional(),
});
const grammarData = (b: Partial<z.infer<typeof grammarBody>>) => ({ ...b, rules: b.rules?.map((r) => ({ title: r.title, detailMd: r.detail, example: r.example })) });
contentRouter.post('/grammar', handler(async (req) => {
  const b = parse(grammarBody, req.body);
  return grammarRow(await prisma.grammarTopic.create({ data: { ...grammarData(b), rules: grammarData(b).rules ?? [], slug: b.slug ? slugify(b.slug) : uniqueSlug(b.title), status: b.status ?? 'PUBLISHED' } as Prisma.GrammarTopicUncheckedCreateInput }));
}));
contentRouter.patch('/grammar/:id', handler(async (req) => {
  const b = parse(grammarBody.partial(), req.body);
  return grammarRow(await prisma.grammarTopic.update({ where: { id: idOf(req) }, data: { ...grammarData(b), slug: b.slug ? slugify(b.slug) : undefined } }));
}));
contentRouter.delete('/grammar/:id', handler(async (req) => {
  await prisma.grammarTopic.update({ where: { id: idOf(req) }, data: { deletedAt: new Date() } });
  return { ok: true };
}));

// ============================ TỪ VỰNG ============================
const topicRow = (t: Prisma.VocabTopicGetPayload<object>) => ({ id: t.id, slug: t.slug, name: t.name, icon: t.icon ?? '📘', total: t.wordsCount, learned: 0, gradient: t.themeGradient ?? gradientOf(t.slug), examType: t.examType ?? undefined, level: t.level ?? undefined, isFree: t.isFree, orderIndex: t.orderIndex });
contentRouter.get('/vocab-topics', handler(async () => (await prisma.vocabTopic.findMany({ where: { deletedAt: null }, orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }] })).map(topicRow)));
const topicBody = z.object({ name: z.string().trim().min(1).max(120), slug: z.string().max(120).optional(), icon: z.string().max(40).nullish(), themeGradient: z.string().max(80).nullish(), examType: EXAM.nullish(), level: CEFR.nullish(), isFree: z.boolean().optional(), orderIndex: z.number().int().optional() });
contentRouter.post('/vocab-topics', handler(async (req) => {
  const b = parse(topicBody, req.body);
  return topicRow(await prisma.vocabTopic.create({ data: { ...b, slug: b.slug ? slugify(b.slug) : uniqueSlug(b.name) } }));
}));
contentRouter.patch('/vocab-topics/:id', handler(async (req) => {
  const b = parse(topicBody.partial(), req.body);
  return topicRow(await prisma.vocabTopic.update({ where: { id: idOf(req) }, data: { ...b, slug: b.slug ? slugify(b.slug) : undefined } }));
}));
contentRouter.delete('/vocab-topics/:id', handler(async (req) => {
  await prisma.vocabTopic.update({ where: { id: idOf(req) }, data: { deletedAt: new Date() } });
  return { ok: true };
}));

const wordRow = (w: Prisma.WordGetPayload<{ include: { topic: { select: { name: true } } } }>) => ({
  id: w.id,
  word: w.headword,
  ipa: w.ipaUs ?? w.ipaUk ?? '',
  ipaUk: w.ipaUk ?? undefined,
  ipaUs: w.ipaUs ?? undefined,
  pos: w.pos,
  meaningVi: w.meaningVi,
  meaningEn: w.meaningEn ?? undefined,
  example: w.exampleEn ?? '',
  exampleVi: w.exampleVi ?? undefined,
  topic: w.topic?.name ?? '',
  topicId: w.topicId ?? undefined,
  level: w.level ?? undefined,
  audioUrl: w.audioUrl ?? undefined,
  imageUrl: w.imageUrl ?? undefined,
});
contentRouter.get('/words', handler(async (req) => {
  const q = parse(z.object({ topicId: uuid.optional(), q: z.string().optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(1000).default(500) }), req.query);
  const where: Prisma.WordWhereInput = { ...(q.topicId ? { topicId: q.topicId } : {}), ...(q.q ? { headword: { contains: q.q, mode: 'insensitive' } } : {}) };
  const [items, total] = await Promise.all([
    prisma.word.findMany({ where, include: { topic: { select: { name: true } } }, orderBy: [{ topicId: 'asc' }, { orderInTopic: 'asc' }, { headword: 'asc' }], skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
    prisma.word.count({ where }),
  ]);
  return { items: items.map(wordRow), total, page: q.page, pageSize: q.pageSize };
}));
const wordBody = z.object({ topicId: uuid.nullish(), word: z.string().trim().min(1).max(80), pos: z.string().trim().min(1).max(12), ipaUk: z.string().max(80).nullish(), ipaUs: z.string().max(80).nullish(), ipa: z.string().max(80).nullish(), meaningVi: z.string().min(1), meaningEn: z.string().nullish(), example: z.string().nullish(), exampleVi: z.string().nullish(), audioUrl: z.string().nullish(), imageUrl: z.string().nullish(), level: CEFR.nullish() });
const wordData = (b: Partial<z.infer<typeof wordBody>>) => {
  const { word, ipa, example, ...rest } = b;
  return { ...rest, ...(word !== undefined ? { headword: word } : {}), ...(example !== undefined ? { exampleEn: example } : {}), ...(ipa && !b.ipaUs ? { ipaUs: ipa } : {}) };
};
async function refreshTopicCount(topicId?: string | null) {
  if (!topicId) return;
  await prisma.vocabTopic.update({ where: { id: topicId }, data: { wordsCount: await prisma.word.count({ where: { topicId } }) } });
}
contentRouter.post('/words', handler(async (req) => {
  const b = parse(wordBody, req.body);
  const w = await prisma.word.create({ data: wordData(b) as Prisma.WordUncheckedCreateInput, include: { topic: { select: { name: true } } } });
  await refreshTopicCount(w.topicId);
  return wordRow(w);
}));
contentRouter.patch('/words/:id', handler(async (req) => {
  const b = parse(wordBody.partial(), req.body);
  const before = await prisma.word.findUniqueOrThrow({ where: { id: idOf(req) }, select: { topicId: true } });
  const w = await prisma.word.update({ where: { id: idOf(req) }, data: wordData(b), include: { topic: { select: { name: true } } } });
  if (before.topicId !== w.topicId) await Promise.all([refreshTopicCount(before.topicId), refreshTopicCount(w.topicId)]);
  return wordRow(w);
}));
contentRouter.delete('/words/:id', handler(async (req) => {
  const w = await prisma.word.delete({ where: { id: idOf(req) } });
  await refreshTopicCount(w.topicId);
  return { ok: true };
}));

// ============================ BÀI VIẾT (CMS) ============================
const postRow = (p: Prisma.PostGetPayload<{ include: { author: { select: { fullName: true; avatarUrl: true } } } }>) => ({
  id: p.id,
  slug: p.slug,
  kind: p.kind,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category ?? '',
  categorySlug: p.categorySlug ?? '',
  author: p.author?.fullName ?? 'OrbiLingo',
  authorAvatar: p.author?.avatarUrl ?? undefined,
  date: (p.publishedAt ?? p.createdAt).toISOString().slice(0, 10),
  readMin: p.readMinutes,
  views: p.viewsCount,
  gradient: gradientOf(p.slug),
  coverUrl: p.coverUrl ?? undefined,
  content: Array.isArray(p.contentBlocks) ? (p.contentBlocks as string[]) : [],
  tags: p.tags,
  status: p.status,
  examType: p.examType ?? undefined,
  seriesOrder: p.seriesOrder ?? undefined,
});
const postInclude = { author: { select: { fullName: true, avatarUrl: true } } } as const;
contentRouter.get('/posts', handler(async () => (await prisma.post.findMany({ where: { deletedAt: null }, include: postInclude, orderBy: { createdAt: 'desc' } })).map(postRow)));
const postBody = z.object({
  title: z.string().trim().min(2).max(220),
  slug: z.string().max(160).optional(),
  kind: z.enum(['BLOG', 'EXAM_GUIDE', 'NEWS']).default('BLOG'),
  excerpt: z.string().max(400).default(''),
  content: z.array(z.string()).default([]),
  category: z.string().max(60).nullish(),
  categorySlug: z.string().max(60).nullish(),
  tags: z.array(z.string().max(40)).optional(),
  examType: EXAM.nullish(),
  seriesOrder: z.number().int().nullish(),
  coverUrl: z.string().nullish(),
  readMin: z.number().int().min(1).max(120).optional(),
  status: CONTENT_STATUS.optional(),
});
const postData = (b: Partial<z.infer<typeof postBody>>) => {
  const { content, readMin, ...rest } = b;
  return {
    ...rest,
    ...(content !== undefined ? { contentBlocks: content } : {}),
    ...(readMin !== undefined ? { readMinutes: readMin } : content ? { readMinutes: Math.max(1, Math.round(content.join(' ').split(/\s+/).length / 200)) } : {}),
    ...(rest.category && !rest.categorySlug ? { categorySlug: slugify(rest.category) } : {}),
    ...(b.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
  };
};
contentRouter.post('/posts', handler(async (req) => {
  const b = parse(postBody, req.body);
  const p = await prisma.post.create({ data: { ...postData(b), contentBlocks: b.content, readMinutes: postData(b).readMinutes ?? 1, slug: b.slug ? slugify(b.slug) : uniqueSlug(b.title), authorId: me(req).id } as Prisma.PostUncheckedCreateInput, include: postInclude });
  await audit(req, 'POST_CREATE', 'post', p.id, { after: { title: p.title } });
  return postRow(p);
}));
contentRouter.patch('/posts/:id', handler(async (req) => {
  const b = parse(postBody.partial(), req.body);
  const p = await prisma.post.update({ where: { id: idOf(req) }, data: { ...postData(b), slug: b.slug ? slugify(b.slug) : undefined }, include: postInclude });
  return postRow(p);
}));
contentRouter.delete('/posts/:id', handler(async (req) => {
  const p = await prisma.post.update({ where: { id: idOf(req) }, data: { deletedAt: new Date() } });
  await audit(req, 'POST_DELETE', 'post', p.id, { severity: 'WARN', after: { title: p.title } });
  return { ok: true };
}));

// ============================ FAQ ============================
const faqRow = (f: Prisma.FaqGetPayload<object>) => ({ id: f.id, question: f.question, answer: f.answer, category: f.category, keywords: f.keywords, showInFaq: f.showInFaq, showInChat: f.showInChat, orderIndex: f.orderIndex });
contentRouter.get('/faqs', handler(async () => (await prisma.faq.findMany({ orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }] })).map(faqRow)));
const faqBody = z.object({ question: z.string().trim().min(2), answer: z.string().trim().min(1), category: z.string().trim().min(1).max(40), keywords: z.array(z.string()).optional(), showInFaq: z.boolean().optional(), showInChat: z.boolean().optional(), orderIndex: z.number().int().optional() });
contentRouter.post('/faqs', handler(async (req) => faqRow(await prisma.faq.create({ data: { ...parse(faqBody, req.body), chatTexts: [] } }))));
contentRouter.patch('/faqs/:id', handler(async (req) => faqRow(await prisma.faq.update({ where: { id: idOf(req) }, data: parse(faqBody.partial(), req.body) }))));
contentRouter.delete('/faqs/:id', handler(async (req) => {
  await prisma.faq.delete({ where: { id: idOf(req) } });
  return { ok: true };
}));

// ============================ TÀI LIỆU MỞ (materials công khai) ============================
const fmtSize = (b?: bigint | null) => {
  if (!b) return '';
  const n = Number(b);
  return n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
};
const resourceRow = (m: Prisma.MaterialGetPayload<object>) => ({
  id: m.id,
  title: m.title,
  type: (m.type === 'DOC' ? 'DOCX' : m.type) as 'PDF' | 'DOCX' | 'AUDIO' | 'VIDEO' | 'LINK',
  category: m.category ?? '',
  pages: m.pages ?? 0,
  downloads: m.downloadsCount,
  size: fmtSize(m.sizeBytes),
  description: m.description ?? '',
  fileUrl: m.fileUrl ?? undefined,
  isVip: m.isVip,
});
contentRouter.get('/resources', handler(async () => (await prisma.material.findMany({ where: { classId: null, deletedAt: null }, orderBy: { createdAt: 'desc' } })).map(resourceRow)));
const resourceBody = z.object({ title: z.string().trim().min(2).max(200), description: z.string().nullish(), type: z.enum(['PDF', 'DOCX', 'DOC', 'AUDIO', 'VIDEO', 'LINK']), category: z.string().max(60).nullish(), fileUrl: z.string().nullish(), sizeBytes: z.number().int().nonnegative().nullish(), pages: z.number().int().nonnegative().nullish(), isVip: z.boolean().optional() });
const resourceData = (b: Partial<z.infer<typeof resourceBody>>) => ({ ...b, ...(b.type ? { type: b.type === 'DOCX' ? 'DOC' : b.type } : {}), ...(b.sizeBytes != null ? { sizeBytes: BigInt(b.sizeBytes) } : {}) });
contentRouter.post('/resources', handler(async (req) => {
  const b = parse(resourceBody, req.body);
  return resourceRow(await prisma.material.create({ data: { ...resourceData(b), type: resourceData(b).type!, uploadedById: me(req).id } as Prisma.MaterialUncheckedCreateInput }));
}));
contentRouter.patch('/resources/:id', handler(async (req) => resourceRow(await prisma.material.update({ where: { id: idOf(req) }, data: resourceData(parse(resourceBody.partial(), req.body)) as Prisma.MaterialUncheckedUpdateInput }))));
contentRouter.delete('/resources/:id', handler(async (req) => {
  await prisma.material.update({ where: { id: idOf(req) }, data: { deletedAt: new Date() } });
  return { ok: true };
}));
