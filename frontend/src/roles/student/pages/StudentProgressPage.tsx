import React from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Target,
} from 'lucide-react';

export const StudentProgressPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <span>Báo cáo tiến độ & Phân tích năng lực (Analytics)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Đo lường sự tiến bộ qua từng bài thi thử, nhận diện chính xác các vùng kiến thức đang làm tụt điểm của bạn.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Điểm cao nhất</span>
            <div className="text-3xl font-black text-indigo-600">685</div>
            <span className="text-[11px] font-bold text-emerald-600">+135 so với đầu vào</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Thời gian đã học</span>
            <div className="text-3xl font-black text-slate-800">28.5h</div>
            <span className="text-[11px] font-medium text-slate-500">Trung bình 45p/ngày</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Độ chính xác trung bình</span>
            <div className="text-3xl font-black text-slate-800">68%</div>
            <span className="text-[11px] font-medium text-slate-500">Trên 450 câu đã làm</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Khoảng cách mục tiêu</span>
            <div className="text-3xl font-black text-amber-600">-65đ</div>
            <span className="text-[11px] font-medium text-amber-600">Mục tiêu 750 điểm</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress Over Time & Weak Areas Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Score History Graph Visualization */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Lịch sử điểm thi thử theo thời gian</h3>
              <p className="text-xs text-slate-400">Theo dõi sự tăng trưởng qua 4 bài thi gần nhất</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Xu hướng tăng trưởng (+22%)
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-6 pt-6 border-b border-slate-100 px-4">
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-black text-slate-600">450</span>
              <div className="w-full bg-indigo-100 rounded-t-xl transition-all duration-500 hover:bg-indigo-200" style={{ height: '45%' }} />
              <span className="text-[11px] text-slate-400 font-medium">Placement</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-black text-slate-600">540</span>
              <div className="w-full bg-indigo-300 rounded-t-xl transition-all duration-500 hover:bg-indigo-400" style={{ height: '54%' }} />
              <span className="text-[11px] text-slate-400 font-medium">Test 01</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-black text-slate-600">620</span>
              <div className="w-full bg-indigo-500 rounded-t-xl transition-all duration-500 hover:bg-indigo-600" style={{ height: '62%' }} />
              <span className="text-[11px] text-slate-400 font-medium">Test 02</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-black text-indigo-600">685</span>
              <div className="w-full bg-indigo-600 rounded-t-xl transition-all duration-500 hover:bg-indigo-700 shadow-md shadow-indigo-200" style={{ height: '68%' }} />
              <span className="text-[11px] text-indigo-700 font-bold">Gần nhất</span>
            </div>
          </div>

          <div className="flex items-center justify-around text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
              <span>Điểm tổng (Listening + Reading)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">★ Target: 750</span>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Diagnostic Report */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chẩn đoán điểm yếu (Diagnosis)</h3>
            <p className="text-xs text-slate-400">Do hệ thống Error Intelligence tự động tổng hợp</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/70 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>TOEIC Part 5: Từ loại & Liên từ</span>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                Bạn sai 7 câu về phân biệt Trạng từ/Tính từ và cấu trúc liên từ phụ thuộc.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Tốc độ đọc Part 7 còn chậm</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Mất trung bình 2.5 phút/câu ở các đoạn văn đôi (Double Passage). Cần rèn luyện Skimming.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/70 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Kỹ năng Listening Part 1 & 2 rất vững</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Tỷ lệ chính xác đạt 88%, phản xạ nghe câu hỏi ngắn rất tốt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
