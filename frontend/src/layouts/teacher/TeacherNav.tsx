import React, { useMemo } from 'react';
import { BarChart3, Briefcase, Calculator, CalendarDays, ClipboardCheck, ClipboardList, Database, FileEdit, FileText, FolderOpen, GraduationCap, Languages, Plus, Presentation, Sheet, UserRoundX, Users } from 'lucide-react';
import { useGradingQueue, useTeacherAssignments, useTeacherClasses, type TClassRoom } from '@/shared/api/teacher';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';


/**
 * Menu header giáo viên theo quy trình dạy học: lớp → lịch dạy, điểm danh → giao bài → chấm bài → theo dõi học viên, bảng điểm → học liệu.
 */
export const buildTeacherMenus = (classes: TClassRoom[], toGrade: number, drafts: number): StaffMenu[] => [
  { to: '/teacher/dashboard', label: 'Tổng quan' },
  {
    label: 'Lớp học',
    to: '/teacher/classes',
    children: [
      { to: '/teacher/classes', label: 'Tất cả lớp', icon: Users, desc: 'Mã mời, lịch học, sĩ số, tạo lớp mới', exact: true },
      ...classes.map((c) => ({ to: `/teacher/classes/${c.id}`, label: c.name, icon: c.examType === 'TOEIC' ? Briefcase : GraduationCap, desc: `${c.schedule || 'Chưa có lịch'} · ${c.studentsCount} học viên`, group: 'Lớp đang dạy' })),
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
  { to: '/teacher/grading', label: 'Chấm bài', badge: toGrade ? String(toGrade) : undefined },
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
      { to: '/teacher/library/courses', label: 'Khoá học & bài giảng', icon: Presentation, desc: 'Giao từng bài giảng theo lộ trình' },
      { to: '/teacher/library/tests', label: 'Ngân hàng đề', icon: FileText, desc: 'Thi thử TOEIC, VSTEP · đề Viết, đề Nói' },
      { to: '/teacher/library/practice', label: 'Ngữ pháp & Từ vựng', icon: Languages, desc: 'Chủ điểm ngữ pháp, bộ flashcard' },
      { to: '/teacher/materials', label: 'Tài liệu lớp', icon: FolderOpen, desc: 'Slide, audio, bài mẫu của riêng lớp' },
      { to: '/score-converter', label: 'Quy đổi điểm', icon: Calculator, desc: 'TOEIC ↔ VSTEP ↔ CEFR', group: 'Tra cứu' },
      { to: '/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Câu hỏi theo từng Part, có giải thích', group: 'Tra cứu' },
    ],
  },
];

/** Số bài chờ chấm (badge menu Chấm bài, thanh đáy) */
export const usePendingGradingCount = () => useGradingQueue('pending').data?.length ?? 0;

export const TeacherNav: React.FC = () => {
  const classes = useTeacherClasses().data;
  const toGrade = usePendingGradingCount();
  const drafts = useTeacherAssignments({ status: 'DRAFT' }).data?.length ?? 0;
  const menus = useMemo(() => buildTeacherMenus(classes ?? [], toGrade, drafts), [classes, toGrade, drafts]);
  return <StaffNav menus={menus} label="Menu giáo viên" />;
};
