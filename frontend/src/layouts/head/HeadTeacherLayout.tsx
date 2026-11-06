import React from 'react';
import { LayoutDashboard, Library, Database, Users, School, CheckSquare, BarChart3, MessageSquareWarning, GraduationCap, CalendarDays, Scale, FileText, ClipboardList, Trophy, FolderOpen, Briefcase, PenLine, BookMarked, Headphones, PlayCircle, ShieldCheck } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';
import { useHeadDashboard, useHeadStudents, useHeadSubjects } from '@/shared/api/head';

const badge = (n?: number) => (n ? String(n) : undefined);
type Counts = { pending?: string; openComplaints?: string; toReview?: string; quality?: string; riskStudents: number; subjects: number; teachers: number; classes: number };

/** Khoá học và Luyện tập: cùng khung với menu học viên / giáo viên, mở kho học liệu đã lọc */
const COURSE_LINKS = [
  { to: '/head/courses?muc=toeic', label: 'Khoá học TOEIC', icon: Briefcase, desc: 'Nền tảng, Listening Part 1–4, Reading Part 5–7' },
  { to: '/head/courses?muc=vstep', label: 'Khoá học VSTEP', icon: GraduationCap, desc: 'Nền tảng, Nghe, Đọc, Viết, Nói' },
  { to: '/head/courses?muc=thpt', label: 'Tiếng Anh THPT', icon: School, desc: 'Lớp 10, 11, 12 theo SGK Global Success' },
];
const PRACTICE_LINKS = [
  { to: '/head/library/tests?tab=TOEIC', label: 'Đề thi thử', icon: FileText, desc: 'TOEIC, VSTEP · số lần các lớp đã giao' },
  { to: '/head/library/tests?tab=writing', label: 'Đề Viết & Nói', icon: PenLine, desc: 'Đề học viên nộp cho giáo viên chấm' },
  { to: '/head/library/practice?tab=grammar', label: 'Ngữ pháp & Từ vựng', icon: BookMarked, desc: 'Chủ điểm ngữ pháp, bộ từ & flashcard' },
  { to: '/head/library/practice?tab=dictation', label: 'Nghe chép chính tả', icon: Headphones, desc: 'Bài nghe chép từng câu' },
];

/**
 * Menu header trưởng bộ môn: bộ môn → giảng dạy trong lớp → khoá học / thi thử & luyện tập (bám menu học viên) → thẩm định → báo cáo
 */
const buildMenus = ({ pending, openComplaints, toReview, quality, riskStudents, subjects, teachers, classes }: Counts): StaffMenu[] => [
  { to: '/head/dashboard', label: 'Tổng quan' },
  // khoá → các lớp của khoá (mọi giáo viên) → trang lớp: đúng luồng giáo viên / học viên
  { label: 'Khoá học & Lớp', icon: PlayCircle, to: '/head/courses', activeOn: ['/head/classes'], children: COURSE_LINKS },
  {
    label: 'Bộ môn',
    children: [
      { to: '/head/subjects', label: 'Môn học', icon: Library, desc: `${subjects} môn, giáo viên và lớp của từng môn` },
      { to: '/head/teachers', label: 'Giáo viên', icon: Users, desc: `${teachers} giáo viên, hồ sơ chuyên môn, dự giờ` },
      { to: '/head/students', label: 'Học viên', icon: GraduationCap, desc: `${riskStudents} học viên nguy cơ bỏ học cần nhắc` },
    ],
  },
  {
    label: 'Giảng dạy',
    children: [
      { to: '/head/schedule', label: 'Lịch dạy & điểm danh', icon: CalendarDays, desc: 'Lịch tuần mọi lớp, chuyên cần, trùng phòng, dự giờ' },
      { to: '/head/assignments', label: 'Bài tập các lớp', icon: ClipboardList, desc: 'Bài giáo viên đã giao, tỉ lệ nộp, bài chờ chấm' },
      { to: '/head/results', label: 'Kết quả của học viên', icon: Trophy, desc: 'Điểm thi thử, luyện Part, bài kiểm tra' },
      { to: '/head/class-content', label: 'Tài liệu & bảng tin lớp', icon: FolderOpen, desc: 'Tài liệu giáo viên tải lên, bài đăng bảng tin' },
    ],
  },
  { label: 'Luyện tập', icon: FileText, children: PRACTICE_LINKS },
  {
    label: 'Thẩm định',
    icon: ShieldCheck,
    badge: quality,
    children: [
      { to: '/head/approvals', label: 'Phê duyệt học liệu', icon: CheckSquare, desc: 'Đề thi, câu hỏi, bài giảng giáo viên gửi lên', badge: pending },
      { to: '/head/grading-review', label: 'Kiểm định chấm bài', icon: Scale, desc: 'Chấm lại bài Viết, Nói giáo viên đã chấm', badge: toReview },
      { to: '/head/complaints', label: 'Khiếu nại & phúc khảo', icon: MessageSquareWarning, desc: 'Học viên khiếu nại đáp án, xin chấm lại', badge: openComplaints },
      { to: '/head/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Câu hỏi đã thẩm định theo môn, theo Part' },
    ],
  },
  { to: '/head/reports', label: 'Báo cáo' },
];

/** Ngăn kéo (điện thoại), thanh đáy (4 mục đầu) và footer */
const buildGroups = ({ pending, openComplaints, toReview }: Counts): NavGroup[] => [
  {
    title: 'Bộ môn',
    items: [
      { to: '/head/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/head/courses', label: 'Khoá học & Lớp', icon: PlayCircle },
      { to: '/head/teachers', label: 'Giáo viên', icon: Users },
      { to: '/head/approvals', label: 'Phê duyệt', icon: CheckSquare, badge: pending },
      { to: '/head/students', label: 'Học viên', icon: GraduationCap },
      { to: '/head/subjects', label: 'Môn học', icon: Library },
    ],
  },
  {
    title: 'Giảng dạy',
    items: [
      { to: '/head/schedule', label: 'Lịch dạy & điểm danh', icon: CalendarDays },
      { to: '/head/assignments', label: 'Bài tập các lớp', icon: ClipboardList },
      { to: '/head/results', label: 'Kết quả của học viên', icon: Trophy },
      { to: '/head/class-content', label: 'Tài liệu & bảng tin lớp', icon: FolderOpen },
    ],
  },
  { title: 'Khoá học & Lớp', items: [...COURSE_LINKS.map(({ to, label, icon }) => ({ to, label, icon })), { to: '/head/classes', label: 'Tất cả lớp', icon: School }] },
  { title: 'Luyện tập', items: PRACTICE_LINKS.map(({ to, label, icon }) => ({ to, label, icon })) },
  {
    title: 'Thẩm định',
    items: [
      { to: '/head/grading-review', label: 'Kiểm định chấm bài', icon: Scale, badge: toReview },
      { to: '/head/complaints', label: 'Khiếu nại & phúc khảo', icon: MessageSquareWarning, badge: openComplaints },
      { to: '/head/question-bank', label: 'Ngân hàng câu hỏi', icon: Database },
      { to: '/head/reports', label: 'Báo cáo tổng kết', icon: BarChart3 },
    ],
  },
];

export const HeadTeacherLayout: React.FC = () => {
  const dash = useHeadDashboard().data;
  const students = useHeadStudents().data;
  const subjects = useHeadSubjects().data;
  const c: Counts = {
    pending: badge(dash?.pendingApprovals),
    openComplaints: badge(dash?.newComplaints),
    toReview: badge(dash?.pendingReviews),
    quality: badge((dash?.pendingApprovals ?? 0) + (dash?.pendingReviews ?? 0) + (dash?.newComplaints ?? 0)),
    riskStudents: students?.filter((s) => s.status === 'RISK').length ?? 0,
    subjects: subjects?.length ?? 0,
    teachers: dash?.teachersCount ?? 0,
    classes: dash?.classesCount ?? 0,
  };
  const MENUS = buildMenus(c);
  const GROUPS = buildGroups(c);
  return (
  <AppShell groups={GROUPS} brandTagline="Trưởng bộ môn" headerLabel="Khu vực Trưởng bộ môn" accent="amber" settingsTo="/head/settings" profileTo="/head/settings" notificationsTo="/head/notifications" workspace headerNav={<StaffNav menus={MENUS} label="Menu trưởng bộ môn" />} />
  );
};
