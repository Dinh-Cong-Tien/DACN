import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, ExternalLink, Plus, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { useLibCourses, useSessions, useTeacherClasses, type LibCourse, type TClassRoom } from '@/shared/api/teacher';
import { addDays, isoDate } from '@/shared/constants/teacher';
import { CLASS_TRACKS } from '@/shared/constants/staff';
import type { AssignmentTarget, CourseTrack } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Meter, TBtn, TPageHead, tbl } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';
import { OpenClassDialog } from '../components/OpenClassDialog';

const TITLE: Record<CourseTrack, string> = { TOEIC: 'Khoá học TOEIC', VSTEP: 'Khoá học VSTEP', THPT: 'Tiếng Anh THPT' };

/**
 * Khoá học & Lớp của giáo viên — đúng trình tự: Mục (TOEIC / VSTEP / THPT) → Khoá học → các lớp của khoá → vào lớp.
 * Một khoá có nhiều lớp (Lớp 1, Lớp 2… cùng nội dung, khác lịch học); bài giảng, tiến độ, giao bài nằm trong từng lớp.
 * ?muc=toeic|vstep|thpt chọn mục, ?open=<courseId> cuộn tới khoá.
 */
export const TeacherCoursesPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const raw = (params.get('muc') ?? '').toUpperCase();
  const track: CourseTrack = raw in TITLE ? (raw as CourseTrack) : 'TOEIC';
  useDocumentTitle(TITLE[track]);
  const navigate = useNavigate();
  const coursesQ = useLibCourses();
  const classesQ = useTeacherClasses();
  const today = isoDate(new Date());
  const upcoming = useSessions({ from: today, to: isoDate(addDays(new Date(), 28)) }).data ?? [];
  const [openFor, setOpenFor] = useState<string | null>(null);

  const all = coursesQ.data ?? [];
  const classes = classesQ.data ?? [];
  const courses = all.filter((c) => c.track === track);
  const classesOf = (c: LibCourse) => classes.filter((x) => x.course?.id === c.id);
  const mine = classes.filter((x) => courses.some((c) => c.id === x.course?.id));

  // mở từ chi tiết lớp / tìm kiếm: cuộn tới khoá
  const focus = params.get('open');
  useEffect(() => {
    if (!focus || !courses.length) return;
    const c = all.find((x) => x.id === focus);
    if (c && c.track !== track) setParams({ muc: (c.track ?? 'TOEIC').toLowerCase(), open: focus }, { replace: true });
    else requestAnimationFrame(() => document.getElementById(`course-${focus}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }, [focus, courses.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const assign = (target: AssignmentTarget, classId?: string) => navigate('/teacher/assignments', { state: { assign: target, classId } });
  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    toast.success('Đã sao chép mã mời', `Gửi mã ${code} cho học viên để tham gia lớp.`);
  };
  const nextOf = (x: TClassRoom) => upcoming.filter((s) => s.classId === x.id && s.status === 'UPCOMING').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];

  if (coursesQ.isLoading || classesQ.isLoading) return <TLoading />;
  if (coursesQ.error) return <TError error={coursesQ.error} onRetry={() => coursesQ.refetch()} />;

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Khoá học & Lớp' }, { label: TITLE[track] }]}
        title={TITLE[track]}
        sub={`${courses.length} khoá · ${mine.length} lớp bạn đang dạy.`}
        actions={
          <>
            <TBtn to="/teacher/classes" icon={<Users />}>
              Tất cả lớp
            </TBtn>
            <TBtn variant="primary" icon={<Plus />} onClick={() => setOpenFor('')}>
              Mở lớp
            </TBtn>
          </>
        }
      />

      <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-0.5" role="tablist" aria-label="Mục khoá học">
        {CLASS_TRACKS.map((t) => {
          const on = t.key === track;
          return (
            <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => setParams({ muc: t.key.toLowerCase() }, { replace: true })} className={cn('rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors', on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
              {TITLE[t.key]} <span className={cn('ml-0.5 tabular-nums text-[11px]', on ? 'text-white/70' : 'text-slate-400')}>{all.filter((c) => c.track === t.key).length}</span>
            </button>
          );
        })}
      </div>

      {courses.length === 0 && <TEmpty title="Mục này chưa có khoá học nào được xuất bản" />}

      {courses.map((c, i) => {
        const list = classesOf(c);
        const students = list.reduce((t, x) => t + x.studentsCount, 0);
        return (
          <section key={c.id} id={`course-${c.id}`} className={cn('scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)]', focus === c.id ? 'border-indigo-300' : 'border-slate-200/80')}>
            {/* 1. Khoá học */}
            <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[13px] font-semibold tabular-nums text-slate-600">{i + 1}</span>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-semibold text-slate-900">{c.title}</h2>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {[c.trackGroup, c.level, `${c.lessonsCount} bài`, `${list.length} lớp`, `${students} học viên`].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a href={`/courses/${c.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-600 hover:text-slate-900">
                  Xem như học viên <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <TBtn size="sm" variant="primary" icon={<Plus />} onClick={() => setOpenFor(c.slug)}>
                  Mở lớp
                </TBtn>
              </div>
            </header>

            {/* 2. Các lớp của khoá */}
            <div className="px-5 pb-2 pt-4">
              <p className="mb-2 text-[13px] text-slate-500">Các lớp cùng học đủ {c.lessonsCount} bài của khoá, chỉ khác lịch học. Vào lớp để xem bài giảng, tiến độ từng học viên, giao bài, điểm danh.</p>
              {list.length === 0 ? (
                <div className="mb-3 rounded-lg border border-dashed border-slate-300 px-4 py-5 text-center">
                  <p className="text-sm text-slate-600">Chưa có lớp nào học khoá này.</p>
                  <button type="button" onClick={() => setOpenFor(c.slug)} className="mt-1 text-[13px] font-medium text-indigo-700 hover:underline">
                    Mở lớp đầu tiên cho khoá
                  </button>
                </div>
              ) : (
                <div className="mb-3 overflow-x-auto rounded-lg border border-slate-200">
                  <table className={tbl.table}>
                    <thead className={tbl.thead}>
                      <tr>
                        <th className={tbl.th}>Lớp</th>
                        <th className={tbl.th}>Lịch học</th>
                        <th className={cn(tbl.th, 'text-right')}>Học viên</th>
                        <th className={tbl.th}>Tiến độ khoá</th>
                        <th className={tbl.th}>Buổi tới</th>
                        <th className={tbl.th}>Mã mời</th>
                        <th className={tbl.th} />
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((x) => {
                        const next = nextOf(x);
                        return (
                          <tr key={x.id} className={tbl.tr}>
                            <td className={cn(tbl.td, 'whitespace-nowrap')}>
                              <Link to={`/teacher/classes/${x.id}`} className="font-medium text-slate-900 hover:text-indigo-700">
                                {x.name.split(' · ').pop()}
                              </Link>
                            </td>
                            <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>
                              {x.schedule || 'Chưa có lịch'}
                              {x.room ? ` · ${x.room}` : ''}
                            </td>
                            <td className={cn(tbl.td, 'text-right tabular-nums')}>{x.studentsCount}</td>
                            <td className={cn(tbl.td, 'min-w-[150px]')}>
                              <span className="flex items-center gap-2">
                                <Meter value={x.courseProgressPct ?? 0} className="flex-1" />
                                <span className="w-9 text-right text-[13px] tabular-nums text-slate-700">{x.courseProgressPct ?? 0}%</span>
                              </span>
                            </td>
                            <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{next ? `${next.date.slice(8, 10)}/${next.date.slice(5, 7)} · ${next.start}` : '—'}</td>
                            <td className={tbl.td}>
                              <button type="button" onClick={() => copy(x.code)} title="Sao chép mã mời" className="inline-flex items-center gap-1 font-mono text-[13px] text-slate-600 hover:text-indigo-700">
                                {x.code} <Copy className="h-3 w-3 text-slate-400" />
                              </button>
                            </td>
                            <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                              <TBtn size="sm" variant="ghost" onClick={() => assign({ kind: 'LESSON', courseId: c.slug, lessonIds: [] }, x.id)}>
                                Giao bài
                              </TBtn>
                              <TBtn size="sm" to={`/teacher/classes/${x.id}`}>
                                Vào lớp
                              </TBtn>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </section>
        );
      })}

      <OpenClassDialog open={openFor !== null} course={openFor || undefined} onClose={() => setOpenFor(null)} />
    </div>
  );
};
