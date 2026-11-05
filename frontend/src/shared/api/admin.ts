/**
 * API Quản trị — /api/v1/admin. Hàm gọi + hook TanStack Query.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppUser, AuditLog, BlogPost, Broadcast, CourseTreeNode, ExamType, FaqItem, GrammarTopic, PaymentTxn, ResourceDoc, ServiceStatus, SkillTag, SupportTicket, SystemSetting, VocabTopic, VocabWord } from '@/shared/types';
import { api } from './client';
import type { HeadClass, QuestionPage, QuestionQuery, QuestionRow } from './head';

// ---------- DTO ----------
export type AdminUser = AppUser & { phone?: string; bio?: string; organization?: string; city?: string };
export interface UsersPage {
  items: AdminUser[];
  total: number;
  stats: { byRole: Partial<Record<string, number>>; byStatus: Partial<Record<string, number>>; activeLast7d: number; vipStudents: number };
}
export interface AdminDashboard {
  users: number;
  vipUsers: number;
  newThisMonth: number;
  newPrevMonth: number;
  revenueMonth: number;
  revenuePrevMonth: number;
  attempts7d: number;
  openTickets: number;
  pendingPayments: number;
  pendingUsers: { id: string; fullName: string; email: string }[];
  scheduledBroadcasts: { id: string; title: string; scheduledAt?: string }[];
  recentUsers: { id: string; fullName: string; email: string; role: string; avatarUrl?: string | null; createdAt: string }[];
}
export interface AdminAnalytics {
  figures: Record<'activeUsers' | 'studyMinutes' | 'attempts' | 'avgSessionMin', { value: number; change: number | null }>;
  daily: { date: string; label: string; active: number; prevActive: number; minutes: number; questions: number }[];
  signupsMonthly: { labels: string[]; values: number[] };
  attemptsByExam: { TOEIC: number; VSTEP: number };
  roles: Partial<Record<string, number>>;
  devices: { desktop: number; mobile: number; tablet: number };
}
export interface SystemInfo {
  services: ServiceStatus[];
  checkedAt: string;
  process: { uptimeSec: number; rssMb: number; heapUsedMb: number; heapTotalMb: number; node: string; pid: number };
  host: { platform: string; cpus: number; load: number[]; totalMemMb: number; freeMemMb: number };
  database: { version: string; size: string; connections: number; maxConnections?: number; tables: number; latencyMs: number } | null;
  lastActivityAt?: string;
}
export type AdminTxn = PaymentTxn & { orderCode: string; avatarUrl?: string; planCode: string; planName: string; discount: number; paidAt?: string; refundedAt?: string; refundReason?: string };
export interface AdminPlan {
  id: string;
  dbId: string;
  code: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  durationDays?: number;
  period: string;
  features: { text: string; included: boolean }[];
  badge?: string;
  highlight: boolean;
  isActive: boolean;
  examScope?: ExamType;
}
export interface BillingData {
  items: AdminTxn[];
  total: number;
  plans: AdminPlan[];
  revenue: { labels: string[]; revenue: number[]; byPlan: { planId: string; name: string; counts: number[] }[] };
  summary: { pending: number; activeVip: number };
}
export type AdminAuditLog = AuditLog & { actorAvatar?: string; resourceType: string; before?: unknown; after?: unknown };
export type AdminSetting = SystemSetting & { group: string; updatedAt: string };
export type AdminTicket = SupportTicket;
export type AdminSkillTag = SkillTag & { slug: string; parentId: string | null; examType?: ExamType };
export interface AdminCourseRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  examType?: ExamType;
  track?: string;
  trackGroup?: string;
  level: string;
  description: string;
  gradient: string;
  coverUrl?: string;
  lessonsCount: number;
  durationHours: number;
  studentsCount: number;
  rating?: number;
  isFree: boolean;
  isSequential: boolean;
  teacherName: string;
  status: string;
}
export type TreeLesson = { id: string; title: string; type: string; durationMin: number; status: string; orderIndex: number; videoUrl?: string | null; isFreePreview: boolean; exercisesCount?: number };
export type AdminTreeNode = CourseTreeNode & { slug?: string; status?: string; category?: string; track?: string; trackGroup?: string; partTitle?: string; lessons?: TreeLesson[]; children?: AdminTreeNode[] };
export interface AdminTestRow {
  id: string;
  slug: string;
  title: string;
  examType: ExamType;
  kind: string;
  level: string;
  durationMinutes: number;
  totalQuestions: number;
  parts: string[];
  partIds: string[];
  attempts: number;
  isFree: boolean;
  year: number;
  tags: string[];
  coverUrl?: string;
  status: string;
  version: number;
}
export type AdminGrammar = GrammarTopic & { status?: string; orderIndex?: number; tagId?: string };
/** Bài chép chính tả (passages purpose DICTATION) */
export interface AdminDictation {
  id: string;
  title: string;
  examType?: ExamType;
  level?: string;
  audioUrl?: string;
  isFree: boolean;
  status: string;
  sentences: number;
  /** Mỗi dòng một câu */
  segmentsText: string;
  assigned: number;
  attempts: number;
  updatedAt: string;
}
/** Tiêu chí chấm bài Viết / Nói */
export interface AdminRubric {
  id: string;
  code: string;
  name: string;
  examType: ExamType;
  skill: 'WRITING' | 'SPEAKING';
  scaleMax: number;
  criteriaCount: number;
  /** Mỗi dòng: khoá | tên tiêu chí | trọng số | mô tả */
  criteriaText: string;
  gradings: number;
  questions: number;
}
export type AdminVocabTopic = VocabTopic & { slug?: string; examType?: ExamType; isFree?: boolean; orderIndex?: number };
export type AdminWord = VocabWord & { ipaUk?: string; ipaUs?: string; meaningEn?: string; exampleVi?: string; topicId?: string };
export type AdminPost = BlogPost & { kind?: string; status?: string; examType?: ExamType; seriesOrder?: number; authorAvatar?: string };
export type AdminFaq = FaqItem & { keywords?: string[]; showInFaq?: boolean; showInChat?: boolean; orderIndex?: number };
export type AdminResource = ResourceDoc & { fileUrl?: string; isVip?: boolean };

// ---------- gọi API ----------
export const adminApi = {
  dashboard: () => api.get<AdminDashboard>('/admin/dashboard'),
  users: (q: Record<string, unknown> = {}) => api.get<UsersPage>('/admin/users', q),
  createUser: (b: Record<string, unknown>) => api.post<AdminUser & { temporaryPassword?: string }>('/admin/users', b),
  updateUser: (id: string, b: Record<string, unknown>) => api.patch<AdminUser>(`/admin/users/${id}`, b),
  lockUser: (id: string, locked: boolean, reason?: string) => api.post<AdminUser>(`/admin/users/${id}/lock`, { locked, reason }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  bulkUsers: (b: { ids: string[]; action: 'LOCK' | 'UNLOCK' | 'DELETE' | 'SET_ROLE'; role?: string; reason?: string }) => api.post<{ count: number }>('/admin/users/bulk', b),

  courseTree: () => api.get<AdminTreeNode[]>('/admin/courses/tree'),
  courses: () => api.get<AdminCourseRow[]>('/admin/courses'),
  createCourse: (b: Record<string, unknown>) => api.post<AdminCourseRow>('/admin/courses', b),
  updateCourse: (id: string, b: Record<string, unknown>) => api.patch<AdminCourseRow>(`/admin/courses/${id}`, b),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),
  createSection: (b: { courseId: string; title: string; partTitle?: string }) => api.post('/admin/sections', b),
  updateSection: (id: string, b: { title?: string; partTitle?: string }) => api.patch(`/admin/sections/${id}`, b),
  deleteSection: (id: string) => api.delete(`/admin/sections/${id}`),
  createLesson: (b: Record<string, unknown>) => api.post('/admin/lessons', b),
  updateLesson: (id: string, b: Record<string, unknown>) => api.patch(`/admin/lessons/${id}`, b),
  /** Nội dung đầy đủ của bài để sửa: bài giảng, kiến thức, script, bài tập dạng chữ */
  lessonKnowledge: (id: string) =>
    api.get<{ knowledgeText: string; transcriptText: string; summary: string; contentMd: string; passScorePct: number | null; exercisesText: string; exercisesFixed: number }>(`/admin/lessons/${id}/knowledge`),
  deleteLesson: (id: string) => api.delete(`/admin/lessons/${id}`),

  questions: (q: QuestionQuery) => api.get<QuestionPage>('/admin/questions', q),
  createQuestion: (b: Record<string, unknown>) => api.post<QuestionRow>('/admin/questions', b),
  updateQuestion: (id: string, b: Record<string, unknown>) => api.patch<QuestionRow>(`/admin/questions/${id}`, b),
  deleteQuestion: (id: string) => api.delete(`/admin/questions/${id}`),

  tests: () => api.get<AdminTestRow[]>('/admin/tests'),
  createTest: (b: Record<string, unknown>) => api.post<AdminTestRow>('/admin/tests', b),
  updateTest: (id: string, b: Record<string, unknown>) => api.patch<AdminTestRow>(`/admin/tests/${id}`, b),
  deleteTest: (id: string) => api.delete(`/admin/tests/${id}`),
  test: (id: string) => api.get<AdminTestRow & { questions: (QuestionRow & { questionNo: number; points: number })[] }>(`/admin/tests/${id}`),
  setTestQuestions: (id: string, questionIds: string[]) => api.put<{ count: number }>(`/admin/tests/${id}/questions`, { questionIds }),
  duplicateTest: (id: string) => api.post<AdminTestRow>(`/admin/tests/${id}/duplicate`),

  skillTags: () => api.get<AdminSkillTag[]>('/admin/skill-tags'),
  createSkillTag: (b: Record<string, unknown>) => api.post<AdminSkillTag>('/admin/skill-tags', b),
  updateSkillTag: (id: string, b: Record<string, unknown>) => api.patch<AdminSkillTag>(`/admin/skill-tags/${id}`, b),
  deleteSkillTag: (id: string) => api.delete(`/admin/skill-tags/${id}`),

  dictation: () => api.get<AdminDictation[]>('/admin/dictation'),
  createDictation: (b: Record<string, unknown>) => api.post<AdminDictation>('/admin/dictation', b),
  updateDictation: (id: string, b: Record<string, unknown>) => api.patch<AdminDictation>(`/admin/dictation/${id}`, b),
  deleteDictation: (id: string) => api.delete(`/admin/dictation/${id}`),
  rubrics: () => api.get<AdminRubric[]>('/admin/rubrics'),
  createRubric: (b: Record<string, unknown>) => api.post<AdminRubric>('/admin/rubrics', b),
  updateRubric: (id: string, b: Record<string, unknown>) => api.patch<AdminRubric>(`/admin/rubrics/${id}`, b),
  deleteRubric: (id: string) => api.delete(`/admin/rubrics/${id}`),
  grammar: () => api.get<AdminGrammar[]>('/admin/grammar'),
  createGrammar: (b: Record<string, unknown>) => api.post<AdminGrammar>('/admin/grammar', b),
  updateGrammar: (id: string, b: Record<string, unknown>) => api.patch<AdminGrammar>(`/admin/grammar/${id}`, b),
  deleteGrammar: (id: string) => api.delete(`/admin/grammar/${id}`),
  vocabTopics: () => api.get<AdminVocabTopic[]>('/admin/vocab-topics'),
  createVocabTopic: (b: Record<string, unknown>) => api.post<AdminVocabTopic>('/admin/vocab-topics', b),
  updateVocabTopic: (id: string, b: Record<string, unknown>) => api.patch<AdminVocabTopic>(`/admin/vocab-topics/${id}`, b),
  deleteVocabTopic: (id: string) => api.delete(`/admin/vocab-topics/${id}`),
  words: (q: Record<string, unknown> = {}) => api.get<{ items: AdminWord[]; total: number }>('/admin/words', q),
  createWord: (b: Record<string, unknown>) => api.post<AdminWord>('/admin/words', b),
  updateWord: (id: string, b: Record<string, unknown>) => api.patch<AdminWord>(`/admin/words/${id}`, b),
  deleteWord: (id: string) => api.delete(`/admin/words/${id}`),
  posts: () => api.get<AdminPost[]>('/admin/posts'),
  createPost: (b: Record<string, unknown>) => api.post<AdminPost>('/admin/posts', b),
  updatePost: (id: string, b: Record<string, unknown>) => api.patch<AdminPost>(`/admin/posts/${id}`, b),
  deletePost: (id: string) => api.delete(`/admin/posts/${id}`),
  faqs: () => api.get<AdminFaq[]>('/admin/faqs'),
  createFaq: (b: Record<string, unknown>) => api.post<AdminFaq>('/admin/faqs', b),
  updateFaq: (id: string, b: Record<string, unknown>) => api.patch<AdminFaq>(`/admin/faqs/${id}`, b),
  deleteFaq: (id: string) => api.delete(`/admin/faqs/${id}`),
  resources: () => api.get<AdminResource[]>('/admin/resources'),
  createResource: (b: Record<string, unknown>) => api.post<AdminResource>('/admin/resources', b),
  updateResource: (id: string, b: Record<string, unknown>) => api.patch<AdminResource>(`/admin/resources/${id}`, b),
  deleteResource: (id: string) => api.delete(`/admin/resources/${id}`),

  classes: () => api.get<HeadClass[]>('/admin/classes'),
  updateClass: (id: string, b: Record<string, unknown>) => api.patch<HeadClass>(`/admin/classes/${id}`, b),
  regenerateCode: (id: string) => api.post<{ code: string }>(`/admin/classes/${id}/regenerate-code`),
  deleteClass: (id: string) => api.delete(`/admin/classes/${id}`),

  tickets: () => api.get<AdminTicket[]>('/admin/support'),
  updateTicket: (id: string, b: Record<string, unknown>) => api.patch<AdminTicket>(`/admin/support/${id}`, b),
  replyTicket: (id: string, text: string, resolve?: boolean) => api.post<AdminTicket>(`/admin/support/${id}/reply`, { text, resolve }),

  billing: () => api.get<BillingData>('/admin/billing'),
  confirmPayment: (id: string) => api.post<AdminTxn>(`/admin/billing/${id}/confirm`),
  refundPayment: (id: string, reason: string) => api.post<AdminTxn>(`/admin/billing/${id}/refund`, { reason }),
  failPayment: (id: string) => api.post<AdminTxn>(`/admin/billing/${id}/fail`),
  updatePlan: (code: string, b: Record<string, unknown>) => api.patch<AdminPlan>(`/admin/plans/${code}`, b),

  broadcasts: () => api.get<{ items: Broadcast[]; audienceCounts: Record<string, number> }>('/admin/broadcasts'),
  createBroadcast: (b: Record<string, unknown>) => api.post<Broadcast>('/admin/broadcasts', b),
  sendBroadcast: (id: string) => api.post<Broadcast>(`/admin/broadcasts/${id}/send`),
  deleteBroadcast: (id: string) => api.delete(`/admin/broadcasts/${id}`),

  settings: () => api.get<AdminSetting[]>('/admin/settings'),
  saveSettings: (values: Record<string, string | number | boolean>) => api.put<AdminSetting[]>('/admin/settings', { values }),
  auditLogs: (q: Record<string, unknown> = {}) => api.get<{ items: AdminAuditLog[]; total: number; bySeverity: Partial<Record<string, number>> }>('/admin/audit-logs', q),
  analytics: (days = 7) => api.get<AdminAnalytics>('/admin/analytics', { days }),
  system: () => api.get<SystemInfo>('/admin/system'),
};

// ---------- hook ----------
const K = ['admin'] as const;
export const adminKeys = { all: K, of: (...k: unknown[]) => [...K, ...k] as const };
const q = <T,>(key: unknown[], fn: () => Promise<T>, opts: { enabled?: boolean; staleTime?: number; refetchInterval?: number } = {}) => ({ queryKey: [...K, ...key], queryFn: fn, ...opts });

export const useAdminDashboard = () => useQuery(q(['dashboard'], adminApi.dashboard, { staleTime: 30_000 }));
export const useAdminUsers = (params: Record<string, unknown> = {}) => useQuery(q(['users', params], () => adminApi.users(params)));
export const useAdminCourseTree = () => useQuery(q(['course-tree'], adminApi.courseTree));
export const useAdminCourses = () => useQuery(q(['courses'], adminApi.courses));
export const useAdminQuestions = (params: QuestionQuery) => useQuery({ ...q(['questions', params], () => adminApi.questions(params)), placeholderData: (p: QuestionPage | undefined) => p });
export const useAdminTests = () => useQuery(q(['tests'], adminApi.tests));
export const useAdminSkillTags = () => useQuery(q(['skill-tags'], adminApi.skillTags));
export const useAdminGrammar = () => useQuery(q(['grammar'], adminApi.grammar));
export const useAdminDictation = () => useQuery(q(['dictation'], adminApi.dictation));
export const useAdminRubrics = () => useQuery(q(['rubrics'], adminApi.rubrics));
export const useAdminVocabTopics = () => useQuery(q(['vocab-topics'], adminApi.vocabTopics));
export const useAdminWords = (params: Record<string, unknown> = {}) => useQuery(q(['words', params], () => adminApi.words(params)));
export const useAdminPosts = () => useQuery(q(['posts'], adminApi.posts));
export const useAdminFaqs = () => useQuery(q(['faqs'], adminApi.faqs));
export const useAdminResources = () => useQuery(q(['resources'], adminApi.resources));
export const useAdminClasses = () => useQuery(q(['classes'], adminApi.classes));
export const useAdminTickets = () => useQuery(q(['tickets'], adminApi.tickets));
export const useAdminBilling = () => useQuery(q(['billing'], adminApi.billing));
export const useAdminBroadcasts = () => useQuery(q(['broadcasts'], adminApi.broadcasts));
export const useAdminSettings = () => useQuery(q(['settings'], adminApi.settings));
export const useAdminAuditLogs = (params: Record<string, unknown> = {}) => useQuery(q(['audit-logs', params], () => adminApi.auditLogs(params)));
export const useAdminAnalytics = (days = 7) => useQuery(q(['analytics', days], () => adminApi.analytics(days)));
export const useAdminSystem = (enabled = true) => useQuery(q(['system'], adminApi.system, { enabled, refetchInterval: 60_000 }));

/** Mutation dùng chung: xong thì làm mới toàn bộ dữ liệu khu vực quản trị */
export function useAdminMutation<A, R>(fn: (a: A) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: K }) });
}
/** Gọi trong onCreate/onUpdate của CrudEditor rồi làm mới cache */
export function useAdminInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: K });
}
