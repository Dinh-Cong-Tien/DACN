import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Target,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Lộ trình cá nhân hóa được cập nhật hôm nay</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Chào mừng trở lại, Học viên!</h1>
          <p className="text-indigo-100 text-sm max-w-xl leading-relaxed">
            Bạn đang có <strong className="text-white font-bold underline">12 mục kiến thức</strong> đến hạn ôn tập ngắt quãng (SRS). Hãy hoàn thành để duy trì chuỗi ghi nhớ dài hạn!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10">
          <Link
            to="/app/review"
            className="px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Ôn tập ngay (12 mục)
          </Link>
          <Link
            to="/app/mock-tests"
            className="px-5 py-3 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Làm đề thi thử
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Chuỗi học tập</span>
            <div className="text-2xl font-black text-slate-800">5 Ngày</div>
            <span className="text-[11px] font-medium text-emerald-600">Đang giữ phong độ tốt!</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        {/* Target */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Mục tiêu hiện tại</span>
            <div className="text-2xl font-black text-indigo-600">TOEIC 750</div>
            <span className="text-[11px] font-medium text-slate-500">Đầu vào: 450 • Còn 60 ngày</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Learning Path Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Tiến độ Lộ trình</span>
            <div className="text-2xl font-black text-slate-800">42%</div>
            <span className="text-[11px] font-medium text-indigo-600">Giai đoạn 2: Bứt phá kỹ năng</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Mistakes in Notebook */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Sổ tay lỗi sai</span>
            <div className="text-2xl font-black text-rose-600">8 Lỗi</div>
            <span className="text-[11px] font-medium text-rose-600">Cần khắc phục Part 5</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Lộ trình hôm nay & Phân tích điểm yếu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bài học tiếp theo của bạn</h3>
                <p className="text-xs text-slate-400">Theo phân bổ lộ trình cá nhân hóa</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                TOEIC Part 5
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Chinh phục thì Hiện tại hoàn thành & Quá khứ đơn
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Thời lượng: 20 phút • 15 câu luyện tập</span>
                  </p>
                </div>
              </div>

              <Link
                to="/app/practice"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <span>Học ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Weak Skills Radar / Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Phân tích năng lực theo kỹ năng</h3>
                <p className="text-xs text-slate-400">Dữ liệu từ 3 bài thi thử và 120 câu luyện tập gần nhất</p>
              </div>
              <Link to="/app/progress" className="text-xs font-semibold text-indigo-600 hover:underline">
                Xem chi tiết →
              </Link>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Part 1: Photographs (Listening)</span>
                  <span className="text-emerald-600 font-bold">85% (Rất tốt)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Part 2: Question-Response (Listening)</span>
                  <span className="text-indigo-600 font-bold">72% (Khá)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Part 5: Incomplete Sentences (Grammar & Vocab)</span>
                  <span className="text-rose-600 font-bold">45% (Điểm yếu cần ưu tiên)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Part 7: Reading Comprehension</span>
                  <span className="text-amber-600 font-bold">58% (Cần tăng tốc độ đọc)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '58%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Lịch ôn tập & Lịch sử thi thử */}
        <div className="space-y-6">
          {/* Due Review Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Mục ôn tập hôm nay</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold">
                12 Mục
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-slate-800">Từ vựng Business: negotiate</strong>
                  <span className="text-slate-400">Đã ôn 2 lần • Cần củng cố</span>
                </div>
                <span className="text-indigo-600 font-bold">Flashcard</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-slate-800">Câu sai Part 5: Mệnh đề quan hệ</strong>
                  <span className="text-slate-400">Làm sai hôm qua</span>
                </div>
                <span className="text-rose-600 font-bold">Sổ lỗi</span>
              </div>
            </div>
            <Link
              to="/app/review"
              className="block w-full text-center py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition"
            >
              Mở phòng ôn tập Spaced Repetition →
            </Link>
          </div>

          {/* Quick Mock Tests history */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Kết quả thi thử gần nhất</h3>
              <Link to="/app/mock-tests" className="text-xs text-indigo-600 font-semibold hover:underline">
                Tất cả đề
              </Link>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">ETS 2024 Practice Test 01</h4>
                  <span className="text-[10px] text-slate-400">Hoàn thành: 2 ngày trước</span>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-indigo-600">620 / 990</div>
                  <span className="text-[10px] text-slate-400">LC: 340 • RC: 280</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
