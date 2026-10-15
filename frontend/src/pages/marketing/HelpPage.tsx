import React from 'react';
import { HelpCircle, BookOpen, MessageSquare, Headphones, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HelpPage: React.FC = () => {
  const guideCategories = [
    {
      title: 'Bắt đầu sử dụng',
      icon: BookOpen,
      desc: 'Hướng dẫn tạo tài khoản, làm bài test đầu vào và thiết lập mục tiêu cá nhân.',
      topics: ['Cách làm bài kiểm tra năng lực', 'Thiết lập thời gian học hàng ngày', 'Chuyển đổi giữa lộ trình TOEIC và VSTEP'],
    },
    {
      title: 'Luyện thi & Đề thi thử',
      icon: Headphones,
      desc: 'Kinh nghiệm thao tác làm bài thi thử trên giao diện mô phỏng máy tính.',
      topics: ['Phím tắt chuyển câu trong phòng thi', 'Cách lưu tạm câu trả lời chưa nộp', 'Xem lại giải thích chi tiết sau khi nộp'],
    },
    {
      title: 'Sổ tay lỗi & Ôn tập (SRS)',
      icon: ShieldCheck,
      desc: 'Tận dụng tối đa thuật toán Spaced Repetition để không lặp lại lỗi sai.',
      topics: ['Cách đánh giá điểm ghi nhớ Quality (0-5)', 'Phân loại lỗi theo ngữ pháp và bẫy', 'Ôn tập thẻ từ vựng hàng ngày'],
    },
    {
      title: 'Tài khoản & Thanh toán',
      icon: MessageSquare,
      desc: 'Thông tin bảo mật tài khoản, nâng cấp gói VIP và chính sách hoàn tiền.',
      topics: ['Kích hoạt tài khoản VIP bằng mã', 'Đổi mật khẩu và email đăng ký', 'Chính sách bảo lưu khóa học'],
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Trung tâm trợ giúp học viên</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trung Tâm Hỗ Trợ & Hướng Dẫn</h1>
          <p className="text-slate-600 text-sm">
            Tài liệu hướng dẫn chi tiết về các tính năng trên nền tảng OrbiLingo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guideCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:border-indigo-200 transition space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{cat.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 pt-2 border-t border-slate-100">
                  {cat.topics.map((t, tIdx) => (
                    <div key={tIdx} className="py-2.5 flex items-center justify-between text-xs text-slate-700 hover:text-indigo-600 cursor-pointer group">
                      <span>{t}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-600 transition" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Email Support */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Cần hỗ trợ trực tiếp từ ban quản trị?</h4>
              <p className="text-xs text-slate-500 mt-0.5">Email liên hệ phản hồi trong vòng 2 giờ làm việc: support@orbi-lingo.vn</p>
            </div>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-2xl transition shrink-0"
          >
            Liên hệ ban cố vấn
          </Link>
        </div>
      </div>
    </div>
  );
};
