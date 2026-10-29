import React, { Children, isValidElement, cloneElement } from 'react';
import { useLocation } from 'react-router-dom';
import { useCountUp, useInView } from '@/shared/hooks';
import { cn } from '@/shared/utils';

type RevealAnim = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-in-left' | 'slide-in-right' | 'fade-down' | 'tilt-in';

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
      {format ? format(n) : n.toLocaleString('vi-VN')}
      {suffix}
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

/** Hoạ tiết vẽ tay: sao, vòng tròn, đường lượn — tạo cảm giác "thật", không AI */
export const Doodles: React.FC<{ className?: string; tone?: 'dark' | 'light' }> = ({ className, tone = 'dark' }) => {
  const stroke = tone === 'dark' ? '#141A2B' : '#ffffff';
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg className="absolute top-10 right-10 w-16 h-16 animate-float opacity-70" viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 6l6 18 18 6-18 6-6 18-6-18-18-6 18-6z" fill="#FFD24D" />
      </svg>
      <svg className="absolute bottom-24 left-8 w-24 h-24 animate-float-slow opacity-70" viewBox="0 0 100 100" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
        <circle cx="50" cy="50" r="38" strokeDasharray="8 10" />
      </svg>
      <svg className="absolute top-1/3 left-[12%] w-28 h-10 opacity-60" viewBox="0 0 120 40" fill="none" stroke={tone === 'dark' ? '#FA5330' : '#FFD24D'} strokeWidth="4" strokeLinecap="round">
        <path d="M4 28c14-20 26-20 40 0s26 20 40 0 24-20 32-10" />
      </svg>
      <svg className="absolute bottom-10 right-[18%] w-14 h-14 animate-bounce-soft opacity-70" viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth="3">
        <rect x="10" y="10" width="44" height="44" rx="8" fill={tone === 'dark' ? '#A9E8D4' : 'rgba(255,255,255,0.25)'} transform="rotate(12 32 32)" />
      </svg>
      <svg className="absolute top-20 left-1/2 w-10 h-10 opacity-60" viewBox="0 0 40 40" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
        <path d="M6 20h28M20 6v28" />
      </svg>
    </div>
  );
};
