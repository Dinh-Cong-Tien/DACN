import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, CalendarCheck } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Badge, Button, Card } from '@/shared/components/ui';
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
    <Card padding="lg" className="animate-scale-in">
      <div className="text-center space-y-2 mb-8">
        <Badge tone="indigo">Bước 3 / 6</Badge>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Bạn có thể học bao lâu mỗi ngày?</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">Lộ trình thực tế quan trọng hơn lộ trình tham vọng. Hãy chọn mức bạn duy trì được đều đặn.</p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Thời lượng mỗi buổi
          </p>
          <div className="grid grid-cols-5 gap-2">
            {MINUTES.map((m, i) => {
              const active = state.minutesPerDay === m;
              return (
                <button
                  key={m}
                  onClick={() => setState({ ...state, minutesPerDay: m })}
                  className={cn('rounded-2xl border-2 py-4 text-center transition-all duration-300 ease-spring animate-fade-up', active ? 'border-indigo-500 bg-indigo-50 shadow-glow scale-105' : 'border-slate-200 bg-white hover:border-indigo-200 hover:-translate-y-0.5')}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <p className={cn('text-2xl font-black', active ? 'text-indigo-700' : 'text-slate-800')}>{m}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">phút</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600" /> Các ngày trong tuần
          </p>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d, i) => {
              const active = state.days.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={cn('h-14 rounded-2xl font-black text-sm transition-all duration-300 ease-spring animate-fade-up active:scale-95', active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}
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
            { label: 'Giờ / tuần', value: `${Math.round((intensity / 60) * 10) / 10}h` },
            { label: 'Tổng tới ngày thi', value: `${totalHours}h` },
            { label: 'Cường độ', value: intensity >= 300 ? 'Cao' : intensity >= 150 ? 'Vừa' : 'Nhẹ' },
          ].map((s, i) => (
            <div key={s.label} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center animate-pop" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-xl font-black text-slate-900">{s.value}</p>
              <p className="text-[10px] font-bold uppercase text-slate-400">{s.label}</p>
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
