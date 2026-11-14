import { Home, Compass, Layers, FileText, AlertTriangle, RotateCcw, BookOpen, GraduationCap, PlayCircle, Headphones, Target, TrendingUp, Bookmark, Trophy, Award, PenTool, Mic, Calculator, FolderOpen, Newspaper, Tag, Briefcase, Wrench, Database, BookMarked, CalendarClock, NotebookPen, PenLine, PencilLine, School } from 'lucide-react';
import type React from 'react';
import type { NavGroup } from './AppShell';

/** Menu của học viên khi đã đăng nhập (hiển thị ngay trên header chung của website) */
export const STUDENT_NAV: NavGroup[] = [
  {
    title: 'Học tập',
    items: [
      { to: '/', label: 'Trang chủ', icon: Home, end: true },
      { to: '/app/learning-path', label: 'Lộ trình', icon: Compass },
      { to: '/courses', label: 'Khoá học', icon: PlayCircle },
      { to: '/app/practice', label: 'Luyện tập', icon: Layers },
    ],
  },
  {
    title: 'Ôn luyện',
    items: [
      { to: '/app/mistakes', label: 'Sổ tay lỗi sai', icon: AlertTriangle },
      { to: '/app/review', label: 'Lịch ôn ngắt quãng', icon: RotateCcw },
      { to: '/app/drills', label: 'Luyện điểm yếu', icon: Target },
      { to: '/app/dictation', label: 'Nghe chép chính tả', icon: Headphones },
      { to: '/app/vocabulary', label: 'Từ vựng & Flashcard', icon: BookOpen },
      { to: '/app/grammar', label: 'Chủ điểm ngữ pháp', icon: GraduationCap },
      { to: '/app/writing', label: 'Luyện Viết', icon: PenTool },
      { to: '/app/speaking', label: 'Luyện Nói', icon: Mic },
    ],
  },
  {
    title: 'Thành tích',
    items: [
      { to: '/app/progress', label: 'Tiến độ & Phân tích', icon: TrendingUp },
      { to: '/app/achievements', label: 'Huy hiệu', icon: Award },
      { to: '/app/leaderboard', label: 'Bảng vinh danh', icon: Trophy },
      { to: '/app/bookmarks', label: 'Đã lưu', icon: Bookmark },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { to: '/score-converter', label: 'Quy đổi điểm', icon: Calculator },
      { to: '/resources', label: 'Kho tài liệu mở', icon: FolderOpen },
      { to: '/blog', label: 'Kinh nghiệm thi', icon: Newspaper },
      { to: '/pricing', label: 'Bảng giá', icon: Tag },
    ],
  },
];

/** Mục con trong dropdown header: có icon + mô tả ngắn một dòng */
export interface MenuLink {
  to: string;
  label: string;
  icon?: React.ElementType;
  desc?: string;
  badge?: string;
  /** Đường dẫn khi đã đăng nhập học viên (vd. /courses → /app/courses) */
  appTo?: string;
  /** Tên nhóm hiển thị trong dropdown (mục đầu tiên của nhóm có nhãn nhỏ phía trên) */
  group?: string;
  /** Chỉ hiện khi học viên đã đăng nhập */
  studentOnly?: boolean;
}

/** Mục học tập cá nhân, hiện đầu menu Công cụ khi học viên đã đăng nhập */
export const STUDENT_TOOLS: MenuLink[] = [
  { to: '/app/learning-path', label: 'Lộ trình học', icon: Compass, desc: 'Lộ trình theo ngày thi của bạn', group: 'Học tập của bạn' },
  { to: '/app/mistakes', label: 'Sổ tay lỗi sai', icon: NotebookPen, desc: 'Câu làm sai được lưu để làm lại', group: 'Học tập của bạn' },
  { to: '/app/review', label: 'Lịch ôn ngắt quãng', icon: CalendarClock, desc: 'Ôn đúng lúc sắp quên', group: 'Học tập của bạn' },
  { to: '/app/progress', label: 'Tiến độ & Phân tích', icon: TrendingUp, desc: 'Điểm thi thử, % đúng từng Part', group: 'Học tập của bạn' },
];

export interface PublicNavItem {
  to?: string;
  label: string;
  icon: React.ElementType;
  children?: MenuLink[];
  /** Đường dẫn khi đã đăng nhập học viên */
  appTo?: string;
  /** Học viên: chèn nhóm "Học tập của bạn" (STUDENT_TOOLS) vào đầu menu con */
  withStudentTools?: boolean;
}

/** Menu chính trên header — dùng chung cho khách và học viên (học viên đi theo appTo nếu có) */
export const PUBLIC_NAV: PublicNavItem[] = [
  {
    to: '/toeic',
    label: 'TOEIC',
    icon: Briefcase,
    children: [
      { to: '/toeic', label: 'Giới thiệu kỳ thi TOEIC', icon: Briefcase, desc: 'Cấu trúc 7 Part, thang điểm 10–990' },
      { to: '/mock-tests?exam=TOEIC', appTo: '/app/mock-tests?exam=TOEIC', label: 'Đề thi thử TOEIC', icon: FileText, desc: 'Làm full đề hoặc chọn Part, tự đặt thời gian' },
      { to: '/app/dictation', label: 'Nghe chép chính tả', icon: Headphones, desc: 'Luyện nghe Part 2–4 từng câu' },
      { to: '/app/vocabulary', label: 'Từ vựng TOEIC', icon: BookOpen, desc: 'Flashcard theo chủ đề, ôn ngắt quãng' },
      { to: '/app/grammar', label: 'Ngữ pháp Part 5–6', icon: BookMarked, desc: 'Chủ điểm hay ra kèm bài tập' },
      { to: '/app/drills', label: 'Luyện điểm yếu', icon: Target, desc: 'Câu hỏi theo dạng bạn hay sai' },
    ],
  },
  {
    to: '/vstep',
    label: 'VSTEP',
    icon: GraduationCap,
    children: [
      { to: '/vstep', label: 'Giới thiệu kỳ thi VSTEP', icon: GraduationCap, desc: 'Bậc 3–5, cấu trúc 4 kỹ năng' },
      { to: '/practice', appTo: '/app/practice?exam=VSTEP', label: 'Luyện Nghe & Đọc', icon: PencilLine, desc: 'Theo dạng bài của đề VSTEP' },
      { to: '/app/writing', label: 'Luyện Viết', icon: PenLine, desc: 'Giáo viên chấm theo 4 tiêu chí' },
      { to: '/app/speaking', label: 'Luyện Nói', icon: Mic, desc: 'Ghi âm bài nói, giáo viên nhận xét' },
      { to: '/mock-tests?exam=VSTEP', appTo: '/app/mock-tests?exam=VSTEP', label: 'Đề thi thử VSTEP', icon: FileText, desc: 'Đủ 4 kỹ năng như đề thật' },
    ],
  },
  {
    to: '/courses',
    label: 'Khoá học',
    icon: PlayCircle,
    children: [
      { to: '/courses?muc=toeic', label: 'Khoá học TOEIC', icon: Briefcase, desc: 'Nền tảng, Listening Part 1–4, Reading Part 5–7' },
      { to: '/courses?muc=vstep', label: 'Khoá học VSTEP', icon: GraduationCap, desc: 'Nền tảng, Nghe, Đọc, Viết, Nói' },
      { to: '/courses?muc=thpt', label: 'Tiếng Anh THPT', icon: School, desc: 'Lớp 10, 11, 12 theo SGK Global Success' },
    ],
  },
  {
    label: 'Công cụ',
    icon: Wrench,
    withStudentTools: true,
    children: [
      { to: '/score-converter', label: 'Quy đổi điểm', icon: Calculator, desc: 'TOEIC ↔ VSTEP ↔ CEFR theo bảng ETS' },
      { to: '/resources', label: 'Kho tài liệu mở', icon: FolderOpen, desc: 'Từ vựng, ngữ pháp, đề Viết/Nói' },
      { to: '/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Câu hỏi theo từng Part, có giải thích' },
      { to: '/leaderboard', label: 'Bảng vinh danh', icon: Trophy, desc: 'Học viên chuyên cần nhất tuần này', appTo: '/app/leaderboard' },
    ],
  },
  { to: '/blog', label: 'Kinh nghiệm', icon: Newspaper },
];
