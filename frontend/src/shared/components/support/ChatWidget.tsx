import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, X, Phone } from 'lucide-react';
import { cn } from '@/shared/utils';
import { SUPPORT_INFO } from '@/shared/mocks';
import { BrandMark } from '@/shared/components/ui/brand-mark';
import { isOnline, useSupportChat } from './useSupportChat';

const time = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

/** Bong bóng hội thoại 3 chấm — cùng hình với bong bóng trong logo */
const BubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M6 3.5h12a3.5 3.5 0 0 1 3.5 3.5v6.5a3.5 3.5 0 0 1-3.5 3.5h-6.2L7 20.5V17H6a3.5 3.5 0 0 1-3.5-3.5V7A3.5 3.5 0 0 1 6 3.5z" fill="currentColor" />
    <g fill="#F26B1D">
      <circle cx="8" cy="10.25" r="1.4" />
      <circle cx="12" cy="10.25" r="1.4" />
      <circle cx="16" cy="10.25" r="1.4" />
    </g>
  </svg>
);

// Vị trí 2 lớp nổi theo việc có thanh điều hướng đáy hay không
const OFFSET = {
  none: { button: 'bottom-5', panel: 'bottom-[5.25rem]' },
  md: { button: 'bottom-20 md:bottom-5', panel: 'bottom-[9rem] md:bottom-[5.25rem]' },
  lg: { button: 'bottom-20 lg:bottom-5', panel: 'bottom-[9rem] lg:bottom-[5.25rem]' },
} as const;

/**
 * Nút chat nổi góc dưới phải + khung hội thoại với tư vấn viên (mock).
 * raised: đẩy lên trên thanh điều hướng đáy (thanh này ẩn từ breakpoint md ở AppShell, lg ở GuestLayout).
 */
export const ChatWidget: React.FC<{ raised?: 'md' | 'lg' }> = ({ raised }) => {
  const offset = OFFSET[raised ?? 'none'];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const { messages, typing, unread, send } = useSupportChat(open);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const online = isOnline();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send(draft);
    setDraft('');
  };

  return (
    <>
      {/* Khung hội thoại */}
      <section
        role="dialog"
        aria-label={SUPPORT_INFO.name}
        className={cn(
          'fixed right-4 sm:right-5 z-50 w-[22.5rem] max-w-[calc(100vw-2rem)] h-[34rem] max-h-[calc(100dvh-8rem)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 origin-bottom-right transition-[opacity,transform] duration-200',
          offset.panel,
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <header className="flex items-center gap-3 bg-slate-900 px-4 py-3 text-white">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-white p-[3px]">
            <BrandMark className="w-full h-full" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-semibold">{SUPPORT_INFO.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={cn('w-1.5 h-1.5 rounded-full', online ? 'bg-emerald-400' : 'bg-amber-400')} />
              {online ? 'Đang trực · trả lời trong 2 phút' : `Ngoài giờ trực · trả lời từ ${SUPPORT_INFO.hours[0]}:00`}
            </p>
          </div>
          <a href={`tel:${SUPPORT_INFO.hotline.replace(/\s/g, '')}`} aria-label="Gọi hotline" className="p-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white">
            <Phone className="w-4 h-4" />
          </a>
          <button onClick={() => setOpen(false)} aria-label="Đóng khung chat" className="p-2 -mr-1 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={cn('flex flex-col', m.from === 'user' ? 'items-end' : 'items-start')}>
              <p
                className={cn(
                  'max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                  m.from === 'user' ? 'rounded-br-md bg-orange-500 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                )}
              >
                {m.text}
              </p>
              {m.links && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.links.map((l) => (
                    <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-orange-600 hover:border-orange-300 hover:bg-orange-50">
                      {l.label} →
                    </Link>
                  ))}
                </div>
              )}
              <span className="mt-1 text-[10px] text-slate-400">{time(m.at)}</span>
            </div>
          ))}

          {messages.length === 1 && !typing && (
            <div className="space-y-1.5 pt-1">
              {SUPPORT_INFO.quickTopics.map((q) => (
                <button key={q.label} onClick={() => send(q.message)} className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-sm text-slate-700 hover:border-orange-300 hover:text-orange-700">
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {typing && (
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3" aria-label="Đang trả lời">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nhập câu hỏi…"
            aria-label="Nội dung tin nhắn"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none"
          />
          <button type="submit" disabled={!draft.trim()} aria-label="Gửi" className="w-10 h-10 shrink-0 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-orange-500">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* Nút mở/đóng */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Đóng khung chat' : 'Mở khung chat hỗ trợ'}
        aria-expanded={open}
        className={cn(
          'fixed right-4 sm:right-5 z-50 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-900/30 flex items-center justify-center transition-transform duration-200 hover:scale-105 hover:bg-orange-600',
          offset.button
        )}
      >
        {open ? <X className="w-6 h-6" /> : <BubbleIcon className="w-7 h-7" />}
        {!open && unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-[11px] font-bold leading-5 ring-2 ring-white">{unread}</span>
        )}
      </button>
    </>
  );
};
