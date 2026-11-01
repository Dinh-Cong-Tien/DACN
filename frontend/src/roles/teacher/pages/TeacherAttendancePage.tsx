import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpenCheck, CheckCheck, ClipboardCheck, UserCheck, UserMinus, UserX } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { ATTENDANCE_LABEL, MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_SESSIONS } from '@/shared/mocks';
import type { AttendanceMark } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Panel, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';

const MARKS: AttendanceMark[] = ['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'];
const MARK_ON: Record<AttendanceMark, string> = { PRESENT: 'bg-emerald-600 text-white', LATE: 'bg-amber-500 text-white', EXCUSED: 'bg-sky-600 text-white', ABSENT: 'bg-rose-600 text-white' };
const MARK_CELL: Record<AttendanceMark, [string, string]> = { PRESENT: ['✓', 'text-emerald-600'], LATE: ['M', 'text-amber-600'], EXCUSED: ['P', 'text-sky-600'], ABSENT: ['V', 'font-bold text-rose-600'] };
const dm = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Điểm danh một buổi + sổ điểm danh cả khoá của lớp */
export const TeacherAttendancePage: React.FC = () => {
  useDocumentTitle('Điểm danh');
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const today = todayIso();
  // Không chỉ định buổi: buổi hôm nay, nếu không có thì buổi gần nhất đã dạy
  const fallback = MOCK_SESSIONS.find((s) => s.date === today && s.status !== 'CANCELLED') ?? [...MOCK_SESSIONS].reverse().find((s) => s.status === 'DONE')!;
  const session = MOCK_SESSIONS.find((s) => s.id === sessionId) ?? fallback;
  const cls = MOCK_CLASSES.find((c) => c.id === session.classId)!;
  const classSessions = MOCK_SESSIONS.filter((s) => s.classId === cls.id && s.status !== 'CANCELLED');
  const done = classSessions.filter((s) => s.status === 'DONE');

  const [marks, setMarks] = useState<Record<string, AttendanceMark>>({});
  const [note, setNote] = useState('');
  useEffect(() => {
    setMarks(session.attendance ?? Object.fromEntries(MOCK_CLASS_STUDENTS.map((s) => [s.id, 'PRESENT' as AttendanceMark])));
    setNote(session.note ?? '');
  }, [session.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = (m: AttendanceMark) => Object.values(marks).filter((x) => x === m).length;
  const rateOf = (studentId: string) => {
    const v = done.map((s) => s.attendance?.[studentId]).filter(Boolean);
    return v.length ? Math.round((v.filter((x) => x === 'PRESENT' || x === 'LATE').length / v.length) * 100) : 100;
  };
  const absentStreak = useMemo(
    () =>
      MOCK_CLASS_STUDENTS.filter((st) => {
        const last = done.slice(-2).map((s) => s.attendance?.[st.id]);
        return last.length === 2 && last.every((x) => x === 'ABSENT');
      }),
    [done]
  );

  const save = () => toast.success(session.attendance ? 'Đã cập nhật điểm danh' : 'Đã lưu điểm danh', `${cls.name} · ${dm(session.date)} · có mặt ${count('PRESENT') + count('LATE')}/${MOCK_CLASS_STUDENTS.length}`);

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Lịch dạy', to: '/teacher/schedule' }, { label: 'Điểm danh' }]}
        title="Điểm danh"
        sub={`${cls.name} · ${dm(session.date)} · ${session.start}–${session.end} · ${session.room}`}
        actions={
          <select value={session.id} onChange={(e) => navigate(`/teacher/attendance/${e.target.value}`)} className={cn(inputCls, 'w-72')} aria-label="Chọn buổi học">
            {MOCK_CLASSES.map((c) => (
              <optgroup key={c.id} label={c.name}>
                {MOCK_SESSIONS.filter((s) => s.classId === c.id && s.status !== 'CANCELLED' && s.date <= today).map((s) => (
                  <option key={s.id} value={s.id}>
                    {dm(s.date)} · {s.start} · {s.topic}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        }
      />

      <Figures
        items={[
          { label: 'Có mặt', value: count('PRESENT'), note: `trên ${MOCK_CLASS_STUDENTS.length} học viên`, icon: UserCheck, tone: 'emerald' },
          { label: 'Đi muộn', value: count('LATE'), note: 'vẫn tính có mặt', icon: ClipboardCheck, tone: 'amber' },
          { label: 'Vắng có phép', value: count('EXCUSED'), note: 'đã báo trước', icon: UserMinus, tone: 'sky' },
          { label: 'Vắng', value: count('ABSENT'), note: absentStreak.length ? `${absentStreak.length} bạn vắng 2 buổi liền` : 'không ai vắng liên tiếp', icon: UserX, tone: 'rose' },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel
          title="Danh sách lớp"
          sub={`Giáo án: ${session.topic}`}
          icon={BookOpenCheck}
          action={
            <TBtn size="sm" icon={<CheckCheck />} onClick={() => setMarks(Object.fromEntries(MOCK_CLASS_STUDENTS.map((s) => [s.id, 'PRESENT' as AttendanceMark])))}>
              Tất cả có mặt
            </TBtn>
          }
          flush
        >
          <ul className="divide-y divide-slate-100">
            {MOCK_CLASS_STUDENTS.map((st, i) => (
              <li key={st.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="w-5 text-right text-[12px] tabular-nums text-slate-400">{i + 1}</span>
                  <Avatar name={st.name} src={st.avatarUrl} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">{st.name}</span>
                    <span className={cn('block text-[12px]', rateOf(st.id) < 80 ? 'text-rose-600' : 'text-slate-500')}>Chuyên cần {rateOf(st.id)}% cả khoá</span>
                  </span>
                </span>
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5" role="radiogroup" aria-label={`Điểm danh ${st.name}`}>
                  {MARKS.map((m) => (
                    <button key={m} type="button" role="radio" aria-checked={marks[st.id] === m} onClick={() => setMarks((x) => ({ ...x, [st.id]: m }))} className={cn('h-8 rounded-lg px-2.5 text-[12px] font-semibold transition-colors', marks[st.id] === m ? MARK_ON[m] : 'text-slate-500 hover:text-slate-900')}>
                      {ATTENDANCE_LABEL[m]}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-5 py-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Ghi chú sau buổi dạy</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Lớp hiểu bài tới đâu, việc cần nhắc buổi sau" className={cn(inputCls, 'h-auto w-full py-2')} />
            </label>
            <div className="mt-3 flex justify-end">
              <TBtn variant="primary" onClick={save}>
                {session.attendance ? 'Cập nhật điểm danh' : 'Lưu điểm danh'}
              </TBtn>
            </div>
          </div>
        </Panel>

        <Panel title="Cần liên hệ" sub="Vắng 2 buổi gần nhất hoặc chuyên cần dưới 80%">
          {(() => {
            const list = MOCK_CLASS_STUDENTS.filter((st) => absentStreak.includes(st) || rateOf(st.id) < 80);
            return list.length ? (
              <ul className="space-y-3">
                {list.map((st) => (
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
            );
          })()}
        </Panel>
      </div>

      <Panel title="Sổ điểm danh" sub={`${cls.name} · ${done.length} buổi đã dạy · ✓ có mặt · M muộn · P có phép · V vắng`} flush>
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
              {MOCK_CLASS_STUDENTS.map((st) => (
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
                  <td className={cn(tbl.td, 'text-right font-semibold tabular-nums', rateOf(st.id) < 80 ? 'text-rose-600' : 'text-slate-900')}>{rateOf(st.id)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
