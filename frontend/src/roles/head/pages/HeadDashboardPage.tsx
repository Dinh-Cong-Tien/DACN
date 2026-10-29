import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Users, CheckSquare, MessageSquareWarning, ArrowRight, School } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_SUBJECTS, MOCK_TEACHERS, MOCK_APPROVALS, MOCK_COMPLAINTS, MOCK_CLASS_REPORTS } from '@/shared/mocks';
import type { ApprovalRequest, ClassReport } from '@/shared/types';
import { timeAgo } from '@/shared/utils';
import { Avatar, Badge, Button, Card, CardHeader, GradientPanel, MiniBars, PageHeader, StatCard } from '@/shared/components/ui';

const TYPE_TONE: Record<ApprovalRequest['type'], 'indigo' | 'violet' | 'sky' | 'amber'> = { TEST: 'indigo', QUESTION: 'violet', LESSON: 'sky', POST: 'amber' };
const TYPE_LABEL: Record<ApprovalRequest['type'], string> = { TEST: 'Đề thi', QUESTION: 'Câu hỏi', LESSON: 'Bài giảng', POST: 'Bài viết' };
const GRADE_TONE: Record<ClassReport['grade'], 'emerald' | 'sky' | 'amber' | 'rose'> = { A: 'emerald', B: 'sky', C: 'amber', D: 'rose' };

export const HeadDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan bộ môn');
  const user = useAuthStore((s) => s.user);
  const pending = MOCK_APPROVALS.filter((a) => a.status === 'PENDING');
  const newComplaints = MOCK_COMPLAINTS.filter((c) => c.status === 'NEW');

  return (
    <div className="space-y-6">
      <PageHeader title={`Xin chào, ${user?.fullName ?? 'Trưởng bộ môn'}`} description="Tổng quan môn học, giáo viên, học liệu chờ duyệt và khiếu nại trong bộ môn." actions={<Button to="/head/approvals" leftIcon={<CheckSquare className="w-4 h-4" />}>Duyệt học liệu ({pending.length})</Button>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Môn học" value={MOCK_SUBJECTS.length} icon={<Library />} tone="amber" hint={`${MOCK_SUBJECTS.reduce((a, s) => a + s.classesCount, 0)} lớp đang mở`} />
        <StatCard label="Giáo viên" value={MOCK_TEACHERS.length} icon={<Users />} tone="indigo" hint={`${MOCK_TEACHERS.filter((t) => t.status === 'ACTIVE').length} đang hoạt động`} />
        <StatCard label="Chờ phê duyệt" value={pending.length} icon={<CheckSquare />} tone="violet" hint="Đề thi, câu hỏi, bài giảng" />
        <StatCard label="Khiếu nại mới" value={newComplaints.length} icon={<MessageSquareWarning />} tone="rose" hint="Cần tiếp nhận" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Điểm trung bình các lớp" subtitle="Kỳ thi thử gần nhất (TOEIC quy đổi)" icon={<School />} />
          <MiniBars data={MOCK_CLASS_REPORTS.filter((r) => r.avgScore > 10).map((r) => ({ label: r.className.replace('TOEIC ', ''), value: r.avgScore, tone: GRADE_TONE[r.grade] }))} height={160} />
        </Card>
        <GradientPanel tone="amber" className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-100">Ngân hàng câu hỏi</p>
          <h3 className="text-3xl font-black mt-1">{MOCK_SUBJECTS.reduce((a, s) => a + s.questionsCount, 0).toLocaleString('vi-VN')} câu</h3>
          <p className="text-sm text-amber-50 mt-2 leading-relaxed">Phân bố trên {MOCK_SUBJECTS.length} môn học. Kiểm tra độ phủ Part/kỹ năng và duyệt câu hỏi mới của giáo viên.</p>
          <Button to="/head/question-bank" variant="secondary" size="sm" className="mt-5 !bg-white !text-amber-700 hover:!bg-amber-50" rightIcon={<ArrowRight className="w-4 h-4" />}>Mở ngân hàng</Button>
        </GradientPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <CardHeader title="Chờ phê duyệt" subtitle="Học liệu giáo viên gửi lên" action={<Button size="xs" variant="ghost" to="/head/approvals">Tất cả</Button>} />
          <div className="space-y-2.5">
            {pending.map((a, i) => (
              <Link key={a.id} to="/head/approvals" className="block p-3 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-2 mb-1"><Badge tone={TYPE_TONE[a.type]} size="xs">{TYPE_LABEL[a.type]}</Badge><span className="text-[10px] text-slate-400">{timeAgo(a.submittedAt)}</span></div>
                <p className="text-sm font-bold text-slate-900 leading-snug">{a.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">bởi {a.author}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Khiếu nại mới" subtitle="Từ học viên" action={<Button size="xs" variant="ghost" to="/head/complaints">Tất cả</Button>} />
          <div className="space-y-2.5">
            {newComplaints.map((c, i) => (
              <Link key={c.id} to="/head/complaints" className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 transition animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <Avatar name={c.student} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{c.subject}</p>
                  <p className="text-[11px] text-slate-500">{c.student} · {c.questionRef}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <CardHeader title="Xếp loại lớp" subtitle="Theo điểm & chuyên cần" action={<Button size="xs" variant="ghost" to="/head/reports">Báo cáo</Button>} />
          <div className="space-y-2">
            {MOCK_CLASS_REPORTS.map((r) => (
              <div key={r.classId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">
                <Badge tone={GRADE_TONE[r.grade]} solid className="w-7 justify-center">{r.grade}</Badge>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{r.className}</p><p className="text-[11px] text-slate-500">{r.teacher}</p></div>
                <span className={r.trend >= 0 ? 'text-emerald-600 text-xs font-bold' : 'text-rose-600 text-xs font-bold'}>{r.trend >= 0 ? '▲' : '▼'} {Math.abs(r.trend)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
