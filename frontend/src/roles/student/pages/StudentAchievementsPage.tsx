import React from 'react';
import { Award, Flame, Target, BookOpen, Clock, ShieldCheck, Lock } from 'lucide-react';

interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  rewardPoints: number;
}

const mockAchievements: IAchievement[] = [
  {
    id: 'ach-1',
    title: 'Chiến Binh Bền Bỉ (Streak 7 Days)',
    description: 'Duy trì học liên tục trong 7 ngày không gián đoạn.',
    icon: Flame,
    progress: 5,
    maxProgress: 7,
    isUnlocked: false,
    rewardPoints: 100,
  },
  {
    id: 'ach-2',
    title: 'Khởi Đầu Hoàn Hảo (First Exam)',
    description: 'Hoàn thành bài thi thử đầu tiên trên nền tảng.',
    icon: Target,
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    rewardPoints: 50,
  },
  {
    id: 'ach-3',
    title: 'Chuyên Gia Diệt Lỗi (Mistake Solver)',
    description: 'Khắc phục thành công 20 câu sai trong Sổ tay lỗi sai.',
    icon: ShieldCheck,
    progress: 14,
    maxProgress: 20,
    isUnlocked: false,
    rewardPoints: 150,
  },
  {
    id: 'ach-4',
    title: 'Bậc Thầy Từ Vựng (Vocab Master 100)',
    description: 'Ghi nhớ và đạt mức Mastered cho 100 từ vựng Spaced Repetition.',
    icon: BookOpen,
    progress: 42,
    maxProgress: 100,
    isUnlocked: false,
    rewardPoints: 200,
  },
];

export const StudentAchievementsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Award className="w-6 h-6 text-indigo-600" />
          <span>Huy hiệu thành tích (Badges & Achievements)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Mỗi cột mốc hoàn thành đều mở khóa huy hiệu và tích lũy điểm kinh nghiệm học tập.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {mockAchievements.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border transition-all flex items-start gap-4 ${
                item.isUnlocked
                  ? 'border-amber-300 shadow-md bg-gradient-to-tr from-white to-amber-50/30'
                  : 'border-slate-200/90 shadow-sm opacity-80'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  item.isUnlocked ? 'bg-amber-100 text-amber-600 shadow-md' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.isUnlocked ? <Icon className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    +{item.rewardPoints} XP
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Tiến trình:</span>
                    <span>
                      {item.progress} / {item.maxProgress}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.isUnlocked ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(100, (item.progress / item.maxProgress) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
