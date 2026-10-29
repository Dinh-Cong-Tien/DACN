import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Button, Card, Input } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { DEFAULT_ONBOARDING, OnboardingState } from './GoalPage';

const TOEIC_TARGETS = [
  { v: '450', note: 'Tốt nghiệp CĐ' },
  { v: '550', note: 'Chuẩn ra trường' },
  { v: '650', note: 'Đi làm' },
  { v: '750', note: 'Thăng tiến' },
  { v: '850', note: 'Quản lý' },
  { v: '900+', note: 'Chuyên gia' },
];
const VSTEP_TARGETS = [
  { v: 'B1', note: 'Bậc 3 · Ra trường' },
  { v: 'B2', note: 'Bậc 4 · Sau ĐH' },
  { v: 'C1', note: 'Bậc 5 · Giáo viên' },
];

export const TargetPage: React.FC = () => {
  useDocumentTitle('Mục tiêu điểm số');
  const navigate = useNavigate();
  const [state, setState] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);
  const targets = state.examType === 'VSTEP' ? VSTEP_TARGETS : TOEIC_TARGETS;

  const daysLeft = state.examDate ? Math.ceil((new Date(state.examDate).getTime() - Date.now()) / 86400000) : null;
  const canContinue = Boolean(state.targetScore && state.examDate && (daysLeft ?? 0) > 0);

  return (
    <Card hard padding="lg" className="animate-scale-in">
      <div className="text-center space-y-3 mb-8">
        <span className="sticker tilt-2">Bước 2 / 6 · {state.examType}</span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Mục tiêu <span className="mark-coral mark">điểm số</span> & ngày thi
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">Hệ thống phân bổ khối lượng học theo số ngày còn lại để bạn đạt mục tiêu đúng hạn.</p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">Mục tiêu {state.examType === 'VSTEP' ? 'bậc' : 'điểm'}</p>
          <div className={cn('grid gap-3', state.examType === 'VSTEP' ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6')}>
            {targets.map((t, i) => {
              const active = state.targetScore === t.v;
              return (
                <button
                  key={t.v}
                  onClick={() => setState({ ...state, targetScore: t.v })}
                  className={cn(
                    'rounded-2xl border-2 p-3 text-center transition-all duration-200 animate-fade-up',
                    active ? 'border-slate-900 bg-amber-300 shadow-hard -translate-y-1' : 'border-slate-200 bg-white hover:border-slate-900 hover:-translate-y-0.5'
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <p className="font-display text-2xl font-extrabold text-slate-900">{t.v}</p>
                  <p className="text-[10px] font-bold text-slate-600 mt-0.5">{t.note}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
          <Input type="date" label="Ngày thi dự kiến" leftIcon={<CalendarDays />} value={state.examDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setState({ ...state, examDate: e.target.value })} hint="Chưa đăng ký thi? Chọn ngày bạn muốn hoàn thành lộ trình." />
          <div className={cn('rounded-2xl border-2 px-6 py-3 text-center min-w-[170px] transition-all', daysLeft !== null && daysLeft > 0 ? 'bg-indigo-600 border-slate-900 text-white shadow-hard animate-pop' : 'bg-slate-100 border-slate-200 text-slate-400')}>
            <p className="font-display text-4xl font-extrabold leading-none">{daysLeft !== null && daysLeft > 0 ? daysLeft : '--'}</p>
            <p className="text-[11px] font-extrabold uppercase tracking-wider mt-1 opacity-80">ngày còn lại</p>
          </div>
        </div>
        {daysLeft !== null && daysLeft <= 0 && state.examDate && <p className="text-xs font-bold text-violet-600 animate-shake">Ngày thi phải sau hôm nay.</p>}
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
