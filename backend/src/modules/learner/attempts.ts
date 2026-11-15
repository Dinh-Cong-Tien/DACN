/**
 * Exam / Practice engine phía học viên — luồng #3 (bắt đầu), #4 (auto-save), #5 (nộp bài), #6 (nộp Viết/Nói) mục 10.7.
 */
import { Router } from 'express';
import { pid } from './learner.shared';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import type { AttemptMode, ExamPart, ExamType, MistakeCause, Question } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { badRequest, conflict, forbidden, handler, me, notFound, pageQuery, paged, parse } from '../../core/http';
import { planOf } from '../../core/dto';
import {
  PART_NAME,
  correctKeyOf,
  feToParts,
  findTest,
  isListeningPart,
  isObjective,
  partToFe,
  recordActivity,
  selectedKeyOf,
  toIMockTest,
  toeicScaled,
  vstepCefr,
  vstepScaled,
  type Tx,
} from './learner.shared';
import { evaluateAchievements } from './progress';
import { completedAttempts } from '../catalog/counts';
import { broadcast } from '../../lib/realtime';

export const attemptsRouter = Router();

/** Đẩy số lượt làm mới của đề qua WebSocket → thẻ đề / trang chi tiết đề cập nhật ngay, không cần F5 */
export async function pushTestAttempts(testId: string, slug: string) {
  try {
    const n = (await completedAttempts([testId])).get(testId) ?? 0;
    broadcast({ type: 'test.attempts', testId, slug, attempts: n });
  } catch {
    /* không chặn luồng nộp bài */
  }
}

const vstepSkill = (p: ExamPart) => (p.startsWith('VSTEP_L') ? 'L' : p.startsWith('VSTEP_R') ? 'R' : p.startsWith('VSTEP_W') ? 'W' : p.startsWith('VSTEP_S') ? 'S' : null);
const half = (x: number) => Math.round(x * 2) / 2;

/**
 * Điểm VSTEP đề full theo quy chế: điểm tổng = trung bình 4 kỹ năng (thang 10), làm tròn 0,5.
 * - Nghe, Đọc: tự chấm theo tỉ lệ câu đúng.
 * - Viết: Task 1 hệ số 1, Task 2 hệ số 2. Nói: trung bình các phần. Điểm do giáo viên chấm (attempt_answers.score).
 * - Câu Viết/Nói bỏ trống = 0. Còn bài đã nộp mà chưa chấm → trạng thái GRADING, chưa có điểm tổng/CEFR.
 * Gọi khi nộp bài, khi giáo viên công bố điểm, khi trưởng bộ môn điều chỉnh điểm.
 */
export async function recomputeVstep(tx: Tx, attemptId: string) {
  const at = await tx.examAttempt.findUnique({ where: { id: attemptId }, include: { test: { select: { examType: true } } } });
  if (!at || at.mode !== 'FULL' || at.test?.examType !== 'VSTEP' || !at.submittedAt) return;
  const rows = await tx.attemptAnswer.findMany({ where: { attemptId }, include: { question: { select: { part: true, type: true } } } });
  const obj = { L: { c: 0, t: 0 }, R: { c: 0, t: 0 } };
  const manual: Record<'W' | 'S', { w: number; v: number }[]> = { W: [], S: [] };
  const waiting = { W: false, S: false };
  for (const r of rows) {
    const k = vstepSkill(r.question.part);
    if (!k) continue;
    if (k === 'L' || k === 'R') {
      if (!isObjective(r.question)) continue;
      obj[k].t += 1;
      if (r.isCorrect) obj[k].c += 1;
      continue;
    }
    const answered = !!(r.textAnswer?.trim() || r.audioUrl);
    if (answered && r.score === null) waiting[k] = true;
    manual[k].push({ w: r.question.part === 'VSTEP_W2' ? 2 : 1, v: answered && r.score !== null ? Number(r.score) : 0 });
  }
  const wavg = (xs: { w: number; v: number }[]) => (xs.length ? half(xs.reduce((a, x) => a + x.w * x.v, 0) / xs.reduce((a, x) => a + x.w, 0)) : null);
  const L = obj.L.t ? vstepScaled(obj.L.c, obj.L.t) : null;
  const R = obj.R.t ? vstepScaled(obj.R.c, obj.R.t) : null;
  // Kỹ năng còn bài chưa chấm → chưa có điểm kỹ năng đó
  const W = waiting.W ? null : wavg(manual.W);
  const S = waiting.S ? null : wavg(manual.S);
  const pending = waiting.W || waiting.S;
  const skills = [L, R, W, S].filter((x): x is number => x !== null);
  const total = pending || !skills.length ? null : half(skills.reduce((a, b) => a + b, 0) / skills.length);
  await tx.examAttempt.update({
    where: { id: attemptId },
    data: {
      scoreListening: L,
      scoreReading: R,
      scoreWriting: W,
      scoreSpeaking: S,
      scoreTotal: total,
      cefrResult: (total === null ? null : vstepCefr(total)) as never,
      status: pending ? 'GRADING' : 'COMPLETED',
    },
  });
}


type OrderItem = { questionId: string; version: number };

const startBody = z.object({
  /** id hoặc slug đề; bỏ trống = luyện theo Part từ ngân hàng câu hỏi */
  testId: z.string().optional(),
  mode: z.enum(['FULL', 'PRACTICE']).default('FULL'),
  /** Id phần theo frontend (PART_1…PART_7, VSTEP_LISTENING…) */
  parts: z.array(z.string()).optional(),
  /** Phút làm bài; null = không giới hạn */
  minutes: z.number().int().min(1).max(300).nullable().optional(),
  /** Số câu khi luyện theo Part không gắn đề */
  questionCount: z.number().int().min(1).max(100).optional(),
  examType: z.enum(['TOEIC', 'VSTEP']).optional(),
  assignmentId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  /** true = bỏ lượt đang dở (ABANDONED) và tạo lượt mới */
  restart: z.boolean().optional(),
  /** Làm trên các câu chỉ định (vd. một đề Viết/Nói tự luyện để nộp giáo viên chấm) */
  questionIds: z.array(z.string().uuid()).min(1).max(50).optional(),
});

const answerItem = z.object({
  questionId: z.string().uuid(),
  selectedKey: z.string().max(20).nullable().optional(),
  textAnswer: z.string().max(20000).nullable().optional(),
  audioUrl: z.string().max(2000).nullable().optional(),
  isFlagged: z.boolean().optional(),
  timeSpentMs: z.number().int().min(0).max(3_600_000).optional(),
});
const saveBody = z.object({ answers: z.array(answerItem).max(250).default([]), timeSpentSec: z.number().int().min(0).optional() });
const submitBody = saveBody.extend({ clientInfo: z.record(z.unknown()).optional() });

const questionInclude = { passage: true } as const;

/** Lấy câu hỏi theo thứ tự snapshot */
async function loadOrdered(order: OrderItem[]) {
  const ids = order.map((o) => o.questionId);
  const qs = await prisma.question.findMany({ where: { id: { in: ids } }, include: questionInclude });
  return { ids, qs };
}

/** Chọn câu luyện theo Part: Part có passage lấy trọn nhóm câu tới khi đủ số câu. */
async function pickPracticeQuestions(parts: ExamPart[], perPart: number, examType?: ExamType) {
  const out: string[] = [];
  for (const part of parts) {
    const pool = await prisma.question.findMany({
      // Luyện theo Part = câu đúng dạng đề (Nghe/Đọc); bài tập Ngữ pháp / Từ vựng có trang luyện riêng
      where: { part, status: 'PUBLISHED', deletedAt: null, skill: { in: ['LISTENING', 'READING'] }, type: { notIn: ['ESSAY', 'SPEAKING_RESPONSE'] }, ...(examType ? { examType } : {}) },
      select: { id: true, passageId: true, orderInPassage: true },
    });
    // gom theo passage, xáo trộn nhóm
    const groups = new Map<string, { id: string; o: number }[]>();
    for (const q of pool) {
      const k = q.passageId ?? q.id;
      const g = groups.get(k) ?? [];
      g.push({ id: q.id, o: q.orderInPassage ?? 0 });
      groups.set(k, g);
    }
    const shuffled = [...groups.values()].sort(() => Math.random() - 0.5);
    let n = 0;
    for (const g of shuffled) {
      if (n >= perPart) break;
      g.sort((a, b) => a.o - b.o).forEach((x) => out.push(x.id));
      n += g.length;
    }
  }
  return out;
}

/** Trạng thái lượt làm + đề (ẩn đáp án) — dùng cho cả start và resume */
async function attemptPayload(attemptId: string, userId: string) {
  const at = await prisma.examAttempt.findUnique({ where: { id: attemptId }, include: { test: true, attemptAnswerAttempts: true } });
  if (!at || at.userId !== userId) throw notFound('Lượt làm bài');
  const order = at.questionOrder as unknown as OrderItem[];
  const { ids, qs } = await loadOrdered(order);
  const done = at.status !== 'IN_PROGRESS';
  const examType = at.test?.examType ?? qs[0]?.examType ?? 'TOEIC';
  const partNames = [...new Set(at.selectedParts.map(partToFe))].map((p) => PART_NAME[p]?.split(' · ')[0] ?? p).join(', ');
  const title = at.test ? (at.mode === 'FULL' ? at.test.title : `${at.test.title} · Luyện ${partNames}`) : `Luyện ${partNames}`;
  const test = toIMockTest(
    { id: at.test?.id ?? at.id, slug: at.test?.slug ?? at.id, title, examType, durationMinutes: at.timeLimitSec ? Math.round(at.timeLimitSec / 60) : 0, targetLevel: at.test?.level },
    ids,
    qs,
    // Phiên luyện Part (PracticeEngine) chấm ngay từng câu nên trả kèm đáp án; thi thử chỉ lộ đáp án sau khi nộp
    done || at.mode === 'PART_SESSION'
  );
  return {
    attempt: {
      id: at.id,
      testId: at.testId,
      mode: at.mode,
      status: at.status,
      startedAt: at.startedAt.toISOString(),
      timeLimitSec: at.timeLimitSec,
      timeSpentSec: at.timeSpentSec,
      setup: { mode: at.mode === 'FULL' ? 'FULL' : 'PRACTICE', parts: [...new Set(at.selectedParts.map(partToFe))], minutes: at.timeLimitSec ? Math.round(at.timeLimitSec / 60) : null },
      answers: at.attemptAnswerAttempts.map((a) => ({
        questionId: a.questionId,
        selectedKey: selectedKeyOf(a.selected),
        textAnswer: a.textAnswer ?? undefined,
        audioUrl: a.audioUrl ?? undefined,
        isFlagged: a.isFlagged,
        answeredAt: a.answeredAt?.toISOString(),
      })),
    },
    test,
  };
}

attemptsRouter.post(
  '/attempts',
  handler(async (req) => {
    const user = me(req);
    const body = parse(startBody, req.body);
    const test = body.testId ? await findTest(body.testId) : null;
    if (test && test.status !== 'PUBLISHED') throw forbidden('Đề thi chưa được phát hành');
    // Luồng #3: kiểm tra quyền đề VIP theo gói
    if (test && !test.isFree && (await planOf(user.id)) !== 'VIP') throw forbidden('Đề này dành cho gói VIP');

    // Bài giao: phải là thành viên lớp
    if (body.assignmentId) {
      const sub = await prisma.assignmentSubmission.findUnique({ where: { assignmentId_studentId: { assignmentId: body.assignmentId, studentId: user.id } } });
      if (!sub) throw forbidden('Bạn không được giao bài này');
    }

    // Lượt đang dở cùng đề → trả lại để làm tiếp (partial unique trong DB)
    if (test) {
      const open = await prisma.examAttempt.findFirst({ where: { userId: user.id, testId: test.id, status: 'IN_PROGRESS' } });
      if (open) {
        // Chỉ làm tiếp khi cùng cấu hình (chế độ, các Part, bài giao); khác thì huỷ lượt cũ và mở lượt mới
        const wantMode: AttemptMode = body.lessonId ? 'LESSON_QUIZ' : body.mode === 'FULL' ? 'FULL' : 'PRACTICE';
        const wantParts = wantMode === 'PRACTICE' && body.parts?.length ? [...new Set(body.parts.flatMap(feToParts))].sort().join(',') : null;
        const sameSetup =
          open.mode === wantMode && (wantParts === null || [...open.selectedParts].sort().join(',') === wantParts) && (open.assignmentId ?? null) === (body.assignmentId ?? null);
        if (!body.restart && sameSetup) return attemptPayload(open.id, user.id);
        await prisma.examAttempt.update({ where: { id: open.id }, data: { status: 'ABANDONED' } });
      }
    }

    let questionIds: string[];
    let parts: ExamPart[];
    if (test) {
      const rows = await prisma.mockTestQuestion.findMany({ where: { testId: test.id }, orderBy: { questionNo: 'asc' }, select: { questionId: true, part: true } });
      if (!rows.length) throw badRequest('Đề chưa có câu hỏi');
      const wanted = body.mode === 'PRACTICE' && body.parts?.length ? new Set(body.parts.flatMap(feToParts)) : null;
      const chosen = wanted ? rows.filter((r) => wanted.has(r.part)) : rows;
      if (!chosen.length) throw badRequest('Đề không có phần đã chọn');
      questionIds = chosen.map((r) => r.questionId);
      parts = [...new Set(chosen.map((r) => r.part))];
    } else if (body.questionIds?.length) {
      const qs = await prisma.question.findMany({ where: { id: { in: body.questionIds }, status: 'PUBLISHED', deletedAt: null }, select: { id: true, part: true } });
      if (qs.length !== new Set(body.questionIds).size) throw badRequest('Có câu hỏi không tồn tại hoặc chưa xuất bản');
      questionIds = body.questionIds.filter((id, i, a) => a.indexOf(id) === i);
      parts = [...new Set(qs.map((q) => q.part))];
    } else {
      if (!body.parts?.length) throw badRequest('Chọn ít nhất một phần để luyện');
      parts = body.parts.flatMap(feToParts);
      const perPart = body.questionCount ?? 10;
      questionIds = await pickPracticeQuestions(parts, perPart, body.examType);
      if (!questionIds.length) throw badRequest('Chưa có câu hỏi cho phần này');
    }

    const versions = await prisma.question.findMany({ where: { id: { in: questionIds } }, select: { id: true, version: true } });
    const vmap = new Map(versions.map((v) => [v.id, v.version]));
    const order: OrderItem[] = questionIds.map((id) => ({ questionId: id, version: vmap.get(id) ?? 1 }));
    const mode: AttemptMode = body.lessonId ? 'LESSON_QUIZ' : test ? (body.mode === 'FULL' ? 'FULL' : 'PRACTICE') : 'PART_SESSION';
    const timeLimitSec = body.minutes === null ? null : body.minutes ? body.minutes * 60 : test && mode === 'FULL' ? test.durationMin * 60 : null;

    try {
      const at = await prisma.examAttempt.create({
        data: {
          userId: user.id,
          testId: test?.id,
          testVersion: test?.version,
          lessonId: body.lessonId,
          assignmentId: body.assignmentId,
          mode,
          purpose: body.assignmentId ? 'ASSIGNMENT' : body.lessonId ? 'CHECKPOINT' : 'SELF',
          selectedParts: parts,
          timeLimitSec,
          questionOrder: order as unknown as Prisma.InputJsonValue,
          totalCount: order.length,
          clientInfo: { userAgent: String(req.headers['user-agent'] ?? '').slice(0, 300) },
        },
      });
      return attemptPayload(at.id, user.id);
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') throw conflict('Bạn đang có một lượt làm dở của đề này');
      throw e;
    }
  })
);

/** Ghi đáp án (UPSERT attempt_answers). selectedKey = null → xoá lựa chọn. */
async function saveAnswers(tx: Tx, attemptId: string, order: OrderItem[], answers: z.infer<typeof answerItem>[]) {
  const pos = new Map(order.map((o, i) => [o.questionId, { i, v: o.version }]));
  for (const a of answers) {
    const p = pos.get(a.questionId);
    if (!p) throw badRequest('Câu hỏi không thuộc lượt làm bài này');
    const selected = a.selectedKey ? { keys: [a.selectedKey] } : a.selectedKey === null ? Prisma.DbNull : undefined;
    const data = {
      selected,
      textAnswer: a.textAnswer === undefined ? undefined : a.textAnswer,
      audioUrl: a.audioUrl === undefined ? undefined : a.audioUrl,
      isFlagged: a.isFlagged,
      timeSpentMs: a.timeSpentMs,
      answeredAt: a.selectedKey || a.textAnswer || a.audioUrl ? new Date() : undefined,
    };
    await tx.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: a.questionId } },
      create: { attemptId, questionId: a.questionId, questionVersion: p.v, orderIndex: p.i, ...data },
      update: data,
    });
  }
}

async function ownOpenAttempt(id: string, userId: string) {
  const at = await prisma.examAttempt.findUnique({ where: { id } });
  if (!at || at.userId !== userId) throw notFound('Lượt làm bài');
  if (at.status !== 'IN_PROGRESS') throw conflict('Lượt làm bài đã nộp', 'ALREADY_SUBMITTED');
  return at;
}

attemptsRouter.get(
  '/attempts/:id',
  handler(async (req) => {
    const user = me(req);
    const base = await attemptPayload(pid(req), user.id);
    if (base.attempt.status === 'IN_PROGRESS') return base;
    return { ...base, result: await resultOf(pid(req)) };
  })
);

// Luồng #4: auto-save 15 giây
attemptsRouter.put(
  '/attempts/:id/answers',
  handler(async (req) => {
    const user = me(req);
    const body = parse(saveBody, req.body);
    const at = await ownOpenAttempt(pid(req), user.id);
    await prisma.$transaction(async (tx) => {
      await saveAnswers(tx, at.id, at.questionOrder as unknown as OrderItem[], body.answers);
      await tx.examAttempt.update({ where: { id: at.id }, data: { lastSavedAt: new Date(), timeSpentSec: body.timeSpentSec ?? undefined } });
    });
    return { savedAt: new Date().toISOString(), count: body.answers.length };
  })
);

/** Quy tắc phân loại nguyên nhân lỗi (cause_source = RULE) */
function causeOf(q: Question, timeMs: number): MistakeCause {
  if (timeMs > 0 && timeMs < 3000) return 'CARELESS';
  if (q.skill === 'GRAMMAR') return 'GRAMMAR';
  if (q.skill === 'VOCABULARY') return 'VOCABULARY';
  if (isListeningPart(q.part)) return 'LISTENING';
  if (q.part === 'TOEIC_P5') return 'GRAMMAR';
  return 'READING';
}

const SOURCE_OF: Record<AttemptMode, string> = { FULL: 'MOCK_TEST', PRACTICE: 'PRACTICE', ADAPTIVE: 'PRACTICE', DRILL: 'DRILL', PART_SESSION: 'PRACTICE', LESSON_QUIZ: 'LESSON_QUIZ', DICTATION: 'PRACTICE' };

// Luồng #5 + #6: nộp bài
attemptsRouter.post(
  '/attempts/:id/submit',
  handler(async (req) => {
    const user = me(req);
    const body = parse(submitBody, req.body);
    const at = await ownOpenAttempt(pid(req), user.id);
    const order = at.questionOrder as unknown as OrderItem[];
    const { qs } = await loadOrdered(order);
    const qmap = new Map(qs.map((q) => [q.id, q]));
    const test = at.testId ? await prisma.mockTest.findUnique({ where: { id: at.testId } }) : null;

    const xpGained = await prisma.$transaction(
      async (tx) => {
        await saveAnswers(tx, at.id, order, body.answers);
        const existing = await tx.attemptAnswer.findMany({ where: { attemptId: at.id } });
        const amap = new Map(existing.map((a) => [a.questionId, a]));

        // Câu chưa trả lời: tạo dòng rỗng để thống kê đúng tổng số câu
        const missing = order.filter((o) => !amap.has(o.questionId));
        if (missing.length)
          await tx.attemptAnswer.createMany({
            data: missing.map((o) => ({ attemptId: at.id, questionId: o.questionId, questionVersion: o.version, orderIndex: order.indexOf(o) })),
          });

        // Chấm trắc nghiệm
        const partAgg = new Map<ExamPart, { correct: number; total: number; timeMs: number }>();
        let correct = 0;
        let objectiveTotal = 0;
        let pendingManual = false;
        const wrong: { q: Question; selected: string; timeMs: number }[] = [];
        for (const o of order) {
          const q = qmap.get(o.questionId);
          if (!q) continue;
          const a = amap.get(o.questionId);
          const agg = partAgg.get(q.part) ?? { correct: 0, total: 0, timeMs: 0 };
          agg.timeMs += a?.timeSpentMs ?? 0;
          if (!isObjective(q)) {
            if (a?.textAnswer || a?.audioUrl) pendingManual = true;
            partAgg.set(q.part, agg);
            continue;
          }
          objectiveTotal += 1;
          agg.total += 1;
          const sel = selectedKeyOf(a?.selected);
          const ok = !!sel && sel.toUpperCase() === correctKeyOf(q).toUpperCase();
          if (ok) {
            correct += 1;
            agg.correct += 1;
          } else if (sel) wrong.push({ q, selected: sel, timeMs: a?.timeSpentMs ?? 0 });
          partAgg.set(q.part, agg);
          await tx.attemptAnswer.update({ where: { attemptId_questionId: { attemptId: at.id, questionId: q.id } }, data: { isCorrect: ok, score: ok ? 1 : 0 } });
        }

        // Quy đổi điểm
        const examType: ExamType = test?.examType ?? qs[0]?.examType ?? 'TOEIC';
        const lAgg = [...partAgg].filter(([p]) => isListeningPart(p)).reduce((s, [, v]) => ({ c: s.c + v.correct, t: s.t + v.total }), { c: 0, t: 0 });
        const rAgg = [...partAgg].filter(([p]) => !isListeningPart(p)).reduce((s, [, v]) => ({ c: s.c + v.correct, t: s.t + v.total }), { c: 0, t: 0 });
        let scoreListening: number | null = null;
        let scoreReading: number | null = null;
        let scoreTotal: number;
        let cefr: string | null = null;
        if (examType === 'TOEIC' && at.mode === 'FULL') {
          if (lAgg.t) scoreListening = await toeicScaled('LISTENING', lAgg.c, lAgg.t);
          if (rAgg.t) scoreReading = await toeicScaled('READING', rAgg.c, rAgg.t);
          scoreTotal = (scoreListening ?? 0) + (scoreReading ?? 0);
        } else if (examType === 'VSTEP' && at.mode === 'FULL') {
          // Tạm thời; recomputeVstep() bên dưới tính lại đủ 4 kỹ năng sau khi lưu
          scoreTotal = 0;
        } else {
          scoreTotal = correct; // luyện tập: điểm = số câu đúng, max = tổng câu
        }

        const partResults = await Promise.all(
          [...partAgg].map(async ([p, v]) => ({
            part: partToFe(p),
            correct: v.correct,
            total: v.total,
            timeSec: Math.round(v.timeMs / 1000),
            scaled: v.total ? Math.round((v.correct / v.total) * 100) : null,
          }))
        );

        const now = new Date();
        const timeSpentSec = body.timeSpentSec ?? Math.round((now.getTime() - at.startedAt.getTime()) / 1000);
        await tx.examAttempt.update({
          where: { id: at.id },
          data: {
            status: pendingManual ? 'GRADING' : 'COMPLETED',
            submittedAt: now,
            timeSpentSec,
            correctCount: correct,
            totalCount: order.length,
            scoreTotal,
            scoreListening,
            scoreReading,
            cefrResult: cefr as never,
            partResults: partResults as unknown as Prisma.InputJsonValue,
            clientInfo: body.clientInfo ? ({ ...(at.clientInfo as object), ...body.clientInfo } as Prisma.InputJsonValue) : undefined,
          },
        });

        if (examType === 'VSTEP' && at.mode === 'FULL') await recomputeVstep(tx, at.id);

        // Sổ tay lỗi sai + thẻ SRS
        for (const w of wrong) {
          const entry = await tx.mistakeEntry.upsert({
            where: { userId_questionId: { userId: user.id, questionId: w.q.id } },
            create: {
              userId: user.id,
              questionId: w.q.id,
              lastWrongAnswer: { keys: [w.selected] },
              source: at.assignmentId ? 'ASSIGNMENT' : SOURCE_OF[at.mode],
              lastAttemptId: at.id,
              cause: causeOf(w.q, w.timeMs),
              tagId: w.q.tagIds[0] ?? null,
              firstWrongAt: now,
              lastWrongAt: now,
            },
            update: { lastWrongAnswer: { keys: [w.selected] }, wrongCount: { increment: 1 }, lastAttemptId: at.id, lastWrongAt: now, isResolved: false, resolvedAt: null },
          });
          await tx.srsCard.upsert({
            where: { userId_mistakeId: { userId: user.id, mistakeId: entry.id } },
            create: { userId: user.id, mistakeId: entry.id, status: 'NEW', nextReviewAt: now },
            update: { status: 'LEARNING', repetitions: 0, intervalDays: 0, nextReviewAt: now },
          });
        }

        // XP: 10 điểm hoàn thành + 2 điểm mỗi câu đúng
        const xp = 10 + correct * 2;
        const answered = existing.filter((a) => a.selected || a.textAnswer || a.audioUrl).length + body.answers.filter((a) => a.selectedKey && !amap.has(a.questionId)).length;
        await recordActivity(tx, user.id, { minutes: Math.max(1, Math.round(timeSpentSec / 60)), questions: answered, xp });

        if (test) await tx.mockTest.update({ where: { id: test.id }, data: { attemptsCount: { increment: 1 } } });

        // Bài được giao
        if (at.assignmentId) {
          const asg = await tx.assignment.findUnique({ where: { id: at.assignmentId } });
          if (asg) {
            const late = !!asg.dueAt && asg.dueAt < now;
            const auto = !pendingManual;
            await tx.assignmentSubmission.update({
              where: { assignmentId_studentId: { assignmentId: asg.id, studentId: user.id } },
              data: {
                attemptId: at.id,
                submittedAt: now,
                status: auto ? 'GRADED' : late ? 'LATE' : 'SUBMITTED',
                score: auto ? scoreTotal : undefined,
                gradedAt: auto ? now : undefined,
              },
            });
          }
        }

        // Nhiệm vụ lộ trình trỏ tới đề này
        if (test) {
          await tx.learningPathItem.updateMany({
            where: { refId: test.id, status: { not: 'COMPLETED' }, path: { userId: user.id, isActive: true } },
            data: { status: 'COMPLETED', completedAt: now },
          });
        }
        return xp;
      },
      { timeout: 30_000 }
    );

    await evaluateAchievements(user.id).catch(() => undefined);
    if (test) void pushTestAttempts(test.id, test.slug);
    return { ...(await attemptPayload(at.id, user.id)), result: await resultOf(at.id), xpGained };
  })
);

/** Bỏ lượt đang làm */
attemptsRouter.post(
  '/attempts/:id/abandon',
  handler(async (req) => {
    const at = await ownOpenAttempt(pid(req), me(req).id);
    await prisma.examAttempt.update({ where: { id: at.id }, data: { status: 'ABANDONED' } });
    return { ok: true };
  })
);

/** AttemptSummary */
export function toAttemptSummary(a: {
  id: string;
  testId: string | null;
  mode: AttemptMode;
  status: string;
  scoreTotal: Prisma.Decimal | null;
  scoreListening: Prisma.Decimal | null;
  scoreReading: Prisma.Decimal | null;
  scoreWriting?: Prisma.Decimal | null;
  scoreSpeaking?: Prisma.Decimal | null;
  cefrResult?: string | null;
  correctCount: number | null;
  totalCount: number;
  submittedAt: Date | null;
  startedAt: Date;
  timeSpentSec: number;
  selectedParts: ExamPart[];
  test?: { title: string; examType: ExamType; slug: string } | null;
}) {
  const examType: ExamType = a.test?.examType ?? (a.selectedParts[0]?.startsWith('VSTEP') ? 'VSTEP' : 'TOEIC');
  const parts = [...new Set(a.selectedParts.map(partToFe))].map((p) => PART_NAME[p]?.split(' · ')[0] ?? p);
  const full = a.mode === 'FULL';
  const maxScore = full ? (examType === 'VSTEP' ? 10 : (a.scoreListening !== null ? 495 : 0) + (a.scoreReading !== null ? 495 : 0) || 990) : a.totalCount;
  return {
    id: a.id,
    testId: a.test?.slug ?? a.testId ?? '',
    testTitle: a.test ? (full ? a.test.title : `${a.test.title} · ${parts.join(', ')}`) : a.mode === 'DICTATION' ? 'Nghe chép chính tả' : `Luyện ${parts.join(', ')}`,
    examType,
    score: a.scoreTotal === null ? 0 : Number(a.scoreTotal),
    maxScore: a.mode === 'DICTATION' ? 100 : maxScore,
    correct: a.correctCount ?? 0,
    total: a.totalCount,
    date: (a.submittedAt ?? a.startedAt).toISOString(),
    durationSec: a.timeSpentSec,
    listening: a.scoreListening === null ? undefined : Number(a.scoreListening),
    reading: a.scoreReading === null ? undefined : Number(a.scoreReading),
    writing: a.scoreWriting == null ? undefined : Number(a.scoreWriting),
    speaking: a.scoreSpeaking == null ? undefined : Number(a.scoreSpeaking),
    cefr: a.cefrResult ?? undefined,
    mode: a.mode,
    status: a.status,
  };
}

/** Kết quả chi tiết: tóm tắt + đáp án từng câu */
export async function resultOf(attemptId: string) {
  const a = await prisma.examAttempt.findUniqueOrThrow({ where: { id: attemptId }, include: { test: true, attemptAnswerAttempts: true } });
  const gradings = await prisma.grading.findMany({ where: { answerId: { in: a.attemptAnswerAttempts.map((x) => x.id) }, isFinal: true } });
  const gmap = new Map(gradings.map((g) => [g.answerId, g]));
  return {
    summary: toAttemptSummary(a),
    partResults: a.partResults,
    cefr: a.cefrResult,
    answers: a.attemptAnswerAttempts
      .sort((x, y) => x.orderIndex - y.orderIndex)
      .map((x) => ({
        questionId: x.questionId,
        selectedKey: selectedKeyOf(x.selected),
        textAnswer: x.textAnswer ?? undefined,
        audioUrl: x.audioUrl ?? undefined,
        isCorrect: x.isCorrect,
        isFlagged: x.isFlagged,
        timeSpentMs: x.timeSpentMs,
        grading: gmap.get(x.id) ? { totalScore: Number(gmap.get(x.id)!.totalScore), criteria: gmap.get(x.id)!.criteriaScores, feedback: gmap.get(x.id)!.feedback } : undefined,
      })),
  };
}

// Lịch sử làm bài (MOCK_ATTEMPTS)
attemptsRouter.get(
  '/attempts',
  handler(async (req) => {
    const user = me(req);
    const q = parse(pageQuery.extend({ examType: z.enum(['TOEIC', 'VSTEP']).optional(), mode: z.string().optional(), testId: z.string().optional() }), req.query);
    const testFilter = q.testId ? { testId: (await findTest(q.testId)).id } : {};
    const where: Prisma.ExamAttemptWhereInput = {
      userId: user.id,
      status: { in: ['COMPLETED', 'GRADING', 'SUBMITTED'] },
      ...(q.mode ? { mode: q.mode as AttemptMode } : {}),
      ...(q.examType ? { OR: [{ test: { examType: q.examType } }, { testId: null }] } : {}),
      ...testFilter,
    };
    const [rows, total] = await Promise.all([
      prisma.examAttempt.findMany({ where, include: { test: { select: { title: true, examType: true, slug: true } } }, orderBy: { submittedAt: 'desc' }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
      prisma.examAttempt.count({ where }),
    ]);
    return paged(rows.map(toAttemptSummary), total, q);
  })
);

// Lượt đang làm dở (nút "Làm tiếp")
attemptsRouter.get(
  '/attempts-in-progress',
  handler(async (req) => {
    const rows = await prisma.examAttempt.findMany({
      where: { userId: me(req).id, status: 'IN_PROGRESS' },
      include: { test: { select: { title: true, examType: true, slug: true } } },
      orderBy: { startedAt: 'desc' },
      take: 10,
    });
    return rows.map((r) => ({ ...toAttemptSummary(r), startedAt: r.startedAt.toISOString(), lastSavedAt: r.lastSavedAt?.toISOString() }));
  })
);
