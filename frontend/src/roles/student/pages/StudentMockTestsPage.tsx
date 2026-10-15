import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Award, CheckCircle2, Play, Filter } from 'lucide-react';

interface IMockTestItem {
  id: string;
  title: string;
  examType: 'TOEIC' | 'VSTEP';
  durationMinutes: number;
  totalQuestions: number;
  attemptsCount: number;
  bestScore?: string;
  isCompleted?: boolean;
}

const mockTestsList: IMockTestItem[] = [
  {
    id: 'toeic-ets-2024-test-1',
    title: 'ETS TOEIC 2024 Actual Test 01 (Full 200 câu LC + RC)',
    examType: 'TOEIC',
    durationMinutes: 120,
    totalQuestions: 200,
    attemptsCount: 2,
    bestScore: '685 / 990',
    isCompleted: true,
  },
  {
    id: 'toeic-ets-2024-test-2',
    title: 'ETS TOEIC 2024 Actual Test 02 (Full 200 câu LC + RC)',
    examType: 'TOEIC',
    durationMinutes: 120,
    totalQuestions: 200,
    attemptsCount: 0,
    isCompleted: false,
  },
  {
    id: 'toeic-mini-test-1',
    title: 'TOEIC Rút Gọn Mini-Test (50 câu • 30 phút)',
    examType: 'TOEIC',
    durationMinutes: 30,
    totalQuestions: 50,
    attemptsCount: 1,
    bestScore: '215 / 250',
    isCompleted: true,
  },
  {
    id: 'vstep-b2-test-1',
    title: 'Đề thi thử VSTEP B1-B2 Chuẩn Bộ GD&ĐT (Đề số 01)',
    examType: 'VSTEP',
    durationMinutes: 135,
    totalQuestions: 75,
    attemptsCount: 0,
    isCompleted: false,
  },
  {
    id: 'vstep-b2-test-2',
    title: 'Đề thi thử VSTEP B1-B2 Chuẩn Bộ GD&ĐT (Đề số 02)',
    examType: 'VSTEP',
    durationMinutes: 135,
    totalQuestions: 75,
    attemptsCount: 1,
    bestScore: 'B2 (6.5/10)',
    isCompleted: true,
  },
];

export const StudentMockTestsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'ALL' | 'TOEIC' | 'VSTEP'>('ALL');

  const filtered = mockTestsList.filter(
    (item) => filterType === 'ALL' || item.examType === filterType
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Kho đề thi thử chuẩn format (Mock Tests)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rèn luyện tâm lý phòng thi với bộ đếm giờ chuẩn, tự động lưu bài làm và chấm điểm quy đổi tức thì.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả đề
          </button>
          <button
            onClick={() => setFilterType('TOEIC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'TOEIC' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            TOEIC
          </button>
          <button
            onClick={() => setFilterType('VSTEP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'VSTEP' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            VSTEP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  test.examType === 'TOEIC' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {test.examType}
                </span>

                {test.bestScore && (
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Cao nhất: {test.bestScore}</span>
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{test.title}</h3>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {test.durationMinutes} phút
                </span>
                <span>•</span>
                <span>{test.totalQuestions} câu hỏi</span>
                <span>•</span>
                <span>{test.attemptsCount} lượt làm</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {test.isCompleted ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã từng làm</span>
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400">Chưa làm đề này</span>
              )}

              <Link
                to={`/app/mock-tests/${test.id}/exam`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{test.isCompleted ? 'Làm lại đề' : 'Bắt đầu làm bài'}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
