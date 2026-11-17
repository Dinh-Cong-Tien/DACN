import React, { Children, isValidElement, cloneElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCountUp, useInView } from '@/shared/hooks';
import { cn, isLowPowerDevice } from '@/shared/utils';
import { appLocale, useT } from '@/shared/i18n';

export { fireConfetti, Confetti } from './confetti';

type RevealAnim = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-in-left' | 'slide-in-right' | 'fade-down' | 'tilt-in' | 'reveal-img';

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: RevealAnim;
  delay?: number; // ms
  as?: keyof JSX.IntrinsicElements;
}

/** Hiện phần tử với animation khi cuộn tới viewport */
export const Reveal: React.FC<RevealProps> = ({ animation = 'fade-up', delay = 0, className, style, children, as = 'div', ...rest }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Tag = as as unknown as React.ElementType;
  return (
    <Tag ref={ref} className={cn(inView ? `animate-${animation}` : 'opacity-0', className)} style={{ animationDelay: `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
};

interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: RevealAnim;
  step?: number;
  initialDelay?: number;
  whenVisible?: boolean;
}

/** Chạy animation lần lượt cho từng phần tử con */
export const Stagger: React.FC<StaggerProps> = ({ animation = 'fade-up', step = 70, initialDelay = 0, whenVisible = true, className, children, ...rest }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const active = whenVisible ? inView : true;
  return (
    <div ref={ref} className={className} {...rest}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        const el = child as React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
        return cloneElement(el, {
          className: cn(el.props.className, active ? `animate-${animation}` : 'opacity-0'),
          style: { ...(el.props.style ?? {}), animationDelay: `${initialDelay + i * step}ms` },
        });
      })}
    </div>
  );
};

/** Bọc nội dung trang: chạy lại animation mỗi khi đổi route */
export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={cn('animate-fade-up', className)}>
      {children}
    </div>
  );
};

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  format?: (n: number) => string;
}

/** Số nhảy tăng dần khi xuất hiện */
export const CountUp: React.FC<CountUpProps> = ({ value, duration = 1200, suffix = '', prefix = '', className, format }) => {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const n = useCountUp(value, duration, inView);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {format ? format(n) : n.toLocaleString(appLocale())}
      {suffix}
    </span>
  );
};

/** Chữ xoay vòng: đổi từ mỗi `interval` ms với hiệu ứng lật lên */
export const RotatingWords: React.FC<{ words: string[]; interval?: number; className?: string }> = ({ words, interval = 2400, className }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), '');
  return (
    <span className={cn('relative inline-grid align-baseline', className)} style={{ perspective: '600px' }}>
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap">{longest}</span>
      <span key={i} className="col-start-1 row-start-1 whitespace-nowrap animate-word-in">
        {words[i]}
      </span>
    </span>
  );
};

/**
 * Gõ chữ lặp vòng: gõ từng ký tự → dừng đọc → xoá lùi từng ký tự như bấm Backspace → gõ từ kế tiếp.
 * Tách theo code point (NFC) nên chữ có dấu tiếng Việt không bị vỡ. Giữ chỗ bằng từ dài nhất để bố cục không nhảy.
 * Luôn chạy kể cả khi hệ điều hành bật "giảm chuyển động" (giống marquee): đây là hiệu ứng nhận diện chính của hero, nhịp chậm, không nhấp nháy mạnh.
 * Phần chữ động là aria-hidden: nơi dùng tự đặt chữ sr-only bên ngoài (không đặt bên trong vùng background-clip:text vì sẽ bị vẽ ra).
 */
export const TypeLoop: React.FC<{
  words: string[];
  typeSpeed?: number; // ms / ký tự khi gõ
  deleteSpeed?: number; // ms / ký tự khi xoá
  hold?: number; // ms dừng khi gõ xong
  gap?: number; // ms nghỉ khi đã xoá hết
  startDelay?: number;
  className?: string;
  caretClassName?: string;
  /** class cho span chứa chữ (vd chữ gradient background-clip:text phải đặt ở đây để Safari vẽ được) */
  textClassName?: string;
}> = ({ words, typeSpeed = 120, deleteSpeed = 60, hold = 1800, gap = 380, startDelay = 500, className, caretClassName, textClassName }) => {
  // dịch cả từ trước khi gõ từng ký tự (tầng dịch toàn trang không nhận ra được chữ đang gõ dở)
  const t = useT();
  const chars = React.useMemo(() => words.map((w) => Array.from(t(w).normalize('NFC'))), [words, t]);
  const [wi, setWi] = useState(0);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<'start' | 'typing' | 'holding' | 'deleting'>('start');

  useEffect(() => {
    const len = chars[wi]?.length ?? 0;
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'start') t = setTimeout(() => setPhase('typing'), startDelay);
    else if (phase === 'typing') t = n < len ? setTimeout(() => setN(n + 1), typeSpeed) : setTimeout(() => setPhase('holding'), 0);
    else if (phase === 'holding') t = setTimeout(() => setPhase('deleting'), hold);
    else
      t =
        n > 0
          ? setTimeout(() => setN(n - 1), deleteSpeed)
          : setTimeout(() => {
              setWi((wi + 1) % chars.length);
              setPhase('typing');
            }, gap);
    return () => clearTimeout(t);
  }, [chars, wi, n, phase, typeSpeed, deleteSpeed, hold, gap, startDelay]);

  const longest = words.reduce((a, b) => (Array.from(a).length >= Array.from(b).length ? a : b), '');
  const caret = <span aria-hidden className={cn('type-caret', (phase === 'holding' || phase === 'start') && 'type-caret-blink', caretClassName)} />;
  return (
    <span className={cn('relative inline-grid align-baseline', className)}>
      {/* giữ chỗ theo từ dài nhất (kể cả con trỏ) */}
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {longest}
        {caret}
      </span>
      <span aria-hidden className="col-start-1 row-start-1 whitespace-nowrap">
        <span className={textClassName}>{chars[wi]?.slice(0, n).join('')}</span>
        {caret}
      </span>
    </span>
  );
};

/** Hiệu ứng gõ chữ */
export const TypeWriter: React.FC<{ text: string; speed?: number; className?: string; cursor?: boolean }> = ({ text, speed = 40, className, cursor = true }) => {
  const [n, setN] = useState(0);
  const { ref, inView } = useInView<HTMLSpanElement>();
  useEffect(() => {
    if (!inView) return;
    if (n >= text.length) return;
    const id = setTimeout(() => setN((x) => x + 1), speed);
    return () => clearTimeout(id);
  }, [n, text.length, speed, inView]);
  return (
    <span ref={ref} className={className}>
      {text.slice(0, n)}
      {cursor && n < text.length && <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5 animate-pulse" />}
    </span>
  );
};

/** Nền trang trí: khối màu mờ chuyển động chậm (giữ cho tương thích) */
export const FloatingBlobs: React.FC<{ className?: string; tone?: 'indigo' | 'emerald' | 'rose' | 'amber' }> = ({ className, tone = 'indigo' }) => {
  const tones = {
    indigo: ['bg-indigo-200/60', 'bg-amber-200/60', 'bg-violet-200/50'],
    emerald: ['bg-emerald-200/60', 'bg-teal-200/50', 'bg-amber-200/40'],
    rose: ['bg-violet-200/60', 'bg-amber-200/50', 'bg-rose-200/40'],
    amber: ['bg-amber-200/60', 'bg-orange-200/50', 'bg-yellow-200/50'],
  }[tone];
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className={cn('absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl animate-float-slow', tones[0])} />
      <div className={cn('absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl animate-float', tones[1])} style={{ animationDelay: '3s' }} />
      <div className={cn('absolute -bottom-32 left-1/3 w-80 h-80 rounded-full blur-3xl animate-float-slow', tones[2])} style={{ animationDelay: '6s' }} />
    </div>
  );
};

/** Hoạ tiết vẽ tay: sao, vòng tròn, đường lượn — có parallax nhẹ theo cuộn trang */
export const Doodles: React.FC<{ className?: string; tone?: 'dark' | 'light'; parallax?: boolean }> = ({ className, tone = 'dark', parallax = true }) => {
  const stroke = tone === 'dark' ? '#141A2B' : '#ffffff';
  const [y, setY] = useState(0);
  useEffect(() => {
    if (!parallax || isLowPowerDevice()) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [parallax]);
  const p = (k: number) => ({ transform: `translateY(${(y * k).toFixed(1)}px)` });
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg style={p(-0.08)} className="absolute top-10 right-10 w-16 h-16 opacity-70" viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path className="animate-spin-slow origin-center" d="M32 6l6 18 18 6-18 6-6 18-6-18-18-6 18-6z" fill="#FFD24D" />
      </svg>
      <svg style={p(0.06)} className="absolute bottom-24 left-8 w-24 h-24 animate-float-slow opacity-70" viewBox="0 0 100 100" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
        <circle cx="50" cy="50" r="38" strokeDasharray="8 10" className="animate-spin-slow origin-center" />
      </svg>
      <svg style={p(-0.04)} className="absolute top-1/3 left-[12%] w-28 h-10 opacity-60" viewBox="0 0 120 40" fill="none" stroke={tone === 'dark' ? '#FA5330' : '#FFD24D'} strokeWidth="4" strokeLinecap="round">
        <path d="M4 28c14-20 26-20 40 0s26 20 40 0 24-20 32-10" />
      </svg>
      <svg style={p(0.1)} className="absolute bottom-10 right-[18%] w-14 h-14 animate-bounce-soft opacity-70" viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth="3">
        <rect x="10" y="10" width="44" height="44" rx="8" fill={tone === 'dark' ? '#A9E8D4' : 'rgba(255,255,255,0.25)'} transform="rotate(12 32 32)" />
      </svg>
      <svg style={p(-0.05)} className="absolute top-20 left-1/2 w-10 h-10 opacity-60 animate-heartbeat" viewBox="0 0 40 40" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
        <path d="M6 20h28M20 6v28" />
      </svg>
    </div>
  );
};

/**
 * Khung ảnh xuất hiện kiểu "mở màn" khi cuộn tới: lớp che kéo mở theo hướng, ảnh phóng nhẹ rồi thu về;
 * parallax: sau đó ảnh trôi nhẹ theo cuộn trang (chỉ trình duyệt hỗ trợ scroll-driven animation).
 * Bọc quanh <Img>; phần tử cha nên có overflow-hidden + bo góc nếu cần.
 */
export const RevealPhoto: React.FC<{ children: React.ReactNode; className?: string; direction?: 'up' | 'left' | 'right'; delay?: number; parallax?: boolean; show?: boolean }> = ({
  children,
  className,
  direction = 'up',
  delay = 0,
  parallax,
  show,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const on = show ?? inView;
  return (
    <div ref={ref} className={cn('photo-reveal', `photo-reveal--${direction}`, parallax && 'photo-reveal--parallax', on && 'is-in', className)} style={{ '--delay': `${delay}ms` } as React.CSSProperties}>
      {/* lớp che nằm trong: IntersectionObserver của Chrome coi phần tử bị clip-path che hết là "không thấy" */}
      <div className="photo-reveal__mask">
        <div className="photo-reveal__inner">
          <div className="photo-reveal__para">{children}</div>
        </div>
      </div>
    </div>
  );
};
