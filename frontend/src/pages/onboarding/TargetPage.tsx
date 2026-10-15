import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, ArrowLeft, Calendar, Trophy, Sparkles } from 'lucide-react';

export const TargetPage: React.FC = () => {
  const navigate = useNavigate();
  const goalType = localStorage.getItem('onboarding_goal') || 'TOEIC';

  const toeicTargets = [
    { score: 500, label: 'Cơ bản (Tốt nghiệp ĐH)', desc: 'Nghe hiểu hội thoại cơ bản, đọc hiểu thông báo và email ngắn.' },
    { score: 650, label: 'Trung cấp (Doanh nghiệp)', desc: 'Giao tiếp tốt trong công việc, đọc hiểu tài liệu chuyên ngành.' },
    { score: 800, label: 'Nâng cao (Đa quốc gia)', desc: 'Xử lý thành thạo mọi tình huống đàm phán, thuyết trình quốc tế.' },
    { score: 900, label: 'Xuất sắc (Chuyên gia)', desc: 'Gần tương đương người bản ngữ trong môi trường kinh doanh.' },
  ];

  const vstepTargets = [
    { score: 'B1', label: 'Bậc 3 / 6 (4.0 - 5.5)', desc: 'Đủ điều kiện ra trường Đại học, giao tiếp tình huống thường ngày.' },
    { score: 'B2', label: 'Bậc 4 / 6 (6.0 - 8.0)', desc: 'Chuẩn đầu ra Thạc sĩ, giáo viên Anh văn tiểu học/THCS.' },
    { score: 'C1', label: 'Bậc 5 / 6 (8.5 - 10.0)', desc: 'Chuẩn Tiến sĩ, giảng viên Đại học chuyên ngữ, dịch thuật.' },
  ];

  const [selectedScore, setSelectedScore] = useState<any>(goalType === 'TOEIC' ? 650 : 'B2');
  const [targetMonths, setTargetMonths] = useState(3);

  const handleNext = () => {
    localStorage.setItem('onboarding_target_score', String(selectedScore));
    localStorage.setItem('onboarding_target_months', String(targetMonths));
    navigate('/onboarding/schedule');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Stepper Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bước 2/6 • Thiết lập mục tiêu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Mục tiêu điểm số bạn muốn chinh phục?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Mục tiêu này sẽ xác định độ khó của bài học và tần suất bài tập mô phỏng bạn cần hoàn thành.
          </p>
        </div>

        {/* Target score options */}
        <div className="space-y-3 mb-6">
          {(goalType === 'TOEIC' ? toeicTargets : vstepTargets).map((t: any) => (
            <div
              key={t.score}
              onClick={() => setSelectedScore(t.score)}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                selectedScore === t.score
                  ? 'border-indigo-600 bg-white shadow-md shadow-indigo-100 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-12 rounded-xl flex items-center justify-center font-black text-base ${
                    selectedScore === t.score
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {t.score}+
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{t.label}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Slider */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-8 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Thời gian dự kiến thi chứng chỉ:
            </span>
            <span className="text-indigo-600 font-black text-sm">{targetMonths} Tháng nữa</span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            value={targetMonths}
            onChange={(e) => setTargetMonths(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>1 tháng (Gấp rút)</span>
            <span>3 tháng (Khuyến nghị)</span>
            <span>6 tháng</span>
            <span>12 tháng</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/onboarding/goal')}
            className="px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-2 group transition"
          >
            <span>Tiếp tục: Lên lịch học</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
