import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/utils';

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
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 border-2 border-slate-900 shadow-hard flex items-center justify-center text-white animate-heartbeat">
          <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
        </div>
        <div className="h-1.5 w-40 rounded-full bg-slate-200 overflow-hidden border border-slate-900/10">
          <div className="h-full w-1/2 bg-violet-500 rounded-full animate-[marquee_1.1s_linear_infinite]" style={{ animationName: 'splash-bar' }} />
        </div>
      </div>
      <style>{`@keyframes splash-bar { from { transform: translateX(-100%); } to { transform: translateX(300%); } }`}</style>
    </div>
  );
};
