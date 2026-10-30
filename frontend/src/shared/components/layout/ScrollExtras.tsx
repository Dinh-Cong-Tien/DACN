import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/shared/utils';

/** Thanh tiến độ cuộn mỏng ở mép trên trang */
export const ScrollProgress: React.FC<{ className?: string }> = ({ className }) => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div aria-hidden className={cn('fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none', className)}>
      <div className="h-full bg-violet-500 transition-[width] duration-150" style={{ width: `${p}%` }} />
    </div>
  );
};

/** Nút lên đầu trang xuất hiện khi cuộn xa */
export const BackToTop: React.FC = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      className={cn(
        'fixed bottom-5 right-5 z-50 w-11 h-11 rounded-xl bg-slate-900 text-amber-300 border-2 border-slate-900 shadow-hard-sm flex items-center justify-center transition-all duration-300 hover:-translate-y-1',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

/** Thanh tải giả lập khi đổi route (kiểu NProgress) */
export const RouteProgress: React.FC = () => {
  const { pathname } = useLocation();
  const [w, setW] = useState(0);
  const [visible, setVisible] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setVisible(true);
    setW(20);
    const t1 = setTimeout(() => setW(70), 80);
    const t2 = setTimeout(() => setW(100), 260);
    const t3 = setTimeout(() => {
      setVisible(false);
      setW(0);
    }, 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);
  return (
    <div aria-hidden className={cn('fixed top-0 left-0 right-0 h-[3px] z-[70] pointer-events-none transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')}>
      <div className="h-full bg-amber-300 shadow-[0_0_10px_#FFD24D] transition-[width] duration-200 ease-out" style={{ width: `${w}%` }} />
    </div>
  );
};

/** Đường lượn sóng ngăn cách section */
export const WaveDivider: React.FC<{ className?: string; fill?: string; flip?: boolean }> = ({ className, fill = '#141A2B', flip }) => (
  <svg aria-hidden viewBox="0 0 1440 60" preserveAspectRatio="none" className={cn('block w-full h-[40px] md:h-[60px]', flip && 'rotate-180', className)}>
    <path d="M0,32 C240,64 480,0 720,24 C960,48 1200,8 1440,28 L1440,60 L0,60 Z" fill={fill} />
  </svg>
);
