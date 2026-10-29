import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Button, Card } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { DEFAULT_ONBOARDING, OnboardingState } from './GoalPage';

const MINUTES = [15, 30, 45, 60, 90];
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const SchedulePage: React.FC = () => {
  useDocumentTitle('Lịch học');
  const navigate = useNavigate();
  const [state, setState] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);

  const daysLeft = state.examDate ? Math.max(0, Math.ceil((new Date(state.examDate).getTime() - Date.now()) / 86400000)) : 90;
  const weeks = daysLeft / 7;
  const totalHours = Math.round((weeks * state.days.length * state.minutesPerDay) / 60);
  const intensity = state.minutesPerDay * state.days.length;

  const toggleDay = (d: string) => setState({ ...state, days: state.days.includes(d) ? state.days.filter((x) => x !== d) : [...state.days, d] });

  return (
    <Card hard padding="lg" className="animate-scale-in">
      <div className="text-center space-y-3 mb-8">
        <span className="sticker tilt-3">Bước 3 / 6</span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Mỗi ngày bạn học được <span className="mark-teal mark">bao lâu</span>?
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">Lộ trình thực tế quan trọng hơn lộ trình tham vọng. Hãy chọn mức bạn duy trì được đều đặn.</p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">Thời lượng mỗi buổi</p>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {MINUTES.map((m, i) => {
              const active = state.minutesPerDay === m;
              return (
                <button
                  key={m}
                  onClick={() => setState({ ...state, minutesPerDay: m })}
                  className={cn('rounded-2xl border-2 py-4 text-center transition-all duration-200 animate-fade-up', active ? 'border-slate-900 bg-indigo-600 text-white shadow-hard -translate-y-1' : 'border-slate-200 bg-white text-slate-900 hover:border-slate-900 hover:-translate-y-0.5')}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <p className="font-display text-2xl md:text-3xl font-extrabold leading-none">{m}</p>
                  <p className={cn('text-[10px] font-extrabold uppercase mt-1', active ? 'text-indigo-100' : 'text-slate-400')}>phút</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">Các ngày trong tuần</p>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d, i) => {
              const active = state.days.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={cn('h-14 rounded-2xl border-2 font-display font-extrabold text-sm transition-all duration-200 animate-fade-up', active ? 'bg-amber-300 border-slate-900 text-slate-900 shadow-hard-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900')}
                  style={{ animationDelay: `${150 + i * 40}ms` }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Giờ / tuần', value: `${Math.round((intensity / 60) * 10) / 10}h`, cls: 'bg-indigo-100' },
            { label: 'Tổng tới ngày thi', value: `${totalHours}h`, cls: 'bg-amber-100' },
            { label: 'Cường độ', value: intensity >= 300 ? 'Cao' : intensity >= 150 ? 'Vừa' : 'Nhẹ', cls: 'bg-violet-100' },
          ].map((s, i) => (
            <div key={s.label} className={cn('rounded-2xl border-2 border-slate-900 p-4 text-center animate-pop', s.cls)} style={{ animationDelay: `${i * 80}ms` }}>
              <p className="font-display text-2xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/onboarding/target')}>
          Quay lại
        </Button>
        <Button size="lg" variant="gradient" disabled={state.days.length === 0} rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/onboarding/skills')}>
          Tiếp tục
        </Button>
      </div>
    </Card>
  );
};
