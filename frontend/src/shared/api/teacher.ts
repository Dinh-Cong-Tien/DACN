/**
 * API khu vực giáo viên — /api/v1/teacher.
 * Type mở rộng từ hợp đồng `shared/types` (thêm field backend trả về); hook TanStack Query cho từng màn hình.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Assignment, AssignmentTarget, AssignmentType, AttendanceMark, ClassAnnouncement, ClassRoom, ClassSession, ClassStudent, CourseCategory, ExamType, StudentNote, Submission, CourseTrack, ClassCourseProgress } from '@/shared/types';
import { api, http, tokenStore } from './client';
import type { QuestionPage, QuestionQuery, QuestionRow } from './head';

// ======================= Types =======================

export interface TClassRoom extends ClassRoom {
  teacherId: string;
  /** % hoàn thành khoá học trung bình của học viên trong lớp */
  courseProgressPct?: number;
  level?: string;
  description?: string;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  isArchived: boolean;
}

export interface TClassStudent extends ClassStudent {
  /** null = chưa có buổi nào được điểm danh */
  attendanceRate: number | null;
  classIds: string[];
}

export interface TSession extends ClassSession {
  className?: string;
  attendanceNotes?: Record<string, string>;
}

export interface TAssignment extends Assignment {
  openAt?: string;
  maxScore?: number;
  allowLate?: boolean;
}

export type MaterialType = 'VIDEO' | 'PDF' | 'DOC' | 'AUDIO' | 'LINK';
export interface TMaterial {
  id: string;
  classId: string;
  title: string;
  description?: string;
  type: MaterialType;
  category?: string;
  fileUrl?: string;
  size: string;
  pages?: number;
  uploadedAt: string;
  downloads: number;
}

export interface GradingCriterion {
  key: string;
  label: string;
  desc: string;
  weight?: number;
}

export interface TSubmission extends Submission {
  classId: string;
  studentId: string;
  audioUrl?: string;
  criteriaScores?: Record<string, number>;
  draft?: boolean;
  state?: string;
}

/** Một bài trong hàng chấm (bài nộp theo bài giao, hoặc bài tự luyện id dạng `ans:<uuid>`) */
export interface GradingItem extends TSubmission {
  className?: string;
  prompt?: string;
  promptImageUrl?: string;
  minWords?: number;
  rubric?: { id: string; name: string; criteria: GradingCriterion[] };
}

export interface TeacherDashboard {
  stats: { classes: number; students: number; pendingGrading: number; lateSubmissions: number; attendanceRate: number; attendanceMarks: number; atRiskCount: number; sessionsThisWeek: number; unmarkedPastSessions: number };
  /** Buổi gần nhất đã qua mà chưa điểm danh (để mở thẳng trang điểm danh) */
  latestUnmarkedSessionId: string | null;
  classes: TClassRoom[];
  atRisk: TClassStudent[];
  sessions: TSession[];
  upcomingDeadlines: TAssignment[];
  pendingSubmissions: TSubmission[];
  week: { from: string; to: string };
  nextSession: TSession | null;
}

export interface ClassDetail extends TClassRoom {
  /** Tiến độ khoá học của từng học viên (lớp đã gắn khoá) */
  courseProgress?: ClassCourseProgress;
  students: TClassStudent[];
  announcements: ClassAnnouncement[];
  materials: TMaterial[];
  assignments: TAssignment[];
  sessions: TSession[];
}

export interface SessionDetail extends TSession {
  students: TClassStudent[];
}

export interface Gradebook {
  classId: string;
  assignments: { id: string; title: string; type: AssignmentType; maxScore: number; dueDate?: string; status: string }[];
  students: { id: string; name: string; avatarUrl?: string; email: string; status: 'GOOD' | 'WARNING' | 'RISK' }[];
  /** điểm đã chấm, null = chưa có điểm */
  scores: Record<string, Record<string, number | null>>;
  /** trạng thái bài nộp: TODO | SUBMITTED | LATE | GRADED | MISSED */
  states: Record<string, Record<string, string>>;
  /** kỳ thi của lớp — bảng điểm thi chỉ gồm đề full của kỳ thi này */
  examType: ExamType;
  /** điểm thi thử từng học viên (trung bình các lượt): TOEIC Nghe / Đọc thang 495, tổng 990; VSTEP 4 kỹ năng thang 10 */
  exam: Record<string, GradebookExam>;
  /** bảng điểm thi riêng từng kỳ thi (mọi học viên trong lớp) */
  exams: Record<'TOEIC' | 'VSTEP', Record<string, GradebookExam>>;
}
export interface GradebookExam {
  attempts: number;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  total: number | null;
  best: number | null;
  latest: number | null;
  latestAt?: string;
}

export interface TNote extends StudentNote {
  classId?: string;
}

export interface StudentProfile {
  student: TClassStudent | null;
  attempts: { id: string; testTitle: string; examType?: ExamType; mode: string; score?: number; correct?: number; total: number; listening?: number; reading?: number; durationSec: number; submittedAt?: string }[];
  mistakeCauses: { cause: string; count: number }[];
  weakTags: { tagId: string; name: string; count: number }[];
  submissions: TSubmission[];
  attendance: { sessionId: string; classId: string; date: string; mark: AttendanceMark }[];
  notes: TNote[];
  /** Tự học (như học viên thấy ở Lộ trình / Tiến độ / Từ vựng / Sổ tay lỗi sai) */
  self?: SelfStudy;
}

export interface SelfStudy {
  goal: { examType: ExamType; score: string; examDate?: string } | null;
  week: { minutes: number; questions: number; lessons: number; cards: number; activeDays: number };
  streak: number;
  xp: number;
  lastActiveAt: string | null;
  vocab: { learned: number; due: number };
  openMistakes: number;
  courses: { slug: string; title: string; progress: number; completed: boolean }[];
}

/** Chi tiết một lượt làm bài của học viên (giống trang Kết quả bài thi của học viên) */
export interface StudentAttemptDetail {
  id: string;
  title: string;
  examType?: ExamType;
  mode: string;
  modeLabel: string;
  status: string;
  submittedAt?: string;
  summary: { score: number; maxScore: number; correct: number; total: number; durationSec: number; listening?: number; reading?: number };
  partResults: { part: string; correct: number; total: number }[] | null;
  cefr?: string | null;
  answers: {
    no: number;
    questionId: string;
    part?: string;
    stem: string;
    passageTitle?: string;
    options: { key: string; text: string }[];
    correctKey?: string;
    selectedKey?: string;
    textAnswer?: string;
    audioUrl?: string;
    isCorrect: boolean | null;
    explanation?: string;
    grading?: { totalScore: number; feedback?: string | null };
  }[];
}

export interface ClassLeaderboard {
  period: 'week' | 'month' | 'all';
  entries: { rank: number; userId: string; name: string; initials: string; avatarUrl?: string; points: number; streak: number; lastActiveAt?: string }[];
}

export interface ClassAnalytics {
  classId?: string;
  examType: ExamType;
  students: number;
  weeklyProgress: { label: string; weekStart: string; value: number | null; answered: number }[];
  partAccuracy: { partId: string; value: number; answered: number }[];
  scoreDist: { label: string; value: number }[];
  mistakeCauses: { cause: string; count: number }[];
  scoreTrend: { labels: string[]; values: (number | null)[]; min: number };
  completionByAssignment: { assignmentId: string; title: string; dueDate?: string; done: number; total: number; rate: number }[];
}

// ---- Thư viện ----
export interface LibPart {
  id: string;
  title: string;
  questions: number;
}
export interface LibTest {
  id: string;
  slug: string;
  title: string;
  examType: ExamType;
  kind: string;
  year?: number;
  level?: string;
  durationMin: number;
  totalQuestions: number;
  isFree: boolean;
  coverUrl?: string;
  attemptsCount: number;
  usedCount: number;
  parts: LibPart[];
}
export interface LibLesson {
  id: string;
  title: string;
  type: string;
  durationMin: number;
  orderIndex: number;
  /** Số câu bài tập sau bài (học viên phải đạt passScorePct % mới qua bài) */
  exercisesCount?: number;
  passScorePct?: number;
  /** Video bài giảng giáo viên đã đăng (Vimeo/YouTube/tệp tải lên) */
  videoUrl?: string;
}
export interface LibCourse {
  id: string;
  slug: string;
  title: string;
  category: CourseCategory | 'EXAM_PREP';
  examType?: ExamType;
  /** Mục chính (TOEIC / VSTEP / THPT) và nhóm trong mục */
  track?: string;
  trackGroup?: string;
  level?: string;
  coverUrl?: string;
  lessonsCount: number;
  durationMin: number;
  teacherName?: string;
  studentsCount: number;
  usedCount: number;
  sections: { id: string; title: string; partNo: number; partTitle?: string; lessons: LibLesson[] }[];
}
export interface LibGrammar {
  id: string;
  slug: string;
  title: string;
  category: string;
  level?: string;
  summary: string;
  questionsCount: number;
  usedCount: number;
}
export interface LibVocab {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  examType?: ExamType;
  level?: string;
  wordsCount: number;
  isFree: boolean;
  usedCount: number;
}
export interface LibPrompt {
  id: string;
  examType: ExamType;
  part: string;
  title: string;
  prompt: string;
  imageUrl?: string;
  audioUrl?: string;
  level?: string;
  taskConfig?: { title?: string; label?: string; test?: string; questionNo?: number; minWords?: number; maxWords?: number; minutes?: number; prepSec?: number; responseSec?: number; keywords?: string[]; task?: string };
  usedCount: number;
}

// ---- Body ----
export interface ClassInput {
  /** không gửi khi mở lớp → tự đặt "<khoá> · Lớp N" */
  name?: string;
  /** Khoá học của lớp (slug / id) — mục, kỳ thi quy đổi điểm lấy theo khoá */
  courseId?: string;
  /** Lớp chưa gắn khoá: mục TOEIC / VSTEP / THPT */
  track?: CourseTrack;
  examType?: ExamType;
  schedule?: string | null;
  room?: string | null;
  level?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  maxStudents?: number | null;
}
export interface AssignmentInput {
  classId: string;
  title: string;
  type: AssignmentType;
  target: AssignmentTarget;
  note?: string | null;
  dueDate?: string | null;
  status: 'DRAFT' | 'OPEN';
}
export interface SessionInput {
  date: string;
  start: string;
  end: string;
  room?: string | null;
  topic?: string | null;
}
export interface MaterialInput {
  classId: string;
  title: string;
  type: MaterialType;
  fileUrl: string;
  description?: string | null;
  category?: string | null;
}

// ======================= API =======================

const T = '/teacher';

export const teacherApi = {
  dashboard: () => api.get<TeacherDashboard>(`${T}/dashboard`),
  classes: (archived: 'true' | 'false' | 'all' = 'false') => api.get<TClassRoom[]>(`${T}/classes`, { archived }),
  classDetail: (id: string) => api.get<ClassDetail>(`${T}/classes/${id}`),
  createClass: (b: ClassInput) => api.post<TClassRoom>(`${T}/classes`, b),
  updateClass: (id: string, b: Partial<ClassInput>) => api.patch<TClassRoom>(`${T}/classes/${id}`, b),
  archiveClass: (id: string, archived: boolean) => api.post<{ id: string; isArchived: boolean }>(`${T}/classes/${id}/archive`, { archived }),
  regenerateCode: (id: string) => api.post<{ id: string; code: string }>(`${T}/classes/${id}/regenerate-code`),
  addSession: (classId: string, b: SessionInput) => api.post<TSession>(`${T}/classes/${classId}/sessions`, b),
  addStudents: (id: string, emails: string[]) => api.post<{ added: number; notFound: string[]; students: TClassStudent[] }>(`${T}/classes/${id}/students`, { emails }),
  removeStudent: (id: string, studentId: string) => api.delete<{ ok: true }>(`${T}/classes/${id}/students/${studentId}`),
  sessions: (q: { from?: string; to?: string; classId?: string }) => api.get<TSession[]>(`${T}/sessions`, q),
  sessionDetail: (id: string) => api.get<SessionDetail>(`${T}/sessions/${id}`),
  updateSession: (id: string, b: { topic?: string | null; note?: string | null; status?: 'UPCOMING' | 'DONE' | 'CANCELLED' }) => api.patch<TSession>(`${T}/sessions/${id}`, b),
  saveAttendance: (id: string, b: { attendance: Record<string, AttendanceMark>; note?: string | null }) => api.put<TSession>(`${T}/sessions/${id}/attendance`, b),
  postAnnouncement: (b: { classId: string; title: string; body: string; pinned?: boolean }) => api.post<ClassAnnouncement>(`${T}/announcements`, b),
  updateAnnouncement: (id: string, b: { title?: string; body?: string; pinned?: boolean }) => api.patch<ClassAnnouncement>(`${T}/announcements/${id}`, b),
  deleteAnnouncement: (id: string) => api.delete<{ ok: true }>(`${T}/announcements/${id}`),
  materials: (classId?: string) => api.get<TMaterial[]>(`${T}/materials`, classId ? { classId } : undefined),
  addMaterial: (b: MaterialInput) => api.post<TMaterial>(`${T}/materials`, b),
  /** Tải file lên máy chủ (≤ 25 MB) — lưu ở backend/uploads/materials, chỉ thành viên lớp mở được */
  uploadMaterial: (b: { classId: string; title: string; type?: MaterialType; file: File }) =>
    http
      .post<{ data: TMaterial }>(`${T}/materials/upload`, b.file, {
        params: { classId: b.classId, title: b.title, type: b.type },
        headers: { 'Content-Type': b.file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(b.file.name) },
        timeout: 120_000,
      })
      .then((r) => r.data.data),
  setLessonVideo: (id: string, videoUrl: string | null) => api.put<{ id: string; type: string; videoUrl?: string }>(`${T}/lessons/${id}/video`, { videoUrl }),
  uploadLessonVideo: (id: string, file: File) =>
    http
      .post<{ data: { id: string; type: string; videoUrl?: string } }>(`${T}/lessons/${id}/video/upload`, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name) },
        timeout: 600_000,
      })
      .then((r) => r.data.data),
  deleteMaterial: (id: string) => api.delete<{ ok: true }>(`${T}/materials/${id}`),
  assignments: (q: { classId?: string; status?: string } = {}) => api.get<TAssignment[]>(`${T}/assignments`, q),
  createAssignment: (b: AssignmentInput) => api.post<TAssignment>(`${T}/assignments`, b),
  updateAssignment: (id: string, b: { status?: 'OPEN' | 'CLOSED'; title?: string; dueDate?: string | null; note?: string | null }) => api.patch<TAssignment>(`${T}/assignments/${id}`, b),
  deleteAssignment: (id: string) => api.delete<{ ok: true }>(`${T}/assignments/${id}`),
  grading: (status: 'pending' | 'graded' | 'all' = 'all') => api.get<GradingItem[]>(`${T}/grading`, { status }),
  grade: (id: string, b: { criteria: Record<string, number>; feedback?: string | null; release: boolean }) => api.post<TSubmission & { released: boolean; reviewSampled: boolean }>(`${T}/grading/${encodeURIComponent(id)}`, b),
  gradebook: (classId: string) => api.get<Gradebook>(`${T}/classes/${classId}/gradebook`),
  students: (q: { classId?: string } = {}) => api.get<TClassStudent[]>(`${T}/students`, q),
  studentProfile: (id: string) => api.get<StudentProfile>(`${T}/students/${id}`),
  /** base: '/teacher' hoặc '/head' (trưởng bộ môn, admin) — cùng DTO */
  studentAttempt: (id: string, attemptId: string, base: string = T) => api.get<StudentAttemptDetail>(`${base}/students/${id}/attempts/${attemptId}`),
  classLeaderboard: (classId: string, period: ClassLeaderboard['period'], base: string = T) => api.get<ClassLeaderboard>(`${base}/classes/${classId}/leaderboard`, { period }),
  addNote: (studentId: string, b: { kind: StudentNote['kind']; text: string; classId?: string | null }) => api.post<TNote>(`${T}/students/${studentId}/notes`, b),
  deleteNote: (id: string) => api.delete<{ ok: true }>(`${T}/notes/${id}`),
  classAnalytics: (classId: string) => api.get<ClassAnalytics>(`${T}/classes/${classId}/analytics`),
  libTests: (examType?: ExamType) => api.get<LibTest[]>(`${T}/library/tests`, examType ? { examType } : undefined),
  libCourses: () => api.get<LibCourse[]>(`${T}/library/courses`),
  libGrammar: () => api.get<LibGrammar[]>(`${T}/library/grammar`),
  libVocab: () => api.get<LibVocab[]>(`${T}/library/vocab`),
  libWriting: () => api.get<LibPrompt[]>(`${T}/library/writing`),
  libSpeaking: () => api.get<LibPrompt[]>(`${T}/library/speaking`),
};

// ======================= Hooks =======================

export const tKeys = {
  all: ['teacher'] as const,
  dashboard: ['teacher', 'dashboard'] as const,
  classes: ['teacher', 'classes'] as const,
  classDetail: (id: string) => ['teacher', 'class', id] as const,
  sessions: (q: object) => ['teacher', 'sessions', q] as const,
  session: (id: string) => ['teacher', 'session', id] as const,
  materials: (classId?: string) => ['teacher', 'materials', classId ?? 'all'] as const,
  assignments: (q: object) => ['teacher', 'assignments', q] as const,
  grading: (status: string) => ['teacher', 'grading', status] as const,
  gradebook: (classId: string) => ['teacher', 'gradebook', classId] as const,
  students: (q: object) => ['teacher', 'students', q] as const,
  student: (id: string) => ['teacher', 'student', id] as const,
  analytics: (classId: string) => ['teacher', 'analytics', classId] as const,
  lib: (k: string) => ['teacher', 'library', k] as const,
};

const LIB_STALE = 10 * 60_000;

export const useTeacherDashboard = () => useQuery({ queryKey: tKeys.dashboard, queryFn: teacherApi.dashboard, staleTime: 30_000 });
export const useTeacherClasses = () => useQuery({ queryKey: tKeys.classes, queryFn: () => teacherApi.classes(), staleTime: 60_000 });
export const useArchivedClasses = (enabled: boolean) => useQuery({ queryKey: [...tKeys.classes, 'archived'], queryFn: () => teacherApi.classes('true'), enabled });
export const useClassDetail = (id?: string) => useQuery({ queryKey: tKeys.classDetail(id ?? ''), queryFn: () => teacherApi.classDetail(id!), enabled: !!id });
export const useSessions = (q: { from?: string; to?: string; classId?: string }, enabled = true) => useQuery({ queryKey: tKeys.sessions(q), queryFn: () => teacherApi.sessions(q), enabled });
export const useSessionDetail = (id?: string) => useQuery({ queryKey: tKeys.session(id ?? ''), queryFn: () => teacherApi.sessionDetail(id!), enabled: !!id });
export const useMaterials = (classId?: string) => useQuery({ queryKey: tKeys.materials(classId), queryFn: () => teacherApi.materials(classId) });
export const useTeacherAssignments = (q: { classId?: string; status?: string } = {}) => useQuery({ queryKey: tKeys.assignments(q), queryFn: () => teacherApi.assignments(q) });
export const useGradingQueue = (status: 'pending' | 'graded' | 'all' = 'all') => useQuery({ queryKey: tKeys.grading(status), queryFn: () => teacherApi.grading(status) });
export const useGradebook = (classId?: string) => useQuery({ queryKey: tKeys.gradebook(classId ?? ''), queryFn: () => teacherApi.gradebook(classId!), enabled: !!classId });
export const useTeacherStudents = (q: { classId?: string } = {}) => useQuery({ queryKey: tKeys.students(q), queryFn: () => teacherApi.students(q) });
export const useStudentAttempt = (studentId?: string, attemptId?: string, base: string = T) => useQuery({ queryKey: [base, 'student', studentId, 'attempt', attemptId], queryFn: () => teacherApi.studentAttempt(studentId!, attemptId!, base), enabled: !!studentId && !!attemptId });
export const useClassLeaderboard = (classId: string | undefined, period: ClassLeaderboard['period'], base: string = T) => useQuery({ queryKey: [base, 'class', classId, 'leaderboard', period], queryFn: () => teacherApi.classLeaderboard(classId!, period, base), enabled: !!classId });
export const useStudentProfile = (id?: string) => useQuery({ queryKey: tKeys.student(id ?? ''), queryFn: () => teacherApi.studentProfile(id!), enabled: !!id });
export const useClassAnalytics = (classId?: string) => useQuery({ queryKey: tKeys.analytics(classId ?? ''), queryFn: () => teacherApi.classAnalytics(classId!), enabled: !!classId });

export const useLibTests = () => useQuery({ queryKey: tKeys.lib('tests'), queryFn: () => teacherApi.libTests(), staleTime: LIB_STALE });
export const useLibCourses = () => useQuery({ queryKey: tKeys.lib('courses'), queryFn: teacherApi.libCourses, staleTime: LIB_STALE });
export const useLibGrammar = () => useQuery({ queryKey: tKeys.lib('grammar'), queryFn: teacherApi.libGrammar, staleTime: LIB_STALE });
export const useLibVocab = () => useQuery({ queryKey: tKeys.lib('vocab'), queryFn: teacherApi.libVocab, staleTime: LIB_STALE });
export const useLibWriting = () => useQuery({ queryKey: tKeys.lib('writing'), queryFn: teacherApi.libWriting, staleTime: LIB_STALE });
export const useLibSpeaking = () => useQuery({ queryKey: tKeys.lib('speaking'), queryFn: teacherApi.libSpeaking, staleTime: LIB_STALE });

/** Toàn bộ thư viện (để mô tả nội dung bài giao) */
export function useTeacherLibrary() {
  const tests = useLibTests();
  const courses = useLibCourses();
  const grammar = useLibGrammar();
  const vocab = useLibVocab();
  const writing = useLibWriting();
  const speaking = useLibSpeaking();
  return {
    tests: tests.data ?? [],
    courses: courses.data ?? [],
    grammar: grammar.data ?? [],
    vocab: vocab.data ?? [],
    writing: writing.data ?? [],
    speaking: speaking.data ?? [],
    isLoading: tests.isLoading || courses.isLoading || grammar.isLoading || vocab.isLoading || writing.isLoading || speaking.isLoading,
  };
}
export type TeacherLibrary = ReturnType<typeof useTeacherLibrary>;

/** Mutation kèm làm mới mọi dữ liệu giáo viên sau khi ghi */
export function useTeacherMutation<TVars, TRes>(fn: (v: TVars) => Promise<TRes>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: tKeys.all }) });
}

/** Link mở tài liệu: file tải lên máy chủ cần kèm access token (thẻ <a> không gửi được header) */
export function fileHref(url?: string | null) {
  if (!url) return undefined;
  if (!url.startsWith('/api/')) return url;
  const t = tokenStore.get()?.accessToken;
  return t ? `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(t)}` : url;
}

// ======================= Học liệu giáo viên soạn (gửi trưởng bộ môn duyệt) =======================

export type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
export interface AuthorQuestionInput {
  examType: ExamType;
  part: string;
  skill: string;
  type?: 'SINGLE_CHOICE' | 'ESSAY' | 'SPEAKING_RESPONSE';
  stem: string;
  options?: { key: string; text: string }[] | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  translationVi?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
}
export interface AuthorTest {
  id: string;
  slug: string;
  title: string;
  examType: ExamType;
  kind: 'MINI' | 'QUIZ' | string;
  level: string;
  durationMinutes: number;
  totalQuestions: number;
  parts: string[];
  status: ContentStatus;
  reviewNote?: string;
  updatedAt: string;
}
export interface AuthorTestInput {
  title: string;
  examType: ExamType;
  kind: 'MINI' | 'QUIZ';
  level?: string | null;
  durationMin: number;
  isFree?: boolean;
}

const C = '/teacher/content';
export const authoringApi = {
  questions: (q: QuestionQuery) => api.get<QuestionPage>(`${C}/questions`, q),
  bank: (q: QuestionQuery) => api.get<QuestionPage>(`${C}/bank`, q),
  /** Chi tiết 1 câu (kèm đoạn văn) để xem trước */
  bankQuestion: (id: string) => api.get<QuestionRow & { passage?: { id: string; title?: string | null; contentMd?: string | null; transcript?: string | null; audioUrl?: string | null; imageUrl?: string | null } }>(`${C}/bank/${id}`),
  createQuestion: (b: AuthorQuestionInput) => api.post<QuestionRow>(`${C}/questions`, b),
  updateQuestion: (id: string, b: Partial<AuthorQuestionInput>) => api.patch<QuestionRow>(`${C}/questions/${id}`, b),
  deleteQuestion: (id: string) => api.delete<{ ok: true }>(`${C}/questions/${id}`),
  tests: () => api.get<AuthorTest[]>(`${C}/tests`),
  test: (id: string) => api.get<AuthorTest & { questions: (QuestionRow & { questionNo: number })[] }>(`${C}/tests/${id}`),
  createTest: (b: AuthorTestInput) => api.post<AuthorTest>(`${C}/tests`, b),
  updateTest: (id: string, b: Partial<AuthorTestInput>) => api.patch<AuthorTest>(`${C}/tests/${id}`, b),
  deleteTest: (id: string) => api.delete<{ ok: true }>(`${C}/tests/${id}`),
  setTestQuestions: (id: string, questionIds: string[]) => api.put<{ count: number }>(`${C}/tests/${id}/questions`, { questionIds }),
  submit: (kind: 'questions' | 'tests', id: string) => api.post<{ id: string; status: ContentStatus }>(`${C}/${kind}/${id}/submit`),
  withdraw: (kind: 'questions' | 'tests', id: string) => api.post<{ id: string; status: ContentStatus }>(`${C}/${kind}/${id}/withdraw`),
};
export const useAuthorQuestions = (q: QuestionQuery) => useQuery({ queryKey: [...tKeys.all, 'content', 'questions', q], queryFn: () => authoringApi.questions(q), placeholderData: (p) => p });
export const useAuthorBank = (q: QuestionQuery) => useQuery({ queryKey: [...tKeys.all, 'content', 'bank', q], queryFn: () => authoringApi.bank(q), placeholderData: (p) => p });
export const useAuthorTests = () => useQuery({ queryKey: [...tKeys.all, 'content', 'tests'], queryFn: authoringApi.tests });
