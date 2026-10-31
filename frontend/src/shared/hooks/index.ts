import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

/** Theo dõi phần tử xuất hiện trong viewport (dùng cho scroll reveal) */
export function useInView<T extends HTMLElement = HTMLDivElement>(options?: IntersectionObserverInit & { once?: boolean }) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const once = options?.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) obs.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}

/** Đếm số tăng dần (animated counter) */
export function useCountUp(target: number, durationMs = 1200, start = true): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, start]);
  return value;
}

export function useDisclosure(initial = false) {
  const [isOpen, setOpen] = useState(initial);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  return { isOpen, open, close, toggle, setOpen };
}

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key]
  );
  return [value, set];
}

/** Đếm ngược theo giây */
export function useCountdown(initialSec: number, onFinish?: () => void, running = true) {
  const [remaining, setRemaining] = useState(initialSec);
  const finishedRef = useRef(false);
  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish?.();
      }
      return;
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, running, onFinish]);
  return remaining;
}

export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/** Giả lập loading mock data: trả về true trong `ms` đầu tiên */
export function useMockLoading(ms = 500): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return loading;
}

/**
 * Cổng đăng nhập cho link trên trang công khai:
 * đã đăng nhập → đi thẳng vào tính năng; chưa → tới trang đăng nhập (nhớ đích đến).
 */
export function useGate() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  return (appPath: string, fallback = '/auth/login') => (isAuth ? appPath : `${fallback}?next=${encodeURIComponent(appPath)}`);
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · OrbiLingo`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}

/**
 * State đồng bộ với query string (?key=value) để link từ menu mở đúng tab, vd. /mock-tests?exam=VSTEP.
 * Giá trị không hợp lệ → fallback; chọn lại fallback thì xoá tham số khỏi URL.
 */
export function useParamState<T extends string>(key: string, allowed: readonly T[], fallback: T): [T, (v: string) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key);
  const value = raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
  const set = (v: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (v === fallback) next.delete(key);
        else next.set(key, v);
        return next;
      },
      { replace: true }
    );
  return [value, set];
}
