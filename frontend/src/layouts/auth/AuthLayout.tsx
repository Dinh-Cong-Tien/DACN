import React, { useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Logo } from '@/shared/components/ui';
import { TESTIMONIALS, SUPPORT_INFO } from '@/shared/mocks';
import { cn } from '@/shared/utils';
import './AuthLayout.css';

type AsideVariant = 'login' | 'register';
const VARIANTS: AsideVariant[] = ['login', 'register'];

/** Ảnh nền khối ảnh (Pexels) + vị trí cắt để người trong ảnh không bị thẻ nổi che */
const VISUAL: Record<AsideVariant, { src: string; pos: string }> = {
  login: { src: '/images/auth/login-study.webp', pos: '52% 50%' },
  register: { src: '/images/auth/register-listen.webp', pos: '50% 30%' },
};

const floatCard = 'rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(4,20,16,0.55)] ring-1 ring-black/5';

/** Thẻ kết quả thi thử mẫu (giống màn hình trong app) */
const ScoreCard: React.FC = () => (
  <div className={cn(floatCard, 'w-[300px] p-5')}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">ETS 2025 · Test 3</p>
        <p className="text-[12px] text-slate-500">Nộp lúc 21:47, 28/10</p>
        <p className="mt-1 text-[12px] font-medium text-emerald-700">+70 so với Test 2</p>
      </div>
      <p className="text-right">
        <span className="text-[1.6rem] font-semibold leading-none tabular-nums text-slate-900">785</span>
        <span className="text-[12px] text-slate-500">/990</span>
      </p>
    </div>
    <dl className="mt-4 space-y-2 text-[13px]">
      {(
        [
          ['Listening', 410],
          ['Reading', 375],
        ] as const
      ).map(([k, v]) => (
        <div key={k} className="grid grid-cols-[68px_1fr_32px] items-center gap-3">
          <dt className="text-slate-600">{k}</dt>
          <dd className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${(v / 495) * 100}%` }} />
          </dd>
          <dd className="text-right tabular-nums text-slate-900">{v}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const STEPS = [
  ['Làm bài xếp lớp', '40 câu, khoảng 15 phút'],
  ['Nhận lộ trình theo ngày thi', '30–45 phút mỗi ngày'],
  ['Học và thi thử', '3 đề miễn phí mỗi tuần'],
];

/** Thẻ 3 bước sau khi đăng ký */
const StepsCard: React.FC = () => (
  <div className={cn(floatCard, 'w-[300px] p-5')}>
    <p className="text-sm font-semibold text-slate-900">Sau khi tạo tài khoản</p>
    <ol className="mt-3.5 space-y-3">
      {STEPS.map(([t, d], i) => (
        <li key={t} className="flex items-start gap-3">
          <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold', i === 0 ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-slate-600')}>
            {i === 0 ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
          </span>
          <span className="text-[13px] leading-snug">
            <span className="block font-medium text-slate-900">{t}</span>
            <span className="text-slate-500">{d}</span>
          </span>
        </li>
      ))}
    </ol>
  </div>
);

/** Cảm nhận học viên ở chân ảnh */
const Quote: React.FC<{ variant: AsideVariant }> = ({ variant }) => {
  const t = TESTIMONIALS[variant === 'register' ? 2 : 0];
  return (
    <figure className="text-white">
      <blockquote className="text-[17px] leading-relaxed text-white/95 xl:text-lg">“{t.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <img src={t.avatar} alt="" className="h-11 w-11 rounded-full bg-white/20 object-cover object-top ring-2 ring-white/30" />
        <span className="text-[13px] leading-snug">
          <span className="block text-[15px] font-medium text-white">{t.name}</span>
          <span className="text-white/70">
            {t.exam} {t.score} · thi {t.examDate} tại {t.venue}
          </span>
        </span>
      </figcaption>
    </figure>
  );
};

/**
 * Khối ảnh: render sẵn cả 2 bộ (ảnh, thẻ nổi, cảm nhận); ảnh đổi kiểu kéo rèm theo hướng trượt,
 * thẻ và cảm nhận đổi bằng fade → khi khối trượt sang bên kia nội dung đổi mượt, không nháy.
 */
const AuthVisual: React.FC<{ variant: AsideVariant; swap: string }> = ({ variant, swap }) => (
  <div className={cn('relative h-full overflow-hidden rounded-[28px] bg-[#0E2A24]', swap && `auth-panel--swap-${swap}`)}>
    <div className="auth-visual__img absolute inset-0">
      {VARIANTS.map((k) => (
        <div key={k} className={cn('auth-photo', `auth-photo--${k}`, k === variant && 'is-on')}>
          <img src={VISUAL[k].src} alt="" className="auth-photo__img" style={{ objectPosition: VISUAL[k].pos }} />
        </div>
      ))}
    </div>
    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#06171390] via-transparent to-transparent" />
    <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#061713e6] via-[#06171380] to-transparent" />

    {VARIANTS.map((k) => (
      <div key={`card-${k}`} aria-hidden={k !== variant} className={cn('auth-swap-item absolute left-8 top-8 xl:left-10 xl:top-10', k === variant && 'is-on')}>
        {k === 'register' ? <StepsCard /> : <ScoreCard />}
      </div>
    ))}
    {VARIANTS.map((k) => (
      <div key={`quote-${k}`} aria-hidden={k !== variant} className={cn('auth-swap-item absolute inset-x-8 bottom-8 max-w-[520px] xl:inset-x-10 xl:bottom-10', k === variant && 'is-on')}>
        <Quote variant={k} />
      </div>
    ))}
  </div>
);

/**
 * Layout các trang tài khoản (đăng nhập, đăng ký, quên/đặt lại mật khẩu, xác thực email).
 * Từ lg: hai nửa màn hình — đăng nhập [form | ảnh], đăng ký [ảnh | form];
 * chuyển qua lại thì khối ảnh trượt sang bên kia, form trượt ngược chiều bên dưới.
 * Dưới lg: chỉ có form.
 */
export const AuthLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isLogin = pathname.endsWith('/login');
  const isRegister = pathname.endsWith('/register');
  const variant: AsideVariant = isRegister ? 'register' : 'login';

  // Đếm số lần đổi bên để luân phiên tên animation (a/b) → mỗi lần chuyển đều chạy lại; lần đầu vào trang thì không chạy
  const swapRef = useRef({ variant, n: 0 });
  if (swapRef.current.variant !== variant) swapRef.current = { variant, n: swapRef.current.n + 1 };
  const n = swapRef.current.n;
  const swap = n === 0 ? '' : n % 2 ? 'a' : 'b';

  return (
    <div className="relative min-h-screen bg-white lg:h-screen lg:overflow-hidden">
      {/* Cột form */}
      <div
        className={cn(
          'auth-form auth-slide flex min-h-screen flex-col lg:absolute lg:inset-y-0 lg:left-0 lg:min-h-0 lg:w-1/2 lg:overflow-y-auto',
          isRegister ? 'lg:translate-x-full' : 'lg:translate-x-0',
          swap && `auth-form--swap-${swap}`
        )}
      >
        <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 px-5 sm:px-10 xl:px-14">
          <Logo size="md" />
          <p className="text-sm text-slate-600">
            {isLogin ? (
              <>
                <span className="hidden sm:inline">Chưa có tài khoản? </span>
                <Link to="/auth/register" className="font-medium text-indigo-700 hover:underline underline-offset-2">
                  Đăng ký
                </Link>
              </>
            ) : isRegister ? (
              <>
                <span className="hidden sm:inline">Đã có tài khoản? </span>
                <Link to="/auth/login" className="font-medium text-indigo-700 hover:underline underline-offset-2">
                  Đăng nhập
                </Link>
              </>
            ) : (
              <Link to="/auth/login" className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </p>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div key={pathname} className="auth-stagger w-full max-w-[420px]">
            <Outlet />
          </div>
        </main>

        <footer className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 px-5 py-6 text-[12px] text-slate-500 sm:px-10 xl:px-14">
          <span>© 2026 OrbiLingo</span>
          <Link to="/help" className="hover:text-slate-800">
            Điều khoản
          </Link>
          <Link to="/help" className="hover:text-slate-800">
            Bảo mật
          </Link>
          <span>
            Hỗ trợ {SUPPORT_INFO.hotline} ({SUPPORT_INFO.hours[0]}:00–{SUPPORT_INFO.hours[1]}:00)
          </span>
        </footer>
      </div>

      {/* Khối ảnh: nằm trên cột form để khi hai bên trượt ngang qua nhau thì form đi bên dưới */}
      <aside className={cn('auth-slide absolute inset-y-0 left-0 z-10 hidden w-1/2 p-3 lg:block xl:p-4', isRegister ? 'translate-x-0' : 'translate-x-full')}>
        <AuthVisual variant={variant} swap={swap} />
      </aside>
    </div>
  );
};
