import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpenCheck, CheckCheck, ClipboardCheck, UserCheck, UserMinus, UserX, Check } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useSessionDetail, useSessions, useTeacherClasses, useTeacherMutation } from '@/shared/api/teacher';
import { ATTENDANCE_LABEL, addDays, isoDate } from '@/shared/constants/teacher';
import type { AttendanceMark } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Panel, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';

const MARKS: AttendanceMark[] = ['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'];
const MARK_ON: Record<AttendanceMark, string> = { PRESENT: 'bg-emerald-600 text-white', LATE: 'bg-amber-500 text-white', EXCUSED: 'bg-sky-600 text-white', ABSENT: 'bg-rose-600 text-white' };
const MARK_CELL: Record<AttendanceMark, [React.ReactNode, string]> = { PRESENT: [<Check key="p" className="mx-auto h-4 w-4" aria-label="có mặt" />, 'text-emerald-600'], LATE: ['M', 'text-amber-600'], EXCUSED: ['P', 'text-sky-600'], ABSENT: ['V', 'font-bold text-rose-600'] };
const dm = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;

/** Điểm danh một buổi + sổ điểm danh cả khoá của lớp */
export const TeacherAttendancePage: React.FC = () => {
  useDocumentTitle('Điểm danh');
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const today = isoDate(new Date());
  const classes = useTeacherClasses().data ?? [];
  // Các buổi từ đầu học kỳ tới hôm nay (chọn buổi + sổ điểm danh)
  const range = useMemo(() => ({ from: isoDate(addDays(new Date(), -180)), to: today }), [today]);
  const list = useSessions(range);
  const all = useMemo(() => (list.data ?? []).filter((s) => s.status !== 'CANCELLED'), [list.data]);

  // Không chỉ định buổi: buổi hôm nay, nếu không có thì buổi gần nhất đã qua
  const fallbackId = all.find((s) => s.date === today)?.id ?? [...all].reverse()[0]?.id;
  const currentId = sessionId ?? fallbackId;
  const detail = useSessionDetail(currentId);
  const session = detail.data;
  const cls = classes.find((c) => c.id === session?.classId);
  const students = session?.students ?? [];
  const done = all.filter((s) => s.classId === session?.classId && s.status === 'DONE' && s.attendance);

  const [marks, setMarks] = useState<Record<string, AttendanceMark>>({});
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!session) return;
    setMarks(session.attendance ?? Object.fromEntries(session.students.map((s) => [s.id, 'PRESENT' as AttendanceMark])));
    setNote(session.note ?? '');
  }, [session?.id, session?.attendance]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useTeacherMutation((v: { id: string; attendance: Record<string, AttendanceMark>; note: string }) => teacherApi.saveAttendance(v.id, { attendance: v.attendance, note: v.note || null }));

  const count = (m: AttendanceMark) => Object.values(marks).filter((x) => x === m).length;
  /** null = chưa có buổi nào điểm danh */
  const rateOf = (studentId: string): number | null => {
    const v = done.map((s) => s.attendance?.[studentId]).filter(Boolean);
    return v.length ? Math.round((v.filter((x) => x === 'PRESENT' || x === 'LATE').length / v.length) * 100) : null;
  };
  const absentStreak = useMemo(
    () =>
      students.filter((st) => {
        const last = done.slice(-2).map((s) => s.attendance?.[st.id]);
        return last.length === 2 && last.every((x) => x === 'ABSENT');
      }),
    [done, students]
  );

  if (list.isLoading || (currentId && detail.isLoading)) return <TLoading />;
  if (list.error) return <TError error={list.error} onRetry={() => list.refetch()} />;
  if (!currentId || !session) {
    return (
      <div className="space-y-6">
        <TPageHead crumbs={[{ label: 'Lịch dạy', to: '/teacher/schedule' }, { label: 'Điểm danh' }]} title="Điểm danh" />
        {detail.error ? (
          <TError error={detail.error} onRetry={() => detail.refetch()} />
        ) : (
          <Panel>
            <TEmpty title="Chưa có buổi học nào để điểm danh" sub="Các buổi trong lịch dạy sẽ xuất hiện ở đây từ ngày diễn ra." action={<TBtn to="/teacher/schedule">Mở lịch dạy</TBtn>} />
          </Panel>
        )}
      </div>
    );
  }

  const onSave = () =>
    save.mutate(
      { id: session.id, attendance: marks, note: note.trim() },
      {
        onSuccess: () => toast.success(session.attendance ? 'Đã cập nhật điểm danh' : 'Đã lưu điểm danh', `${cls?.name ?? session.className ?? ''} · ${dm(session.date)} · có mặt ${count('PRESENT') + count('LATE')}/${students.length}`),
        onError: (e) => toast.error('Không lưu được điểm danh', errorMessage(e)),
      }
    );

  const contact = students.filter((st) => absentStreak.includes(st) || (rateOf(st.id) ?? 100) < 80);

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Lịch dạy', to: '/teacher/schedule' }, { label: 'Điểm danh' }]}
        title="Điểm danh"
        sub={`${cls?.name ?? session.className ?? ''} · ${dm(session.date)} · ${session.start}–${session.end}${session.room ? ` · ${session.room}` : ''}`}
        actions={
          <select value={session.id} onChange={(e) => navigate(`/teacher/attendance/${e.target.value}`)} className={cn(inputCls, 'w-72 max-w-full')} aria-label="Chọn buổi học">
            {classes.map((c) => {
              const opts = all.filter((s) => s.classId === c.id).sort((a, b) => b.date.localeCompare(a.date));
              return opts.length ? (
                <optgroup key={c.id} label={c.name}>
                  {opts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {dm(s.date)} · {s.start}
                      {s.topic ? ` · ${s.topic}` : ''}
                    </option>
                  ))}
                </optgroup>
              ) : null;
            })}
            {!all.some((s) => s.id === session.id) && <option value={session.id}>{dm(session.date)} · {session.start}</option>}
          </select>
        }
      />

      <Figures
        items={[
          { label: 'Có mặt', value: count('PRESENT'), note: `trên ${students.length} học viên`, icon: UserCheck, tone: 'emerald' },
          { label: 'Đi muộn', value: count('LATE'), note: 'vẫn tính có mặt', icon: ClipboardCheck, tone: 'amber' },
          { label: 'Vắng có phép', value: count('EXCUSED'), note: 'đã báo trước', icon: UserMinus, tone: 'sky' },
          { label: 'Vắng', value: count('ABSENT'), note: absentStreak.length ? `${absentStreak.length} bạn vắng 2 buổi liền` : 'không ai vắng liên tiếp', icon: UserX, tone: 'rose' },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel
          title="Danh sách lớp"
          sub={session.topic ? `Giáo án: ${session.topic}` : 'Chưa soạn giáo án cho buổi này'}
          icon={BookOpenCheck}
          action={
            <TBtn size="sm" icon={<CheckCheck />} onClick={() => setMarks(Object.fromEntries(students.map((s) => [s.id, 'PRESENT' as AttendanceMark])))} disabled={!students.length}>
              Tất cả có mặt
            </TBtn>
          }
          flush
        >
          {students.length === 0 && <TEmpty title="Lớp chưa có học viên" sub="Gửi mã mời hoặc thêm học viên ở trang lớp." />}
          <ul className="divide-y divide-slate-100">
            {students.map((st, i) => {
              const r = rateOf(st.id);
              return (
                <li key={st.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center">
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="w-5 text-right text-[12px] tabular-nums text-slate-400">{i + 1}</span>
                    <Avatar name={st.name} src={st.avatarUrl} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{st.name}</span>
                      <span className={cn('block text-[12px]', r !== null && r < 80 ? 'text-rose-600' : 'text-slate-500')}>{r === null ? 'Chưa có buổi nào được điểm danh' : `Chuyên cần ${r}% cả khoá`}</span>
                    </span>
                  </span>
                  <div className="flex flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-0.5" role="radiogroup" aria-label={`Điểm danh ${st.name}`}>
                    {MARKS.map((m) => (
                      <button key={m} type="button" role="radio" aria-checked={marks[st.id] === m} onClick={() => setMarks((x) => ({ ...x, [st.id]: m }))} className={cn('h-8 rounded-lg px-2.5 text-[12px] font-semibold transition-colors', marks[st.id] === m ? MARK_ON[m] : 'text-slate-500 hover:text-slate-900')}>
                        {ATTENDANCE_LABEL[m]}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-100 px-5 py-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Ghi chú sau buổi dạy</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Lớp hiểu bài tới đâu, việc cần nhắc buổi sau" className={cn(inputCls, 'h-auto w-full py-2')} />
            </label>
            <div className="mt-3 flex justify-end">
              <TBtn variant="primary" onClick={onSave} disabled={save.isPending || !students.length}>
                {save.isPending ? 'Đang lưu…' : session.attendance ? 'Cập nhật điểm danh' : 'Lưu điểm danh'}
              </TBtn>
            </div>
          </div>
        </Panel>

        <Panel title="Cần liên hệ" sub="Vắng 2 buổi gần nhất hoặc chuyên cần dưới 80%">
          {contact.length ? (
            <ul className="space-y-3">
              {contact.map((st) => (
                <li key={st.id} className="flex items-center gap-3">
                  <Avatar name={st.name} src={st.avatarUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{st.name}</span>
                    <span className="block text-[12px] text-rose-600">{absentStreak.includes(st) ? 'Vắng 2 buổi liền' : `Chuyên cần ${rateOf(st.id)}%`}</span>
                  </span>
                  <TBtn size="sm" variant="ghost" to={`/teacher/students?id=${st.id}`}>
                    Hồ sơ
                  </TBtn>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Không có học viên nào cần liên hệ.</p>
          )}
        </Panel>
      </div>

      <Panel title="Sổ điểm danh" sub={<span className="inline-flex flex-wrap items-center gap-x-1">{`${cls?.name ?? session.className ?? ''} · ${done.length} buổi đã điểm danh ·`} <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> có mặt · M muộn · P có phép · V vắng</span>} flush>
        {done.length === 0 ? (
          <TEmpty title="Chưa có buổi nào được điểm danh" sub="Lưu điểm danh buổi này để bắt đầu sổ điểm danh của lớp." />
        ) : (
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={cn(tbl.th, 'sticky left-0 bg-slate-50')}>Học viên</th>
                  {done.map((s) => (
                    <th key={s.id} className={cn(tbl.th, 'px-2 text-center tabular-nums', s.id === session.id && 'text-indigo-700')}>
                      {dm(s.date)}
                    </th>
                  ))}
                  <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => {
                  const r = rateOf(st.id);
                  return (
                    <tr key={st.id} className={tbl.tr}>
                      <td className={cn(tbl.td, 'sticky left-0 whitespace-nowrap bg-white font-medium text-slate-900')}>{st.name}</td>
                      {done.map((s) => {
                        const m = s.attendance?.[st.id];
                        return (
                          <td key={s.id} className={cn('px-2 py-3 text-center text-[13px]', m && MARK_CELL[m][1], s.id === session.id && 'bg-indigo-500/[0.05]')}>
                            {m ? MARK_CELL[m][0] : '·'}
                          </td>
                        );
                      })}
                      <td className={cn(tbl.td, 'text-right font-semibold tabular-nums', r !== null && r < 80 ? 'text-rose-600' : 'text-slate-900')}>{r === null ? '—' : `${r}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};
