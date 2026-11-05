import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Plus, Copy, Search, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useArchivedClasses, useLibCourses, useSessions, useTeacherClasses, useTeacherMutation, type TClassRoom } from '@/shared/api/teacher';
import { addDays, isoDate } from '@/shared/constants/teacher';
import type { CourseTrack } from '@/shared/types';
import { Input, Modal, Select } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { Meter, Panel, TBtn, TPageHead, TTabs, inputCls } from '../components/TeacherKit';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { TError, TLoading } from '../components/TeacherState';
import { CLASS_TRACKS, classTrack, classTrackLabel, courseOptions, distinctStudents } from '@/shared/constants/staff';

const EMPTY_FORM = { name: '', course: '', schedule: '', room: '' };

/**
 * Lớp học của giáo viên — lớp nằm trong khoá học: danh sách nhóm theo khoá, mở lớp phải chọn khoá
 * (học viên vào lớp được ghi danh khoá đó). ?muc= lọc theo mục, ?new=1&course=<slug> mở sẵn hộp mở lớp cho khoá.
 */
export const TeacherClassesPage: React.FC = () => {
  useDocumentTitle('Lớp học của tôi');
  const { data: classes = [], isLoading, error: loadError, refetch } = useTeacherClasses();
  const courses = useLibCourses().data ?? [];
  const today = isoDate(new Date());
  const upcoming = useSessions({ from: today, to: isoDate(addDays(new Date(), 28)) }).data ?? [];
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const createClass = useTeacherMutation(teacherApi.createClass);
  const [view, setView] = useState<'active' | 'archived'>('active');
  const archivedQ = useArchivedClasses(view === 'archived');
  const reopen = useTeacherMutation((id: string) => teacherApi.archiveClass(id, false));
  const shown = view === 'archived' ? (archivedQ.data ?? []) : classes;

  const [params, setParams] = useSearchParams();
  const muc = params.get('muc')?.toUpperCase() as CourseTrack | undefined;
  const list = shown.filter((c) => (!muc || classTrack(c) === muc) && (c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())));

  // mở từ khoá học: "Mở lớp cho khoá này"
  useEffect(() => {
    if (params.get('new') !== '1') return;
    setForm({ ...EMPTY_FORM, course: params.get('course') ?? '' });
    setOpen(true);
    const next = new URLSearchParams(params);
    next.delete('new');
    next.delete('course');
    setParams(next, { replace: true });
  }, [params, setParams]);

  /** Nhóm lớp theo khoá học, khoá xếp theo mục rồi thứ tự trong mục như trang Khoá học */
  const groups = useMemo(() => {
    const order = (c: TClassRoom) => {
      const i = courses.findIndex((x) => x.id === c.course?.id);
      return i < 0 ? 9999 : i;
    };
    const map = new Map<string, TClassRoom[]>();
    [...list].sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name)).forEach((c) => map.set(c.course?.id ?? '', [...(map.get(c.course?.id ?? '') ?? []), c]));
    return [...map.entries()].map(([id, items]) => ({ id, course: items[0].course, items }));
  }, [list, courses]);

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    toast.success('Đã sao chép mã mời', `Gửi mã ${code} cho học viên để tham gia lớp.`);
  };

  const openCreate = (course = '') => {
    setForm({ ...EMPTY_FORM, course });
    setError('');
    setOpen(true);
  };

  const create = () => {
    if (form.name.trim().length < 2) return setError('Vui lòng nhập tên lớp');
    if (!form.course) return setError('Chọn khoá học của lớp');
    createClass.mutate(
      { name: form.name.trim(), courseId: form.course, schedule: form.schedule.trim() || null, room: form.room.trim() || null },
      {
        onSuccess: (c) => {
          setOpen(false);
          setForm(EMPTY_FORM);
          setError('');
          toast.success('Đã mở lớp mới', `${c.course?.title ?? ''} · mã mời ${c.code}`);
        },
        onError: (e) => setError(errorMessage(e)),
      }
    );
  };

  if (isLoading) return <TLoading />;
  if (loadError) return <TError error={loadError} onRetry={() => refetch()} />;

  const card = (c: TClassRoom) => {
    const next = upcoming.filter((s) => s.classId === c.id && s.status === 'UPCOMING').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];
    return (
      <article key={c.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.15)] transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(16,24,40,0.4)]">
        <Link to={`/teacher/classes/${c.id}`} className="relative block">
          <Img src={c.coverUrl ?? PHOTOS.classroom} alt={c.name} ratio="video" fallbackClass="bg-slate-200" className="transition-transform duration-500 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
          <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-800 backdrop-blur">{classTrackLabel(c)}</span>
          <div className="absolute inset-x-4 bottom-3 text-white">
            <h3 className="font-display text-xl font-extrabold leading-tight">{c.name}</h3>
            <p className="mt-0.5 text-[13px] text-slate-200">
              {c.schedule || 'Chưa có lịch'}
              {c.room ? ` · ${c.room}` : ''}
            </p>
          </div>
        </Link>
        <div className="flex flex-1 flex-col p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              [c.studentsCount, 'Học viên'],
              [c.avgScore || '—', 'Điểm TB'],
              [c.attendanceMarks ? `${c.attendanceRate}%` : '—', 'Chuyên cần'],
            ].map(([v, l]) => (
              <div key={l as string} className="rounded-xl bg-slate-50 py-2">
                <p className="font-display text-lg font-bold tabular-nums text-slate-900">{v}</p>
                <p className="text-[11px] text-slate-500">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[13px]">
            <span className="w-28 shrink-0 text-slate-500">Hoàn thành bài</span>
            <Meter value={c.completionRate} className="flex-1" />
            <span className="w-10 text-right tabular-nums text-slate-700">{c.completionRate}%</span>
          </div>
          <p className="mt-3 text-[13px] text-slate-600">{next ? `Buổi tới: ${next.date.slice(8, 10)}/${next.date.slice(5, 7)} lúc ${next.start}${next.topic ? ` · ${next.topic}` : ''}` : 'Chưa có buổi sắp tới'}</p>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <button type="button" onClick={() => copy(c.code)} title="Sao chép mã mời" className="group/code inline-flex items-center gap-1.5 font-mono text-[13px] text-slate-600 hover:text-indigo-700">
              {c.code}
              <Copy className="h-3.5 w-3.5 text-slate-400 group-hover/code:text-indigo-600" />
            </button>
            {view === 'archived' ? (
              <TBtn size="sm" disabled={reopen.isPending} onClick={() => reopen.mutate(c.id, { onSuccess: () => toast.success('Đã mở lại lớp', c.name), onError: (e) => toast.error('Không mở lại được lớp', errorMessage(e)) })}>
                Mở lại lớp
              </TBtn>
            ) : (
              <TBtn size="sm" variant="primary" to={`/teacher/classes/${c.id}`}>
                Vào lớp
              </TBtn>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Khoá học & Lớp"
        title="Lớp học của tôi"
        sub="Mỗi lớp thuộc một khoá học: học viên vào lớp được ghi danh khoá đó, giáo viên theo dõi tiến độ khoá, giao bài, điểm danh trong lớp."
        actions={
          <TBtn variant="primary" icon={<Plus />} onClick={() => openCreate()}>
            Mở lớp
          </TBtn>
        }
      />

      <TTabs
        value={view}
        onChange={(k) => setView(k as 'active' | 'archived')}
        items={[
          { key: 'active', label: 'Đang dạy', count: classes.length },
          { key: 'archived', label: 'Đã lưu trữ', ...(archivedQ.data ? { count: archivedQ.data.length } : {}) },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-0.5" role="tablist" aria-label="Mục khoá học">
            {[{ key: '', label: 'Tất cả' }, ...CLASS_TRACKS].map((t) => {
              const on = (muc ?? '') === t.key;
              const n = t.key ? shown.filter((c) => classTrack(c) === t.key).length : shown.length;
              return (
                <button key={t.key || 'all'} type="button" role="tab" aria-selected={on} onClick={() => setParams(t.key ? { muc: t.key.toLowerCase() } : {}, { replace: true })} className={cn('rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors', on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                  {t.label} <span className={cn('ml-0.5 tabular-nums text-[11px]', on ? 'text-white/70' : 'text-slate-400')}>{n}</span>
                </button>
              );
            })}
          </div>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã lớp" className={cn(inputCls, 'w-full pl-9')} />
          </div>
        </div>
        <p className="text-[13px] text-slate-500">
          {list.length} lớp · {distinctStudents(list)} học viên
        </p>
      </div>

      {list.length === 0 ? (
        <Panel>
          <div className="py-10 text-center">
            <p className="font-semibold text-slate-900">{view === 'archived' ? (archivedQ.isLoading ? 'Đang tải…' : shown.length ? 'Không tìm thấy lớp nào' : 'Chưa có lớp nào được lưu trữ') : classes.length ? 'Không tìm thấy lớp nào' : 'Bạn chưa có lớp nào'}</p>
            <p className="mt-1 text-sm text-slate-500">{view === 'archived' ? 'Lớp đã kết thúc có thể lưu trữ trong mục “Sửa lớp” để gọn danh sách.' : classes.length ? 'Thử tìm bằng mã lớp, hoặc mở lớp mới.' : 'Bấm “Mở lớp”, chọn khoá học rồi gửi mã mời cho học viên.'}</p>
          </div>
        </Panel>
      ) : (
        groups.map((g) => (
          <section key={g.id || 'none'} className="space-y-3">
            <header className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
                <h2 className="truncate text-[15px] font-semibold text-slate-900">{g.course?.title ?? 'Chưa gắn khoá học'}</h2>
                <span className="shrink-0 text-[13px] text-slate-500">
                  {g.course ? `${classTrackLabel(g.items[0])}${g.course.trackGroup ? ` · ${g.course.trackGroup}` : ''} · ` : ''}
                  {g.items.length} lớp
                </span>
              </div>
              {g.course ? (
                <span className="flex items-center gap-3 text-[13px]">
                  <Link to={`/teacher/library/courses?open=${g.course.id}`} className="font-medium text-slate-600 hover:text-slate-900 hover:underline">
                    Bài trong khoá
                  </Link>
                  {view === 'active' && (
                    <button type="button" onClick={() => openCreate(g.course!.slug)} className="font-medium text-indigo-700 hover:underline">
                      + Mở lớp cho khoá này
                    </button>
                  )}
                </span>
              ) : (
                <span className="text-[13px] text-slate-500">Vào lớp › Sửa lớp để chọn khoá học</span>
              )}
            </header>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{g.items.map(card)}</div>
          </section>
        ))
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Mở lớp học"
        description="Lớp thuộc một khoá học; mã mời được tạo tự động sau khi lưu."
        icon={<Users />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={create} disabled={createClass.isPending}>
              {createClass.isPending ? 'Đang mở…' : 'Mở lớp'}
            </TBtn>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Khoá học"
            required
            placeholder="Chọn khoá học của lớp"
            options={courseOptions(courses)}
            value={form.course}
            onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
            hint="Học viên vào lớp được ghi danh khoá này; giáo viên theo dõi tiến độ khoá trong lớp"
          />
          <Input label="Tên lớp" required placeholder="VD: TOEIC 650+ K13" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={error} />
          <Input label="Lịch học" placeholder="VD: T2 – T4 – T6 · 19:00" value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} />
          <Input label="Phòng học" placeholder="VD: Phòng 302 hoặc Online" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
};
