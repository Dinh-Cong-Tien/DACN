import { badRequest } from '../../core/http';

/**
 * Kiến thức đi kèm video bài giảng (lessons.knowledge, JSONB).
 * Admin nhập dạng văn bản (knowledgeText) — mỗi mục 1 dòng, các trường cách nhau " | ":
 *   # Ngữ pháp   → tiêu đề | công thức | ghi chú | ví dụ
 *   # Từ vựng    → từ | phiên âm | từ loại | nghĩa | ví dụ
 *   # Mệnh đề    → tên mệnh đề | từ dẫn (cách nhau dấu phẩy) | ghi chú | ví dụ
 *   # Mạo từ     → nhãn | nghĩa | ví dụ   (cây: a / an / the → các từ đi kèm; thụt 2 dấu cách = node con)
 */
export interface KnowledgeNode { label: string; meaningVi?: string; example?: string; children?: KnowledgeNode[] }
export interface GrammarPoint { title: string; formula?: string; note?: string; example?: string }
export interface VocabItem { word: string; ipa?: string; pos?: string; meaningVi: string; example?: string }
export interface ClausePoint { title: string; markers: string[]; note?: string; example?: string }
export interface LessonKnowledge { grammar: GrammarPoint[]; vocab: VocabItem[]; clauses: ClausePoint[]; articles: KnowledgeNode[] }

const SECTION: Record<string, keyof LessonKnowledge> = { 'ngữ pháp': 'grammar', 'từ vựng': 'vocab', 'mệnh đề': 'clauses', 'mạo từ': 'articles' };
const HEAD: Record<keyof LessonKnowledge, string> = { grammar: 'Ngữ pháp', vocab: 'Từ vựng', clauses: 'Mệnh đề', articles: 'Mạo từ' };
const opt = (s?: string) => (s && s.trim() ? s.trim() : undefined);
const clean = <T extends object>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

export const emptyKnowledge = (): LessonKnowledge => ({ grammar: [], vocab: [], clauses: [], articles: [] });
export const isEmptyKnowledge = (k: LessonKnowledge) => !k.grammar.length && !k.vocab.length && !k.clauses.length && !k.articles.length;

/** Văn bản → JSON; sai định dạng → 400 kèm số dòng. Rỗng → null (xoá kiến thức). */
export function parseKnowledgeText(text: string): LessonKnowledge | null {
  const k = emptyKnowledge();
  let sec: keyof LessonKnowledge | null = null;
  const stack: { depth: number; node: KnowledgeNode }[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const no = i + 1;
    if (!raw.trim()) return;
    if (raw.trim().startsWith('#')) {
      const name = raw.trim().replace(/^#+/, '').trim().toLowerCase();
      sec = SECTION[name] ?? null;
      if (!sec) throw badRequest(`Dòng ${no}: mục "${name}" không hợp lệ — dùng # Ngữ pháp, # Từ vựng, # Mệnh đề, # Mạo từ`);
      stack.length = 0;
      return;
    }
    if (!sec) throw badRequest(`Dòng ${no}: cần tiêu đề mục (vd "# Ngữ pháp") trước nội dung`);
    const f = raw.trim().split('|').map((x) => x.trim());
    if (!f[0]) throw badRequest(`Dòng ${no}: thiếu nội dung đầu dòng`);
    if (f[0].length > 200 || f.some((x) => x.length > 500)) throw badRequest(`Dòng ${no}: nội dung quá dài`);
    if (sec === 'grammar') k.grammar.push(clean({ title: f[0], formula: opt(f[1]), note: opt(f[2]), example: opt(f[3]) }));
    else if (sec === 'vocab') {
      if (!opt(f[3])) throw badRequest(`Dòng ${no}: từ vựng cần đủ "từ | phiên âm | từ loại | nghĩa"`);
      k.vocab.push(clean({ word: f[0], ipa: opt(f[1]), pos: opt(f[2]), meaningVi: f[3], example: opt(f[4]) }));
    } else if (sec === 'clauses') {
      const markers = (f[1] ?? '').split(',').map((x) => x.trim()).filter(Boolean);
      if (!markers.length) throw badRequest(`Dòng ${no}: mệnh đề cần danh sách từ dẫn, vd "who, which, that"`);
      k.clauses.push(clean({ title: f[0], markers, note: opt(f[2]), example: opt(f[3]) }));
    } else {
      const indent = raw.replace(/\t/g, '  ').match(/^ */)![0].length;
      const depth = Math.floor(indent / 2);
      const node: KnowledgeNode = clean({ label: f[0], meaningVi: opt(f[1]), example: opt(f[2]) });
      while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
      if (depth > 0 && !stack.length) throw badRequest(`Dòng ${no}: node con (thụt đầu dòng) phải nằm dưới một mạo từ`);
      if (depth > 3) throw badRequest(`Dòng ${no}: cây mạo từ tối đa 4 tầng`);
      if (stack.length) (stack[stack.length - 1].node.children ??= []).push(node);
      else k.articles.push(node);
      stack.push({ depth, node });
    }
  });
  return isEmptyKnowledge(k) ? null : k;
}

/** JSON → văn bản để sửa lại trong form admin */
export function knowledgeToText(k: LessonKnowledge | undefined): string {
  if (!k) return '';
  const out: string[] = [];
  const row = (...xs: (string | undefined)[]) => {
    while (xs.length && !xs[xs.length - 1]) xs.pop();
    return xs.map((x) => x ?? '').join(' | ');
  };
  const tree = (n: KnowledgeNode, d: number) => {
    out.push('  '.repeat(d) + row(n.label, n.meaningVi, n.example));
    n.children?.forEach((c) => tree(c, d + 1));
  };
  (Object.keys(HEAD) as (keyof LessonKnowledge)[]).forEach((s) => {
    if (!k[s].length) return;
    if (out.length) out.push('');
    out.push(`# ${HEAD[s]}`);
    if (s === 'grammar') k.grammar.forEach((g) => out.push(row(g.title, g.formula, g.note, g.example)));
    if (s === 'vocab') k.vocab.forEach((v) => out.push(row(v.word, v.ipa, v.pos, v.meaningVi, v.example)));
    if (s === 'clauses') k.clauses.forEach((c) => out.push(row(c.title, c.markers.join(', '), c.note, c.example)));
    if (s === 'articles') k.articles.forEach((n) => tree(n, 0));
  });
  return out.join('\n');
}

/** Đọc cột JSONB an toàn (dữ liệu cũ/thiếu mục) */
export function toKnowledge(v: unknown): LessonKnowledge | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Partial<LessonKnowledge>;
  const k: LessonKnowledge = { grammar: o.grammar ?? [], vocab: o.vocab ?? [], clauses: o.clauses ?? [], articles: o.articles ?? [] };
  return isEmptyKnowledge(k) ? undefined : k;
}
