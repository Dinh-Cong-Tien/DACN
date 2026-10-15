import React from 'react';
import { IQuestion } from '@toeic-vstep/shared';
import { Volume2, FileText, CheckCircle2, XCircle } from 'lucide-react';

interface QuestionRendererProps {
  question: IQuestion;
  selectedAnswer?: string;
  onSelectAnswer: (key: string) => void;
  showExplanation?: boolean;
  isReadOnly?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  showExplanation = false,
  isReadOnly = false,
}) => {
  const isCorrect = selectedAnswer === (typeof question.correctAnswer === 'object' && 'key' in question.correctAnswer ? question.correctAnswer.key : question.correctAnswer);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      {/* Passage / Audio Stimulus (Nếu có) */}
      {question.passage && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          {question.passage.title && (
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              {question.passage.title}
            </h4>
          )}
          {question.passage.audioUrl && (
            <div className="flex items-center gap-3 bg-white p-2 rounded-md border border-slate-200">
              <Volume2 className="w-5 h-5 text-indigo-600 animate-pulse" />
              <audio controls src={question.passage.audioUrl} className="w-full h-8" />
            </div>
          )}
          {question.passage.content && (
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto pr-2">
              {question.passage.content}
            </div>
          )}
        </div>
      )}

      {/* Đề bài (Question Stem) */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900 leading-snug">
          {question.stem}
        </h3>
        <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase shrink-0">
          {question.partOrSkill}
        </span>
      </div>

      {/* Danh sách lựa chọn (Options) */}
      <div className="space-y-2.5">
        {question.options.map((opt) => {
          const isSelected = selectedAnswer === opt.key;
          let btnStyle = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-gray-700';

          if (isSelected) {
            btnStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-medium ring-2 ring-indigo-500/20';
          }

          if (showExplanation) {
            const correctKey = typeof question.correctAnswer === 'object' && 'key' in question.correctAnswer ? question.correctAnswer.key : question.correctAnswer;
            if (opt.key === correctKey) {
              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
            }
          }

          return (
            <button
              key={opt.key}
              disabled={isReadOnly}
              onClick={() => onSelectAnswer(opt.key)}
              className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-sm transition-all text-left ${btnStyle} ${
                isReadOnly ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {opt.key}
                </span>
                <span>{opt.text}</span>
              </div>

              {showExplanation && (
                <div>
                  {opt.key === (typeof question.correctAnswer === 'object' && 'key' in question.correctAnswer ? question.correctAnswer.key : question.correctAnswer) && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lời giải thích (Explanation) */}
      {showExplanation && question.explanation && (
        <div className={`mt-4 p-4 rounded-lg border text-sm ${isCorrect ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-amber-50/50 border-amber-200 text-amber-900'}`}>
          <div className="font-semibold mb-1 flex items-center gap-2">
            <span>💡 Giải thích chi tiết:</span>
          </div>
          <p className="leading-relaxed whitespace-pre-line text-xs md:text-sm">
            {question.explanation}
          </p>
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-amber-200/60">
              {question.tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-amber-800 border border-amber-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
