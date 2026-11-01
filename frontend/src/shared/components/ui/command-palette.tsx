import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, PlayCircle, BookOpen, Compass, AlertTriangle, Trophy, Settings, LayoutDashboard, CornerDownLeft, ArrowUp, ArrowDown, Users, ClipboardList, PenTool, Sparkles } from 'lucide-react';
import { useUiStore } from '@/shared/stores/uiStore';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_COURSES, MOCK_TESTS, GRAMMAR_TOPICS, courseHref } from '@/shared/mocks';
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
  { id: 'tdash', label: 'Tổng quan giáo viên', group: 'Điều hướng', to: '/teacher/dashboard', icon: LayoutDashboard },
  { id: 'classes', label: 'Lớp học của tôi', group: 'Điều hướng', to: '/teacher/classes', icon: Users },
  { id: 'assign', label: 'Bài tập & Đề thi', group: 'Điều hướng', to: '/teacher/assignments', icon: ClipboardList },
  { id: 'grading', label: 'Bàn chấm bài', group: 'Điều hướng', to: '/teacher/grading', icon: PenTool },
];
const HEAD: Cmd[] = [
  { id: 'hdash', label: 'Tổng quan bộ môn', group: 'Điều hướng', to: '/head/dashboard', icon: LayoutDashboard },
  { id: 'approvals', label: 'Phê duyệt học liệu', group: 'Điều hướng', to: '/head/approvals', icon: ClipboardList },
  { id: 'teachers', label: 'Giáo viên', group: 'Điều hướng', to: '/head/teachers', icon: Users },
];
const ADMIN: Cmd[] = [
  { id: 'adash', label: 'Tổng quan hệ thống', group: 'Điều hướng', to: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Người dùng & Phân quyền', group: 'Điều hướng', to: '/admin/users', icon: Users },
  { id: 'system', label: 'Trạng thái dịch vụ', group: 'Điều hướng', to: '/admin/system', icon: Sparkles },
  { id: 'asettings', label: 'Cấu hình tham số', group: 'Điều hướng', to: '/admin/settings', icon: Settings },
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

  const all = useMemo<Cmd[]>(() => {
    const role = user?.role ?? 'GUEST';
    const nav = role === 'ADMIN' ? [...ADMIN, ...HEAD, ...TEACHER, ...STUDENT] : role === 'HEAD_TEACHER' ? [...HEAD, ...TEACHER, ...STUDENT] : role === 'TEACHER' ? [...TEACHER, ...STUDENT] : role === 'STUDENT' ? STUDENT : GUEST;
    const isAuth = role !== 'GUEST';
    const tests: Cmd[] = MOCK_TESTS.map((t) => ({ id: `t-${t.id}`, label: t.title, hint: `${t.examType} · ${t.durationMinutes} phút · ${t.totalQuestions} câu`, group: 'Đề thi thử', to: isAuth ? `/app/mock-tests/${t.id}` : '/mock-tests', icon: FileText, keywords: t.tags?.join(' ') }));
    const courses: Cmd[] = MOCK_COURSES.map((c) => ({ id: `c-${c.id}`, label: c.title, hint: `${c.lessonsCount} bài · ${c.durationHours} giờ`, group: 'Khoá học', to: courseHref(c), icon: PlayCircle }));
    const grammar: Cmd[] = isAuth ? GRAMMAR_TOPICS.map((g) => ({ id: `g-${g.id}`, label: g.title, hint: `${g.category} · ${g.level}`, group: 'Ngữ pháp', to: `/app/grammar/${g.slug}`, icon: BookOpen })) : [];
    return [...nav, ...tests, ...courses, ...grammar];
  }, [user]);

  const results = useMemo(() => {
    const n = normalize(q.trim());
    if (!n) return all.slice(0, 12);
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
