import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Award, ShieldCheck } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Báo cáo Tổng thể Hệ thống (Platform Analytics)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Theo dõi lưu lượng người dùng, tần suất luyện thi, số lượng câu sai được khắc phục và tỷ lệ churn.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400">Người dùng hoạt động (MAU)</span>
          <div className="text-3xl font-black text-white font-mono">14,280</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% so với tháng trước</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400">Lượt nộp bài thi thử</span>
          <div className="text-3xl font-black text-indigo-400 font-mono">38,910</div>
          <span className="text-xs text-slate-500 font-medium">Trung bình 3.2 bài/học viên</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400">Câu sai được chuyển hóa SM-2</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">182,400</div>
          <span className="text-xs text-slate-500 font-medium">Đã thuộc sau 3 lần ôn: 78.2%</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400">Doanh thu gói Pro (MRR)</span>
          <div className="text-3xl font-black text-amber-400 font-mono">148.5M ₫</div>
          <span className="text-xs text-emerald-400 font-bold">+12% so với chu kỳ trước</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-200">Phân bố mục tiêu học viên theo chứng chỉ</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>TOEIC 650+ (Doanh nghiệp & Tốt nghiệp)</span>
                <span className="font-mono text-indigo-400">54%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '54%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>VSTEP B1 - B2 (Thạc sĩ & Chuẩn đầu ra ĐH)</span>
                <span className="font-mono text-violet-400">32%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>TOEIC 850+ & VSTEP C1 (Chuyên gia & Sư phạm)</span>
                <span className="font-mono text-emerald-400">14%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '14%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-200">Hiệu năng máy chủ & Độ trễ API</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400">API Response Time (p95)</span>
              <span className="font-mono font-bold text-emerald-400">38ms</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400">PostgreSQL Connection Pool</span>
              <span className="font-mono font-bold text-indigo-400">18 / 50 Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400">Redis Cache Hit Ratio</span>
              <span className="font-mono font-bold text-emerald-400">96.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
