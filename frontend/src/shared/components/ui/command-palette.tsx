import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, PlayCircle, BookOpen, Compass, AlertTriangle, Trophy, Settings, LayoutDashboard, CornerDownLeft, ArrowUp, ArrowDown, Users, ClipboardList, PenTool, Sparkles, CalendarDays, ClipboardCheck, Sheet, BarChart3, FolderOpen, X, History, SearchX, Loader2, ChevronRight } from 'lucide-react';
import { useUiStore } from '@/shared/stores/uiStore';
import { useAuthStore } from '@/shared/stores/authStore';
import { api } from '@/shared/api/client';
import { catalogApi, courseHref } from '@/shared/api/catalog';
import { headApi } from '@/shared/api/head';
import { adminApi } from '@/shared/api/admin';
import type { AppRole, Assignment, ClassRoom, ClassStudent, Course, DeptStudent, GrammarTopic, MockTestSummary, SupportTicket, TeacherSummary } from '@/shared/types';

/** Dữ liệu tìm kiếm theo vai trò, chỉ tải khi mở ô tìm kiếm */
interface PaletteData {
  classes: (ClassRoom & { teacherName: string })[];
  students: (ClassStudent | DeptStudent)[];
  assignments: Assignment[];
  tests: MockTestSummary[];
  courses: Course[];
  grammar: GrammarTopic[];
  teachers: TeacherSummary[];
  users: { id: string; fullName: string; email: string }[];
  tickets: SupportTicket[];
}
const EMPTY_DATA: PaletteData = { classes: [], students: [], assignments: [], tests: [], courses: [], grammar: [], teachers: [], users: [], tickets: [] };
const settle = async <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);
async function loadPaletteData(role: AppRole): Promise<PaletteData> {
  if (role === 'TEACHER') {
    const [classes, students, assignments, tests, courses] = await Promise.all([
      settle(api.get<PaletteData['classes']>('/teacher/classes'), []),
      settle(api.get<ClassStudent[]>('/teacher/students'), []),
      settle(api.get<Assignment[]>('/teacher/assignments'), []),
      settle(catalogApi.tests(), []),
      settle(catalogApi.courses(), []),
    ]);
    return { ...EMPTY_DATA, classes, students, assignments, tests, courses };
  }
  if (role === 'HEAD_TEACHER') {
    const [classes, teachers, students] = await Promise.all([settle(headApi.classes(), []), settle(headApi.teachers(), []), settle(headApi.students(), [])]);
    return { ...EMPTY_DATA, classes, teachers, students };
  }
  if (role === 'ADMIN') {
    const [users, classes, tickets, courses] = await Promise.all([
      settle(adminApi.users().then((r) => r.items), []),
      settle(adminApi.classes(), []),
      settle(adminApi.tickets(), []),
      settle(catalogApi.courses(), []),
    ]);
    return { ...EMPTY_DATA, users, classes, tickets, courses };
  }
  const [tests, courses, grammar] = await Promise.all([settle(catalogApi.tests(), []), settle(catalogApi.courses(), []), role === 'STUDENT' ? settle(catalogApi.grammar(), []) : Promise.resolve([])]);
  return { ...EMPTY_DATA, tests, courses, grammar };
}
import { cn } from '@/shared/utils';

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  group: string;
  to: string;
  icon: React.ElementType;
  keywords?: string;
}

const STUDENT: Cmd[] = [
  { id: 'dash', label: 'Trang chủ', group: 'Điều hướng', to: '/', icon: LayoutDashboard },
  { id: 'path', label: 'Lộ trình của tôi', group: 'Điều hướng', to: '/app/learning-path', icon: Compass },
  { id: 'practice', label: 'Luyện tập kỹ năng', group: 'Điều hướng', to: '/app/practice', icon: PlayCircle },
  { id: 'mock', label: 'Đề thi thử TOEIC', group: 'Điều hướng', to: '/app/mock-tests?exam=TOEIC', icon: FileText },
  { id: 'mock-vstep', label: 'Đề thi thử VSTEP', group: 'Điều hướng', to: '/app/mock-tests?exam=VSTEP', icon: FileText },
  { id: 'mistakes', label: 'Sổ tay lỗi sai', group: 'Điều hướng', to: '/app/mistakes', icon: AlertTriangle },
  { id: 'vocab', label: 'Từ vựng & Flashcard', group: 'Điều hướng', to: '/app/vocabulary', icon: BookOpen },
  { id: 'lb', label: 'Bảng vinh danh', group: 'Điều hướng', to: '/app/leaderboard', icon: Trophy },
  { id: 'settings', label: 'Cài đặt', group: 'Điều hướng', to: '/app/settings', icon: Settings },
];
const TEACHER: Cmd[] = [
  { id: 'tdash', label: 'Tổng quan', group: 'Trang', to: '/teacher/dashboard', icon: LayoutDashboard },
  { id: 'classes', label: 'Lớp học của tôi', group: 'Trang', to: '/teacher/classes', icon: Users },
  { id: 'schedule', label: 'Lịch dạy', group: 'Trang', to: '/teacher/schedule', icon: CalendarDays, keywords: 'giao an buoi hoc' },
  { id: 'attendance', label: 'Điểm danh', group: 'Trang', to: '/teacher/attendance', icon: ClipboardCheck, keywords: 'so diem danh vang' },
  { id: 'assign', label: 'Bài tập', group: 'Trang', to: '/teacher/assignments', icon: ClipboardList },
  { id: 'assign-new', label: 'Giao bài mới', group: 'Trang', to: '/teacher/assignments?new=1', icon: ClipboardList },
  { id: 'grading', label: 'Bàn chấm bài', group: 'Trang', to: '/teacher/grading', icon: PenTool },
  { id: 'students', label: 'Hồ sơ học viên', group: 'Trang', to: '/teacher/students', icon: Users },
  { id: 'gradebook', label: 'Bảng điểm', group: 'Trang', to: '/teacher/gradebook', icon: Sheet, keywords: 'diem qua trinh xuat excel' },
  { id: 'analytics', label: 'Thống kê lớp học', group: 'Trang', to: '/teacher/analytics', icon: BarChart3 },
  { id: 'lib-courses', label: 'Khoá học & Lớp', group: 'Trang', to: '/teacher/courses', icon: PlayCircle },
  { id: 'lib-tests', label: 'Ngân hàng đề', group: 'Trang', to: '/teacher/library/tests', icon: FileText },
  { id: 'lib-practice', label: 'Ngữ pháp & Từ vựng', group: 'Trang', to: '/teacher/library/practice', icon: BookOpen },
  { id: 'materials', label: 'Tài liệu lớp', group: 'Trang', to: '/teacher/materials', icon: FolderOpen },
];
const HEAD: Cmd[] = [
  { id: 'hdash', label: 'Tổng quan bộ môn', group: 'Trang', to: '/head/dashboard', icon: LayoutDashboard },
  { id: 'subjects', label: 'Môn học', group: 'Trang', to: '/head/subjects', icon: BookOpen },
  { id: 'teachers', label: 'Giáo viên', group: 'Trang', to: '/head/teachers', icon: Users },
  { id: 'hclasses', label: 'Lớp học bộ môn', group: 'Trang', to: '/head/classes', icon: Users },
  { id: 'hstudents', label: 'Học viên bộ môn', group: 'Trang', to: '/head/students', icon: Users, keywords: 'nguy co canh bao' },
  { id: 'hschedule', label: 'Lịch dạy bộ môn', group: 'Trang', to: '/head/schedule', icon: CalendarDays, keywords: 'trung phong du gio' },
  { id: 'hreview', label: 'Kiểm định chấm bài', group: 'Trang', to: '/head/grading-review', icon: PenTool, keywords: 'cham lai viet noi' },
  { id: 'complaints', label: 'Khiếu nại & phúc khảo', group: 'Trang', to: '/head/complaints', icon: AlertTriangle },
  { id: 'approvals', label: 'Phê duyệt học liệu', group: 'Trang', to: '/head/approvals', icon: ClipboardCheck },
  { id: 'hlib-courses', label: 'Khoá học & bài giảng', group: 'Trang', to: '/head/library/courses', icon: PlayCircle },
  { id: 'hlib-tests', label: 'Ngân hàng đề', group: 'Trang', to: '/head/library/tests', icon: FileText },
  { id: 'hlib-practice', label: 'Ngữ pháp & Từ vựng', group: 'Trang', to: '/head/library/practice', icon: BookOpen },
  { id: 'qbank', label: 'Ngân hàng câu hỏi', group: 'Trang', to: '/head/question-bank', icon: FileText },
  { id: 'reports', label: 'Báo cáo', group: 'Trang', to: '/head/reports', icon: BarChart3 },
];
const ADMIN: Cmd[] = [
  { id: 'adash', label: 'Tổng quan hệ thống', group: 'Trang', to: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Tài khoản & phân quyền', group: 'Trang', to: '/admin/users', icon: Users, keywords: 'nguoi dung khoa tai khoan' },
  { id: 'aclasses', label: 'Lớp học toàn hệ thống', group: 'Trang', to: '/admin/classes', icon: Users, keywords: 'ma moi giao vien' },
  { id: 'asupport', label: 'Hỗ trợ học viên', group: 'Trang', to: '/admin/support', icon: AlertTriangle, keywords: 'ticket chat email hotline' },
  { id: 'acourses', label: 'Khoá học', group: 'Trang', to: '/admin/courses', icon: PlayCircle },
  { id: 'aquestions', label: 'Ngân hàng câu hỏi', group: 'Trang', to: '/admin/questions', icon: ClipboardList },
  { id: 'atests', label: 'Cấu hình đề thi', group: 'Trang', to: '/admin/tests', icon: FileText },
  { id: 'tags', label: 'Nhãn kỹ năng', group: 'Trang', to: '/admin/skill-tags', icon: BookOpen },
  { id: 'agrammar', label: 'Ngữ pháp', group: 'Trang', to: '/admin/learning/grammar', icon: BookOpen },
  { id: 'avocab', label: 'Bộ từ vựng & flashcard', group: 'Trang', to: '/admin/learning/vocab', icon: BookOpen },
  { id: 'awords', label: 'Từ vựng', group: 'Trang', to: '/admin/learning/words', icon: BookOpen },
  { id: 'awriting', label: 'Đề Viết', group: 'Trang', to: '/admin/learning/writing', icon: PenTool },
  { id: 'aspeaking', label: 'Đề Nói', group: 'Trang', to: '/admin/learning/speaking', icon: PenTool },
  { id: 'aresources', label: 'Tài liệu mở', group: 'Trang', to: '/admin/learning/resources', icon: FolderOpen },
  { id: 'afaq', label: 'Câu hỏi thường gặp (FAQ)', group: 'Trang', to: '/admin/learning/faq', icon: FileText },
  { id: 'ablog', label: 'Tin tức (CMS)', group: 'Trang', to: '/admin/blog', icon: FileText },
  { id: 'abilling', label: 'Gói VIP & thanh toán', group: 'Trang', to: '/admin/billing', icon: Sheet, keywords: 'doanh thu giao dich hoan tien' },
  { id: 'abroadcast', label: 'Gửi thông báo', group: 'Trang', to: '/admin/broadcasts', icon: Sparkles },
  { id: 'aanalytics', label: 'Thống kê', group: 'Trang', to: '/admin/analytics', icon: BarChart3 },
  { id: 'system', label: 'Trạng thái dịch vụ', group: 'Trang', to: '/admin/system', icon: Sparkles },
  { id: 'audit', label: 'Nhật ký hệ thống', group: 'Trang', to: '/admin/audit-logs', icon: ClipboardList },
  { id: 'asettings', label: 'Cấu hình tham số', group: 'Trang', to: '/admin/settings', icon: Settings },
];
const GUEST: Cmd[] = [
  { id: 'home', label: 'Trang chủ', group: 'Điều hướng', to: '/', icon: LayoutDashboard },
  { id: 'toeic', label: 'Luyện TOEIC', group: 'Điều hướng', to: '/toeic', icon: Compass },
  { id: 'vstep', label: 'Luyện VSTEP', group: 'Điều hướng', to: '/vstep', icon: Compass },
  { id: 'score', label: 'Quy đổi điểm TOEIC ↔ VSTEP', group: 'Công cụ', to: '/score-converter', icon: Sparkles },
  { id: 'pricing', label: 'Bảng giá', group: 'Điều hướng', to: '/pricing', icon: FileText },
  { id: 'login', label: 'Đăng nhập', group: 'Tài khoản', to: '/auth/login', icon: Settings },
];


/** Nhóm "trang" (lối tắt điều hướng) — xếp sau nội dung khi đang tìm, hiện dạng lối tắt khi ô trống */
const PAGE_GROUPS = new Set(['Điều hướng', 'Trang', 'Công cụ', 'Tài khoản']);
const RECENT_MAX = 6;
const recentKey = (role: string) => `orbi.palette.recent.${role}`;
function readRecent(role: string): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(recentKey(role)) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}
function writeRecent(role: string, list: string[]) {
  try {
    localStorage.setItem(recentKey(role), JSON.stringify(list.slice(0, RECENT_MAX)));
  } catch {
    /* trình duyệt chặn lưu trữ → bỏ qua */
  }
}

/** Bỏ dấu từng ký tự (giữ nguyên độ dài chuỗi để tô đúng đoạn khớp) */
const fold = (s: string) =>
  Array.from(s)
    .map((c) => c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').charAt(0) || c)
    .join('');

/** Điểm khớp: trùng tên > đầu tên > đầu một từ > giữa tên > mô tả / từ khoá */
function score(c: Cmd, n: string): number {
  const label = fold(c.label);
  if (label === n) return 100;
  if (label.startsWith(n)) return 80;
  const i = label.indexOf(n);
  if (i >= 0) return /[\s(·:-]/.test(label[i - 1] ?? '') ? 60 : 45;
  const rest = fold(`${c.hint ?? ''} ${c.keywords ?? ''}`);
  if (rest.includes(n)) return 20;
  const words = n.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => label.includes(w) || rest.includes(w))) return 15;
  return 0;
}

const Highlight: React.FC<{ text: string; q: string }> = ({ text, q }) => {
  const n = fold(q.trim());
  const i = n ? fold(text).indexOf(n) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="rounded-[3px] bg-amber-200/70 text-slate-900">{text.slice(i, i + n.length)}</span>
      {text.slice(i + n.length)}
    </>
  );
};

type EmptyItem = { kind: 'recent'; text: string } | { kind: 'cmd'; cmd: Cmd };

/** Ô tìm kiếm (⌘K) dùng chung mọi vai trò: tìm theo phạm vi, tô đoạn khớp, nhớ từ khoá gần đây */
export const CommandPalette: React.FC = () => {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPalette);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [scope, setScope] = useState('all');
  const [idx, setIdx] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const role = user?.role ?? 'GUEST';

  // Phím tắt toàn cục
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!useUiStore.getState().paletteOpen);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setScope('all');
    setIdx(-1);
    setRecent(readRecent(role));
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open, role]);

  const dataQ = useQuery({ queryKey: ['palette', role, user?.id ?? 'guest'], queryFn: () => loadPaletteData(role), enabled: open, staleTime: 5 * 60_000 });
  const pd = dataQ.data ?? EMPTY_DATA;
  const all = useMemo<Cmd[]>(() => {
    const classList = pd.classes;
    const classStudents = pd.students as ClassStudent[];
    const deptStudents = pd.students as DeptStudent[];
    // Mỗi vai trò chỉ tìm trong phần việc của mình
    if (role === 'TEACHER') {
      const classes: Cmd[] = classList.map((c) => ({ id: `cl-${c.id}`, label: c.name, hint: `${c.examType} · ${c.schedule} · ${c.studentsCount} học viên`, group: 'Lớp học', to: `/teacher/classes/${c.id}`, icon: Users, keywords: c.code }));
      const students: Cmd[] = classStudents.map((s) => ({ id: `st-${s.id}`, label: s.name, hint: `${s.email} · điểm ${s.avgScore}`, group: 'Học viên', to: `/teacher/students?id=${s.id}`, icon: Users }));
      const assignments: Cmd[] = pd.assignments.map((a) => ({ id: `as-${a.id}`, label: a.title, hint: `${a.className} · đã nộp ${a.submitted}/${a.total}`, group: 'Bài tập', to: `/teacher/assignments${a.status === 'DRAFT' ? '?status=DRAFT' : ''}`, icon: ClipboardList }));
      const tests: Cmd[] = pd.tests.map((t) => ({ id: `t-${t.id}`, label: t.title, hint: `${t.examType} · ${t.totalQuestions} câu · ${t.durationMinutes} phút`, group: 'Ngân hàng đề', to: `/teacher/library/tests?tab=${t.examType}`, icon: FileText }));
      const courses: Cmd[] = pd.courses.map((c) => ({ id: `c-${c.id}`, label: c.title, hint: `${c.lessonsCount} bài giảng`, group: 'Khoá học', to: `/teacher/courses?open=${c.id}`, icon: PlayCircle }));
      return [...TEACHER, ...classes, ...students, ...assignments, ...tests, ...courses];
    }
    if (role === 'HEAD_TEACHER') {
      const classes: Cmd[] = classList.map((c) => ({ id: `cl-${c.id}`, label: c.name, hint: `${c.teacherName} · ${c.schedule} · ${c.studentsCount} học viên`, group: 'Lớp học', to: `/head/classes/${c.id}`, icon: Users, keywords: c.code }));
      const teachers: Cmd[] = pd.teachers.map((t) => ({ id: `tc-${t.id}`, label: t.name, hint: `${t.subject} · ${t.email}`, group: 'Giáo viên', to: `/head/teachers/${t.id}`, icon: Users }));
      const students: Cmd[] = deptStudents.map((s) => ({ id: `st-${s.id}`, label: s.name, hint: `${classList.find((c) => c.id === s.classId)?.name ?? ''} · điểm ${s.avgScore}`, group: 'Học viên', to: `/head/students?q=${encodeURIComponent(s.name)}`, icon: Users }));
      return [...HEAD, ...classes, ...teachers, ...students];
    }
    if (role === 'ADMIN') {
      const users: Cmd[] = pd.users.map((u) => ({ id: `u-${u.id}`, label: u.fullName, hint: u.email, group: 'Tài khoản', to: `/admin/users?q=${encodeURIComponent(u.email)}`, icon: Users }));
      const classes: Cmd[] = classList.map((c) => ({ id: `cl-${c.id}`, label: c.name, hint: `${c.teacherName} · mã ${c.code}`, group: 'Lớp học', to: '/admin/classes', icon: Users, keywords: c.code }));
      const tickets: Cmd[] = pd.tickets.map((t) => ({ id: `tk-${t.id}`, label: t.subject, hint: `${t.userName} · #${t.id.slice(0, 8)}`, group: 'Yêu cầu hỗ trợ', to: `/admin/support?id=${t.id}`, icon: AlertTriangle }));
      const courses: Cmd[] = pd.courses.map((c) => ({ id: `c-${c.id}`, label: c.title, hint: `${c.lessonsCount} bài giảng`, group: 'Khoá học', to: '/admin/courses', icon: PlayCircle }));
      return [...ADMIN, ...users, ...classes, ...tickets, ...courses];
    }
    const nav = role === 'STUDENT' ? STUDENT : GUEST;
    const isAuth = role !== 'GUEST';
    const tests: Cmd[] = pd.tests.map((t) => ({ id: `t-${t.id}`, label: t.title, hint: `${t.examType} · ${t.durationMinutes} phút · ${t.totalQuestions} câu`, group: 'Đề thi thử', to: isAuth ? `/app/mock-tests/${t.slug ?? t.id}` : `/mock-tests?exam=${t.examType}`, icon: FileText, keywords: t.tags?.join(' ') }));
    const courses: Cmd[] = pd.courses.map((c) => ({ id: `c-${c.id}`, label: c.title, hint: `${c.lessonsCount} bài · ${c.durationHours} giờ`, group: 'Khoá học', to: courseHref(c), icon: PlayCircle }));
    const grammar: Cmd[] = isAuth ? pd.grammar.map((g) => ({ id: `g-${g.id}`, label: g.title, hint: `${g.category} · ${g.level}`, group: 'Ngữ pháp', to: `/app/grammar/${g.slug}`, icon: BookOpen })) : [];
    return [...nav, ...tests, ...courses, ...grammar];
  }, [role, pd]);

  // Phạm vi tìm: các nhóm nội dung trước, nhóm trang sau cùng
  const scopes = useMemo(() => {
    const gs = Array.from(new Set(all.map((c) => c.group)));
    return [...gs.filter((g) => !PAGE_GROUPS.has(g)), ...gs.filter((g) => PAGE_GROUPS.has(g))];
  }, [all]);

  const n = fold(q.trim());
  const scored = useMemo(() => {
    if (!n) return [] as { c: Cmd; s: number }[];
    return all
      .map((c) => ({ c, s: score(c, n) - (PAGE_GROUPS.has(c.group) ? 5 : 0) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
  }, [all, n]);
  const countBy = useMemo(() => {
    const m = new Map<string, number>();
    for (const { c } of scored) m.set(c.group, (m.get(c.group) ?? 0) + 1);
    return m;
  }, [scored]);

  // Kết quả theo nhóm (nhóm khớp tốt nhất lên trước); phạm vi "Tất cả" mỗi nhóm hiện tối đa 5
  const sections = useMemo(() => {
    const inScope = scope === 'all' ? scored : scored.filter((x) => x.c.group === scope);
    const order = Array.from(new Set(inScope.map((x) => x.c.group)));
    const limit = scope === 'all' ? 5 : 60;
    return order.map((g) => {
      const items = inScope.filter((x) => x.c.group === g).map((x) => x.c);
      return { group: g, items: items.slice(0, limit), more: Math.max(0, items.length - limit) };
    });
  }, [scored, scope]);
  const results = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  // Ô trống: từ khoá gần đây + lối tắt trang (chưa chọn sẵn dòng nào)
  const quick = useMemo(() => all.filter((c) => PAGE_GROUPS.has(c.group) && (scope === 'all' || c.group === scope)).slice(0, 8), [all, scope]);
  const emptyItems = useMemo<EmptyItem[]>(() => [...recent.map((text) => ({ kind: 'recent' as const, text })), ...quick.map((cmd) => ({ kind: 'cmd' as const, cmd }))], [recent, quick]);
  const navCount = n ? results.length : emptyItems.length;

  useEffect(() => setIdx(n ? 0 : -1), [n, scope]);
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [idx]);

  if (!open) return null;

  const close = () => setOpen(false);
  const remember = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => fold(r) !== fold(t))].slice(0, RECENT_MAX);
    setRecent(next);
    writeRecent(role, next);
  };
  const forget = (text?: string) => {
    const next = text === undefined ? [] : recent.filter((r) => r !== text);
    setRecent(next);
    writeRecent(role, next);
  };
  const go = (c: Cmd) => {
    if (n) remember(q);
    close();
    navigate(c.to);
  };
  const pickEmpty = (it: EmptyItem) => {
    if (it.kind === 'recent') {
      setQ(it.text);
      inputRef.current?.focus();
    } else go(it.cmd);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => (navCount ? (i + 1) % navCount : -1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => (navCount ? (i <= 0 ? navCount - 1 : i - 1) : -1));
    }
    if (e.key === 'Enter') {
      if (n && results.length) go(results[Math.max(0, idx)]);
      else if (!n && idx >= 0 && emptyItems[idx]) pickEmpty(emptyItems[idx]);
    }
  };

  const placeholder =
    role === 'TEACHER' ? 'Tìm lớp, học viên, bài tập, đề thi, khoá học…' : role === 'HEAD_TEACHER' ? 'Tìm lớp, giáo viên, học viên, trang…' : role === 'ADMIN' ? 'Tìm tài khoản, lớp, yêu cầu hỗ trợ, khoá học…' : role === 'STUDENT' ? 'Tìm khoá học, đề thi thử, chủ điểm ngữ pháp…' : 'Tìm khoá học, đề thi thử…';
  const contentCounts = scopes
    .filter((g) => !PAGE_GROUPS.has(g))
    .map((g) => `${all.filter((c) => c.group === g).length} ${g.toLowerCase()}`)
    .join(', ');

  const row = (key: string, i: number, active: boolean, onPick: () => void, icon: React.ReactNode, label: React.ReactNode, hint?: React.ReactNode, trailing?: React.ReactNode) => (
    <div
      key={key}
      role="option"
      aria-selected={active}
      data-active={active}
      onMouseMove={() => idx !== i && setIdx(i)}
      onClick={onPick}
      className={cn('group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left', active ? 'bg-slate-100' : 'hover:bg-slate-50')}
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md border', active ? 'border-slate-300 bg-white text-slate-900' : 'border-slate-200 text-slate-500')}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900">{label}</span>
        {hint && <span className="block truncate text-[12px] text-slate-500">{hint}</span>}
      </span>
      {trailing ?? (active && <CornerDownLeft className="h-4 w-4 shrink-0 text-slate-400" />)}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-start justify-center p-3 pt-[8vh] animate-fade-in sm:p-4 sm:pt-[12vh]" role="dialog" aria-modal aria-label="Tìm kiếm">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_64px_-16px_rgba(0,0,0,0.35)] animate-scale-in">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Từ khoá tìm kiếm"
            role="combobox"
            aria-expanded
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          />
          {dataQ.isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />}
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                inputRef.current?.focus();
              }}
              aria-label="Xoá từ khoá"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button type="button" onClick={close} className="shrink-0 rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900">
            Esc
          </button>
        </div>

        {/* Phạm vi tìm */}
        {scopes.length > 1 && (
          <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-slate-100 px-4 py-2 [scrollbar-width:none]">
            {['all', ...scopes].map((g) => {
              const on = scope === g;
              const c = g === 'all' ? scored.length : (countBy.get(g) ?? 0);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setScope(g);
                    inputRef.current?.focus();
                  }}
                  className={cn('inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2.5 text-[12px] font-medium transition-colors', on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100', n && !c && !on && 'opacity-50')}
                >
                  {g === 'all' ? 'Tất cả' : g}
                  {n && <span className={cn('tabular-nums', on ? 'text-white/70' : 'text-slate-400')}>{c}</span>}
                </button>
              );
            })}
          </div>
        )}

        <div ref={listRef} role="listbox" className="min-h-0 flex-1 overflow-y-auto p-2">
          {!n ? (
            <>
              {recent.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between px-3 pb-1 pt-1.5">
                    <p className="text-[12px] font-medium text-slate-500">Tìm kiếm gần đây</p>
                    <button type="button" onClick={() => forget()} className="text-[12px] text-slate-400 hover:text-slate-700">
                      Xoá lịch sử
                    </button>
                  </div>
                  {recent.map((text, i) =>
                    row(
                      `r-${text}`,
                      i,
                      idx === i,
                      () => pickEmpty({ kind: 'recent', text }),
                      <History className="h-4 w-4" />,
                      text,
                      undefined,
                      <button
                        type="button"
                        aria-label={`Xoá "${text}" khỏi lịch sử`}
                        onClick={(e) => {
                          e.stopPropagation();
                          forget(text);
                        }}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-0 hover:bg-slate-200 hover:text-slate-700 focus:opacity-100 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )
                  )}
                </div>
              )}
              {quick.length > 0 && (
                <div>
                  <p className="px-3 pb-1 pt-1.5 text-[12px] font-medium text-slate-500">Đi nhanh tới</p>
                  <div className="grid gap-0.5 sm:grid-cols-2">
                    {quick.map((c, j) => {
                      const i = recent.length + j;
                      const Icon = c.icon;
                      return row(c.id, i, idx === i, () => go(c), <Icon className="h-4 w-4" />, c.label);
                    })}
                  </div>
                </div>
              )}
              {contentCounts && <p className="px-3 pb-2 pt-3 text-[12px] text-slate-400">{dataQ.isLoading ? 'Đang tải dữ liệu tìm kiếm…' : `Gõ từ khoá để tìm trong ${contentCounts}.`}</p>}
            </>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <SearchX className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-700">Không tìm thấy kết quả cho “{q.trim()}”</p>
              <p className="mt-1 text-[13px] text-slate-500">{scope !== 'all' && scored.length ? `Có ${scored.length} kết quả ở phạm vi khác.` : 'Thử từ khoá ngắn hơn hoặc viết không dấu.'}</p>
              {scope !== 'all' && scored.length > 0 && (
                <button type="button" onClick={() => setScope('all')} className="mt-3 text-[13px] font-medium text-slate-900 underline underline-offset-2">
                  Tìm trong tất cả
                </button>
              )}
            </div>
          ) : (
            sections.map((s) => (
              <div key={s.group} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[12px] font-medium text-slate-500">{s.group}</p>
                {s.items.map((r) => {
                  const i = results.indexOf(r);
                  const Icon = r.icon;
                  return row(r.id, i, i === idx, () => go(r), <Icon className="h-4 w-4" />, <Highlight text={r.label} q={q} />, r.hint);
                })}
                {s.more > 0 && (
                  <button type="button" onClick={() => setScope(s.group)} className="flex w-full items-center gap-1 rounded-lg px-3 py-1.5 text-left text-[12px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                    Xem thêm {s.more} kết quả trong {s.group.toLowerCase()} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="hidden h-10 shrink-0 items-center gap-4 border-t border-slate-100 bg-slate-50 px-4 text-[12px] text-slate-500 sm:flex">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            <ArrowDown className="h-3 w-3" /> chọn
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> mở
          </span>
          <span>Ctrl K mở nhanh</span>
          {n && <span className="ml-auto tabular-nums">{scope === 'all' ? scored.length : (countBy.get(scope) ?? 0)} kết quả</span>}
        </div>
      </div>
    </div>,
    document.body
  );
};
