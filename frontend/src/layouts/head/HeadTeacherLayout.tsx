import React from 'react';
import { LayoutDashboard, Library, Database, Users, School, CheckSquare, BarChart3, MessageSquareWarning, GraduationCap, CalendarDays, Scale, Video, FileText, BookOpen } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';
import { useHeadDashboard, useHeadStudents, useHeadSubjects } from '@/shared/api/head';

const badge = (n?: number) => (n ? String(n) : undefined);
type Counts = { pending?: string; openComplaints?: string; toReview?: string; riskStudents: number; subjects: number; teachers: number; classes: number };

/** Menu header trưởng bộ môn: quản lý bộ môn → giám sát giảng dạy → thẩm định học liệu → báo cáo */
const buildMenus = ({ pending, openComplaints, toReview, riskStudents, subjects, teachers, classes }: Counts): StaffMenu[] => [
  { to: '/head/dashboard', label: 'Tổng quan' },
  {
    label: 'Bộ môn',
    children: [
      { to: '/head/subjects', label: 'Môn học', icon: Library, desc: `${subjects} môn, giáo viên và lớp của từng môn` },
      { to: '/head/teachers', label: 'Giáo viên', icon: Users, desc: `${teachers} giáo viên, hồ sơ chuyên môn, dự giờ` },
      { to: '/head/classes', label: 'Lớp học', icon: School, desc: `${classes} lớp, phân công giáo viên, chuyên cần` },
      { to: '/head/students', label: 'Học viên', icon: GraduationCap, desc: `${riskStudents} học viên nguy cơ bỏ học cần nhắc` },
    ],
  },
  {
    label: 'Giảng dạy',
    children: [
      { to: '/head/schedule', label: 'Lịch dạy bộ môn', icon: CalendarDays, desc: 'Lịch tuần mọi lớp, trùng phòng, dự giờ' },
      { to: '/head/grading-review', label: 'Kiểm định chấm bài', icon: Scale, desc: 'Chấm lại bài Viết, Nói giáo viên đã chấm', badge: toReview },
      { to: '/head/complaints', label: 'Khiếu nại & phúc khảo', icon: MessageSquareWarning, desc: 'Học viên khiếu nại đáp án, xin chấm lại', badge: openComplaints },
    ],
  },
  {
    label: 'Học liệu',
    children: [
      { to: '/head/approvals', label: 'Phê duyệt học liệu', icon: CheckSquare, desc: 'Đề thi, câu hỏi, bài giảng giáo viên gửi lên', badge: pending },
      { to: '/head/library/courses', label: 'Khoá học & bài giảng', icon: Video, desc: 'Các khoá học viên đang học', group: 'Kho học liệu' },
      { to: '/head/library/tests', label: 'Ngân hàng đề', icon: FileText, desc: 'Thi thử TOEIC, VSTEP, đề Viết và Nói' },
      { to: '/head/library/practice', label: 'Ngữ pháp & Từ vựng', icon: BookOpen, desc: 'Chủ điểm ngữ pháp, bộ flashcard' },
      { to: '/head/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Câu hỏi đã thẩm định theo môn, theo Part', group: 'Câu hỏi' },
    ],
  },
  { to: '/head/reports', label: 'Báo cáo' },
];

/** Ngăn kéo (điện thoại), thanh đáy và footer */
const buildGroups = ({ pending, openComplaints, toReview }: Counts): NavGroup[] => [
  {
    title: 'Bộ môn',
    items: [
      { to: '/head/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/head/classes', label: 'Lớp học', icon: School },
      { to: '/head/teachers', label: 'Giáo viên', icon: Users },
      { to: '/head/students', label: 'Học viên', icon: GraduationCap },
      { to: '/head/subjects', label: 'Môn học', icon: Library },
    ],
  },
  {
    title: 'Giảng dạy',
    items: [
      { to: '/head/schedule', label: 'Lịch dạy bộ môn', icon: CalendarDays },
      { to: '/head/grading-review', label: 'Kiểm định chấm bài', icon: Scale, badge: toReview },
      { to: '/head/complaints', label: 'Khiếu nại & phúc khảo', icon: MessageSquareWarning, badge: openComplaints },
      { to: '/head/reports', label: 'Báo cáo tổng kết', icon: BarChart3 },
    ],
  },
  {
    title: 'Học liệu',
    items: [
      { to: '/head/approvals', label: 'Phê duyệt học liệu', icon: CheckSquare, badge: pending },
      { to: '/head/library/courses', label: 'Khoá học & bài giảng', icon: Video },
      { to: '/head/library/tests', label: 'Ngân hàng đề', icon: FileText },
      { to: '/head/library/practice', label: 'Ngữ pháp & Từ vựng', icon: BookOpen },
      { to: '/head/question-bank', label: 'Ngân hàng câu hỏi', icon: Database },
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
