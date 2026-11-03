import React from 'react';
import { staffPath } from '@/shared/utils';
import { TeacherLibraryPage } from '@/roles/teacher/pages/TeacherLibraryPage';

const COPY = {
  courses: { title: 'Khoá học & bài giảng', sub: 'Toàn bộ khoá học viên đang học trên hệ thống. Mở từng khoá để rà thứ tự bài giảng, xem bài như học viên thấy.' },
  tests: { title: 'Ngân hàng đề', sub: 'Đề thi thử TOEIC, VSTEP chấm tự động và đề Viết, Nói giáo viên chấm. Cột "Đã giao" cho biết đề được các lớp dùng bao nhiêu lần.' },
  practice: { title: 'Ngữ pháp & Từ vựng', sub: 'Chủ điểm ngữ pháp kèm bài tập, bộ flashcard từ vựng và bài chép chính tả học viên đang dùng, cùng số lần giáo viên đã giao cho lớp.' },
};

/** Kho học liệu ở chế độ thẩm định: cùng nội dung giáo viên và học viên đang dùng, chỉ xem, không giao bài */
export const HeadLibraryPage: React.FC = () => <TeacherLibraryPage base={staffPath('/library')} canAssign={false} copy={COPY} eyebrow="Kho học liệu" />;
