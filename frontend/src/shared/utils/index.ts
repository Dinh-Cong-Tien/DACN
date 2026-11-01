import type { AssignmentTarget, ExamSetup } from '@/shared/types';

export function cn(...classes: Array<string | false | null | undefined | 0>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function formatCurrency(n: number): string {
  if (n === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('vi-VN', opts).format(d);
}

export function formatDateTime(iso: string): string {
  return formatDate(iso, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return formatDate(iso);
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function getCorrectKey(q: { correctAnswer: { key: string } | string | string[] }): string {
  const c = q.correctAnswer;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c[0] ?? '';
  return c.key;
}

export const ROLE_LABEL: Record<string, string> = {
  GUEST: 'Khách',
  STUDENT: 'Học viên',
  TEACHER: 'Giáo viên',
  HEAD_TEACHER: 'Trưởng bộ môn',
  ADMIN: 'Quản trị viên',
};

export const ROLE_HOME: Record<string, string> = {
  STUDENT: '/',
  TEACHER: '/teacher/dashboard',
  HEAD_TEACHER: '/head/dashboard',
  ADMIN: '/admin/dashboard',
  GUEST: '/',
};

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** ExamSetup → query phòng thi: ?parts=PART_1,PART_5&time=20 (time=none: không giới hạn). Full test không cần query */
export function examSetupQuery(s: ExamSetup): string {
  return s.mode === 'FULL' ? '' : `?parts=${s.parts.join(',')}&time=${s.minutes ?? 'none'}`;
}

/** Link học viên bấm để làm bài được giao: phòng thi (đúng Part + thời gian giáo viên đặt), bài giảng, đề Viết / Nói */
export function assignmentHref(t: AssignmentTarget): string {
  switch (t.kind) {
    case 'EXAM':
      return `/app/exam/${t.testId}${examSetupQuery(t.setup)}`;
    case 'LESSON':
      return `/app/courses/${t.courseId}/lessons/${t.lessonIds[0]}`;
    case 'GRAMMAR':
      return `/app/grammar/${t.slug}`;
    case 'VOCAB':
      return `/app/vocabulary/flashcards/${t.topicId}`;
    case 'WRITING':
      return `/app/writing?task=${t.taskId}`;
    case 'SPEAKING':
      return `/app/speaking?part=${t.partId}`;
  }
}

/** Đọc lại ExamSetup từ query; không có Part hợp lệ = full test */
export function parseExamSetup(search: string, allParts: string[], fullMinutes: number): ExamSetup {
  const q = new URLSearchParams(search);
  const parts = (q.get('parts') ?? '').split(',').filter((p) => allParts.includes(p));
  if (!parts.length) return { mode: 'FULL', parts: allParts, minutes: fullMinutes };
  const t = q.get('time');
  return { mode: 'PRACTICE', parts, minutes: t === 'none' ? null : Math.max(1, Number(t) || fullMinutes) };
}
