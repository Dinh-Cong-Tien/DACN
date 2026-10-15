import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Volume2,
  Sparkles,
  Plus,
  RotateCcw,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface IVocabItem {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definitionVi: string;
  exampleEn: string;
  level: string;
  isLearned: boolean;
}

const mockVocabList: IVocabItem[] = [
  {
    id: 'v-1',
    word: 'Negotiate',
    phonetic: '/nɪˈɡoʊ.ʃi.eɪt/',
    partOfSpeech: 'verb',
    definitionVi: 'Đàm phán, thương lượng điều khoản hợp đồng',
    exampleEn: 'The company is negotiating a multi-million dollar contract with the supplier.',
    level: 'B2 • TOEIC 650+',
    isLearned: true,
  },
  {
    id: 'v-2',
    word: 'Accommodate',
    phonetic: '/əˈkɑː.mə.deɪt/',
    partOfSpeech: 'verb',
    definitionVi: 'Cung cấp chỗ ở; đáp ứng và thỏa mãn nhu cầu',
    exampleEn: 'The conference room can easily accommodate up to 100 participants.',
    level: 'B1 • TOEIC 500+',
    isLearned: true,
  },
  {
    id: 'v-3',
    word: 'Comprehensive',
    phonetic: '/ˌkɑːm.prəˈhen.sɪv/',
    partOfSpeech: 'adjective',
    definitionVi: 'Toàn diện, bao quát và sâu rộng',
    exampleEn: 'The workshop provides a comprehensive overview of financial market dynamics.',
    level: 'B2 • TOEIC 750+',
    isLearned: false,
  },
  {
    id: 'v-4',
    word: 'Implement',
    phonetic: '/ˈɪm.plə.ment/',
    partOfSpeech: 'verb',
    definitionVi: 'Triển khai, thi hành một kế hoạch hoặc chính sách',
    exampleEn: 'The board decided to implement new security protocols across all branches.',
    level: 'B2 • TOEIC 600+',
    isLearned: false,
  },
];

export const StudentVocabularyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [words, setWords] = useState(mockVocabList);

  const filtered = words.filter(
    (w) =>
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.definitionVi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const playAudio = (word: string) => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Kho từ vựng & Flashcard thông minh</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gồm các bộ từ vựng trọng tâm TOEIC & VSTEP, hỗ trợ phát âm chuẩn và thuật toán lặp lại ngắt quãng.
          </p>
        </div>

        <Link
          to="/app/review"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Mở phòng ôn tập Flashcard (SRS)</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none text-slate-700 bg-transparent placeholder-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
            Xóa
          </button>
        )}
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-extrabold text-slate-900">{item.word}</h3>
                  <button
                    onClick={() => playAudio(item.word)}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 font-mono">{item.phonetic}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {item.level}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <span className="text-xs font-semibold text-slate-400 italic">[{item.partOfSpeech}]</span>
                <p className="text-sm font-bold text-indigo-900">{item.definitionVi}</p>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                &quot;{item.exampleEn}&quot;
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {item.isLearned ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã đưa vào lịch ôn SRS</span>
                </span>
              ) : (
                <span className="text-slate-400 font-medium">Chưa học</span>
              )}

              <button
                onClick={() => {
                  setWords((prev) =>
                    prev.map((w) => (w.id === item.id ? { ...w, isLearned: !w.isLearned } : w))
                  );
                }}
                className="text-indigo-600 hover:underline font-bold"
              >
                {item.isLearned ? 'Bỏ theo dõi' : '+ Thêm vào sổ ôn'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
