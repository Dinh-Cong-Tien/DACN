import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Briefcase, Calculator, CalendarDays, ChevronDown, ClipboardCheck, ClipboardList, Database, FileEdit, FileText, FolderOpen, GraduationCap, Languages, Plus, Presentation, Sheet, UserRoundX, Users, type LucideIcon } from 'lucide-react';
import { MOCK_ASSIGNMENTS, MOCK_CLASSES, MOCK_SUBMISSIONS } from '@/shared/mocks';
import { cn } from '@/shared/utils';

export interface TeacherMenuLink {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  /** Nhãn nhóm trong dropdown, hiện ở mục đầu tiên của nhóm */
  group?: string;
  badge?: string;
}

export interface TeacherMenu {
  label: string;
  to?: string;
  badge?: string;
  children?: TeacherMenuLink[];
}

const toGrade = String(MOCK_SUBMISSIONS.filter((s) => s.status !== 'GRADED').length);
const drafts = MOCK_ASSIGNMENTS.filter((a) => a.status === 'DRAFT').length;

/**
 * Menu header giáo viên theo quy trình dạy học: lớp → lịch dạy, điểm danh → giao bài → chấm bài → theo dõi học viên, bảng điểm → học liệu.
 */
export const TEACHER_MENUS: TeacherMenu[] = [
  { to: '/teacher/dashboard', label: 'Tổng quan' },
  {
    label: 'Lớp học',
    to: '/teacher/classes',
    children: [
      { to: '/teacher/classes', label: 'Tất cả lớp', icon: Users, desc: 'Mã mời, lịch học, sĩ số, tạo lớp mới' },
      ...MOCK_CLASSES.map((c) => ({ to: `/teacher/classes/${c.id}`, label: c.name, icon: c.examType === 'TOEIC' ? Briefcase : GraduationCap, desc: `${c.schedule} · ${c.studentsCount} học viên`, group: 'Lớp đang dạy' })),
    ],
  },
  {
    label: 'Lịch dạy',
    to: '/teacher/schedule',
    children: [
      { to: '/teacher/schedule', label: 'Lịch dạy tuần', icon: CalendarDays, desc: 'Các buổi dạy, phòng học, giáo án từng buổi' },
      { to: '/teacher/attendance', label: 'Điểm danh', icon: ClipboardCheck, desc: 'Điểm danh buổi hôm nay, sổ điểm danh cả khoá' },
    ],
  },
  {
    label: 'Bài tập',
    to: '/teacher/assignments',
    children: [
      { to: '/teacher/assignments', label: 'Danh sách bài tập', icon: ClipboardList, desc: 'Hạn nộp, số bài đã nộp, điểm trung bình' },
      { to: '/teacher/assignments?new=1', label: 'Giao bài mới', icon: Plus, desc: 'Chọn lớp, nội dung, hạn nộp' },
      { to: '/teacher/assignments?status=DRAFT', label: 'Bản nháp', icon: FileEdit, desc: 'Bài đã soạn, chưa gửi học viên', badge: drafts ? String(drafts) : undefined },
    ],
  },
  { to: '/teacher/grading', label: 'Chấm bài', badge: toGrade },
  {
    label: 'Học viên',
    to: '/teacher/students',
    children: [
      { to: '/teacher/students', label: 'Hồ sơ học viên', icon: Users, desc: 'Điểm, chuyên cần, nhật ký trao đổi' },
      { to: '/teacher/students?filter=watch', label: 'Cần theo dõi', icon: UserRoundX, desc: 'Vắng nhiều, nộp bài thiếu, điểm giảm' },
      { to: '/teacher/gradebook', label: 'Bảng điểm', icon: Sheet, desc: 'Điểm quá trình, xét điều kiện thi' },
      { to: '/teacher/analytics', label: 'Thống kê lớp', icon: BarChart3, desc: '% đúng từng Part, phân bố điểm, lỗi sai' },
    ],
  },
  {
    label: 'Học liệu',
    to: '/teacher/library',
    children: [
      { to: '/teacher/library/courses', label: 'Khoá học & bài giảng', icon: Presentation, desc: '8 khoá, giao từng bài giảng theo lộ trình' },
      { to: '/teacher/library/tests', label: 'Ngân hàng đề', icon: FileText, desc: 'Thi thử TOEIC, VSTEP · đề Viết, đề Nói' },
      { to: '/teacher/library/practice', label: 'Ngữ pháp & Từ vựng', icon: Languages, desc: 'Chủ điểm ngữ pháp, bộ flashcard' },
      { to: '/teacher/materials', label: 'Tài liệu lớp', icon: FolderOpen, desc: 'Slide, audio, bài mẫu của riêng lớp' },
      { to: '/score-converter', label: 'Quy đổi điểm', icon: Calculator, desc: 'TOEIC ↔ VSTEP ↔ CEFR', group: 'Tra cứu' },
      { to: '/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Câu hỏi theo từng Part, có giải thích', group: 'Tra cứu' },
    ],
  },
];

/** Mục con đang mở: khớp đường dẫn, và khớp cả query nếu link có query */
const isHere = (to: string, pathname: string, search: string) => {
  const [path, query] = to.split('?');
  if (pathname !== path && !(path !== '/teacher/classes' && pathname.startsWith(`${path}/`))) return false;
  if (!query) return !search || path === '/teacher/classes';
  const cur = new URLSearchParams(search);
  return [...new URLSearchParams(query)].every(([k, v]) => cur.get(k) === v);
};

const topCls = (active: boolean) => cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-slate-900/[0.06] text-indigo-700' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900');

const Count: React.FC<{ n: string }> = ({ n }) => <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded px-1 text-[10px] font-semibold text-white bg-rose-500">{n}</span>;

/** Menu header giáo viên: mục đơn hoặc dropdown có mô tả, nhóm, đếm số */
export const TeacherNav: React.FC = () => {
  const { pathname, search } = useLocation();
  return (
    <nav className="hidden items-center gap-0.5 md:flex" aria-label="Menu giáo viên">
      {TEACHER_MENUS.map((m, mi) => {
        if (!m.children)
          return (
            <NavLink key={m.label} to={m.to!} className={({ isActive }) => topCls(isActive)}>
              {m.label}
              {m.badge && <Count n={m.badge} />}
            </NavLink>
          );
        const active = (m.to && pathname.startsWith(m.to.split('?')[0])) || m.children.some((c) => isHere(c.to, pathname, search));
        return (
          <div key={m.label} className="group/menu relative">
            <button type="button" className={topCls(Boolean(active))} aria-haspopup="true">
              {m.label}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover/menu:rotate-180" />
            </button>
            <div className={cn('pointer-events-none absolute top-full z-50 pt-2 opacity-0 transition-opacity duration-150 group-focus-within/menu:pointer-events-auto group-focus-within/menu:opacity-100 group-hover/menu:pointer-events-auto group-hover/menu:opacity-100', mi === TEACHER_MENUS.length - 1 ? 'right-0' : 'left-0')}>
              <div className={cn('rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(16,24,40,0.25)]', 'w-[320px]')}>
                {m.children.map((c, i) => {
                  const here = isHere(c.to, pathname, search);
                  const Icon = c.icon;
                  const head = c.group && c.group !== m.children![i - 1]?.group;
                  return (
                    <React.Fragment key={c.to + c.label}>
                      {head && <p className={cn('px-2.5 pb-1 pt-2 text-[12px] font-medium text-slate-400', i > 0 && 'mt-1 border-t border-slate-100')}>{c.group}</p>}
                      <Link to={c.to} className={cn('flex items-start gap-3 rounded-md px-2.5 py-2 transition-colors', here ? 'bg-slate-100' : 'hover:bg-slate-50')}>
                        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', here ? 'text-indigo-700' : 'text-slate-400')} />
                        <span className="min-w-0 flex-1">
                          <span className={cn('flex items-center gap-2 text-sm font-medium', here ? 'text-indigo-700' : 'text-slate-900')}>
                            <span className="truncate">{c.label}</span>
                            {c.badge && <Count n={c.badge} />}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{c.desc}</span>
                        </span>
                      </Link>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
};
