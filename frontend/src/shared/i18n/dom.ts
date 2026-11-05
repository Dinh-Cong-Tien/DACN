/**
 * Dịch toàn trang theo ngôn ngữ đang chọn — không cần bọc t() ở từng component:
 * - Theo dõi DOM (MutationObserver): mọi đoạn chữ, placeholder, title, aria-label, alt và tiêu đề tab
 *   được tra bảng dịch (khoá = câu tiếng Việt gốc, mẫu {biến} cho phần động) rồi thay tại chỗ.
 * - Giữ câu gốc của từng node → React cập nhật chữ mới vẫn dịch lại đúng; về Tiếng Việt thì trả nguyên văn.
 * - Bỏ qua vùng nội dung người dùng / nội dung học: [data-no-i18n], [translate="no"], ô nhập liệu, code.
 */
import { lookup } from '.';

/** Ngôn ngữ nguồn (trùng SOURCE_LANG ở index.ts — khai báo lại để tránh vòng import lúc khởi tạo) */
const SOURCE_LANG = 'vi';

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'aria-description'] as const;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'KBD']);
// chỉ câu có chữ tiếng Việt mới cần tra (lọc nhanh)
const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

/** câu gốc của node chữ + bản dịch đã ghi vào (để nhận ra React đổi chữ mới) */
const textSrc = new WeakMap<Text, string>();
const textOut = new WeakMap<Text, string>();
const attrSrc = new WeakMap<Element, Map<string, string>>();

let lang = SOURCE_LANG;
let observer: MutationObserver | null = null;
let titleSrc: string | null = null;

const skipped = (el: Element | null): boolean => {
  for (let e = el; e; e = e.parentElement) {
    if (SKIP_TAGS.has(e.tagName)) return true;
    if (e.hasAttribute('data-no-i18n') || e.getAttribute('translate') === 'no' || (e as HTMLElement).isContentEditable) return true;
  }
  return false;
};

/** Dịch giữ nguyên khoảng trắng đầu / cuối của đoạn chữ */
/** Chữ tiếng Việt không dấu cần dịch (viết tắt, placeholder) — ngoài bộ lọc nhanh theo dấu */
const ASCII_VI = new Set(['STT', 'HV', 'GV', 'ban@email.com']);
const tr = (s: string): string | null => {
  const core = s.replace(/\s+/g, ' ').trim();
  if (!VI.test(s) && !ASCII_VI.has(core)) return null;
  const hit = lookup(lang, core);
  if (hit === null || hit === core) return null;
  const lead = /^\s*/.exec(s)![0] ? ' ' : '';
  const trail = /\s*$/.exec(s)![0] ? ' ' : '';
  return lead + hit + trail;
};

function doText(n: Text) {
  const cur = n.nodeValue ?? '';
  // React đổi chữ (khác bản dịch mình ghi) → đó là câu gốc mới
  if (textOut.get(n) !== cur) textSrc.set(n, cur);
  const src = textSrc.get(n) ?? cur;
  if (lang === SOURCE_LANG) {
    if (textOut.has(n) && cur === textOut.get(n)) n.nodeValue = src;
    textOut.delete(n);
    return;
  }
  if (!n.parentElement || skipped(n.parentElement)) return;
  const out = tr(src);
  if (out === null) {
    if (cur !== src) n.nodeValue = src;
    textOut.delete(n);
    return;
  }
  textOut.set(n, out);
  if (cur !== out) n.nodeValue = out;
}

function doAttrs(el: Element, only?: string) {
  let saved = attrSrc.get(el);
  for (const a of only ? [only] : ATTRS) {
    const cur = el.getAttribute(a);
    if (cur === null) continue;
    if (!saved) attrSrc.set(el, (saved = new Map()));
    const prevOut = saved.get(`${a}:out`);
    if (prevOut !== cur) saved.set(a, cur);
    const src = saved.get(a) ?? cur;
    const out = lang === SOURCE_LANG || skipped(el) ? src : (tr(src) ?? src);
    saved.set(`${a}:out`, out);
    if (cur !== out) el.setAttribute(a, out);
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) return doText(root as Text);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (SKIP_TAGS.has(el.tagName)) return;
  doAttrs(el);
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) doText(n as Text);
    else doAttrs(n as Element);
  }
}

/** Tiêu đề tab "Trang · OrbiLingo": dịch từng phần, nhớ câu gốc */
let titleOut = '';
function doTitle() {
  const cur = document.title;
  if (cur !== titleOut) titleSrc = cur;
  const src = titleSrc ?? cur;
  const out = lang === SOURCE_LANG ? src : src.split(' · ').map((p) => tr(p)?.trim() ?? p).join(' · ');
  titleOut = out;
  if (cur !== out) document.title = out;
}

/** Bật / đổi / tắt dịch toàn trang theo ngôn ngữ */
export function applyDomLang(next: string) {
  lang = next;
  observer?.disconnect();
  observer = null;
  // tầng dịch không bao giờ được làm hỏng trang: lỗi bất ngờ chỉ bỏ qua node đó
  const safe = (f: () => void) => {
    try {
      f();
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[i18n]', e);
    }
  };
  // về Tiếng Việt: duyệt cây hiện tại, trả nguyên văn cho chữ / thuộc tính đã dịch
  safe(() => walk(document.body));
  safe(doTitle);
  if (lang === SOURCE_LANG) return;
  observer = new MutationObserver((list) => {
    for (const m of list)
      safe(() => {
        const target = m.target.nodeType === Node.TEXT_NODE ? m.target.parentElement : (m.target as Element);
        if (target?.tagName === 'TITLE') doTitle();
        else if (m.type === 'characterData') doText(m.target as Text);
        else if (m.type === 'attributes') doAttrs(m.target as Element, m.attributeName!);
        else m.addedNodes.forEach(walk);
      });
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
  const t = document.querySelector('title');
  if (t) observer.observe(t, { childList: true, characterData: true, subtree: true });
}
