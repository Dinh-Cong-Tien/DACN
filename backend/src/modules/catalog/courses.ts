import { Router } from 'express';
import { z } from 'zod';
import type { CourseCategory, Lesson as DbLesson, LessonProgress, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { auth, optionalAuth } from '../../core/auth';
import { forbidden, handler, me, notFound, parse } from '../../core/http';
import { num } from '../../core/dto';
import { recordActivity } from './activity';
import { gradientAt } from './mappers';
import { toKnowledge } from './lesson-knowledge';
import { toCues } from './lesson-transcript';
import { toExercises } from './lesson-exercises';
import { ratingOf } from './counts';

export const coursesRouter = Router();

export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const PUBLISHED = { status: 'PUBLISHED' as const, deletedAt: null };

const courseInclude = {
  author: { select: { fullName: true } },
  _count: { select: { courseEnrollmentCourses: true } },
  courseSectionCourses: {
    orderBy: { orderIndex: 'asc' },
    include: { lessonSections: { where: PUBLISHED, orderBy: { orderIndex: 'asc' } } },
  },
} satisfies Prisma.CourseInclude;
type CourseRow = Prisma.CourseGetPayload<{ include: typeof courseInclude }>;

/** Lời thoại có mốc thời gian (giây) cho script chạy theo video */
const toTranscript = (t: Prisma.JsonValue | null) => {
  const cues = toCues(t);
  return cues.length ? cues.map((c) => ({ start: c.startMs / 1000, end: c.endMs / 1000, text: c.en, textVi: c.vi })) : undefined;
};

const lessonType = (t: DbLesson['type']) => (t === 'CHECKPOINT' ? 'QUIZ' : t);

/** Lesson DTO. `full` = kèm nội dung/transcript/video (trang học), ngược lại chỉ thông tin danh sách. */
function toLesson(l: DbLesson, state: { completed: boolean; locked: boolean; positionSec?: number }, full = false) {
  return {
    id: l.id,
    title: l.title,
    type: lessonType(l.type),
    durationMin: l.durationMin,
    summary: l.summary ?? undefined,
    isCompleted: state.completed,
    isLocked: state.locked,
    isFree: l.isFreePreview,
    skill: l.skill ?? undefined,
    // số câu bài tập sau bài học (mục lục hiện "· N câu bài tập")
    exerciseCount: toExercises(l.exercises).length || undefined,
    // vị trí video đã xem tới (bài đang học dở) — hiện "đã học tới mm:ss" trong mục lục
    ...(l.type === 'VIDEO' && !state.completed && state.positionSec ? { lastPositionSec: state.positionSec } : {}),
    ...(full && !state.locked
      ? { videoUrl: l.videoUrl ?? undefined, audioUrl: l.audioUrl ?? undefined, content: l.contentMd ?? undefined, knowledge: toKnowledge(l.knowledge), transcript: toTranscript(l.transcript), exercises: toExercises(l.exercises), quizTestId: l.quizTestId ?? undefined, passScorePct: l.passScorePct ?? undefined }
      : {}),
  };
}

/**
 * Trạng thái khoá/mở của từng bài: khoá tuần tự (is_sequential) → bài sau mở khi bài trước xong.
 * Khách chưa đăng nhập: chỉ bài đầu và bài học thử mở.
 */
function lessonStates(c: CourseRow, progress: Map<string, LessonProgress>, loggedIn: boolean) {
  const flat = c.courseSectionCourses.flatMap((s) => s.lessonSections);
  const states = new Map<string, { completed: boolean; locked: boolean; positionSec?: number }>();
  let prevDone = true;
  flat.forEach((l, i) => {
    const completed = progress.get(l.id)?.status === 'COMPLETED';
    const locked = loggedIn ? c.isSequential && !prevDone && i > 0 : i > 0 && !l.isFreePreview;
    states.set(l.id, { completed, locked: locked && !l.isFreePreview, positionSec: progress.get(l.id)?.lastPositionSec });
    prevDone = completed;
  });
  return states;
}

async function progressMap(userId: string | undefined, lessonIds: string[]) {
  if (!userId || !lessonIds.length) return new Map<string, LessonProgress>();
  const rows = await prisma.lessonProgress.findMany({ where: { userId, lessonId: { in: lessonIds } } });
  return new Map(rows.map((r) => [r.lessonId, r]));
}

function toCourse(c: CourseRow, i: number, states: Map<string, { completed: boolean; locked: boolean }>, enrolledPct?: number) {
  const lessons = c.courseSectionCourses.flatMap((s) => s.lessonSections);
  const done = lessons.filter((l) => states.get(l.id)?.completed).length;
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category,
    examType: c.examType ?? undefined,
    // mục chính (TOEIC / VSTEP / THPT) và nhóm trong mục của menu Khoá học
    track: c.track ?? undefined,
    trackGroup: c.trackGroup ?? undefined,
    level: c.level ?? 'Mọi trình độ',
    description: c.description,
    gradient: c.themeGradient ?? gradientAt(i),
    coverUrl: c.coverUrl ?? undefined,
    // đếm thật: bài đang phát hành + học viên ghi danh (không dùng cột đếm lưu sẵn)
    lessonsCount: lessons.length,
    durationHours: Math.round((lessons.reduce((a, l) => a + l.durationMin, 0) / 60) * 10) / 10,
    studentsCount: c._count.courseEnrollmentCourses,
    rating: ratingOf(c.ratingAvg),
    isFree: c.isFree,
    progress: enrolledPct ?? (lessons.length ? Math.round((done / lessons.length) * 100) : 0),
    teacherName: c.author?.fullName ?? 'OrbiLingo',
    // Ẩn chặng không còn bài nào hiển thị (bài nguồn không có video đang ở trạng thái nháp)
    sections: c.courseSectionCourses.filter((s) => s.lessonSections.length).map((s) => ({
      id: s.id,
      title: s.title,
      part: s.partTitle ?? undefined,
      lessons: s.lessonSections.map((l) => toLesson(l, states.get(l.id) ?? { completed: false, locked: false })),
    })),
  };
}

/** Slug cũ (trước khi chia khoá theo TOEIC / VSTEP / THPT) → slug mới, để link đã chia sẻ vẫn mở được */
const OLD_SLUG: Record<string, string> = {
  'ngu-phap': 'vstep-ngu-phap',
  'luyen-nghe': 'vstep-listening',
  'viet-tieng-anh': 'vstep-writing',
  'giao-tiep-hang-ngay': 'vstep-speaking',
  'tieng-anh-cong-so': 'toeic-part-3-4',
  'luyen-thi-toeic-video': 'toeic-part-5-6',
  'tu-vung-phat-am': 'vstep-reading',
};

async function findCourse(idOrSlug: string) {
  return prisma.course.findFirst({
    where: { ...PUBLISHED, ...(isUuid(idOrSlug) ? { id: idOrSlug } : { slug: OLD_SLUG[idOrSlug] ?? idOrSlug }) },
    include: courseInclude,
  });
}

// GET /catalog/courses?track=THPT&category=GRAMMAR&examType=TOEIC → Course[]
coursesRouter.get(
  '/courses',
  optionalAuth,
  handler(async (req) => {
    const q = parse(
      z.object({ track: z.enum(['TOEIC', 'VSTEP', 'THPT']).optional(), category: z.enum(['FOUNDATION', 'GRAMMAR', 'VOCABULARY', 'SKILL', 'EXAM_PREP']).optional(), examType: z.enum(['TOEIC', 'VSTEP']).optional() }),
      req.query
    );
    const rows = await prisma.course.findMany({
      where: { ...PUBLISHED, track: q.track, category: q.category as CourseCategory | undefined, examType: q.examType },
      include: courseInclude,
      orderBy: [{ trackOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const progress = await progressMap(req.user?.id, rows.flatMap((c) => c.courseSectionCourses.flatMap((s) => s.lessonSections.map((l) => l.id))));
    return rows.map((c, i) => toCourse(c, i, lessonStates(c, progress, !!req.user)));
  })
);

// GET /catalog/courses/:idOrSlug → Course (kèm sections/lessons và tiến độ)
coursesRouter.get(
  '/courses/:idOrSlug',
  optionalAuth,
  handler(async (req) => {
    const c = await findCourse(String(req.params.idOrSlug));
    if (!c) throw notFound('Khoá học');
    const progress = await progressMap(req.user?.id, c.courseSectionCourses.flatMap((s) => s.lessonSections.map((l) => l.id)));
    const enrollment = req.user ? await prisma.courseEnrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId: c.id } } }) : null;
    return {
      ...toCourse(c, 0, lessonStates(c, progress, !!req.user), enrollment ? Math.round(Number(enrollment.progressPct)) : undefined),
      currentLessonId: enrollment?.currentLessonId ?? undefined,
      enrolled: !!enrollment,
    };
  })
);

// GET /catalog/lessons/:id → Lesson đầy đủ + vị trí trong khoá (prev/next)
coursesRouter.get(
  '/lessons/:id',
  optionalAuth,
  handler(async (req) => {
    if (!isUuid(String(req.params.id))) throw notFound('Bài học');
    const lesson = await prisma.lesson.findFirst({ where: { id: String(req.params.id), ...PUBLISHED }, include: { section: true } });
    if (!lesson) throw notFound('Bài học');
    const c = await prisma.course.findFirstOrThrow({ where: { id: lesson.section.courseId }, include: courseInclude });
    const flat = c.courseSectionCourses.flatMap((s) => s.lessonSections);
    const progress = await progressMap(req.user?.id, flat.map((l) => l.id));
    const states = lessonStates(c, progress, !!req.user);
    const idx = flat.findIndex((l) => l.id === lesson.id);
    const p = progress.get(lesson.id);
    return {
      ...toLesson(lesson, states.get(lesson.id) ?? { completed: false, locked: false }, true),
      courseId: c.id,
      courseSlug: c.slug,
      courseTitle: c.title,
      sectionTitle: lesson.section.title,
      prevLessonId: flat[idx - 1]?.id,
      nextLessonId: flat[idx + 1]?.id,
      lastPositionSec: p?.lastPositionSec ?? 0,
      bestScorePct: p?.bestScorePct ?? undefined,
    };
  })
);

const progressBody = z.object({
  action: z.enum(['start', 'position', 'complete']),
  positionSec: z.number().int().min(0).optional(),
  timeSpentSec: z.number().int().min(0).max(6 * 3600).optional(),
  scorePct: z.number().int().min(0).max(100).optional(),
});

/**
 * POST /catalog/lessons/:id/progress (đăng nhập)
 * start → ghi danh khoá + IN_PROGRESS; position → lưu vị trí video; complete → COMPLETED, cập nhật % khoá, XP, streak.
 */
coursesRouter.post(
  '/lessons/:id/progress',
  auth,
  handler(async (req) => {
    const userId = me(req).id;
    const body = parse(progressBody, req.body);
    if (!isUuid(String(req.params.id))) throw notFound('Bài học');
    const lesson = await prisma.lesson.findFirst({ where: { id: String(req.params.id), ...PUBLISHED }, include: { section: true } });
    if (!lesson) throw notFound('Bài học');
    const courseId = lesson.section.courseId;

    const c = await prisma.course.findFirstOrThrow({ where: { id: courseId }, include: courseInclude });
    const flat = c.courseSectionCourses.flatMap((s) => s.lessonSections);
    const states = lessonStates(c, await progressMap(userId, flat.map((l) => l.id)), true);
    if (states.get(lesson.id)?.locked) throw forbidden('Hãy hoàn thành bài trước để mở bài này');
    // bài có bài tập / bài kiểm tra: phải đạt điểm tối thiểu mới hoàn thành (mặc định 70%)
    const hasExercises = toExercises(lesson.exercises).length > 0;
    const pass = lesson.passScorePct ?? (hasExercises ? 70 : null);
    if (body.action === 'complete' && (hasExercises || lesson.type === 'QUIZ' || lesson.type === 'CHECKPOINT') && pass !== null && (body.scorePct ?? 0) < pass)
      throw forbidden(`Cần đạt tối thiểu ${pass}% ${lesson.type === 'VIDEO' ? 'bài tập' : 'bài kiểm tra'} để hoàn thành bài học`);

    return prisma.$transaction(async (tx) => {
      const prev = await tx.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });
      const wasDone = prev?.status === 'COMPLETED';
      const isDone = wasDone || body.action === 'complete';
      const spent = body.timeSpentSec ?? 0;
      const row = await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
        create: {
          userId,
          lessonId: lesson.id,
          status: isDone ? 'COMPLETED' : 'IN_PROGRESS',
          lastPositionSec: body.positionSec ?? 0,
          timeSpentSec: spent,
          bestScorePct: body.scorePct,
          completedAt: isDone ? new Date() : null,
        },
        update: {
          status: isDone ? 'COMPLETED' : 'IN_PROGRESS',
          lastPositionSec: body.positionSec ?? undefined,
          timeSpentSec: { increment: spent },
          bestScorePct: body.scorePct !== undefined ? Math.max(body.scorePct, prev?.bestScorePct ?? 0) : undefined,
          completedAt: isDone && !wasDone ? new Date() : undefined,
        },
      });

      const enrollment = await tx.courseEnrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
      if (!enrollment) await tx.course.update({ where: { id: courseId }, data: { studentsCount: { increment: 1 } } });
      const doneCount = await tx.lessonProgress.count({ where: { userId, status: 'COMPLETED', lessonId: { in: flat.map((l) => l.id) } } });
      const pct = flat.length ? Math.round((doneCount / flat.length) * 10000) / 100 : 0;
      const idx = flat.findIndex((l) => l.id === lesson.id);
      const current = isDone ? (flat[idx + 1]?.id ?? lesson.id) : lesson.id;
      await tx.courseEnrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId, progressPct: pct, currentLessonId: current, completedAt: pct >= 100 ? new Date() : null },
        update: { progressPct: pct, currentLessonId: current, completedAt: pct >= 100 ? (enrollment?.completedAt ?? new Date()) : null },
      });

      const minutes = Math.round(spent / 60);
      const justCompleted = body.action === 'complete' && !wasDone;
      if (minutes > 0 || justCompleted) await recordActivity(tx, userId, { minutes, lessons: justCompleted ? 1 : 0, xp: justCompleted ? 10 : 0 });

      return { lessonId: lesson.id, status: row.status, lastPositionSec: row.lastPositionSec, bestScorePct: row.bestScorePct, courseProgress: Math.round(pct), nextLessonId: flat[idx + 1]?.id };
    });
  })
);
