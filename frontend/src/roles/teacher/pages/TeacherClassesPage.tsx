import React, { useState } from 'react';
import { Users, Plus, BookOpen, Key, Calendar, ArrowRight } from 'lucide-react';

interface IClassItem {
  id: string;
  name: string;
  code: string;
  targetExam: string;
  studentCount: number;
  activeAssignments: number;
  createdAt: string;
}

const mockClasses: IClassItem[] = [
  { id: 'c-1', name: 'TOEIC Mục tiêu 750 (Khóa K28)', code: 'ORBI-750-K28', targetExam: 'TOEIC', studentCount: 34, activeAssignments: 2, createdAt: '15/09/2026' },
  { id: 'c-2', name: 'Luyện thi VSTEP B2 Cấp tốc', code: 'VSTEP-B2-FAST', targetExam: 'VSTEP', studentCount: 28, activeAssignments: 3, createdAt: '01/10/2026' },
  { id: 'c-3', name: 'Nền tảng Ngữ pháp & Từ vựng TOEIC 500', code: 'TOEIC-FND-500', targetExam: 'TOEIC', studentCount: 42, activeAssignments: 1, createdAt: '20/08/2026' },
];

export const TeacherClassesPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Quản lý lớp học (Class Management)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý danh sách học viên, phân quyền bài tập và chia sẻ mã lớp tham gia.
          </p>
        </div>

        <button className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mockClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {cls.targetExam}
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Key className="w-3 h-3 text-slate-400" />
                  {cls.code}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{cls.name}</h3>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                <span>{cls.studentCount} học viên</span>
                <span>•</span>
                <span>{cls.activeAssignments} bài tập đang mở</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Tạo ngày: {cls.createdAt}</span>
              <button className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                <span>Xem danh sách</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
