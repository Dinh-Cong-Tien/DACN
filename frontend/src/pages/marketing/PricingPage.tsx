import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: 'Free Starter',
      price: '0đ',
      period: 'trọn đời',
      desc: 'Dành cho người mới bắt đầu làm quen với dạng đề và kiểm tra năng lực.',
      features: [
        'Bài test đánh giá năng lực đầu vào',
        'Luyện tập 15 câu/ngày miễn phí',
        'Xem giải thích đáp án cơ bản',
        '2 Đề thi thử ETS cơ bản',
      ],
      popular: false,
      cta: 'Bắt đầu miễn phí',
      link: '/auth/register',
    },
    {
      name: 'Pro Learner',
      price: billingCycle === 'yearly' ? '89.000đ' : '129.000đ',
      period: '/tháng (thanh toán năm)',
      desc: 'Mở khóa toàn bộ tính năng thích ứng, phân tích lỗi và đề thi chuẩn.',
      features: [
        'Mở khóa 10,000+ câu hỏi luyện tập không giới hạn',
        'Sổ tay ghi nhận lỗi sai thông minh',
        'Thuật toán ôn tập ngắt quãng Spaced Repetition (SM-2)',
        'Thư viện 50+ đề thi ETS & VSTEP cập nhật 2026',
        'Biểu đồ phân tích năng lực chi tiết từng kỹ năng',
      ],
      popular: true,
      cta: 'Dùng thử 7 ngày miễn phí',
      link: '/auth/register',
    },
    {
      name: 'Intensive AI Mentor',
      price: billingCycle === 'yearly' ? '189.000đ' : '249.000đ',
      period: '/tháng (thanh toán năm)',
      desc: 'Dành cho học viên thi VSTEP hoặc cần chấm chữa Writing/Speaking cấp tốc.',
      features: [
        'Toàn bộ quyền lợi gói Pro Learner',
        'Chấm chữa Writing & Speaking AI không giới hạn',
        'Nhận xét từ giáo viên chuyên môn mỗi tuần',
        'Lộ trình cá nhân hóa cam kết tăng điểm theo tuần',
        'Ưu tiên hỗ trợ giải đáp 24/7',
      ],
      popular: false,
      cta: 'Trở thành VIP Mentor',
      link: '/auth/register',
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đầu tư thông minh cho tương lai</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bảng giá gói học OrbiLingo</h1>
          <p className="text-slate-600 text-sm">
            Học thông minh hơn, tiết kiệm đến 80% chi phí so với các trung tâm truyền thống.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-2xl shadow-sm mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thanh toán theo tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Thanh toán theo năm</span>
              <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                Tiết kiệm 30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 transition relative ${
                p.popular
                  ? 'border-indigo-600 shadow-xl shadow-indigo-100 ring-4 ring-indigo-500/10'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md">
                  Gói được chọn nhiều nhất
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{p.price}</span>
                  <span className="text-xs text-slate-500 font-medium">{p.period}</span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to={p.link}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    p.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 hover:shadow-lg'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
