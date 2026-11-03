import React, { useEffect, useRef, useState } from 'react';
import { Check, Languages } from 'lucide-react';
import { useLang, useT } from '@/shared/i18n';
import { cn } from '@/shared/utils';

/**
 * Nút chọn ngôn ngữ trên header. Danh sách ngôn ngữ lấy tự động từ shared/i18n/locales/*.ts —
 * thêm file ngôn ngữ mới là tự hiện ở đây. `onDark`: header nằm trên nền tối → chữ sáng.
 */
export const LanguageSwitcher: React.FC<{ onDark?: boolean; className?: string; placement?: 'down' | 'up' }> = ({ onDark, className, placement = 'down' }) => {
  const { lang, setLang, locale, locales } = useLang();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  if (locales.length < 2) return null;
  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('Ngôn ngữ')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('Ngôn ngữ')}
        className={cn('flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-bold transition', onDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-900/5')}
      >
        <Languages className="h-5 w-5" />
        <span className="tabular-nums">{locale.short}</span>
      </button>
      {open && (
        <div role="menu" className={cn('absolute right-0 z-50 w-44 animate-scale-in', placement === 'up' ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right', 'rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_-8px_rgba(16,24,40,0.25)]')}>
          {locales.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitemradio"
              aria-checked={lang === l.code}
              lang={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors', lang === l.code ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50')}
            >
              <span className="w-6 text-[11px] font-bold text-slate-500">{l.short}</span>
              <span className="flex-1 text-left">{l.name}</span>
              {lang === l.code && <Check className="h-4 w-4 text-indigo-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
