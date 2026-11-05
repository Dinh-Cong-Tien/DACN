import React, { useMemo } from 'react';
import {
  BarChart3, BookMarked, BookOpen, Briefcase, CalendarDays, ClipboardCheck, ClipboardList, Database, FileEdit, FileText, FolderOpen, GraduationCap, Headphones, Mic, PenLine,
  PenTool, PlayCircle, Plus, School, Sheet, UserRoundX, Users,
} from 'lucide-react';
import { useGradingQueue, useTeacherAssignments, useTeacherClasses, type TClassRoom } from '@/shared/api/teacher';
import { StaffNav, type StaffMenu } from '@/shared/components/layout/StaffNav';
import { CLASS_TRACKS, classTrack } from '@/shared/constants/staff';
import type { CourseTrack } from '@/shared/types';

/** Icon mục — trùng menu Khoá học của học viên */
const TRACK_ICON: Record<CourseTrack, typeof Briefcase> = { TOEIC: Briefcase, VSTEP: GraduationCap, THPT: School };

/**
 * Menu header giáo viên.
 *  - Lớp học → Khoá học → Thi thử & Luyện tập → Bài tập → Học viên → Soạn học liệu
 *  - "Khoá học" và "Thi thử & Luyện tập" bám đúng menu học viên (3 mục khoá TOEIC / VSTEP / THPT; đề thi thử, Viết, Nói,
 *    ngữ pháp, từ vựng, chép chính tả) để giáo viên tìm đúng thứ học viên đang học rồi giao cho lớp.
 */
export const buildTeacherMenus = (classes: TClassRoom[], toGrade: number, drafts: number): StaffMenu[] => [
  { to: '/teacher/dashboard', label: 'Tổng quan' },
  {
    label: 'Lớp học',
    to: '/teacher/classes',
    children: [
      { to: '/teacher/classes', label: 'Tất cả lớp', icon: Users, desc: 'Mã mời, sĩ số, tạo lớp mới', exact: true, group: 'Quản lý lớp' },
      { to: '/teacher/schedule', label: 'Lịch dạy', icon: CalendarDays, desc: 'Buổi dạy trong tuần, phòng học, giáo án', group: 'Quản lý lớp' },
      { to: '/teacher/attendance', label: 'Điểm danh', icon: ClipboardCheck, desc: 'Điểm danh buổi hôm nay, sổ điểm danh cả khoá', group: 'Quản lý lớp' },
      // lớp đang dạy chia đúng 3 mục như Khoá học của học viên; mục chưa có lớp thì ẩn
      ...CLASS_TRACKS.flatMap((t) =>
        classes
          .filter((c) => classTrack(c) === t.key)
          .map((c) => ({ to: `/teacher/classes/${c.id}`, label: c.name, icon: TRACK_ICON[t.key], desc: `${c.schedule || 'Chưa có lịch'} · ${c.studentsCount} học viên`, group: t.key === 'THPT' ? 'Lớp Tiếng Anh THPT' : `Lớp ${t.label}` }))
      ),
    ],
  },
  {
    label: 'Khoá học',
    icon: PlayCircle,
    to: '/teacher/library/courses',
    children: [
      { to: '/teacher/library/courses?muc=toeic', label: 'Khoá học TOEIC', icon: Briefcase, desc: 'Nền tảng, Listening Part 1–4, Reading Part 5–7' },
      { to: '/teacher/library/courses?muc=vstep', label: 'Khoá học VSTEP', icon: GraduationCap, desc: 'Nền tảng, Nghe, Đọc, Viết, Nói' },
      { to: '/teacher/library/courses?muc=thpt', label: 'Tiếng Anh THPT', icon: School, desc: 'Lớp 10, 11, 12 theo SGK Global Success' },
    ],
  },
  {
    label: 'Thi thử & Luyện tập',
    icon: FileText,
    children: [
      { to: '/teacher/library/tests?tab=TOEIC', label: 'Đề thi thử TOEIC', icon: FileText, desc: 'Full đề hoặc từng Part, chấm tự động', group: 'Đề thi thử' },
      { to: '/teacher/library/tests?tab=VSTEP', label: 'Đề thi thử VSTEP', icon: FileText, desc: 'Nghe, Đọc chấm tự động', group: 'Đề thi thử' },
      { to: '/teacher/library/tests?tab=writing', label: 'Đề Viết', icon: PenLine, desc: 'Học viên nộp bài, giáo viên chấm theo tiêu chí', group: 'Viết & Nói' },
      { to: '/teacher/library/tests?tab=speaking', label: 'Đề Nói', icon: Mic, desc: 'Học viên ghi âm, giáo viên nhận xét', group: 'Viết & Nói' },
      { to: '/teacher/library/practice?tab=grammar', label: 'Chủ điểm ngữ pháp', icon: BookMarked, desc: 'Lý thuyết kèm bài tập chấm tự động', group: 'Luyện tập' },
      { to: '/teacher/library/practice?tab=vocab', label: 'Từ vựng & Flashcard', icon: BookOpen, desc: 'Bộ từ theo chủ đề TOEIC, VSTEP', group: 'Luyện tập' },
      { to: '/teacher/library/practice?tab=dictation', label: 'Nghe chép chính tả', icon: Headphones, desc: 'Chấm theo % chép đúng', group: 'Luyện tập' },
    ],
  },
  {
    label: 'Bài tập',
    to: '/teacher/assignments',
    badge: toGrade ? String(toGrade) : undefined,
    children: [
      { to: '/teacher/assignments?new=1', label: 'Giao bài mới', icon: Plus, desc: 'Chọn lớp, nội dung, hạn nộp' },
      { to: '/teacher/assignments', label: 'Bài đã giao', icon: ClipboardList, desc: 'Hạn nộp, số bài đã nộp, điểm trung bình' },
      { to: '/teacher/assignments?status=DRAFT', label: 'Bản nháp', icon: FileEdit, desc: 'Bài đã soạn, chưa gửi học viên', badge: drafts ? String(drafts) : undefined },
      { to: '/teacher/grading', label: 'Chấm bài', icon: PenTool, desc: 'Bài Viết, Nói học viên đã nộp', badge: toGrade ? String(toGrade) : undefined, also: ['/teacher/grading'] },
    ],
  },
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
    label: 'Soạn học liệu',
    icon: FileEdit,
    children: [
      { to: '/teacher/authoring', label: 'Câu hỏi & đề tự soạn', icon: FileEdit, desc: 'Soạn câu hỏi, đề kiểm tra · gửi duyệt' },
      { to: '/teacher/question-bank', label: 'Ngân hàng câu hỏi', icon: Database, desc: 'Tra cứu theo Part · nhập đề từ file Word' },
      { to: '/teacher/materials', label: 'Tài liệu lớp', icon: FolderOpen, desc: 'Slide, audio, bài mẫu của riêng lớp' },
    ],
  },
];

/** Số bài chờ chấm (badge menu Bài tập / Chấm bài, thanh đáy) */
export const usePendingGradingCount = () => useGradingQueue('pending').data?.length ?? 0;

export const TeacherNav: React.FC = () => {
  const classes = useTeacherClasses().data;
  const toGrade = usePendingGradingCount();
  const drafts = useTeacherAssignments({ status: 'DRAFT' }).data?.length ?? 0;
  const menus = useMemo(() => buildTeacherMenus(classes ?? [], toGrade, drafts), [classes, toGrade, drafts]);
  return <StaffNav menus={menus} label="Menu giáo viên" />;
};

