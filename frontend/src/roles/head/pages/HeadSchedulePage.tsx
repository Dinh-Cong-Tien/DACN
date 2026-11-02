import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { DEPT_CLASSES, DEPT_SESSIONS, MOCK_OBSERVATIONS, MOCK_TEACHERS, teacherByName } from '@/shared/mocks';
import type { ClassObservation, ClassSession } from '@/shared/types';
import { Avatar } from '@/shared/components/ui';
import { cn, formatDate } from '@/shared/utils';
import { CLASS_BAR, Panel, Status, TBtn, TPageHead, classTone, inputCls } from '@/roles/teacher/components/TeacherKit';
import { ObserveDialog } from './HeadClassDetailPage';

const WEEKDAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dm = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;
const mondayOf = (d: Date) => {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
};
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

/** Các cặp buổi trùng phòng: cùng ngày, cùng phòng (không tính học online), thời gian giao nhau */
export function roomConflicts(sessions: ClassSession[]): [ClassSession, ClassSession][] {
  const live = sessions.filter((s) => s.status !== 'CANCELLED' && s.room && !s.room.startsWith('Online'));
  const out: [ClassSession, ClassSession][] = [];
  live.forEach((a, i) =>
    live.slice(i + 1).forEach((b) => {
      if (a.classId !== b.classId && a.date === b.date && a.room === b.room && toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end)) out.push([a, b]);
    })
  );
  return out;
}

const clsOf = (id: string) => DEPT_CLASSES.find((c) => c.id === id)!;

/** Lịch dạy toàn bộ môn theo tuần: phát hiện trùng phòng, theo dõi buổi dự giờ */
export const HeadSchedulePage: React.FC = () => {
  useDocumentTitle('Lịch dạy bộ môn');
  const today = iso(new Date());
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  const [teacher, setTeacher] = useState('ALL');
  const [obs, setObs] = useState<ClassObservation[]>(MOCK_OBSERVATIONS);
  const [observeOpen, setObserveOpen] = useState(false);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return iso(d);
  });
  const weekAll = DEPT_SESSIONS.filter((s) => s.date >= days[0] && s.date <= days[6]);
  const week = weekAll.filter((s) => teacher === 'ALL' || clsOf(s.classId).teacherName === teacher);
  const conflicts = useMemo(() => roomConflicts(weekAll), [days[0]]); // eslint-disable-line react-hooks/exhaustive-deps
  const conflictIds = new Set(conflicts.flat().map((s) => s.id));
  const obsKey = new Set(obs.map((o) => `${o.classId}|${o.date}`));
  const upcomingObs = obs.filter((o) => o.status === 'PLANNED').sort((a, b) => a.date.localeCompare(b.date));
  const shift = (n: number) => {
    const m = new Date(monday);
    m.setDate(m.getDate() + n * 7);
    setMonday(m);
  };
  const shownClasses = DEPT_CLASSES.filter((c) => teacher === 'ALL' || c.teacherName === teacher);

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Giảng dạy"
        title="Lịch dạy bộ môn"
        sub={`Tuần ${dm(days[0])} – ${dm(days[6])} · ${week.filter((s) => s.status !== 'CANCELLED').length} buổi của ${new Set(week.map((s) => clsOf(s.classId).teacherName)).size} giáo viên`}
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
            <TBtn variant="primary" icon={<Eye />} onClick={() => setObserveOpen(true)}>
              Lên lịch dự giờ
            </TBtn>
          </>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <select value={teacher} onChange={(e) => setTeacher(e.target.value)} className={cn(inputCls, 'md:w-64')} aria-label="Lọc theo giáo viên">
          <option value="ALL">Tất cả giáo viên</option>
          {MOCK_TEACHERS.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {shownClasses.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2 text-[13px] text-slate-600">
              <span className={cn('h-3 w-3 rounded border-l-4', CLASS_BAR[classTone(c.id)])} />
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-500/[0.06] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-rose-800">{conflicts.length} buổi trùng phòng trong tuần</p>
            <ul className="mt-1 space-y-0.5 text-rose-700">
              {conflicts.slice(0, 4).map(([a, b]) => (
                <li key={a.id + b.id}>
                  {dm(a.date)} · {a.room} · {a.start}: {clsOf(a.classId).name} ({clsOf(a.classId).teacherName}) và {clsOf(b.classId).name} ({clsOf(b.classId).teacherName})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)]">
          <div className="grid min-w-[880px] grid-cols-7 divide-x divide-slate-100">
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
                      const c = clsOf(s.classId);
                      const clash = conflictIds.has(s.id);
                      return (
                        <Link
                          key={s.id}
                          to={`/head/classes/${c.id}`}
                          className={cn('block rounded-lg border-l-4 px-2.5 py-2 transition-shadow hover:shadow-md', CLASS_BAR[classTone(c.id)], clash && 'ring-2 ring-rose-400', s.status === 'CANCELLED' && 'opacity-50')}
                        >
                          <p className="flex items-center justify-between gap-1 text-[11px] font-semibold tabular-nums text-slate-600">
                            {s.start}–{s.end}
                            {obsKey.has(`${c.id}|${s.date}`) && <Eye className="h-3.5 w-3.5 text-violet-600" aria-label="Có dự giờ" />}
                          </p>
                          <p className={cn('mt-0.5 text-[13px] font-semibold leading-snug text-slate-900', s.status === 'CANCELLED' && 'line-through')}>{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.teacherName}</p>
                          <p className={cn('text-[11px]', clash ? 'font-semibold text-rose-600' : 'text-slate-500')}>{clash ? `Trùng ${s.room}` : s.room}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid items-start gap-6 md:grid-cols-2 [&>*]:min-w-0">
          <Panel title="Dự giờ sắp tới" icon={Eye} tone="violet" flush>
            {upcomingObs.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-500">Chưa có lịch dự giờ.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingObs.map((o) => {
                  const c = clsOf(o.classId);
                  return (
                    <li key={o.id} className="flex items-start gap-3 px-5 py-3">
                      <Avatar name={o.teacher} src={teacherByName(o.teacher)?.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[12px] text-slate-500">
                          {formatDate(o.date)} · {o.start}
                        </p>
                        <Link to={`/head/classes/${c.id}`} className="block text-sm font-medium text-slate-900 hover:text-indigo-700">
                          {c.name}
                        </Link>
                        <p className="text-[12px] text-slate-500">
                          {o.teacher} · {o.topic}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
          <Panel title="Khối lượng giảng dạy tuần này">
            <ul className="space-y-2.5">
              {MOCK_TEACHERS.filter((t) => t.status !== 'PENDING').map((t) => {
                const n = weekAll.filter((s) => s.status !== 'CANCELLED' && clsOf(s.classId).teacherName === t.name).length;
                return (
                  <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link to={`/head/teachers/${t.id}`} className="truncate text-slate-700 hover:text-indigo-700">
                      {t.name}
                    </Link>
                    {t.status === 'LOCKED' ? <Status tone="red">Đã khoá · {n} buổi</Status> : <span className="tabular-nums text-slate-600">{n} buổi</span>}
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>

      <ObserveDialog open={observeOpen} onClose={() => setObserveOpen(false)} onSave={(o) => setObs((all) => [...all, o])} />
    </div>
  );
};
