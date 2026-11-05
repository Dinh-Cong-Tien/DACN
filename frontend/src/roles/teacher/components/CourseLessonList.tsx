import React from 'react';
import type { LibCourse } from '@/shared/api/teacher';

export const LESSON_TYPE: Record<string, string> = { VIDEO: 'Video', READING: 'Bài giảng', QUIZ: 'Luyện đề', CHECKPOINT: 'Kiểm tra chặng' };
/** Bài tập sau bài: "8 câu · đạt 70%" */
const exerciseNote = (l: { exercisesCount?: number; passScorePct?: number }) => (l.exercisesCount ? `${l.exercisesCount} câu · đạt ${l.passScorePct ?? 70}%` : '—');

/**
 * Bài giảng của khoá theo đúng thứ tự học viên học (chương → bài), kèm loại bài, số câu bài tập, thời lượng.
 * Có `onToggle` → tích chọn bài để giao cho lớp.
 */
export const CourseLessonList: React.FC<{ course: LibCourse; picked?: string[]; onToggle?: (lessonId: string) => void }> = ({ course, picked = [], onToggle }) => {
  const lessons = course.sections.flatMap((s) => s.lessons);
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      {course.sections.map((sec) => (
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
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
};
