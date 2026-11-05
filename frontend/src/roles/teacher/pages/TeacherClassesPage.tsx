import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Copy, Search, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useArchivedClasses, useSessions, useTeacherClasses, useTeacherMutation } from '@/shared/api/teacher';
import { addDays, isoDate } from '@/shared/constants/teacher';
import type { CourseTrack } from '@/shared/types';
import { Input, Modal, Select } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { Meter, Panel, TBtn, TPageHead, TTabs, inputCls } from '../components/TeacherKit';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { TError, TLoading } from '../components/TeacherState';
import { CLASS_TRACKS, CLASS_TRACK_OPTIONS, classTrack, classTrackLabel, distinctStudents } from '@/shared/constants/staff';

export const TeacherClassesPage: React.FC = () => {
  useDocumentTitle('Lớp học của tôi');
  const { data: classes = [], isLoading, error: loadError, refetch } = useTeacherClasses();
  const today = isoDate(new Date());
  const upcoming = useSessions({ from: today, to: isoDate(addDays(new Date(), 28)) }).data ?? [];
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', track: 'TOEIC' as CourseTrack, schedule: '', room: '' });
  const [error, setError] = useState('');
  const createClass = useTeacherMutation(teacherApi.createClass);
  const [view, setView] = useState<'active' | 'archived'>('active');
  const archivedQ = useArchivedClasses(view === 'archived');
  const reopen = useTeacherMutation((id: string) => teacherApi.archiveClass(id, false));
  const shown = view === 'archived' ? (archivedQ.data ?? []) : classes;

  // lọc theo mục TOEIC / VSTEP / Tiếng Anh THPT (?muc=, mở từ menu Lớp học)
  const [params, setParams] = useSearchParams();
  const muc = params.get('muc')?.toUpperCase() as CourseTrack | undefined;
  const list = shown.filter((c) => (!muc || classTrack(c) === muc) && (c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())));

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    toast.success('Đã sao chép mã mời', `Gửi mã ${code} cho học viên để tham gia lớp.`);
  };

  const create = () => {
    if (form.name.trim().length < 2) return setError('Vui lòng nhập tên lớp');
    createClass.mutate(
      { name: form.name.trim(), track: form.track, schedule: form.schedule.trim() || null, room: form.room.trim() || null },
      {
        onSuccess: (c) => {
          setOpen(false);
          setForm({ name: '', track: muc ?? 'TOEIC', schedule: '', room: '' });
          setError('');
          toast.success('Đã tạo lớp mới', `Mã mời: ${c.code}`);
        },
        onError: (e) => setError(errorMessage(e)),
      }
    );
  };

  if (isLoading) return <TLoading />;
  if (loadError) return <TError error={loadError} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Giảng dạy"
        title="Lớp học của tôi"
        sub="Tạo lớp, gửi mã mời cho học viên, theo dõi tiến độ từng lớp."
        actions={
          <TBtn variant="primary" icon={<Plus />} onClick={() => (setForm((f) => ({ ...f, track: muc ?? f.track })), setOpen(true))}>
            Tạo lớp
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
        <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-0.5" role="tablist" aria-label="Mục lớp học">
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
            <p className="mt-1 text-sm text-slate-500">{view === 'archived' ? 'Lớp đã kết thúc có thể lưu trữ trong mục “Sửa lớp” để gọn danh sách.' : classes.length ? 'Thử tìm bằng mã lớp, hoặc tạo lớp mới.' : 'Bấm “Tạo lớp” để mở lớp đầu tiên và gửi mã mời cho học viên.'}</p>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
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
                      {c.schedule || 'Chưa có lịch'}{c.room ? ` · ${c.room}` : ''}
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
                      <TBtn
                        size="sm"
                        disabled={reopen.isPending}
                        onClick={() => reopen.mutate(c.id, { onSuccess: () => toast.success('Đã mở lại lớp', c.name), onError: (e) => toast.error('Không mở lại được lớp', errorMessage(e)) })}
                      >
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
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tạo lớp học mới"
        description="Mã mời được tạo tự động sau khi lưu."
        icon={<Users />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={create} disabled={createClass.isPending}>
              {createClass.isPending ? 'Đang tạo…' : 'Tạo lớp'}
            </TBtn>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tên lớp" required placeholder="VD: TOEIC 650+ K13" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={error} />
          <Select label="Mục lớp học" options={CLASS_TRACK_OPTIONS} value={form.track} onChange={(e) => setForm((f) => ({ ...f, track: e.target.value as CourseTrack }))} hint="Trùng 3 mục khoá học của học viên; lớp Tiếng Anh THPT chấm thang điểm 10" />
          <Input label="Lịch học" placeholder="VD: T2 – T4 – T6 · 19:00" value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} />
          <Input label="Phòng học" placeholder="VD: Phòng 302 hoặc Online" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
};
