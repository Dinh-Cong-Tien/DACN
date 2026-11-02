import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BarChart3, CalendarCheck, CheckSquare, ClipboardList, Database, Eye, FileCheck2, MessageSquareWarning, PenTool, School, TrendingDown, TrendingUp, UserRoundX, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { DEPT_CLASSES, DEPT_SESSIONS, MOCK_APPROVALS, MOCK_CLASS_REPORTS, MOCK_COMPLAINTS, MOCK_GRADING_REVIEWS, MOCK_OBSERVATIONS, MOCK_SUBJECTS, MOCK_TEACHERS, teacherByName } from '@/shared/mocks';
import type { ApprovalRequest, ClassReport } from '@/shared/types';
import { cn, formatNumber, timeAgo } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { BarChart } from '@/shared/components/charts/Charts';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { Figures, GradientTail, IconTile, Meter, Panel, PanelLink, Status, TBtn, tbl, type Tone } from '@/roles/teacher/components/TeacherKit';
import { roomConflicts } from './HeadSchedulePage';

const WEEKDAY = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dm = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;

const TYPE_LABEL: Record<ApprovalRequest['type'], string> = { TEST: 'Đề thi', QUESTION: 'Câu hỏi', LESSON: 'Bài giảng', POST: 'Bài viết' };
const TYPE_CHIP: Record<ApprovalRequest['type'], string> = { TEST: 'bg-indigo-400/20 text-indigo-100', QUESTION: 'bg-violet-400/20 text-violet-100', LESSON: 'bg-sky-400/20 text-sky-100', POST: 'bg-amber-400/20 text-amber-100' };
const GRADE_CLS: Record<ClassReport['grade'], string> = { A: 'bg-emerald-500/10 text-emerald-700', B: 'bg-sky-500/10 text-sky-700', C: 'bg-amber-500/15 text-amber-800', D: 'bg-rose-500/10 text-rose-700' };

export const HeadDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan bộ môn');
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const today = iso(now);
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const pending = MOCK_APPROVALS.filter((a) => a.status === 'PENDING');
  const newComplaints = MOCK_COMPLAINTS.filter((c) => c.status === 'NEW');
  const reviews = MOCK_GRADING_REVIEWS.filter((r) => r.status === 'PENDING');
  const planned = MOCK_OBSERVATIONS.filter((o) => o.status === 'PLANNED').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
  const conflicts = roomConflicts(DEPT_SESSIONS.filter((s) => s.date >= iso(monday) && s.date <= iso(sunday)));
  const orphan = DEPT_CLASSES.filter((c) => teacherByName(c.teacherName)?.status !== 'ACTIVE');
  const activeTeachers = MOCK_TEACHERS.filter((t) => t.status === 'ACTIVE');
  const totalStudents = DEPT_CLASSES.reduce((a, c) => a + c.studentsCount, 0);
  const totalQuestions = MOCK_SUBJECTS.reduce((a, s) => a + s.questionsCount, 0);
  const toeicReports = MOCK_CLASS_REPORTS.filter((r) => r.avgScore > 10);
  const lowAttendance = MOCK_CLASS_REPORTS.filter((r) => r.attendance < 80);

  const todos: { icon: React.ElementType; tone: Tone; text: string; to: string; cta: string }[] = [
    ...(pending.length ? [{ icon: CheckSquare, tone: 'indigo' as Tone, text: `Duyệt ${pending.length} học liệu giáo viên gửi lên`, to: '/head/approvals', cta: 'Duyệt' }] : []),
    ...(reviews.length ? [{ icon: PenTool, tone: 'violet' as Tone, text: `Kiểm định ${reviews.length} bài Viết / Nói giáo viên đã chấm`, to: '/head/grading-review', cta: 'Chấm lại' }] : []),
    ...(newComplaints.length ? [{ icon: MessageSquareWarning, tone: 'rose' as Tone, text: `Tiếp nhận ${newComplaints.length} khiếu nại mới từ học viên`, to: '/head/complaints', cta: 'Xử lý' }] : []),
    ...(conflicts.length ? [{ icon: AlertTriangle, tone: 'amber' as Tone, text: `${conflicts.length} buổi trùng phòng trong tuần này`, to: '/head/schedule', cta: 'Lịch dạy' }] : []),
    ...(planned.length ? [{ icon: Eye, tone: 'sky' as Tone, text: `Dự giờ ${planned[0].teacher} · ${WEEKDAY[new Date(planned[0].date).getDay()]} ${dm(planned[0].date)} lúc ${planned[0].start}`, to: '/head/schedule', cta: 'Xem' }] : []),
    ...orphan.map((c) => ({ icon: UserRoundX, tone: 'emerald' as Tone, text: `Phân công lại giáo viên cho lớp ${c.name}`, to: `/head/classes/${c.id}`, cta: 'Phân công' })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-amber-600">
            {WEEKDAY[now.getDay()]}, {dm(today)}/{now.getFullYear()} · Học kỳ 1, năm học 2026–2027
          </p>
          <h1 className="mt-1.5 font-display text-[2rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 md:text-[2.6rem]">
            <GradientTail text="Tổng quan bộ môn" />
          </h1>
          <p className="mt-1 text-[15px] text-slate-500">
            {user?.fullName} · {MOCK_SUBJECTS.length} môn học · {DEPT_CLASSES.length} lớp · {MOCK_TEACHERS.length} giáo viên
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TBtn to="/head/schedule" icon={<CalendarCheck />}>
            Lịch dạy bộ môn
          </TBtn>
          <TBtn to="/head/reports" variant="primary" icon={<BarChart3 />}>
            Báo cáo
          </TBtn>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Học liệu chờ duyệt */}
        <section className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_20px_40px_-24px_rgba(16,24,40,0.6)]">
          <div className="absolute inset-0 opacity-50">
            <Img src={PHOTOS.lecture} alt="Giảng đường" wrapperClass="h-full" fallbackClass="bg-slate-800" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-indigo-950/80 to-fuchsia-900/30" />
          <div className="relative flex h-full flex-col justify-between gap-6 p-6 md:p-7">
            <div>
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-indigo-200">
                <FileCheck2 className="h-4 w-4" /> Chờ phê duyệt · {pending.length} học liệu
              </p>
              <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight md:text-[2rem]">Học liệu giáo viên gửi lên</h2>
              <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-slate-200">Thẩm định đề thi, câu hỏi và bài giảng trước khi xuất bản tới học viên toàn bộ môn.</p>
              <ul className="mt-5 divide-y divide-white/10 rounded-xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm">
                {pending.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={a.author} src={teacherByName(a.author)?.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.title}</p>
                      <p className="truncate text-xs text-slate-300">
                        {a.author} · {timeAgo(a.submittedAt)}
                      </p>
                    </div>
                    <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold', TYPE_CHIP[a.type])}>{TYPE_LABEL[a.type]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/head/approvals" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-indigo-50">
                <CheckSquare className="h-4 w-4" /> Mở bàn phê duyệt
              </Link>
              <Link to="/head/grading-review" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10">
                <PenTool className="h-4 w-4" /> Kiểm định chấm ({reviews.length})
              </Link>
            </div>
          </div>
        </section>

        {/* Việc cần xử lý */}
        <Panel title="Việc cần xử lý hôm nay" sub={`${todos.length} việc`} icon={ClipboardList} tone="indigo" flush>
          <ul className="divide-y divide-slate-100">
            {todos.map((t) => (
              <li key={t.text} className="flex items-center gap-3 px-5 py-3">
                <IconTile icon={t.icon} tone={t.tone} size="sm" />
                <p className="min-w-0 flex-1 text-sm text-slate-800">{t.text}</p>
                <TBtn size="sm" to={t.to}>
                  {t.cta}
                </TBtn>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Figures
        items={[
          { label: 'Lớp đang mở', value: DEPT_CLASSES.length, note: `${totalStudents} học viên`, icon: School, tone: 'indigo' },
          { label: 'Giáo viên', value: MOCK_TEACHERS.length, note: `${activeTeachers.length} đang giảng dạy`, icon: Users, tone: 'emerald' },
          { label: 'Chờ kiểm định chấm', value: reviews.length, note: 'bài Viết / Nói', icon: PenTool, tone: 'violet' },
          { label: 'Khiếu nại mới', value: newComplaints.length, note: `${MOCK_COMPLAINTS.filter((c) => c.status === 'IN_REVIEW').length} đang phúc khảo`, icon: MessageSquareWarning, tone: 'rose' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel title="Điểm trung bình các lớp TOEIC" sub="Kỳ thi thử gần nhất · ETS 2024 Test 2" icon={BarChart3} tone="sky" action={<PanelLink to="/head/reports">Báo cáo</PanelLink>}>
          <BarChart ariaLabel="Điểm trung bình các lớp TOEIC" data={toeicReports.map((r) => ({ label: r.className.replace('TOEIC ', '').replace('Ngữ pháp nền tảng ', 'NP ').replace(' Intensive', '').replace('Foundation Sáng', 'Found.'), value: r.avgScore }))} height={220} unit=" điểm" />
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Cao nhất</p>
              <p className="font-display text-lg font-extrabold text-slate-900">{Math.max(...toeicReports.map((r) => r.avgScore))}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Thấp nhất</p>
              <p className="font-display text-lg font-extrabold text-slate-900">{Math.min(...toeicReports.map((r) => r.avgScore))}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Lớp chuyên cần &lt; 80%</p>
              <p className="font-display text-lg font-extrabold text-rose-600">{lowAttendance.length}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Ngân hàng câu hỏi" sub={`${formatNumber(totalQuestions)} câu đã thẩm định`} icon={Database} tone="amber" action={<PanelLink to="/head/question-bank">Mở</PanelLink>}>
          <ul className="space-y-4">
            {MOCK_SUBJECTS.map((s) => (
              <li key={s.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-slate-800">{s.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-slate-900">{formatNumber(s.questionsCount)}</span>
                </div>
                <Meter value={(s.questionsCount / Math.max(...MOCK_SUBJECTS.map((x) => x.questionsCount))) * 100} tone={s.examType === 'TOEIC' ? 'indigo' : 'green'} />
                <p className="mt-1 text-xs text-slate-500">
                  {s.code} · {s.classesCount} lớp · {s.teachersCount} giáo viên
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Giáo viên bộ môn" sub={`${activeTeachers.length}/${MOCK_TEACHERS.length} đang giảng dạy`} icon={Users} tone="emerald" action={<PanelLink to="/head/teachers">Tất cả</PanelLink>} flush>
          <ul className="divide-y divide-slate-100">
            {MOCK_TEACHERS.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={t.name} src={t.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link to={`/head/teachers/${t.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-700">
                    {t.name}
                  </Link>
                  <p className="truncate text-xs text-slate-500">
                    {t.subject} · {t.classesCount} lớp · {t.studentsCount} HV
                  </p>
                </div>
                <Status tone={t.status === 'ACTIVE' ? 'green' : t.status === 'PENDING' ? 'amber' : 'red'}>{t.status === 'ACTIVE' ? 'Đang dạy' : t.status === 'PENDING' ? 'Chờ duyệt' : 'Đã khoá'}</Status>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Dự giờ & khiếu nại" sub="Lịch dự giờ sắp tới và đơn mới" icon={Eye} tone="rose" flush>
          <ul className="divide-y divide-slate-100">
            {planned.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-12 shrink-0 rounded-xl bg-sky-500/10 py-1.5 text-center">
                  <p className="text-[10px] font-semibold uppercase text-sky-700">{WEEKDAY[new Date(o.date).getDay()].replace('Thứ ', 'T.')}</p>
                  <p className="font-display text-base font-extrabold leading-none text-slate-900">{o.date.slice(8, 10)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{o.topic}</p>
                  <p className="truncate text-xs text-slate-500">
                    Dự giờ {o.teacher} · {DEPT_CLASSES.find((c) => c.id === o.classId)?.name} · {o.start}
                  </p>
                </div>
                <Status tone="blue">Dự giờ</Status>
              </li>
            ))}
            {newComplaints.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                <IconTile icon={MessageSquareWarning} tone="rose" size="sm" className="!h-10 !w-12" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.subject}</p>
                  <p className="truncate text-xs text-slate-500">
                    {c.student} · {c.questionRef} · {timeAgo(c.createdAt)}
                  </p>
                </div>
                <Status tone="red">Mới</Status>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Xếp loại lớp" sub="Theo điểm thi thử và chuyên cần" icon={School} tone="violet" action={<PanelLink to="/head/classes">Danh sách lớp</PanelLink>} flush>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Lớp</th>
                <th className={cn(tbl.th, 'max-md:hidden')}>Giáo viên</th>
                <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                <th className={cn(tbl.th, 'w-48 max-sm:hidden')}>Chuyên cần</th>
                <th className={cn(tbl.th, 'text-right')}>Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLASS_REPORTS.map((r) => (
                <tr key={r.classId} className={tbl.tr}>
                  <td className={tbl.td}>
                    <div className="flex items-center gap-3">
                      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold', GRADE_CLS[r.grade])}>{r.grade}</span>
                      <div className="min-w-0">
                        <Link to={`/head/classes/${r.classId}`} className="block truncate font-semibold text-slate-900 hover:text-indigo-700">
                          {r.className}
                        </Link>
                        <p className="text-xs text-slate-500">{r.students} học viên</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(tbl.td, 'max-md:hidden')}>
                    <div className="flex items-center gap-2">
                      <Avatar name={r.teacher} src={teacherByName(r.teacher)?.avatarUrl} size="xs" />
                      <span className="text-slate-700">{r.teacher}</span>
                    </div>
                  </td>
                  <td className={cn(tbl.td, 'text-right font-semibold tabular-nums text-slate-900')}>{r.avgScore}</td>
                  <td className={cn(tbl.td, 'max-sm:hidden')}>
                    <div className="flex items-center gap-2">
                      <Meter value={r.attendance} tone={r.attendance < 75 ? 'red' : r.attendance < 85 ? 'amber' : 'green'} className="flex-1" />
                      <span className="w-10 text-right text-xs tabular-nums text-slate-600">{r.attendance}%</span>
                    </div>
                  </td>
                  <td className={cn(tbl.td, 'text-right')}>
                    <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold', r.trend >= 0 ? 'text-emerald-700' : 'text-rose-600')}>
                      {r.trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {r.trend >= 0 ? '+' : ''}
                      {r.trend}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

    </div>
  );
};
