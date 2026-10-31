import React, { useEffect, useRef, useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useResolvedTheme, useThemeStore } from '@/shared/stores/themeStore';
import { cn } from '@/shared/utils';
import type { ThemeMode } from '@/shared/types';

const OPTIONS: { mode: ThemeMode; label: string; icon: React.ElementType }[] = [
  { mode: 'light', label: 'Sáng', icon: Sun },
  { mode: 'dark', label: 'Tối', icon: Moon },
  { mode: 'system', label: 'Theo hệ thống', icon: Monitor },
];

/**
 * Nút chọn chế độ màu trên header: icon theo chế độ đang áp dụng, bấm mở menu Sáng / Tối / Theo hệ thống.
 * `onDark`: header đang nằm trên nền tối (trang chủ ở chế độ tối) → icon sáng màu.
 */
export const ThemeToggle: React.FC<{ onDark?: boolean; className?: string }> = ({ onDark, className }) => {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const resolved = useResolvedTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = mode === 'system' ? Monitor : resolved === 'dark' ? Moon : Sun;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chế độ màu"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Chế độ màu"
        className={cn('p-2 rounded-xl transition', onDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-900/5')}
      >
        <Icon className="w-5 h-5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_-8px_rgba(16,24,40,0.25)] animate-scale-in origin-top-right">
          {OPTIONS.map((o) => (
            <button
              key={o.mode}
              type="button"
              role="menuitemradio"
              aria-checked={mode === o.mode}
              onClick={() => {
                setMode(o.mode);
                setOpen(false);
              }}
              className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors', mode === o.mode ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50')}
            >
              <o.icon className="h-4 w-4 text-slate-500" />
              <span className="flex-1 text-left">{o.label}</span>
              {mode === o.mode && <Check className="h-4 w-4 text-indigo-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
