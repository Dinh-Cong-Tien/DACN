import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Logo } from '@/shared/components/ui';
import { TESTIMONIALS, SUPPORT_INFO } from '@/shared/mocks';
import { cn } from '@/shared/utils';

type AsideVariant = 'login' | 'register';

/** Bản xem trước kết quả thi thử + việc hôm nay (nội dung mẫu, giống màn hình thật trong app) */
const ProgressPreview: React.FC = () => (
  <div className="relative">
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-16px_rgba(16,24,40,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">ETS 2025 · Test 3</p>
          <p className="text-[12px] text-slate-500">Nộp lúc 21:47, 28/10/2026</p>
        </div>
        <p className="text-right">
          <span className="text-[1.75rem] font-semibold leading-none tabular-nums text-slate-900">785</span>
          <span className="text-[13px] text-slate-500">/990</span>
          <span className="mt-1 block text-[12px] font-medium text-emerald-700">+70 so với Test 2</span>
        </p>
      </div>
      <dl className="mt-4 space-y-2.5 text-[13px]">
        {[
          ['Listening', 410, 495],
          ['Reading', 375, 495],
        ].map(([k, v, max]) => (
          <div key={k} className="grid grid-cols-[72px_1fr_36px] items-center gap-3">
            <dt className="text-slate-600">{k}</dt>
            <dd className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${((v as number) / (max as number)) * 100}%` }} />
            </dd>
            <dd className="text-right tabular-nums text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
    <div className="relative -mt-3 ml-auto w-[82%] rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-16px_rgba(16,24,40,0.2)]">
      <p className="text-[13px] font-semibold text-slate-900">Hôm nay · còn 1 việc</p>
      <ul className="mt-2.5 space-y-2 text-[13px]">
        {[
          ['Ôn 14 từ đến hạn', true],
          ['Part 5 · 20 câu về mạo từ', true],
          ['Nghe chép Part 3 · bài 12', false],
        ].map(([t, done]) => (
          <li key={t as string} className="flex items-center gap-2.5">
            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', done ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300')}>{done && <Check className="h-3 w-3" strokeWidth={3} />}</span>
            <span className={done ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'}>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const STEPS = [
  ['Làm bài xếp lớp', '40 câu, khoảng 15 phút. Biết mình đang ở mức nào và yếu Part nào.'],
  ['Nhận lộ trình theo ngày thi', 'Chia theo tuần, mỗi ngày 30–45 phút, tự điều chỉnh sau mỗi bài làm.'],
  ['Học và thi thử', 'Mỗi tuần 3 đề miễn phí, câu sai được lưu vào sổ tay để ôn lại.'],
];

const StepsPreview: React.FC = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-16px_rgba(16,24,40,0.18)]">
    <p className="text-sm font-semibold text-slate-900">Sau khi tạo tài khoản</p>
    <ol className="mt-4 space-y-4">
      {STEPS.map(([t, d], i) => (
        <li key={t} className="grid grid-cols-[28px_1fr] gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-[13px] font-semibold tabular-nums text-slate-700">{i + 1}</span>
          <div>
            <p className="text-[15px] font-medium text-slate-900">{t}</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{d}</p>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

/** Cột phải: bản xem trước sản phẩm + cảm nhận học viên */
const AuthAside: React.FC<{ variant: AsideVariant }> = ({ variant }) => {
  const t = TESTIMONIALS[variant === 'register' ? 2 : 0];
  return (
    <aside className="relative hidden border-l border-slate-200 bg-[#F3F6F5] lg:flex lg:flex-col lg:justify-center">
      <div className="mx-auto w-full max-w-[440px] px-10 py-16">
        {variant === 'register' ? <StepsPreview /> : <ProgressPreview />}
        <figure className="mt-12">
          <blockquote className="text-[15px] leading-relaxed text-slate-700">“{t.quote}”</blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <img src={t.avatar} alt="" className="h-10 w-10 rounded-full bg-slate-200 object-cover object-top" />
            <span className="text-[13px] leading-snug">
              <span className="block font-medium text-slate-900">{t.name}</span>
              <span className="text-slate-500">
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
 * cột phải (từ lg) là bản xem trước sản phẩm.
 */
export const AuthLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isLogin = pathname.endsWith('/login');
  const isRegister = pathname.endsWith('/register');

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
      <div className="flex min-h-screen flex-col">
        <header className="flex h-[72px] items-center justify-between gap-4 px-5 sm:px-10">
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
          <div key={pathname} className="w-full max-w-[400px] animate-fade-up">
            <Outlet />
          </div>
        </main>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-6 text-[12px] text-slate-500 sm:px-10">
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
