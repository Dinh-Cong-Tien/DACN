import React, { useState, useEffect, useCallback } from 'react';
import { IMockTest, IQuestion } from '@toeic-vstep/shared';
import { QuestionRenderer } from './QuestionRenderer';
import { Clock, Bookmark, Send, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface ExamRunnerProps {
  test: IMockTest;
  attemptId: string;
  initialTimeRemainingSec?: number;
  onSaveAnswer: (questionId: string, selectedKey: string) => void;
  onSubmitExam: (answers: Record<string, string>, timeSpentSec: number) => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  test,
  initialTimeRemainingSec = test.durationMinutes * 60,
  onSaveAnswer,
  onSubmitExam,
}) => {
  // Lấy danh sách toàn bộ câu hỏi từ các section
  const allQuestions: IQuestion[] = test.sections.flatMap((sec) => sec.questions);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemainingSec);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const currentQuestion = allQuestions[currentIndex];

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = useCallback(
    (key: string) => {
      if (!currentQuestion) return;
      const updated = { ...answers, [currentQuestion.id]: key };
      setAnswers(updated);
      onSaveAnswer(currentQuestion.id, key);
    },
    [currentQuestion, answers, onSaveAnswer]
  );

  const toggleFlag = (id: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFinalSubmit = () => {
    const timeSpent = test.durationMinutes * 60 - Math.max(0, timeRemaining);
    onSubmitExam(answers, timeSpent);
    setIsSubmitModalOpen(false);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Topbar: Tiêu đề đề thi, Đồng hồ đếm ngược, Nút nộp bài */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="font-bold text-gray-900 text-lg">{test.title}</h1>
          <p className="text-xs text-gray-500">
            {test.examType} • {allQuestions.length} câu • {test.durationMinutes} phút
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-base ${
            timeRemaining < 300 ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-200' : 'bg-slate-100 text-slate-700'
          }`}>
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            Nộp bài
          </button>
        </div>
      </header>

      {/* Main Body: 2 cột (Cột chính: QuestionRenderer, Cột phụ: Question Grid Matrix) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cột chính: Đề bài & lựa chọn */}
        <div className="lg:col-span-3 space-y-4">
          {currentQuestion && (
            <QuestionRenderer
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.id]}
              onSelectAnswer={handleSelectAnswer}
            />
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Câu trước
            </button>

            <button
              onClick={() => currentQuestion && toggleFlag(currentQuestion.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentQuestion && flaggedIds.has(currentQuestion.id)
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Đánh dấu xem lại
            </button>

            <button
              disabled={currentIndex === allQuestions.length - 1}
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Câu tiếp theo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cột phụ: Bảng ma trận câu hỏi (Question Matrix) */}
        <aside className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 h-fit sticky top-20">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="font-semibold text-gray-800 text-sm">Tiến độ bài làm</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {answeredCount}/{allQuestions.length} câu
            </span>
          </div>

          {/* Grid buttons */}
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
            {allQuestions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isFlagged = flaggedIds.has(q.id);
              const isCurrent = idx === currentIndex;

              let btnColor = 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-400';
              if (isAnswered) btnColor = 'bg-indigo-600 text-white border-indigo-600';
              if (isFlagged) btnColor = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
              if (isCurrent) btnColor += ' ring-2 ring-indigo-500 ring-offset-2';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-md border text-xs font-semibold flex items-center justify-center transition-all ${btnColor}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
              <span>Đã làm ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
              <span>Đánh dấu xem lại ({flaggedIds.size})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300 inline-block" />
              <span>Chưa làm ({allQuestions.length - answeredCount})</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Xác nhận nộp bài */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-gray-900 text-lg">Xác nhận nộp bài thi?</h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Bạn đã hoàn thành <strong className="text-gray-900">{answeredCount}</strong> / {allQuestions.length} câu hỏi.
              {allQuestions.length - answeredCount > 0 && (
                <span className="block mt-1 text-rose-600 font-medium">
                  Còn {allQuestions.length - answeredCount} câu chưa trả lời!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
