import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarCheck, ChevronRight, ClipboardList, Flame, Mail, Phone, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useHeadStudent } from '@/shared/api/head';
import { Avatar } from '@/shared/components/ui';
import { cn, formatDate, formatDateTime, staffPath, timeAgo } from '@/shared/utils';
import { Figures, Meter, Panel, Status, TPageHead, tbl } from '@/roles/teacher/components/TeacherKit';
import { ASSIGN_TYPE, SUB_STATE } from './HeadAssignmentsPage';
import { MODE_LABEL, durationText } from './HeadResultsPage';

const NOTE_KIND: Record<string, string> = { NOTE: 'Ghi chú', REMINDER: 'Nhắc nhở', CONTACT: 'Liên hệ' };

/** Hồ sơ học tập của 1 học viên: lớp đang học, chuyên cần, bài tập, kết quả thi, ghi chú của giáo viên */
export const HeadStudentDetailPage: React.FC = () => {
  const { id } = useParams();
  const q = useHeadStudent(id);
  useDocumentTitle(q.data?.student.name ?? 'Hồ sơ học viên');
  const back = (
    <Link to={staffPath('/students')} className="hover:text-slate-900 hover:underline underline-offset-2">
      Học viên
    </Link>
  );
  if (!q.data) {
    return (
      <div className="space-y-6">
        <p className="flex items-center gap-1 text-[13px] text-slate-500"><ArrowLeft className="h-3.5 w-3.5" /> {back}</p>
        <Panel>
          <p className="py-12 text-center text-sm text-slate-500">{q.isError ? 'Không tìm thấy học viên trong phạm vi bạn quản lý.' : 'Đang tải…'}</p>
        </Panel>
      </div>
    );
  }
  const { student: s, classes, attempts, submissions, notes } = q.data;
  const full = attempts.filter((a) => a.mode === 'FULL' && a.score !== undefined);
  const marked = classes.reduce((a, c) => a + c.sessionsMarked, 0);
  const attendance = marked ? Math.round(classes.reduce((a, c) => a + (c.attendanceRate ?? 0) * c.sessionsMarked, 0) / marked) : null;
  const done = classes.reduce((a, c) => a + c.assignmentsDone, 0);
  const totalA = classes.reduce((a, c) => a + c.assignmentsTotal, 0);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-slate-500">
        {back}
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-700">{s.name}</span>
      </nav>
      <TPageHead
        title={
          <span className="flex items-center gap-4">
            <Avatar name={s.name} src={s.avatarUrl} size="xl" ring />
            <span>{s.name}</span>
          </span>
        }
        sub={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {s.email}
            </span>
            {s.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {s.phone}
              </span>
            )}
            <span>Tham gia {formatDate(s.joinedAt)} · hoạt động {timeAgo(s.lastActiveAt)}</span>
            <Status tone={s.plan === 'VIP' ? 'amber' : 'gray'}>{s.plan === 'VIP' ? 'VIP' : 'Miễn phí'}</Status>
            {s.status === 'LOCKED' && <Status tone="red">Đã khoá</Status>}
          </span>
        }
      />
      <Figures
        className="lg:grid-cols-5"
        items={[
          { label: 'Mục tiêu', value: s.target ? `${s.target.examType} ${s.target.score}` : '—', note: s.target?.examDate ? `thi ${formatDate(s.target.examDate)}` : 'chưa đặt', icon: Target, tone: 'indigo' },
          { label: 'Điểm thi thử gần nhất', value: full[0]?.score ?? '—', note: `${full.length} bài thi thử`, icon: TrendingUp, tone: 'sky' },
          { label: 'Chuyên cần', value: attendance !== null ? `${attendance}%` : '—', note: `${marked} buổi đã điểm danh`, icon: CalendarCheck, tone: 'emerald' },
          { label: 'Bài tập đã nộp', value: totalA ? `${done}/${totalA}` : '—', icon: ClipboardList, tone: 'violet' },
          { label: 'Chuỗi ngày học', value: s.streak, note: `${s.xp} điểm nỗ lực`, icon: Flame, tone: 'amber' },
        ]}
      />

      <Panel title="Lớp đang học" flush>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Lớp · Giáo viên</th>
                <th className={tbl.th}>Vào lớp</th>
                <th className={cn(tbl.th, 'w-44')}>Chuyên cần</th>
                <th className={cn(tbl.th, 'text-right')}>Vắng</th>
                <th className={cn(tbl.th, 'text-right')}>Bài tập</th>
                <th className={tbl.th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className={tbl.tr}>
                  <td className={cn(tbl.td, 'whitespace-nowrap')}>
                    <Link to={staffPath(`/classes/${c.id}`)} className="font-medium text-slate-900 hover:text-indigo-700">
                      {c.name}
                    </Link>
                    <p className="text-[12px] text-slate-500">
                      {c.examType} · {c.teacherName}
                    </p>
                  </td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{c.joinedAt ? formatDate(c.joinedAt) : '—'}</td>
                  <td className={tbl.td}>
                    {c.attendanceRate === null ? (
                      <span className="text-[13px] text-slate-400">Chưa điểm danh</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Meter value={c.attendanceRate} tone={c.attendanceRate < 75 ? 'red' : c.attendanceRate < 85 ? 'amber' : 'green'} className="flex-1" />
                        <span className="w-10 text-right text-[13px] tabular-nums text-slate-600">{c.attendanceRate}%</span>
                      </span>
                    )}
                  </td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.absent}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>
                    {c.assignmentsDone}/{c.assignmentsTotal}
                  </td>
                  <td className={tbl.td}>
                    <Status tone={c.memberStatus === 'ACTIVE' ? 'green' : 'gray'}>{c.memberStatus === 'ACTIVE' ? 'Đang học' : 'Đã rời lớp'}</Status>
                  </td>
                </tr>
              ))}
              {!classes.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                    Học viên tự học, chưa tham gia lớp nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Kết quả làm bài" sub="20 bài gần nhất" flush>
          <ul className="divide-y divide-slate-100">
            {attempts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{a.testTitle}</p>
                  <p className="text-[12px] text-slate-500">
                    {MODE_LABEL[a.mode] ?? a.mode} · {durationText(a.durationSec)}
                    {a.submittedAt && ` · ${formatDateTime(a.submittedAt)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-slate-900">{a.score ?? (a.correct !== undefined ? `${a.correct}/${a.total}` : '—')}</p>
                  {a.listening !== undefined && a.reading !== undefined && (
                    <p className="text-[12px] tabular-nums text-slate-500">
                      L {a.listening} · R {a.reading}
                    </p>
                  )}
                  {a.cefr && <p className="text-[12px] text-slate-500">{a.cefr}</p>}
                </div>
              </li>
            ))}
            {!attempts.length && <li className="px-5 py-8 text-center text-sm text-slate-500">Chưa nộp bài nào.</li>}
          </ul>
        </Panel>
        <Panel title="Bài tập của lớp" flush>
          <ul className="divide-y divide-slate-100">
            {submissions.map((x) => {
              const state = x.dueDate && x.state === 'TODO' && new Date(x.dueDate) < new Date() ? 'MISSING' : x.state;
              return (
                <li key={x.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{x.assignmentTitle}</p>
                    <p className="text-[12px] text-slate-500">
                      {ASSIGN_TYPE[x.type ?? ''] ?? x.type} · {x.className}
                      {x.dueDate && ` · hạn ${formatDate(x.dueDate)}`}
                    </p>
                  </div>
                  {x.score !== undefined && (
                    <span className="text-sm font-semibold tabular-nums text-slate-900">
                      {x.score}/{x.maxScore}
                    </span>
                  )}
                  <Status tone={SUB_STATE[state].tone}>{SUB_STATE[state].label}</Status>
                </li>
              );
            })}
            {!submissions.length && <li className="px-5 py-8 text-center text-sm text-slate-500">Chưa có bài tập nào được giao.</li>}
          </ul>
        </Panel>
      </div>

      <Panel title="Ghi chú của giáo viên" sub="Giáo viên chủ nhiệm ghi lại khi theo dõi học viên" flush>
        <ul className="divide-y divide-slate-100">
          {notes.map((n) => (
            <li key={n.id} className="px-5 py-3">
              <p className="text-[12px] text-slate-500">
                <Status tone={n.kind === 'REMINDER' ? 'amber' : n.kind === 'CONTACT' ? 'blue' : 'gray'}>{NOTE_KIND[n.kind] ?? n.kind}</Status> {formatDate(n.date)} · {n.teacherName}
                {n.className && ` · ${n.className}`}
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{n.text}</p>
            </li>
          ))}
          {!notes.length && <li className="px-5 py-8 text-center text-sm text-slate-500">Chưa có ghi chú.</li>}
        </ul>
      </Panel>
    </div>
  );
};
