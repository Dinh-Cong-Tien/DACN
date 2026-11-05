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
import { applyDomLang } from './dom';

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
type Pattern = { re: RegExp; names: string[]; out: string; literal: number };
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
      // độ cụ thể = số ký tự cố định (không tính biến) → mẫu cụ thể hơn được thử trước
      return { re, names, out, literal: k.replace(/\{\w+\}/g, '').replace(/\s+/g, '').length };
    })
    .filter((p) => p.literal >= 2)
    .sort((x, y) => y.literal - x.literal);
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

// ---------- tra cứu cho tầng dịch toàn trang (dom.ts) ----------
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const normCache = new Map<string, Map<string, string>>();
const VI_CHAR = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
/** Dấu phân cách của câu ghép (nhãn · nhãn, Thứ Hai, 02/11 …) — tách để dịch từng phần */
const SEPS = [' · ', ' — ', ' – ', ', ', ': ', ' / ', ' | '];

/**
 * Dịch 1 đoạn chữ (đã chuẩn hoá khoảng trắng). Trả về:
 * - chính nó nếu không có chữ tiếng Việt; bản dịch nếu tra được; null nếu còn chữ tiếng Việt chưa dịch được.
 * Thứ tự: khớp nguyên câu → mẫu {biến} dài → tách câu ghép trọn vẹn → mẫu ngắn → tách câu ghép dịch từng phần.
 */
/** Trông như tên riêng: mọi từ bắt đầu bằng chữ hoa / số (Nguyễn Minh Anh, TOEIC 500+ Tối) */
const NAME_LIKE = (v: string) => v.split(/\s+/).every((w) => /^[\p{Lu}\d(+#]/u.test(w));
const partialOf = new WeakMap<Map<string, string | null>, Set<string>>();
function resolve(locale: LocaleDef, dict: Map<string, string>, memo: Map<string, string | null>, text: string): string | null {
  let partial = partialOf.get(memo);
  if (!partial) partialOf.set(memo, (partial = new Set()));
  if (!VI_CHAR.test(text) && !dict.has(text)) return text;
  const m0 = memo.get(text);
  if (m0 !== undefined) return m0;
  memo.set(text, null); // chặn vòng lặp
  let out: string | null = dict.get(text) ?? null;
  if (out === null) {
    const up = text.charAt(0).toUpperCase() + text.slice(1);
    const low = text.charAt(0).toLowerCase() + text.slice(1);
    const alt = up !== text ? dict.get(up) : dict.get(low);
    if (alt !== undefined) out = up !== text ? alt.charAt(0).toLowerCase() + alt.slice(1) : alt.charAt(0).toUpperCase() + alt.slice(1);
  }
  // dấu "·" đầu / cuối đoạn (vd "· Phòng 302") → dịch phần bên trong
  if (out === null) {
    const m = /^([·•–—-]\s+)?(.*?)(\s+[·•–—-])?$/.exec(text)!;
    if ((m[1] || m[3]) && m[2]) {
      const inner = resolve(locale, dict, memo, m[2]);
      if (inner !== null) out = (m[1] ?? '') + inner + (m[3] ?? '');
    }
  }
  const full = (v: string) => {
    const r = resolve(locale, dict, memo, v);
    return r !== null && partial!.has(v) ? null : r;
  };
  // khớp mẫu {biến}: phần động dịch đệ quy; minLiteral chọn mẫu dài trước (cụ thể), mẫu ngắn sau
  const byPattern = (min: number, max: number) => {
    for (const p of patternsOf(locale)) {
      if (p.literal < min || p.literal >= max) continue;
      const m = p.re.exec(text);
      if (!m) continue;
      const raw = p.names.map((_, i) => norm(m[i + 1]));
      const vals = raw.map(full);
      // phần động chưa dịch được chỉ giữ nguyên khi là tên riêng (mọi từ viết hoa đầu: tên người, tên lớp) hoặc mẫu đủ dài;
      // mẫu ngắn (vd "{n} câu hỏi") không được nuốt cụm tiếng Việt thường như "Chưa có"
      if (vals.some((v, i) => v === null && !(p.literal >= 12 || NAME_LIKE(raw[i])))) continue;
      return p.out.replace(/\{(\w+)\}/g, (_, k) => {
        const i = p.names.indexOf(k);
        return i < 0 ? `{${k}}` : (vals[i] ?? raw[i]);
      });
    }
    return null;
  };
  // tách câu ghép theo dấu phân cách; allowPartial = dịch được đoạn nào thay đoạn đó
  const bySeparator = (allowPartial: boolean) => {
    for (const sep of SEPS) {
      const parts = text.split(sep);
      if (parts.length < 2) continue;
      for (let i = 1; i < parts.length; i++) {
        const l = full(parts.slice(0, i).join(sep).trim());
        if (l === null) continue;
        const r = full(parts.slice(i).join(sep).trim());
        if (r !== null) return l + sep + r;
      }
      if (!allowPartial) continue;
      const each = parts.map((x) => resolve(locale, dict, memo, x.trim()) ?? x.trim());
      if (each.some((x, i) => x !== parts[i].trim())) {
        partial!.add(text);
        return each.join(sep);
      }
    }
    return null;
  };
  if (out === null) out = byPattern(12, Infinity);
  if (out === null) out = bySeparator(false);
  if (out === null) out = byPattern(2, 12);
  if (out === null) out = bySeparator(true);
  memo.set(text, out);
  return out;
}

const memoByLang = new Map<string, Map<string, string | null>>();
/** Tra câu (đã chuẩn hoá khoảng trắng) → bản dịch, hoặc null nếu không cần / chưa dịch được */
export function lookup(lang: string, text: string): string | null {
  const locale = BY_CODE.get(lang);
  if (!locale || lang === SOURCE_LANG) return null;
  let dict = normCache.get(lang);
  if (!dict) {
    dict = new Map(Object.entries(locale.messages).map(([k, v]) => [norm(k), v]));
    normCache.set(lang, dict);
  }
  let memo = memoByLang.get(lang);
  if (!memo) memoByLang.set(lang, (memo = new Map()));
  const out = resolve(locale, dict, memo, text);
  return out === null || out === text ? null : out;
}

/** Mã locale cho Intl / toLocaleString theo ngôn ngữ đang chọn (số, ngày, giờ) */
export const appLocale = () => (useLangStore.getState().lang === 'en' ? 'en-US' : 'vi-VN');

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
    applyDomLang(lang);
  }, [lang]);
}
