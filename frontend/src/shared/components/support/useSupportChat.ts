import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatLink, ChatMessage, SupportReply } from '@/shared/types';
import { SUPPORT_CONTACT_ACK, SUPPORT_CONTACT_ACK_OFFLINE, SUPPORT_FALLBACK, SUPPORT_GREETING, SUPPORT_INFO } from '@/shared/constants/public';
import { cmsApi } from '@/shared/api/cms';
import { tokenStore } from '@/shared/api/client';

const STORAGE_KEY = 'orbi-support-chat';
const TICKET_KEY = 'orbi-support-ticket';
const DEFAULT_AGENT = SUPPORT_INFO.agents[0].id;

/** Bỏ dấu tiếng Việt, chữ thường, bỏ dấu câu để so khớp từ khoá */
const normalize = (s: string) =>
  ` ${s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;

const PHONE = /(?:\+?84|0)\d{9,10}/;
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;

/** Đang trong giờ trực theo giờ Việt Nam (UTC+7) */
export const isOnline = (now = new Date()) => {
  const h = (now.getUTCHours() + 7) % 24;
  return h >= SUPPORT_INFO.hours[0] && h < SUPPORT_INFO.hours[1];
};

export const agentOf = (id?: string) => SUPPORT_INFO.agents.find((a) => a.id === id) ?? SUPPORT_INFO.agents[0];

type Reply = { texts: string[]; agentId: string; links?: ChatLink[] };

/** Câu trả lời mẫu lấy từ bảng faqs (show_in_chat), tải một lần */
let repliesCache: Promise<SupportReply[]> | null = null;
const loadReplies = () => (repliesCache ??= cmsApi.supportReplies().catch(() => ((repliesCache = null), [])));

const ticketId = {
  get: () => {
    try {
      return sessionStorage.getItem(TICKET_KEY) ?? undefined;
    } catch {
      return undefined;
    }
  },
  set: (id: string) => {
    try {
      sessionStorage.setItem(TICKET_KEY, id);
    } catch {
      /* bỏ qua */
    }
  },
};

const ack = () => (isOnline() ? SUPPORT_CONTACT_ACK : SUPPORT_CONTACT_ACK_OFFLINE);

/** Khớp câu trả lời mẫu theo từ khoá (không dấu) */
const matchLocal = (replies: SupportReply[], text: string): Reply => {
  const t = normalize(text);
  const r = replies.find((x) => x.keywords.some((k) => t.includes(normalize(k))));
  return r ? { texts: r.texts, agentId: r.agentId ?? DEFAULT_AGENT, links: r.links } : { texts: SUPPORT_FALLBACK, agentId: DEFAULT_AGENT };
};

/**
 * Lấy câu trả lời cho một tin nhắn:
 * - Đã đăng nhập, hoặc đã có cuộc trò chuyện, hoặc khách để lại email → lưu vào ticket (admin xem ở mục Hỗ trợ học viên), bot trả lời theo FAQ.
 * - Khách chưa để lại email → trả lời theo FAQ tại chỗ; để lại số điện thoại thì xin thêm email để lưu yêu cầu.
 */
async function pickReply(text: string, history: string[]): Promise<Reply> {
  const email = text.match(EMAIL)?.[0];
  const phone = PHONE.test(text.replace(/[\s.-]/g, ''));
  const loggedIn = !!tokenStore.get();
  const tid = ticketId.get();
  if (loggedIn || tid || email) {
    try {
      // tin đầu tiên của khách: gửi kèm các câu đã hỏi trước đó để nhân viên nắm ngữ cảnh
      const body = !tid && !loggedIn && history.length ? [...history, text].join(' / ') : text;
      const r = await cmsApi.supportSend({ ticketId: tid, text: body, email: loggedIn ? undefined : email });
      ticketId.set(r.ticketId);
      if (email || phone) return { texts: ack(), agentId: DEFAULT_AGENT };
      return r.reply ? { texts: r.reply.texts, agentId: r.reply.agentId ?? DEFAULT_AGENT, links: r.reply.links } : { texts: SUPPORT_FALLBACK, agentId: DEFAULT_AGENT };
    } catch {
      /* mất kết nối: vẫn trả lời theo FAQ đã tải */
    }
  }
  if (phone) return { texts: ['Dạ mình nhận được số điện thoại rồi ạ.', 'Bạn để lại thêm email giúp mình để bên mình lưu yêu cầu và gọi lại cho bạn nha.'], agentId: DEFAULT_AGENT };
  return matchLocal(await loadReplies(), text);
}

const makeMsg = (m: Omit<ChatMessage, 'id' | 'at'>): ChatMessage => ({ ...m, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString() });

const load = (): ChatMessage[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch {
    /* bộ nhớ phiên bị chặn: bắt đầu hội thoại mới */
  }
  return SUPPORT_GREETING.map((text) => makeMsg({ from: 'agent', agentId: DEFAULT_AGENT, text }));
};

/** Thời gian "gõ" một bóng tin: theo độ dài, có dao động nhẹ cho tự nhiên */
const typingMs = (text: string) => 600 + Math.min(text.length * 28, 2600) + Math.random() * 400;

/**
 * State hội thoại hỗ trợ: lưu theo phiên; mỗi câu trả lời gồm nhiều bóng tin gửi lần lượt,
 * có thông báo khi người khác (cố vấn, kỹ thuật) tham gia.
 */
export function useSupportChat(open: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>(load);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const openRef = useRef(open);
  const timers = useRef<number[]>([]);
  const busyUntil = useRef(0);
  const joined = useRef<Set<string> | null>(null);
  // những người đã có mặt trong hội thoại (khôi phục từ phiên trước) thì không báo "tham gia" lại
  if (!joined.current) joined.current = new Set([DEFAULT_AGENT, ...messages.flatMap((m) => (m.agentId ? [m.agentId] : []))]);
  openRef.current = open;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* bỏ qua khi không ghi được */
    }
  }, [messages]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const history = useRef<string[]>([]);
  useEffect(() => {
    void loadReplies();
  }, []);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, makeMsg({ from: 'user', text })]);
    const sentAt = Date.now();
    const reply = await pickReply(text, history.current);
    history.current.push(text);
    const agent = agentOf(reply.agentId);
    // nối tiếp sau câu trả lời trước nếu đang trả lời dở
    let t = Math.max(Date.now(), busyUntil.current) - Date.now() + Math.max(200, 900 - (Date.now() - sentAt));
    if (!joined.current?.has(agent.id)) {
      joined.current?.add(agent.id);
      later(t, () => setMessages((m) => [...m, makeMsg({ from: 'system', agentId: agent.id, text: `${agent.name} · ${agent.role} đã tham gia cuộc trò chuyện` })]));
      t += 700;
    }
    reply.texts.forEach((txt, i) => {
      const last = i === reply.texts.length - 1;
      later(t, () => setTypingAgent(agent.id));
      t += typingMs(txt);
      later(t, () => {
        setTypingAgent(last ? null : agent.id);
        setMessages((m) => [...m, makeMsg({ from: 'agent', agentId: agent.id, text: txt, links: last ? reply.links : undefined })]);
        if (!openRef.current) setUnread((u) => u + 1);
      });
      t += 250;
    });
    busyUntil.current = Date.now() + t;
  }, []);

  return { messages, typingAgent, unread, send };
}
