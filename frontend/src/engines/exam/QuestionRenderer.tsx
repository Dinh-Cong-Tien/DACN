import React, { useState } from 'react';
import { IQuestion } from '@toeic-vstep/shared';
import { CheckCircle2, XCircle, FileText, Flag, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { cn, getCorrectKey } from '@/shared/utils';
import { AudioPlayer } from '@/shared/components/media/AudioPlayer';
import { Badge } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

export interface QuestionRendererProps {
  question: IQuestion;
  index?: number;
  selectedAnswer?: string;
  onSelectAnswer: (key: string) => void;
  showExplanation?: boolean;
  isReadOnly?: boolean;
  examMode?: boolean; // audio chỉ phát 1 lần, không tua
  hidePassage?: boolean; // khi passage đã render ở ngoài (nhóm câu)
  allowFlagReport?: boolean;
  /** plain: viền mảnh, không bóng cứng (trang marketing); mặc định giữ kiểu của khu luyện tập */
  variant?: 'default' | 'plain';
  className?: string;
}

const PART_LABEL: Record<string, string> = {
  PART_1: 'Part 1 · Mô tả tranh',
  PART_2: 'Part 2 · Hỏi đáp',
  PART_3: 'Part 3 · Hội thoại',
  PART_4: 'Part 4 · Bài nói',
  PART_5: 'Part 5 · Hoàn thành câu',
  PART_6: 'Part 6 · Hoàn thành đoạn',
  PART_7: 'Part 7 · Đọc hiểu',
  READING_PART_1: 'VSTEP Reading',
  LISTENING_PART_1: 'VSTEP Listening 1',
  LISTENING_PART_2: 'VSTEP Listening 2',
};

export const PassageBlock: React.FC<{ passage: NonNullable<IQuestion['passage']>; examMode?: boolean; className?: string }> = ({ passage, examMode, className }) => (
  <div className={cn('rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5 space-y-3 animate-fade-in', className)}>
    {passage.title && (
      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
        <FileText className="w-4 h-4 text-indigo-600" />
        {passage.title}
      </h4>
    )}
    {passage.imageUrl && (
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
        <img src={passage.imageUrl} alt="Question stimulus" className="w-full max-h-80 object-cover" loading="lazy" />
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-bold">
          <ImageIcon className="w-3 h-3" /> Hình minh hoạ
        </span>
      </div>
    )}
    {passage.audioUrl && <AudioPlayer src={passage.audioUrl} examMode={examMode} />}
    {passage.content && <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto pr-2 font-medium">{passage.content}</div>}
  </div>
);

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  index,
  selectedAnswer,
  onSelectAnswer,
  showExplanation = false,
  isReadOnly = false,
  examMode = false,
  hidePassage = false,
  allowFlagReport = true,
  variant = 'default',
  className,
}) => {
  const plain = variant === 'plain';
  const correctKey = getCorrectKey(question);
  const isCorrect = selectedAnswer === correctKey;
  const [reported, setReported] = useState(false);

  const report = () => {
    setReported(true);
    toast.success('Đã gửi phản hồi', 'Trưởng bộ môn sẽ xem xét câu hỏi này. Cảm ơn đóng góp của bạn!');
  };

  return (
    <div className={cn(plain ? 'bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-5' : 'bg-white rounded-3xl border-2 border-slate-900 p-5 md:p-7 shadow-hard space-y-5', className)} key={question.id}>
      {!hidePassage && question.passage && <PassageBlock passage={question.passage} examMode={examMode} />}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {index !== undefined && (plain ? <span className="pt-1.5 text-base md:text-lg font-semibold tabular-nums text-slate-400 shrink-0">{index + 1}.</span> : <span className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 font-black text-sm flex items-center justify-center shrink-0 border-2 border-slate-900">{index + 1}</span>)}
          <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug pt-1.5">{question.stem}</h3>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge tone="indigo" size="xs">
            {PART_LABEL[question.partOrSkill] ?? question.partOrSkill}
          </Badge>
          {question.level && (
            <Badge tone="slate" size="xs">
              {question.level}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === opt.key;
          let style = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 hover:translate-x-0.5';
          let circle = 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700';
          if (plain) {
            style = 'border-slate-200 hover:border-slate-400 text-slate-800';
            circle = 'border border-slate-300 text-slate-600';
          }
          if (isSelected) {
            style = plain ? 'border-indigo-600 bg-indigo-50 text-slate-900' : 'border-slate-900 bg-amber-100 text-slate-900 font-semibold shadow-hard-sm';
            circle = plain ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-amber-300';
          }
          if (showExplanation) {
            if (opt.key === correctKey) {
              style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
              circle = 'bg-emerald-600 text-white';
            } else if (isSelected && !isCorrect) {
              style = 'border-rose-400 bg-rose-50 text-rose-900 animate-shake';
              circle = 'bg-rose-600 text-white';
            } else {
              style = 'border-slate-200 text-slate-400 opacity-70';
            }
          }
          return (
            <button
              key={opt.key}
              disabled={isReadOnly}
              onClick={() => onSelectAnswer(opt.key)}
              className={cn('group w-full flex items-center justify-between gap-3 text-sm text-left transition-all duration-300 ease-spring animate-fade-up disabled:cursor-default', plain ? 'px-3.5 py-3 rounded-lg border' : 'p-3.5 md:p-4 rounded-2xl border-2', style)}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={cn('rounded-full flex items-center justify-center text-xs shrink-0 transition-all duration-300', plain ? 'w-7 h-7 font-semibold' : 'w-8 h-8 font-black', circle)}>{opt.key}</span>
                <span className="leading-snug">{opt.text}</span>
              </div>
              {showExplanation && opt.key === correctKey && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-pop" />}
              {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0 animate-pop" />}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className={cn('rounded-2xl border p-4 md:p-5 text-sm animate-fade-up', isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200')}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className={cn('font-bold flex items-center gap-2', isCorrect ? 'text-emerald-800' : 'text-amber-800')}>
              <Lightbulb className="w-4 h-4" />
              {isCorrect ? 'Chính xác! Giải thích chi tiết' : `Đáp án đúng là ${correctKey}`}
            </p>
            {allowFlagReport && (
              <button onClick={report} disabled={reported} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 disabled:opacity-60 transition">
                <Flag className="w-3.5 h-3.5" />
                {reported ? 'Đã báo cáo' : 'Báo lỗi câu hỏi'}
              </button>
            )}
          </div>
          <p className="leading-relaxed text-slate-700 whitespace-pre-line">{question.explanation ?? 'Chưa có lời giải cho câu hỏi này.'}</p>
          {question.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-black/5">
              {question.tags.map((t) => (
                <Badge key={t} tone="slate" size="xs">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
