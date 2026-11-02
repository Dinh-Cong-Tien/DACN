import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/shared/components/ui';
import { SUPPORT_INFO } from '@/shared/constants/public';
import { useTestimonials } from '@/shared/api/cms';
import { cn } from '@/shared/utils';
import './AuthLayout.css';

type AsideVariant = 'login' | 'register';
const VARIANTS: AsideVariant[] = ['login', 'register'];
const variantOf = (path: string): AsideVariant => (path.endsWith('/register') ? 'register' : 'login');

/** Một trang trong cột form: trang cũ được giữ lại một lúc để mờ dần thay vì biến mất ngay */
interface FormView {
  key: string;
  el: React.ReactNode;
  leaving?: boolean;
  /** Độ trễ trước khi form mới hiện (giây): chờ cột form trượt tới nơi khi đổi bên */
  delay: number;
}

/** Ảnh trong khung vòm (Pexels) + vị trí cắt để mặt người nằm giữa vòm */
const VISUAL: Record<AsideVariant, { src: string; pos: string }> = {
  login: { src: '/images/auth/login-study.webp', pos: '64% 35%' },
  register: { src: '/images/auth/register-listen.webp', pos: '55% 22%' },
};

/** Tiêu đề trên khối ảnh theo từng trang */
const HEADLINE: Record<AsideVariant, { title: string; sub: string }> = {
  login: { title: 'Học đúng phần còn yếu, điểm lên thấy rõ.', sub: 'Lộ trình tự điều chỉnh sau mỗi bài làm. Câu sai được lưu lại để ôn đến khi nhớ.' },
  register: { title: 'Bắt đầu bằng 15 phút xếp lớp.', sub: 'Biết mình đang ở mức nào, yếu Part nào và cần bao nhiêu tuần để đạt mục tiêu.' },
};

const card = 'rounded-2xl bg-white text-slate-900 shadow-[0_18px_40px_-14px_rgba(3,24,19,0.55)] ring-1 ring-black/5';

/** Thẻ kết quả thi thử mẫu (giống màn hình trong app) */
const ScoreCard: React.FC = () => (
  <div className={cn(card, 'w-[244px] p-4')}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[13px] font-semibold">ETS 2025 · Test 3</p>
        <p className="text-[11px] text-slate-500">Nộp 21:47, 28/10</p>
      </div>
      <p className="text-right leading-none">
        <span className="text-[1.45rem] font-semibold tabular-nums">785</span>
        <span className="text-[11px] text-slate-500">/990</span>
      </p>
    </div>
    <dl className="mt-3 space-y-1.5 text-[12px]">
      {(
        [
          ['Listening', 410],
          ['Reading', 375],
        ] as const
      ).map(([k, v]) => (
        <div key={k} className="grid grid-cols-[58px_1fr_28px] items-center gap-2.5">
          <dt className="text-slate-600">{k}</dt>
          <dd className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${(v / 495) * 100}%` }} />
          </dd>
          <dd className="text-right tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
    <p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-emerald-700">+70 điểm so với Test 2</p>
  </div>
);

/** Thẻ kết quả bài xếp lớp mẫu */
const PlacementCard: React.FC = () => (
  <div className={cn(card, 'w-[244px] p-4')}>
    <p className="text-[13px] font-semibold">Kết quả xếp lớp</p>
    <p className="text-[11px] text-slate-500">40 câu · làm trong 14 phút</p>
    <div className="mt-3 flex items-end justify-between">
      <p className="leading-none">
        <span className="text-[11px] text-slate-500">Hiện tại </span>
        <span className="text-[1.45rem] font-semibold tabular-nums">545</span>
      </p>
      <p className="text-right text-[12px] leading-tight">
        <span className="block text-slate-500">Mục tiêu</span>
        <span className="font-semibold tabular-nums">750</span>
      </p>
    </div>
    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
      <span className="block h-full w-[72%] rounded-full bg-indigo-600" />
    </div>
    <p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-600">
      Lộ trình gợi ý <b className="font-semibold text-slate-900">14 tuần</b> · 45 phút/ngày
    </p>
  </div>
);

/** Thẻ nhỏ thứ hai ở mép phải vòm */
const MiniCard: React.FC<{ variant: AsideVariant }> = ({ variant }) =>
  variant === 'register' ? (
    <div className={cn(card, 'w-[176px] px-3.5 py-3')}>
      <p className="text-[11px] text-slate-500">Cần ưu tiên</p>
      <p className="mt-0.5 text-[13px] font-semibold">Part 3 · đúng 52%</p>
    </div>
  ) : (
    <div className={cn(card, 'w-[176px] px-3.5 py-3')}>
      <p className="text-[11px] text-slate-500">Hôm nay</p>
      <p className="mt-0.5 text-[13px] font-semibold">3/4 bài · 38 phút</p>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn('h-1 rounded-full', i <= 3 ? 'bg-indigo-600' : 'bg-slate-200')} />
        ))}
      </div>
    </div>
  );

/** Cảm nhận học viên gọn ở chân khối */
const Quote: React.FC<{ variant: AsideVariant }> = ({ variant }) => {
  const { data } = useTestimonials();
  const t = data?.length ? data[(variant === 'register' ? 2 : 0) % data.length] : undefined;
  if (!t) return null;
  return (
    <figure className="flex items-start gap-3.5">
      <img src={t.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full bg-white/15 object-cover object-top ring-2 ring-white/20" />
      <div className="min-w-0">
        <blockquote className="line-clamp-2 text-[14px] leading-relaxed text-white/85">“{t.quote}”</blockquote>
        <figcaption className="mt-1.5 text-[12px] text-white/55">
          <span className="font-medium text-white/90">{t.name}</span> · {t.exam} {t.score} · thi {t.examDate}
        </figcaption>
      </div>
    </figure>
  );
};

/**
 * Khối ảnh: nền xanh thương hiệu, tiêu đề ở trên, ảnh học viên trong khung vòm với thẻ sản phẩm gắn ở mép,
 * cảm nhận ở dưới. Render sẵn cả 2 bộ nội dung; ảnh đổi kiểu kéo rèm theo hướng trượt, chữ/thẻ đổi bằng fade.
 */
const AuthVisual: React.FC<{ variant: AsideVariant; swap: string }> = ({ variant, swap }) => (
  <div className={cn('relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[#0D3F36] px-10 pb-8 pt-10 text-white xl:px-12 xl:pt-12', swap && `auth-panel--swap-${swap}`)}>
    {/* Ánh sáng dịu góc trên + đáy tối hơn cho có chiều sâu */}
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_0%_0%,rgba(255,255,255,0.10),transparent_60%),linear-gradient(to_bottom,transparent_55%,rgba(4,26,21,0.55))]" />

    {/* Tiêu đề */}
    <div className="relative grid">
      {VARIANTS.map((k) => (
        <div key={k} aria-hidden={k !== variant} className={cn('auth-swap-item [grid-area:1/1]', k === variant && 'is-on')}>
          <h2 className="max-w-[440px] font-display text-[1.75rem] font-bold leading-[1.2] tracking-tight xl:text-[2rem]">{HEADLINE[k].title}</h2>
          <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-white/70 [@media(max-height:760px)]:hidden">{HEADLINE[k].sub}</p>
        </div>
      ))}
    </div>

    {/* Khung vòm + thẻ */}
    <div className="relative mt-8 min-h-0 flex-1">
      <div className="absolute inset-y-0 left-[14%] right-[2%] flex justify-center">
        <div className="relative aspect-[4/5] h-full max-w-full">
          {/* Vòm tỉ lệ 4:5: góc trên = nửa chiều rộng (50% ngang / 40% dọc), góc dưới 28px */}
          <div className="auth-visual__img absolute inset-0 overflow-hidden bg-[#165247] ring-1 ring-white/10" style={{ borderRadius: '50% 50% 28px 28px / 40% 40% 28px 28px' }}>
            {VARIANTS.map((k) => (
              <div key={k} className={cn('auth-photo', `auth-photo--${k}`, k === variant && 'is-on')}>
                <img src={VISUAL[k].src} alt="" className="auth-photo__img" style={{ objectPosition: VISUAL[k].pos }} />
              </div>
            ))}
          </div>

          {VARIANTS.map((k) => (
            <div key={`card-${k}`} aria-hidden={k !== variant} className={cn('auth-swap-item absolute bottom-[12%] right-[62%] z-10', k === variant && 'is-on')}>
              {k === 'register' ? <PlacementCard /> : <ScoreCard />}
            </div>
          ))}
          {VARIANTS.map((k) => (
            <div key={`mini-${k}`} aria-hidden={k !== variant} className={cn('auth-swap-item auth-swap-item--late absolute -right-5 top-[28%] z-10 [@media(max-height:760px)]:hidden', k === variant && 'is-on')}>
              <MiniCard variant={k} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Cảm nhận */}
    <div className="relative mt-8 grid border-t border-white/10 pt-6">
      {VARIANTS.map((k) => (
        <div key={`quote-${k}`} aria-hidden={k !== variant} className={cn('auth-swap-item [grid-area:1/1]', k === variant && 'is-on')}>
          <Quote variant={k} />
        </div>
      ))}
    </div>
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
  const outlet = useOutlet();

  // Trang cũ ở lại để mờ dần trong lúc trang mới hiện lên (kiểu chuyển route), sau đó mới gỡ ra
  const [views, setViews] = useState<FormView[]>([{ key: pathname, el: outlet, delay: 0 }]);
  useEffect(() => {
    setViews((vs) => {
      const top = vs[vs.length - 1];
      if (top.key === pathname) return vs;
      const delay = variantOf(top.key) !== variantOf(pathname) ? 0.5 : 0.22;
      return [...vs.filter((v) => v.key !== pathname).map((v) => ({ ...v, leaving: true })), { key: pathname, el: outlet, delay }];
    });
    const id = setTimeout(() => setViews((vs) => vs.filter((v) => !v.leaving)), 800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Đếm số lần đổi bên để luân phiên tên animation (a/b) → mỗi lần chuyển đều chạy lại; lần đầu vào trang thì không chạy
  const swapRef = useRef({ variant, n: 0 });
  if (swapRef.current.variant !== variant) swapRef.current = { variant, n: swapRef.current.n + 1 };
  const n = swapRef.current.n;
  const swap = n === 0 ? '' : n % 2 ? 'a' : 'b';

  return (
    <div className="relative min-h-screen bg-page lg:h-screen lg:overflow-hidden">
      {/* Cột form */}
      <div
        className={cn(
          // Ẩn thanh cuộn của cột (vẫn cuộn được) — thanh cuộn đứng giữa màn hình trông như lỗi
          'auth-form auth-slide no-scrollbar flex min-h-screen flex-col lg:absolute lg:inset-y-0 lg:left-0 lg:min-h-0 lg:w-1/2 lg:overflow-y-auto',
          isRegister ? 'lg:translate-x-full' : 'lg:translate-x-0'
        )}
      >
        <header className="flex h-[76px] shrink-0 items-center [@media(max-height:800px)]:h-16 justify-between gap-4 px-5 sm:px-10 xl:px-14">
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

        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 [@media(max-height:800px)]:py-3">
          {/* Các trang chồng cùng một ô lưới: trang cũ mờ đi, trang mới hiện lên đúng chỗ */}
          <div className="grid w-full max-w-[420px]">
            {views.map((v) =>
              v.leaving ? (
                <div key={v.key} aria-hidden className="auth-leave [grid-area:1/1]">
                  {v.el}
                </div>
              ) : (
                <div key={v.key} className="auth-stagger [grid-area:1/1]" style={{ '--d': `${v.delay}s` } as React.CSSProperties}>
                  {v.key === pathname ? outlet : v.el}
                </div>
              )
            )}
          </div>
        </main>

        <footer className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 px-5 py-6 [@media(max-height:800px)]:py-4 text-[12px] text-slate-500 sm:px-10 xl:px-14">
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
