import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, PenTool } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { MOCK_ASSIGNMENTS, MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_SUBMISSIONS } from '@/shared/mocks';
import { cn, formatDate, formatDateTime, timeAgo } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { DAY_NAME, Figures, Meter, Panel, PanelLink, Status, TBtn, TPageHead, tbl, todayCode, weekSessions } from '../components/TeacherKit';

const TYPE_LABEL: Record<string, string> = { MOCK_TEST: 'Đề thi thử', PRACTICE: 'Luyện tập', ESSAY: 'Bài viết', SPEAKING: 'Bài nói' };
const todayRaw = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

export const TeacherDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan giáo viên');
  const totalStudents = MOCK_CLASSES.reduce((a, c) => a + c.studentsCount, 0);
  const toGrade = MOCK_SUBMISSIONS.filter((s) => s.status !== 'GRADED');
  const late = toGrade.filter((s) => s.status === 'LATE').length;
  const avgCompletion = Math.round(MOCK_CLASSES.reduce((a, c) => a + c.completionRate, 0) / MOCK_CLASSES.length);
  const upcoming = MOCK_ASSIGNMENTS.filter((a) => a.status === 'OPEN').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const watch = MOCK_CLASS_STUDENTS.filter((s) => s.status !== 'GOOD').sort((a, b) => a.completion - b.completion);
  const sessions = weekSessions(MOCK_CLASSES);
  const todayDay = todayCode();
  const now = Date.now();

  return (
    <div className="space-y-6">
      <TPageHead
        title="Tổng quan"
        sub={`${today} · Học kỳ 1, năm học 2026–2027`}
        actions={
          <>
            <TBtn to="/teacher/assignments" icon={<ClipboardList />}>
              Giao bài tập
            </TBtn>
            <TBtn to="/teacher/grading" variant="primary" icon={<PenTool />}>
              Chấm bài ({toGrade.length})
            </TBtn>
          </>
        }
      />

      <Figures
        items={[
          { label: 'Lớp phụ trách', value: MOCK_CLASSES.length, note: `${sessions.length} buổi / tuần` },
          { label: 'Học viên', value: totalStudents, note: 'trên tất cả các lớp' },
          { label: 'Bài chờ chấm', value: toGrade.length, note: late ? `${late} bài nộp muộn` : 'không có bài muộn' },
          { label: 'Tỷ lệ hoàn thành bài tập', value: `${avgCompletion}%`, note: 'trung bình các lớp' },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Lịch dạy tuần này" sub="Theo lịch cố định của từng lớp" flush>
            <div className="overflow-x-auto">
              <table className={tbl.table}>
                <thead className={tbl.thead}>
                  <tr>
                    <th className={tbl.th}>Thứ</th>
                    <th className={tbl.th}>Giờ</th>
                    <th className={tbl.th}>Lớp</th>
                    <th className={tbl.th}>Phòng</th>
                    <th className={cn(tbl.th, 'text-right')}>Sĩ số</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const isToday = s.day === todayDay;
                    return (
                      <tr key={`${s.day}-${s.cls.id}`} className={cn(tbl.tr, isToday && 'bg-indigo-500/[0.05]')}>
                        <td className={cn(tbl.td, 'whitespace-nowrap')}>
                          {DAY_NAME[s.day]}
                          {isToday && <span className="ml-2 text-[12px] font-medium text-indigo-700">Hôm nay</span>}
                        </td>
                        <td className={cn(tbl.td, 'tabular-nums')}>{s.time}</td>
                        <td className={tbl.td}>
                          <Link to={`/teacher/classes/${s.cls.id}`} className="font-medium text-slate-900 hover:text-indigo-700 hover:underline underline-offset-2">
                            {s.cls.name}
                          </Link>
                        </td>
                        <td className={cn(tbl.td, 'text-slate-600')}>{s.cls.room ?? '—'}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums')}>{s.cls.studentsCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Bài chờ chấm" sub="Bài viết và bài nói học viên đã nộp" action={<PanelLink to="/teacher/grading">Mở bàn chấm</PanelLink>} flush>
            <div className="overflow-x-auto">
              <table className={tbl.table}>
                <thead className={tbl.thead}>
                  <tr>
                    <th className={tbl.th}>Học viên</th>
                    <th className={tbl.th}>Bài tập</th>
                    <th className={tbl.th}>Nộp lúc</th>
                    <th className={tbl.th} />
                  </tr>
                </thead>
                <tbody>
                  {toGrade.map((s) => (
                    <tr key={s.id} className={tbl.tr}>
                      <td className={tbl.td}>
                        <span className="flex items-center gap-2.5">
                          <Avatar name={s.studentName} src={s.avatarUrl} size="xs" />
                          <span className="whitespace-nowrap font-medium text-slate-900">{s.studentName}</span>
                        </span>
                      </td>
                      <td className={tbl.td}>
                        <p className="text-slate-800">{s.assignmentTitle}</p>
                        <p className="text-[12px] text-slate-500">{TYPE_LABEL[s.type]}</p>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap')}>
                        <p className="tabular-nums text-slate-700">{formatDateTime(s.submittedAt)}</p>
                        {s.status === 'LATE' && <p className="text-[12px] text-rose-600">Nộp muộn</p>}
                      </td>
                      <td className={cn(tbl.td, 'text-right')}>
                        <TBtn to={`/teacher/grading/${s.id}`} size="sm">
                          Chấm
                        </TBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Hạn nộp sắp tới" action={<PanelLink to="/teacher/assignments">Tất cả</PanelLink>} flush>
            <ul className="divide-y divide-slate-100">
              {upcoming.map((a) => {
                const overdue = new Date(a.dueDate).getTime() < now;
                const pct = Math.round((a.submitted / a.total) * 100);
                return (
                  <li key={a.id} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-medium text-slate-900">{a.title}</p>
                      <span className={cn('shrink-0 text-[12px] tabular-nums', overdue ? 'text-rose-600' : 'text-slate-500')}>{overdue ? 'Quá hạn' : formatDate(a.dueDate, { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-slate-500">{a.className}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Meter value={pct} tone={overdue ? 'red' : 'indigo'} className="flex-1" />
                      <span className="w-12 shrink-0 text-right text-[12px] tabular-nums text-slate-600">
                        {a.submitted}/{a.total}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Học viên cần theo dõi" sub="Lớp TOEIC 650+ K12" flush>
            <ul className="divide-y divide-slate-100">
              {watch.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{s.name}</p>
                    <p className="text-[12px] text-slate-500">
                      Hoàn thành {s.completion}% · hoạt động {timeAgo(s.lastActive).toLowerCase()}
                    </p>
                  </div>
                  <Status tone={s.status === 'RISK' ? 'red' : 'amber'}>{s.status === 'RISK' ? 'Nguy cơ' : 'Cần nhắc'}</Status>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Lớp phụ trách" action={<PanelLink to="/teacher/classes">Quản lý lớp</PanelLink>} flush>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Lớp</th>
                <th className={tbl.th}>Lịch học</th>
                <th className={cn(tbl.th, 'text-right')}>Sĩ số</th>
                <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                <th className={cn(tbl.th, 'w-44')}>Hoàn thành bài tập</th>
                <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLASSES.map((c) => (
                <tr key={c.id} className={tbl.tr}>
                  <td className={tbl.td}>
                    <Link to={`/teacher/classes/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-700 hover:underline underline-offset-2">
                      {c.name}
                    </Link>
                    <p className="text-[12px] text-slate-500">
                      {c.examType} · {c.code}
                    </p>
                  </td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{c.schedule}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.studentsCount}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.avgScore}</td>
                  <td className={tbl.td}>
                    <span className="flex items-center gap-2">
                      <Meter value={c.completionRate} className="flex-1" />
                      <span className="w-9 text-right text-[13px] tabular-nums text-slate-600">{c.completionRate}%</span>
                    </span>
                  </td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.attendanceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
