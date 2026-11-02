/**
 * Phân tích đề TOEIC từ file Word (.docx) → câu hỏi chia theo Part 1–7.
 *
 * Thứ tự ưu tiên chia Part:
 *  1. Tiêu đề trong file: "PART 5", "Part 5:", "Phần 5".
 *  2. Không có tiêu đề → số câu chuẩn TOEIC: 1–6 P1, 7–31 P2, 32–70 P3, 71–100 P4, 101–130 P5, 131–146 P6, 147–200 P7
 *     (khi cấu trúc câu khớp với dải số).
 *  3. Đánh số lại từ 1, không tiêu đề → suy theo cấu trúc (3 phương án → P2, nhóm có chỗ trống → P6, nhóm có đoạn văn → P7,
 *     nhóm hội thoại/bài nói → P3/P4, câu đơn có "___" → P5, câu có ảnh không có đề → P1) và gắn cảnh báo "suy đoán".
 *
 * Đáp án: "Đáp án: B" / "Answer: B" / "Key: B" ngay sau câu, bảng đáp án cuối file ("1. A 2. B", "1-A", "1A", bảng Word),
 * hoặc phương án in đậm / gạch chân. Giải thích: "Giải thích:" / "Explanation:" tới hết câu.
 */

export type PartNo = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const TOEIC_RANGES: [PartNo, number, number][] = [
  [1, 1, 6],
  [2, 7, 31],
  [3, 32, 70],
  [4, 71, 100],
  [5, 101, 130],
  [6, 131, 146],
  [7, 147, 200],
];
export const STANDARD_COUNTS: Record<PartNo, number> = { 1: 6, 2: 25, 3: 39, 4: 30, 5: 30, 6: 16, 7: 54 };

export interface ParsedOption {
  key: string;
  text: string;
}
export interface ParsedGroup {
  ref: string;
  from: number;
  to: number;
  part: PartNo;
  title: string;
  content: string;
  imageUrls: string[];
}
export interface ParsedQuestion {
  ref: string;
  questionNo: number;
  part: PartNo;
  stem: string;
  options: ParsedOption[];
  correctAnswer: string | null;
  answerSource: 'INLINE' | 'KEY_TABLE' | 'FORMAT' | null;
  explanation: string | null;
  imageUrls: string[];
  groupRef: string | null;
  partSource: 'HEADING' | 'NUMBER' | 'GUESS';
  warnings: string[];
}
export interface ParseResult {
  questions: ParsedQuestion[];
  groups: ParsedGroup[];
  parts: { part: PartNo; count: number; expected: number }[];
  warnings: string[];
  partMode: 'HEADING' | 'NUMBER' | 'GUESS';
  answered: number;
}

// ------------------------------------------------------------------ HTML → dòng
interface Line {
  text: string;
  /** Các đoạn chữ in đậm/gạch chân trong dòng (đã chuẩn hoá khoảng trắng) */
  marked: string[];
  images: string[];
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENTITIES[e.toLowerCase()] ?? m)
  );
const norm = (s: string) => decode(s.replace(/<[^>]+>/g, '')).replace(/[ \t ]+/g, ' ').trim();

/** Tách HTML của mammoth thành các dòng: mỗi <p>/<h*>/<li> và mỗi <br> là một dòng; ô bảng thành một dòng. */
export function htmlToLines(html: string): Line[] {
  const lines: Line[] = [];
  const blockRe = /<(p|h[1-6]|li|td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  // Bỏ lồng <p> trong <td>: lấy nội dung từng khối lá
  const flat = html.replace(/<td\b[^>]*>([\s\S]*?)<\/td>/gi, (_m, inner: string) => `<td>${inner.replace(/<\/?p\b[^>]*>/gi, ' ')}</td>`);
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(flat))) {
    const inner = m[2];
    for (const seg of inner.split(/<br\s*\/?>/i)) {
      const images = [...seg.matchAll(/<img\b[^>]*src="([^"]+)"/gi)].map((x) => x[1]);
      const marked = [...seg.matchAll(/<(strong|b|u)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((x) => norm(x[2])).filter(Boolean);
      const text = norm(seg);
      if (text || images.length) lines.push({ text, marked, images });
    }
  }
  return lines;
}

// ------------------------------------------------------------------ nhận dạng dòng
const RE_PART = /^(?:PART|Part|PHẦN|Phần)\s*([1-7])\b[\s.:\-–—)]*/;
const RE_KEY_HEAD = /^(?:answer\s*keys?|keys?|đáp\s*án(?:\s*(?:đề|chi tiết))?|bảng\s*đáp\s*án)\s*[:：]?\s*$/i;
const RE_GROUP = /^(?:Questions?|Câu)\s*(\d{1,3})\s*(?:[-–—]|to|đến|-)\s*(\d{1,3})\b(.*)$/i;
const RE_Q = /^(?:Câu|Question)?\s*(\d{1,3})\s*[.):]\s*(.*)$/i;
const RE_INLINE_ANS = /^(?:đáp\s*án(?:\s*đúng)?|answer|key|correct\s*answer)\s*[:：]\s*\(?([A-Da-d])\)?\b/i;
const RE_EXPL = /^(?:giải\s*thích|explanation|lời\s*giải)\s*[:：]\s*(.*)$/i;
/** Chỗ trống của Part 6 trong đoạn văn: "-- 131 --", "___(131)___", "(131) ____", "[131]" */
const RE_P6_BLANK = /(?:[-_]{2,}\s*\(?\s*\d{3}\s*\)?\s*[-_]{2,}|\(\s*1[34]\d\s*\)|\[\s*1[34]\d\s*\]|_{3,})/;
const RE_BLANK = /_{2,}|-{3,}|…{1,}|\.{4,}/;
const LISTEN_TALK = /\b(talk|announcement|message|broadcast|speech|report|advertisement|introduction|tour|excerpt|news|bài nói|thông báo|tin nhắn|quảng cáo)\b/i;
const LISTEN_CONV = /\b(conversation|hội thoại|cuộc trò chuyện|discussion)\b/i;

/** Tách phương án trên một dòng: "(A) x (B) y", "A. x", "A) x". Trả null nếu dòng không phải phương án. */
export function splitOptions(text: string): ParsedOption[] | null {
  const t = text.trim();
  // Dạng có ngoặc: (A) … (B) … — có thể nhiều trên một dòng
  if (/^\(([A-D])\)/.test(t)) {
    const parts = t.split(/\s*\(([A-D])\)\s*/).slice(1);
    const out: ParsedOption[] = [];
    for (let i = 0; i < parts.length; i += 2) out.push({ key: parts[i], text: (parts[i + 1] ?? '').trim() });
    return out;
  }
  // Dạng "A. …" / "A) …" — nhiều trên một dòng khi cách nhau ≥ 2 khoảng trắng hoặc tab (đã chuẩn hoá) → dùng mẫu " B. "
  const m = /^([A-D])[.)]\s+(.*)$/.exec(t);
  if (!m) return null;
  const rest = `${m[1]}. ${m[2]}`;
  const parts = rest.split(/(?:^|\s)([A-D])[.)]\s+/).filter((x, i) => i > 0);
  const out: ParsedOption[] = [];
  for (let i = 0; i < parts.length; i += 2) out.push({ key: parts[i], text: (parts[i + 1] ?? '').trim() });
  // Chỉ coi là nhiều phương án khi các khoá liên tiếp A,B,C…
  if (out.length > 1 && out.some((o, i) => o.key !== 'ABCD'[out[0].key.charCodeAt(0) - 65 + i])) return [{ key: m[1], text: m[2].trim() }];
  return out;
}

/** Bảng đáp án: "1. A 2. B", "1-A", "1A", "1 | A" … */
export function parseKeyText(text: string, into: Map<number, string>) {
  for (const m of text.matchAll(/(\d{1,3})\s*[.\-:)|]?\s*\(?([A-D])\)?(?![a-z])/gi)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 300 && !into.has(n)) into.set(n, m[2].toUpperCase());
  }
}

const partByNumber = (n: number): PartNo | null => TOEIC_RANGES.find(([, a, b]) => n >= a && n <= b)?.[0] ?? null;

// ------------------------------------------------------------------ phân tích chính
export function parseLines(lines: Line[]): ParseResult {
  const questions: ParsedQuestion[] = [];
  const groups: ParsedGroup[] = [];
  const keyMap = new Map<number, string>();
  const warnings: string[] = [];

  let headingPart: PartNo | null = null;
  let sawHeading = false;
  let mode: 'NONE' | 'GROUP' | 'Q' | 'EXPL' | 'KEY' = 'NONE';
  let curQ: (ParsedQuestion & { heading: PartNo | null; marked: string[] }) | null = null;
  let curG: (ParsedGroup & { heading: PartNo | null; lines: string[] }) | null = null;
  let pendingImages: string[] = [];
  const keyText: string[] = [];

  const closeQ = () => {
    curQ = null;
  };

  for (const ln of lines) {
    const t = ln.text;
    // Bảng đáp án cuối file: mọi dòng sau tiêu đề key
    if (mode === 'KEY') {
      keyText.push(t);
      continue;
    }
    if (t && RE_KEY_HEAD.test(t)) {
      closeQ();
      mode = 'KEY';
      continue;
    }
    const pm = t.length <= 120 ? RE_PART.exec(t) : null;
    if (pm) {
      headingPart = Number(pm[1]) as PartNo;
      sawHeading = true;
      closeQ();
      curG = null;
      mode = 'NONE';
      pendingImages = [];
      continue;
    }
    const gm = RE_GROUP.exec(t);
    if (gm && /refer|dựa|sau đây|following|tham khảo/i.test(gm[3] + t)) {
      closeQ();
      const from = Number(gm[1]);
      const to = Number(gm[2]);
      curG = { ref: `g${groups.length + 1}`, from, to, part: 7, title: t, content: '', imageUrls: [...ln.images], heading: headingPart, lines: [] };
      groups.push(curG);
      mode = 'GROUP';
      pendingImages = [];
      continue;
    }
    const qm = RE_Q.exec(t);
    const qNo = qm ? Number(qm[1]) : NaN;
    // Trong đoạn văn của nhóm: chỉ coi là câu hỏi khi số nằm trong dải của nhóm (tránh danh sách đánh số trong email)
    const g0 = curG as (ParsedGroup & { lines: string[] }) | null;
    const inGroupCtx = !!g0 && (mode === 'GROUP' || (curQ !== null && (curQ as ParsedQuestion).groupRef === g0.ref));
    const isQuestionStart = !!qm && qNo >= 1 && qNo <= 300 && !splitOptions(t) && (!inGroupCtx || qNo >= g0!.from);
    if (isQuestionStart && qm) {
      const inGroup = curG && qNo >= curG.from && qNo <= curG.to ? curG : null;
      if (!inGroup) curG = null;
      const q: ParsedQuestion & { heading: PartNo | null; marked: string[] } = {
        ref: `q${questions.length + 1}`,
        questionNo: qNo,
        part: 5,
        stem: qm[2].trim(),
        options: [],
        correctAnswer: null,
        answerSource: null,
        explanation: null,
        imageUrls: [...(inGroup ? [] : pendingImages), ...ln.images],
        groupRef: inGroup?.ref ?? null,
        partSource: 'NUMBER',
        warnings: [],
        heading: headingPart,
        marked: [...ln.marked],
      };
      pendingImages = [];
      questions.push(q);
      curQ = q;
      mode = 'Q';
      // Phương án nằm ngay trên dòng câu hỏi? ("101. The … (A) x (B) y")
      const inlineOpts = /\s\(A\)\s/.exec(q.stem);
      if (inlineOpts) {
        const opts = splitOptions(q.stem.slice(inlineOpts.index + 1));
        if (opts && opts.length >= 2) {
          q.options = opts;
          q.stem = q.stem.slice(0, inlineOpts.index).trim();
        }
      }
      continue;
    }

    if (mode === 'GROUP' && curG) {
      if (t) curG.lines.push(t);
      curG.imageUrls.push(...ln.images);
      continue;
    }
    if ((mode === 'Q' || mode === 'EXPL') && curQ) {
      const q: ParsedQuestion & { marked: string[] } = curQ;
      // Dòng chỉ có ảnh sau khi câu đã đủ phương án → ảnh của câu kế tiếp (Part 1: ảnh đứng trước số câu)
      if (!t && ln.images.length && q.options.length >= 2 && !q.groupRef) {
        pendingImages.push(...ln.images);
        continue;
      }
      q.imageUrls.push(...ln.images);
      const am = RE_INLINE_ANS.exec(t);
      if (am) {
        q.correctAnswer = am[1].toUpperCase();
        q.answerSource = 'INLINE';
        mode = 'Q';
        continue;
      }
      const em = RE_EXPL.exec(t);
      if (em) {
        q.explanation = em[1].trim();
        mode = 'EXPL';
        continue;
      }
      if (mode === 'EXPL') {
        if (t) q.explanation = `${q.explanation ? `${q.explanation}\n` : ''}${t}`;
        continue;
      }
      const opts = t ? splitOptions(t) : null;
      if (opts && opts.length) {
        for (const o of opts) if (!q.options.some((x) => x.key === o.key)) q.options.push(o);
        q.marked.push(...ln.marked);
        continue;
      }
      if (t && !q.options.length) q.stem = q.stem ? `${q.stem}\n${t}` : t;
      else if (t && q.options.length) {
        // Dòng tiếp nối phương án cuối (phương án dài xuống dòng)
        const last = q.options[q.options.length - 1];
        if (last && !/[.?!]$/.test(last.text) && t.length < 120) last.text = `${last.text} ${t}`.trim();
      }
      continue;
    }
    // Ngoài câu/nhóm (hướng dẫn của Part, tiêu đề đề thi…): giữ ảnh để gắn cho câu kế tiếp (ảnh Part 1 thường đứng trước số câu)
    if (ln.images.length) pendingImages.push(...ln.images);
  }

  // Bảng đáp án: gom cả vùng (ô bảng Word tách số và chữ thành dòng riêng)
  parseKeyText(keyText.join(' '), keyMap);

  // ---------------- đáp án theo định dạng (in đậm / gạch chân) và bảng đáp án
  for (const q of questions as (ParsedQuestion & { marked: string[] })[]) {
    if (!q.correctAnswer && keyMap.has(q.questionNo)) {
      q.correctAnswer = keyMap.get(q.questionNo)!;
      q.answerSource = 'KEY_TABLE';
    }
    if (!q.correctAnswer && q.marked.length && q.options.length) {
      const hit = q.options.filter((o) => q.marked.some((mk) => mk && (mk === o.text || mk.includes(o.text) || o.text.includes(mk) || mk.replace(/[()]/g, '').trim() === o.key)));
      if (hit.length === 1) {
        q.correctAnswer = hit[0].key;
        q.answerSource = 'FORMAT';
      }
    }
  }

  // ---------------- nội dung nhóm
  for (const g of groups as (ParsedGroup & { lines: string[] })[]) g.content = g.lines.join('\n').trim();

  // ---------------- chia Part
  const groupOf = new Map(groups.map((g) => [g.ref, g as ParsedGroup & { heading: PartNo | null }]));
  const guessStructural = (q: ParsedQuestion): PartNo => {
    const g = q.groupRef ? groupOf.get(q.groupRef) : null;
    if (g) {
      if (RE_P6_BLANK.test(g.content) && q.options.every((o) => o.text.split(/\s+/).length <= 14)) return 6;
      if (g.content.length > 60 && !LISTEN_CONV.test(g.title) && !LISTEN_TALK.test(g.title)) return 7;
      if (LISTEN_CONV.test(g.title)) return 3;
      if (LISTEN_TALK.test(g.title)) return 4;
      return g.content.length > 60 ? 7 : 3;
    }
    if (q.options.length === 3) return 2;
    if (RE_BLANK.test(q.stem)) return 5;
    if (q.imageUrls.length && (!q.stem || /^(câu|question)?\s*\d*$/i.test(q.stem))) return 1;
    if (!q.stem) return q.options.length === 3 ? 2 : 1;
    return 5;
  };
  /** Cấu trúc câu có khớp với Part theo số câu không (để quyết định dùng dải số chuẩn) */
  const fitsRange = (q: ParsedQuestion, p: PartNo) => {
    const inGroup = !!q.groupRef;
    if (p === 1) return !inGroup && q.options.length !== 3;
    if (p === 2) return !inGroup && q.options.length <= 3;
    if (p === 3 || p === 4 || p === 6 || p === 7) return inGroup;
    return !inGroup; // P5
  };

  let partMode: ParseResult['partMode'] = 'NUMBER';
  const withHeading = (questions as (ParsedQuestion & { heading: PartNo | null })[]).filter((q) => q.heading);
  if (sawHeading && withHeading.length) {
    partMode = 'HEADING';
    for (const q of questions as (ParsedQuestion & { heading: PartNo | null })[]) {
      const g = q.groupRef ? groupOf.get(q.groupRef) : null;
      const h = g?.heading ?? q.heading;
      if (h) {
        q.part = h;
        q.partSource = 'HEADING';
      } else {
        const byNo = partByNumber(q.questionNo);
        q.part = byNo ?? guessStructural(q);
        q.partSource = byNo ? 'NUMBER' : 'GUESS';
      }
    }
  } else {
    const fit = questions.filter((q) => {
      const p = partByNumber(q.questionNo);
      return p !== null && fitsRange(q, p);
    }).length;
    const useNumbers = questions.length > 0 && fit / questions.length >= 0.8;
    partMode = useNumbers ? 'NUMBER' : 'GUESS';
    for (const q of questions) {
      const p = useNumbers ? partByNumber(q.questionNo) : null;
      q.part = p ?? guessStructural(q);
      q.partSource = p ? 'NUMBER' : 'GUESS';
      if (!p) q.warnings.push('Part được suy đoán theo cấu trúc câu — hãy kiểm tra lại');
    }
  }
  // Part của nhóm = Part của câu đầu tiên trong nhóm; các câu trong nhóm dùng chung Part
  for (const g of groups) {
    const qs = questions.filter((q) => q.groupRef === g.ref);
    if (qs.length) {
      g.part = qs[0].part;
      for (const q of qs) q.part = g.part;
    }
  }

  // ---------------- cảnh báo từng câu
  const seen = new Map<number, number>();
  for (const q of questions) seen.set(q.questionNo, (seen.get(q.questionNo) ?? 0) + 1);
  for (const q of questions) {
    const need = q.part === 2 ? 3 : 4;
    if (q.options.length !== need) q.warnings.push(`Có ${q.options.length} phương án (Part ${q.part} cần ${need})`);
    if (!q.correctAnswer) q.warnings.push('Chưa có đáp án');
    else if (!q.options.some((o) => o.key === q.correctAnswer)) q.warnings.push(`Đáp án ${q.correctAnswer} không có trong các phương án`);
    if ((seen.get(q.questionNo) ?? 0) > 1) q.warnings.push(`Số câu ${q.questionNo} bị trùng`);
    if (q.part <= 4) q.warnings.push('Cần gắn audio (Part nghe)');
    if (q.part === 1 && !q.imageUrls.length) q.warnings.push('Part 1 chưa có ảnh');
    if (q.part === 6 || q.part === 7) {
      if (!q.groupRef) q.warnings.push(`Part ${q.part} cần đoạn văn ("Questions x–y refer to…")`);
    }
  }
  // Số câu nhảy
  const nums = [...new Set(questions.map((q) => q.questionNo))].sort((a, b) => a - b);
  const gaps: string[] = [];
  for (let i = 1; i < nums.length; i++) if (nums[i] - nums[i - 1] > 1) gaps.push(nums[i - 1] + 1 === nums[i] - 1 ? `${nums[i - 1] + 1}` : `${nums[i - 1] + 1}–${nums[i] - 1}`);
  if (gaps.length) warnings.push(`Thiếu câu số: ${gaps.slice(0, 8).join(', ')}${gaps.length > 8 ? '…' : ''}`);
  if (!questions.length) warnings.push('Không tìm thấy câu hỏi nào — kiểm tra định dạng (mỗi câu bắt đầu bằng "101." hoặc "Câu 101:")');

  const parts = ([1, 2, 3, 4, 5, 6, 7] as PartNo[]).map((p) => ({ part: p, count: questions.filter((q) => q.part === p).length, expected: STANDARD_COUNTS[p] }));
  const present = parts.filter((p) => p.count);
  if (present.length) {
    const lo = Math.min(...present.map((p) => p.part));
    const hi = Math.max(...present.map((p) => p.part));
    const empty = parts.filter((p) => p.part > lo && p.part < hi && !p.count).map((p) => p.part);
    if (empty.length) warnings.push(`Part trống: ${empty.map((p) => `Part ${p}`).join(', ')}`);
  }
  if (partMode === 'GUESS' && questions.length) warnings.push('File không có tiêu đề PART và số câu không theo chuẩn TOEIC — Part được suy đoán theo cấu trúc, hãy kiểm tra từng tab');

  // Bỏ thuộc tính nội bộ
  const cleanQ = questions.map(({ heading: _h, marked: _m, ...q }: ParsedQuestion & { heading?: unknown; marked?: unknown }) => q as ParsedQuestion);
  const cleanG = groups.map(({ heading: _h, lines: _l, ...g }: ParsedGroup & { heading?: unknown; lines?: unknown }) => g as ParsedGroup);
  return { questions: cleanQ, groups: cleanG, parts, warnings, partMode, answered: cleanQ.filter((q) => q.correctAnswer).length };
}
