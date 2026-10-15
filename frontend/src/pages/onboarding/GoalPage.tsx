import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Target, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const GoalPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<'TOEIC' | 'VSTEP'>('TOEIC');

  const handleNext = () => {
    localStorage.setItem('onboarding_goal', selectedGoal);
    navigate('/onboarding/target');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Stepper Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bước 1/6 • Khởi tạo lộ trình học</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Mục tiêu chứng chỉ của bạn là gì?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            OrbiLingo sẽ tối ưu hóa cấu trúc đề thi, thuật toán phân loại lỗi và từ vựng theo chuẩn khảo thí tương ứng.
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
          {/* TOEIC Card */}
          <div
            onClick={() => setSelectedGoal('TOEIC')}
            className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 relative ${
              selectedGoal === 'TOEIC'
                ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-500/10'
                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
            }`}
          >
            {selectedGoal === 'TOEIC' && (
              <div className="absolute top-4 right-4 text-indigo-600">
                <CheckCircle2 className="w-6 h-6 fill-indigo-600 text-white" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 font-black text-lg">
              ETS
            </div>
            <h3 className="text-lg font-black text-slate-900">TOEIC® Listening & Reading</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Thang điểm 10–990. Chuẩn quốc tế môi trường làm việc doanh nghiệp, tập đoàn đa quốc gia và điều kiện tốt nghiệp đại học.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Part 1-4 Nghe</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Part 5-7 Đọc</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">990 Max</span>
            </div>
          </div>

          {/* VSTEP Card */}
          <div
            onClick={() => setSelectedGoal('VSTEP')}
            className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 relative ${
              selectedGoal === 'VSTEP'
                ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-500/10'
                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
            }`}
          >
            {selectedGoal === 'VSTEP' && (
              <div className="absolute top-4 right-4 text-indigo-600">
                <CheckCircle2 className="w-6 h-6 fill-indigo-600 text-white" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 mb-4 font-black text-lg">
              VN
            </div>
            <h3 className="text-lg font-black text-slate-900">VSTEP (B1 – B2 – C1)</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Khung năng lực ngoại ngữ 6 bậc dùng cho Việt Nam. Đầy đủ 4 kỹ năng Nghe - Nói - Đọc - Viết cho công chức, giáo viên & thạc sĩ.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">4 Kỹ năng trọn gói</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Chấm AI Writing/Speaking</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700">Bậc 3-5 CEFR</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group transition"
          >
            <span>Tiếp tục: Chọn mục tiêu điểm số</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
