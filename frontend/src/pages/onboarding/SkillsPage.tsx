import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, BookOpen, Mic, PenTool, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const navigate = useNavigate();
  const goalType = localStorage.getItem('onboarding_goal') || 'TOEIC';

  const [ratings, setRatings] = useState<Record<string, number>>({
    listening: 2,
    reading: 3,
    speaking: 2,
    writing: 2,
  });

  const skills = [
    {
      id: 'listening',
      name: 'Listening (Nghe hiểu)',
      icon: Headphones,
      desc: 'Nghe hội thoại, thông báo, nhận diện từ vựng nối âm và ngữ điệu tự nhiên.',
    },
    {
      id: 'reading',
      name: 'Reading (Đọc hiểu & Ngữ pháp)',
      icon: BookOpen,
      desc: 'Nắm vững ngữ pháp cơ bản, từ vựng theo chủ đề và tốc độ đọc quét thông tin.',
    },
    ...(goalType === 'VSTEP'
      ? [
          {
            id: 'speaking',
            name: 'Speaking (Nói & Thuyết trình)',
            icon: Mic,
            desc: 'Phát âm chuẩn, độ lưu loát, mở rộng ý kiến và tương tác xã hội.',
          },
          {
            id: 'writing',
            name: 'Writing (Viết thư & Luận)',
            icon: PenTool,
            desc: 'Cấu trúc bài viết mạch lạc, liên kết câu và sử dụng ngữ pháp học thuật.',
          },
        ]
      : []),
  ];

  const levelLabels = ['Mất gốc', 'Mới bắt đầu', 'Tạm ổn', 'Tự tin', 'Thành thạo'];

  const setSkillRating = (id: string, val: number) => {
    setRatings((prev) => ({ ...prev, [id]: val }));
  };

  const handleNext = () => {
    localStorage.setItem('onboarding_self_assessment', JSON.stringify(ratings));
    navigate('/onboarding/placement-test');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Stepper Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bước 4/6 • Tự đánh giá năng lực</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bạn cảm thấy thế nào về các kỹ năng hiện tại?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Đừng lo lắng nếu điểm tự đánh giá thấp. Hệ thống sẽ kết hợp với bài test đầu vào để gợi ý bài học phù hợp nhất.
          </p>
        </div>

        {/* Skills Cards */}
        <div className="space-y-4 mb-8">
          {skills.map((skill) => {
            const Icon = skill.icon;
            const currentVal = ratings[skill.id] || 2;
            return (
              <div
                key={skill.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{skill.name}</h4>
                      <p className="text-xs text-slate-500">{skill.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-600 px-3 py-1 rounded-full bg-indigo-50 shrink-0">
                    {levelLabels[currentVal]}
                  </span>
                </div>

                <div className="flex justify-between gap-1.5 pt-2">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSkillRating(skill.id, star)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentVal >= star
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      Bậc {star + 1}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/onboarding/schedule')}
            className="px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-2 group transition"
          >
            <span>Tiếp tục: Làm bài Test đầu vào</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
