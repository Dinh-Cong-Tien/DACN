import { z } from 'zod';
import type { Class, CourseTrack, ExamType } from '@prisma/client';

/** Mục của lớp — trùng 3 mục khoá học của học viên: TOEIC / VSTEP / Tiếng Anh THPT */
export const CLASS_TRACK = z.enum(['TOEIC', 'VSTEP', 'THPT']);

/**
 * Body tạo / sửa lớp gửi `track` (mới) hoặc `examType` (cũ) → ghi cả hai cột.
 * exam_type dùng để quy đổi điểm, thống kê theo Part: lớp THPT chấm thang 10 như VSTEP.
 */
export function classTrackData(b: { track?: CourseTrack | null; examType?: ExamType | null }): { track?: CourseTrack; examType?: ExamType } {
  const track = b.track ?? b.examType ?? undefined;
  if (!track) return {};
  return { track, examType: b.examType ?? (track === 'THPT' ? 'VSTEP' : track) };
}

/** Mục hiển thị của lớp (lớp tạo trước khi có cột track → theo kỳ thi) */
export const trackOfClass = (c: Pick<Class, 'examType'> & { track?: CourseTrack | null }): CourseTrack => c.track ?? c.examType;
