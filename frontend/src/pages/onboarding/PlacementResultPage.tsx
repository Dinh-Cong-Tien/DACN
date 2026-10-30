import React, { useMemo } from 'react';
import { fireConfetti } from '@/shared/components/motion/confetti';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, CheckCircle2, Lock, Play, PartyPopper } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Badge, Button, Card, RingProgress, RadarChart, ProgressBar } from '@/shared/components/ui';
import { CountUp } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { LEARNING_PATH, RADAR_SKILLS } from '@/shared/mocks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils';
import { DEFAULT_ONBOARDING, OnboardingState } from './GoalPage';

const CONFETTI = ['bg-indigo-500', 'bg-amber-300', 'bg-violet-500', 'bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-violet-400', 'bg-indigo-300'];

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
  React.useEffect(() => { fireConfetti({ count: 90 }); }, []);
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
          <span key={i} className={cn('absolute w-3 h-3 rounded-sm border border-slate-900 animate-float', c)} style={{ left: `${8 + i * 12}%`, top: `${(i % 3) * 20}px`, animationDelay: `${i * 150}ms`, transform: `rotate(${i * 37}deg)` }} />
        ))}
      </div>

      <Card hard padding="none" className="animate-scale-in relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
            <div className="flex flex-col items-center">
              <RingProgress value={pct} size={170} stroke={14} tone={pct >= 70 ? 'emerald' : pct >= 40 ? 'indigo' : 'amber'}>
                <div className="text-center">
                  <p className="font-display text-3xl font-extrabold text-slate-900">
                    {result.correct}/{result.total}
                  </p>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500">câu đúng</p>
                </div>
              </RingProgress>
              <span className="sticker tilt-2 -mt-3 !bg-amber-300">
                <PartyPopper className="w-3.5 h-3.5" /> Hoàn thành
              </span>
            </div>
            <div className="space-y-3">
              <span className="sticker tilt-3">Bước 6 / 6</span>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Năng lực <span className="mark">ước lượng</span> của bạn
              </h1>
              <div className="flex items-end gap-3">
                <p className="font-display text-6xl font-extrabold text-indigo-600 leading-none">
                  <CountUp value={isVstep ? Math.round(estimated * 10) : estimated} format={(n) => (isVstep ? (n / 10).toFixed(1) : String(n))} />
                </p>
                <div className="pb-1">
                  <p className="text-sm font-bold text-slate-700">{isVstep ? 'điểm VSTEP' : 'điểm TOEIC'}</p>
                  <Badge tone="emerald" size="xs">
                    Tương đương CEFR {level}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mục tiêu của bạn: <b className="text-slate-900">{isVstep ? `VSTEP ${target}` : `TOEIC ${target}`}</b>. Khoảng cách này hoàn toàn khả thi với {state.minutesPerDay} phút/ngày, {state.days.length} ngày/tuần. Lộ trình 3 chặng bên dưới đã được điều chỉnh theo kết quả của bạn.
              </p>
            </div>
          </div>
          <div className="relative min-h-[220px] bg-amber-300 border-t-2 lg:border-t-0 lg:border-l-2 border-slate-900">
            <Img src={PHOTOS.graduation} alt="Chúc mừng" wrapperClass="absolute inset-0" fallbackClass="bg-amber-300" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
        <Card hard tone="sky" className="flex flex-col items-center animate-fade-up" style={{ animationDelay: '120ms' }}>
          <p className="font-display font-bold text-slate-900 text-sm self-start mb-1">Bản đồ năng lực</p>
          <RadarChart data={RADAR_SKILLS} size={230} />
          <p className="text-[11px] text-slate-700 font-bold -mt-2">Điểm yếu lớn nhất: Tốc độ & Từ vựng</p>
        </Card>
        <Card hard className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl bg-indigo-600 border-2 border-slate-900 text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </span>
            <p className="font-display font-bold text-slate-900">Lộ trình đề xuất 3 chặng</p>
          </div>
          <div className="space-y-3">
            {LEARNING_PATH.map((m, i) => (
              <div key={m.id} className={cn('flex items-start gap-3 p-3 rounded-2xl border-2 transition animate-fade-up', i === 0 ? 'border-slate-900 bg-amber-50' : 'border-slate-200 hover:border-slate-900')} style={{ animationDelay: `${250 + i * 80}ms` }}>
                <span className={cn('w-10 h-10 rounded-xl border-2 border-slate-900 flex items-center justify-center shrink-0 font-display font-extrabold', i === 0 ? 'bg-indigo-600 text-white' : i === 2 ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-900')}>{i === 0 ? <Play className="w-4 h-4" /> : i === 2 ? <Lock className="w-4 h-4" /> : `0${m.phase}`}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{m.title}</p>
                    <span className="text-[11px] font-bold text-slate-500">{m.weeks}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{m.description}</p>
                  <ProgressBar value={i === 0 ? 8 : 0} size="xs" className="mt-2" animate={false} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card hard tone="ink" className="animate-fade-up" style={{ animationDelay: '300ms' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl font-extrabold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-300" /> Mọi thứ đã sẵn sàng
            </p>
            <p className="text-sm text-slate-300 mt-1">Bài học đầu tiên chỉ mất 12 phút. Bắt đầu ngay hôm nay để giữ chuỗi chuyên cần!</p>
          </div>
          <Button size="xl" variant="gradient" rightIcon={<ArrowRight className="w-5 h-5" />} onClick={start}>
            Bắt đầu học
          </Button>
        </div>
      </Card>
    </div>
  );
};
