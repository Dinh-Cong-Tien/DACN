import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileText, Clock, Users, Lock, Play, Headphones, Timer, ShieldCheck, Flag, Sparkles, History, Layers } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Alert, Badge, Button, Card, CardHeader, PageHeader, StatCard, Timeline } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { MOCK_TESTS, MOCK_ATTEMPTS, TOEIC_PARTS_INFO, VSTEP_PARTS_INFO } from '@/shared/mocks';
import { formatDate, formatDuration, formatNumber } from '@/shared/utils';

const RULES = [
  { icon: Headphones, title: 'Audio phát một lần', desc: 'Không tua lùi, không tạm dừng — mô phỏng phòng thi thật.' },
  { icon: Timer, title: 'Tự động nộp bài', desc: 'Hết giờ hệ thống tự nộp. Cảnh báo khi còn 5 phút.' },
  { icon: Flag, title: 'Đánh dấu xem lại', desc: 'Phím F để đánh dấu câu cần quay lại trước khi nộp.' },
  { icon: ShieldCheck, title: 'Lưu lỗi sai tự động', desc: 'Câu sai được đưa vào Sổ tay và lịch ôn SM-2.' },
];

export const StudentMockTestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const test = MOCK_TESTS.find((t) => t.id === id) ?? MOCK_TESTS[0];
  useDocumentTitle(test.title);
  const attempts = MOCK_ATTEMPTS.filter((a) => a.testId === test.id);
  const parts = test.examType === 'TOEIC' ? TOEIC_PARTS_INFO : VSTEP_PARTS_INFO;
  const locked = !test.isFree && user?.plan === 'FREE';
  const best = attempts.length ? Math.max(...attempts.map((a) => a.score)) : null;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Thi thử', to: '/app/mock-tests' }, { label: test.title }]}
        title={test.title}
        description={`${test.examType} · ${test.level} · ${test.parts.join(', ')} · Năm ${test.year}`}
        actions={
          <Button size="lg" variant="gradient" className="shine" leftIcon={<Play className="w-4 h-4" />} onClick={() => navigate(`/app/exam/${test.id}`)}>
            Vào phòng thi
          </Button>
        }
      />

      {locked && (
        <Alert type="warning" title="Đề thi VIP" className="mb-5">
          Đề này thuộc gói VIP. Tài khoản Free được dùng thử 1 lần trong phiên bản demo.{' '}
          <Link to="/pricing" className="font-bold underline">
            Nâng cấp ngay
          </Link>{' '}
          để mở toàn bộ kho đề.
        </Alert>
      )}

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" step={70}>
        <StatCard label="Số câu" value={test.totalQuestions} icon={<FileText />} tone="indigo" />
        <StatCard label="Thời gian" value={test.durationMinutes} suffix="phút" icon={<Clock />} tone="amber" />
        <StatCard label="Lượt thi" value={test.attempts} icon={<Users />} tone="sky" format={formatNumber} />
        <StatCard label="Điểm cao nhất của bạn" value={best ?? '--'} icon={<Sparkles />} tone="emerald" hint={best ? 'Cố gắng vượt kỷ lục!' : 'Chưa làm đề này'} />
      </Stagger>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <div className="space-y-5">
          <Card className="animate-fade-up">
            <CardHeader title="Cấu trúc đề thi" subtitle="Thứ tự các phần trong bài" icon={<Layers />} />
            <div className="space-y-2">
              {parts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">
                      {p.name} · <span className="font-semibold text-slate-600">{p.nameVi}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{p.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-800">{p.questions} câu</p>
                    {p.minutes && <p className="text-[11px] text-slate-400">{p.minutes} phút</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Quy định phòng thi" subtitle="Đọc kỹ trước khi bắt đầu" icon={<ShieldCheck />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RULES.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={r.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 animate-fade-up" style={{ animationDelay: `${150 + i * 60}ms` }}>
                    <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-500">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="animate-slide-in-right text-center" padding="lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lift animate-float">
              {locked ? <Lock className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </div>
            <p className="font-black text-slate-900 mt-4">Sẵn sàng chưa?</p>
            <p className="text-xs text-slate-500 mt-1">Chuẩn bị tai nghe và {test.durationMinutes} phút không gián đoạn.</p>
            <Button fullWidth size="lg" variant="gradient" className="mt-4" onClick={() => navigate(`/app/exam/${test.id}`)}>
              Bắt đầu làm bài
            </Button>
            <Button fullWidth size="sm" variant="ghost" className="mt-2" to="/app/mock-tests">
              Chọn đề khác
            </Button>
          </Card>

          <Card className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Lịch sử đề này" icon={<History />} />
            {attempts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Bạn chưa làm đề này.</p>
            ) : (
              <Timeline
                items={attempts.map((a) => ({
                  id: a.id,
                  title: (
                    <span>
                      {a.score}
                      <span className="text-slate-400 font-semibold">/{a.maxScore}</span> · {a.correct}/{a.total} đúng
                    </span>
                  ),
                  description: (
                    <Link to={`/app/mock-tests/${a.testId}/result`} className="text-indigo-600 font-bold hover:underline">
                      Xem kết quả · {formatDuration(a.durationSec)}
                    </Link>
                  ),
                  time: formatDate(a.date),
                  tone: a.score / a.maxScore >= 0.7 ? 'emerald' : 'amber',
                }))}
              />
            )}
          </Card>
          <Badge tone="slate" className="w-full justify-center py-2">
            Mã đề: {test.slug}
          </Badge>
        </div>
      </div>
    </div>
  );
};
