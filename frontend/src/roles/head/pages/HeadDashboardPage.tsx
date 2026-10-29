import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Users, CheckSquare, MessageSquareWarning, ArrowRight, School } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_SUBJECTS, MOCK_TEACHERS, MOCK_APPROVALS, MOCK_COMPLAINTS, MOCK_CLASS_REPORTS } from '@/shared/mocks';
import type { ApprovalRequest, ClassReport } from '@/shared/types';
import { timeAgo } from '@/shared/utils';
import { Avatar, AvatarGroup, Badge, Button, Card, CardHeader, MiniBars, StatCard } from '@/shared/components/ui';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';

const TYPE_TONE: Record<ApprovalRequest['type'], 'indigo' | 'violet' | 'sky' | 'amber'> = { TEST: 'indigo', QUESTION: 'violet', LESSON: 'sky', POST: 'amber' };
const TYPE_LABEL: Record<ApprovalRequest['type'], string> = { TEST: 'Đề thi', QUESTION: 'Câu hỏi', LESSON: 'Bài giảng', POST: 'Bài viết' };
const GRADE_TONE: Record<ClassReport['grade'], 'emerald' | 'sky' | 'amber' | 'rose'> = { A: 'emerald', B: 'sky', C: 'amber', D: 'rose' };

const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());

export const HeadDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan bộ môn');
  const user = useAuthStore((s) => s.user);
  const pending = MOCK_APPROVALS.filter((a) => a.status === 'PENDING');
  const newComplaints = MOCK_COMPLAINTS.filter((c) => c.status === 'NEW');
  const totalQuestions = MOCK_SUBJECTS.reduce((a, s) => a + s.questionsCount, 0);
  const activeTeachers = MOCK_TEACHERS.filter((t) => t.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Bento hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-down">
        <Card hard tone="cream" padding="lg" className="lg:col-span-7 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-dots opacity-40" />
          <div className="relative flex items-start gap-5">
            <Avatar name={user?.fullName ?? 'TBM'} src={user?.avatarUrl} size="xl" ring className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-500 capitalize">{today}</p>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 mt-1 leading-tight">
                Xin chào, <span className="mark">{user?.fullName.split(' ').slice(-1)[0] ?? 'Trưởng bộ môn'}</span>
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Bộ môn có <b className="text-slate-900">{pending.length} học liệu</b> chờ phê duyệt và <b className="text-slate-900">{newComplaints.length} khiếu nại</b> mới cần tiếp nhận.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button to="/head/approvals" variant="gradient" size="sm" leftIcon={<CheckSquare className="w-4 h-4" />}>
                  Duyệt học liệu ({pending.length})
                </Button>
                <Button to="/head/complaints" variant="outline" size="sm" leftIcon={<MessageSquareWarning className="w-4 h-4" />}>
                  Xử lý khiếu nại
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <div className="lg:col-span-5 grid grid-cols-2 gap-5">
          <div className="photo-frame relative min-h-[170px] tilt-2 animate-tilt-in">
            <Img src={PHOTOS.lecture} alt="Giảng đường" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-200" />
            <span className="sticker tilt-1 absolute left-3 bottom-3 !bg-amber-300 !text-[10px]">26 lớp đang mở</span>
          </div>
          <Card hard tone="ink" className="flex flex-col justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Giáo viên bộ môn</p>
            <p className="font-display text-5xl font-extrabold text-amber-300 leading-none">{MOCK_TEACHERS.length}</p>
            <AvatarGroup names={activeTeachers.map((t) => t.name)} srcs={activeTeachers.map((t) => t.avatarUrl ?? pravatar(40))} max={4} size="sm" />
            <p className="text-[11px] text-slate-400">{activeTeachers.length} đang hoạt động</p>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Môn học" value={MOCK_SUBJECTS.length} icon={<Library />} tone="amber" hint={`${MOCK_SUBJECTS.reduce((a, s) => a + s.classesCount, 0)} lớp đang mở`} />
        <StatCard label="Giáo viên" value={MOCK_TEACHERS.length} icon={<Users />} tone="indigo" hint={`${activeTeachers.length} đang hoạt động`} />
        <StatCard label="Chờ phê duyệt" value={pending.length} icon={<CheckSquare />} tone="violet" hint="Đề thi, câu hỏi, bài giảng" />
        <StatCard label="Khiếu nại mới" value={newComplaints.length} icon={<MessageSquareWarning />} tone="rose" hint="Cần tiếp nhận" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card hard className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Điểm trung bình các lớp" subtitle="Kỳ thi thử gần nhất · ETS 2024 Test 2 (TOEIC quy đổi)" icon={<School />} />
          <MiniBars data={MOCK_CLASS_REPORTS.filter((r) => r.avgScore > 10).map((r) => ({ label: r.className.replace('TOEIC ', ''), value: r.avgScore, tone: GRADE_TONE[r.grade] }))} height={160} />
        </Card>
        <Card hard tone="yellow" className="animate-fade-up flex flex-col" style={{ animationDelay: '80ms' }}>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Ngân hàng câu hỏi</p>
          <p className="font-display text-5xl font-extrabold mt-2 leading-none">{totalQuestions.toLocaleString('vi-VN')}</p>
          <p className="font-bold mt-1">câu hỏi đã duyệt</p>
          <p className="text-sm text-slate-800 mt-3 leading-relaxed flex-1">Phân bố trên {MOCK_SUBJECTS.length} môn học. Kiểm tra độ phủ Part/kỹ năng và duyệt câu hỏi mới của giáo viên.</p>
          <Button to="/head/question-bank" variant="secondary" size="sm" className="mt-5 self-start" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Mở ngân hàng
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card hard className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <CardHeader title="Chờ phê duyệt" subtitle="Học liệu giáo viên gửi lên" action={<Button size="xs" variant="ghost" to="/head/approvals">Tất cả</Button>} />
          <div className="space-y-2.5">
            {pending.map((a, i) => (
              <Link key={a.id} to="/head/approvals" className="block p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 hover:shadow-hard-sm transition animate-fade-up bg-white" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone={TYPE_TONE[a.type]} size="xs">
                    {TYPE_LABEL[a.type]}
                  </Badge>
                  <span className="text-[10px] text-slate-500">{timeAgo(a.submittedAt)}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-snug">{a.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">bởi {a.author}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card hard className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Khiếu nại mới" subtitle="Từ học viên" action={<Button size="xs" variant="ghost" to="/head/complaints">Tất cả</Button>} />
          <div className="space-y-2.5">
            {newComplaints.map((c, i) => (
              <Link key={c.id} to="/head/complaints" className="flex items-start gap-3 p-3 rounded-2xl border-2 border-violet-200 bg-violet-50 hover:border-slate-900 hover:shadow-hard-sm transition animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <Avatar name={c.student} src={pravatar(20 + i)} size="sm" ring />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{c.subject}</p>
                  <p className="text-[11px] text-slate-600">
                    {c.student} · {c.questionRef}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card hard className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <CardHeader title="Xếp loại lớp" subtitle="Theo điểm & chuyên cần" action={<Button size="xs" variant="ghost" to="/head/reports">Báo cáo</Button>} />
          <div className="space-y-2">
            {MOCK_CLASS_REPORTS.map((r) => (
              <div key={r.classId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">
                <Badge tone={GRADE_TONE[r.grade]} solid className="w-7 justify-center">
                  {r.grade}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{r.className}</p>
                  <p className="text-[11px] text-slate-500">{r.teacher}</p>
                </div>
                <span className={r.trend >= 0 ? 'text-emerald-700 text-xs font-extrabold' : 'text-violet-700 text-xs font-extrabold'}>
                  {r.trend >= 0 ? '▲' : '▼'} {Math.abs(r.trend)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
