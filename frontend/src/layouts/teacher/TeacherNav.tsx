import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Briefcase, Calculator, ChevronDown, ClipboardList, Database, FileEdit, FileText, FolderOpen, GraduationCap, Headphones, Languages, Library, ListChecks, Mic, MessagesSquare, PenTool, Plus, Presentation, Users, type LucideIcon } from 'lucide-react';
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
const classOf = (exam: 'TOEIC' | 'VSTEP') => MOCK_CLASSES.find((c) => c.examType === exam)!.id;

/**
 * Menu header giáo viên — cùng khung với menu học viên (TOEIC · VSTEP · Khoá học · Thi thử · Công cụ),
 * mỗi mục là việc của giáo viên trên đúng nội dung đó: giao bài, chấm, theo dõi lớp.
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
    label: 'TOEIC',
    children: [
      { to: '/teacher/library/tests?exam=TOEIC', label: 'Đề thi thử TOEIC', icon: FileText, desc: 'Giao full đề hoặc chọn Part, đặt thời gian' },
      { to: '/teacher/library/courses?open=c-toeic-basic', label: 'Nền tảng TOEIC', icon: Presentation, desc: 'Giao bài giảng theo lộ trình B1 → B2' },
      { to: '/teacher/library/vocabulary?exam=TOEIC', label: 'Từ vựng TOEIC', icon: BookOpen, desc: 'Giao bộ flashcard theo chủ đề công việc' },
      { to: '/teacher/library/grammar', label: 'Ngữ pháp Part 5–6', icon: Languages, desc: 'Giao chủ điểm kèm bài tập chấm tự động' },
      { to: `/teacher/analytics?class=${classOf('TOEIC')}`, label: 'Kết quả lớp TOEIC', icon: BarChart3, desc: '% đúng từng Part, giao luyện phần yếu' },
    ],
  },
  {
    label: 'VSTEP',
    children: [
      { to: '/teacher/library/tests?exam=VSTEP', label: 'Đề thi thử VSTEP', icon: FileText, desc: 'Giao đề Nghe – Đọc, chọn kỹ năng và thời gian' },
      { to: '/teacher/library/writing-speaking?tab=writing', label: 'Đề Viết', icon: PenTool, desc: 'Task 1 thư, Task 2 bài luận · chấm 4 tiêu chí' },
      { to: '/teacher/library/writing-speaking?tab=speaking', label: 'Đề Nói', icon: Mic, desc: 'Part 1–3 · nghe bài ghi âm và chấm' },
      { to: '/teacher/library/courses?open=c-vstep-basic', label: 'Nền tảng VSTEP', icon: Presentation, desc: 'Giao bài giảng theo lộ trình A2 → B1' },
      { to: '/teacher/library/vocabulary?exam=VSTEP', label: 'Từ vựng VSTEP', icon: BookOpen, desc: 'Giao bộ từ học thuật' },
      { to: `/teacher/analytics?class=${classOf('VSTEP')}`, label: 'Kết quả lớp VSTEP', icon: BarChart3, desc: 'Điểm 4 kỹ năng, quy đổi bậc' },
    ],
  },
  {
    label: 'Khoá học',
    to: '/teacher/library/courses',
    children: [
      { to: '/teacher/library/courses?open=c-grammar', label: 'Ngữ pháp', icon: Languages, desc: '52 bài, từ câu đơn đến nâng cao' },
      { to: '/teacher/library/courses?open=c-vocab', label: 'Từ vựng và Phát âm', icon: BookOpen, desc: 'IPA, trọng âm, từ vựng theo chủ đề' },
      { to: '/teacher/library/courses?open=c-speaking', label: 'Giao tiếp hằng ngày', icon: MessagesSquare, desc: 'Tình huống đời sống, du lịch', group: 'Kỹ năng tiếng Anh' },
      { to: '/teacher/library/courses?open=c-listening', label: 'Luyện nghe hiểu', icon: Headphones, desc: 'Nối âm, âm yếu đến tốc độ thật', group: 'Kỹ năng tiếng Anh' },
      { to: '/teacher/library/courses?open=c-writing', label: 'Viết tiếng Anh', icon: PenTool, desc: 'Câu, đoạn văn, email, bài luận', group: 'Kỹ năng tiếng Anh' },
      { to: '/teacher/library/courses?open=c-office', label: 'Tiếng Anh công sở', icon: Briefcase, desc: 'Email, họp, thuyết trình, phỏng vấn', group: 'Kỹ năng tiếng Anh' },
      { to: '/teacher/library/courses?open=c-toeic-basic', label: 'Nền tảng TOEIC', icon: Briefcase, desc: 'B1 → B2, tiếng Anh công việc', group: 'Kiến thức nền tảng' },
      { to: '/teacher/library/courses?open=c-vstep-basic', label: 'Nền tảng VSTEP', icon: GraduationCap, desc: 'A2 → B1, tiếng Anh đời sống', group: 'Kiến thức nền tảng' },
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
    label: 'Công cụ',
    children: [
      { to: '/teacher/analytics', label: 'Thống kê lớp học', icon: BarChart3, desc: 'Phân bố điểm, nguyên nhân lỗi sai', group: 'Giảng dạy' },
      { to: '/teacher/materials', label: 'Tài liệu lớp', icon: FolderOpen, desc: 'Tải slide, audio, bài mẫu cho lớp', group: 'Giảng dạy' },
      { to: '/teacher/library/grammar', label: 'Chủ điểm ngữ pháp', icon: ListChecks, desc: 'Toàn bộ chủ điểm học viên đang học', group: 'Giảng dạy' },
      { to: '/score-converter', label: 'Quy đổi điểm', icon: Calculator, desc: 'TOEIC ↔ VSTEP ↔ CEFR', group: 'Tra cứu' },
      { to: '/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Câu hỏi theo từng Part, có giải thích', group: 'Tra cứu' },
      { to: '/resources', label: 'Kho tài liệu mở', icon: Library, desc: 'Ngữ pháp, từ vựng, bài mẫu Writing', group: 'Tra cứu' },
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
        const wide = m.children.length > 6;
        return (
          <div key={m.label} className="group/menu relative">
            <button type="button" className={topCls(Boolean(active))} aria-haspopup="true">
              {m.label}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover/menu:rotate-180" />
            </button>
            <div className={cn('pointer-events-none absolute top-full z-50 pt-2 opacity-0 transition-opacity duration-150 group-focus-within/menu:pointer-events-auto group-focus-within/menu:opacity-100 group-hover/menu:pointer-events-auto group-hover/menu:opacity-100', mi >= TEACHER_MENUS.length - 2 ? 'right-0' : wide ? 'left-1/2 -translate-x-1/2' : 'left-0')}>
              <div className={cn('rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(16,24,40,0.25)]', wide ? 'grid w-[620px] grid-cols-2 gap-x-1' : 'w-[330px]')}>
                {m.children.map((c, i) => {
                  const here = isHere(c.to, pathname, search);
                  const Icon = c.icon;
                  const head = c.group && c.group !== m.children![i - 1]?.group;
                  return (
                    <React.Fragment key={c.to + c.label}>
                      {head && <p className={cn('px-2.5 pb-1 pt-2 text-[12px] font-medium text-slate-400', wide ? 'col-span-2 mt-1 border-t border-slate-100' : i > 0 && 'mt-1 border-t border-slate-100')}>{c.group}</p>}
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
