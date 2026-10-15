import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'OrbiLingo khác gì so với các website luyện thi tiếng Anh thông thường?',
      a: 'Khác biệt lớn nhất của OrbiLingo là vòng học tập khép kín thông minh: Hệ thống không chỉ chấm điểm đúng/sai mà còn tự động phân tích dạng lỗi (Ví dụ: Thì quá khứ, hòa hợp chủ vị, bẫy đồng âm Part 2), lưu vào Sổ tay lỗi cá nhân và lên lịch ôn tập ngắt quãng (Spaced Repetition) để bạn không bao giờ lặp lại lỗi cũ.',
    },
    {
      q: 'Hệ thống tính điểm TOEIC và VSTEP như thế nào?',
      a: 'TOEIC được quy đổi chuẩn hóa theo thuật toán phi tuyến tính của ETS (thang 10 - 990). VSTEP được quy đổi theo trung bình cộng 4 kỹ năng (thang 10, làm tròn 0.5) để xếp vào các bậc B1 (4.0 - 5.5), B2 (6.0 - 8.0) và C1 (8.5 - 10.0) theo đúng thông tư của Bộ Giáo dục và Đào tạo.',
    },
    {
      q: 'Tôi có thể dùng thử trước khi trả phí không?',
      a: 'Có! Bạn hoàn toàn có thể đăng ký tài khoản miễn phí để làm bài kiểm tra trình độ đầu vào (Placement Test), luyện tập 15 câu mỗi ngày và trải nghiệm các đề thi thử mẫu.',
    },
    {
      q: 'Tính năng chấm Speaking và Writing hoạt động như thế nào?',
      a: 'Với các bài tự luận, hệ thống kết hợp trí tuệ nhân tạo (AI) để phân tích ngữ pháp, sự đa dạng của từ vựng và bố cục câu. Ngoài ra, học viên có thể nộp bài trực tiếp để giáo viên chuyên môn chấm chữa và phản hồi chi tiết.',
    },
    {
      q: 'Thuật toán Spaced Repetition (Lặp lại ngắt quãng) hoạt động ra sao?',
      a: 'OrbiLingo áp dụng biến thể của thuật toán SuperMemo SM-2. Dựa trên mức độ ghi nhớ (Quality 0-5) mà bạn tự đánh giá khi ôn thẻ từ vựng hoặc câu sai, hệ thống sẽ tự động tính toán hệ số dễ dàng (Ease Factor) và xác định chính xác ngày ôn tiếp theo (1 ngày, 6 ngày, 14 ngày...).',
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Giải đáp thắc mắc thường gặp</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Câu hỏi thường gặp (FAQ)</h1>
          <p className="text-slate-600 text-sm">
            Mọi điều bạn cần biết về phương pháp học thích ứng và cách OrbiLingo giúp bạn đạt điểm mục tiêu.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-black text-slate-900">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center space-y-3">
          <h3 className="text-base font-black text-slate-900">Vẫn còn thắc mắc chưa được giải đáp?</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Đội ngũ cố vấn học tập của OrbiLingo luôn sẵn sàng hỗ trợ bạn qua kênh trực tuyến 24/7.
          </p>
          <div className="pt-1">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-indigo-700 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Gửi câu hỏi hỗ trợ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
