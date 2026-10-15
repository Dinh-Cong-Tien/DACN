import React from 'react';
import { BookOpen, Target, Sparkles, Award, Users, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const values = [
    {
      title: 'Học tập thích ứng (Adaptive Learning)',
      desc: 'Mỗi học viên có xuất phát điểm và tốc độ tiếp thu khác nhau. Chúng tôi không áp dụng giáo trình rập khuôn mà thiết kế lộ trình theo từng lỗ hổng kiến thức.',
    },
    {
      title: 'Dựa trên dữ liệu thực tế (Data-driven)',
      desc: 'Mỗi điểm số, bài làm sai và chuỗi ngày học đều được số hóa để đưa ra gợi ý bài tập chuẩn xác nhất bằng thuật toán Spaced Repetition.',
    },
    {
      title: 'Chuẩn hóa khảo thí (Standardized)',
      desc: 'Ngân hàng câu hỏi và barem chấm điểm bám sát 100% định dạng đề thi thực tế của ETS và Bộ Giáo dục & Đào tạo.',
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Sứ mệnh của OrbiLingo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Tái định nghĩa trải nghiệm luyện thi tiếng Anh TOEIC & VSTEP
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            OrbiLingo ra đời nhằm giải quyết nghịch lý của người học Việt Nam: làm hàng trăm đề thi nhưng điểm số vẫn giậm chân tại chỗ vì lặp lại những lỗi sai cũ. Chúng tôi xây dựng vòng học khép kín từ đánh giá, luyện tập, phân tích lỗi đến ôn ngắt quãng.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-1">
            <div className="text-3xl font-black text-indigo-600 font-mono">15,000+</div>
            <div className="text-xs font-bold text-slate-500">Học viên tin cậy</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-1">
            <div className="text-3xl font-black text-indigo-600 font-mono">10,000+</div>
            <div className="text-xs font-bold text-slate-500">Câu hỏi chuẩn hóa</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-1">
            <div className="text-3xl font-black text-indigo-600 font-mono">94.8%</div>
            <div className="text-xs font-bold text-slate-500">Đạt mục tiêu điểm</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-1">
            <div className="text-3xl font-black text-indigo-600 font-mono">150+</div>
            <div className="text-xs font-bold text-slate-500">Đề thi thử 2026</div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight text-center">
            3 Trụ cột công nghệ cốt lõi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-black text-slate-900">{v.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white text-center space-y-4 shadow-xl shadow-indigo-200">
          <h3 className="text-2xl font-black tracking-tight">Sẵn sàng chinh phục chứng chỉ tiếng Anh của bạn?</h3>
          <p className="text-xs text-indigo-100 max-w-md mx-auto">
            Bắt đầu bài kiểm tra năng lực 10 phút ngay hôm nay để nhận lộ trình học cá nhân hóa hoàn toàn miễn phí.
          </p>
          <div className="pt-2">
            <Link
              to="/auth/register"
              className="px-8 py-3.5 bg-white text-indigo-600 font-bold text-xs rounded-2xl shadow-md hover:bg-indigo-50 transition inline-block"
            >
              Tạo tài khoản và bắt đầu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
