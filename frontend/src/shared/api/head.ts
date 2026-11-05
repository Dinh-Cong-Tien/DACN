/**
 * API Trưởng bộ môn — /api/v1/head. Hàm gọi + hook TanStack Query.
 * DTO bám `shared/types` (ClassRoom, TeacherSummary, GradingReview…), kèm vài field phụ backend trả thêm.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApprovalRequest, ClassCourseProgress, ClassObservation, ClassReport, ClassRoom, Complaint, DeptStudent, ExamType, GradingReview, Subject, TeacherSummary } from '@/shared/types';
import { api, http } from './client';
import type { SelfStudy } from './teacher';

// ---------- DTO ----------
export type HeadClass = ClassRoom & {
  teacherId: string;
  departmentId?: string | null;
  level?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  isArchived?: boolean;
  departmentName?: string;
};
export type HeadTeacher = TeacherSummary & { role?: string; departmentId?: string | null; bio?: string; phone?: string; joinedAt?: string };
export type HeadSubject = Subject & { description?: string; headId?: string };
export interface SessionRow {
  id: string;
  classId: string;
  className: string;
  date: string;
  start: string;
  end: string;
  room?: string;
  topic: string;
  status: 'UPCOMING' | 'DONE' | 'CANCELLED';
  observerId?: string;
  teacher?: string;
  examType?: ExamType;
  /** % có mặt (có mặt + muộn) nếu buổi đã điểm danh */
  attendanceRate?: number | null;
  note?: string;
}
export interface RoomConflict {
  date: string;
  room: string;
  start: string;
  end: string;
  sessions: { id: string; classId: string; className: string; start: string; end: string }[];
}
export interface HeadDashboard {
  classesCount: number;
  studentsCount: number;
  teachersCount: number;
  activeTeachers: number;
  pendingApprovals: number;
  pendingReviews: number;
  newComplaints: number;
  upcomingObservations: number;
  roomConflicts: number;
  lowAttendanceClasses: number;
  classesNeedTeacher: { id: string; name: string; teacherName: string }[];
}
export type HeadApproval = ApprovalRequest & { resourceType: string; authorAvatar?: string; reviewer?: string; note?: string };
export type HeadComplaint = Complaint & {
  studentEmail?: string;
  avatarUrl?: string;
  questionId?: string;
  /** Phúc khảo bài nộp Viết / Nói */
  submissionId?: string;
  kind?: 'APPEAL' | 'QUESTION' | 'OTHER';
  issue?: string;
  resolution?: string;
  messages: { from: string; text: string; at: string }[];
};
export type HeadGradingReview = GradingReview & {
  taskTitle: string;
  audioUrl?: string;
  teacherTotal: number;
  headTotal?: number;
  rubric: { code: string; name: string; scaleMax: number; criteria: { key: string; label: string; description?: string; weight?: number }[] };
};
export interface HeadClassAssignment {
  id: string;
  title: string;
  type: string;
  dueAt?: string;
  status: string;
  submitted: number;
  total: number;
  avgScore: number | null;
  maxScore: number;
}
export interface HeadClassDetail {
  class: HeadClass;
  analytics: { trend: { labels: string[]; values: number[] }; accuracy: { part: string; rate: number; total: number }[] };
  students: DeptStudent[];
  /** Tiến độ khoá học của từng học viên (lớp đã gắn khoá) */
  courseProgress?: ClassCourseProgress;
  sessions: SessionRow[];
  observations: ClassObservation[];
  assignments: HeadClassAssignment[];
}
export interface HeadTeacherDetail {
  teacher: HeadTeacher;
  classes: HeadClass[];
  sessions: SessionRow[];
  observations: ClassObservation[];
  review: { total: number; agreed: number; adjusted: number; pending: number; avgDeviation: number };
}
export type ReportRow = ClassReport & { examType: ExamType; completion: number; /** false = chưa điểm danh buổi nào */ hasAttendance?: boolean };
export interface HeadReports {
  classes: ReportRow[];
  monthly: { labels: string[]; attendance: number[]; completion: number[] };
  gradeDist: { grade: 'A' | 'B' | 'C' | 'D'; count: number }[];
  /** Tổng hợp: học viên khác nhau, chuyên cần gộp theo lượt điểm danh (null = chưa điểm danh) */
  summary?: { students: number; attendanceRate: number | null };
}
export interface QuestionRow {
  id: string;
  examType: ExamType;
  part: string;
  skill: string;
  type: string;
  level?: string;
  stem: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  translationVi?: string;
  audioUrl?: string;
  imageUrl?: string;
  passageId?: string;
  passageTitle?: string;
  tagIds: string[];
  status: string;
  source: string;
  version: number;
  difficulty: number;
  correctRate?: number;
  hasExplanation: boolean;
  createdAt: string;
  taskConfig?: Record<string, unknown>;
}
export interface QuestionPage {
  items: QuestionRow[];
  total: number;
  page: number;
  pageSize: number;
  byPart: { part: string; count: number }[];
}
export interface OversightAssignment {
  id: string;
  classId: string;
  className: string;
  title: string;
  type: string;
  dueDate: string;
  openAt?: string;
  submitted: number;
  total: number;
  graded: number;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  overdue: boolean;
  avgScore?: number;
  maxScore?: number;
  examType: ExamType;
  teacherId?: string;
  teacherName: string;
  createdAt: string;
  note?: string;
}
export interface OversightSubmission {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  submittedAt: string;
  score?: number;
  maxScore: number;
  state: 'TODO' | 'SUBMITTED' | 'LATE' | 'GRADED' | 'MISSING';
  feedback?: string;
  className?: string;
  assignmentTitle?: string;
  dueDate?: string;
  type?: string;
}
export type OversightAssignmentDetail = OversightAssignment & { submissions: OversightSubmission[] };
export interface ResultRow {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  avatarUrl?: string;
  className: string;
  testTitle: string;
  examType?: ExamType;
  mode: string;
  score?: number;
  listening?: number;
  reading?: number;
  writing?: number;
  speaking?: number;
  cefr?: string;
  correct?: number;
  total: number;
  durationSec: number;
  status: string;
  submittedAt?: string;
}
export interface ResultPage {
  items: ResultRow[];
  total: number;
  page: number;
  pageSize: number;
  summary: { attempts: number; fullTests: number; students: number; avgToeic: number | null; avgVstep: number | null };
}
export type ResultQuery = { page?: number; pageSize?: number; q?: string; classId?: string; examType?: ExamType; mode?: 'FULL' | 'PRACTICE' | 'OTHER' };
export interface OversightMaterial { id: string; classId: string; className: string; teacherName: string; title: string; description?: string; type: string; category?: string; url: string; size?: string; downloads: number; createdAt: string }
export interface OversightAnnouncement { id: string; classId: string; className: string; teacherName: string; title: string; body: string; pinned: boolean; readCount: number; classSize: number; createdAt: string }
export interface StudentDossier {
  student: { id: string; name: string; email: string; phone?: string; avatarUrl?: string; status: string; plan: 'FREE' | 'VIP'; joinedAt: string; lastActiveAt: string | null; streak: number; xp: number; target?: { examType: ExamType; score: string; examDate?: string } };
  classes: { id: string; name: string; examType: ExamType; teacherName: string; memberStatus: string; joinedAt?: string; attendanceRate: number | null; sessionsMarked: number; absent: number; assignmentsDone: number; assignmentsTotal: number }[];
  attempts: { id: string; testTitle: string; examType?: ExamType; mode: string; score?: number; listening?: number; reading?: number; cefr?: string; correct?: number; total: number; durationSec: number; submittedAt?: string }[];
  submissions: OversightSubmission[];
  notes: { id: string; kind: string; text: string; date: string; teacherName: string; className?: string }[];
  /** Tự học + Sổ tay lỗi sai — cùng DTO hồ sơ học viên của giáo viên */
  self: SelfStudy;
  mistakeCauses: { cause: string; count: number }[];
  weakTags: { tagId: string; name: string; count: number }[];
}

type KV = { key: string; value: number };
/** Thống kê tổng kết bộ môn — chuỗi theo tháng cùng độ dài `months` */
export interface HeadSummary {
  months: string[];
  students: { total: number; byExam: KV[]; byRisk: KV[]; joined: number[]; left: number };
  teachers: { name: string; classes: number; students: number }[];
  teaching: { classes: number; sessionsDone: number[]; sessionsCancelled: number; sessionsUpcoming: number; sessionsUnreported: number; marks: KV[]; observed: number };
  assignments: { created: number[]; byType: KV[]; submissions: KV[] };
  results: { attempts: number[]; fullTests: number; toeicBands: KV[]; avgToeicByMonth: (number | null)[] };
  content: { byPart: KV[]; questionsByStatus: KV[]; testsByStatus: KV[] };
  quality: { reviews: KV[]; complaints: KV[] };
}

export type QuestionQuery = { page?: number; pageSize?: number; q?: string; examType?: ExamType; part?: string; skill?: string; status?: string; type?: string };

// ---------- gọi API ----------
export const headApi = {
  dashboard: () => api.get<HeadDashboard>('/head/dashboard'),
  subjects: () => api.get<HeadSubject[]>('/head/subjects'),
  createSubject: (b: { name: string; code: string; examType: ExamType; description?: string; headId?: string | null }) => api.post<HeadSubject>('/head/subjects', b),
  updateSubject: (id: string, b: Partial<{ name: string; code: string; examType: ExamType; description?: string; headId?: string | null }>) => api.patch<HeadSubject>(`/head/subjects/${id}`, b),
  deleteSubject: (id: string) => api.delete(`/head/subjects/${id}`),
  teachers: () => api.get<HeadTeacher[]>('/head/teachers'),
  teacher: (id: string) => api.get<HeadTeacherDetail>(`/head/teachers/${id}`),
  teacherNote: (id: string, text: string) => api.post(`/head/teachers/${id}/note`, { text }),
  setTeacherStatus: (id: string, status: 'ACTIVE' | 'LOCKED', reason?: string) => api.patch<HeadTeacher>(`/head/teachers/${id}`, { status, reason }),
  classes: () => api.get<HeadClass[]>('/head/classes'),
  classDetail: (id: string) => api.get<HeadClassDetail>(`/head/classes/${id}`),
  createClass: (b: Record<string, unknown>) => api.post<HeadClass>('/head/classes', b),
  updateClass: (id: string, b: Record<string, unknown>) => api.patch<HeadClass>(`/head/classes/${id}`, b),
  classNote: (id: string, text: string) => api.post(`/head/classes/${id}/note`, { text }),
  students: () => api.get<DeptStudent[]>('/head/students'),
  remindTeacher: (studentId: string, classId: string, note?: string) => api.post(`/head/students/${studentId}/remind-teacher`, { classId, note }),
  schedule: (from?: string, to?: string) => api.get<{ from: string; to: string; sessions: SessionRow[]; conflicts: RoomConflict[] }>('/head/schedule', { from, to }),
  approvals: () => api.get<HeadApproval[]>('/head/approvals'),
  approve: (type: string, id: string, note?: string) => api.post(`/head/approvals/${type}/${id}/approve`, { note }),
  reject: (type: string, id: string, note: string) => api.post(`/head/approvals/${type}/${id}/reject`, { note }),
  questionBank: (q: QuestionQuery) => api.get<QuestionPage>('/head/question-bank', q),
  updateQuestion: (id: string, b: { stem?: string; options?: { key: string; text: string }[] | null; correctAnswer?: string | null; explanation?: string | null; translationVi?: string | null }) => api.patch<QuestionRow>(`/head/question-bank/${id}`, b),
  archiveQuestion: (id: string, archived: boolean) => api.post<QuestionRow>(`/head/question-bank/${id}/archive`, { archived }),
  question: (id: string) => api.get<QuestionRow & { passage: { id: string; title?: string; contentMd?: string; transcript?: string; audioUrl?: string; imageUrl?: string } | null }>(`/head/question-bank/${id}`),
  gradingReviews: () => api.get<HeadGradingReview[]>('/head/grading-reviews'),
  gradingReview: (id: string) => api.get<HeadGradingReview>(`/head/grading-reviews/${id}`),
  decideReview: (id: string, b: { decision: 'AGREED' | 'ADJUSTED'; scores?: Record<string, number>; note?: string }) => api.post<HeadGradingReview>(`/head/grading-reviews/${id}`, b),
  observations: () => api.get<ClassObservation[]>('/head/observations'),
  planObservation: (sessionId: string, topic?: string) => api.post<ClassObservation>('/head/observations', { sessionId, topic }),
  recordObservation: (id: string, b: { rating: number; strengths?: string; improvements?: string }) => api.patch<ClassObservation>(`/head/observations/${id}`, b),
  cancelObservation: (id: string) => api.delete(`/head/observations/${id}`),
  complaints: () => api.get<HeadComplaint[]>('/head/complaints'),
  setComplaintStatus: (id: string, status: 'NEW' | 'IN_REVIEW' | 'RESOLVED') => api.patch<HeadComplaint>(`/head/complaints/${id}`, { status }),
  replyComplaint: (id: string, b: { text: string; resolve?: boolean; accepted?: boolean }) => api.post<HeadComplaint>(`/head/complaints/${id}/reply`, b),
  assignments: (q: { classId?: string; status?: string; q?: string } = {}) => api.get<OversightAssignment[]>('/head/assignments', q),
  assignment: (id: string) => api.get<OversightAssignmentDetail>(`/head/assignments/${id}`),
  results: (q: ResultQuery) => api.get<ResultPage>('/head/results', q),
  materials: (classId?: string) => api.get<OversightMaterial[]>('/head/materials', { classId }),
  announcements: (classId?: string) => api.get<OversightAnnouncement[]>('/head/announcements', { classId }),
  removeMaterial: (id: string, reason: string) => http.delete(`/head/materials/${id}`, { data: { reason } }),
  removeAnnouncement: (id: string, reason: string) => http.delete(`/head/announcements/${id}`, { data: { reason } }),
  student: (id: string) => api.get<StudentDossier>(`/head/students/${id}`),
  summary: (months = 6, departmentId?: string) => api.get<HeadSummary>('/head/reports/summary', { months, departmentId }),
  reports: (months = 6, departmentId?: string) => api.get<HeadReports>('/head/reports', { months, departmentId }),
};

// ---------- hook ----------
const K = ['head'] as const;
export const headKeys = {
  all: K,
  dashboard: [...K, 'dashboard'] as const,
  subjects: [...K, 'subjects'] as const,
  teachers: [...K, 'teachers'] as const,
  teacher: (id: string) => [...K, 'teacher', id] as const,
  classes: [...K, 'classes'] as const,
  classDetail: (id: string) => [...K, 'class', id] as const,
  students: [...K, 'students'] as const,
  schedule: (from?: string) => [...K, 'schedule', from ?? 'week'] as const,
  approvals: [...K, 'approvals'] as const,
  questionBank: (q: QuestionQuery) => [...K, 'question-bank', q] as const,
  reviews: [...K, 'grading-reviews'] as const,
  observations: [...K, 'observations'] as const,
  complaints: [...K, 'complaints'] as const,
  reports: (months: number, dep?: string) => [...K, 'reports', months, dep ?? 'all'] as const,
  assignments: (q: object) => [...K, 'assignments', q] as const,
  assignment: (id: string) => [...K, 'assignment', id] as const,
  results: (q: ResultQuery) => [...K, 'results', q] as const,
  materials: [...K, 'materials'] as const,
  announcements: [...K, 'announcements'] as const,
  student: (id: string) => [...K, 'student', id] as const,
  summary: (months: number, dep?: string) => [...K, 'summary', months, dep ?? 'all'] as const,
};

export const useHeadDashboard = () => useQuery({ queryKey: headKeys.dashboard, queryFn: headApi.dashboard, staleTime: 30_000 });
export const useHeadSubjects = () => useQuery({ queryKey: headKeys.subjects, queryFn: headApi.subjects });
export const useHeadTeachers = () => useQuery({ queryKey: headKeys.teachers, queryFn: headApi.teachers });
export const useHeadTeacher = (id?: string) => useQuery({ queryKey: headKeys.teacher(id ?? ''), queryFn: () => headApi.teacher(id!), enabled: !!id });
export const useHeadClasses = () => useQuery({ queryKey: headKeys.classes, queryFn: headApi.classes });
export const useHeadClass = (id?: string) => useQuery({ queryKey: headKeys.classDetail(id ?? ''), queryFn: () => headApi.classDetail(id!), enabled: !!id });
export const useHeadStudents = () => useQuery({ queryKey: headKeys.students, queryFn: headApi.students });
export const useHeadSchedule = (from?: string, to?: string) => useQuery({ queryKey: headKeys.schedule(from), queryFn: () => headApi.schedule(from, to) });
export const useHeadApprovals = () => useQuery({ queryKey: headKeys.approvals, queryFn: headApi.approvals });
export const useHeadQuestionBank = (q: QuestionQuery) => useQuery({ queryKey: headKeys.questionBank(q), queryFn: () => headApi.questionBank(q), placeholderData: (p) => p });
export const useHeadReviews = () => useQuery({ queryKey: headKeys.reviews, queryFn: headApi.gradingReviews });
export const useHeadObservations = () => useQuery({ queryKey: headKeys.observations, queryFn: headApi.observations });
export const useHeadComplaints = () => useQuery({ queryKey: headKeys.complaints, queryFn: headApi.complaints });
export const useHeadSummary = (months = 6, dep?: string) => useQuery({ queryKey: headKeys.summary(months, dep), queryFn: () => headApi.summary(months, dep) });
export const useHeadReports = (months = 6, dep?: string) => useQuery({ queryKey: headKeys.reports(months, dep), queryFn: () => headApi.reports(months, dep) });

export const useHeadAssignments = (q: { classId?: string; status?: string; q?: string }) => useQuery({ queryKey: headKeys.assignments(q), queryFn: () => headApi.assignments(q), placeholderData: (p) => p });
export const useHeadAssignment = (id?: string) => useQuery({ queryKey: headKeys.assignment(id ?? ''), queryFn: () => headApi.assignment(id!), enabled: !!id });
export const useHeadResults = (q: ResultQuery) => useQuery({ queryKey: headKeys.results(q), queryFn: () => headApi.results(q), placeholderData: (p) => p });
export const useHeadMaterials = () => useQuery({ queryKey: headKeys.materials, queryFn: () => headApi.materials() });
export const useHeadAnnouncements = () => useQuery({ queryKey: headKeys.announcements, queryFn: () => headApi.announcements() });
export const useHeadStudent = (id?: string) => useQuery({ queryKey: headKeys.student(id ?? ''), queryFn: () => headApi.student(id!), enabled: !!id });

/** Mutation dùng chung: chạy xong làm mới toàn bộ dữ liệu khu vực Trưởng bộ môn */
export function useHeadMutation<A, R>(fn: (a: A) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: K }) });
}
/** Làm mới toàn bộ cache khu vực Trưởng bộ môn (sau khi lưu qua CrudEditor) */
export function useHeadInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: K });
}
