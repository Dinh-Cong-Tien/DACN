import { useCallback, useEffect, useRef, useState } from 'react';
import { catalogApi } from '@/shared/api/catalog';
import { tokenStore } from '@/shared/api/client';

/** Nguồn video của bài: Vimeo / YouTube nhúng iframe, còn lại là file video trực tiếp (<video>) */
export type VideoSource = { kind: 'vimeo' | 'youtube'; id: string } | { kind: 'file'; url: string };

export const videoSource = (url: string): VideoSource => {
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: 'vimeo', id: vimeo[1] };
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: 'youtube', id: yt[1] };
  return { kind: 'file', url };
};

/** Link nhúng, bắt đầu luôn tại vị trí đã xem (start) và bật API postMessage để theo dõi thời gian */
export const embedSrc = (s: VideoSource, start: number): string => {
  if (s.kind === 'file') return s.url;
  if (s.kind === 'vimeo') return `https://player.vimeo.com/video/${s.id}?api=1${start > 0 ? `#t=${start}s` : ''}`;
  return `https://www.youtube.com/embed/${s.id}?enablejsapi=1&rel=0&origin=${encodeURIComponent(window.location.origin)}${start > 0 ? `&start=${start}` : ''}`;
};

const SAVE_EVERY = 10; // giây video giữa 2 lần lưu

/**
 * Lưu & khôi phục vị trí đang xem của video bài giảng (lesson_progress.last_position_sec).
 * - Vào lại bài → phát tiếp từ vị trí cũ.
 * - Lưu mỗi 10 giây xem, khi tạm dừng, khi rời trang / đóng tab (fetch keepalive).
 * - Xem hết video → lưu về 0 để lần sau xem lại từ đầu.
 */
export function useWatchPosition(opts: {
  lessonId: string;
  source: VideoSource | null;
  resumeAt: number;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  onEnded: () => void;
}) {
  const { lessonId, source, resumeAt, iframeRef, videoRef, onEnded } = opts;
  const [position, setPosition] = useState(resumeAt);
  const pos = useRef(resumeAt);
  const saved = useRef(resumeAt);
  const spent = useRef(0);
  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;
  const authed = !!tokenStore.get()?.accessToken;
  const [restarted, setRestarted] = useState(false);
  // mốc thời gian nhận gần nhất từ player — script nội suy giữa 2 sự kiện để chạy mượt theo video
  const clock = useRef({ sec: resumeAt, at: 0, playing: false });

  // vị trí đã lưu đến sau (chi tiết bài tải xong) → đồng bộ để mục lục hiện đúng "đã học tới"
  useEffect(() => {
    pos.current = saved.current = resumeAt;
    setPosition(resumeAt);
  }, [resumeAt]);

  const save = useCallback(
    (beacon = false) => {
      if (!authed) return;
      const positionSec = Math.max(0, Math.floor(pos.current));
      const timeSpentSec = Math.min(6 * 3600, Math.round(spent.current));
      if (positionSec === saved.current && timeSpentSec === 0) return;
      saved.current = positionSec;
      spent.current = 0;
      const body = { action: 'position' as const, positionSec, timeSpentSec };
      if (beacon) {
        // trang đang đóng: axios có thể bị huỷ → dùng fetch keepalive
        const token = tokenStore.get()?.accessToken;
        void fetch(`/api/v1/catalog/lessons/${lessonId}/progress`, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }).catch(() => undefined);
      } else void catalogApi.lessonProgress(lessonId, body).catch(() => undefined);
    },
    [authed, lessonId]
  );

  const tick = useCallback(
    (sec: number) => {
      clock.current = { sec, at: performance.now(), playing: clock.current.playing };
      const d = sec - pos.current;
      if (d > 0 && d < 3) spent.current += d; // chỉ cộng khi đang phát liên tục, không tính lúc tua
      pos.current = sec;
      setPosition(sec);
      if (Math.abs(sec - saved.current) >= SAVE_EVERY) save();
    },
    [save]
  );
  const playing = useCallback((on: boolean) => {
    clock.current = { ...clock.current, playing: on, at: performance.now() };
  }, []);
  const paused = useCallback(() => {
    playing(false);
    save();
  }, [playing, save]);
  const ended = useCallback(() => {
    playing(false);
    pos.current = 0;
    save();
    setPosition(0);
    endedRef.current();
  }, [playing, save]);

  // Vimeo / YouTube: nhận sự kiện thời gian qua postMessage
  useEffect(() => {
    if (!source || source.kind === 'file') return;
    const frame = iframeRef.current;
    const post = (msg: unknown) => frame?.contentWindow?.postMessage(JSON.stringify(msg), '*');
    const subscribe = () => {
      if (source.kind === 'vimeo') ['timeupdate', 'play', 'pause', 'ended'].forEach((value) => post({ method: 'addEventListener', value }));
      else post({ event: 'listening', id: lessonId, channel: 'widget' });
    };
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frame?.contentWindow) return;
      let m: any;
      try {
        m = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (source.kind === 'vimeo') {
        if (m.event === 'ready') subscribe();
        else if (m.event === 'timeupdate') tick(Number(m.data?.seconds) || 0);
        else if (m.event === 'play') playing(true);
        else if (m.event === 'pause') paused();
        else if (m.event === 'ended') ended();
      } else if (m.event === 'infoDelivery' && m.info) {
        if (typeof m.info.currentTime === 'number') tick(m.info.currentTime);
        if (m.info.playerState === 1) playing(true);
        if (m.info.playerState === 2) paused();
        if (m.info.playerState === 0) ended();
      }
    };
    window.addEventListener('message', onMsg);
    frame?.addEventListener('load', subscribe);
    return () => {
      window.removeEventListener('message', onMsg);
      frame?.removeEventListener('load', subscribe);
    };
  }, [source, iframeRef, lessonId, tick, playing, paused, ended]);

  // Rời trang / ẩn tab / chuyển bài → lưu ngay
  useEffect(() => {
    const flush = () => save(true);
    const onHide = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [save]);

  /** Tua tới giây `sec` (nút "Xem lại từ đầu", bấm câu trong script); `play` = phát luôn */
  const seek = (sec: number, play = false) => {
    if (sec === 0) setRestarted(true);
    pos.current = sec;
    clock.current = { sec, at: performance.now(), playing: play || clock.current.playing };
    setPosition(sec);
    const v = videoRef.current;
    if (source?.kind === 'file' && v) {
      v.currentTime = sec;
      if (play) v.play().catch(() => undefined);
    }
    const w = iframeRef.current?.contentWindow;
    const post = (msg: unknown) => w?.postMessage(JSON.stringify(msg), '*');
    if (source?.kind === 'vimeo') {
      post({ method: 'setCurrentTime', value: sec });
      if (play) post({ method: 'play' });
    }
    if (source?.kind === 'youtube') {
      post({ event: 'command', func: 'seekTo', args: [sec, true] });
      if (play) post({ event: 'command', func: 'playVideo', args: [] });
    }
    save();
  };

  /**
   * Thời điểm video đang phát (giây), đọc trong requestAnimationFrame.
   * File video: đọc thẳng currentTime. Vimeo / YouTube: mốc gần nhất + thời gian trôi kể từ đó
   * (tối đa 1 giây, phòng mất sự kiện pause) → script đổi câu đúng lúc, không trễ theo nhịp sự kiện.
   */
  const now = useCallback(() => {
    const v = videoRef.current;
    if (source?.kind === 'file' && v) return v.currentTime;
    const c = clock.current;
    return c.playing && c.at ? c.sec + Math.min(1, (performance.now() - c.at) / 1000) : c.sec;
  }, [source, videoRef]);

  /** Props cho thẻ <video> (file trực tiếp) */
  const videoProps = {
    onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const v = e.currentTarget;
      if (resumeAt > 0 && resumeAt < v.duration - 3) v.currentTime = resumeAt;
    },
    onTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => tick(e.currentTarget.currentTime),
    onPlay: () => playing(true),
    onPause: paused,
    onEnded: ended,
  };

  return { position, seek, now, videoProps, restarted };
}
