import React, { useState } from 'react';
import { IQuestion } from '@toeic-vstep/shared';
import { QuestionRenderer } from '../exam/QuestionRenderer';
import { ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';

interface PracticeEngineProps {
  questions: IQuestion[];
  onMistakeRecorded?: (questionId: string, wrongKey: string) => void;
  onFinishPractice?: () => void;
}

export const PracticeEngine: React.FC<PracticeEngineProps> = ({
  questions,
  onMistakeRecorded,
  onFinishPractice,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionMistakes, setSessionMistakes] = useState<string[]>([]);

  const currentQ = questions[currentIndex];

  if (!currentQ || questions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Hoàn thành phiên luyện tập!</h3>
        <p className="text-sm text-gray-600">
          Bạn đã luyện tập xong bộ câu hỏi này. Đã ghi nhận {sessionMistakes.length} câu cần đưa vào Sổ tay lỗi sai.
        </p>
        <button
          onClick={onFinishPractice}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Trở về trang luyện tập
        </button>
      </div>
    );
  }

  const handleSelect = (key: string) => {
    if (isAnswered) return;
    setSelectedKey(key);
    setIsAnswered(true);

    const correctKey = typeof currentQ.correctAnswer === 'object' && 'key' in currentQ.correctAnswer
      ? currentQ.correctAnswer.key
      : currentQ.correctAnswer;

    if (key !== correctKey) {
      setSessionMistakes((prev) => [...prev, currentQ.id]);
      if (onMistakeRecorded) {
        onMistakeRecorded(currentQ.id, key);
      }
    }
  };

  const handleNext = () => {
    setSelectedKey(undefined);
    setIsAnswered(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onFinishPractice) {
      onFinishPractice();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">Luyện tập câu hỏi</span>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
            Câu {currentIndex + 1}/{questions.length}
          </span>
        </div>
        {sessionMistakes.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>Đã ghi {sessionMistakes.length} câu vào Sổ lỗi</span>
          </div>
        )}
      </div>

      {/* Main Question with instant explanation */}
      <QuestionRenderer
        question={currentQ}
        selectedAnswer={selectedKey}
        onSelectAnswer={handleSelect}
        showExplanation={isAnswered}
        isReadOnly={isAnswered}
      />

      {/* Action Footer */}
      {isAnswered && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
          <button
            onClick={() => {
              setIsAnswered(false);
              setSelectedKey(undefined);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại câu này
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition"
          >
            <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Hoàn thành'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
