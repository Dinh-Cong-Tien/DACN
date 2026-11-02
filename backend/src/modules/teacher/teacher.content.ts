/**
 * Học liệu do giáo viên soạn (vòng đời nội dung — mục II [CƠ BẢN] + luồng 10.7 #11):
 * DRAFT → gửi duyệt (PENDING_REVIEW) → trưởng bộ môn duyệt (PUBLISHED) / từ chối kèm góp ý (REJECTED) → sửa, gửi lại.
 * Chỉ tác giả thấy và sửa nội dung chưa xuất bản của mình; nội dung đã xuất bản do trưởng bộ môn hiệu đính.
 * Gắn dưới /api/v1/teacher/content (đã qua auth + allow TEACHER/HEAD_TEACHER).
 */
import { Router, type Request } from 'express';
import { z } from 'zod';
import type { ContentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest, conflict, handler, me, notFound, parse } from '../../core/http';
import { listQuestions, toQuestionRow } from '../head/head.routes';
import { notify } from '../admin/audit';
import { questionBody, setTestQuestions, testRow, toQuestionData, uniqueSlug } from '../admin/admin.content';

export const contentRouter = Router();

const uuid = z.string().uuid();
const idOf = (req: Request) => parse(uuid, req.params.id);
/** Trạng thái tác giả còn được sửa/xoá */
const EDITABLE: ContentStatus[] = ['DRAFT', 'REJECTED'];
const qInclude = { passage: { select: { id: true, title: true } } } as const;

async function ownQuestion(req: Request) {
  const q = await prisma.question.findFirst({ where: { id: idOf(req), authorId: me(req).id, deletedAt: null } });
  if (!q) throw notFound('Câu hỏi');
  return q;
}
async function ownTest(req: Request) {
  const t = await prisma.mockTest.findFirst({ where: { id: idOf(req), authorId: me(req).id, deletedAt: null } });
  if (!t) throw notFound('Đề kiểm tra');
  return t;
}
const mustEditable = (status: ContentStatus) => {
  if (!EDITABLE.includes(status))
    throw conflict(status === 'PENDING_REVIEW' ? 'Nội dung đang chờ duyệt — rút lại trước khi sửa' : 'Nội dung đã xuất bản/lưu trữ — đề nghị trưởng bộ môn hiệu đính', 'NOT_EDITABLE');
};

/** Câu khách quan phải có phương án + đáp án đúng nằm trong phương án */
function validateQuestion(q: { type: string; stem: string; options: Prisma.JsonValue; correctAnswer: Prisma.JsonValue }) {
  if (q.type === 'ESSAY' || q.type === 'SPEAKING_RESPONSE') return;
  const opts = (q.options ?? []) as { key: string; text: string }[];
  const key = ((q.correctAnswer as { keys?: string[] } | null)?.keys ?? [])[0];
  if (opts.filter((o) => o.text.trim()).length < 2) throw badRequest('Câu trắc nghiệm cần ít nhất 2 phương án');
  if (!key || !opts.some((o) => o.key === key && o.text.trim())) throw badRequest('Chọn đáp án đúng nằm trong các phương án');
}

/** Báo trưởng bộ môn của giáo viên có học liệu mới chờ duyệt */
async function notifyHeads(tx: Prisma.TransactionClient, authorId: string, title: string, refType: string, refId: string) {
  const u = await tx.user.findUnique({ where: { id: authorId }, select: { fullName: true, department: { select: { headId: true } } } });
  if (!u?.department?.headId) return;
  await notify([u.department.headId], { type: 'REVIEW', title: 'Học liệu mới chờ duyệt', message: `${u.fullName} gửi "${title.slice(0, 120)}"`, link: '/head/approvals', refType, refId }, tx);
}

// ============================ CÂU HỎI ============================
contentRouter.get(
  '/questions',
  handler((req) => listQuestions(req.query, { authorId: me(req).id }))
);

/** Ngân hàng để ghép đề: câu đã xuất bản + câu của chính mình (chưa lưu trữ) */
contentRouter.get(
  '/bank',
  handler((req) => listQuestions(req.query, { OR: [{ status: 'PUBLISHED' }, { authorId: me(req).id, status: { not: 'ARCHIVED' } }] }))
);

const teacherQuestionBody = questionBody.omit({ status: true, rubricId: true, tagIds: true, passageId: true, orderInPassage: true });

contentRouter.post(
  '/questions',
  handler(async (req) => {
    const b = parse(teacherQuestionBody, req.body);
    const q = await prisma.question.create({
      data: { ...toQuestionData(b), authorId: me(req).id, status: 'DRAFT', source: 'ORIGINAL' } as Prisma.QuestionUncheckedCreateInput,
      include: qInclude,
    });
    return toQuestionRow(q);
  })
);
contentRouter.patch(
  '/questions/:id',
  handler(async (req) => {
    const cur = await ownQuestion(req);
    mustEditable(cur.status);
    const b = parse(teacherQuestionBody.partial(), req.body);
    const q = await prisma.question.update({ where: { id: cur.id }, data: toQuestionData(b) as Prisma.QuestionUncheckedUpdateInput, include: qInclude });
    return toQuestionRow(q);
  })
);
contentRouter.delete(
  '/questions/:id',
  handler(async (req) => {
    const cur = await ownQuestion(req);
    mustEditable(cur.status);
    const inTests = await prisma.mockTestQuestion.count({ where: { questionId: cur.id, test: { deletedAt: null } } });
    if (inTests) throw conflict(`Câu hỏi đang nằm trong ${inTests} đề, hãy bỏ khỏi đề trước khi xoá`, 'IN_USE');
    await prisma.question.update({ where: { id: cur.id }, data: { deletedAt: new Date() } });
    return { ok: true };
  })
);

// ============================ ĐỀ KIỂM TRA ============================
const teacherTestBody = z.object({
  title: z.string().trim().min(2).max(200),
  examType: z.enum(['TOEIC', 'VSTEP']),
  kind: z.enum(['MINI', 'QUIZ']).default('MINI'),
  level: z.string().max(20).nullish(),
  durationMin: z.number().int().min(5).max(240),
  isFree: z.boolean().default(true),
});
const testWithNote = (t: Prisma.MockTestGetPayload<object>) => ({ ...testRow(t), reviewNote: t.reviewNote ?? undefined, updatedAt: t.updatedAt.toISOString() });

contentRouter.get(
  '/tests',
  handler(async (req) => (await prisma.mockTest.findMany({ where: { authorId: me(req).id, deletedAt: null }, orderBy: { updatedAt: 'desc' } })).map(testWithNote))
);
contentRouter.get(
  '/tests/:id',
  handler(async (req) => {
    const t = await ownTest(req);
    const qs = await prisma.mockTestQuestion.findMany({ where: { testId: t.id }, orderBy: { questionNo: 'asc' }, include: { question: { include: qInclude } } });
    return { ...testWithNote(t), questions: qs.map((m) => ({ ...toQuestionRow(m.question), questionNo: m.questionNo, points: Number(m.points) })) };
  })
);
contentRouter.post(
  '/tests',
  handler(async (req) => {
    const b = parse(teacherTestBody, req.body);
    const t = await prisma.mockTest.create({ data: { ...b, slug: uniqueSlug(b.title), totalQuestions: 0, sections: [], authorId: me(req).id, status: 'DRAFT', year: new Date().getFullYear() } });
    return testWithNote(t);
  })
);
contentRouter.patch(
  '/tests/:id',
  handler(async (req) => {
    const cur = await ownTest(req);
    mustEditable(cur.status);
    const b = parse(teacherTestBody.partial(), req.body);
    if (b.examType && b.examType !== cur.examType && cur.totalQuestions) throw badRequest('Đề đã có câu hỏi, không đổi được kỳ thi');
    return testWithNote(await prisma.mockTest.update({ where: { id: cur.id }, data: b }));
  })
);
contentRouter.put(
  '/tests/:id/questions',
  handler(async (req) => {
    const cur = await ownTest(req);
    mustEditable(cur.status);
    const { questionIds } = parse(z.object({ questionIds: z.array(uuid).max(200) }), req.body);
    const count = await setTestQuestions(cur.id, questionIds, 1, { OR: [{ status: 'PUBLISHED' }, { authorId: me(req).id, status: { in: ['DRAFT', 'REJECTED', 'PENDING_REVIEW'] } }] });
    return { count };
  })
);
contentRouter.delete(
  '/tests/:id',
  handler(async (req) => {
    const cur = await ownTest(req);
    mustEditable(cur.status);
    await prisma.mockTest.update({ where: { id: cur.id }, data: { deletedAt: new Date() } });
    return { ok: true };
  })
);

// ============================ GỬI DUYỆT / RÚT LẠI ============================
contentRouter.post(
  '/questions/:id/submit',
  handler(async (req) => {
    const cur = await ownQuestion(req);
    mustEditable(cur.status);
    validateQuestion(cur);
    return prisma.$transaction(async (tx) => {
      await tx.question.update({ where: { id: cur.id }, data: { status: 'PENDING_REVIEW' } });
      await notifyHeads(tx, cur.authorId!, cur.stem, 'QUESTION', cur.id);
      return { id: cur.id, status: 'PENDING_REVIEW' as const };
    });
  })
);
/** Gửi đề: các câu mới của chính giáo viên trong đề được gửi duyệt cùng đề */
contentRouter.post(
  '/tests/:id/submit',
  handler(async (req) => {
    const cur = await ownTest(req);
    mustEditable(cur.status);
    if (!cur.totalQuestions) throw badRequest('Đề chưa có câu hỏi nào, hãy thêm câu trước khi gửi duyệt');
    const own = await prisma.mockTestQuestion.findMany({ where: { testId: cur.id, question: { authorId: me(req).id, status: { in: EDITABLE } } }, include: { question: true } });
    own.forEach((m) => validateQuestion(m.question));
    return prisma.$transaction(async (tx) => {
      await tx.mockTest.update({ where: { id: cur.id }, data: { status: 'PENDING_REVIEW' } });
      if (own.length) await tx.question.updateMany({ where: { id: { in: own.map((m) => m.questionId) } }, data: { status: 'PENDING_REVIEW' } });
      await notifyHeads(tx, cur.authorId!, cur.title, 'TEST', cur.id);
      return { id: cur.id, status: 'PENDING_REVIEW' as const, questions: own.length };
    });
  })
);
contentRouter.post(
  '/:kind(questions|tests)/:id/withdraw',
  handler(async (req) => {
    const isTest = req.params.kind === 'tests';
    const cur = isTest ? await ownTest(req) : await ownQuestion(req);
    if (cur.status !== 'PENDING_REVIEW') throw conflict('Chỉ rút lại được nội dung đang chờ duyệt');
    await prisma.$transaction(async (tx) => {
      if (isTest) {
        await tx.mockTest.update({ where: { id: cur.id }, data: { status: 'DRAFT' } });
        const own = await tx.mockTestQuestion.findMany({ where: { testId: cur.id, question: { authorId: me(req).id, status: 'PENDING_REVIEW' } }, select: { questionId: true } });
        if (own.length) await tx.question.updateMany({ where: { id: { in: own.map((o) => o.questionId) } }, data: { status: 'DRAFT' } });
      } else await tx.question.update({ where: { id: cur.id }, data: { status: 'DRAFT' } });
    });
    return { id: cur.id, status: 'DRAFT' as const };
  })
);
