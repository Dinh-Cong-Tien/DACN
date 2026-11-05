import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { ClassCourse, ClassCourseProgress as Progress } from '@/shared/types';
import { cn } from '@/shared/utils';
import { appLocale } from '@/shared/i18n';
import { Meter, Panel, tbl } from './TeacherKit';

const ago = (iso: string | null) => {
  if (!iso) return '—';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? 'Hôm nay' : d === 1 ? 'Hôm qua' : d < 30 ? `${d} ngày trước` : new Date(iso).toLocaleDateString(appLocale());
};

/**
 * Tiến độ khoá học của lớp (lớp nằm trong khoá): mỗi học viên học tới bài nào, % hoàn thành, điểm bài tập sau bài.
 * Dùng chung cho giáo viên và trưởng bộ môn / admin.
 */
export const ClassCourseProgressPanel: React.FC<{ course?: ClassCourse; progress?: Progress; students: { id: string; name: string }[]; courseHref?: string; action?: React.ReactNode }> = ({ course, progress, students, courseHref, action }) => {
  if (!course || !progress)
    return (
      <Panel>
        <div className="py-10 text-center">
          <p className="font-semibold text-slate-900">Lớp chưa gắn khoá học</p>
          <p className="mt-1 text-sm text-slate-500">Chọn khoá học cho lớp trong mục “Sửa lớp” để học viên học theo lộ trình của khoá và theo dõi tiến độ tại đây.</p>
        </div>
      </Panel>
    );
  const rows = progress.students.map((p) => ({ ...p, name: students.find((s) => s.id === p.studentId)?.name ?? '—' })).sort((a, b) => b.progressPct - a.progressPct || a.name.localeCompare(b.name));
  const avgPct = rows.length ? Math.round(rows.reduce((t, r) => t + r.progressPct, 0) / rows.length) : 0;
  const scored = rows.filter((r) => r.avgExercisePct !== null);
  const avgEx = scored.length ? Math.round(scored.reduce((t, r) => t + (r.avgExercisePct ?? 0), 0) / scored.length) : null;
  const notStarted = rows.filter((r) => !r.lessonsDone && !r.lastStudyAt).length;
  return (
    <Panel
      title={course.title}
      sub={`${progress.lessonsTotal} bài · lớp hoàn thành trung bình ${avgPct}%${avgEx !== null ? ` · điểm bài tập TB ${avgEx}%` : ''}${notStarted ? ` · ${notStarted} học viên chưa bắt đầu` : ''}`}
      icon={BookOpen}
      tone="indigo"
      action={
        action ?? (courseHref ? (
          <Link to={courseHref} className="text-[13px] font-medium text-indigo-700 hover:underline">
            Xem bài trong khoá
          </Link>
        ) : undefined)
      }
      flush
    >
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">Lớp chưa có học viên.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Học viên</th>
                <th className={tbl.th}>Hoàn thành</th>
                <th className={cn(tbl.th, 'text-right')}>Số bài</th>
                <th className={cn(tbl.th, 'text-right')}>Điểm bài tập</th>
                <th className={tbl.th}>Đang học</th>
                <th className={tbl.th}>Học gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.studentId} className={tbl.tr}>
                  <td className={cn(tbl.td, 'whitespace-nowrap font-medium text-slate-900')}>{r.name}</td>
                  <td className={cn(tbl.td, 'min-w-[160px]')}>
                    <span className="flex items-center gap-2">
                      <Meter value={r.progressPct} className="flex-1" />
                      <span className="w-10 text-right text-[13px] tabular-nums text-slate-700">{r.progressPct}%</span>
                    </span>
                  </td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>
                    {r.lessonsDone}/{progress.lessonsTotal}
                  </td>
                  <td className={cn(tbl.td, 'text-right tabular-nums', r.avgExercisePct !== null && r.avgExercisePct < 70 && 'text-rose-600')}>{r.avgExercisePct !== null ? `${r.avgExercisePct}%` : '—'}</td>
                  <td className={cn(tbl.td, 'max-w-[260px] truncate text-slate-600')}>{!r.lessonsDone && !r.lastStudyAt ? <span className="text-slate-400">Chưa bắt đầu</span> : r.currentLesson ?? <span className="font-medium text-emerald-700">Đã học xong khoá</span>}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-500')}>{ago(r.lastStudyAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};
