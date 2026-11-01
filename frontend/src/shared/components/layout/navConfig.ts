import { Home, Compass, Layers, FileText, AlertTriangle, RotateCcw, BookOpen, GraduationCap, PlayCircle, Headphones, Target, TrendingUp, Bookmark, Trophy, Award, PenTool, Mic, Calculator, FolderOpen, Newspaper, Tag, Briefcase, Wrench, Database } from 'lucide-react';
import type React from 'react';
import type { NavGroup } from './AppShell';

/** Menu của học viên khi đã đăng nhập (hiển thị ngay trên header chung của website) */
export const STUDENT_NAV: NavGroup[] = [
  {
    title: 'Học tập',
    items: [
      { to: '/', label: 'Trang chủ', img: '/images/nav/bar-chart.webp', icon: Home, end: true },
      { to: '/app/learning-path', label: 'Lộ trình', img: '/images/nav/compass.webp', icon: Compass },
      { to: '/courses', label: 'Khoá học', img: '/images/nav/laptop.webp', icon: PlayCircle },
      { to: '/app/practice', label: 'Luyện tập', img: '/images/nav/pencil.webp', icon: Layers },
      { to: '/app/mock-tests', label: 'Thi thử', img: '/images/nav/memo.webp', icon: FileText },
    ],
  },
  {
    title: 'Ôn luyện',
    items: [
      { to: '/app/mistakes', label: 'Sổ tay lỗi sai', img: '/images/nav/spiral-notepad.webp', icon: AlertTriangle, badge: '5' },
      { to: '/app/review', label: 'Lịch ôn ngắt quãng', img: '/images/nav/spiral-calendar.webp', icon: RotateCcw },
      { to: '/app/drills', label: 'Luyện điểm yếu', img: '/images/nav/bullseye.webp', icon: Target },
      { to: '/app/dictation', label: 'Nghe chép chính tả', img: '/images/nav/headphone.webp', icon: Headphones },
      { to: '/app/vocabulary', label: 'Từ vựng & Flashcard', img: '/images/nav/open-book.webp', icon: BookOpen },
      { to: '/app/grammar', label: 'Chủ điểm ngữ pháp', img: '/images/nav/bookmark-tabs.webp', icon: GraduationCap },
      { to: '/app/writing', label: 'Luyện Viết', img: '/images/nav/fountain-pen.webp', icon: PenTool },
      { to: '/app/speaking', label: 'Luyện Nói', img: '/images/nav/microphone.webp', icon: Mic },
    ],
  },
  {
    title: 'Thành tích',
    items: [
      { to: '/app/progress', label: 'Tiến độ & Phân tích', img: '/images/nav/chart-increasing.webp', icon: TrendingUp },
      { to: '/app/achievements', label: 'Huy hiệu', img: '/images/nav/sports-medal.webp', icon: Award },
      { to: '/app/leaderboard', label: 'Bảng vinh danh', img: '/images/nav/trophy.webp', icon: Trophy },
      { to: '/app/bookmarks', label: 'Đã lưu', img: '/images/nav/bookmark.webp', icon: Bookmark },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { to: '/score-converter', label: 'Quy đổi điểm', img: '/images/nav/abacus.webp', icon: Calculator },
      { to: '/resources', label: 'Kho tài liệu mở', img: '/images/nav/books.webp', icon: FolderOpen },
      { to: '/blog', label: 'Kinh nghiệm thi', img: '/images/nav/light-bulb.webp', icon: Newspaper },
      { to: '/pricing', label: 'Bảng giá', img: '/images/nav/label.webp', icon: Tag },
    ],
  },
];

/** Mục con trong dropdown header: có icon + mô tả ngắn một dòng */
export interface MenuLink {
  to: string;
  label: string;
  icon?: React.ElementType;
  img?: string;
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
  { to: '/app/learning-path', label: 'Lộ trình học', img: '/images/nav/compass.webp', desc: 'Lộ trình theo ngày thi của bạn', group: 'Học tập của bạn' },
  { to: '/app/mistakes', label: 'Sổ tay lỗi sai', img: '/images/nav/spiral-notepad.webp', desc: 'Câu làm sai được lưu để làm lại', badge: '5', group: 'Học tập của bạn' },
  { to: '/app/review', label: 'Lịch ôn ngắt quãng', img: '/images/nav/spiral-calendar.webp', desc: 'Ôn đúng lúc sắp quên', group: 'Học tập của bạn' },
  { to: '/app/progress', label: 'Tiến độ & Phân tích', img: '/images/nav/chart-increasing.webp', desc: 'Điểm thi thử, % đúng từng Part', group: 'Học tập của bạn' },
];

export interface PublicNavItem {
  to?: string;
  label: string;
  icon: React.ElementType;
  img: string;
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
    img: '/images/nav/briefcase.webp',
    children: [
      { to: '/toeic', label: 'Giới thiệu kỳ thi TOEIC', img: '/images/nav/briefcase.webp', desc: 'Cấu trúc 7 Part, thang điểm 10–990' },
      { to: '/mock-tests?exam=TOEIC', appTo: '/app/mock-tests?exam=TOEIC', label: 'Đề thi thử TOEIC', img: '/images/nav/memo.webp', desc: 'Làm full đề hoặc chọn Part, tự đặt thời gian' },
      { to: '/app/dictation', label: 'Nghe chép chính tả', img: '/images/nav/headphone.webp', desc: 'Luyện nghe Part 2–4 từng câu' },
      { to: '/app/vocabulary', label: 'Từ vựng TOEIC', img: '/images/nav/open-book.webp', desc: 'Flashcard theo chủ đề, ôn ngắt quãng' },
      { to: '/app/grammar', label: 'Ngữ pháp Part 5–6', img: '/images/nav/bookmark-tabs.webp', desc: 'Chủ điểm hay ra kèm bài tập' },
      { to: '/app/drills', label: 'Luyện điểm yếu', img: '/images/nav/bullseye.webp', desc: 'Câu hỏi theo dạng bạn hay sai' },
    ],
  },
  {
    to: '/vstep',
    label: 'VSTEP',
    icon: GraduationCap,
    img: '/images/nav/graduation-cap.webp',
    children: [
      { to: '/vstep', label: 'Giới thiệu kỳ thi VSTEP', img: '/images/nav/graduation-cap.webp', desc: 'Bậc 3–5, cấu trúc 4 kỹ năng' },
      { to: '/practice', appTo: '/app/practice?exam=VSTEP', label: 'Luyện Nghe & Đọc', img: '/images/nav/pencil.webp', desc: 'Theo dạng bài của đề VSTEP' },
      { to: '/app/writing', label: 'Luyện Viết', img: '/images/nav/fountain-pen.webp', desc: 'Giáo viên chấm theo 4 tiêu chí' },
      { to: '/app/speaking', label: 'Luyện Nói', img: '/images/nav/microphone.webp', desc: 'Ghi âm bài nói, giáo viên nhận xét' },
      { to: '/mock-tests?exam=VSTEP', appTo: '/app/mock-tests?exam=VSTEP', label: 'Đề thi thử VSTEP', img: '/images/nav/memo.webp', desc: 'Đủ 4 kỹ năng như đề thật' },
    ],
  },
  {
    to: '/courses',
    label: 'Khoá học',
    icon: PlayCircle,
    img: '/images/nav/laptop.webp',
    children: [
      { to: '/courses/ngu-phap', label: 'Ngữ pháp', img: '/images/nav/open-book.webp', desc: 'Toàn bộ ngữ pháp, từ câu đơn đến nâng cao' },
      { to: '/courses/tu-vung-phat-am', label: 'Từ vựng và Phát âm', img: '/images/nav/microphone.webp', desc: 'Phiên âm IPA, trọng âm, từ vựng theo chủ đề' },
      { to: '/courses/giao-tiep-hang-ngay', label: 'Giao tiếp hằng ngày', img: '/images/nav/compass.webp', desc: 'Nói trong các tình huống đời sống, du lịch', group: 'Kỹ năng tiếng Anh' },
      { to: '/courses/luyen-nghe', label: 'Luyện nghe hiểu', img: '/images/nav/headphone.webp', desc: 'Từ nối âm, âm yếu đến phim, tin tức', group: 'Kỹ năng tiếng Anh' },
      { to: '/courses/viet-tieng-anh', label: 'Viết tiếng Anh', img: '/images/nav/fountain-pen.webp', desc: 'Câu, đoạn văn, email, bài luận', group: 'Kỹ năng tiếng Anh' },
      { to: '/courses/tieng-anh-cong-so', label: 'Tiếng Anh công sở', img: '/images/nav/laptop.webp', desc: 'Email, họp, thuyết trình, phỏng vấn', group: 'Kỹ năng tiếng Anh' },
      { to: '/courses/nen-tang-toeic', label: 'Nền tảng TOEIC', img: '/images/nav/briefcase.webp', desc: 'Giáo trình tiếng Anh công việc B1 → B2', group: 'Kiến thức nền tảng' },
      { to: '/courses/nen-tang-vstep', label: 'Nền tảng VSTEP', img: '/images/nav/graduation-cap.webp', desc: 'Giáo trình tiếng Anh đời sống A2 → B1', group: 'Kiến thức nền tảng' },
    ],
  },
  { to: '/mock-tests', label: 'Thi thử', img: '/images/nav/memo.webp', icon: FileText, appTo: '/app/mock-tests' },
  {
    label: 'Công cụ',
    icon: Wrench,
    withStudentTools: true,
    img: '/images/nav/toolbox.webp',
    children: [
      { to: '/score-converter', label: 'Quy đổi điểm', img: '/images/nav/abacus.webp', icon: Calculator, desc: 'TOEIC ↔ VSTEP ↔ CEFR theo bảng ETS' },
      { to: '/resources', label: 'Kho tài liệu mở', img: '/images/nav/books.webp', icon: FolderOpen, desc: 'Ngữ pháp, từ vựng, bài mẫu Writing' },
      { to: '/question-bank', label: 'Ngân hàng câu hỏi', img: '/images/nav/card-file-box.webp', icon: Database, desc: '12.614 câu theo từng Part, có giải thích' },
      { to: '/leaderboard', label: 'Bảng vinh danh', img: '/images/nav/trophy.webp', icon: Trophy, desc: 'Học viên chuyên cần nhất tuần này', appTo: '/app/leaderboard' },
    ],
  },
  { to: '/pricing', label: 'Bảng giá', img: '/images/nav/label.webp', icon: Tag },
  { to: '/blog', label: 'Kinh nghiệm', img: '/images/nav/light-bulb.webp', icon: Newspaper },
];
