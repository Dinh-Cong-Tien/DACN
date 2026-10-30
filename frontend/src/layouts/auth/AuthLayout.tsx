import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Quote, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { Logo, Avatar } from '@/shared/components/ui';
import { Doodles } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { ThreeBackground } from '@/shared/components/three/ThreeBackground';
import { TESTIMONIALS } from '@/shared/mocks';
import { cn } from '@/shared/utils';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

const LOGIN_POINTS = ['Chẩn đoán năng lực 15 phút, nhận lộ trình ngay', 'Thi thử chuẩn ETS & Bộ GD&ĐT, audio một lần như thi thật', 'Sổ tay lỗi sai + ôn tập ngắt quãng SM-2', 'Miễn phí mãi mãi với tính năng cốt lõi'];
const REGISTER_POINTS = ['Tạo tài khoản 30 giây, không cần thẻ', 'Làm bài xếp lớp để biết mình đang ở đâu', 'Nhận lộ trình 3 chặng theo ngày thi', 'Mỗi ngày 45 phút, đúng phần bạn còn yếu'];

// Một đường cong duy nhất cho mọi thứ trượt/mờ để chuyển động đồng bộ
const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
const DUR = 900;

/**
 * Layout xác thực kiểu "double slider":
 * - Panel màu trượt trái ↔ phải, đổi màu teal ↔ coral mượt theo cùng đường cong.
 * - Hai form Đăng nhập / Đăng ký luôn nằm trong DOM, trượt chéo và mờ dần vào nhau (không remount, không giật).
 * - Các trang khác (quên mật khẩu, xác thực…) dùng Outlet như bình thường.
 */
export const AuthLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isRegister = pathname.includes('register');
  const isSlider = pathname.endsWith('/login') || pathname.endsWith('/register');

  // Chỉ cho chữ trên panel chạy lại animation khi đổi trang (không chạy lúc mới vào)
  const [tick, setTick] = useState(0);
  // Nội dung panel đổi TRỄ (sau khi panel đã trượt được nửa đường) và mờ dần ra/vào
  const [shownRegister, setShownRegister] = useState(isRegister);
  const [contentVisible, setContentVisible] = useState(true);
  useEffect(() => {
    if (shownRegister === isRegister) return;
    setContentVisible(false);
    const timer = setTimeout(() => {
      setShownRegister(isRegister);
      setTick((n) => n + 1);
      setContentVisible(true);
    }, DUR * 0.45);
    return () => clearTimeout(timer);
  }, [isRegister, shownRegister]);

  const t = TESTIMONIALS[shownRegister ? 1 : 0];
  const points = shownRegister ? REGISTER_POINTS : LOGIN_POINTS;

  const slide = { transition: `transform ${DUR}ms ${EASE}` };
  const fadeSlide = (active: boolean, fromLeft: boolean): React.CSSProperties => ({
    transition: `transform ${DUR}ms ${EASE}, opacity ${DUR * 0.6}ms ${EASE} ${active ? DUR * 0.25 : 0}ms`,
    transform: active ? 'translateX(0)' : `translateX(${fromLeft ? '-12%' : '12%'})`,
    opacity: active ? 1 : 0,
    pointerEvents: active ? 'auto' : 'none',
  });

  return (
    <div className="min-h-screen bg-cream relative lg:overflow-hidden">
      {/* ===== Panel màu (desktop) ===== */}
      <aside className={cn('hidden lg:flex absolute inset-y-0 left-0 w-1/2 overflow-hidden text-white flex-col justify-between p-12 will-change-transform bg-indigo-600', isRegister ? 'translate-x-full' : 'translate-x-0')} style={slide}>
        <div aria-hidden className="absolute inset-0 bg-violet-500" style={{ transition: `opacity ${DUR}ms ${EASE}`, opacity: isRegister ? 1 : 0 }} />
        <div aria-hidden className="absolute inset-0 bg-dots opacity-20" />
        <ThreeBackground variant="globe" dark className="opacity-35" offsetX={0.35} interactive={false} />
        <Doodles tone="light" parallax={false} />

        <div className="relative">
          <Logo size="lg" dark tagline="Học thông minh · Đúng mục tiêu" />
        </div>

        <div key={tick} className="relative grid grid-cols-[1fr_200px] gap-6 items-end transition-opacity duration-300" style={{ opacity: contentVisible ? 1 : 0 }}>
          <div className="space-y-6 max-w-md">
            <h2 className={cn('font-display text-4xl font-extrabold leading-tight tracking-tight', tick > 1 && 'animate-fade-up')} style={{ animationDelay: '0ms' }}>
              {shownRegister ? (
                <>
                  Bắt đầu <span className="mark">hành trình</span> của bạn hôm nay.
                </>
              ) : (
                <>
                  Mỗi câu sai là một <span className="mark">cơ hội</span> tăng điểm.
                </>
              )}
            </h2>
            <p className={cn('leading-relaxed', shownRegister ? 'text-violet-100' : 'text-indigo-100', tick > 1 && 'animate-fade-up')} style={{ animationDelay: '80ms' }}>
              {shownRegister ? 'Chỉ cần email. Không cần thẻ, không ràng buộc. Hủy bất kỳ lúc nào.' : 'Lộ trình cá nhân hoá cập nhật theo từng bài làm. Học 45 phút mỗi ngày, đúng thứ bạn còn yếu.'}
            </p>
            <ul className="space-y-2.5">
              {points.map((p, i) => (
                <li key={p} className={cn('flex items-center gap-3 text-sm', tick > 1 && 'animate-slide-in-left')} style={{ animationDelay: `${160 + i * 80}ms` }}>
                  <span className="w-6 h-6 rounded-lg bg-amber-300 text-slate-900 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className={cn('photo-frame', shownRegister ? 'tilt-1' : 'tilt-2', tick > 1 && 'animate-tilt-in')} style={{ animationDelay: '120ms' }}>
            <Img src={shownRegister ? PHOTOS.discussion : PHOTOS.studying} alt="Học viên OrbiLingo" ratio="3/4" fallbackClass={shownRegister ? 'bg-violet-400' : 'bg-indigo-400'} />
          </div>
        </div>

        <div className="relative space-y-5 transition-opacity duration-300" style={{ opacity: contentVisible ? 1 : 0 }}>
          <div key={`q-${tick}`} className={cn('bg-white text-slate-900 rounded-3xl border-2 border-slate-900 shadow-hard p-6 max-w-lg', tick > 1 && 'animate-fade-up')} style={{ animationDelay: '240ms' }}>
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

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-white/80">{shownRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</p>
            <button
              onClick={() => navigate(shownRegister ? '/auth/login' : '/auth/register')}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border-2 border-white/80 text-white text-sm font-bold hover:bg-white hover:text-slate-900 transition-all duration-300 group"
            >
              {shownRegister ? (
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

      {/* ===== Khu vực form: trượt ngược chiều panel ===== */}
      <main className={cn('min-h-screen lg:absolute lg:inset-y-0 lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10 bg-paper will-change-transform', isRegister ? 'lg:translate-x-0' : 'lg:translate-x-full')} style={slide}>
        <div className="lg:hidden mb-8">
          <Logo size="md" />
        </div>
        <div className="w-full max-w-md relative">
          {isSlider ? (
            // Hai form chồng lên nhau, mờ/trượt chéo — không remount nên không giật
            <div className="grid">
              <div className="col-start-1 row-start-1" style={fadeSlide(!isRegister, true)} aria-hidden={isRegister}>
                <LoginPage />
              </div>
              <div className="col-start-1 row-start-1" style={fadeSlide(isRegister, false)} aria-hidden={!isRegister}>
                <RegisterPage />
              </div>
            </div>
          ) : (
            <div key={pathname} className="animate-fade-up">
              <Outlet />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
