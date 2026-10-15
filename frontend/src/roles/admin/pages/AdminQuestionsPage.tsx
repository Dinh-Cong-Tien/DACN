import React, { useState } from 'react';
import { FileQuestion, Plus, Search, Tag, Filter, CheckCircle2 } from 'lucide-react';

interface IAdminQuestion {
  id: string;
  stem: string;
  examType: string;
  partOrSkill: string;
  difficulty: number;
  correctAnswer: string;
  tags: string[];
}

const mockQuestions: IAdminQuestion[] = [
  { id: 'q-1', stem: 'Ms. Jenkins was promoted because she has ______ completed projects ahead of schedule.', examType: 'TOEIC', partOrSkill: 'PART_5', difficulty: 2, correctAnswer: 'A', tags: ['adverb', 'part_5'] },
  { id: 'q-2', stem: 'What are employees requested to do by Friday afternoon?', examType: 'TOEIC', partOrSkill: 'PART_7', difficulty: 2, correctAnswer: 'A', tags: ['reading_detail', 'part_7'] },
  { id: 'q-3', stem: 'Where did you leave the meeting agenda documents?', examType: 'TOEIC', partOrSkill: 'PART_2', difficulty: 1, correctAnswer: 'B', tags: ['listening_trap', 'part_2'] },
];

export const AdminQuestionsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <FileQuestion className="w-6 h-6 text-indigo-400" />
            <span>Ngân hàng câu hỏi Studio (Question Bank CMS)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tạo mới câu hỏi đơn, câu hỏi chùm liên kết đoạn văn (Passage), audio nghe, đáp án và nhãn phân loại lỗi.
          </p>
        </div>

        <button className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-900/40 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Thêm câu hỏi mới</span>
        </button>
      </div>

      <div className="space-y-3">
        {mockQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {q.examType}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {q.partOrSkill}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                  Độ khó: {q.difficulty}★
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{q.stem}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Đáp án chuẩn: <strong className="text-emerald-400 font-bold">{q.correctAnswer}</strong></span>
                <span>•</span>
                <span>Tags: {q.tags.join(', ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition">
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
