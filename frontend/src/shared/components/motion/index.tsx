import React, { Children, isValidElement, cloneElement } from 'react';
import { useLocation } from 'react-router-dom';
import { useCountUp, useInView } from '@/shared/hooks';
import { cn } from '@/shared/utils';

type RevealAnim = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-in-left' | 'slide-in-right' | 'fade-down';

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
    <Tag
      ref={ref}
      className={cn(inView ? `animate-${animation}` : 'opacity-0', className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: RevealAnim;
  step?: number; // ms giữa các phần tử
  initialDelay?: number;
  whenVisible?: boolean; // chỉ chạy khi cuộn tới
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

/** Nền trang trí: các khối gradient mờ chuyển động chậm */
export const FloatingBlobs: React.FC<{ className?: string; tone?: 'indigo' | 'emerald' | 'rose' | 'amber' }> = ({ className, tone = 'indigo' }) => {
  const tones = {
    indigo: ['bg-indigo-300/40', 'bg-violet-300/40', 'bg-sky-200/40'],
    emerald: ['bg-emerald-300/40', 'bg-teal-200/40', 'bg-lime-200/30'],
    rose: ['bg-rose-300/40', 'bg-orange-200/40', 'bg-pink-200/40'],
    amber: ['bg-amber-300/40', 'bg-orange-200/40', 'bg-yellow-200/40'],
  }[tone];
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className={cn('absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl animate-blob', tones[0])} />
      <div className={cn('absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl animate-blob', tones[1])} style={{ animationDelay: '3s' }} />
      <div className={cn('absolute -bottom-32 left-1/3 w-80 h-80 rounded-full blur-3xl animate-blob', tones[2])} style={{ animationDelay: '6s' }} />
    </div>
  );
};
