import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, GraduationCap, Check } from 'lucide-react';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { Button, Card } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { cn } from '@/shared/utils';
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

const OPTIONS: { type: ExamType; title: string; sub: string; desc: string; points: string[]; photo: string; icon: React.ElementType; tone: string }[] = [
  {
    type: 'TOEIC',
    title: 'TOEIC',
    sub: 'Listening & Reading',
    desc: '200 câu · 120 phút · thang điểm 10–990. Dành cho sinh viên tốt nghiệp, người đi làm cần chứng chỉ cho doanh nghiệp.',
    points: ['Đề full test 200 câu', 'Luyện riêng 7 Part', 'Có lời giải & bản dịch'],
    photo: PHOTOS.office,
    icon: Briefcase,
    tone: 'bg-indigo-600',
  },
  {
    type: 'VSTEP',
    title: 'VSTEP',
    sub: '4 kỹ năng · B1 – C1',
    desc: 'Nghe · Đọc · Viết · Nói theo Khung năng lực 6 bậc Việt Nam. Chuẩn đầu ra đại học, sau đại học, thi công chức, giáo viên.',
    points: ['Format Bộ GD&ĐT', 'Giáo viên chấm Viết/Nói', 'Đủ 4 kỹ năng'],
    photo: PHOTOS.campus,
    icon: GraduationCap,
    tone: 'bg-violet-500',
  },
];

export const GoalPage: React.FC = () => {
  useDocumentTitle('Chọn mục tiêu');
  const navigate = useNavigate();
  const [state, setState] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);

  return (
    <Card hard padding="lg" className="animate-scale-in">
      <div className="text-center space-y-3 mb-8">
        <span className="sticker tilt-1">Bước 1 / 6</span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Bạn đang hướng tới <span className="mark">kỳ thi nào</span>?
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">Lựa chọn này quyết định ngân hàng câu hỏi, đề thi thử và cấu trúc lộ trình của bạn. Có thể đổi sau trong Cài đặt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {OPTIONS.map((o, i) => {
          const selected = state.examType === o.type;
          const Icon = o.icon;
          return (
            <button
              key={o.type}
              type="button"
              onClick={() => setState({ ...state, examType: o.type, targetScore: '' })}
              className={cn(
                'group text-left rounded-3xl border-2 overflow-hidden transition-all duration-300 ease-spring animate-fade-up',
                selected ? 'border-slate-900 shadow-hard-lg -translate-y-1 bg-white' : 'border-slate-200 bg-white hover:border-slate-900 hover:-translate-y-0.5 hover:shadow-hard'
              )}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="relative">
                <Img src={o.photo} ratio="video" alt={o.title} fallbackClass={o.tone} className="group-hover:scale-105 transition-transform duration-700" />
                <span className={cn('absolute top-3 left-3 w-11 h-11 rounded-xl border-2 border-slate-900 text-white flex items-center justify-center shadow-hard-sm', o.tone)}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className={cn('absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center transition-all', selected ? 'bg-amber-300 scale-110' : 'bg-white')}>{selected && <Check className="w-4 h-4 text-slate-900" />}</span>
              </div>
              <div className="p-5">
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-2xl font-extrabold text-slate-900">{o.title}</p>
                  <p className="text-xs font-bold text-slate-500">{o.sub}</p>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{o.desc}</p>
                <ul className="flex flex-wrap gap-1.5 mt-3">
                  {o.points.map((p) => (
                    <li key={p} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-700">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
        <p className="text-xs text-slate-500">Chưa chắc chắn? Chọn TOEIC — bạn vẫn làm được đề VSTEP sau.</p>
        <Button size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/onboarding/target')}>
          Tiếp tục
        </Button>
      </div>
    </Card>
  );
};
