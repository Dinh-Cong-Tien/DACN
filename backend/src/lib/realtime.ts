import type { Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from './logger';

/**
 * Kênh WebSocket công khai (ws://<host>/api/ws): máy chủ đẩy sự kiện số liệu công khai tới mọi trình duyệt đang mở,
 * vd. số lượt làm của đề thi vừa thay đổi. Chỉ chiều máy chủ → trình duyệt, không nhận lệnh, không dữ liệu cá nhân.
 */
export type RealtimeEvent = { type: 'test.attempts'; testId: string; slug: string; attempts: number };

let wss: WebSocketServer | null = null;

export function attachRealtime(server: Server) {
  wss = new WebSocketServer({ server, path: '/api/ws' });
  const alive = new WeakMap<WebSocket, boolean>();
  wss.on('connection', (ws) => {
    alive.set(ws, true);
    ws.on('pong', () => alive.set(ws, true));
    ws.on('message', () => undefined); // bỏ qua mọi tin gửi lên
  });
  // Nhịp kiểm tra 30 giây: đóng kết nối chết để không gửi vào socket treo
  const beat = setInterval(() => {
    wss?.clients.forEach((ws) => {
      if (!alive.get(ws)) return ws.terminate();
      alive.set(ws, false);
      ws.ping();
    });
  }, 30_000);
  wss.on('close', () => clearInterval(beat));
  logger.info('Realtime WebSocket ready at /api/ws');
}

export function broadcast(event: RealtimeEvent) {
  if (!wss) return;
  const msg = JSON.stringify(event);
  wss.clients.forEach((ws) => ws.readyState === WebSocket.OPEN && ws.send(msg));
}
