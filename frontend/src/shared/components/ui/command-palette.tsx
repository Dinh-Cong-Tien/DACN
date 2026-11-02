import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, PlayCircle, BookOpen, Compass, AlertTriangle, Trophy, Settings, LayoutDashboard, CornerDownLeft, ArrowUp, ArrowDown, Users, ClipboardList, PenTool, Sparkles, CalendarDays, ClipboardCheck, Sheet, BarChart3, FolderOpen } from 'lucide-react';
import { useUiStore } from '@/shared/stores/uiStore';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_ASSIGNMENTS, MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_COURSES, MOCK_TESTS, GRAMMAR_TOPICS, DEPT_CLASSES, DEPT_STUDENTS, MOCK_TEACHERS, MOCK_USERS, MOCK_TICKETS, courseHref } from '@/shared/mocks';
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
  { id: 'mock', label: 'Thi thử TOEIC/VSTEP', group: 'Điều hướng', to: '/app/mock-tests', icon: FileText },
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
  { id: 'lib-courses', label: 'Khoá học & bài giảng', group: 'Trang', to: '/teacher/library/courses', icon: PlayCircle },
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

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

/** Bảng lệnh ⌘K: tìm trang, đề thi, khoá học, chủ điểm ngữ pháp */
export const CommandPalette: React.FC = () => {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPalette);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const role = user?.role ?? 'GUEST';
  const staff = role === 'TEACHER' || role === 'HEAD_TEACHER' || role === 'ADMIN';
  const all = useMemo<Cmd[]>(() => {
    // Mỗi vai trò chỉ tìm trong phần việc của mình
    if (role === 'TEACHER') {
      const classes: Cmd[] = MOCK_CLASSES.map((c) => ({ id: `cl-${c.id}`, label: c.name, hint: `${c.examType} · ${c.schedule} · ${c.studentsCount} học viên`, group: 'Lớp học', to: `/teacher/classes/${c.id}`, icon: Users, keywords: c.code }));
      const students: Cmd[] = MOCK_CLASS_STUDENTS.map((s) => ({ id: `st-${s.id}`, label: s.name, hint: `${s.email} · điểm ${s.avgScore}`, group: 'Học viên', to: `/teacher/students?id=${s.id}`, icon: Users }));
      const assignments: Cmd[] = MOCK_ASSIGNMENTS.map((a) => ({ id: `as-${a.id}`, label: a.title, hint: `${a.className} · đã nộp ${a.submitted}/${a.total}`, group: 'Bài tập', to: `/teacher/assignments${a.status === 'DRAFT' ? '?status=DRAFT' : ''}`, icon: ClipboardList }));
      const tests: Cmd[] = MOCK_TESTS.map((t) => ({ id: `t-${t.id}`, label: t.title, hint: `${t.examType} · ${t.totalQuestions} câu · ${t.durationMinutes} phút`, group: 'Ngân hàng đề', to: `/teacher/library/tests?tab=${t.examType}`, icon: FileText }));
      const courses: Cmd[] = MOCK_COURSES.map((c) => ({ id: `c-${c.id}`, label: c.title, hint: `${c.lessonsCount} bài giảng`, group: 'Khoá học', to: `/teacher/library/courses?open=${c.id}`, icon: PlayCircle }));
      return [...TEACHER, ...classes, ...students, ...assignments, ...tests, ...courses];
    }
    if (role === 'HEAD_TEACHER') {
      const classes: Cmd[] = DEPT_CLASSES.map((c) => ({ id: `cl-${c.id}`, label: c.name, hint: `${c.teacherName} · ${c.schedule} · ${c.studentsCount} học viên`, group: 'Lớp học', to: `/head/classes/${c.id}`, icon: Users, keywords: c.code }));
      const teachers: Cmd[] = MOCK_TEACHERS.map((t) => ({ id: `tc-${t.id}`, label: t.name, hint: `${t.subject} · ${t.email}`, group: 'Giáo viên', to: `/head/teachers/${t.id}`, icon: Users }));
      const students: Cmd[] = DEPT_STUDENTS.map((s) => ({ id: `st-${s.id}`, label: s.name, hint: `${DEPT_CLASSES.find((c) => c.id === s.classId)?.name ?? ''} · điểm ${s.avgScore}`, group: 'Học viên', to: `/head/students?q=${encodeURIComponent(s.name)}`, icon: Users }));
      return [...HEAD, ...classes, ...teachers, ...students];
    }
    if (role === 'ADMIN') {
      const users: Cmd[] = MOCK_USERS.map((u) => ({ id: `u-${u.id}`, label: u.fullName, hint: u.email, group: 'Tài khoản', to: `/admin/users?q=${encodeURIComponent(u.email)}`, icon: Users }));
      const classes: Cmd[] = DEPT_CLASSES.map((c) => ({ id: `cl-${c.id}`, label: c.name, hint: `${c.teacherName} · mã ${c.code}`, group: 'Lớp học', to: '/admin/classes', icon: Users, keywords: c.code }));
      const tickets: Cmd[] = MOCK_TICKETS.map((t) => ({ id: `tk-${t.id}`, label: t.subject, hint: `${t.userName} · #${t.id}`, group: 'Yêu cầu hỗ trợ', to: `/admin/support?id=${t.id}`, icon: AlertTriangle }));
      const courses: Cmd[] = MOCK_COURSES.map((c) => ({ id: `c-${c.id}`, label: c.title, hint: `${c.lessonsCount} bài giảng`, group: 'Khoá học', to: '/admin/courses', icon: PlayCircle }));
      return [...ADMIN, ...users, ...classes, ...tickets, ...courses];
    }
    const nav = role === 'STUDENT' ? STUDENT : GUEST;
    const isAuth = role !== 'GUEST';
    const tests: Cmd[] = MOCK_TESTS.map((t) => ({ id: `t-${t.id}`, label: t.title, hint: `${t.examType} · ${t.durationMinutes} phút · ${t.totalQuestions} câu`, group: 'Đề thi thử', to: isAuth ? `/app/mock-tests/${t.id}` : '/mock-tests', icon: FileText, keywords: t.tags?.join(' ') }));
    const courses: Cmd[] = MOCK_COURSES.map((c) => ({ id: `c-${c.id}`, label: c.title, hint: `${c.lessonsCount} bài · ${c.durationHours} giờ`, group: 'Khoá học', to: courseHref(c), icon: PlayCircle }));
    const grammar: Cmd[] = isAuth ? GRAMMAR_TOPICS.map((g) => ({ id: `g-${g.id}`, label: g.title, hint: `${g.category} · ${g.level}`, group: 'Ngữ pháp', to: `/app/grammar/${g.slug}`, icon: BookOpen })) : [];
    return [...nav, ...tests, ...courses, ...grammar];
  }, [role]);

  const results = useMemo(() => {
    const n = normalize(q.trim());
    if (!n) return staff ? all.filter((c) => c.group === 'Trang').slice(0, 10) : all.slice(0, 12);
    return all.filter((c) => normalize(`${c.label} ${c.hint ?? ''} ${c.keywords ?? ''}`).includes(n)).slice(0, 14);
  }, [all, q]);

  useEffect(() => setIdx(0), [q]);

  const go = (c: Cmd) => {
    setOpen(false);
    navigate(c.to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(results.length - 1, i + 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    }
    if (e.key === 'Enter' && results[idx]) go(results[idx]);
  };

  if (!open) return null;

  const groups = Array.from(new Set(results.map((r) => r.group)));

  if (staff) return createPortal(<StaffPalette q={q} setQ={setQ} inputRef={inputRef} onKeyDown={onKeyDown} results={results} groups={groups} idx={idx} setIdx={setIdx} go={go} close={() => setOpen(false)} placeholder={role === 'TEACHER' ? 'Tìm lớp, học viên, bài tập, đề thi, khoá học…' : 'Tìm trang…'} />, document.body);

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-[12vh] animate-fade-in" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-white rounded-3xl border-2 border-slate-900 shadow-hard-lg overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 h-14 border-b-2 border-slate-900">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Tìm trang, đề thi, khoá học, ngữ pháp..."
            className="flex-1 h-full bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-500">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Không tìm thấy kết quả cho "{q}".</p>}
          {groups.map((g) => (
            <div key={g} className="mb-1">
              <p className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{g}</p>
              {results
                .filter((r) => r.group === g)
                .map((r) => {
                  const i = results.indexOf(r);
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => go(r)}
                      className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors', i === idx ? 'bg-amber-200 text-slate-900' : 'hover:bg-slate-100 text-slate-700')}
                    >
                      <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-2', i === idx ? 'bg-slate-900 text-amber-300 border-slate-900' : 'bg-white border-slate-200 text-slate-500')}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold truncate">{r.label}</span>
                        {r.hint && <span className="block text-[11px] text-slate-500 truncate">{r.hint}</span>}
                      </span>
                      {i === idx && <CornerDownLeft className="w-4 h-4 text-slate-500" />}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 px-4 h-10 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" /> di chuyển
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" /> mở
          </span>
          <span className="ml-auto">{results.length} kết quả</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

/** Bảng tìm kiếm của giáo viên / quản lý: nền sáng, viền mảnh, dòng đang chọn tô nhạt */
const StaffPalette: React.FC<{
  q: string;
  setQ: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  results: Cmd[];
  groups: string[];
  idx: number;
  setIdx: (i: number) => void;
  go: (c: Cmd) => void;
  close: () => void;
  placeholder: string;
}> = ({ q, setQ, inputRef, onKeyDown, results, groups, idx, setIdx, go, close, placeholder }) => (
  <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-[10vh] animate-fade-in" role="dialog" aria-modal aria-label="Tìm kiếm">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={close} />
    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_-20px_rgba(16,24,40,0.45)] animate-scale-in">
      <div className="flex h-14 items-center gap-3 border-b border-slate-100 px-5">
        <Search className="h-5 w-5 text-indigo-500" />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} className="h-full flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400" />
        <button type="button" onClick={close} className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900">
          Esc
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
        {results.length === 0 && <p className="px-4 py-10 text-center text-sm text-slate-500">Không tìm thấy kết quả cho “{q}”.</p>}
        {!q.trim() && results.length > 0 && <p className="px-3 pb-1 pt-1 text-[12px] text-slate-400">Gõ tên lớp, học viên, bài tập hoặc đề thi để tìm nhanh</p>}
        {groups.map((g) => (
          <div key={g} className="mb-1">
            <p className="px-3 pb-1 pt-2.5 text-[12px] font-semibold text-slate-500">{g}</p>
            {results
              .filter((r) => r.group === g)
              .map((r) => {
                const i = results.indexOf(r);
                const Icon = r.icon;
                const on = i === idx;
                return (
                  <button key={r.id} type="button" onMouseEnter={() => setIdx(i)} onClick={() => go(r)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors', on ? 'bg-indigo-500/[0.08]' : 'hover:bg-slate-50')}>
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', on ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-sm font-semibold', on ? 'text-indigo-700' : 'text-slate-900')}>{r.label}</span>
                      {r.hint && <span className="block truncate text-[12px] text-slate-500">{r.hint}</span>}
                    </span>
                    {on && <CornerDownLeft className="h-4 w-4 text-indigo-400" />}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
      <div className="flex h-10 items-center gap-4 border-t border-slate-100 bg-slate-50/70 px-5 text-[12px] text-slate-500">
        <span className="flex items-center gap-1">
          <ArrowUp className="h-3 w-3" />
          <ArrowDown className="h-3 w-3" /> chọn
        </span>
        <span className="flex items-center gap-1">
          <CornerDownLeft className="h-3 w-3" /> mở
        </span>
        <span className="flex items-center gap-1">Ctrl K mở nhanh</span>
        <span className="ml-auto tabular-nums">{results.length} kết quả</span>
      </div>
    </div>
  </div>
);
