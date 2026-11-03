/**
 * Đa ngôn ngữ (i18n) — tách riêng khỏi component, tự kết nối:
 * - Mỗi ngôn ngữ là 1 file trong ./locales (vi.ts, en.ts…). File mới tự được nạp (import.meta.glob) và tự hiện trong nút chọn ngôn ngữ.
 * - Khoá dịch chính là câu tiếng Việt gốc (ngôn ngữ nguồn) → cấu hình menu, nhãn giữ nguyên, chỉ cần hiển thị qua t().
 * - Câu có phần động dùng mẫu {tên}: 'Có {n} học viên' khớp cả chuỗi đã ghép sẵn 'Có 12 học viên'.
 * - Chưa có bản dịch → hiện câu gốc (không bao giờ hiện khoá rỗng).
 */
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocaleDef {
  /** Mã ngôn ngữ BCP-47, gắn vào <html lang> */
  code: string;
  /** Tên hiển thị bằng chính ngôn ngữ đó */
  name: string;
  /** Nhãn ngắn trên nút chọn */
  short: string;
  /** Câu gốc tiếng Việt → bản dịch (ngôn ngữ nguồn để trống) */
  messages: Record<string, string>;
}

const modules = import.meta.glob<{ default: LocaleDef }>('./locales/*.ts', { eager: true });
export const LOCALES: LocaleDef[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (a.code === 'vi' ? -1 : b.code === 'vi' ? 1 : a.name.localeCompare(b.name)));
const BY_CODE = new Map(LOCALES.map((l) => [l.code, l]));
export const SOURCE_LANG = 'vi';

interface LangState {
  lang: string;
  setLang: (lang: string) => void;
}
export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: SOURCE_LANG,
      setLang: (lang) => set({ lang: BY_CODE.has(lang) ? lang : SOURCE_LANG }),
    }),
    { name: 'orbi-lang' }
  )
);

// ---------- tra cứu ----------
type Pattern = { re: RegExp; names: string[]; out: string };
const patternCache = new Map<string, Pattern[]>();
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Các khoá có {biến} → biểu thức chính quy để khớp chuỗi đã ghép sẵn */
function patternsOf(locale: LocaleDef): Pattern[] {
  let list = patternCache.get(locale.code);
  if (list) return list;
  list = Object.entries(locale.messages)
    .filter(([k]) => /\{\w+\}/.test(k))
    .map(([k, out]) => {
      const names: string[] = [];
      const re = new RegExp('^' + k.split(/(\{\w+\})/).map((part) => {
        const m = /^\{(\w+)\}$/.exec(part);
        if (!m) return escapeRe(part);
        names.push(m[1]);
        return '(.+?)';
      }).join('') + '$');
      return { re, names, out };
    });
  patternCache.set(locale.code, list);
  return list;
}

const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`)) : s);

/** Dịch 1 câu theo ngôn ngữ chỉ định (dùng được ngoài React) */
export function translate(lang: string, text: string | null | undefined, vars?: Record<string, string | number>): string {
  if (!text) return text ?? '';
  const locale = BY_CODE.get(lang);
  if (!locale || lang === SOURCE_LANG) return fill(text, vars);
  const hit = locale.messages[text];
  if (hit !== undefined) return fill(hit, vars);
  for (const p of patternsOf(locale)) {
    const m = p.re.exec(text);
    if (m) return p.out.replace(/\{(\w+)\}/g, (_, k) => m[p.names.indexOf(k) + 1] ?? `{${k}}`);
  }
  return fill(text, vars);
}

/** Hook dịch: const t = useT(); t('Tổng quan') */
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return useCallback((text: string | null | undefined, vars?: Record<string, string | number>) => translate(lang, text, vars), [lang]);
}

/** Ngôn ngữ hiện tại + đổi ngôn ngữ */
export function useLang() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return { lang, setLang, locale: BY_CODE.get(lang) ?? BY_CODE.get(SOURCE_LANG)!, locales: LOCALES };
}

/** Gắn <html lang>; đặt một lần ở gốc ứng dụng */
export function useApplyLang() {
  const lang = useLangStore((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}
