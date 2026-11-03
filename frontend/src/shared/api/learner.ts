/**
 * API phía học viên — /api/v1/learner (cần đăng nhập) + vài endpoint nội dung /catalog dùng riêng cho trang học viên.
 * Hook TanStack Query; mutation tự invalidate các truy vấn liên quan.
 */
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { IMockTest, IQuestion } from '@toeic-vstep/shared';
import type {
  Achievement,
  AppNotification,
  Assignment,
  AttemptSummary,
  ClassAnnouncement,
  ClassRoom,
  ExamType,
  GrammarTopic,
  LeaderboardEntry,
  Material,
  Milestone,
  Mistake,
  MistakeCause,
  MockTestSummary,
  MyAssignmentState,
  TestPartInfo,
  VocabTopic,
  VocabWord,
} from '@/shared/types';
import { useAuthStore } from '@/shared/stores/authStore';
import { api, http, tokenStore } from './client';

// ---------- Kiểu DTO ----------
export interface Goal {
  id: string;
  examType: ExamType;
  currentLevel?: string | null;
  targetScore?: number | null;
  targetLevel?: string | null;
  targetDate?: string;
  purpose?: string | null;
  studyDays: number[];
  minutesPerDay: number;
  preferredSlot?: string | null;
}
export type GoalInput = Omit<Goal, 'id'>;
export interface LearningPathDto {
  id: string;
  examType: ExamType;
  version: number;
  progress: number;
  milestones: Milestone[];
}

export interface AttemptAnswerDto {
  questionId: string;
  selectedKey?: string;
  textAnswer?: string;
  audioUrl?: string;
  isFlagged?: boolean;
  answeredAt?: string;
}
export interface AttemptDto {
  id: string;
  testId: string | null;
  mode: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';
  startedAt: string;
  timeLimitSec: number | null;
  timeSpentSec: number;
  setup: { mode: 'FULL' | 'PRACTICE'; parts: string[]; minutes: number | null };
  answers: AttemptAnswerDto[];
}
export interface PartResult {
  part: string;
  correct: number;
  total: number;
  timeSec: number;
  scaled: number | null;
}
export interface AttemptResult {
  summary: AttemptSummary & { mode?: string; status?: string };
  partResults: PartResult[] | null;
  cefr: string | null;
  answers: (AttemptAnswerDto & { isCorrect: boolean | null; timeSpentMs: number; grading?: { totalScore: number; criteria: Record<string, number>; feedback?: string | null } })[];
}
/** Câu hỏi trả từ API có thêm vài trường ngoài IQuestion */
export type ApiQuestion = IQuestion & { translationVi?: string | null; audioUrl?: string; imageUrl?: string; taskConfig?: Record<string, unknown> };
export interface AttemptPayload {
  attempt: AttemptDto;
  test: IMockTest;
  result?: AttemptResult;
  xpGained?: number;
}
export interface StartAttemptInput {
  testId?: string;
  mode?: 'FULL' | 'PRACTICE';
  parts?: string[];
  minutes?: number | null;
  questionCount?: number;
  examType?: ExamType;
  assignmentId?: string;
  lessonId?: string;
  restart?: boolean;
  /** Làm trên các câu chỉ định (đề Viết/Nói tự luyện) */
  questionIds?: string[];
}
export interface SaveAnswerItem {
  questionId: string;
  selectedKey?: string | null;
  textAnswer?: string | null;
  audioUrl?: string | null;
  isFlagged?: boolean;
  timeSpentMs?: number;
}
export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type MistakeDto = Mistake & { note?: string; cardId?: string };
export type VocabWordDto = VocabWord & { isLearning?: boolean; cardId?: string; topicId?: string; ipaUk?: string; meaningEn?: string; exampleVi?: string; imageUrl?: string; audioUrl?: string };
export interface ReviewDue {
  totalDue: number;
  upcoming7d: number;
  words: VocabWordDto[];
  mistakes: MistakeDto[];
}
export interface ReviewResult {
  cardId: string;
  status: 'LEARNING' | 'REVIEWING' | 'MASTERED';
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
}

export interface ProgressDto {
  dailyActivity: { date: string; minutes: number; questions: number }[];
  heatmap: Record<string, number>;
  scoreHistory: number[];
  vstepScoreHistory: number[];
  skillScores: { skill: string; score: number; max: number }[];
  /** hasData = false: kỹ năng chưa có câu nào (giá trị 0 chỉ để vẽ trục) */
  radar: { label: string; value: number; hasData?: boolean }[];
  totals: {
    minutes: number;
    questions: number;
    attempts: number;
    streak: number;
    longestStreak: number;
    xp: number;
    cardsDue: number;
    mistakesOpen: number;
    wordsMastered: number;
    bestToeic: number | null;
    latestToeic: number | null;
    todayMinutes: number;
    dailyGoalMinutes: number;
  };
}
export interface LeaderboardDto {
  period: 'week' | 'month' | 'all';
  entries: (LeaderboardEntry & { isMe?: boolean; avatarUrl?: string })[];
  myRank: number | null;
}

export type ClassRoomDto = ClassRoom & { room?: string; level?: string; description?: string; teacherAvatarUrl?: string; teacherEmail?: string };
export type AssignmentDto = Assignment & { className?: string; note?: string; maxScore?: number };
export interface ClassDetailDto {
  class: ClassRoomDto;
  announcements: ClassAnnouncement[];
  materials: (Material & { fileUrl?: string; description?: string })[];
  assignments: AssignmentDto[];
  myAssignments: Record<string, MyAssignmentState>;
  upcomingSessions: { id: string; classId: string; date: string; start: string; end: string; room: string; topic: string; status: string }[];
  /** Điểm danh của tôi ở các buổi đã dạy */
  attendance: { sessionId: string; date: string; start: string; topic: string; mark: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'; note?: string }[];
}
export interface MyAssignmentsDto {
  assignments: AssignmentDto[];
  states: Record<string, MyAssignmentState>;
}

export interface BookmarkDto {
  id: string;
  targetType: 'QUESTION' | 'LESSON' | 'WORD' | 'GRAMMAR_TOPIC' | 'POST' | 'TEST';
  targetId: string;
  note?: string;
  createdAt: string;
  title: string;
  subtitle?: string;
  link?: string;
}
export interface BillingDto {
  plan: 'FREE' | 'VIP';
  subscription?: { id: string; planCode: string; planName: string; startsAt?: string; endsAt?: string; status: string } | null;
  transactions: { id: string; orderCode: string; planId: string; planName: string; amount: number; discount: number; method: string; status: string; createdAt: string; paidAt?: string }[];
}
export interface DictationResult {
  attemptId: string;
  accuracy: number;
  matched: number;
  total: number;
  diff: { word: string; status: 'ok' | 'wrong' | 'missing' | 'extra'; expected?: string }[];
  reference: string;
}
export interface DictationPassage {
  id: string;
  title: string;
  level?: string | null;
  transcript: string;
  segments?: { text: string; startMs?: number; endMs?: number }[];
  audioUrl?: string | null;
  [k: string]: unknown;
}

// ---------- Khoá truy vấn ----------
const K = {
  goal: ['learner', 'goal'] as QueryKey,
  path: ['learner', 'path'] as QueryKey,
  attempt: (id: string) => ['learner', 'attempt', id] as QueryKey,
  attempts: ['learner', 'attempts'] as QueryKey,
  mistakes: ['learner', 'mistakes'] as QueryKey,
  review: ['learner', 'review'] as QueryKey,
  progress: ['learner', 'progress'] as QueryKey,
  achievements: ['learner', 'achievements'] as QueryKey,
  leaderboard: (p: string) => ['learner', 'leaderboard', p] as QueryKey,
  classes: ['learner', 'classes'] as QueryKey,
  classDetail: (id: string) => ['learner', 'classes', id] as QueryKey,
  assignments: ['learner', 'assignments'] as QueryKey,
  notifications: ['learner', 'notifications'] as QueryKey,
  bookmarks: ['learner', 'bookmarks'] as QueryKey,
  billing: ['learner', 'billing'] as QueryKey,
  vocabTopics: ['learner', 'vocab', 'topics'] as QueryKey,
  vocabWords: (t: string) => ['learner', 'vocab', 'words', t] as QueryKey,
  myWords: ['learner', 'vocab', 'mine'] as QueryKey,
};

/** Chỉ gọi API cá nhân khi đã đăng nhập */
const useAuthed = () => !!useAuthStore((s) => s.user && s.token);

// ---------- Mục tiêu & lộ trình ----------
export const useGoal = () => useQuery({ queryKey: K.goal, queryFn: () => api.get<Goal | null>('/learner/goal'), enabled: useAuthed() });
export const usePath = () => useQuery({ queryKey: K.path, queryFn: () => api.get<LearningPathDto | null>('/learner/path'), enabled: useAuthed() });
export function useSaveGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (g: GoalInput) => api.put<{ goal: Goal; path: LearningPathDto | null }>('/learner/goal', g),
    onSuccess: (r) => {
      qc.setQueryData(K.goal, r.goal);
      qc.setQueryData(K.path, r.path);
    },
  });
}
export function useCompletePathItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.post<LearningPathDto>(`/learner/path/items/${itemId}/complete`),
    onSuccess: (p) => qc.setQueryData(K.path, p),
  });
}

// ---------- Làm bài ----------
export const startAttempt = (body: StartAttemptInput) => api.post<AttemptPayload>('/learner/attempts', body);
export const saveAnswers = (id: string, answers: SaveAnswerItem[], timeSpentSec?: number) => api.put<{ savedAt: string }>(`/learner/attempts/${id}/answers`, { answers, timeSpentSec });
export const submitAttempt = (id: string, answers: SaveAnswerItem[], timeSpentSec?: number) =>
  api.post<AttemptPayload>(`/learner/attempts/${id}/submit`, { answers, timeSpentSec });

export const useAttempt = (id?: string) => useQuery({ queryKey: K.attempt(id ?? ''), queryFn: () => api.get<AttemptPayload>(`/learner/attempts/${id}`), enabled: !!id && useAuthed(), staleTime: 0 });
export function useStartAttempt() {
  return useMutation({ mutationFn: startAttempt });
}
export function useSaveAnswers(id?: string) {
  return useMutation({ mutationFn: (v: { answers: SaveAnswerItem[]; timeSpentSec?: number }) => saveAnswers(id!, v.answers, v.timeSpentSec) });
}
export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; answers: SaveAnswerItem[]; timeSpentSec?: number }) => submitAttempt(v.id, v.answers, v.timeSpentSec),
    onSuccess: (r) => {
      qc.setQueryData(K.attempt(r.attempt.id), r);
      ['attempts', 'mistakes', 'review', 'progress', 'achievements', 'path', 'assignments', 'leaderboard'].forEach((k) => qc.invalidateQueries({ queryKey: ['learner', k] }));
    },
  });
}
export const useAttempts = (params: { examType?: ExamType; testId?: string; mode?: string; pageSize?: number } = {}, enabled = true) => {
  const authed = useAuthed();
  return useQuery({ queryKey: [...K.attempts, params], queryFn: () => api.get<Paged<AttemptSummary>>('/learner/attempts', { pageSize: 50, ...params }), enabled: authed && enabled });
};

// ---------- Lỗi sai ----------
export const useMistakes = (params: { cause?: MistakeCause; part?: string; resolved?: boolean } = {}) =>
  useQuery({
    queryKey: [...K.mistakes, params],
    queryFn: () => api.get<Paged<MistakeDto> | MistakeDto[]>('/learner/mistakes', { pageSize: 200, ...params }).then((r) => (Array.isArray(r) ? r : r.items)),
    enabled: useAuthed(),
  });
export function useUpdateMistake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; note?: string; cause?: MistakeCause; isResolved?: boolean }) => api.patch<MistakeDto>(`/learner/mistakes/${v.id}`, { note: v.note, cause: v.cause, isResolved: v.isResolved }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: K.mistakes });
      qc.invalidateQueries({ queryKey: K.review });
    },
  });
}
export function useDeleteMistake() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.delete(`/learner/mistakes/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: K.mistakes }) });
}

// ---------- Ôn tập SM-2 ----------
export const useReviewDue = () => useQuery({ queryKey: K.review, queryFn: () => api.get<ReviewDue>('/learner/review/due', { limit: 100 }), enabled: useAuthed() });
export function useReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { cardId?: string; wordId?: string; mistakeId?: string; quality: number; responseMs?: number }) => api.post<ReviewResult>('/learner/review', v),
    onSuccess: () => {
      ['progress', 'mistakes', 'vocab'].forEach((k) => qc.invalidateQueries({ queryKey: ['learner', k] }));
    },
  });
}

// ---------- Từ vựng ----------
export const useVocabTopics = () => useQuery({ queryKey: K.vocabTopics, queryFn: () => api.get<VocabTopic[]>('/learner/vocab/topics') , enabled: useAuthed() });
export const useVocabWords = (topic?: string) =>
  useQuery({
    queryKey: K.vocabWords(topic ?? ''),
    queryFn: () => api.get<{ topic: { id: string; slug: string; name: string; icon: string; total: number }; words: VocabWordDto[] }>(`/learner/vocab/topics/${topic}/words`),
    enabled: !!topic && useAuthed(),
  });
export const useMyWords = () => useQuery({ queryKey: K.myWords, queryFn: () => api.get<VocabWordDto[]>('/learner/vocab/my-words'), enabled: useAuthed() });
export function useLearnWords() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { wordIds?: string[]; topicId?: string }) => api.post<{ added: number }>('/learner/vocab/learn', v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learner', 'vocab'] });
      qc.invalidateQueries({ queryKey: K.review });
    },
  });
}

// ---------- Tiến độ, thành tích, BXH ----------
export const useProgress = () => useQuery({ queryKey: K.progress, queryFn: () => api.get<ProgressDto>('/learner/progress'), enabled: useAuthed() });
export const useAchievements = () => useQuery({ queryKey: K.achievements, queryFn: () => api.get<Achievement[]>('/learner/achievements'), enabled: useAuthed() });
export const useLeaderboard = (period: 'week' | 'month' | 'all' = 'week') =>
  useQuery({ queryKey: K.leaderboard(period), queryFn: () => api.get<LeaderboardDto>('/learner/leaderboard', { period, limit: 50 }), enabled: useAuthed() });

// ---------- Lớp & bài tập ----------
export const useMyClasses = () => useQuery({ queryKey: K.classes, queryFn: () => api.get<ClassRoomDto[]>('/learner/classes'), enabled: useAuthed() });
export const useClassDetail = (id?: string) => useQuery({ queryKey: K.classDetail(id ?? ''), queryFn: () => api.get<ClassDetailDto>(`/learner/classes/${id}`), enabled: !!id && useAuthed() });
export const useMyAssignments = () => useQuery({ queryKey: K.assignments, queryFn: () => api.get<MyAssignmentsDto>('/learner/assignments'), enabled: useAuthed() });
/** Phúc khảo bài Viết / Nói đã có điểm */
export function useAppealAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; reason: string }) => api.post<{ ticketId: string }>(`/learner/assignments/${v.id}/appeal`, { reason: v.reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: K.assignments });
      qc.invalidateQueries({ queryKey: ['learner', 'classes'] });
    },
  });
}

export function useJoinClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.post<ClassRoomDto>('/learner/classes/join', { code }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: K.classes });
      qc.invalidateQueries({ queryKey: K.assignments });
    },
  });
}
export function useSubmitAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; content?: string; audioUrl?: string }) => api.post<MyAssignmentState>(`/learner/assignments/${v.id}/submit`, { content: v.content, audioUrl: v.audioUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: K.assignments });
      qc.invalidateQueries({ queryKey: K.classes });
    },
  });
}

// ---------- Thông báo ----------
export const useNotifications = () =>
  useQuery({
    queryKey: K.notifications,
    queryFn: () => api.get<Paged<AppNotification> & { unread: number }>('/learner/notifications', { pageSize: 50 }),
    enabled: useAuthed(),
    refetchInterval: 60_000,
  });
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.post(`/learner/notifications/${id}/read`), onSuccess: () => qc.invalidateQueries({ queryKey: K.notifications }) });
}
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => api.post('/learner/notifications/read-all'), onSuccess: () => qc.invalidateQueries({ queryKey: K.notifications }) });
}
export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.delete(`/learner/notifications/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: K.notifications }) });
}

// ---------- Mục đã lưu ----------
export const useBookmarks = () => useQuery({ queryKey: K.bookmarks, queryFn: () => api.get<BookmarkDto[]>('/learner/bookmarks'), enabled: useAuthed() });
export function useAddBookmark() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (v: { targetType: BookmarkDto['targetType']; targetId: string; note?: string }) => api.post<BookmarkDto>('/learner/bookmarks', v), onSuccess: () => qc.invalidateQueries({ queryKey: K.bookmarks }) });
}
export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (idOrTargetId: string) => api.delete(`/learner/bookmarks/${idOrTargetId}`), onSuccess: () => qc.invalidateQueries({ queryKey: K.bookmarks }) });
}

// ---------- Gói ----------
export const useBilling = () => useQuery({ queryKey: K.billing, queryFn: () => api.get<BillingDto>('/learner/billing'), enabled: useAuthed() });
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { planCode: string; method: 'MOMO' | 'VNPAY' | 'CARD' | 'BANK'; couponCode?: string }) => api.post<{ orderCode: string; amount: number; status: string }>('/learner/billing/orders', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: K.billing }),
  });
}

// ---------- Luyện tập ----------
export const usePracticeOverview = () =>
  useQuery({ queryKey: ['learner', 'practice-overview'], queryFn: () => api.get<{ byPart: Record<string, number>; total: number }>('/learner/practice/overview'), enabled: useAuthed() });

// ---------- Chép chính tả ----------
export const submitDictation = (body: { passageId: string; typedText: string; segmentIndex?: number; replays?: number; timeSpentSec?: number; assignmentId?: string }) => api.post<DictationResult>('/learner/dictation', body);

// ---------- Nội dung dùng cho trang học viên (catalog) ----------
export const useTests = (params: { examType?: ExamType; kind?: string } = {}) =>
  useQuery({ queryKey: ['catalog', 'tests', params], queryFn: () => api.get<MockTestSummary[]>('/catalog/tests', params) });
export const useTest = (idOrSlug?: string) =>
  useQuery({ queryKey: ['catalog', 'test', idOrSlug], queryFn: () => api.get<MockTestSummary & { kind?: string; sections?: { id: string; name: string; questions: number }[] }>(`/catalog/tests/${idOrSlug}`), enabled: !!idOrSlug });
export const usePartsInfo = (examType: ExamType = 'TOEIC') =>
  useQuery({ queryKey: ['catalog', 'parts-info', examType], queryFn: () => api.get<TestPartInfo[]>('/catalog/tests/parts-info', { examType }), staleTime: Infinity });
export const useGrammarTopics = () => useQuery({ queryKey: ['catalog', 'grammar'], queryFn: () => api.get<GrammarTopic[]>('/catalog/grammar') });
export const usePracticeTasks = (kind: 'writing' | 'speaking', params: { examType?: ExamType; part?: string; limit?: number } = {}) =>
  useQuery({ queryKey: ['catalog', 'practice', kind, params], queryFn: () => api.get<ApiQuestion[]>(`/catalog/practice/${kind}`, params) });
export const useDictationList = () => useQuery({ queryKey: ['catalog', 'dictation'], queryFn: () => api.get<DictationPassage[]>('/catalog/practice/dictation') });
export const useDictationPassage = (id?: string) =>
  useQuery({ queryKey: ['catalog', 'dictation', id], queryFn: () => api.get<DictationPassage>(`/catalog/practice/dictation/${id}`), enabled: !!id });

// ---------- Phiên đăng nhập (dùng chung mọi vai trò) ----------
export interface LoginSession {
  id: string;
  device: string;
  ip?: string;
  lastActiveAt: string;
  current: boolean;
}
export const useSessions = () => {
  const uid = useAuthStore((st) => st.user?.id);
  return useQuery({ queryKey: ['learner', 'sessions', uid], enabled: !!uid, queryFn: () => api.post<LoginSession[]>('/learner/sessions', { refreshToken: tokenStore.get()?.refreshToken }) });
};
export const useRevokeSession = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.delete<{ ok: true }>(`/learner/sessions/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['learner', 'sessions'] }) });
};

// ---------- Ảnh đại diện ----------
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** Tải ảnh đại diện (≤ 2 MB) → backend lưu file, ghi media_files, cập nhật users.avatar_url; trả url mới */
export async function uploadAvatar(file: File): Promise<string> {
  if (!AVATAR_TYPES.includes(file.type)) throw new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP');
  if (file.size > 2 * 1024 * 1024) throw new Error('Ảnh tối đa 2 MB');
  const res = await http.post<{ data: { url: string } }>('/learner/uploads/avatar', file, { headers: { 'Content-Type': file.type } });
  return res.data.data.url;
}
