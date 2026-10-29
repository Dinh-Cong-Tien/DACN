import React from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, PenTool, CheckCircle2, ArrowRight, Clock, AlertTriangle, ClipboardList, Calendar } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_CLASSES, MOCK_SUBMISSIONS, MOCK_ASSIGNMENTS, MOCK_CLASS_STUDENTS, CLASS_WEEKLY_PROGRESS } from '@/shared/mocks';
import { formatDate, timeAgo } from '@/shared/utils';
import { Avatar, Badge, Button, Card, CardHeader, MiniBars, ProgressBar, StatCard } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
};

const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());

export const TeacherDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan giáo viên');
  const user = useAuthStore((s) => s.user);
  const totalStudents = MOCK_CLASSES.reduce((a, c) => a + c.studentsCount, 0);
  const pending = MOCK_SUBMISSIONS.filter((s) => s.status === 'PENDING');
  const avgCompletion = Math.round(MOCK_CLASSES.reduce((a, c) => a + c.completionRate, 0) / MOCK_CLASSES.length);
  const upcoming = [...MOCK_ASSIGNMENTS].filter((a) => a.status === 'OPEN').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const attention = MOCK_CLASS_STUDENTS.filter((s) => s.status !== 'GOOD');
  const firstName = user?.fullName.split(' ').slice(-1)[0] ?? 'thầy cô';

  return (
    <div className="space-y-6">
      {/* Hero chào hỏi: ảnh thật + số liệu lớn */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 animate-fade-down">
        <Card hard tone="cream" padding="lg" className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-dots opacity-40" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar name={user?.fullName ?? 'GV'} src={user?.avatarUrl} size="xl" ring className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 capitalize">{today}</p>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 mt-1 leading-tight">
                {greeting()}, <span className="mark">{firstName}</span>!
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Hôm nay có <b className="text-slate-900">{pending.length} bài tự luận</b> đang chờ chấm và <b className="text-slate-900">{upcoming.length} bài tập</b> sắp đến hạn.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button to="/teacher/grading" variant="gradient" size="sm" leftIcon={<PenTool className="w-4 h-4" />}>
                  Chấm bài ({pending.length})
                </Button>
                <Button to="/teacher/assignments" variant="outline" size="sm" leftIcon={<ClipboardList className="w-4 h-4" />}>
                  Giao bài mới
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <div className="photo-frame tilt-2 relative animate-tilt-in min-h-[200px]">
          <Img src={PHOTOS.classroom} alt="Lớp học OrbiLingo" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-200" />
          <span className="sticker tilt-1 absolute left-4 bottom-4 !bg-amber-300">Lớp TOEIC 650+ K12 · T2–T4–T6</span>
        </div>
      </section>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Lớp đang dạy" value={MOCK_CLASSES.length} icon={<Users />} tone="emerald" hint="Học kỳ 1 · 2026" />
        <StatCard label="Tổng học viên" value={totalStudents} icon={<GraduationCap />} tone="indigo" delta={8} deltaLabel="so với tháng trước" />
        <StatCard label="Bài chờ chấm" value={pending.length} icon={<PenTool />} tone="amber" hint="Writing & Speaking" />
        <StatCard label="Hoàn thành TB" value={avgCompletion} suffix="%" icon={<CheckCircle2 />} tone="sky" delta={4} deltaLabel="tuần này" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card hard className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Tỷ lệ hoàn thành bài tập theo tuần" subtitle="Trung bình 4 lớp · tuần 1 đến tuần 7 (%)" />
          <MiniBars data={CLASS_WEEKLY_PROGRESS.map((d) => ({ ...d, tone: 'indigo' as const }))} max={100} height={150} />
        </Card>
        <Card hard tone="coral" className="animate-fade-up flex flex-col" style={{ animationDelay: '80ms' }}>
          <p className="text-xs font-extrabold uppercase tracking-wider text-violet-100">Cần chấm sớm</p>
          <p className="font-display text-6xl font-extrabold mt-2 leading-none">{pending.length}</p>
          <p className="font-bold mt-1">bài nộp đang chờ</p>
          <p className="text-sm text-violet-100 mt-3 leading-relaxed flex-1">Bài nộp lâu nhất đã chờ {timeAgo(pending[0]?.submittedAt ?? new Date().toISOString())}. Phản hồi sớm giúp học viên giữ nhịp học.</p>
          <Button to="/teacher/grading" variant="white" size="sm" className="mt-5 self-start" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Vào bàn chấm bài
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card hard className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <CardHeader title="Lớp học của tôi" subtitle={`${MOCK_CLASSES.length} lớp đang hoạt động`} action={<Button size="xs" variant="ghost" to="/teacher/classes">Tất cả</Button>} />
          <div className="space-y-2.5">
            {MOCK_CLASSES.map((c, i) => (
              <Link key={c.id} to={`/teacher/classes/${c.id}`} className="flex items-center gap-3 p-2.5 rounded-2xl border-2 border-slate-200 hover:border-slate-900 hover:shadow-hard-sm transition-all animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <Img src={c.coverUrl} alt={c.name} wrapperClass="w-16 h-12 rounded-xl border-2 border-slate-900 shrink-0" fallbackClass="bg-indigo-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {c.schedule} · {c.studentsCount} HV
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-lg font-extrabold text-slate-900 leading-none">{c.avgScore}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">điểm TB</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card hard className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Bài nộp mới cần chấm" subtitle="Tự luận Writing & Speaking" action={<Button size="xs" variant="ghost" to="/teacher/grading">Tất cả</Button>} />
          <div className="space-y-2.5">
            {pending.map((s, i) => (
              <Link key={s.id} to={`/teacher/grading/${s.id}`} className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border-2 border-amber-200 hover:border-slate-900 hover:shadow-hard-sm transition-all animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <Avatar name={s.studentName} src={s.avatarUrl} size="md" ring />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{s.studentName}</p>
                  <p className="text-[11px] text-slate-600 truncate">{s.assignmentTitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge tone={s.type === 'ESSAY' ? 'violet' : 'sky'} size="xs">
                    {s.type === 'ESSAY' ? 'Writing' : 'Speaking'}
                  </Badge>
                  <p className="text-[10px] text-slate-500 mt-1">{timeAgo(s.submittedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card hard className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <CardHeader title="Bài tập sắp hết hạn" subtitle="Theo dõi tỷ lệ nộp bài" icon={<Clock />} />
          <div className="space-y-4">
            {upcoming.map((a) => {
              const overdue = new Date(a.dueDate) < new Date();
              return (
                <div key={a.id}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{a.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {a.className} · hạn {formatDate(a.dueDate)}
                      </p>
                    </div>
                    <Badge tone={overdue ? 'rose' : 'emerald'} size="xs">
                      {overdue ? 'Quá hạn' : `${a.submitted}/${a.total}`}
                    </Badge>
                  </div>
                  <ProgressBar value={(a.submitted / a.total) * 100} size="sm" tone={overdue ? 'rose' : 'indigo'} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card hard className="animate-fade-up" style={{ animationDelay: '240ms' }}>
          <CardHeader title="Học viên cần chú ý" subtitle="Đứt chuỗi học hoặc hoàn thành thấp" icon={<AlertTriangle />} />
          <div className="space-y-2.5">
            {attention.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <Avatar name={s.name} src={s.avatarUrl} size="sm" ring />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Hoàn thành {s.completion}% · chuỗi {s.streak} ngày · {timeAgo(s.lastActive)}
                  </p>
                </div>
                <Badge tone={s.status === 'RISK' ? 'rose' : 'amber'} dot size="xs">
                  {s.status === 'RISK' ? 'Nguy cơ' : 'Cảnh báo'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
