/**
 * API khu vực giáo viên — /api/v1/teacher.
 * Type mở rộng từ hợp đồng `shared/types` (thêm field backend trả về); hook TanStack Query cho từng màn hình.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Assignment, AssignmentTarget, AssignmentType, AttendanceMark, ClassAnnouncement, ClassRoom, ClassSession, ClassStudent, CourseCategory, ExamType, StudentNote, Submission } from '@/shared/types';
import { api, http, tokenStore } from './client';

// ======================= Types =======================

export interface TClassRoom extends ClassRoom {
  teacherId: string;
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
  stats: { classes: number; students: number; pendingGrading: number; lateSubmissions: number; attendanceRate: number; atRiskCount: number; sessionsThisWeek: number };
  classes: TClassRoom[];
  atRisk: TClassStudent[];
  sessions: TSession[];
  upcomingDeadlines: TAssignment[];
  pendingSubmissions: TSubmission[];
  week: { from: string; to: string };
  nextSession: TSession | null;
}

export interface ClassDetail extends TClassRoom {
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
}
export interface LibCourse {
  id: string;
  slug: string;
  title: string;
  category: CourseCategory | 'EXAM_PREP';
  examType?: ExamType;
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
  name: string;
  examType: ExamType;
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
