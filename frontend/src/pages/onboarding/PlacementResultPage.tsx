import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Compass, CheckCircle2, Lock, Play } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Badge, Button, Card, RingProgress, RadarChart, ProgressBar, GradientPanel } from '@/shared/components/ui';
import { CountUp } from '@/shared/components/motion';
import { LEARNING_PATH, RADAR_SKILLS } from '@/shared/mocks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils';
import { DEFAULT_ONBOARDING, OnboardingState } from './GoalPage';

const CONFETTI = ['bg-indigo-500', 'bg-amber-400', 'bg-emerald-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500', 'bg-orange-400', 'bg-pink-400'];

export const PlacementResultPage: React.FC = () => {
  useDocumentTitle('Kết quả xếp lớp');
  const navigate = useNavigate();
  const [state] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const updateUser = useAuthStore((s) => s.updateUser);

  const result = useMemo(() => {
    try {
      const raw = localStorage.getItem('orbi-placement');
      if (raw) return JSON.parse(raw) as { correct: number; total: number };
    } catch {
      /* ignore */
    }
    return { correct: 6, total: 10 };
  }, []);

  const pct = Math.round((result.correct / result.total) * 100);
  const isVstep = state.examType === 'VSTEP';
  const estimated = isVstep ? Math.round((3 + pct * 0.06) * 2) / 2 : Math.round((300 + pct * 6) / 5) * 5;
  const level = isVstep ? (estimated >= 8.5 ? 'C1' : estimated >= 6 ? 'B2' : estimated >= 4 ? 'B1' : 'A2') : estimated >= 785 ? 'B2' : estimated >= 550 ? 'B1' : 'A2';
  const target = state.targetScore || (isVstep ? 'B2' : '750');

  const start = () => {
    completeOnboarding();
    updateUser({ target: { examType: state.examType, score: target, examDate: state.examDate || undefined } });
    toast.success('Lộ trình đã sẵn sàng!', 'Chúc bạn học tập hiệu quả cùng OrbiLingo.');
    navigate('/app/dashboard');
  };

  return (
    <div className="space-y-5 relative">
      <div aria-hidden className="pointer-events-none absolute -top-10 inset-x-0 h-40 overflow-hidden">
        {CONFETTI.map((c, i) => (
          <span key={i} className={cn('absolute w-2.5 h-2.5 rounded-sm animate-float', c)} style={{ left: `${8 + i * 12}%`, top: `${(i % 3) * 20}px`, animationDelay: `${i * 150}ms`, transform: `rotate(${i * 37}deg)` }} />
        ))}
      </div>

      <Card padding="lg" className="animate-scale-in relative">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="flex flex-col items-center">
            <RingProgress value={pct} size={170} stroke={14} tone={pct >= 70 ? 'emerald' : pct >= 40 ? 'indigo' : 'amber'}>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">
                  {result.correct}/{result.total}
                </p>
                <p className="text-[10px] font-bold uppercase text-slate-400">câu đúng</p>
              </div>
            </RingProgress>
            <Trophy className="w-8 h-8 text-amber-400 -mt-3 animate-bounce-soft" />
          </div>
          <div className="space-y-3">
            <Badge tone="indigo">Bước 6 / 6 · Hoàn thành</Badge>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Năng lực ước lượng của bạn</h1>
            <div className="flex items-end gap-3">
              <p className="text-5xl font-black text-gradient leading-none">
                <CountUp value={isVstep ? Math.round(estimated * 10) : estimated} format={(n) => (isVstep ? (n / 10).toFixed(1) : String(n))} />
              </p>
              <div className="pb-1">
                <p className="text-sm font-bold text-slate-700">{isVstep ? 'điểm VSTEP' : 'điểm TOEIC'}</p>
                <Badge tone="emerald" size="xs">
                  Tương đương CEFR {level}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Mục tiêu của bạn: <b className="text-slate-800">{isVstep ? `VSTEP ${target}` : `TOEIC ${target}`}</b>. Khoảng cách này hoàn toàn khả thi với {state.minutesPerDay} phút/ngày, {state.days.length} ngày/tuần. Lộ trình 3 chặng bên dưới đã được điều chỉnh theo kết quả của bạn.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
        <Card className="flex flex-col items-center animate-fade-up" style={{ animationDelay: '120ms' }}>
          <p className="font-bold text-slate-900 text-sm self-start mb-1">Bản đồ năng lực</p>
          <RadarChart data={RADAR_SKILLS} size={230} />
          <p className="text-[11px] text-slate-400 -mt-2">Điểm yếu lớn nhất: Tốc độ & Từ vựng</p>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-indigo-600" />
            <p className="font-bold text-slate-900">Lộ trình đề xuất 3 chặng</p>
          </div>
          <div className="space-y-3">
            {LEARNING_PATH.map((m, i) => (
              <div key={m.id} className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:border-indigo-200 transition animate-fade-up" style={{ animationDelay: `${250 + i * 80}ms` }}>
                <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm', i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500')}>{i === 0 ? <Play className="w-4 h-4" /> : i === 2 ? <Lock className="w-4 h-4" /> : m.phase}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{m.title}</p>
                    <span className="text-[11px] text-slate-400">{m.weeks}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                  <ProgressBar value={i === 0 ? 8 : 0} size="xs" className="mt-2" animate={false} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <GradientPanel className="animate-fade-up" style={{ animationDelay: '300ms' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-lg font-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Mọi thứ đã sẵn sàng
            </p>
            <p className="text-sm text-indigo-100 mt-1">Bài học đầu tiên chỉ mất 12 phút. Bắt đầu ngay hôm nay để giữ chuỗi chuyên cần!</p>
          </div>
          <Button size="xl" variant="secondary" className="!bg-white !text-indigo-700 hover:!bg-indigo-50 shine" rightIcon={<ArrowRight className="w-5 h-5" />} onClick={start}>
            Bắt đầu học
          </Button>
        </div>
      </GradientPanel>
    </div>
  );
};
