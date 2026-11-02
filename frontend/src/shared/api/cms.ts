/**
 * Nội dung biên tập của website: blog, giới thiệu kỳ thi, FAQ, bảng giá, cảm nhận, tài nguyên,
 * bảng quy đổi điểm, số liệu trang chủ, chat hỗ trợ. Backend: /api/v1/cms.
 */
import { useQuery } from '@tanstack/react-query';
import type { BlogPost, ChatLink, ExamType, FaqItem, LeaderboardEntry, PricingPlan, ResourceDoc, ScoreRow, SupportReply, Testimonial } from '@/shared/types';
import { api } from './client';

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };
export type PostDetail = BlogPost & { related?: BlogPost[] };
export type PostCategory = { slug: string; name: string; count: number };
export type HomeStat = { key: string; label: string; value: number; suffix: string };
export type Entitlement = { limit?: number | null; period?: 'DAY' | 'WEEK' | 'MONTH' | string; exam?: ExamType };
export type PlanDto = PricingPlan & { code?: string; entitlements?: Record<string, Entitlement> };
export type ResourceDto = ResourceDoc & { updatedAt?: string; fileUrl?: string; isVip?: boolean };
/** Số liệu thật dùng chung cho trang công khai (GET /cms/overview) */
export type Overview = {
  students: number; teachers: number; questions: number; tests: number; lessons: number; courses: number; words: number; passages: number;
  rating: { avg: number; count: number } | null;
  topStreak: { name: string; days: number } | null;
  studentAvatars: string[];
  contentUpdatedAt: string | null;
};
export type TeamMember = { id: string; name: string; avatarUrl?: string; role: string; department?: string; bio?: string; classes: number; students: number };
export type PublicRubric = { code: string; name: string; scaleMax: number; criteria: { key: string; label: string; description?: string; weight: number }[] };
export type SupportSendResult = { ticketId: string; reply: SupportReply | null; matched: boolean };
export type PublicLeaderboard = { period: 'week' | 'month'; from: string; to: string; entries: LeaderboardEntry[] };
export type SupportHistoryMessage = { id: string; from: 'USER' | 'STAFF' | 'BOT' | 'SYSTEM'; text: string; at: string; links?: ChatLink[] };

export const cmsKeys = {
  posts: (p?: object) => ['cms', 'posts', p ?? {}] as const,
  post: (slug: string) => ['cms', 'post', slug] as const,
  categories: ['cms', 'post-categories'] as const,
  guides: (exam: ExamType) => ['cms', 'guides', exam] as const,
  faqs: (category?: string) => ['cms', 'faqs', category ?? ''] as const,
  plans: ['cms', 'plans'] as const,
  testimonials: (exam?: string) => ['cms', 'testimonials', exam ?? ''] as const,
  resources: ['cms', 'resources'] as const,
  scoreTable: ['cms', 'score-table'] as const,
  scoreConversion: (exam: ExamType) => ['cms', 'score-conversion', exam] as const,
  homeStats: ['cms', 'home-stats'] as const,
  supportReplies: ['cms', 'support-replies'] as const,
  leaderboard: (p: object) => ['cms', 'leaderboard', p] as const,
  overview: ['cms', 'overview'] as const,
  team: ['cms', 'team'] as const,
  rubric: (code: string) => ['cms', 'rubric', code] as const,
};

export const cmsApi = {
  posts: (p?: { category?: string; kind?: string; tag?: string; q?: string; page?: number; pageSize?: number }) => api.get<Paged<BlogPost>>('/cms/posts', p),
  post: (slug: string) => api.get<PostDetail>(`/cms/posts/${slug}`),
  categories: () => api.get<PostCategory[]>('/cms/posts/categories'),
  guides: (exam: ExamType) => api.get<BlogPost[]>(`/cms/exam-guides/${exam}`),
  faqs: (category?: string) => api.get<FaqItem[]>('/cms/faqs', category ? { category } : undefined),
  plans: () => api.get<PlanDto[]>('/cms/plans'),
  testimonials: (exam?: string) => api.get<Testimonial[]>('/cms/testimonials', exam ? { exam } : undefined),
  resources: () => api.get<ResourceDto[]>('/cms/resources'),
  overview: () => api.get<Overview>('/cms/overview'),
  team: () => api.get<TeamMember[]>('/cms/team'),
  rubric: (code: string) => api.get<PublicRubric>(`/cms/rubrics/${code}`),
  contact: (body: { name: string; email: string; topic: string; message: string; subject?: string }) => api.post<{ ticketId: string }>('/cms/contact', body),
  newsletter: (email: string) => api.post<{ subscribed: boolean; already: boolean }>('/cms/newsletter', { email }),
  download: (id: string) => api.post<{ fileUrl: string | null; downloads: number }>(`/cms/resources/${id}/download`),
  scoreTable: () => api.get<ScoreRow[]>('/cms/score-table'),
  scoreConversion: (exam: ExamType) => api.get<Record<string, Record<string, number>>>(`/cms/score-conversion/${exam}`),
  homeStats: () => api.get<HomeStat[]>('/cms/home-stats'),
  supportReplies: () => api.get<SupportReply[]>('/cms/support/replies'),
  leaderboard: (p: { period: 'week' | 'month'; exam: 'ALL' | 'TOEIC' | 'VSTEP'; limit?: number }) => api.get<PublicLeaderboard>('/cms/leaderboard', p),
  supportSend: (body: { ticketId?: string; text: string; name?: string; email?: string; phone?: string }) => api.post<SupportSendResult>('/cms/support/messages', body),
  supportMessages: (ticketId: string) => api.get<SupportHistoryMessage[]>(`/cms/support/tickets/${ticketId}/messages`),
};

const LONG = 10 * 60_000;
export const usePosts = (p?: { category?: string; kind?: string; tag?: string; q?: string; page?: number; pageSize?: number }) => useQuery({ queryKey: cmsKeys.posts(p), queryFn: () => cmsApi.posts(p) });
export const usePost = (slug?: string) => useQuery({ queryKey: cmsKeys.post(slug ?? ''), queryFn: () => cmsApi.post(slug!), enabled: !!slug });
export const usePostCategories = () => useQuery({ queryKey: cmsKeys.categories, queryFn: cmsApi.categories, staleTime: LONG });
export const useExamGuides = (exam: ExamType) => useQuery({ queryKey: cmsKeys.guides(exam), queryFn: () => cmsApi.guides(exam), staleTime: LONG });
export const useFaqs = (category?: string) => useQuery({ queryKey: cmsKeys.faqs(category), queryFn: () => cmsApi.faqs(category), staleTime: LONG });
export const usePlans = () => useQuery({ queryKey: cmsKeys.plans, queryFn: cmsApi.plans, staleTime: LONG });
export const useTestimonials = (exam?: string) => useQuery({ queryKey: cmsKeys.testimonials(exam), queryFn: () => cmsApi.testimonials(exam), staleTime: LONG });
export const useResources = () => useQuery({ queryKey: cmsKeys.resources, queryFn: cmsApi.resources });
export const useScoreTable = () => useQuery({ queryKey: cmsKeys.scoreTable, queryFn: cmsApi.scoreTable, staleTime: Infinity });
export const useScoreConversion = (exam: ExamType) => useQuery({ queryKey: cmsKeys.scoreConversion(exam), queryFn: () => cmsApi.scoreConversion(exam), staleTime: Infinity });
export const useHomeStats = () => useQuery({ queryKey: cmsKeys.homeStats, queryFn: cmsApi.homeStats, staleTime: LONG });
/** Bảng vinh danh công khai (không cần đăng nhập) */
export const usePublicLeaderboard = (p: { period: 'week' | 'month'; exam: 'ALL' | 'TOEIC' | 'VSTEP'; limit?: number }) =>
  useQuery({ queryKey: cmsKeys.leaderboard(p), queryFn: () => cmsApi.leaderboard(p) });
export const useSupportReplies = () => useQuery({ queryKey: cmsKeys.supportReplies, queryFn: cmsApi.supportReplies, staleTime: Infinity });
export const useOverview = () => useQuery({ queryKey: cmsKeys.overview, queryFn: cmsApi.overview, staleTime: LONG });
export const useTeam = () => useQuery({ queryKey: cmsKeys.team, queryFn: cmsApi.team, staleTime: LONG });
export const useRubric = (code: string) => useQuery({ queryKey: cmsKeys.rubric(code), queryFn: () => cmsApi.rubric(code), staleTime: Infinity });
/** Hạn mức của một gói theo mã quyền (MOCK_TEST, DICTIONARY…) → chuỗi hiển thị; undefined nếu gói không có quyền đó */
export const limitText = (e: Entitlement | undefined, unit: string) => {
  if (!e) return undefined;
  if (e.limit === null || e.limit === undefined) return 'Không giới hạn';
  if (e.limit === 0) return undefined;
  const per = e.period === 'DAY' ? ' / ngày' : e.period === 'WEEK' ? ' / tuần' : e.period === 'MONTH' ? ' / tháng' : '';
  return `${e.limit} ${unit}${per}`;
};
