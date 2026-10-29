import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Headphones, BookOpen, PenTool, Mic } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Badge, Button, Card, RadarChart } from '@/shared/components/ui';
import { DEFAULT_ONBOARDING, OnboardingState } from './GoalPage';

const SKILLS = [
  { key: 'Listening', label: 'Nghe', icon: Headphones },
  { key: 'Reading', label: 'Đọc', icon: BookOpen },
  { key: 'Writing', label: 'Viết', icon: PenTool },
  { key: 'Speaking', label: 'Nói', icon: Mic },
];
const LEVEL_LABEL = ['', 'Mới bắt đầu', 'Cơ bản', 'Trung bình', 'Khá', 'Tốt'];

export const SkillsPage: React.FC = () => {
  useDocumentTitle('Tự đánh giá kỹ năng');
  const navigate = useNavigate();
  const [state, setState] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);

  return (
    <Card padding="lg" className="animate-scale-in">
      <div className="text-center space-y-2 mb-8">
        <Badge tone="indigo">Bước 4 / 6</Badge>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Tự đánh giá 4 kỹ năng</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">Đánh giá cảm tính của bạn sẽ được đối chiếu với bài test xếp lớp ở bước tiếp theo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
        <div className="space-y-5">
          {SKILLS.map((s, i) => {
            const Icon = s.icon;
            const v = state.skills[s.key] ?? 3;
            return (
              <div key={s.key} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    {s.label}
                  </span>
                  <Badge tone={v >= 4 ? 'emerald' : v >= 3 ? 'indigo' : 'amber'}>
                    {v}/5 · {LEVEL_LABEL[v]}
                  </Badge>
                </div>
                <input type="range" min={1} max={5} step={1} value={v} onChange={(e) => setState({ ...state, skills: { ...state.skills, [s.key]: Number(e.target.value) } })} className="w-full h-2 rounded-full cursor-pointer" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>Mới bắt đầu</span>
                  <span>Tốt</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center animate-scale-in" style={{ animationDelay: '200ms' }}>
          <RadarChart data={SKILLS.map((s) => ({ label: s.label, value: ((state.skills[s.key] ?? 3) / 5) * 100 }))} size={240} />
          <p className="text-[11px] text-slate-400 font-semibold -mt-2">Biểu đồ năng lực tự đánh giá</p>
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
