import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, Users, ArrowRight, CheckCircle2, ShieldCheck, PlayCircle } from 'lucide-react';

export const MockTestsPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'TOEIC' | 'VSTEP'>('ALL');

  const tests = [
    {
      id: 'ets-2024-test-1',
      title: 'ETS TOEIC 2024 Actual Test 01 (Full 200 Questions)',
      type: 'TOEIC',
      duration: 120,
      totalQuestions: 200,
      participants: 4890,
      difficulty: 'Trung bình',
      badge: 'ETS Mới nhất',
    },
    {
      id: 'ets-2024-test-2',
      title: 'ETS TOEIC 2024 Actual Test 02 (Full 200 Questions)',
      type: 'TOEIC',
      duration: 120,
      totalQuestions: 200,
      participants: 3620,
      difficulty: 'Khó',
      badge: 'ETS Mới nhất',
    },
    {
      id: 'vstep-b2-mock-1',
      title: 'Đề thi thử VSTEP B1-B2 Máy tính Quốc gia 01',
      type: 'VSTEP',
      duration: 150,
      totalQuestions: 75,
      participants: 1850,
      difficulty: 'Chuẩn format',
      badge: '4 Kỹ năng',
    },
    {
      id: 'toeic-mini-reading',
      title: 'Mini Test Đọc hiểu Part 5 + Part 6 Cấp tốc',
      type: 'TOEIC',
      duration: 30,
      totalQuestions: 46,
      participants: 8210,
      difficulty: 'Dễ',
      badge: 'Mini Test',
    },
  ];

  const filtered = filter === 'ALL' ? tests : tests.filter((t) => t.type === filter);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Phòng Thi Thử Chuẩn Khảo Thí</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thư viện Đề thi thử Online</h1>
          <p className="text-slate-600 text-sm">
            Giao diện làm bài mô phỏng 100% phần mềm thi thật của IIG và các cụm thi Đại học Quốc gia. Tự động chấm điểm và sinh bảng phân tích lỗi sai chi tiết.
          </p>
        </div>

        {/* Filter tags */}
        <div className="flex justify-center gap-2">
          {['ALL', 'TOEIC', 'VSTEP'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag as any)}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all ${
                filter === tag
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tag === 'ALL' ? 'Tất cả đề thi' : `Đề thi ${tag}`}
            </button>
          ))}
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      test.type === 'TOEIC'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    {test.type}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {test.badge}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug">{test.title}</h3>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    {test.duration} phút
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    {test.totalQuestions} câu hỏi
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    {test.participants.toLocaleString()} lượt thi
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/app/exam/${test.id}`}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Bắt đầu thi thử ngay</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
