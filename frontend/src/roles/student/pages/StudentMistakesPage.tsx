import React, { useState } from 'react';
import {
  AlertTriangle,
  Filter,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Tag,
} from 'lucide-react';

interface IMistakeDisplay {
  id: string;
  stem: string;
  userWrongAnswer: string;
  correctAnswer: string;
  partOrSkill: string;
  primaryCause: string;
  causeLabel: string;
  explanation: string;
  tags: string[];
  mistakeCount: number;
  isResolved: boolean;
}

const mockMistakes: IMistakeDisplay[] = [
  {
    id: 'm-1',
    stem: 'The new financial policy has ______ affected small businesses across the region.',
    userWrongAnswer: 'adversity',
    correctAnswer: 'adversely',
    partOrSkill: 'TOEIC Part 5',
    primaryCause: 'GRAMMAR_MISUNDERSTANDING',
    causeLabel: 'Ngữ pháp: Từ loại (Adverb bổ nghĩa cho Verb)',
    explanation:
      'Chỗ trống đứng giữa trợ động từ "has" và quá khứ phân từ "affected", do đó cần một trạng từ (Adverb) có đuôi -ly để bổ nghĩa cho động từ "affected". "Adversity" là danh từ (nghịch cảnh).',
    tags: ['adverb', 'part_of_speech', 'part_5'],
    mistakeCount: 2,
    isResolved: false,
  },
  {
    id: 'm-2',
    stem: 'Customers are requested to ______ their reservation at least 24 hours in advance.',
    userWrongAnswer: 'conform',
    correctAnswer: 'confirm',
    partOrSkill: 'TOEIC Part 5',
    primaryCause: 'VOCABULARY_DEFICIT',
    causeLabel: 'Từ vựng: Từ đồng âm / Dễ gây nhầm lẫn',
    explanation:
      'Ngữ cảnh yêu cầu từ mang nghĩa "xác nhận đặt chỗ" -> "confirm". "Conform" mang nghĩa tuân thủ (thường đi với conform to).',
    tags: ['confusing_words', 'business_vocab'],
    mistakeCount: 1,
    isResolved: false,
  },
  {
    id: 'm-3',
    stem: 'Where did you leave the meeting agenda documents?',
    userWrongAnswer: 'Yes, I attended it yesterday.',
    correctAnswer: 'On the director’s desk.',
    partOrSkill: 'TOEIC Part 2',
    primaryCause: 'LISTENING_MISHEARD',
    causeLabel: 'Nghe: Bẫy câu hỏi Where (Nhầm sang Yes/No)',
    explanation:
      'Câu hỏi bắt đầu bằng "Where" hỏi về nơi chốn, không bao giờ trả lời bằng Yes/No. Đáp án chuẩn là chỉ địa điểm: On the director’s desk.',
    tags: ['listening_part_2', 'wh_question_trap'],
    mistakeCount: 1,
    isResolved: true,
  },
];

export const StudentMistakesPage: React.FC = () => {
  const [filterCause, setFilterCause] = useState<string>('ALL');
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState(mockMistakes);

  const filtered = mistakes.filter((m) => {
    if (filterCause !== 'ALL' && m.primaryCause !== filterCause) return false;
    if (!showResolved && m.isResolved) return false;
    return true;
  });

  const toggleResolve = (id: string) => {
    setMistakes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isResolved: !item.isResolved } : item))
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Sổ tay phân tích lỗi sai (Error Intelligence)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống tự động gom các câu bạn trả lời sai, phân loại nguyên nhân và đưa vào chu kỳ ôn tập ngắt quãng.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {mistakes.filter((m) => !m.isResolved).length} Lỗi cần sửa
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {mistakes.filter((m) => m.isResolved).length} Đã khắc phục
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Phân loại lỗi:</span>
          <select
            value={filterCause}
            onChange={(e) => setFilterCause(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả nguyên nhân</option>
            <option value="GRAMMAR_MISUNDERSTANDING">Ngữ pháp / Cấu trúc</option>
            <option value="VOCABULARY_DEFICIT">Thiếu từ vựng / Bẫy từ</option>
            <option value="LISTENING_MISHEARD">Nghe nhầm / Bẫy âm thanh</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span>Hiện cả những câu đã khắc phục</span>
        </label>
      </div>

      {/* Mistake Items List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
              item.isResolved
                ? 'border-emerald-200 bg-emerald-50/20 opacity-75'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.partOrSkill}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {item.causeLabel}
                </span>
                {item.mistakeCount > 1 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    Sai {item.mistakeCount} lần
                  </span>
                )}
              </div>

              <button
                onClick={() => toggleResolve(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                  item.isResolved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{item.isResolved ? 'Đã khắc phục' : 'Đánh dấu đã hiểu'}</span>
              </button>
            </div>

            {/* Question Stem */}
            <h3 className="text-base font-semibold text-slate-900 mb-3">{item.stem}</h3>

            {/* Answers Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-xs">
                <span className="font-bold text-rose-800 block mb-0.5">Đáp án bạn đã chọn (Sai):</span>
                <span className="text-rose-950 font-semibold">{item.userWrongAnswer}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs">
                <span className="font-bold text-emerald-800 block mb-0.5">Đáp án chính xác:</span>
                <span className="text-emerald-950 font-semibold">{item.correctAnswer}</span>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700">
              <strong className="text-slate-900 block mb-1">💡 Lời giải chi tiết:</strong>
              <p>{item.explanation}</p>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {item.tags.map((tag) => (
                <span key={tag} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">Tuyệt vời! Không có lỗi nào thỏa mãn bộ lọc.</h3>
            <p className="text-xs">Bạn đã khắc phục tốt các lỗi sai được hệ thống ghi nhận.</p>
          </div>
        )}
      </div>
    </div>
  );
};
