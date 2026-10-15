import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  FileText,
  Share2,
} from 'lucide-react';

export const StudentExamResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Result Card Hero */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-8 text-white text-center shadow-xl space-y-6 relative overflow-hidden">
        <div className="space-y-1">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
            Báo cáo kết quả thi thử chính thức
          </span>
          <h1 className="text-2xl font-black">ETS TOEIC 2024 Actual Test 01</h1>
        </div>

        {/* Big Score Gauge */}
        <div className="w-40 h-40 mx-auto rounded-full bg-white/10 backdrop-blur-md border-4 border-amber-400/40 flex flex-col items-center justify-center shadow-inner">
          <span className="text-xs font-bold text-amber-300">TỔNG ĐIỂM</span>
          <div className="text-4xl font-black text-white tracking-tight">685</div>
          <span className="text-[11px] text-slate-300">Thang điểm 990</span>
        </div>

        {/* 2 Skills Sub-scores */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <span className="text-xs text-indigo-200 block">Listening (Nghe hiểu)</span>
            <div className="text-2xl font-extrabold text-white mt-1">365</div>
            <span className="text-[11px] text-emerald-300">73 / 100 câu đúng</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <span className="text-xs text-indigo-200 block">Reading (Đọc hiểu)</span>
            <div className="text-2xl font-extrabold text-white mt-1">320</div>
            <span className="text-[11px] text-amber-300">64 / 100 câu đúng</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/app/mistakes"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Xem 63 câu làm sai trong Sổ lỗi</span>
          </Link>

          <Link
            to={`/app/mock-tests/${id || 'test-1'}/analysis`}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Xem lại chi tiết từng câu làm</span>
          </Link>
        </div>
      </div>

      {/* Part Breakdown & Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timing Stats */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Thời gian & Tốc độ làm bài</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Thời gian quy định:</span>
              <strong className="text-slate-800">120 phút</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Thời gian thực tế bạn làm:</span>
              <strong className="text-emerald-600">108 phút 35 giây</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Tốc độ trung bình / câu:</span>
              <strong className="text-slate-800">32.5 giây</strong>
            </div>
          </div>
        </div>

        {/* Section Accuracy */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Tỷ lệ chính xác từng phần</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Part 1-2: Photographs & Q-R</span>
                <span className="text-emerald-600 font-bold">87%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Part 3-4: Conversations & Talks</span>
                <span className="text-indigo-600 font-bold">69%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '69%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Part 5-6: Incomplete Sentences & Texts</span>
                <span className="text-rose-600 font-bold">48% (Yếu nhất)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Part 7: Reading Comprehension</span>
                <span className="text-amber-600 font-bold">62%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
