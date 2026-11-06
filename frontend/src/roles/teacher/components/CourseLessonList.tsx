import React from 'react';
import { Video } from 'lucide-react';
import { cn } from '@/shared/utils';
import type { LibCourse, LibLesson } from '@/shared/api/teacher';

export const LESSON_TYPE: Record<string, string> = { VIDEO: 'Video', READING: 'Bài giảng', QUIZ: 'Luyện đề', CHECKPOINT: 'Kiểm tra chặng' };
/** Bài tập sau bài: "8 câu · đạt 70%" */
const exerciseNote = (l: { exercisesCount?: number; passScorePct?: number }) => (l.exercisesCount ? `${l.exercisesCount} câu · đạt ${l.passScorePct ?? 70}%` : '—');

/**
 * Bài giảng của khoá theo đúng thứ tự học viên học (chương → bài), kèm loại bài, số câu bài tập, thời lượng.
 * Có `onToggle` → tích chọn bài để giao cho lớp.
 */
export const CourseLessonList: React.FC<{
  course: LibCourse;
  picked?: string[];
  onToggle?: (lessonId: string) => void;
  /** trong lớp: số học viên đã học xong từng bài / sĩ số lớp */
  stats?: { lessonId: string; done: number; avgPct: number | null }[];
  classSize?: number;
  /** có → cột Video: giáo viên đăng/đổi video bài giảng cho từng bài */
  onVideo?: (lesson: LibLesson & { no: number }) => void;
  /** chỉ hiện bài thoả điều kiện (số thứ tự bài vẫn theo cả khoá) */
  only?: (lesson: LibLesson) => boolean;
}> = ({ course, picked = [], onToggle, stats, classSize = 0, onVideo, only }) => {
  const lessons = course.sections.flatMap((s) => s.lessons);
  const sections = only ? course.sections.map((s) => ({ ...s, lessons: s.lessons.filter(only) })).filter((s) => s.lessons.length) : course.sections;
  if (!sections.length) return <p className="rounded-md border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Không có bài nào khớp bộ lọc.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      {sections.map((sec) => (
        <div key={sec.id}>
          <p className="border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-500">
            {sec.partTitle ? `${sec.partTitle} · ` : ''}
            {sec.title}
          </p>
          {sec.lessons.map((l) => {
            const on = picked.includes(l.id);
            return (
              <label key={l.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-1.5 text-sm last:border-0 hover:bg-slate-50">
                {onToggle && <input type="checkbox" checked={on} onChange={() => onToggle(l.id)} className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />}
                <span className="w-12 shrink-0 tabular-nums text-[12px] text-slate-400">Bài {lessons.indexOf(l) + 1}</span>
                <span className="min-w-0 flex-1 truncate text-slate-800">{l.title}</span>
                <span className="hidden w-20 text-[12px] text-slate-500 sm:block">{LESSON_TYPE[l.type] ?? l.type}</span>
                <span className="hidden w-28 text-right text-[12px] tabular-nums text-slate-500 md:block" title="Bài tập sau bài — học viên phải đạt mức này mới qua bài">
                  {exerciseNote(l)}
                </span>
                <span className="w-14 text-right text-[12px] tabular-nums text-slate-500">{l.durationMin} phút</span>
                {onVideo &&
                  (l.type === 'VIDEO' || l.type === 'READING' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onVideo({ ...l, no: lessons.indexOf(l) + 1 });
                      }}
                      title={l.videoUrl ? 'Đổi video bài giảng' : 'Đăng video bài giảng'}
                      className={cn('inline-flex w-24 shrink-0 items-center justify-end gap-1 text-[12px] font-medium hover:underline', l.videoUrl ? 'text-emerald-700' : 'text-indigo-700')}
                    >
                      <Video className="h-3.5 w-3.5" /> {l.videoUrl ? 'Có video' : 'Thêm video'}
                    </button>
                  ) : (
                    <span className="w-24 shrink-0" />
                  ))}
                {stats && (() => {
                  const st = stats.find((x) => x.lessonId === l.id);
                  return (
                    <span className="w-32 text-right text-[12px] tabular-nums text-slate-600" title="Học viên trong lớp đã học xong bài · điểm bài tập trung bình">
                      {st?.done ?? 0}/{classSize} xong{st?.avgPct != null ? ` · ${st.avgPct}%` : ''}
                    </span>
                  );
                })()}
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
};
