import { badRequest } from '../../core/http';

/**
 * Lời thoại video có mốc thời gian (lessons.transcript, JSONB): [{ startMs, endMs, en, vi? }].
 * Admin nhập bằng file phụ đề .srt / .vtt (dán nội dung hoặc tải file). Mỗi cue: dòng tiếng Anh,
 * dòng có dấu tiếng Việt (nếu có) được coi là bản dịch.
 */
export interface Cue { startMs: number; endMs: number; en: string; vi?: string }

const MAX_CUES = 3000;
const TIME = /^\s*((?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3})\s*-->\s*((?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3})/;
// chữ chỉ tiếng Việt mới có (bỏ á/é/ó… để từ mượn như café không bị nhận nhầm)
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịĩọỏốồổỗộớờởỡợụủũứừửữựỳỵỷỹĂÂĐÊÔƠƯ]/;

const toMs = (t: string) => {
  const [hms, frac] = t.split(/[.,]/);
  const p = hms.split(':').map(Number);
  const [h, m, s] = p.length === 3 ? p : [0, p[0], p[1]];
  return ((h * 60 + m) * 60 + s) * 1000 + Number(frac.padEnd(3, '0').slice(0, 3));
};
const clean = (s: string) => s.replace(/<[^>]*>/g, '').replace(/\{\\[^}]*\}/g, '').replace(/\s+/g, ' ').trim();

/** Nội dung .srt / .vtt → danh sách cue (sắp theo thời gian). Chuỗi rỗng → null (xoá lời thoại). */
export function parseSubtitles(text: string): Cue[] | null {
  const src = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
  if (!src) return null;
  const cues: Cue[] = [];
  src.split(/\n\s*\n/).forEach((block, bi) => {
    const lines = block.split('\n');
    const at = lines.findIndex((l) => l.includes('-->'));
    if (at < 0) {
      if (/^(WEBVTT|NOTE|STYLE|REGION)\b/.test(lines[0]) || /^\d+$/.test(lines[0].trim())) return;
      throw badRequest(`Đoạn ${bi + 1}: thiếu mốc thời gian dạng "00:00:01,000 --> 00:00:03,500"`);
    }
    const m = lines[at].match(TIME);
    if (!m) throw badRequest(`Đoạn ${bi + 1}: mốc thời gian sai định dạng — "${lines[at].trim().slice(0, 60)}"`);
    const startMs = toMs(m[1]);
    const endMs = toMs(m[2]);
    if (endMs <= startMs) throw badRequest(`Đoạn ${bi + 1}: thời điểm kết thúc phải sau thời điểm bắt đầu`);
    const body = lines.slice(at + 1).map(clean).filter(Boolean);
    if (!body.length) return;
    const vi = body.filter((l) => VI.test(l));
    const en = body.filter((l) => !VI.test(l));
    const cue: Cue = { startMs, endMs, en: (en.length ? en : vi).join(' ').slice(0, 1000) };
    if (en.length && vi.length) cue.vi = vi.join(' ').slice(0, 1000);
    cues.push(cue);
  });
  if (!cues.length) throw badRequest('Không đọc được câu thoại nào — kiểm tra lại file phụ đề .srt / .vtt');
  if (cues.length > MAX_CUES) throw badRequest(`Tối đa ${MAX_CUES} câu thoại mỗi video`);
  return cues.sort((a, b) => a.startMs - b.startMs);
}

const stamp = (ms: number) => {
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

/** Cue → nội dung .srt (để admin xem / sửa lại) */
export const subtitlesToText = (cues: Cue[]) =>
  cues.map((c, i) => [i + 1, `${stamp(c.startMs)} --> ${stamp(c.endMs)}`, c.en, c.vi].filter((x) => x !== undefined && x !== '').join('\n')).join('\n\n');

/** Đọc cột transcript (chấp nhận cả dạng cũ {start,end,text,textVi} tính bằng giây) */
export function toCues(v: unknown): Cue[] {
  if (!Array.isArray(v)) return [];
  type Raw = { start?: number; end?: number; text?: string; textVi?: string | null; startMs?: number; endMs?: number; en?: string; vi?: string | null };
  return (v as Raw[])
    .map((l) => ({
      startMs: l.startMs ?? Math.round((l.start ?? 0) * 1000),
      endMs: l.endMs ?? Math.round((l.end ?? 0) * 1000),
      en: l.en ?? l.text ?? '',
      ...((l.vi ?? l.textVi) ? { vi: (l.vi ?? l.textVi)! } : {}),
    }))
    .filter((c) => c.en);
}
