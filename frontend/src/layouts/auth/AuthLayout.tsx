import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CheckCircle2, Quote, Star } from 'lucide-react';
import { Logo, Avatar } from '@/shared/components/ui';
import { PageTransition, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { TESTIMONIALS } from '@/shared/mocks';

const POINTS = ['Chẩn đoán năng lực 15 phút, nhận lộ trình ngay', 'Thi thử chuẩn ETS & Bộ GD&ĐT, audio một lần như thi thật', 'Sổ tay lỗi sai + ôn tập ngắt quãng SM-2', 'Miễn phí mãi mãi với tính năng cốt lõi'];

export const AuthLayout: React.FC = () => {
  const t = TESTIMONIALS[0];
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-cream">
      <aside className="hidden lg:flex relative overflow-hidden bg-indigo-600 text-white flex-col justify-between p-12">
        <div aria-hidden className="absolute inset-0 bg-dots opacity-20" />
        <Doodles tone="light" />
        <div className="relative">
          <Logo size="lg" dark tagline="Học thông minh · Đúng mục tiêu" />
        </div>
        <div className="relative grid grid-cols-[1fr_200px] gap-6 items-end">
          <div className="space-y-6 max-w-md">
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight">
              Mỗi câu sai là một <span className="mark">cơ hội</span> tăng điểm.
            </h2>
            <p className="text-indigo-100 leading-relaxed">Lộ trình cá nhân hoá cập nhật theo từng bài làm. Học 45 phút mỗi ngày, đúng thứ bạn còn yếu.</p>
            <ul className="space-y-2.5">
              {POINTS.map((p, i) => (
                <li key={p} className="flex items-center gap-3 text-sm animate-slide-in-left" style={{ animationDelay: `${200 + i * 100}ms` }}>
                  <span className="w-6 h-6 rounded-lg bg-amber-300 text-slate-900 border-2 border-slate-900 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="photo-frame tilt-2 animate-tilt-in" style={{ animationDelay: '300ms' }}>
            <Img src={PHOTOS.studying} alt="Học viên OrbiLingo" ratio="3/4" fallbackClass="bg-indigo-400" />
          </div>
        </div>
        <div className="relative bg-white text-slate-900 rounded-3xl border-2 border-slate-900 shadow-hard p-6 max-w-lg animate-fade-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-1 mb-2 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <Quote className="w-6 h-6 text-violet-500 mb-2" />
          <p className="text-sm leading-relaxed">"{t.quote}"</p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <Avatar name={t.name} src={t.avatar} size="md" ring />
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
            <span className="sticker tilt-2 !bg-emerald-200">{t.score}</span>
          </div>
        </div>
        <p className="relative text-xs text-indigo-200 mt-6">© 2026 OrbiLingo · Đồ án chuyên ngành</p>
      </aside>

      <main className="relative flex flex-col items-center justify-center p-6 sm:p-10 bg-paper">
        <div className="lg:hidden mb-8">
          <Logo size="md" />
        </div>
        <div className="w-full max-w-md">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
        <p className="mt-8 text-xs text-slate-500">
          <Link to="/" className="hover:text-indigo-700 font-semibold">
            ← Về trang chủ
          </Link>
        </p>
      </main>
    </div>
  );
};
