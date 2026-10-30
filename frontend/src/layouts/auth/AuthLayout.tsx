import { ThreeBackground } from '@/shared/components/three/ThreeBackground';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Quote, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { Logo, Avatar } from '@/shared/components/ui';
import { PageTransition, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { TESTIMONIALS } from '@/shared/mocks';
import { cn } from '@/shared/utils';

const LOGIN_POINTS = ['Chẩn đoán năng lực 15 phút, nhận lộ trình ngay', 'Thi thử chuẩn ETS & Bộ GD&ĐT, audio một lần như thi thật', 'Sổ tay lỗi sai + ôn tập ngắt quãng SM-2', 'Miễn phí mãi mãi với tính năng cốt lõi'];
const REGISTER_POINTS = ['Tạo tài khoản 30 giây, không cần thẻ', 'Làm bài xếp lớp để biết mình đang ở đâu', 'Nhận lộ trình 3 chặng theo ngày thi', 'Mỗi ngày 45 phút, đúng phần bạn còn yếu'];

/**
 * Layout xác thực kiểu "double slider":
 * panel màu ở bên trái với Đăng nhập, trượt sang phải khi vào Đăng ký; form trượt ngược lại.
 */
export const AuthLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isRegister = pathname.includes('register');
  const t = TESTIMONIALS[isRegister ? 1 : 0];
  const points = isRegister ? REGISTER_POINTS : LOGIN_POINTS;
  const ease = 'transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]';

  return (
    <div className="min-h-screen bg-cream relative lg:overflow-hidden">
      {/* ===== Panel màu (desktop): trượt trái/phải ===== */}
      <aside
        className={cn('hidden lg:flex absolute inset-y-0 left-0 w-1/2 overflow-hidden text-white flex-col justify-between p-12 will-change-transform', ease, isRegister ? 'translate-x-full bg-violet-500' : 'translate-x-0 bg-indigo-600')}
        style={{ transitionProperty: 'transform, background-color' }}
      >
        <div aria-hidden className="absolute inset-0 bg-dots opacity-20" />
        <ThreeBackground variant="globe" dark className="opacity-35" offsetX={0.35} interactive={false} />
        <Doodles tone="light" parallax={false} />

        <div className="relative">
          <Logo size="lg" dark tagline="Học thông minh · Đúng mục tiêu" />
        </div>

        {/* Nội dung đổi theo trang, chạy lại animation khi chuyển */}
        <div key={isRegister ? 'r' : 'l'} className="relative grid grid-cols-[1fr_200px] gap-6 items-end">
          <div className="space-y-6 max-w-md">
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight animate-fade-up">
              {isRegister ? (
                <>
                  Bắt đầu <span className="mark">hành trình</span> của bạn hôm nay.
                </>
              ) : (
                <>
                  Mỗi câu sai là một <span className="mark">cơ hội</span> tăng điểm.
                </>
              )}
            </h2>
            <p className={cn('leading-relaxed animate-fade-up delay-100', isRegister ? 'text-violet-100' : 'text-indigo-100')}>
              {isRegister ? 'Chỉ cần email. Không cần thẻ, không ràng buộc. Hủy bất kỳ lúc nào.' : 'Lộ trình cá nhân hoá cập nhật theo từng bài làm. Học 45 phút mỗi ngày, đúng thứ bạn còn yếu.'}
            </p>
            <ul className="space-y-2.5">
              {points.map((p, i) => (
                <li key={p} className="flex items-center gap-3 text-sm animate-slide-in-left" style={{ animationDelay: `${250 + i * 100}ms` }}>
                  <span className="w-6 h-6 rounded-lg bg-amber-300 text-slate-900 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className={cn('photo-frame animate-tilt-in', isRegister ? 'tilt-1' : 'tilt-2')} style={{ animationDelay: '300ms' }}>
            <Img src={isRegister ? PHOTOS.discussion : PHOTOS.studying} alt="Học viên OrbiLingo" ratio="3/4" fallbackClass={isRegister ? 'bg-violet-400' : 'bg-indigo-400'} />
          </div>
        </div>

        <div key={isRegister ? 'rt' : 'lt'} className="relative space-y-5">
          <div className="bg-white text-slate-900 rounded-3xl border-2 border-slate-900 shadow-hard p-6 max-w-lg animate-fade-up" style={{ animationDelay: '550ms' }}>
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

          {/* Nút chuyển đổi ngay trên panel */}
          <div className="flex items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '700ms' }}>
            <p className="text-sm text-white/80">{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</p>
            <button
              onClick={() => navigate(isRegister ? '/auth/login' : '/auth/register')}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border-2 border-white/80 text-white text-sm font-bold hover:bg-white hover:text-slate-900 transition-all duration-300 group"
            >
              {isRegister ? (
                <>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Đăng nhập
                </>
              ) : (
                <>
                  Đăng ký <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Form: trượt ngược chiều với panel ===== */}
      <main className={cn('min-h-screen lg:absolute lg:inset-y-0 lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10 bg-paper will-change-transform', ease, isRegister ? 'lg:translate-x-0' : 'lg:translate-x-full')}>
        <div className="lg:hidden mb-8">
          <Logo size="md" />
        </div>
        <div className="w-full max-w-md">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
};
