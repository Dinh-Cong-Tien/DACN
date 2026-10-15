import React from 'react';
import { FileText, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface IAdminTestItem {
  id: string;
  title: string;
  examType: string;
  durationMinutes: number;
  totalQuestions: number;
  isPublished: boolean;
  version: number;
}

const mockTests: IAdminTestItem[] = [
  { id: 't-1', title: 'ETS TOEIC 2024 Actual Test 01', examType: 'TOEIC', durationMinutes: 120, totalQuestions: 200, isPublished: true, version: 1 },
  { id: 't-2', title: 'ETS TOEIC 2024 Actual Test 02', examType: 'TOEIC', durationMinutes: 120, totalQuestions: 200, isPublished: true, version: 1 },
  { id: 't-3', title: 'VSTEP B1-B2 Chuẩn Bộ GD&ĐT (Đề 01)', examType: 'VSTEP', durationMinutes: 135, totalQuestions: 75, isPublished: true, version: 2 },
];

export const AdminTestsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Cấu hình đề thi (Test Builder Studio)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Thiết lập cấu trúc đề, phân bổ câu hỏi vào các Section, quy định thời lượng và phiên bản đề (Version).
          </p>
        </div>

        <button className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-900/40 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Tạo đề thi mới</span>
        </button>
      </div>

      <div className="space-y-3">
        {mockTests.map((t) => (
          <div
            key={t.id}
            className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {t.examType}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Phiên bản v{t.version}</span>
              </div>
              <h3 className="text-base font-bold text-white">{t.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span>{t.durationMinutes} phút</span>
                <span>•</span>
                <span>{t.totalQuestions} câu hỏi</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đang phát hành
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition">
                Cấu trúc Section
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
