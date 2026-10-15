import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Clock,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

export const StudentWritingPage: React.FC = () => {
  const [task, setTask] = useState<'TASK_1' | 'TASK_2'>('TASK_2');
  const [essayContent, setEssayContent] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(40 * 60); // 40 phút cho Task 2
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const wordCount = essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0;
  const targetWords = task === 'TASK_1' ? 120 : 250;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-600" />
            <span>Phòng luyện viết tự luận (Writing Studio)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô phỏng đề thi VSTEP Writing Task 1 & Task 2 có đếm giờ và bộ đếm số từ trực tiếp.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Nộp bài chấm</span>
          </button>
        </div>
      </div>

      {/* Task Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setTask('TASK_1');
            setSecondsLeft(20 * 60);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            task === 'TASK_1' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Task 1: Viết thư / Email (120 từ • 20 phút)
        </button>

        <button
          onClick={() => {
            setTask('TASK_2');
            setSecondsLeft(40 * 60);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            task === 'TASK_2' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Task 2: Bài luận học thuật (250 từ • 40 phút)
        </button>
      </div>

      {/* Prompt Card */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
          Đề bài yêu cầu:
        </span>
        <h3 className="text-sm font-bold text-slate-800 leading-snug">
          {task === 'TASK_1'
            ? 'You received an email from an international friend asking for advice on places to visit in Vietnam during summer vacation. Write a response letter (at least 120 words).'
            : 'Some people believe that online learning will completely replace traditional classrooms in universities. To what extent do you agree or disagree? Give reasons and examples from your own knowledge (at least 250 words).'}
        </h3>
      </div>

      {/* Writing Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <textarea
          rows={14}
          value={essayContent}
          onChange={(e) => setEssayContent(e.target.value)}
          placeholder="Nhập nội dung bài viết của bạn tại đây bằng tiếng Anh..."
          className="w-full text-sm leading-relaxed outline-none border-none resize-y placeholder-slate-400 font-sans text-slate-800"
        />

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className={`font-bold ${wordCount >= targetWords ? 'text-emerald-600' : 'text-slate-500'}`}>
              Số từ: {wordCount} / {targetWords} words
            </span>
            {wordCount >= targetWords && (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đạt độ dài yêu cầu
              </span>
            )}
          </div>

          <button className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1">
            <Save className="w-3.5 h-3.5" />
            <span>Lưu bản nháp tự động</span>
          </button>
        </div>
      </div>

      {/* Result feedback modal preview */}
      {isSubmitted && (
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Bài viết đã được gửi vào hàng đợi chấm điểm</span>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed">
            Hệ thống đang phân tích ngữ pháp, sự mạch lạc và vốn từ vựng (Lexical Resource). Kết quả và nhận xét chi tiết sẽ hiển thị trong phần Kết quả học tập của bạn.
          </p>
        </div>
      )}
    </div>
  );
};
