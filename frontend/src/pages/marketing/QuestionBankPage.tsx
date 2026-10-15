import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Search, Filter, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  const questions = [
    {
      id: 'Q-1049',
      part: 'Part 5',
      skill: 'Grammar',
      tag: 'Tenses',
      content: 'The marketing manager ______ the final draft before sending it to the client tomorrow.',
      level: 'Trung bình',
    },
    {
      id: 'Q-1050',
      part: 'Part 5',
      skill: 'Grammar',
      tag: 'Subject-Verb Agreement',
      content: 'Neither the supervisor nor the technicians ______ able to detect the glitch in the server.',
      level: 'Khó',
    },
    {
      id: 'Q-2011',
      part: 'Part 2',
      skill: 'Listening',
      tag: 'Indirect Response',
      content: 'Where can I find the quarterly sales performance reports?',
      level: 'Dễ',
    },
    {
      id: 'Q-7023',
      part: 'Part 7',
      skill: 'Reading',
      tag: 'Single Passage',
      content: 'Memo regarding company vacation scheduling and approval policies during peak holiday seasons.',
      level: 'Trung bình',
    },
  ];

  const filtered = questions.filter(
    (q) =>
      (selectedTag === 'ALL' || q.tag === selectedTag) &&
      (q.content.toLowerCase().includes(searchTerm.toLowerCase()) || q.part.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Database className="w-3.5 h-3.5" />
            <span>Ngân hàng câu hỏi chuẩn hóa</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thư viện Ngân hàng Câu hỏi</h1>
          <p className="text-slate-600 text-sm">
            Tra cứu hơn 10,000+ câu hỏi có gắn thẻ chủ điểm ngữ pháp, bẫy từ vựng và lời giải thích chi tiết.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung câu hỏi, mã câu hoặc từ khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex gap-2">
            {['ALL', 'Tenses', 'Subject-Verb Agreement', 'Single Passage'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Question items */}
        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {q.part}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {q.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{q.id}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">{q.content}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                  {q.level}
                </span>
                <Link
                  to="/app/practice"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Làm câu này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
