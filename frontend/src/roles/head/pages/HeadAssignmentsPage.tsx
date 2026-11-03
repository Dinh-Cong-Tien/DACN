import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlarmClock, CheckCircle2, ClipboardList, Search, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useHeadAssignment, useHeadAssignments, useHeadClasses, type OversightAssignment, type OversightSubmission } from '@/shared/api/head';
import { Avatar, Drawer } from '@/shared/components/ui';
import { cn, formatDate, staffPath } from '@/shared/utils';
import { Figures, Meter, Panel, Status, type StatusTone, TPageHead, TTabs, inputCls, tbl } from '@/roles/teacher/components/TeacherKit';

export const ASSIGN_TYPE: Record<string, string> = { MOCK_TEST: 'Đề thi thử', PRACTICE: 'Luyện tập', LESSON: 'Bài giảng', GRAMMAR: 'Ngữ pháp', VOCAB: 'Từ vựng', ESSAY: 'Bài Viết', SPEAKING: 'Bài Nói', DICTATION: 'Chép chính tả' };
export const SUB_STATE: Record<OversightSubmission['state'], { tone: StatusTone; label: string }> = {
  TODO: { tone: 'gray', label: 'Chưa nộp' },
  MISSING: { tone: 'red', label: 'Quá hạn chưa nộp' },
  SUBMITTED: { tone: 'blue', label: 'Đã nộp · chờ chấm' },
  LATE: { tone: 'amber', label: 'Nộp muộn' },
  GRADED: { tone: 'green', label: 'Đã chấm' },
};
const stateOf = (a: OversightAssignment): { tone: StatusTone; label: string } =>
  a.status === 'CLOSED' ? { tone: 'gray', label: 'Đã đóng' } : a.overdue ? { tone: 'red', label: 'Quá hạn' } : { tone: 'green', label: 'Đang mở' };

/** Bài tập giáo viên đã giao cho các lớp: tiến độ nộp, chấm, điểm trung bình — chỉ xem để giám sát */
export const HeadAssignmentsPage: React.FC = () => {
  useDocumentTitle('Bài tập các lớp');
  const [status, setStatus] = useState<'ALL' | 'OPEN' | 'OVERDUE' | 'CLOSED'>('ALL');
  const [classId, setClassId] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string>();
  const all = useHeadAssignments({ classId: classId || undefined }).data ?? [];
  const classes = useHeadClasses().data ?? [];
  const list = all.filter((a) => (status === 'ALL' || (status === 'OVERDUE' ? a.overdue : status === 'OPEN' ? a.status === 'OPEN' && !a.overdue : a.status === 'CLOSED')) && a.title.toLowerCase().includes(q.toLowerCase()));
  const totalSubs = all.reduce((s, a) => s + a.total, 0);
  const done = all.reduce((s, a) => s + a.submitted, 0);
  const ungraded = all.reduce((s, a) => s + Math.max(0, a.submitted - a.graded), 0);

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Giảng dạy" title="Bài tập các lớp" sub="Mọi bài giáo viên đã giao: hạn nộp, số học viên đã nộp, số bài chờ chấm và điểm trung bình. Mở từng bài để xem kết quả của từng học viên." />
      <Figures
        items={[
          { label: 'Bài đã giao', value: all.length, note: `${all.filter((a) => a.status === 'OPEN').length} đang mở`, icon: ClipboardList, tone: 'indigo' },
          { label: 'Tỉ lệ nộp', value: totalSubs ? `${Math.round((done / totalSubs) * 100)}%` : '—', note: `${done}/${totalSubs} lượt`, icon: Users, tone: 'emerald' },
          { label: 'Chờ chấm', value: ungraded, note: 'bài đã nộp chưa có điểm', icon: CheckCircle2, tone: 'amber' },
          { label: 'Quá hạn', value: all.filter((a) => a.overdue).length, note: 'đã hết hạn nhưng chưa đóng', icon: AlarmClock, tone: 'rose' },
        ]}
      />
      <Panel flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 pt-3 lg:flex-row lg:items-end lg:justify-between">
          <TTabs
            className="border-b-0"
            value={status}
            onChange={(k) => setStatus(k as typeof status)}
            items={[
              { key: 'ALL', label: 'Tất cả', count: all.length },
              { key: 'OPEN', label: 'Đang mở', count: all.filter((a) => a.status === 'OPEN' && !a.overdue).length },
              { key: 'OVERDUE', label: 'Quá hạn', count: all.filter((a) => a.overdue).length },
              { key: 'CLOSED', label: 'Đã đóng', count: all.filter((a) => a.status === 'CLOSED').length },
            ]}
          />
          <div className="flex flex-col gap-2 pb-3 sm:flex-row">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'sm:w-56')} aria-label="Lọc theo lớp">
              <option value="">Tất cả lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="relative sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài tập" className={cn(inputCls, 'w-full pl-9')} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Bài tập</th>
                <th className={tbl.th}>Lớp · Giáo viên</th>
                <th className={tbl.th}>Hạn nộp</th>
                <th className={cn(tbl.th, 'w-44')}>Đã nộp</th>
                <th className={cn(tbl.th, 'text-right')}>Chờ chấm</th>
                <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                <th className={tbl.th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => {
                const rate = a.total ? Math.round((a.submitted / a.total) * 100) : 0;
                const st = stateOf(a);
                return (
                  <tr key={a.id} className={cn(tbl.tr, 'cursor-pointer')} onClick={() => setOpen(a.id)}>
                    <td className={tbl.td}>
                      <p className="font-medium text-slate-900">{a.title}</p>
                      <p className="text-[12px] text-slate-500">{ASSIGN_TYPE[a.type] ?? a.type}</p>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap')}>
                      <Link to={staffPath(`/classes/${a.classId}`)} onClick={(e) => e.stopPropagation()} className="text-slate-800 hover:text-indigo-700">
                        {a.className}
                      </Link>
                      <p className="text-[12px] text-slate-500">{a.teacherName}</p>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{a.dueDate ? formatDate(a.dueDate) : 'Không hạn'}</td>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2">
                        <Meter value={rate} tone={rate < 50 ? 'red' : rate < 80 ? 'amber' : 'green'} className="flex-1" />
                        <span className="w-14 text-right text-[13px] tabular-nums text-slate-600">
                          {a.submitted}/{a.total}
                        </span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'text-right tabular-nums', a.submitted - a.graded > 0 && 'font-semibold text-amber-700')}>{Math.max(0, a.submitted - a.graded)}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{a.avgScore !== undefined ? `${a.avgScore}/${a.maxScore ?? 10}` : '—'}</td>
                    <td className={tbl.td}>
                      <Status tone={st.tone}>{st.label}</Status>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    Không có bài tập nào khớp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      <AssignmentDrawer id={open} onClose={() => setOpen(undefined)} />
    </div>
  );
};

const AssignmentDrawer: React.FC<{ id?: string; onClose: () => void }> = ({ id, onClose }) => {
  const d = useHeadAssignment(id).data;
  return (
    <Drawer open={!!id} onClose={onClose} title={d?.title ?? 'Bài tập'} width="max-w-xl">
      {!d ? (
        <p className="py-10 text-center text-sm text-slate-500">Đang tải…</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {ASSIGN_TYPE[d.type] ?? d.type} · {d.className} · {d.teacherName}
            <br />
            Hạn nộp: {d.dueDate ? formatDate(d.dueDate) : 'không hạn'} · Đã nộp {d.submitted}/{d.total}
            {d.avgScore !== undefined && ` · Điểm TB ${d.avgScore}/${d.maxScore ?? 10}`}
          </p>
          {d.note && <p className="rounded-xl bg-slate-50 px-3 py-2 text-[13px] text-slate-600">{d.note}</p>}
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {d.submissions.map((s) => {
              const state = d.dueDate && s.state === 'TODO' && new Date(d.dueDate) < new Date() ? 'MISSING' : s.state;
              return (
                <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar name={s.studentName} src={s.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link to={staffPath(`/students/${s.studentId}`)} className="block truncate text-sm font-medium text-slate-900 hover:text-indigo-700">
                      {s.studentName}
                    </Link>
                    <p className="text-[12px] text-slate-500">{s.submittedAt ? `Nộp ${formatDate(s.submittedAt)}` : '—'}</p>
                  </div>
                  {s.score !== undefined && <span className="text-sm font-semibold tabular-nums text-slate-900">{s.score}/{s.maxScore}</span>}
                  <Status tone={SUB_STATE[state].tone}>{SUB_STATE[state].label}</Status>
                </li>
              );
            })}
            {!d.submissions.length && <li className="px-3 py-6 text-center text-sm text-slate-500">Lớp chưa có học viên.</li>}
          </ul>
        </div>
      )}
    </Drawer>
  );
};
