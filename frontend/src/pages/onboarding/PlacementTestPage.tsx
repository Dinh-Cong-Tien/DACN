import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowRight, Sparkles, Volume2, HelpCircle } from 'lucide-react';

interface Question {
  id: number;
  part: string;
  type: 'Listening' | 'Reading' | 'Grammar';
  content: string;
  options: { key: string; text: string }[];
  correct: string;
}

const mockPlacementQuestions: Question[] = [
  {
    id: 1,
    part: 'Part 5',
    type: 'Grammar',
    content: 'Ms. Sato ______ the financial proposal before submitting it to the executive board yesterday.',
    options: [
      { key: 'A', text: 'review' },
      { key: 'B', text: 'reviewed' },
      { key: 'C', text: 'will review' },
      { key: 'D', text: 'is reviewing' },
    ],
    correct: 'B',
  },
  {
    id: 2,
    part: 'Part 5',
    type: 'Grammar',
    content: 'The conference organizers requested that all participants ______ by 8:30 AM.',
    options: [
      { key: 'A', text: 'arrive' },
      { key: 'B', text: 'arrives' },
      { key: 'C', text: 'arrived' },
      { key: 'D', text: 'arriving' },
    ],
    correct: 'A',
  },
  {
    id: 3,
    part: 'Part 5',
    type: 'Grammar',
    content: 'Neither the department manager nor the team members ______ aware of the budget cuts.',
    options: [
      { key: 'A', text: 'was' },
      { key: 'B', text: 'were' },
      { key: 'C', text: 'is' },
      { key: 'D', text: 'has been' },
    ],
    correct: 'B',
  },
  {
    id: 4,
    part: 'Part 2',
    type: 'Listening',
    content: '[Audio Simulation]: "Where should we store these marketing brochures?"',
    options: [
      { key: 'A', text: 'Yes, I received the email.' },
      { key: 'B', text: 'In the supply cabinet on the third floor.' },
      { key: 'C', text: 'No, tomorrow morning.' },
      { key: 'D', text: 'By train.' },
    ],
    correct: 'B',
  },
  {
    id: 5,
    part: 'Part 7',
    type: 'Reading',
    content: 'Notice: "All elevator maintenance will be conducted this Saturday between 9:00 AM and 1:00 PM. Please use the stairwells." - What should employees do if they need to change floors?',
    options: [
      { key: 'A', text: 'Wait until next week.' },
      { key: 'B', text: 'Use the stairs.' },
      { key: 'C', text: 'Contact maintenance directly.' },
      { key: 'D', text: 'Leave the building immediately.' },
    ],
    correct: 'B',
  },
];

export const PlacementTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (key: string) => {
    setAnswers({ ...answers, [currentIdx]: key });
  };

  const currentQ = mockPlacementQuestions[currentIdx];

  const handleFinish = () => {
    // Calculate raw score
    let correctCount = 0;
    mockPlacementQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / mockPlacementQuestions.length) * 500 + 200);
    localStorage.setItem('placement_correct_count', String(correctCount));
    localStorage.setItem('placement_score', String(calculatedScore));
    navigate('/onboarding/placement-result');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header bar */}
        <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {currentQ.part} • {currentQ.type}
            </span>
            <h2 className="text-sm font-black text-slate-800 mt-1">
              Câu {currentIdx + 1} / {mockPlacementQuestions.length}
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-sm bg-slate-100 px-3.5 py-1.5 rounded-2xl text-slate-700">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-3">
            {currentQ.type === 'Listening' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 text-xs font-bold">
                <Volume2 className="w-4 h-4" />
                <span>Audio đã được đồng bộ chuẩn giọng ETS Mỹ</span>
              </div>
            )}
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.content}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentIdx] === opt.key;
              return (
                <div
                  key={opt.key}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {opt.key}
                  </div>
                  <span className="text-sm font-semibold">{opt.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between mt-6">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
            className="px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition disabled:opacity-30 disabled:pointer-events-none"
          >
            Câu trước
          </button>

          {currentIdx < mockPlacementQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-200 flex items-center gap-1.5 transition"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-200 flex items-center gap-2 transition"
            >
              <span>Nộp bài & Phân tích kết quả</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
