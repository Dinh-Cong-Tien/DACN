import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, SupportReply } from '@/shared/types';
import { SUPPORT_CONTACT_ACK, SUPPORT_FALLBACK, SUPPORT_GREETING, SUPPORT_INFO, SUPPORT_REPLIES } from '@/shared/mocks';

const STORAGE_KEY = 'orbi-support-chat';

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

const pickReply = (text: string): Pick<SupportReply, 'text' | 'links'> => {
  if (PHONE.test(text.replace(/[\s.-]/g, '')) || EMAIL.test(text)) return { text: SUPPORT_CONTACT_ACK };
  const t = normalize(text);
  return SUPPORT_REPLIES.find((r) => r.keywords.some((k) => t.includes(` ${k} `))) ?? { text: SUPPORT_FALLBACK };
};

const makeMsg = (from: ChatMessage['from'], text: string, links?: ChatMessage['links']): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  from,
  text,
  at: new Date().toISOString(),
  links,
});

const load = (): ChatMessage[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch {
    /* bộ nhớ phiên bị chặn: bắt đầu hội thoại mới */
  }
  return [makeMsg('agent', SUPPORT_GREETING)];
};

/** Đang trong giờ trực theo giờ Việt Nam (UTC+7) */
export const isOnline = (now = new Date()) => {
  const h = (now.getUTCHours() + 7) % 24;
  return h >= SUPPORT_INFO.hours[0] && h < SUPPORT_INFO.hours[1];
};

/** State hội thoại hỗ trợ (mock): lưu theo phiên, trả lời theo từ khoá sau một khoảng "đang gõ" */
export function useSupportChat(open: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>(load);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const openRef = useRef(open);
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

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, makeMsg('user', text)]);
    setTyping(true);
    const reply = pickReply(text);
    const delay = 700 + Math.min(reply.text.length * 6, 1300);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, makeMsg('agent', reply.text, reply.links)]);
      if (!openRef.current) setUnread((u) => u + 1);
    }, delay);
  }, []);

  return { messages, typing, unread, send };
}
