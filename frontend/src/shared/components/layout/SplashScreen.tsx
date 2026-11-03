import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/utils';
import { BrandMark } from '@/shared/components/ui/brand-mark';

/** Màn chào khi khởi động: chờ font tải xong (tối thiểu 500ms) rồi mờ dần */
export const SplashScreen: React.FC = () => {
  const [phase, setPhase] = useState<'show' | 'hide' | 'gone'>('show');
  useEffect(() => {
    const min = new Promise((r) => setTimeout(r, 500));
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve();
    Promise.all([min, fonts]).then(() => {
      setPhase('hide');
      setTimeout(() => setPhase('gone'), 450);
    });
  }, []);
  if (phase === 'gone') return null;
  return (
    <div aria-hidden className={cn('fixed inset-0 z-[9995] bg-cream flex items-center justify-center transition-opacity duration-400', phase === 'hide' ? 'opacity-0' : 'opacity-100')}>
      <div className="flex flex-col items-center gap-4">
        <BrandMark className="h-16 w-16 animate-heartbeat" />
        <div className="h-1.5 w-40 rounded-full bg-slate-200 overflow-hidden border border-slate-900/10">
          <div className="h-full w-1/2 bg-violet-500 rounded-full animate-[marquee_1.1s_linear_infinite]" style={{ animationName: 'splash-bar' }} />
        </div>
      </div>
      <style>{`@keyframes splash-bar { from { transform: translateX(-100%); } to { transform: translateX(300%); } }`}</style>
    </div>
  );
};
