import React from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, PenTool, CheckCircle2, ArrowRight, Clock, AlertTriangle, ClipboardList } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_CLASSES, MOCK_SUBMISSIONS, MOCK_ASSIGNMENTS, MOCK_CLASS_STUDENTS, CLASS_WEEKLY_PROGRESS } from '@/shared/mocks';
import { cn, formatDate, timeAgo } from '@/shared/utils';
import { Avatar, Badge, Button, Card, CardHeader, MiniBars, PageHeader, ProgressBar, StatCard } from '@/shared/components/ui';
import { GradientPanel } from '@/shared/components/ui';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
};

export const TeacherDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan giáo viên');
  const user = useAuthStore((s) => s.user);
  const totalStudents = MOCK_CLASSES.reduce((a, c) => a + c.studentsCount, 0);
  const pending = MOCK_SUBMISSIONS.filter((s) => s.status === 'PENDING');
  const avgCompletion = Math.round(MOCK_CLASSES.reduce((a, c) => a + c.completionRate, 0) / MOCK_CLASSES.length);
  const upcoming = [...MOCK_ASSIGNMENTS].filter((a) => a.status === 'OPEN').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const attention = MOCK_CLASS_STUDENTS.filter((s) => s.status !== 'GOOD');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user?.fullName.split(' ').slice(-1)[0] ?? 'thầy cô'} 👋`}
        description="Tổng quan lớp học, bài nộp cần chấm và tiến độ học viên trong tuần này."
        actions={
          <>
            <Button variant="outline" to="/teacher/assignments" leftIcon={<ClipboardList className="w-4 h-4" />}>
              Giao bài mới
            </Button>
            <Button to="/teacher/grading" leftIcon={<PenTool className="w-4 h-4" />}>
              Chấm bài ({pending.length})
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Lớp đang dạy" value={MOCK_CLASSES.length} icon={<Users />} tone="emerald" hint="Học kỳ này" />
        <StatCard label="Tổng học viên" value={totalStudents} icon={<GraduationCap />} tone="indigo" delta={8} deltaLabel="so với tháng trước" />
        <StatCard label="Bài chờ chấm" value={pending.length} icon={<PenTool />} tone="amber" hint="Tự luận Speaking/Writing" />
        <StatCard label="Hoàn thành TB" value={avgCompletion} suffix="%" icon={<CheckCircle2 />} tone="sky" delta={4} deltaLabel="tuần này" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Tỷ lệ hoàn thành bài tập theo tuần" subtitle="Trung bình tất cả các lớp (%)" />
          <MiniBars data={CLASS_WEEKLY_PROGRESS.map((d) => ({ ...d, tone: 'emerald' as const }))} max={100} height={150} />
        </Card>
        <GradientPanel tone="emerald" className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Cần chấm sớm</p>
          <h3 className="text-3xl font-black mt-1">{pending.length} bài nộp</h3>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">Học viên đang chờ phản hồi của bạn. Chấm sớm giúp duy trì động lực học tập của lớp.</p>
          <Button to="/teacher/grading" variant="secondary" size="sm" className="mt-5 !bg-white !text-emerald-700 hover:!bg-emerald-50" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Vào bàn chấm bài
          </Button>
        </GradientPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <CardHeader title="Lớp học của tôi" subtitle={`${MOCK_CLASSES.length} lớp đang hoạt động`} action={<Button size="xs" variant="ghost" to="/teacher/classes">Tất cả</Button>} />
          <div className="space-y-2.5">
            {MOCK_CLASSES.map((c, i) => (
              <Link key={c.id} to={`/teacher/classes/${c.id}`} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all hover:translate-x-0.5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br text-white font-black flex items-center justify-center shrink-0', c.gradient)}>{c.examType === 'TOEIC' ? 'T' : 'V'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.studentsCount} HV · {c.schedule}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-slate-900">{c.avgScore}</p>
                  <p className="text-[10px] text-slate-400">điểm TB</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Bài nộp mới cần chấm" subtitle="Tự luận Writing & Speaking" action={<Button size="xs" variant="ghost" to="/teacher/grading">Tất cả</Button>} />
          <div className="space-y-2.5">
            {pending.map((s, i) => (
              <Link key={s.id} to={`/teacher/grading/${s.id}`} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <Avatar name={s.studentName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{s.studentName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.assignmentTitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge tone={s.type === 'ESSAY' ? 'violet' : 'sky'} size="xs">{s.type}</Badge>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(s.submittedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <CardHeader title="Bài tập sắp hết hạn" subtitle="Theo dõi tỷ lệ nộp bài" icon={<Clock />} />
          <div className="space-y-4">
            {upcoming.map((a) => {
              const overdue = new Date(a.dueDate) < new Date();
              return (
                <div key={a.id}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                      <p className="text-[11px] text-slate-500">{a.className} · hạn {formatDate(a.dueDate)}</p>
                    </div>
                    <Badge tone={overdue ? 'rose' : 'emerald'} size="xs">{overdue ? 'Quá hạn' : `${a.submitted}/${a.total}`}</Badge>
                  </div>
                  <ProgressBar value={(a.submitted / a.total) * 100} size="sm" tone={overdue ? 'rose' : 'emerald'} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '240ms' }}>
          <CardHeader title="Học viên cần chú ý" subtitle="Đứt chuỗi học hoặc hoàn thành thấp" icon={<AlertTriangle />} />
          <div className="space-y-2.5">
            {attention.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Avatar name={s.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-500">Hoàn thành {s.completion}% · chuỗi {s.streak} ngày · {timeAgo(s.lastActive)}</p>
                </div>
                <Badge tone={s.status === 'RISK' ? 'rose' : 'amber'} dot size="xs">{s.status === 'RISK' ? 'Nguy cơ' : 'Cảnh báo'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
