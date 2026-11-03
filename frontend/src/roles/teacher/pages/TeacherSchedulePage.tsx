import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Clock, MapPin, NotebookPen, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useSessions, useTeacherClasses, useTeacherMutation } from '@/shared/api/teacher';
import type { ClassSession } from '@/shared/types';
import { cn, sessionState } from '@/shared/utils';
import { CLASS_BAR, Panel, Status, TBtn, TPageHead, classTone, inputCls } from '../components/TeacherKit';
import { TError } from '../components/TeacherState';

const WEEKDAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const mondayOf = (d: Date) => {
  const m = new Date(d);
  m.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  m.setHours(0, 0, 0, 0);
  return m;
};
const dm = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;

/** Tỷ lệ có mặt (có mặt + đi muộn) của một buổi đã dạy */
export const presentRate = (s: ClassSession) => {
  const v = Object.values(s.attendance ?? {});
  return v.length ? Math.round((v.filter((x) => x === 'PRESENT' || x === 'LATE').length / v.length) * 100) : 0;
};

/** Lịch dạy theo tuần: mỗi buổi gắn lớp, phòng, giáo án; buổi đã dạy có điểm danh, buổi sắp tới soạn trước nội dung */
export const TeacherSchedulePage: React.FC = () => {
  useDocumentTitle('Lịch dạy');
  const today = iso(new Date());
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return iso(d);
  });
  const classes = useTeacherClasses().data ?? [];
  const { data: week = [], isLoading, error, refetch } = useSessions({ from: days[0], to: days[6] });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Chọn sẵn buổi sắp tới gần nhất khi đổi tuần / tải xong
  React.useEffect(() => {
    if (!week.length) return setSelectedId(null);
    setSelectedId((cur) => (cur && week.some((s) => s.id === cur) ? cur : week.find((s) => s.date >= today && s.status === 'UPCOMING')?.id ?? week[0].id));
  }, [week, today]);
  const selected = week.find((s) => s.id === selectedId) ?? null;
  const cls = selected ? classes.find((c) => c.id === selected.classId) : undefined;
  const updateSession = useTeacherMutation((v: { id: string; topic: string }) => teacherApi.updateSession(v.id, { topic: v.topic }));
  const [topic, setTopic] = useState('');
  React.useEffect(() => setTopic(selected?.topic ?? ''), [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const hours = week.reduce((a, s) => a + (s.status === 'CANCELLED' ? 0 : (Number(s.end.slice(0, 2)) * 60 + Number(s.end.slice(3)) - Number(s.start.slice(0, 2)) * 60 - Number(s.start.slice(3))) / 60), 0);
  const shift = (n: number) => {
    const m = new Date(monday);
    m.setDate(m.getDate() + n * 7);
    setMonday(m);
  };
  const legend = useMemo(() => classes.map((c) => ({ c, tone: classTone(c.id) })), [classes]);

  const saveTopic = () => {
    if (!selected) return;
    updateSession.mutate(
      { id: selected.id, topic: topic.trim() },
      { onSuccess: () => toast.success('Đã lưu giáo án', `${cls?.name ?? selected.className ?? ''} · ${dm(selected.date)}`), onError: (e) => toast.error('Không lưu được giáo án', errorMessage(e)) }
    );
  };

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Giảng dạy"
        title="Lịch dạy"
        sub={`Tuần ${dm(days[0])} – ${dm(days[6])} · ${isLoading ? '…' : `${week.filter((s) => s.status !== 'CANCELLED').length} buổi · ${hours.toLocaleString('vi-VN')} giờ đứng lớp`}`}
        actions={
          <>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <button type="button" onClick={() => shift(-1)} className="flex h-10 w-10 items-center justify-center text-slate-600 hover:text-slate-900" aria-label="Tuần trước">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setMonday(mondayOf(new Date()))} className="h-10 border-x border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:text-slate-900">
                Tuần này
              </button>
              <button type="button" onClick={() => shift(1)} className="flex h-10 w-10 items-center justify-center text-slate-600 hover:text-slate-900" aria-label="Tuần sau">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <TBtn variant="primary" icon={<ClipboardCheck />} to="/teacher/attendance">
              Điểm danh
            </TBtn>
          </>
        }
      />

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {legend.map(({ c, tone }) => (
          <span key={c.id} className="inline-flex items-center gap-2 text-[13px] text-slate-600">
            <span className={cn('h-3 w-3 rounded border-l-4', CLASS_BAR[tone])} />
            {c.name}
          </span>
        ))}
      </div>

      {error && <TError error={error} onRetry={() => refetch()} />}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)]">
          <div className="grid min-w-[840px] grid-cols-7 divide-x divide-slate-100">
            {days.map((d, i) => {
              const list = week.filter((s) => s.date === d).sort((a, b) => a.start.localeCompare(b.start));
              const isToday = d === today;
              return (
                <div key={d} className={cn('min-h-[420px]', isToday && 'bg-indigo-500/[0.03]')}>
                  <div className={cn('border-b border-slate-100 px-3 py-3 text-center', isToday && 'border-b-indigo-200')}>
                    <p className="text-[12px] text-slate-500">{WEEKDAYS[i]}</p>
                    <p className={cn('mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full font-display text-[15px] font-bold tabular-nums', isToday ? 'bg-indigo-600 text-white' : 'text-slate-900')}>{d.slice(8, 10)}</p>
                  </div>
                  <div className="space-y-2 p-2">
                    {list.map((s) => {
                      const c = { id: s.classId, name: classes.find((x) => x.id === s.classId)?.name ?? s.className ?? '' };
                      const on = s.id === selectedId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedId(s.id)}
                          className={cn('block w-full rounded-lg border-l-4 px-2.5 py-2 text-left transition-shadow', CLASS_BAR[classTone(c.id)], on ? 'shadow-[0_0_0_2px_rgba(79,70,229,0.45)]' : 'hover:shadow-md', s.status === 'CANCELLED' && 'opacity-50')}
                        >
                          <p className="text-[11px] font-semibold tabular-nums text-slate-600">
                            {s.start}–{s.end}
                          </p>
                          <p className={cn('mt-0.5 text-[13px] font-semibold leading-snug text-slate-900', s.status === 'CANCELLED' && 'line-through')}>{c.name}</p>
                          {s.topic && <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-600">{s.topic}</p>}
                          <p className="mt-1 text-[11px] text-slate-500">{s.status === 'DONE' ? (s.attendance ? `Có mặt ${presentRate(s)}%` : 'Đã dạy') : s.status === 'CANCELLED' ? 'Nghỉ' : s.room}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selected ? (
          <Panel title={cls?.name ?? selected.className ?? 'Buổi học'} sub={`${WEEKDAYS[(new Date(selected.date).getDay() + 6) % 7]}, ${dm(selected.date)}`} icon={CalendarDays} tone={classTone(selected.classId)} className="xl:sticky xl:top-20">
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Clock className="h-4 w-4 text-slate-400" /> {selected.start} – {selected.end}
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="h-4 w-4 text-slate-400" /> {selected.room || cls?.room || '—'}
              </div>
              {cls && (
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Users className="h-4 w-4 text-slate-400" /> {cls.studentsCount} học viên · mã lớp {cls.code}
                </div>
              )}
              <div className="pt-1">
                <Status tone={sessionState(selected).tone}>{selected.status === 'DONE' ? (selected.attendance ? `Đã dạy · có mặt ${presentRate(selected)}%` : 'Đã dạy · chưa điểm danh') : sessionState(selected).label}</Status>
              </div>
            </dl>

            <label className="mt-5 block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                <NotebookPen className="h-4 w-4 text-slate-400" /> Giáo án buổi học
              </span>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} placeholder="Nội dung dự kiến của buổi học" className={cn(inputCls, 'h-auto w-full py-2 leading-relaxed')} />
            </label>
            {selected.note && <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-[13px] text-amber-800">Ghi chú: {selected.note}</p>}

            <div className="mt-5 flex flex-wrap gap-2">
              <TBtn onClick={saveTopic} disabled={topic === selected.topic || updateSession.isPending}>
                {updateSession.isPending ? 'Đang lưu…' : 'Lưu giáo án'}
              </TBtn>
              {selected.status !== 'CANCELLED' && (
                <TBtn variant="primary" icon={<ClipboardCheck />} to={`/teacher/attendance/${selected.id}`}>
                  {selected.status === 'DONE' ? 'Xem điểm danh' : 'Điểm danh'}
                </TBtn>
              )}
            </div>
            <Link to={`/teacher/classes/${selected.classId}`} className="mt-4 inline-flex items-center gap-0.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
              Mở trang lớp <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Panel>
        ) : (
          <Panel>
            <p className="py-8 text-center text-sm text-slate-500">{isLoading ? 'Đang tải lịch dạy…' : 'Tuần này không có buổi dạy.'}</p>
          </Panel>
        )}
      </div>
    </div>
  );
};
