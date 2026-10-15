import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, ArrowRight, ArrowLeft, Bell, Sparkles } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri', 'Sun']);

  const daysOfWeek = [
    { id: 'Mon', label: 'T2' },
    { id: 'Tue', label: 'T3' },
    { id: 'Wed', label: 'T4' },
    { id: 'Thu', label: 'T5' },
    { id: 'Fri', label: 'T6' },
    { id: 'Sat', label: 'T7' },
    { id: 'Sun', label: 'CN' },
  ];

  const minuteOptions = [
    { val: 15, label: '15 phút/ngày', desc: 'Nhẹ nhàng, duy trì phản xạ và streak' },
    { val: 30, label: '30 phút/ngày', desc: 'Tiêu chuẩn, cân bằng hiệu quả và thời gian' },
    { val: 60, label: '60 phút/ngày', desc: 'Tập trung cao độ, bứt phá thần tốc' },
  ];

  const toggleDay = (id: string) => {
    if (selectedDays.includes(id)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== id));
      }
    } else {
      setSelectedDays([...selectedDays, id]);
    }
  };

  const handleNext = () => {
    localStorage.setItem('onboarding_daily_minutes', String(dailyMinutes));
    localStorage.setItem('onboarding_days', JSON.stringify(selectedDays));
    navigate('/onboarding/skills');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Stepper Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bước 3/6 • Lập lịch học thông minh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bạn có thể dành bao nhiêu thời gian mỗi ngày?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Thuật toán Spaced Repetition sẽ phân bổ số lượng thẻ từ vựng và bài tập ngữ pháp phù hợp với quỹ thời gian này.
          </p>
        </div>

        {/* Daily Minutes Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {minuteOptions.map((opt) => (
            <div
              key={opt.val}
              onClick={() => setDailyMinutes(opt.val)}
              className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                dailyMinutes === opt.val
                  ? 'border-indigo-600 bg-white shadow-md shadow-indigo-100 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${dailyMinutes === opt.val ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-sm font-black text-slate-900">{opt.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
            </div>
          ))}
        </div>

        {/* Days of week selection */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Những ngày trong tuần bạn muốn học:
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Đã chọn {selectedDays.length} ngày/tuần</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              ~{(selectedDays.length * dailyMinutes) / 60} giờ/tuần
            </span>
          </div>

          <div className="flex justify-between gap-2">
            {daysOfWeek.map((day) => {
              const active = selectedDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`flex-1 py-3.5 rounded-xl font-black text-xs transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/onboarding/target')}
            className="px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-2 group transition"
          >
            <span>Tiếp tục: Tự đánh giá kỹ năng</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
