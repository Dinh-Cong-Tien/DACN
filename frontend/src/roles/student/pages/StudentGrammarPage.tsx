import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface IGrammarTopic {
  id: string;
  title: string;
  category: string;
  level: string;
  ruleSummary: string;
  correctExample: string;
  incorrectExample: string;
  commonTrap: string;
}

const mockGrammarList: IGrammarTopic[] = [
  {
    id: 'g-1',
    title: 'Phân biệt Quá khứ đơn (Past Simple) & Hiện tại hoàn thành (Present Perfect)',
    category: 'Các thì động từ (Tenses)',
    level: 'A2-B1',
    ruleSummary:
      'Dùng Quá khứ đơn khi có mốc thời gian xác định kết thúc trong quá khứ (yesterday, last month, ago, in 2021). Dùng Hiện tại hoàn thành khi hành động xảy ra không rõ thời điểm hoặc kéo dài từ quá khứ đến hiện tại (since, for, already, yet).',
    correctExample: 'The revenue has increased by 15% since last quarter.',
    incorrectExample: 'The revenue increased by 15% since last quarter.',
    commonTrap: 'Đề thi TOEIC Part 5 thường cho từ "since" hoặc "for" để gài bẫy người học chọn thì quá khứ đơn.',
  },
  {
    id: 'g-2',
    title: 'Trật tự từ loại: Trạng từ bổ nghĩa cho Động từ / Tính từ',
    category: 'Từ loại (Part of Speech)',
    level: 'B1-B2',
    ruleSummary:
      'Trạng từ (Adverb) thường đứng giữa Trợ động từ và Động từ chính (has + adv + V_pp), hoặc đứng sau Ngoại động từ và Tân ngữ để bổ nghĩa cho hành động.',
    correctExample: 'The executive committee has unanimously approved the merger proposal.',
    incorrectExample: 'The executive committee has unanimous approved the merger proposal.',
    commonTrap: 'Chọn nhầm tính từ (unanimous) thay vì trạng từ (unanimously) khi đứng trước phân từ hai.',
  },
  {
    id: 'g-3',
    title: 'Mệnh đề quan hệ rút gọn (Reduced Relative Clauses)',
    category: 'Mệnh đề (Clauses)',
    level: 'B2',
    ruleSummary:
      'Rút gọn thành V-ing nếu chủ động, và rút gọn thành V-ed/P2 nếu mang nghĩa bị động.',
    correctExample: 'Candidates interested in the position should submit their resume.',
    incorrectExample: 'Candidates who interested in the position should submit their resume.',
    commonTrap: 'Nhầm lẫn thể chủ động và bị động khi rút gọn đại từ quan hệ.',
  },
];

export const StudentGrammarPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('g-1');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          <span>Chủ điểm ngữ pháp trọng tâm (Grammar Hub)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hệ thống hóa toàn bộ kiến thức ngữ pháp cốt lõi xuất hiện trong bài thi TOEIC & VSTEP, nhận diện bẫy đề thi.
        </p>
      </div>

      <div className="space-y-4">
        {mockGrammarList.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-6 cursor-pointer flex items-center justify-between hover:bg-slate-50/60 transition select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.level}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/app/practice"
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700" />
                    <span>Luyện 15 câu</span>
                  </Link>

                  <button className="p-1.5 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 animate-fadeIn text-xs leading-relaxed text-slate-700">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                    <strong className="text-indigo-950 font-bold block mb-1">📖 Quy tắc & Cách dùng:</strong>
                    <p>{item.ruleSummary}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Ví dụ đúng chuẩn:</span>
                      </div>
                      <p className="text-emerald-950 font-medium italic">&quot;{item.correctExample}&quot;</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/70">
                      <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-1">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Lỗi sai hay mắc:</span>
                      </div>
                      <p className="text-rose-950 font-medium italic line-through">&quot;{item.incorrectExample}&quot;</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-start gap-2.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold mb-0.5">⚠️ Bẫy đề thi cần lưu ý:</strong>
                      <p>{item.commonTrap}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
