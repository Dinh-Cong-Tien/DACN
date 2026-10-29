import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Badge, Button, Card, RadioCard } from '@/shared/components/ui';
import type { ExamType } from '@/shared/types';

export interface OnboardingState {
  examType: ExamType;
  targetScore: string;
  examDate: string;
  minutesPerDay: number;
  days: string[];
  skills: Record<string, number>;
}

export const DEFAULT_ONBOARDING: OnboardingState = {
  examType: 'TOEIC',
  targetScore: '',
  examDate: '',
  minutesPerDay: 30,
  days: ['T2', 'T3', 'T4', 'T5', 'T6'],
  skills: { Listening: 3, Reading: 3, Writing: 2, Speaking: 2 },
};

export const GoalPage: React.FC = () => {
  useDocumentTitle('Chọn mục tiêu');
  const navigate = useNavigate();
  const [state, setState] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);

  return (
    <Card padding="lg" className="animate-scale-in">
      <div className="text-center space-y-2 mb-8">
        <Badge tone="indigo" icon={<Sparkles className="w-3 h-3" />}>
          Bước 1 / 6
        </Badge>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Bạn đang hướng tới kỳ thi nào?</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">Lựa chọn này quyết định ngân hàng câu hỏi, đề thi thử và cấu trúc lộ trình cá nhân hoá của bạn. Bạn có thể đổi sau trong Cài đặt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <RadioCard
            selected={state.examType === 'TOEIC'}
            onSelect={() => setState({ ...state, examType: 'TOEIC', targetScore: '' })}
            icon={<Briefcase />}
            title="TOEIC Listening & Reading"
            description="200 câu · 120 phút · thang điểm 10–990. Phù hợp sinh viên tốt nghiệp, đi làm, thăng tiến trong doanh nghiệp."
            badge={
              <Badge tone="indigo" size="xs">
                Phổ biến
              </Badge>
            }
            className="h-full"
          />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <RadioCard
            selected={state.examType === 'VSTEP'}
            onSelect={() => setState({ ...state, examType: 'VSTEP', targetScore: '' })}
            icon={<GraduationCap />}
            title="VSTEP 4 kỹ năng (B1 – C1)"
            description="Nghe · Đọc · Viết · Nói theo khung năng lực 6 bậc Việt Nam. Chuẩn đầu ra đại học, sau đại học, giáo viên."
            badge={
              <Badge tone="emerald" size="xs">
                4 kỹ năng
              </Badge>
            }
            className="h-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <p className="text-xs text-slate-400">Chưa chắc chắn? Chọn TOEIC — bạn vẫn có thể làm đề VSTEP sau.</p>
        <Button size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/onboarding/target')}>
          Tiếp tục
        </Button>
      </div>
    </Card>
  );
};
