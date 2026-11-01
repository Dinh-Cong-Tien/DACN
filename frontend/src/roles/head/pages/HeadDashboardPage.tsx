import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, MessageSquareWarning, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_SUBJECTS, MOCK_TEACHERS, MOCK_APPROVALS, MOCK_COMPLAINTS, MOCK_CLASS_REPORTS } from '@/shared/mocks';
import type { ApprovalRequest, ClassReport } from '@/shared/types';
import { cn, timeAgo, formatNumber } from '@/shared/utils';
import { Avatar, AvatarGroup, Badge, Button, Card } from '@/shared/components/ui';
import { BarChart } from '@/shared/components/charts/Charts';
import { CountUp, Reveal, Stagger } from '@/shared/components/motion';
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
  const totalClasses = MOCK_SUBJECTS.reduce((a, s) => a + s.classesCount, 0);
  const activeTeachers = MOCK_TEACHERS.filter((t) => t.status === 'ACTIVE');
  const firstName = user?.fullName.split(' ').slice(-1)[0] ?? 'Trưởng bộ môn';
  const toeicReports = MOCK_CLASS_REPORTS.filter((r) => r.avgScore > 10);
  const avatarOf = (name: string) => MOCK_TEACHERS.find((t) => t.name === name)?.avatarUrl;

  return (
    <div className="space-y-10">
      {/* ===== Chào + dải số liệu ===== */}
      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-end animate-fade-up">
        <div className="space-y-4">
          <p className="text-sm font-bold text-indigo-700 capitalize">{today}</p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
            Xin chào, {firstName}. Có <span className="mark">{pending.length} học liệu</span> chờ duyệt.
          </h1>
          <p className="text-base text-slate-500 max-w-xl">
            Bộ môn quản lý {MOCK_SUBJECTS.length} môn học, {totalClasses} lớp đang mở và {formatNumber(totalQuestions)} câu hỏi. {newComplaints.length} khiếu nại mới cần tiếp nhận.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button to="/head/approvals" variant="gradient" size="lg" leftIcon={<CheckSquare className="w-4 h-4" />}>
              Duyệt học liệu ({pending.length})
            </Button>
            <Button to="/head/complaints" variant="outline" size="lg" leftIcon={<MessageSquareWarning className="w-4 h-4" />}>
              Xử lý khiếu nại
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-900/10 p-2 grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 divide-x divide-slate-900/10">
          {[
            { label: 'Môn học', value: MOCK_SUBJECTS.length, suffix: 'môn', sub: `${totalClasses} lớp đang mở` },
            { label: 'Giáo viên', value: MOCK_TEACHERS.length, suffix: 'GV', sub: `${activeTeachers.length} đang hoạt động` },
            { label: 'Chờ phê duyệt', value: pending.length, suffix: 'mục', sub: 'đề thi, câu hỏi, bài giảng' },
            { label: 'Khiếu nại mới', value: newComplaints.length, suffix: 'đơn', sub: 'cần tiếp nhận' },
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

      {/* ===== Khối nhấn: chờ phê duyệt + ngân hàng câu hỏi ===== */}
      <section className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white grid md:grid-cols-[1fr_260px] min-h-[320px]">
            <div aria-hidden className="absolute inset-0 bg-dots opacity-10" />
            <div className="relative p-7 md:p-9 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="sticker !bg-amber-300 !shadow-none !border-transparent">Chờ phê duyệt</span>
                <Badge tone="amber" solid>
                  {pending.length} mục
                </Badge>
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">Học liệu giáo viên gửi lên</h2>
                <p className="text-sm text-slate-400 mt-2">Thẩm định nội dung trước khi xuất bản tới học viên toàn bộ môn.</p>
              </div>
              <ul className="divide-y divide-white/10">
                {pending.slice(0, 3).map((a) => (
                  <li key={a.id} className="py-3 flex items-center gap-3">
                    <Avatar name={a.author} src={avatarOf(a.author)} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{a.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {a.author} · {timeAgo(a.submittedAt)}
                      </p>
                    </div>
                    <Badge tone={TYPE_TONE[a.type]} solid size="xs">
                      {TYPE_LABEL[a.type]}
                    </Badge>
                  </li>
                ))}
              </ul>
              <Link to="/head/approvals" className="inline-flex items-center gap-1 text-sm font-bold text-amber-300 hover:gap-2 transition-all">
                Mở bàn phê duyệt <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative hidden md:block">
              <Img src={PHOTOS.lecture} alt="Giảng đường" wrapperClass="absolute inset-0" fallbackClass="bg-slate-800" className="opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Card className="h-full flex flex-col justify-between" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ngân hàng câu hỏi</p>
                <p className="font-display text-5xl font-extrabold text-slate-900 mt-2 leading-none">{formatNumber(totalQuestions)}</p>
                <p className="text-sm text-slate-500 mt-2">câu hỏi đã duyệt · {MOCK_SUBJECTS.length} môn học</p>
              </div>
              <Badge tone="indigo">Đã thẩm định</Badge>
            </div>
            <ul className="divide-y divide-slate-900/10 mt-4">
              {MOCK_SUBJECTS.map((s) => (
                <li key={s.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 truncate">{s.name}</span>
                  <span className="font-bold text-slate-900 shrink-0 ml-3">{formatNumber(s.questionsCount)}</span>
                </li>
              ))}
            </ul>
            <Link to="/head/question-bank" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:gap-2 transition-all mt-3">
              Mở ngân hàng <ChevronRight className="w-4 h-4" />
            </Link>
          </Card>
        </Reveal>
      </section>

      {/* ===== Điểm TB · Giáo viên · Khiếu nại ===== */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Kỳ thi thử gần nhất · ETS 2024 Test 2</p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Chất lượng bộ môn</h2>
          </div>
          <Link to="/head/reports" className="text-sm font-bold text-slate-700 hover:text-indigo-700 inline-flex items-center gap-1">
            Báo cáo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Stagger className="grid lg:grid-cols-3 gap-6">
          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Điểm trung bình các lớp</h3>
                <p className="text-sm text-slate-500">TOEIC quy đổi</p>
              </div>
            </div>
            <BarChart ariaLabel="Điểm trung bình các lớp TOEIC" data={toeicReports.map((r) => ({ label: r.className.replace('TOEIC ', '').replace('Ngữ pháp nền tảng ', 'NP ').slice(0, 10), value: r.avgScore }))} height={180} unit=" điểm" />
            <p className="text-sm text-slate-600 mt-4">
              Cao nhất <b className="text-slate-900">{Math.max(...toeicReports.map((r) => r.avgScore))}</b> · thấp nhất {Math.min(...toeicReports.map((r) => r.avgScore))}
            </p>
          </Card>

          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Giáo viên bộ môn</h3>
                <p className="text-sm text-slate-500">{activeTeachers.length} đang hoạt động</p>
              </div>
              <Link to="/head/teachers" className="text-xs font-bold text-indigo-700">
                Tất cả
              </Link>
            </div>
            <AvatarGroup names={MOCK_TEACHERS.map((t) => t.name)} srcs={MOCK_TEACHERS.map((t) => t.avatarUrl)} size="md" max={6} />
            <ul className="divide-y divide-slate-900/10 mt-4">
              {MOCK_TEACHERS.slice(0, 4).map((t) => (
                <li key={t.id} className="py-2.5 flex items-center gap-3">
                  <Avatar name={t.name} src={t.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {t.subject} · {t.classesCount} lớp · {t.studentsCount} HV
                    </p>
                  </div>
                  <Badge tone={t.status === 'ACTIVE' ? 'emerald' : t.status === 'PENDING' ? 'amber' : 'slate'} size="xs">
                    {t.status === 'ACTIVE' ? 'Hoạt động' : t.status === 'PENDING' ? 'Chờ duyệt' : 'Tạm khoá'}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Khiếu nại mới</h3>
                <p className="text-sm text-slate-500">Từ học viên</p>
              </div>
              <Button size="xs" variant="soft" to="/head/complaints">
                Tiếp nhận
              </Button>
            </div>
            <ul className="divide-y divide-slate-900/10">
              {newComplaints.map((c, i) => (
                <li key={c.id} className="py-3 flex items-start gap-3">
                  <Avatar name={c.student} src={pravatar(20 + i)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.subject}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {c.student} · {c.questionRef}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(c.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </Stagger>
      </section>

      {/* ===== Xếp loại lớp ===== */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Theo điểm & chuyên cần</p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Xếp loại lớp</h2>
          </div>
          <Link to="/head/classes" className="text-sm font-bold text-slate-700 hover:text-indigo-700 inline-flex items-center gap-1">
            Danh sách lớp <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Reveal>
          <Card padding="none">
            <ul className="divide-y divide-slate-900/10">
              {MOCK_CLASS_REPORTS.map((r) => (
                <li key={r.classId} className="px-5 md:px-6 py-3.5 flex items-center gap-4">
                  <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center font-display font-extrabold text-sm shrink-0', { emerald: 'bg-emerald-50 text-emerald-700', sky: 'bg-sky-50 text-sky-700', amber: 'bg-amber-100 text-amber-800', rose: 'bg-rose-50 text-rose-600' }[GRADE_TONE[r.grade]])}>{r.grade}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{r.className}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {r.teacher} · {r.students} HV
                    </p>
                  </div>
                  <div className="hidden sm:block text-right w-24">
                    <p className="text-sm font-bold text-slate-900">{r.avgScore}</p>
                    <p className="text-[10px] text-slate-400">điểm TB</p>
                  </div>
                  <div className="hidden sm:block text-right w-24">
                    <p className="text-sm font-bold text-slate-900">{r.attendance}%</p>
                    <p className="text-[10px] text-slate-400">chuyên cần</p>
                  </div>
                  <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold w-14 justify-end', r.trend >= 0 ? 'text-emerald-700' : 'text-rose-600')}>
                    {r.trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {r.trend >= 0 ? '+' : ''}
                    {r.trend}%
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </section>
    </div>
  );
};
