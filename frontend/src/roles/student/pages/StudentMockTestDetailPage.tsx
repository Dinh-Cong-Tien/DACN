import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileText, Clock, Users, Lock, Play, Headphones, Timer, ShieldCheck, Flag, Sparkles, History, Layers } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Alert, Badge, Button, Card, CardHeader, Breadcrumb, StatCard, Timeline } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { Img } from '@/shared/components/media/Img';
import { MOCK_TESTS, MOCK_ATTEMPTS, TOEIC_PARTS_INFO, VSTEP_PARTS_INFO } from '@/shared/mocks';
import { cn, formatDate, formatDuration, formatNumber } from '@/shared/utils';

const RULES = [
  { icon: Headphones, title: 'Audio phát một lần', desc: 'Không tua lùi, không tạm dừng — mô phỏng phòng thi thật.', cls: 'bg-sky-100' },
  { icon: Timer, title: 'Tự động nộp bài', desc: 'Hết giờ hệ thống tự nộp. Cảnh báo khi còn 5 phút.', cls: 'bg-amber-100' },
  { icon: Flag, title: 'Đánh dấu xem lại', desc: 'Phím F để đánh dấu câu cần quay lại trước khi nộp.', cls: 'bg-violet-100' },
  { icon: ShieldCheck, title: 'Lưu lỗi sai tự động', desc: 'Câu sai được đưa vào Sổ tay và lịch ôn SM-2.', cls: 'bg-emerald-100' },
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
      <Breadcrumb items={[{ label: 'Thi thử', to: '/app/mock-tests' }, { label: test.title }]} className="mb-4 animate-fade-down" />

      {/* Cover lớn */}
      <Card hard padding="none" className="overflow-hidden mb-6 animate-scale-in">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
          <div className="relative min-h-[240px] lg:min-h-[320px] border-b-2 lg:border-b-0 lg:border-r-2 border-slate-900">
            <Img src={test.coverUrl} alt={test.title} wrapperClass="absolute inset-0" fallbackClass="bg-indigo-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="flex gap-1.5 mb-2 flex-wrap">
                <Badge tone={test.examType === 'TOEIC' ? 'indigo' : 'emerald'} solid size="xs">
                  {test.examType}
                </Badge>
                {test.tags?.map((t) => (
                  <Badge key={t} tone="amber" solid size="xs">
                    {t}
                  </Badge>
                ))}
              </div>
              <h1 className="font-display text-2xl md:text-4xl font-extrabold leading-tight">{test.title}</h1>
              <p className="text-sm text-slate-200 mt-1 font-semibold">
                {test.level} · {test.parts.join(', ')} · Năm {test.year} · Mã đề {test.slug}
              </p>
            </div>
          </div>
          <div className="p-6 flex flex-col justify-center gap-4 bg-amber-50">
            <div>
              <p className="font-display text-xl font-extrabold text-slate-900">Sẵn sàng chưa?</p>
              <p className="text-sm text-slate-600 mt-1">Chuẩn bị tai nghe và {test.durationMinutes} phút không gián đoạn. Bài làm được chấm tự động ngay khi nộp.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                [test.totalQuestions, 'câu'],
                [test.durationMinutes, 'phút'],
                [test.parts.length, 'phần'],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-white border-2 border-slate-900 p-2 text-center">
                  <p className="font-display text-xl font-extrabold text-slate-900">{v}</p>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500">{l}</p>
                </div>
              ))}
            </div>
            <Button fullWidth size="lg" variant="gradient" leftIcon={locked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4" />} onClick={() => navigate(`/app/exam/${test.id}`)}>
              Vào phòng thi
            </Button>
            <Button fullWidth size="sm" variant="ghost" to="/app/mock-tests">
              Chọn đề khác
            </Button>
          </div>
        </div>
      </Card>

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
          <Card hard className="animate-fade-up">
            <CardHeader title="Cấu trúc đề thi" subtitle="Thứ tự các phần trong bài" icon={<Layers />} />
            <div className="space-y-2">
              {parts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-amber-50 transition animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 font-display font-extrabold text-sm flex items-center justify-center shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {p.name} · <span className="font-semibold text-slate-600">{p.nameVi}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{p.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-sm font-extrabold text-slate-900">{p.questions} câu</p>
                    {p.minutes && <p className="text-[11px] text-slate-500 font-semibold">{p.minutes} phút</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card hard className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Quy định phòng thi" subtitle="Đọc kỹ trước khi bắt đầu" icon={<ShieldCheck />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RULES.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={r.title} className={cn('flex items-start gap-3 p-3 rounded-xl border-2 border-slate-900 animate-fade-up', r.cls)} style={{ animationDelay: `${150 + i * 60}ms` }}>
                    <span className="w-9 h-9 rounded-lg bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{r.title}</p>
                      <p className="text-xs text-slate-600">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card hard className="animate-slide-in-right">
            <CardHeader title="Lịch sử đề này" icon={<History />} />
            {attempts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 font-semibold">Bạn chưa làm đề này.</p>
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
                    <Link to={`/app/mock-tests/${a.testId}/result`} className="text-indigo-700 font-bold hover:underline">
                      Xem kết quả · {formatDuration(a.durationSec)}
                    </Link>
                  ),
                  time: formatDate(a.date),
                  tone: a.score / a.maxScore >= 0.7 ? 'emerald' : 'amber',
                }))}
              />
            )}
          </Card>
          <Card hard tone="ink" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <p className="font-display font-extrabold text-amber-300">Mẹo từ giáo viên</p>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">Đọc trước câu hỏi Part 3–4 trong lúc audio giới thiệu. Part 7 đừng sa lầy quá 90 giây một câu.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
