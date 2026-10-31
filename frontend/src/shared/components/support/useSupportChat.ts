import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatLink, ChatMessage } from '@/shared/types';
import { SUPPORT_CONTACT_ACK, SUPPORT_CONTACT_ACK_OFFLINE, SUPPORT_FALLBACK, SUPPORT_GREETING, SUPPORT_INFO, SUPPORT_REPLIES } from '@/shared/mocks';

const STORAGE_KEY = 'orbi-support-chat';
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

const pickReply = (text: string): { texts: string[]; agentId: string; links?: ChatLink[] } => {
  if (PHONE.test(text.replace(/[\s.-]/g, '')) || EMAIL.test(text)) return { texts: isOnline() ? SUPPORT_CONTACT_ACK : SUPPORT_CONTACT_ACK_OFFLINE, agentId: DEFAULT_AGENT };
  const t = normalize(text);
  const r = SUPPORT_REPLIES.find((x) => x.keywords.some((k) => t.includes(` ${k} `)));
  return r ? { texts: r.texts, agentId: r.agentId ?? DEFAULT_AGENT, links: r.links } : { texts: SUPPORT_FALLBACK, agentId: DEFAULT_AGENT };
};

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
 * State hội thoại hỗ trợ (mock): lưu theo phiên; mỗi câu trả lời gồm nhiều bóng tin gửi lần lượt,
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

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, makeMsg({ from: 'user', text })]);
    const reply = pickReply(text);
    const agent = agentOf(reply.agentId);
    // nối tiếp sau câu trả lời trước nếu đang trả lời dở
    let t = Math.max(Date.now(), busyUntil.current) - Date.now() + 900;
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
