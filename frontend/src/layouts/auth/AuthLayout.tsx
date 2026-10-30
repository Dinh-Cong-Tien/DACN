import React from 'react';
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

const EASE = 'cubic-bezier(0.68, -0.05, 0.27, 1.05)';
const DUR = 1000;

/** Panel màu của mỗi mặt thẻ */
const Panel: React.FC<{ register: boolean; onSwitch: () => void }> = ({ register, onSwitch }) => {
  const t = TESTIMONIALS[register ? 1 : 0];
  const points = register ? REGISTER_POINTS : LOGIN_POINTS;
  return (
    <aside className={cn('relative hidden lg:flex overflow-hidden text-white flex-col justify-between p-12', register ? 'bg-violet-500' : 'bg-indigo-600')}>
      <div aria-hidden className="absolute inset-0 bg-dots opacity-20" />
      <ThreeBackground variant="globe" dark className="opacity-35" offsetX={0.35} interactive={false} />
      <Doodles tone="light" parallax={false} />
      <div className="relative">
        <Logo size="lg" dark tagline="Học thông minh · Đúng mục tiêu" />
      </div>
      <div className="relative grid grid-cols-[1fr_200px] gap-6 items-end">
        <div className="space-y-6 max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight">
            {register ? (
              <>
                Bắt đầu <span className="mark">hành trình</span> của bạn hôm nay.
              </>
            ) : (
              <>
                Mỗi câu sai là một <span className="mark">cơ hội</span> tăng điểm.
              </>
            )}
          </h2>
          <p className={cn('leading-relaxed', register ? 'text-violet-100' : 'text-indigo-100')}>
            {register ? 'Chỉ cần email. Không cần thẻ, không ràng buộc. Hủy bất kỳ lúc nào.' : 'Lộ trình cá nhân hoá cập nhật theo từng bài làm. Học 45 phút mỗi ngày, đúng thứ bạn còn yếu.'}
          </p>
          <ul className="space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-lg bg-amber-300 text-slate-900 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className={cn('photo-frame', register ? 'tilt-1' : 'tilt-2')}>
          <Img src={register ? PHOTOS.discussion : PHOTOS.studying} alt="Học viên OrbiLingo" ratio="3/4" fallbackClass={register ? 'bg-violet-400' : 'bg-indigo-400'} />
        </div>
      </div>
      <div className="relative space-y-5">
        <div className="bg-white text-slate-900 rounded-3xl border-2 border-slate-900 shadow-hard p-6 max-w-lg">
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
          <p className="text-sm text-white/80">{register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</p>
          <button onClick={onSwitch} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border-2 border-white/80 text-white text-sm font-bold hover:bg-white hover:text-slate-900 transition-all duration-300 group">
            {register ? (
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
  );
};

/**
 * Layout xác thực kiểu LẬT THẺ 3D:
 * cả màn hình là một thẻ; mặt trước = [panel teal | form Đăng nhập], mặt sau = [form Đăng ký | panel coral].
 * Bấm chuyển thì thẻ xoay 180° quanh trục dọc, vị trí panel/form đổi bên.
 */
export const AuthLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isRegister = pathname.includes('register');
  const isFlip = pathname.endsWith('/login') || pathname.endsWith('/register');

  if (!isFlip) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2 bg-cream">
        <Panel register={false} onSwitch={() => navigate('/auth/register')} />
        <main className="flex flex-col items-center justify-center p-6 sm:p-10 bg-paper">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>
          <div key={pathname} className="w-full max-w-md animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  const face = 'absolute inset-0 grid lg:grid-cols-2 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]';
  const formCls = 'flex flex-col items-center justify-center p-6 sm:p-10 bg-paper min-h-screen lg:min-h-0 overflow-y-auto';

  return (
    <div className="min-h-screen bg-cream overflow-hidden" style={{ perspective: '2600px' }}>
      <div className="relative min-h-screen will-change-transform" style={{ transformStyle: 'preserve-3d', transition: `transform ${DUR}ms ${EASE}`, transform: isRegister ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        {/* Mặt trước: Đăng nhập */}
        <div className={face} aria-hidden={isRegister}>
          <Panel register={false} onSwitch={() => navigate('/auth/register')} />
          <main className={formCls}>
            <div className="lg:hidden mb-8">
              <Logo size="md" />
            </div>
            <div className="w-full max-w-md">
              <LoginPage />
            </div>
          </main>
        </div>

        {/* Mặt sau: Đăng ký — xoay sẵn 180° để khi thẻ lật tới thì đọc xuôi; panel ở bên phải */}
        <div className={face} style={{ transform: 'rotateY(180deg)' }} aria-hidden={!isRegister}>
          <main className={formCls}>
            <div className="lg:hidden mb-8">
              <Logo size="md" />
            </div>
            <div className="w-full max-w-md">
              <RegisterPage />
            </div>
          </main>
          <Panel register onSwitch={() => navigate('/auth/login')} />
        </div>
      </div>
    </div>
  );
};
