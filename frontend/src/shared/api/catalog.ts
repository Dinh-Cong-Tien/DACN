/**
 * Nội dung học công khai: khoá học, bài học, đề thi, luyện tập, từ vựng, tra từ, ngữ pháp.
 * Backend: /api/v1/catalog (optionalAuth → có đăng nhập thì kèm tiến độ cá nhân).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IMockTest, IQuestion } from '@toeic-vstep/shared';
import type { Course, DictionaryEntry, GrammarTopic, Lesson, MockTestSummary, TestPartInfo, VocabTopic, VocabWord } from '@/shared/types';
import { useAuthStore } from '@/shared/stores/authStore';
import { api } from './client';

/** Bài học chi tiết (GET /lessons/:id) */
export type LessonDetail = Lesson & {
  courseId: string;
  courseSlug: string;
  courseTitle?: string;
  prevLessonId?: string | null;
  nextLessonId?: string | null;
  lastPositionSec?: number;
  audioUrl?: string;
  quizTestId?: string;
  passScorePct?: number;
};
export type CourseDetail = Course & { currentLessonId?: string | null; enrolled?: boolean };
export type TestDetail = MockTestSummary & { kind?: string; partCounts?: { partId: string; title?: string; count: number }[] };
export type TestPaper = IMockTest & { questions: (IQuestion & { questionNo?: number })[] };
export type PracticeQuestion = IQuestion & { taskConfig?: Record<string, unknown>; rubric?: unknown; sampleAnswer?: string };
export type PracticeCheck = { questionId: string; isCorrect: boolean; correctAnswer: unknown; explanation?: string | null; translationVi?: string | null };
export type DictationItem = { id: string; title: string | null; level?: string | null; transcript?: string; segments?: { text: string; startMs?: number; endMs?: number }[] };
export type GrammarDetail = GrammarTopic & { questionsCount?: number };
/** Mô tả một phần thi + số câu luyện tập có trong ngân hàng */
export type PartInfo = TestPartInfo & { bankCount?: number };
export type PracticeSetQuery = { part?: string; skill?: string; tag?: string; examType?: string; limit?: number };
export type LessonProgressBody = { action: 'start' | 'position' | 'complete'; positionSec?: number; timeSpentSec?: number; scorePct?: number };

/** Khoá query đổi theo người dùng để dữ liệu cá nhân (tiến độ, khoá bài) không lẫn giữa các tài khoản */
const useUid = () => useAuthStore((s) => s.user?.id ?? 'guest');

export const catalogKeys = {
  courses: (uid: string, p?: object) => ['catalog', 'courses', uid, p ?? {}] as const,
  course: (uid: string, id: string) => ['catalog', 'course', uid, id] as const,
  lesson: (uid: string, id: string) => ['catalog', 'lesson', uid, id] as const,
  tests: (p?: object) => ['catalog', 'tests', p ?? {}] as const,
  test: (id: string) => ['catalog', 'test', id] as const,
  paper: (id: string, parts?: string) => ['catalog', 'paper', id, parts ?? ''] as const,
  partsInfo: (examType: string) => ['catalog', 'parts-info', examType] as const,
  practice: (p: object) => ['catalog', 'practice', p] as const,
  vocabTopics: (uid: string, p?: object) => ['catalog', 'vocab-topics', uid, p ?? {}] as const,
  vocabTopic: (uid: string, id: string) => ['catalog', 'vocab-topic', uid, id] as const,
  dictionary: (q: string) => ['catalog', 'dictionary', q] as const,
  grammar: (uid: string) => ['catalog', 'grammar', uid] as const,
  grammarTopic: (uid: string, slug: string) => ['catalog', 'grammar-topic', uid, slug] as const,
};

export const catalogApi = {
  courses: (p?: { category?: string; examType?: string }) => api.get<Course[]>('/catalog/courses', p),
  course: (idOrSlug: string) => api.get<CourseDetail>(`/catalog/courses/${idOrSlug}`),
  lesson: (id: string) => api.get<LessonDetail>(`/catalog/lessons/${id}`),
  lessonProgress: (id: string, body: LessonProgressBody) => api.post<unknown>(`/catalog/lessons/${id}/progress`, body),
  tests: (p?: { examType?: string; kind?: string; year?: number; q?: string }) => api.get<MockTestSummary[]>('/catalog/tests', p),
  test: (idOrSlug: string) => api.get<TestDetail>(`/catalog/tests/${idOrSlug}`),
  paper: (idOrSlug: string, parts?: string[]) => api.get<TestPaper>(`/catalog/tests/${idOrSlug}/paper`, parts?.length ? { parts: parts.join(',') } : undefined),
  partsInfo: (examType: 'TOEIC' | 'VSTEP') => api.get<PartInfo[]>('/catalog/tests/parts-info', { examType }),
  practice: (p: { part?: string; skill?: string; tag?: string; examType?: string; limit?: number }) => api.get<PracticeQuestion[]>('/catalog/practice/questions', p),
  check: (answers: { questionId: string; answer: unknown }[]) => api.post<PracticeCheck[]>('/catalog/practice/check', { answers }),
  writing: (p?: { examType?: string; part?: string; limit?: number }) => api.get<PracticeQuestion[]>('/catalog/practice/writing', p),
  speaking: (p?: { examType?: string; part?: string; limit?: number }) => api.get<PracticeQuestion[]>('/catalog/practice/speaking', p),
  dictationList: () => api.get<DictationItem[]>('/catalog/practice/dictation'),
  dictation: (id: string) => api.get<DictationItem>(`/catalog/practice/dictation/${id}`),
  vocabTopics: (p?: { examType?: string }) => api.get<VocabTopic[]>('/catalog/vocabulary/topics', p),
  vocabTopic: (idOrSlug: string) => api.get<{ topic: VocabTopic; words: VocabWord[] }>(`/catalog/vocabulary/topics/${idOrSlug}`),
  dictionary: (q: string, limit = 8) => api.get<DictionaryEntry[]>('/catalog/dictionary', { q, limit }),
  grammar: () => api.get<GrammarTopic[]>('/catalog/grammar'),
  grammarTopic: (slug: string) => api.get<GrammarDetail>(`/catalog/grammar/${slug}`),
  grammarQuestions: (slug: string, limit = 10) => api.get<PracticeQuestion[]>(`/catalog/grammar/${slug}/questions`, { limit }),
};

// ---------- Hooks ----------
export const useCourses = (p?: { category?: string; examType?: string }) => {
  const uid = useUid();
  return useQuery({ queryKey: catalogKeys.courses(uid, p), queryFn: () => catalogApi.courses(p) });
};
export const useCourse = (idOrSlug?: string) => {
  const uid = useUid();
  return useQuery({ queryKey: catalogKeys.course(uid, idOrSlug ?? ''), queryFn: () => catalogApi.course(idOrSlug!), enabled: !!idOrSlug });
};
export const useLesson = (id?: string) => {
  const uid = useUid();
  return useQuery({ queryKey: catalogKeys.lesson(uid, id ?? ''), queryFn: () => catalogApi.lesson(id!), enabled: !!id });
};
/** Ghi tiến độ bài học; xong thì làm mới khoá học/bài học để mở khoá bài kế tiếp */
export const useLessonProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, ...body }: LessonProgressBody & { lessonId: string }) => catalogApi.lessonProgress(lessonId, body),
    onSuccess: (_d, v) => {
      if (v.action === 'complete') {
        qc.invalidateQueries({ queryKey: ['catalog', 'courses'] });
        qc.invalidateQueries({ queryKey: ['catalog', 'course'] });
        qc.invalidateQueries({ queryKey: ['catalog', 'lesson'] });
      }
    },
  });
};
export const useTests = (p?: { examType?: string; kind?: string; year?: number; q?: string }) => useQuery({ queryKey: catalogKeys.tests(p), queryFn: () => catalogApi.tests(p) });
export const useTest = (idOrSlug?: string) => useQuery({ queryKey: catalogKeys.test(idOrSlug ?? ''), queryFn: () => catalogApi.test(idOrSlug!), enabled: !!idOrSlug });
export const useTestPaper = (idOrSlug?: string, parts?: string[]) =>
  useQuery({ queryKey: catalogKeys.paper(idOrSlug ?? '', parts?.join(',')), queryFn: () => catalogApi.paper(idOrSlug!, parts), enabled: !!idOrSlug, staleTime: 30 * 60_000 });
export const usePartsInfo = (examType: 'TOEIC' | 'VSTEP') => useQuery({ queryKey: catalogKeys.partsInfo(examType), queryFn: () => catalogApi.partsInfo(examType), staleTime: Infinity });
export const usePracticeQuestions = (p: { part?: string; skill?: string; tag?: string; examType?: string; limit?: number }, enabled = true) =>
  useQuery({ queryKey: catalogKeys.practice(p), queryFn: () => catalogApi.practice(p), enabled, staleTime: Infinity, refetchOnWindowFocus: false });
export const useVocabTopics = (p?: { examType?: string }) => {
  const uid = useUid();
  return useQuery({ queryKey: catalogKeys.vocabTopics(uid, p), queryFn: () => catalogApi.vocabTopics(p) });
};
export const useVocabTopic = (idOrSlug?: string) => {
  const uid = useUid();
  return useQuery({ queryKey: catalogKeys.vocabTopic(uid, idOrSlug ?? ''), queryFn: () => catalogApi.vocabTopic(idOrSlug!), enabled: !!idOrSlug });
};
export const useDictionary = (q: string) => useQuery({ queryKey: catalogKeys.dictionary(q), queryFn: () => catalogApi.dictionary(q), enabled: q.trim().length > 0, staleTime: Infinity });
export const useGrammarTopics = () => {
  const uid = useUid();
  return useQuery({ queryKey: catalogKeys.grammar(uid), queryFn: catalogApi.grammar });
};
export const useGrammarTopic = (slug?: string) => {
  const uid = useUid();
  return useQuery({ queryKey: catalogKeys.grammarTopic(uid, slug ?? ''), queryFn: () => catalogApi.grammarTopic(slug!), enabled: !!slug });
};

/**
 * Gắn đáp án + lời giải vào bộ câu luyện tập (chế độ luyện tập hiện giải thích ngay sau mỗi câu,
 * PracticeEngine tự chấm tại chỗ). Đề thi thật không dùng hàm này — đáp án chỉ trả sau khi nộp bài.
 */
export async function revealAnswers<T extends IQuestion>(qs: T[]): Promise<T[]> {
  if (!qs.length) return qs;
  const res = await catalogApi.check(qs.map((q) => ({ questionId: q.id, answer: null })));
  const byId = new Map(res.map((r) => [r.questionId, r]));
  return qs.map((q) => {
    const r = byId.get(q.id);
    return r ? { ...q, correctAnswer: (r.correctAnswer ?? '') as IQuestion['correctAnswer'], explanation: r.explanation ?? null, translationVi: r.translationVi ?? undefined } : q;
  });
}

/** Lấy nhiều nhóm câu luyện tập (mỗi nhóm một Part/kỹ năng), gộp lại và kèm đáp án để luyện ngay */
export const usePracticeSet = (sets: PracticeSetQuery[], enabled = true) =>
  useQuery({
    queryKey: ['catalog', 'practice-set', sets] as const,
    queryFn: async () => revealAnswers((await Promise.all(sets.map((q) => catalogApi.practice(q)))).flat()),
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

/** Link tới trang lộ trình của một khoá học */
export const courseHref = (c: Pick<Course, 'slug'>) => `/courses/${c.slug}`;
