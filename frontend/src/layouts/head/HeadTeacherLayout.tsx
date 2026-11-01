import React from 'react';
import { LayoutDashboard, Library, Database, Users, School, CheckSquare, BarChart3, MessageSquareWarning } from 'lucide-react';
import { AppShell, NavGroup } from '@/shared/components/layout/AppShell';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';
import { MOCK_APPROVALS, MOCK_COMPLAINTS, MOCK_SUBJECTS, MOCK_TEACHERS } from '@/shared/mocks';

const pending = String(MOCK_APPROVALS.filter((a) => a.status === 'PENDING').length);
const openComplaints = String(MOCK_COMPLAINTS.filter((c) => c.status !== 'RESOLVED').length);

/** Menu header trưởng bộ môn: quản lý bộ môn → thẩm định học liệu → xử lý khiếu nại → báo cáo */
const MENUS: StaffMenu[] = [
  { to: '/head/dashboard', label: 'Tổng quan' },
  {
    label: 'Bộ môn',
    children: [
      { to: '/head/subjects', label: 'Môn học', icon: Library, desc: `${MOCK_SUBJECTS.length} môn, giáo viên và lớp của từng môn` },
      { to: '/head/teachers', label: 'Giáo viên', icon: Users, desc: `${MOCK_TEACHERS.length} giáo viên, số lớp và điểm TB lớp` },
      { to: '/head/classes', label: 'Lớp học', icon: School, desc: 'Sĩ số, điểm TB, tỷ lệ hoàn thành từng lớp' },
    ],
  },
  {
    label: 'Học liệu',
    children: [
      { to: '/head/approvals', label: 'Phê duyệt học liệu', icon: CheckSquare, desc: 'Đề thi, câu hỏi, bài giảng giáo viên gửi lên', badge: pending },
      { to: '/head/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Câu hỏi đã thẩm định theo môn, theo Part' },
    ],
  },
  { to: '/head/complaints', label: 'Khiếu nại', badge: openComplaints },
  { to: '/head/reports', label: 'Báo cáo' },
];

const GROUPS: NavGroup[] = [
  {
    title: 'Bộ môn',
    items: [
      { to: '/head/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/head/subjects', label: 'Môn học', icon: Library },
      { to: '/head/teachers', label: 'Giáo viên', icon: Users },
      { to: '/head/classes', label: 'Lớp học', icon: School },
      { to: '/head/question-bank', label: 'Ngân hàng câu hỏi', icon: Database },
    ],
  },
  {
    title: 'Chuyên môn',
    items: [
      { to: '/head/approvals', label: 'Phê duyệt học liệu', icon: CheckSquare, badge: pending },
      { to: '/head/reports', label: 'Báo cáo tổng kết', icon: BarChart3 },
      { to: '/head/complaints', label: 'Khiếu nại & Phản hồi', icon: MessageSquareWarning, badge: openComplaints },
    ],
  },
];

export const HeadTeacherLayout: React.FC = () => (
  <AppShell groups={GROUPS} brandTagline="Trưởng bộ môn" headerLabel="Khu vực Trưởng bộ môn" accent="amber" settingsTo="/head/settings" profileTo="/head/settings" notificationsTo="/head/notifications" workspace headerNav={<StaffNav menus={MENUS} label="Menu trưởng bộ môn" />} />
);
