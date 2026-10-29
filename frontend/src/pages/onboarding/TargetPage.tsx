import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Target } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Badge, Button, Card, Chip, Input } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { DEFAULT_ONBOARDING, OnboardingState } from './GoalPage';

const TOEIC_TARGETS = ['450', '550', '650', '750', '850', '900+'];
const VSTEP_TARGETS = ['B1', 'B2', 'C1'];

export const TargetPage: React.FC = () => {
  useDocumentTitle('Mục tiêu điểm số');
  const navigate = useNavigate();
  const [state, setState] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);
  const targets = state.examType === 'VSTEP' ? VSTEP_TARGETS : TOEIC_TARGETS;

  const daysLeft = state.examDate ? Math.ceil((new Date(state.examDate).getTime() - Date.now()) / 86400000) : null;
  const canContinue = Boolean(state.targetScore && state.examDate && (daysLeft ?? 0) > 0);

  return (
    <Card padding="lg" className="animate-scale-in">
      <div className="text-center space-y-2 mb-8">
        <Badge tone="indigo">Bước 2 / 6 · {state.examType}</Badge>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Mục tiêu điểm số & ngày thi</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">Hệ thống sẽ phân bổ khối lượng học theo số ngày còn lại để bạn đạt mục tiêu đúng hạn.</p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" /> Mục tiêu {state.examType === 'VSTEP' ? 'bậc' : 'điểm'}
          </p>
          <div className="flex flex-wrap gap-2">
            {targets.map((t, i) => (
              <div key={t} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <Chip active={state.targetScore === t} onClick={() => setState({ ...state, targetScore: t })} className={cn('px-5 py-2.5 text-sm', state.targetScore === t && 'scale-105')}>
                  {state.examType === 'VSTEP' ? `VSTEP ${t}` : `${t} điểm`}
                </Chip>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
          <Input type="date" label="Ngày thi dự kiến" leftIcon={<CalendarDays />} value={state.examDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setState({ ...state, examDate: e.target.value })} hint="Chưa đăng ký thi? Chọn ngày bạn muốn hoàn thành lộ trình." />
          <div className={cn('rounded-2xl border px-5 py-3 text-center min-w-[160px] transition-all', daysLeft !== null && daysLeft > 0 ? 'bg-indigo-50 border-indigo-200 animate-pop' : 'bg-slate-50 border-slate-200')}>
            <p className="text-3xl font-black text-indigo-700">{daysLeft !== null && daysLeft > 0 ? daysLeft : '--'}</p>
            <p className="text-[11px] font-bold uppercase text-slate-500">ngày còn lại</p>
          </div>
        </div>
        {daysLeft !== null && daysLeft <= 0 && state.examDate && <p className="text-xs font-semibold text-rose-600 animate-shake">Ngày thi phải sau hôm nay.</p>}
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/onboarding/goal')}>
          Quay lại
        </Button>
        <Button size="lg" variant="gradient" disabled={!canContinue} rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/onboarding/schedule')}>
          Tiếp tục
        </Button>
      </div>
    </Card>
  );
};
