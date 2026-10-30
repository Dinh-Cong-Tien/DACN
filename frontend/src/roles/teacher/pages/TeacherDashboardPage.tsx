import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, ClipboardList, ChevronRight, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_CLASSES, MOCK_SUBMISSIONS, MOCK_ASSIGNMENTS, MOCK_CLASS_STUDENTS, CLASS_WEEKLY_PROGRESS } from '@/shared/mocks';
import { cn, formatDate, timeAgo } from '@/shared/utils';
import { Avatar, AvatarGroup, Badge, Button, Card, MiniBars, ProgressBar } from '@/shared/components/ui';
import { CountUp, Reveal, Stagger } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
};

const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
const TYPE_LABEL: Record<string, string> = { MOCK_TEST: 'Đề thi', PRACTICE: 'Luyện tập', ESSAY: 'Bài viết', SPEAKING: 'Bài nói' };
const STATUS_TONE: Record<string, 'amber' | 'rose'> = { WARNING: 'amber', RISK: 'rose' };
const STATUS_LABEL: Record<string, string> = { WARNING: 'Cần nhắc', RISK: 'Nguy cơ' };

export const TeacherDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan giáo viên');
  const user = useAuthStore((s) => s.user);
  const totalStudents = MOCK_CLASSES.reduce((a, c) => a + c.studentsCount, 0);
  const pending = MOCK_SUBMISSIONS.filter((s) => s.status === 'PENDING');
  const avgCompletion = Math.round(MOCK_CLASSES.reduce((a, c) => a + c.completionRate, 0) / MOCK_CLASSES.length);
  const upcoming = [...MOCK_ASSIGNMENTS].filter((a) => a.status === 'OPEN').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const attention = MOCK_CLASS_STUDENTS.filter((s) => s.status !== 'GOOD');
  const firstName = user?.fullName.split(' ').slice(-1)[0] ?? 'thầy cô';
  const featured = MOCK_CLASSES[0];
  const classStudents = MOCK_CLASS_STUDENTS.slice(0, 6);
  const now = Date.now();

  return (
    <div className="space-y-10">
      {/* ===== Chào + dải số liệu ===== */}
      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-end animate-fade-up">
        <div className="space-y-4">
          <p className="text-sm font-bold text-indigo-700 capitalize">{today}</p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
            {greeting()}, {firstName}. Có <span className="mark">{pending.length} bài</span> đang chờ chấm.
          </h1>
          <p className="text-base text-slate-500 max-w-xl">
            {MOCK_CLASSES.length} lớp đang dạy với {totalStudents} học viên. {upcoming.length} bài tập sắp đến hạn, tỷ lệ hoàn thành trung bình {avgCompletion}%.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button to="/teacher/grading" variant="gradient" size="lg" leftIcon={<PenTool className="w-4 h-4" />}>
              Chấm bài ({pending.length})
            </Button>
            <Button to="/teacher/assignments" variant="outline" size="lg" leftIcon={<ClipboardList className="w-4 h-4" />}>
              Giao bài mới
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-900/10 p-2 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-900/10">
          {[
            { label: 'Lớp đang dạy', value: MOCK_CLASSES.length, suffix: 'lớp', sub: 'Học kỳ 1 · 2026' },
            { label: 'Học viên', value: totalStudents, suffix: 'HV', sub: '+8% so với tháng trước' },
            { label: 'Chờ chấm', value: pending.length, suffix: 'bài', sub: 'Writing & Speaking' },
            { label: 'Hoàn thành TB', value: avgCompletion, suffix: '%', sub: '+4% tuần này' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="font-display text-3xl font-extrabold text-slate-900 mt-2 leading-none">
                <CountUp value={s.value} />
                <span className="font-sans text-xs font-semibold text-slate-400 ml-1">{s.suffix}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5 truncate">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Khối nhấn: lớp đang dạy + tiến độ tuần ===== */}
      <section className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-indigo-600 text-white grid md:grid-cols-[1fr_300px] min-h-[300px]">
            <div aria-hidden className="absolute inset-0 bg-dots opacity-15" />
            <div className="relative p-7 md:p-9 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <span className="sticker !bg-amber-300 !shadow-none !border-transparent">Lớp đang dạy · {featured.schedule}</span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">{featured.name}</h2>
                <p className="text-indigo-100 text-sm max-w-md leading-relaxed">
                  Mã lớp <span className="font-mono font-bold text-white">{featured.code}</span> · {featured.studentsCount} học viên · điểm TB {featured.avgScore} · chuyên cần {featured.attendanceRate}%
                </p>
                <div className="flex items-center gap-3">
                  <AvatarGroup names={classStudents.map((s) => s.name)} srcs={classStudents.map((s) => s.avatarUrl)} size="sm" max={5} />
                  <span className="text-xs text-indigo-100">+{featured.studentsCount - 5} học viên khác</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Hoàn thành bài tập</span>
                  <span>{featured.completionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-amber-300 rounded-full transition-[width] duration-1000 ease-spring" style={{ width: `${featured.completionRate}%` }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="white" size="md" to="/teacher/grading" leftIcon={<PenTool className="w-4 h-4" />}>
                    Chấm bài
                  </Button>
                  <Button variant="ghost" size="md" to={`/teacher/classes/${featured.id}`} className="text-white hover:bg-white/10" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Xem lớp
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <Img src={PHOTOS.classroom} alt="Lớp học OrbiLingo" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-600/20 to-transparent" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Card className="h-full flex flex-col justify-between" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hoàn thành bài tập</p>
                <p className="font-display text-5xl font-extrabold text-slate-900 mt-2 leading-none">{CLASS_WEEKLY_PROGRESS[CLASS_WEEKLY_PROGRESS.length - 1].value}%</p>
                <p className="text-sm text-slate-500 mt-2">
                  tuần này · <span className="text-emerald-700 font-bold">+{CLASS_WEEKLY_PROGRESS[CLASS_WEEKLY_PROGRESS.length - 1].value - CLASS_WEEKLY_PROGRESS[0].value}</span> điểm so với tuần 1
                </p>
              </div>
              <Badge tone="emerald">4 lớp</Badge>
            </div>
            <MiniBars data={CLASS_WEEKLY_PROGRESS.map((w, i) => ({ ...w, tone: i === CLASS_WEEKLY_PROGRESS.length - 1 ? 'violet' : 'indigo' }))} height={110} className="mt-4" />
            <Link to="/teacher/analytics" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:gap-2 transition-all mt-3">
              Thống kê lớp học <ChevronRight className="w-4 h-4" />
            </Link>
          </Card>
        </Reveal>
      </section>

      {/* ===== Lớp học của tôi ===== */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Học kỳ 1 · 2026</p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Lớp học của tôi</h2>
          </div>
          <Link to="/teacher/classes" className="text-sm font-bold text-slate-700 hover:text-indigo-700 inline-flex items-center gap-1">
            Tất cả lớp <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Stagger className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {MOCK_CLASSES.map((c) => (
            <Link key={c.id} to={`/teacher/classes/${c.id}`} className="group block rounded-3xl overflow-hidden bg-white border border-slate-900/10 card-hover">
              <div className="relative">
                <Img src={c.coverUrl ?? PHOTOS.classroom} alt={c.name} ratio="video" fallbackClass="bg-indigo-100" />
                <div className="absolute top-3 left-3">
                  <Badge tone="slate" solid size="xs">
                    {c.examType}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5">
                  {c.studentsCount} HV · {c.assignmentsCount} bài tập · {c.schedule}
                </p>
                <div className="mt-3">
                  <ProgressBar value={c.completionRate} size="xs" tone="indigo" />
                </div>
              </div>
            </Link>
          ))}
        </Stagger>
      </section>

      {/* ===== Bài nộp · Hạn nộp · Học sinh cần chú ý ===== */}
      <section className="grid lg:grid-cols-3 gap-6">
        <Reveal>
          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Bài nộp cần chấm</h3>
                <p className="text-sm text-slate-500">Tự luận Writing & Speaking</p>
              </div>
              <Button size="xs" variant="soft" to="/teacher/grading">
                Chấm
              </Button>
            </div>
            <ul className="divide-y divide-slate-900/10">
              {pending.map((s) => (
                <li key={s.id}>
                  <Link to={`/teacher/grading/${s.id}`} className="py-3 flex items-center gap-3 group">
                    <Avatar name={s.studentName} src={s.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{s.studentName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{s.assignmentTitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge tone="indigo" size="xs">
                        {TYPE_LABEL[s.type]}
                      </Badge>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(s.submittedAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Sắp đến hạn</h3>
                <p className="text-sm text-slate-500">Bài tập đang mở</p>
              </div>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <ul className="divide-y divide-slate-900/10">
              {upcoming.map((a) => {
                const overdue = new Date(a.dueDate).getTime() < now;
                return (
                  <li key={a.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{a.className}</p>
                      </div>
                      <span className={cn('inline-flex items-center gap-1 text-[11px] font-bold shrink-0', overdue ? 'text-rose-600' : 'text-slate-600')}>
                        <Clock className="w-3 h-3" /> {formatDate(a.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <ProgressBar value={(a.submitted / a.total) * 100} size="xs" tone={overdue ? 'rose' : 'indigo'} className="flex-1" />
                      <span className="text-[11px] font-bold text-slate-600 shrink-0">
                        {a.submitted}/{a.total}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={160}>
          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Học sinh cần chú ý</h3>
                <p className="text-sm text-slate-500">Hoàn thành thấp hoặc đứt chuỗi</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <ul className="divide-y divide-slate-900/10">
              {attention.map((s) => (
                <li key={s.id} className="py-3 flex items-center gap-3">
                  <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Hoàn thành {s.completion}% · chuỗi {s.streak} ngày · {timeAgo(s.lastActive)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[s.status]} size="xs">
                    {STATUS_LABEL[s.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </section>
    </div>
  );
};
