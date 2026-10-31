import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Logo } from '@/shared/components/ui';
import { TESTIMONIALS, SUPPORT_INFO } from '@/shared/mocks';
import { cn } from '@/shared/utils';
import './AuthLayout.css';

type AsideVariant = 'login' | 'register';

/** Ảnh nền cột phải (Pexels) + vị trí cắt để người trong ảnh không bị thẻ nổi che */
const VISUAL: Record<AsideVariant, { src: string; pos: string }> = {
  login: { src: '/images/auth/login-study.webp', pos: '52% 50%' },
  register: { src: '/images/auth/register-listen.webp', pos: '50% 30%' },
};

const floatCard = 'rounded-2xl bg-white/95 shadow-[0_24px_60px_-20px_rgba(4,20,16,0.55)] ring-1 ring-black/5 backdrop-blur';

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

/** Cột phải: ảnh học viên bo góc, thẻ sản phẩm nổi phía trên, cảm nhận học viên ở chân ảnh */
const AuthAside: React.FC<{ variant: AsideVariant }> = ({ variant }) => {
  const t = TESTIMONIALS[variant === 'register' ? 2 : 0];
  const v = VISUAL[variant];
  return (
    <aside className="hidden p-3 lg:sticky lg:top-0 lg:block lg:h-screen xl:p-4">
      <div className="relative h-full overflow-hidden rounded-[28px] bg-[#0E2A24]">
        <img key={v.src} src={v.src} alt="" className="auth-visual__img absolute inset-0 h-full w-full object-cover" style={{ objectPosition: v.pos }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#06171390] via-transparent to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#061713e6] via-[#06171380] to-transparent" />

        <div key={variant} className="auth-rise auth-rise--1 absolute left-8 top-8 xl:left-10 xl:top-10">
          {variant === 'register' ? <StepsCard /> : <ScoreCard />}
        </div>

        <figure key={`q-${variant}`} className="auth-rise auth-rise--2 absolute inset-x-8 bottom-8 max-w-[520px] text-white xl:inset-x-10 xl:bottom-10">
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
      </div>
    </aside>
  );
};

/**
 * Layout các trang tài khoản (đăng nhập, đăng ký, quên/đặt lại mật khẩu, xác thực email):
 * cột trái là form trên nền trắng (logo + link chuyển trang ở trên, thông tin hỗ trợ ở dưới),
 * cột phải (từ lg) là ảnh học viên kèm thẻ sản phẩm và cảm nhận.
 */
export const AuthLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isLogin = pathname.endsWith('/login');
  const isRegister = pathname.endsWith('/register');

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex min-h-screen flex-col">
        <header className="flex h-[76px] items-center justify-between gap-4 px-5 sm:px-10 xl:px-14">
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

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-6 text-[12px] text-slate-500 sm:px-10 xl:px-14">
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

      <AuthAside variant={isRegister ? 'register' : 'login'} />
    </div>
  );
};
