import React, { useState } from 'react';
import { Volume2, RotateCw, CheckCircle2 } from 'lucide-react';
import { calculateNextSrsReview } from '@toeic-vstep/shared';

export interface IVocabCard {
  id: string;
  word: string;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  definitionVi: string;
  definitionEn?: string | null;
  exampleEn: string;
  exampleVi?: string | null;
  audioUrl?: string | null;
  currentEaseFactor: number;
  currentIntervalDays: number;
  repetitions: number;
}

interface VocabFlashcardEngineProps {
  cards: IVocabCard[];
  onCompleteSession: () => void;
  onSubmitReview: (cardId: string, quality: number, newIntervalDays: number) => void;
}

export const VocabFlashcardEngine: React.FC<VocabFlashcardEngineProps> = ({
  cards,
  onCompleteSession,
  onSubmitReview,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  if (!currentCard || cards.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto shadow-sm space-y-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">Chúc mừng!</h3>
        <p className="text-sm text-gray-600">
          Bạn đã hoàn thành tất cả từ vựng cần ôn tập của phiên học này.
        </p>
        <button
          onClick={onCompleteSession}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCard.audioUrl) {
      new Audio(currentCard.audioUrl).play();
    } else {
      // Trình duyệt SpeechSynthesis fallback nếu không có file âm thanh
      const utterance = new SpeechSynthesisUtterance(currentCard.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRate = (quality: number) => {
    const srsResult = calculateNextSrsReview({
      currentInterval: currentCard.currentIntervalDays,
      repetitions: currentCard.repetitions,
      easeFactor: currentCard.currentEaseFactor,
      quality,
    });

    onSubmitReview(currentCard.id, quality, srsResult.intervalDays);

    setIsFlipped(false);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onCompleteSession();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Từ vựng đến hạn ôn tập</span>
        <span className="font-semibold text-indigo-600">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Interactive Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[340px] bg-white border border-gray-200 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between select-none relative"
      >
        {/* Nút lật thẻ góc trên */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{currentCard.partOfSpeech ? `[${currentCard.partOfSpeech}]` : ''}</span>
          <div className="flex items-center gap-1 text-indigo-600 font-medium">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Chạm để lật mặt thẻ</span>
          </div>
        </div>

        {/* Nội dung Mặt Trước (Front) */}
        {!isFlipped ? (
          <div className="text-center my-auto space-y-4">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {currentCard.word}
            </h2>
            {currentCard.phonetic && (
              <p className="text-base text-gray-500 font-mono">
                {currentCard.phonetic}
              </p>
            )}
            <button
              onClick={playAudio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium text-xs transition"
            >
              <Volume2 className="w-4 h-4" />
              Nghe phát âm chuẩn
            </button>
          </div>
        ) : (
          /* Nội dung Mặt Sau (Back) */
          <div className="my-auto space-y-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">
                {currentCard.definitionVi}
              </p>
              {currentCard.definitionEn && (
                <p className="text-sm text-gray-500 mt-1 italic">
                  {currentCard.definitionEn}
                </p>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-1">
              <p className="text-sm font-medium text-gray-900">
                &quot;{currentCard.exampleEn}&quot;
              </p>
              {currentCard.exampleVi && (
                <p className="text-xs text-gray-500">{currentCard.exampleVi}</p>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400">
          {isFlipped ? 'Đánh giá mức độ ghi nhớ của bạn bên dưới' : 'Nhớ lại nghĩa trước khi lật mặt'}
        </div>
      </div>

      {/* 4 Nút đánh giá SM-2 (Chỉ hiện khi đã lật mặt sau) */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-3 animate-fadeIn">
          <button
            onClick={() => handleRate(0)}
            className="flex flex-col items-center p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 transition"
          >
            <span className="font-bold text-sm">Quên hẳn</span>
            <span className="text-[11px] text-rose-600 mt-0.5">Ôn lại ngay</span>
          </button>

          <button
            onClick={() => handleRate(3)}
            className="flex flex-col items-center p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 transition"
          >
            <span className="font-bold text-sm">Khó</span>
            <span className="text-[11px] text-amber-600 mt-0.5">Sau 1 ngày</span>
          </button>

          <button
            onClick={() => handleRate(4)}
            className="flex flex-col items-center p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 transition"
          >
            <span className="font-bold text-sm">Nhớ tốt</span>
            <span className="text-[11px] text-blue-600 mt-0.5">Sau vài ngày</span>
          </button>

          <button
            onClick={() => handleRate(5)}
            className="flex flex-col items-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition"
          >
            <span className="font-bold text-sm">Rất dễ</span>
            <span className="text-[11px] text-emerald-600 mt-0.5">Sau 1 tuần</span>
          </button>
        </div>
      )}
    </div>
  );
};
