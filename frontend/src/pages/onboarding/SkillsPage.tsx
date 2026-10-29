import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Headphones, BookOpen, PenTool, Mic } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Badge, Button, Card, RadarChart } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { DEFAULT_ONBOARDING, OnboardingState } from './GoalPage';

const SKILLS = [
  { key: 'Listening', label: 'Nghe', icon: Headphones, cls: 'bg-sky-500' },
  { key: 'Reading', label: 'Đọc', icon: BookOpen, cls: 'bg-indigo-600' },
  { key: 'Writing', label: 'Viết', icon: PenTool, cls: 'bg-violet-500' },
  { key: 'Speaking', label: 'Nói', icon: Mic, cls: 'bg-amber-400' },
];
const LEVEL_LABEL = ['', 'Mới bắt đầu', 'Cơ bản', 'Trung bình', 'Khá', 'Tốt'];

export const SkillsPage: React.FC = () => {
  useDocumentTitle('Tự đánh giá kỹ năng');
  const navigate = useNavigate();
  const [state, setState] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);

  return (
    <Card hard padding="lg" className="animate-scale-in">
      <div className="text-center space-y-3 mb-8">
        <span className="sticker tilt-1">Bước 4 / 6</span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tự đánh giá <span className="mark">4 kỹ năng</span>
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">Cảm nhận của bạn sẽ được đối chiếu với bài test xếp lớp ở bước tiếp theo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
        <div className="space-y-4">
          {SKILLS.map((s, i) => {
            const Icon = s.icon;
            const v = state.skills[s.key] ?? 3;
            return (
              <div key={s.key} className="rounded-2xl border-2 border-slate-200 bg-white p-4 animate-fade-up hover:border-slate-900 transition" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
                    <span className={cn('w-9 h-9 rounded-xl border-2 border-slate-900 text-white flex items-center justify-center', s.cls)}>
                      <Icon className="w-4 h-4" />
                    </span>
                    {s.label}
                  </span>
                  <Badge tone={v >= 4 ? 'emerald' : v >= 3 ? 'indigo' : 'amber'}>
                    {v}/5 · {LEVEL_LABEL[v]}
                  </Badge>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setState({ ...state, skills: { ...state.skills, [s.key]: lv } })}
                      className={cn('h-8 rounded-lg border-2 text-[11px] font-extrabold transition-all', lv <= v ? cn(s.cls, 'border-slate-900 text-white') : 'bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-900')}
                      aria-label={`${s.label} mức ${lv}`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center rounded-3xl border-2 border-slate-900 bg-amber-100 p-4 shadow-hard animate-scale-in" style={{ animationDelay: '200ms' }}>
          <RadarChart data={SKILLS.map((s) => ({ label: s.label, value: ((state.skills[s.key] ?? 3) / 5) * 100 }))} size={240} />
          <p className="text-[11px] text-slate-700 font-bold -mt-2">Bản đồ năng lực tự đánh giá</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/onboarding/schedule')}>
          Quay lại
        </Button>
        <Button size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/onboarding/placement-test')}>
          Làm bài xếp lớp
        </Button>
      </div>
    </Card>
  );
};
