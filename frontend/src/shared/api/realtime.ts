import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { MockTestSummary } from '@/shared/types';

/** Sự kiện máy chủ đẩy qua WebSocket /api/ws (khớp backend/src/lib/realtime.ts) */
type RealtimeEvent = { type: 'test.attempts'; testId: string; slug: string; attempts: number };

/**
 * Kết nối WebSocket dùng chung cả app: nhận số liệu công khai mới và cập nhật thẳng vào cache React Query,
 * nên thẻ đề, trang chi tiết đề… đổi số ngay mà không cần F5. Mất kết nối → tự nối lại (lùi dần tới 30 giây).
 */
export function useRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const apply = (e: RealtimeEvent) => {
      if (e.type !== 'test.attempts') return;
      const same = (t: Pick<MockTestSummary, 'id' | 'slug'>) => t.id === e.testId || t.id === e.slug || t.slug === e.slug;
      qc.setQueriesData<MockTestSummary[]>({ queryKey: ['catalog', 'tests'] }, (list) => (Array.isArray(list) ? list.map((t) => (same(t) ? { ...t, attempts: e.attempts } : t)) : list));
      qc.setQueriesData<MockTestSummary>({ queryKey: ['catalog', 'test'] }, (t) => (t && !Array.isArray(t) && same(t) ? { ...t, attempts: e.attempts } : t));
    };

    const connect = () => {
      if (stopped) return;
      const envApi = import.meta.env.VITE_API_BASE_URL;
      let wsUrl: string;
      if (envApi && envApi.startsWith('http')) {
        const u = new URL(envApi);
        const wsProto = u.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${wsProto}//${u.host}/api/ws`;
      } else {
        wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws'}://${location.host}/api/ws`;
      }
      ws = new WebSocket(wsUrl);
      ws.onopen = () => (retry = 0);
      ws.onmessage = (m) => {
        try {
          apply(JSON.parse(String(m.data)) as RealtimeEvent);
        } catch {
          /* bỏ qua tin không hợp lệ */
        }
      };
      ws.onclose = () => {
        if (stopped) return;
        timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** retry++));
      };
    };
    connect();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      ws?.close();
    };
  }, [qc]);
}
