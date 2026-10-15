import React from 'react';
import { BookOpen, Users, Clock, Award, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherCoursesPage: React.FC = () => {
  const assignedCourses = [
    {
      id: 'CRS-TOEIC-B2',
      title: 'Khóa TOEIC Cấp tốc 650+ (K24)',
      studentsCount: 32,
      activeAssignments: 4,
      pendingGrading: 6,
      progress: 68,
      nextSession: '19:30 Tối nay',
    },
    {
      id: 'CRS-VSTEP-B1',
      title: 'Lớp VSTEP B1 Chuẩn đầu ra Đại học',
      studentsCount: 28,
      activeAssignments: 2,
      pendingGrading: 3,
      progress: 45,
      nextSession: '08:00 Sáng mai',
    },
    {
      id: 'CRS-TOEIC-FND',
      title: 'Khóa Nền tảng Ngữ pháp & Luyện nghe',
      studentsCount: 24,
      activeAssignments: 1,
      pendingGrading: 0,
      progress: 82,
      nextSession: '18:00 Thứ 6',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>Khóa học phụ trách (My Teaching Courses)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý tiến độ giảng dạy, giao bài tập tự luận và theo dõi mức độ tiếp thu của học viên.
          </p>
        </div>

        <Link
          to="/teacher/assignments"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-md shadow-emerald-200 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Giao bài tập mới</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assignedCourses.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono">
                  {c.id}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Buổi tới: <strong className="text-slate-700">{c.nextSession}</strong>
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 leading-snug">{c.title}</h3>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Tiến độ giáo trình</span>
                  <span className="font-bold text-emerald-600">{c.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between pt-2">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-4 h-4 text-emerald-600" /> Sĩ số lớp:
                  </span>
                  <span className="font-bold text-slate-900">{c.studentsCount} học viên</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Bài tập đang giao:</span>
                  <span className="font-bold text-slate-900">{c.activeAssignments} bài</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Bài chờ chấm:</span>
                  <span className={`font-black ${c.pendingGrading > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {c.pendingGrading} bài
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/teacher/grading"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition"
              >
                <span>Vào chấm bài lớp này</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
