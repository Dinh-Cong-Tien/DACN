import React from 'react';
import {
  Users,
  CheckSquare,
  FileCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Bảng điều khiển Giảng viên (Teacher Dashboard)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi tiến độ học tập các lớp, quản lý bài tập và chấm bài tự luận Writing & Speaking theo Rubric.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Lớp phụ trách</span>
            <div className="text-2xl font-black text-slate-800">4 Lớp</div>
            <span className="text-[11px] font-medium text-slate-500">128 Học viên</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Bài nộp chờ chấm</span>
            <div className="text-2xl font-black text-amber-600">9 Bài</div>
            <span className="text-[11px] font-medium text-amber-600">Writing Task 2 & Audio</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Bài tập đang giao</span>
            <div className="text-2xl font-black text-slate-800">6 Bài</div>
            <span className="text-[11px] font-medium text-slate-500">Hạn nộp tuần này</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Tỷ lệ nộp đúng hạn</span>
            <div className="text-2xl font-black text-emerald-600">88%</div>
            <span className="text-[11px] font-medium text-emerald-600">+5% so với tuần trước</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grading Queue Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Danh sách bài nộp đang chờ chấm (Grading Queue)</h3>
            <p className="text-xs text-slate-400">Ưu tiên chấm các bài nộp sớm hoặc sắp đến hạn phản hồi</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold">
            9 Chờ duyệt
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Học viên</th>
                <th className="py-3 px-4">Lớp học</th>
                <th className="py-3 px-4">Kỹ năng / Bài tập</th>
                <th className="py-3 px-4">Thời gian nộp</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-bold text-slate-800">Nguyễn Văn An</td>
                <td className="py-3.5 px-4 text-slate-600">TOEIC Mục tiêu 750 (K28)</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                    Writing Task 1
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">2 giờ trước</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">
                    Mở Rubric Chấm
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-bold text-slate-800">Trần Thị Bích</td>
                <td className="py-3.5 px-4 text-slate-600">VSTEP B2 Cấp Tốc</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">
                    Speaking Part 2 (Audio)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">5 giờ trước</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">
                    Mở Rubric Chấm
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
