import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Target,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Award,
  CheckCircle2,
  FileText,
  BarChart2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Nền tảng Luyện thi thích ứng theo năng lực</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Học thông minh. Luyện đúng mục tiêu.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent block mt-2">
              Bứt phá TOEIC & VSTEP
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Không còn học vẹt hay làm đề vô định. OrbiLingo tự động phân tích câu sai, chỉ ra lỗ hổng kiến thức và lên lịch ôn tập ngắt quãng (SRS) giúp bạn đạt mục tiêu điểm số nhanh nhất.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/onboarding/goal"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Làm bài Đánh giá năng lực miễn phí</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/mock-tests"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-base shadow-sm transition-all"
            >
              Xem kho đề thi thử
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Step Closed Learning Loop Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Mô hình sư phạm chuẩn
          </span>
          <h2 className="text-3xl font-black text-slate-900">Vòng lặp học tập cá nhân hóa 5 bước</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Mỗi thao tác làm bài của bạn đều được kết nối bằng dữ liệu thực, tạo thành quy trình cải thiện điểm số khép kín.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">Đánh giá đầu vào</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Xác định chính xác trình độ ban đầu, kỹ năng mạnh và lỗ hổng kiến thức.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 font-black flex items-center justify-center text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">Tạo lộ trình thích ứng</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tự động phân bổ bài học và thời lượng ôn luyện theo ngày thi dự kiến.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-black flex items-center justify-center text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base">Luyện tập & Thi thử</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trải nghiệm phòng thi thực tế với bộ đếm giờ chuẩn và giao diện tập trung.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 font-black flex items-center justify-center text-sm">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base">Phân tích lỗi sâu</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Phân loại rõ: Lỗi ngữ pháp, thiếu từ vựng, hay bẫy nghe lừa để giải thích chi tiết.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-sm">
              05
            </div>
            <h3 className="font-bold text-slate-900 text-base">Ôn tập ngắt quãng (SRS)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhắc lại câu sai vào đúng "thời điểm vàng" để không bao giờ lặp lại lỗi cũ.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
