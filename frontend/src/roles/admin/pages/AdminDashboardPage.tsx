import React from 'react';
import {
  Users,
  FileQuestion,
  FileText,
  Activity,
  ShieldCheck,
  Server,
  Database,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Quản trị Hệ thống OrbiLingo (Admin Console)</h1>
          <p className="text-sm text-slate-400 mt-1">
            Tổng quan người dùng, ngân hàng câu hỏi, đề thi, khóa học và giám sát tình trạng hệ thống.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          SYSTEM HEALTH: 100%
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Tổng người dùng</span>
            <div className="text-2xl font-black text-white">1,420</div>
            <span className="text-[11px] font-medium text-emerald-400">+12% tháng này</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Ngân hàng câu hỏi</span>
            <div className="text-2xl font-black text-white">3,850</div>
            <span className="text-[11px] font-medium text-slate-400">TOEIC & VSTEP</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileQuestion className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Đề thi đang phát hành</span>
            <div className="text-2xl font-black text-white">24 Đề</div>
            <span className="text-[11px] font-medium text-slate-400">Active Test Versions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Lượt thi thử (Attempts)</span>
            <div className="text-2xl font-black text-emerald-400">8,910</div>
            <span className="text-[11px] font-medium text-slate-400">Tự động chấm điểm</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* System Audit & Recent Activities */}
      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white">Nhật ký hoạt động hệ thống gần nhất (Audit Logs)</h3>
        <div className="divide-y divide-slate-800/80 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">CREATE_QUESTION</span>
              <span className="text-slate-300">Thêm mới câu hỏi chùm Part 7 (Passage ID: ps-901)</span>
            </div>
            <span className="text-slate-500">10 phút trước • Admin</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">PUBLISH_TEST</span>
              <span className="text-slate-300">Xuất bản đề thi ETS TOEIC 2024 Actual Test 02</span>
            </div>
            <span className="text-slate-500">1 giờ trước • Admin</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">SRS_TRIGGER</span>
              <span className="text-slate-300">Tính toán 124 mục ôn tập đến hạn cho học viên</span>
            </div>
            <span className="text-slate-500">Hôm nay 00:00 • Cron Job</span>
          </div>
        </div>
      </div>
    </div>
  );
};
