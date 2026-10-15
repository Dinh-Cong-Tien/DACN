import React, { useState } from 'react';
import { BarChart3, Users, AlertTriangle, TrendingUp, Award, Download, Filter, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const TeacherAnalyticsPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('TOEIC-B2-01');

  const errorClusters = [
    { rule: 'Hòa hợp Chủ ngữ - Động từ với liên từ tương quan', errorRate: 46, part: 'Part 5', affected: 18 },
    { rule: 'Bẫy câu trả lời gián tiếp & từ đồng âm', errorRate: 38, part: 'Part 2', affected: 15 },
    { rule: 'Mệnh đề quan hệ rút gọn (V-ing / V-ed)', errorRate: 34, part: 'Part 5', affected: 13 },
    { rule: 'Kỹ năng suy luận thông tin đoạn văn kép', errorRate: 29, part: 'Part 7', affected: 11 },
  ];

  const atRiskStudents = [
    { name: 'Nguyễn Văn Hải', lastScore: 480, trend: '-30', missStreak: 4, issue: 'Chưa làm 3 bài tập về nhà' },
    { name: 'Trần Thị Thu Thảo', lastScore: 520, trend: '+10', missStreak: 2, issue: 'Hay sai câu hỏi suy luận Part 7' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Báo cáo & Phân tích lớp học (Class Analytics)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi phân bố phổ điểm, cụm lỗi sai tập trung và các học viên cần hỗ trợ can thiệp sớm.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="TOEIC-B2-01">Lớp TOEIC Cấp tốc 650+ (K24)</option>
            <option value="VSTEP-B1-02">Lớp VSTEP B1 Tốt nghiệp ĐH</option>
            <option value="TOEIC-FND-03">Lớp Nền tảng 450+ Buổi tối</option>
          </select>

          <button
            onClick={() => alert('Đang xuất báo cáo định dạng Excel / PDF...')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5">
          <span className="text-xs font-bold text-slate-400">Điểm thi thử trung bình</span>
          <div className="text-3xl font-black text-emerald-600">654 / 990</div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+38 điểm so với test đầu khóa</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5">
          <span className="text-xs font-bold text-slate-400">Tỷ lệ nộp bài đúng hạn</span>
          <div className="text-3xl font-black text-slate-800">93.8%</div>
          <span className="text-xs text-slate-500 font-semibold">30 / 32 học viên nộp đủ</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5">
          <span className="text-xs font-bold text-slate-400">Số câu sai đã được ôn lại</span>
          <div className="text-3xl font-black text-indigo-600">842 câu</div>
          <span className="text-xs text-indigo-700 font-bold">Spaced Repetition SM-2</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5">
          <span className="text-xs font-bold text-slate-400">Tỷ lệ đạt mục tiêu cam kết</span>
          <div className="text-3xl font-black text-violet-600">87.5%</div>
          <span className="text-xs text-violet-700 font-semibold">Dự kiến đạt target 650+</span>
        </div>
      </div>

      {/* Common Error Clusters */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Phân tích cụm lỗi sai nghiêm trọng nhất của cả lớp
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động gom nhóm từ các bài tập và đề thi thử để giáo viên kịp thời ôn lại trên lớp.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            Cần bổ trợ ngay
          </span>
        </div>

        <div className="space-y-4">
          {errorClusters.map((cluster, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {cluster.part}
                  </span>
                  {cluster.rule}
                </span>
                <span className="font-mono font-bold text-rose-600">
                  {cluster.errorRate}% tỷ lệ sai ({cluster.affected} học viên)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${cluster.errorRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At-Risk Warning Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Danh sách học viên cần chú ý đặc biệt</span>
          </div>
          <span className="text-xs text-slate-400">Tự động gắn cờ theo thuật toán phát hiện nguy cơ</span>
        </div>

        <div className="divide-y divide-slate-100">
          {atRiskStudents.map((st, sIdx) => (
            <div key={sIdx} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                <p className="text-rose-600 font-semibold mt-0.5">{st.issue}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-700">Điểm gần nhất: {st.lastScore}</span>
                <p className="text-[10px] text-slate-400">Xu hướng: {st.trend} điểm</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
