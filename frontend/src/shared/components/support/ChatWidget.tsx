import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Phone, SendHorizontal, X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { SUPPORT_INFO } from '@/shared/mocks';
import type { ChatMessage } from '@/shared/types';
import { agentOf, isOnline, useSupportChat } from './useSupportChat';
import './ChatWidget.css';

const TEASER_KEY = 'orbi-support-teaser-seen';
const time = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const readFlag = () => {
  try {
    return sessionStorage.getItem(TEASER_KEY) === '1';
  } catch {
    return false;
  }
};
const writeFlag = () => {
  try {
    sessionStorage.setItem(TEASER_KEY, '1');
  } catch {
    /* bỏ qua */
  }
};

// Vị trí 2 lớp nổi theo việc có thanh điều hướng đáy hay không
const OFFSET = {
  none: { button: 'bottom-5', panel: 'bottom-[5.25rem]' },
  md: { button: 'bottom-20 md:bottom-5', panel: 'bottom-[9rem] md:bottom-[5.25rem]' },
  lg: { button: 'bottom-20 lg:bottom-5', panel: 'bottom-[9rem] lg:bottom-[5.25rem]' },
} as const;

const Avatar: React.FC<{ id?: string; className?: string }> = ({ id, className }) => {
  const a = agentOf(id);
  return <img src={a.avatar} alt={a.name} className={cn('shrink-0 rounded-full object-cover bg-slate-200', className)} />;
};

/** Gom các tin liên tiếp cùng người gửi thành một nhóm (tên ở đầu nhóm, avatar + giờ ở cuối nhóm) */
const groupMessages = (list: ChatMessage[]) =>
  list.reduce<ChatMessage[][]>((groups, m) => {
    const last = groups[groups.length - 1];
    if (last && m.from !== 'system' && last[0].from === m.from && last[0].agentId === m.agentId) last.push(m);
    else groups.push([m]);
    return groups;
  }, []);

const ChatGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path fill="currentColor" d="M12 3C6.7 3 2.5 6.8 2.5 11.5c0 2.4 1.1 4.6 2.9 6.1-.2 1.3-.8 2.5-1.7 3.4 2.1-.1 3.9-.9 5.1-1.8 1 .3 2.1.5 3.2.5 5.3 0 9.5-3.8 9.5-8.2S17.3 3 12 3z" />
  </svg>
);

type Channel = { key: string; title: string; sub: string; icon: React.ReactNode; href?: string; external?: boolean; onClick?: () => void };

/**
 * Nút liên hệ nổi góc dưới phải: bấm để bung 3 kênh (Zalo · Chat trên web · Gọi), chọn "Chat" mở khung hội thoại (mock).
 * raised: đẩy lên trên thanh điều hướng đáy (thanh này ẩn từ breakpoint md ở AppShell, lg ở GuestLayout).
 * preferChat: đưa "Chat trên web" lên đầu (học viên đã đăng nhập thường hỏi về bài học/tài khoản).
 */
export const ChatWidget: React.FC<{ raised?: 'md' | 'lg'; preferChat?: boolean }> = ({ raised, preferChat }) => {
  const offset = OFFSET[raised ?? 'none'];
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [teaserReady, setTeaserReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const { messages, typingAgent, unread, send } = useSupportChat(open);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const online = isOnline();
  const groups = groupMessages(messages);
  const lastUserIdx = messages.map((m) => m.from).lastIndexOf('user');
  const seen = lastUserIdx >= 0 && (typingAgent !== null || messages.slice(lastUserIdx + 1).some((m) => m.from !== 'user'));
  const onlyGreeting = messages.every((m) => m.from === 'agent');
  // Chỉ tin đến sau khi mở trang mới có hiệu ứng trượt vào (tin khôi phục từ phiên trước thì không)
  const initialCount = useRef(messages.length);
  const isNew = (id: string) => messages.findIndex((m) => m.id === id) >= initialCount.current;

  // Lời mời bật lên sau vài giây nếu phiên này chưa mở chat
  useEffect(() => {
    if (readFlag()) return;
    const t = window.setTimeout(() => setTeaser(true), 6000);
    // hiện "đang soạn tin" một lúc rồi mới ra nội dung lời mời
    const t2 = window.setTimeout(() => setTeaserReady(true), 7400);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typingAgent, open]);

  useEffect(() => {
    if (!open) return;
    setTeaser(false);
    writeFlag();
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Menu kênh: đóng khi bấm ra ngoài hoặc Esc
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => !rootRef.current?.contains(e.target as Node) && setMenu(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const submit = () => {
    send(draft);
    setDraft('');
  };

  const openChat = (prefill?: string) => {
    setMenu(false);
    setOpen(true);
    if (prefill) setDraft(prefill);
  };

  const zalo: Channel = {
    key: 'zalo',
    title: 'Nhắn Zalo',
    sub: 'Nhắn và nhận trả lời qua app',
    href: SUPPORT_INFO.zaloUrl,
    external: true,
    icon: <span className="text-[11px] font-bold tracking-tight">Zalo</span>,
  };
  const chat: Channel = { key: 'chat', title: 'Chat trên web', sub: online ? SUPPORT_INFO.replyTime : 'Để lại tin, sáng mai trả lời', onClick: () => openChat(), icon: <ChatGlyph className="w-5 h-5" /> };
  const call: Channel = online
    ? { key: 'call', title: `Gọi ${SUPPORT_INFO.hotline}`, sub: `${SUPPORT_INFO.hours[0]}:00–${SUPPORT_INFO.hours[1]}:00 hằng ngày`, href: `tel:${SUPPORT_INFO.hotline.replace(/\s/g, '')}`, icon: <Phone className="w-[18px] h-[18px]" /> }
    : { key: 'call', title: 'Để lại số điện thoại', sub: 'Sáng mai tư vấn viên gọi lại', onClick: () => openChat('Số điện thoại của mình: '), icon: <Phone className="w-[18px] h-[18px]" /> };
  const channels = preferChat ? [chat, zalo, call] : [zalo, chat, call];
  const ICON_BG: Record<string, string> = { zalo: 'bg-[#0068FF]', chat: 'bg-[#1D5FC0]', call: 'bg-[#1F9D55]' };

  return (
    <div ref={rootRef}>
      {/* Menu kênh liên hệ */}
      <div
        role="menu"
        aria-label="Chọn cách liên hệ"
        className={cn(
          'support-chat__menu fixed right-4 sm:right-5 z-50 w-[17.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.25)] origin-bottom-right',
          offset.panel,
          menu && !open ? 'is-open' : 'pointer-events-none'
        )}
      >
        <p className="px-4 pt-3 pb-1 text-[12px] text-slate-500">Bạn muốn liên hệ qua đâu?</p>
        {channels.map((c, i) => {
          const body = (
            <>
              <span className={cn('support-chat__icon w-10 h-10 shrink-0 rounded-full text-white flex items-center justify-center', ICON_BG[c.key])}>{c.icon}</span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[14px] font-medium text-slate-900">{c.title}</span>
                <span className="block truncate text-[12px] text-slate-500">{c.sub}</span>
              </span>
            </>
          );
          const cls = 'support-chat__item flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus:outline-none';
          const style = { '--i': i } as React.CSSProperties;
          return c.href ? (
            <a key={c.key} role="menuitem" href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noopener noreferrer' : undefined} onClick={() => setMenu(false)} className={cls} style={style}>
              {body}
            </a>
          ) : (
            <button key={c.key} role="menuitem" onClick={c.onClick} className={cls} style={style}>
              {body}
            </button>
          );
        })}
        <div className="h-1.5" />
      </div>

      {/* Khung hội thoại */}
      <section
        role="dialog"
        aria-label={SUPPORT_INFO.team}
        className={cn(
          'support-chat fixed right-4 sm:right-5 z-50 w-[23rem] max-w-[calc(100vw-2rem)] h-[36rem] max-h-[calc(100dvh-8rem)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_48px_rgba(15,23,42,0.28)] origin-bottom-right',
          offset.panel,
          open ? 'is-open' : 'pointer-events-none'
        )}
      >
        <header className="support-chat__head px-4 pt-4 pb-3 text-white">
          <div className="flex items-start justify-between">
            <div className="flex -space-x-2">
              {SUPPORT_INFO.agents.map((a, i) => (
                <span key={`${a.id}-${open}`} className="support-chat__ava" style={{ '--i': i } as React.CSSProperties}>
                  <Avatar id={a.id} className="w-9 h-9 ring-2 ring-[#1D5FC0]" />
                </span>
              ))}
            </div>
            <div className="flex -mr-1.5">
              <a href={`tel:${SUPPORT_INFO.hotline.replace(/\s/g, '')}`} aria-label="Gọi hotline" className="p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white">
                <Phone className="w-[18px] h-[18px]" />
              </a>
              <button onClick={() => setOpen(false)} aria-label="Thu nhỏ khung chat" className="p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="mt-2.5 font-semibold text-[15px]">{SUPPORT_INFO.team}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-white/75">
            {online ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#3DDC84]" /> {SUPPORT_INFO.replyTime}
              </>
            ) : (
              `Ngoài giờ làm việc · trả lời từ ${SUPPORT_INFO.hours[0]}:00 sáng mai`
            )}
          </p>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
          <p className="mb-3 text-center text-[11px] text-slate-400">Hôm nay</p>

          {groups.map((g) => {
            const first = g[0];
            if (first.from === 'system')
              return (
                <p key={first.id} className={cn('my-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500', isNew(first.id) && 'support-chat__fade')}>
                  <Avatar id={first.agentId} className="w-4 h-4" />
                  {first.text}
                </p>
              );
            const mine = first.from === 'user';
            const lastMsg = g[g.length - 1];
            return (
              <div key={first.id} className={cn('mb-3 flex items-end gap-2', mine && 'justify-end')}>
                {!mine && <Avatar id={first.agentId} className="w-7 h-7 mb-5" />}
                <div className={cn('flex max-w-[78%] flex-col gap-0.5', mine ? 'items-end' : 'items-start')}>
                  {!mine && <span className="mb-0.5 ml-1 text-[11px] text-slate-500">{agentOf(first.agentId).name}</span>}
                  {g.map((m, i) => (
                    <React.Fragment key={m.id}>
                      <p
                        className={cn(
                          'support-chat__bubble whitespace-pre-line px-3 py-2 text-[14px] leading-[1.45]',
                          mine ? 'support-chat__bubble--mine bg-[#1D5FC0] text-white' : 'bg-[#F0F2F5] text-[#1c1e21]',
                          i === 0 && 'is-first',
                          i === g.length - 1 && 'is-last',
                          isNew(m.id) && 'is-new'
                        )}
                      >
                        {m.text}
                      </p>
                      {m.links && (
                        <div className={cn('mt-1 flex flex-col gap-1 self-stretch', isNew(m.id) && 'support-chat__fade support-chat__fade--late')}>
                          {m.links.map((l) => (
                            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl border border-[#1D5FC0]/25 px-3 py-1.5 text-center text-[13px] font-medium text-[#1D5FC0] hover:bg-[#1D5FC0]/5">
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  <span className={cn('mt-0.5 text-[11px] text-slate-400', mine ? 'mr-1' : 'ml-1')}>
                    {time(lastMsg.at)}
                    {mine && lastMsg.id === messages[lastUserIdx]?.id && <> · {seen ? 'Đã xem' : 'Đã gửi'}</>}
                  </span>
                </div>
              </div>
            );
          })}

          {onlyGreeting && !typingAgent && (
            <div className="mb-3 flex flex-wrap justify-end gap-1.5 pl-8">
              {SUPPORT_INFO.quickTopics.map((q, i) => (
                <button key={`${q.label}-${open}`} onClick={() => send(q.message)} style={{ '--i': i } as React.CSSProperties} className="support-chat__chip rounded-2xl border border-[#1D5FC0]/40 px-3 py-1.5 text-[13px] text-[#1D5FC0] hover:bg-[#1D5FC0] hover:text-white transition-colors">
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {typingAgent && (
            <div className="support-chat__fade mb-3 flex items-end gap-2" aria-label={`${agentOf(typingAgent).name} đang soạn tin`}>
              <Avatar id={typingAgent} className="w-7 h-7" />
              <div className="support-chat__typing flex items-center gap-1 rounded-2xl bg-[#F0F2F5] px-3.5 py-3">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="border-t border-slate-200 px-3 pt-2 pb-2.5"
        >
          <div className="flex items-end gap-1.5">
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Nhập tin nhắn…"
              aria-label="Nội dung tin nhắn"
              className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-1.5 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Gửi" className="mb-0.5 w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[#1D5FC0] transition-[color,transform] duration-150 hover:bg-[#1D5FC0]/10 enabled:active:scale-90 disabled:text-slate-300 disabled:hover:bg-transparent">
              <SendHorizontal className="w-5 h-5" />
            </button>
          </div>
          <p className="px-1.5 text-[11px] text-slate-400">
            Hotline {SUPPORT_INFO.hotline} · {SUPPORT_INFO.hours[0]}:00–{SUPPORT_INFO.hours[1]}:00 hằng ngày
          </p>
        </form>
      </section>

      {/* Lời mời bật lên cạnh nút chat */}
      {teaser && !open && !menu && (
        <div className={cn('support-chat__teaser fixed right-4 sm:right-5 z-50 w-[17rem] max-w-[calc(100vw-6rem)]', offset.panel)}>
          <button
            onClick={() => {
              setTeaser(false);
              writeFlag();
            }}
            aria-label="Ẩn lời mời"
            className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white text-slate-500 shadow ring-1 ring-slate-200 flex items-center justify-center hover:text-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setOpen(true)} className="flex w-full items-start gap-2.5 rounded-2xl bg-white p-3 text-left shadow-[0_8px_30px_rgba(15,23,42,0.22)]">
            <Avatar className="w-9 h-9" />
            <span className="text-[13px] leading-snug text-slate-700">
              <span className="block text-[11px] text-slate-500">{agentOf().name} · OrbiLingo</span>
              {teaserReady ? (
                <span className="support-chat__fade block">{SUPPORT_INFO.teaser}</span>
              ) : (
                <span className="support-chat__typing mt-1.5 flex w-fit items-center gap-1 rounded-full bg-[#F0F2F5] px-2.5 py-2" aria-label="Đang soạn tin">
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </span>
          </button>
        </div>
      )}

      {/* Nút chính: đóng khung chat nếu đang mở, nếu không thì bung/thu menu kênh */}
      <button
        onClick={() => (open ? setOpen(false) : setMenu((m) => !m))}
        aria-label={open ? 'Thu nhỏ khung chat' : menu ? 'Đóng menu liên hệ' : 'Liên hệ tư vấn'}
        aria-haspopup="menu"
        aria-expanded={open || menu}
        className={cn(
          'support-chat__launcher fixed right-4 sm:right-5 z-50 w-14 h-14 rounded-full bg-[#1D5FC0] text-white shadow-[0_6px_20px_rgba(29,95,192,0.45)] flex items-center justify-center transition-[transform,background-color,box-shadow] duration-200 hover:bg-[#174EA0] hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(29,95,192,0.5)] active:scale-95',
          offset.button,
          teaser && !open && !menu && 'is-nudge'
        )}
      >
        <ChatGlyph className={cn('absolute w-7 h-7 transition-all duration-200', open || menu ? 'opacity-0 rotate-90 scale-50' : 'opacity-100')} />
        <X className={cn('absolute w-6 h-6 transition-all duration-200', menu && !open ? 'opacity-100' : 'opacity-0 -rotate-90 scale-50')} />
        <ChevronDown className={cn('absolute w-7 h-7 transition-all duration-200', open ? 'opacity-100' : 'opacity-0 -rotate-90 scale-50')} />
        {!open && unread > 0 && (
          <span key={unread} className="support-chat__badge absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#E41E3F] text-[11px] font-semibold leading-5 ring-2 ring-white">{unread}</span>
        )}
      </button>
    </div>
  );
};
