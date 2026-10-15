import React, { useState } from 'react';
import { VocabFlashcardEngine, IVocabCard } from '../../../engines/vocab-flashcard/VocabFlashcardEngine';
import { RotateCcw, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

const mockDueCards: IVocabCard[] = [
  {
    id: 'c-1',
    word: 'Negotiate',
    phonetic: '/nɪˈɡoʊ.ʃi.eɪt/',
    partOfSpeech: 'verb',
    definitionVi: 'Đàm phán, thương lượng hợp đồng',
    definitionEn: 'To try to reach an agreement by formal discussion',
    exampleEn: 'The company is negotiating a new contract with the international supplier.',
    exampleVi: 'Công ty đang đàm phán một hợp đồng mới với nhà cung ứng quốc tế.',
    currentEaseFactor: 2.5,
    currentIntervalDays: 1,
    repetitions: 1,
  },
  {
    id: 'c-2',
    word: 'Accommodate',
    phonetic: '/əˈkɑː.mə.deɪt/',
    partOfSpeech: 'verb',
    definitionVi: 'Cung cấp chỗ ở; đáp ứng nhu cầu',
    definitionEn: 'To provide with a place to live or to be; to consider and satisfy a wish/need',
    exampleEn: 'The hotel can accommodate up to 500 conference attendees.',
    exampleVi: 'Khách sạn có thể đáp ứng chỗ ở cho tối đa 500 khách tham dự hội nghị.',
    currentEaseFactor: 2.3,
    currentIntervalDays: 3,
    repetitions: 2,
  },
  {
    id: 'c-3',
    word: 'Comprehensive',
    phonetic: '/ˌkɑːm.prəˈhen.sɪv/',
    partOfSpeech: 'adjective',
    definitionVi: 'Toàn diện, bao quát mọi mặt',
    definitionEn: 'Including or dealing with all or nearly all elements or aspects of something',
    exampleEn: 'The training program offers a comprehensive overview of financial risk management.',
    exampleVi: 'Chương trình đào tạo cung cấp cái nhìn toàn diện về quản trị rủi ro tài chính.',
    currentEaseFactor: 2.6,
    currentIntervalDays: 6,
    repetitions: 3,
  },
];

export const StudentReviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VOCAB' | 'MISTAKES'>('VOCAB');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmitReview = (cardId: string, quality: number, newInterval: number) => {
    console.log(`Updated card ${cardId} with quality ${quality}, next review in ${newInterval} days.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Thuật toán SuperMemo SM-2</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Phòng ôn tập Spaced Repetition</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Hệ thống tính toán thời điểm vàng chuẩn bị quên để nhắc lại, giúp chuyển trí nhớ ngắn hạn thành trí nhớ vĩnh viễn.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveTab('VOCAB')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'VOCAB'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Từ vựng đến hạn ({mockDueCards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MISTAKES')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'MISTAKES'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Câu sai đến hạn (5)</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'VOCAB' ? (
        <div className="pt-4">
          <VocabFlashcardEngine
            cards={mockDueCards}
            onCompleteSession={() => setIsCompleted(true)}
            onSubmitReview={handleSubmitReview}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Ôn tập các câu sai trong Sổ lỗi</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống chọn ra 5 câu ngữ pháp/từ vựng bạn từng chọn sai ở các bài thi thử trước đây để làm lại.
          </p>
          <button className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition">
            Bắt đầu giải câu sai
          </button>
        </div>
      )}
    </div>
  );
};
