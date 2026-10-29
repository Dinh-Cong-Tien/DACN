import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CheckCircle2, Quote } from 'lucide-react';
import { Logo } from '@/shared/components/ui';
import { FloatingBlobs, PageTransition } from '@/shared/components/motion';
import { TESTIMONIALS } from '@/shared/mocks';

const POINTS = ['Chẩn đoán năng lực 15 phút, nhận lộ trình ngay', 'Thi thử chuẩn ETS & Bộ GD&ĐT, audio một lần', 'Sổ tay lỗi sai + ôn tập ngắt quãng SM-2', 'Miễn phí mãi mãi với tính năng cốt lõi'];

export const AuthLayout: React.FC = () => {
  const t = TESTIMONIALS[0];
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-slate-50">
      <aside className="hidden lg:flex relative overflow-hidden bg-slate-950 text-white flex-col justify-between p-12">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.07]" />
        <FloatingBlobs className="opacity-60" />
        <div className="relative">
          <Logo size="lg" dark tagline="Học thông minh · Đúng mục tiêu" />
        </div>
        <div className="relative space-y-8 max-w-md">
          <div className="space-y-3">
            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Bứt phá điểm số <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">TOEIC & VSTEP</span> theo cách của bạn.
            </h2>
            <p className="text-slate-400 leading-relaxed">Mỗi câu sai được phân tích, mỗi phút học được tối ưu. Lộ trình cá nhân hoá cập nhật theo từng bài làm.</p>
          </div>
          <ul className="space-y-3">
            {POINTS.map((p, i) => (
              <li key={p} className="flex items-center gap-3 text-sm text-slate-200 animate-slide-in-left" style={{ animationDelay: `${200 + i * 100}ms` }}>
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="glass-dark rounded-3xl p-6 animate-fade-up" style={{ animationDelay: '600ms' }}>
            <Quote className="w-6 h-6 text-indigo-400 mb-3" />
            <p className="text-sm leading-relaxed text-slate-200">"{t.quote}"</p>
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">{t.score}</span>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-slate-500">© 2026 OrbiLingo · Đồ án chuyên ngành</p>
      </aside>

      <main className="relative flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="lg:hidden mb-8">
          <Logo size="md" />
        </div>
        <div className="w-full max-w-md">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
        <p className="mt-8 text-xs text-slate-400">
          <Link to="/" className="hover:text-indigo-600">
            ← Về trang chủ
          </Link>
        </p>
      </main>
    </div>
  );
};
