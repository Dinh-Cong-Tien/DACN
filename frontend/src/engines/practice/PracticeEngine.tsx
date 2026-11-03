import React, { useMemo, useState } from 'react';
import { IQuestion } from '@toeic-vstep/shared';
import { ArrowRight, RotateCcw, AlertCircle, Trophy, Target, Zap, BookmarkPlus, Home, Flame } from 'lucide-react';
import { QuestionRenderer, PassageBlock } from '../exam/QuestionRenderer';
import { cn, getCorrectKey } from '@/shared/utils';
import { Button, Badge, Card, RingProgress, ProgressBar } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

interface PracticeEngineProps {
  title?: string;
  questions: IQuestion[];
  onMistakeRecorded?: (questionId: string, wrongKey: string) => void;
  onFinishPractice?: (summary: { correct: number; total: number; mistakes: string[] }) => void;
  exitTo?: string;
  /** Chế độ dictation: hiển thị ô nhập thay vì chọn đáp án */
  mode?: 'QUIZ';
}

/** Engine luyện tập: phản hồi tức thì, giải thích, ghi nhận lỗi sai, màn hình tổng kết */
export const PracticeEngine: React.FC<PracticeEngineProps> = ({ title = 'Luyện tập', questions, onMistakeRecorded, onFinishPractice, exitTo = '/app/practice' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const [isAnswered, setIsAnswered] = useState(false);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const groupedPassage = useMemo(
    () => (currentQ?.passage && questions.filter((q) => q.passage?.id === currentQ.passage?.id).length > 1 ? currentQ.passage : null),
    [currentQ, questions]
  );

  if (!total) {
    return (
      <Card className="max-w-md mx-auto text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="font-bold text-slate-800">Không có câu hỏi</p>
        <Button to={exitTo} variant="outline">
          Quay lại
        </Button>
      </Card>
    );
  }

  const handleSelect = (key: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedKey(key);
    setIsAnswered(true);
    const ok = key === getCorrectKey(currentQ);
    if (ok) {
      setCorrectIds((c) => [...c, currentQ.id]);
      setCombo((c) => {
        const n = c + 1;
        setBestCombo((b) => Math.max(b, n));
        if (n === 3) toast.success('Combo x3!', 'Phong độ tuyệt vời, tiếp tục nào!');
        if (n === 5) toast.success('Combo x5', 'Bạn đang cực kỳ tập trung!');
        return n;
      });
    } else {
      setCombo(0);
      setMistakes((m) => [...m, currentQ.id]);
      onMistakeRecorded?.(currentQ.id, key);
    }
  };

  const handleNext = () => {
    setSelectedKey(undefined);
    setIsAnswered(false);
    if (currentIndex + 1 < total) setCurrentIndex((i) => i + 1);
    else {
      setFinished(true);
      onFinishPractice?.({ correct: correctIds.length, total, mistakes });
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedKey(undefined);
    setIsAnswered(false);
    setMistakes([]);
    setCorrectIds([]);
    setCombo(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((correctIds.length / total) * 100);
    const tone = pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose';
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-scale-in">
        <Card className="text-center space-y-5" padding="lg">
          <div className="relative inline-flex">
            <RingProgress value={pct} size={150} stroke={12} tone={tone}>
              <div>
                <p className="text-3xl font-black text-slate-900">{pct}%</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Chính xác</p>
              </div>
            </RingProgress>
            <Trophy className="absolute -top-2 -right-2 w-9 h-9 text-amber-400 animate-bounce-soft" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt, tiếp tục nhé!' : 'Cần ôn lại kỹ hơn'}</h3>
            <p className="text-sm text-slate-500 mt-1">
              Bạn trả lời đúng <b className="text-slate-800">{correctIds.length}</b>/{total} câu · {mistakes.length} câu đã lưu vào Sổ tay lỗi sai.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <Target className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xl font-black text-emerald-700">{correctIds.length}</p>
              <p className="text-[10px] font-bold uppercase text-emerald-600/70">Đúng</p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
              <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <p className="text-xl font-black text-rose-700">{mistakes.length}</p>
              <p className="text-[10px] font-bold uppercase text-rose-600/70">Sai</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <Zap className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xl font-black text-amber-700">x{bestCombo}</p>
              <p className="text-[10px] font-bold uppercase text-amber-600/70">Combo tối đa</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={restart}>
              Làm lại
            </Button>
            {mistakes.length > 0 && (
              <Button variant="soft" leftIcon={<BookmarkPlus className="w-4 h-4" />} to="/app/mistakes">
                Xem sổ tay lỗi sai
              </Button>
            )}
            <Button leftIcon={<Home className="w-4 h-4" />} to={exitTo}>
              Về trang luyện tập
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card padding="sm" className="animate-fade-down">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">{title}</span>
            <Badge tone="indigo">
              Câu {currentIndex + 1}/{total}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {combo >= 2 && (
              <Badge tone="amber" solid icon={<Flame className="w-3 h-3" />} className="animate-pop">
                Combo x{combo}
              </Badge>
            )}
            <Badge tone="emerald">{correctIds.length} đúng</Badge>
            <Badge tone="rose">{mistakes.length} sai</Badge>
          </div>
        </div>
        <ProgressBar value={((currentIndex + (isAnswered ? 1 : 0)) / total) * 100} size="sm" className="mt-3" />
      </Card>

      {groupedPassage && <PassageBlock passage={groupedPassage} />}

      {currentQ && (
        <div key={currentQ.id} className="animate-slide-in-right">
          <QuestionRenderer question={currentQ} index={currentIndex} selectedAnswer={selectedKey} onSelectAnswer={handleSelect} showExplanation={isAnswered} isReadOnly={isAnswered} hidePassage={!!groupedPassage} />
        </div>
      )}

      {isAnswered && (
        <div className="flex items-center justify-between bg-white p-3 md:p-4 rounded-2xl border-2 border-slate-900 shadow-hard animate-fade-up sticky bottom-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => {
              setIsAnswered(false);
              setSelectedKey(undefined);
            }}
          >
            Làm lại câu này
          </Button>
          <Button size="md" variant={currentIndex + 1 < total ? 'primary' : 'success'} onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />} className={cn('animate-pop')}>
            {currentIndex + 1 < total ? 'Câu tiếp theo' : 'Xem kết quả'}
          </Button>
        </div>
      )}
    </div>
  );
};
