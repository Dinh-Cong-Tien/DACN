import React from 'react';
import { FileCheck, Plus, Clock, Users, CheckCircle2 } from 'lucide-react';

interface IAssignmentItem {
  id: string;
  title: string;
  className: string;
  skillType: string;
  dueDate: string;
  submittedCount: number;
  totalStudents: number;
}

const mockAssignments: IAssignmentItem[] = [
  { id: 'a-1', title: 'Writing Task 2: Online Learning vs Traditional Classroom', className: 'TOEIC Mục tiêu 750 (Khóa K28)', skillType: 'WRITING', dueDate: '20/10/2026', submittedCount: 28, totalStudents: 34 },
  { id: 'a-2', title: 'Speaking Part 2: Campus Facilities Upgrade Discussion', className: 'VSTEP B2 Cấp tốc', skillType: 'SPEAKING', dueDate: '22/10/2026', submittedCount: 15, totalStudents: 28 },
  { id: 'a-3', title: 'Luyện 50 câu Part 5: Chuyên đề Thì & Giới từ', className: 'Nền tảng Ngữ pháp TOEIC 500', skillType: 'READING', dueDate: '25/10/2026', submittedCount: 40, totalStudents: 42 },
];

export const TeacherAssignmentsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            <span>Bài tập được giao (Assignments)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Giao bài tập kỹ năng hoặc bộ đề trắc nghiệm cho cả lớp và theo dõi tiến độ nộp bài.
          </p>
        </div>

        <button className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      <div className="space-y-4">
        {mockAssignments.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  {a.skillType}
                </span>
                <span className="text-xs text-slate-400">{a.className}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Hạn nộp: {a.dueDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block">Tiến độ nộp</span>
                <span className="text-sm font-black text-emerald-600">
                  {a.submittedCount} / {a.totalStudents} học viên
                </span>
              </div>

              <button className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                Xem bài nộp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
