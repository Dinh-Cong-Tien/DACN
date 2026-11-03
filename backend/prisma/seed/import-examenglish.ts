/**
 * Nạp bộ luyện TOEIC theo Part của examenglish (Data/examenglish/TOEIC_Full_Data):
 * Part 1 (ảnh + audio), Part 2 (audio), Part 3–4 (audio + transcript), Part 5, Part 7 (đơn + đọc kép).
 *
 * - File txt cào được bị lỗi đáp án ở Part 3/4/7 (script cào dò chữ "Correct" khớp nhầm cả "Incorrect"
 *   → phương án nào cũng [ĐÚNG]). Đáp án lấy từ XML gốc của examenglish lưu tại seed/data/examenglish/.
 * - Part 1/2: mỗi phương án là một file audio riêng → ghép (câu hỏi +) A, B, C, D thành một file như đề thật.
 * - "Part 6: Error recognition" là dạng tìm lỗi sai của đề TOEIC cũ, không có trong cấu trúc đề hiện hành → không nạp.
 * Media chép vào backend/uploads (question-images, question-audio), phục vụ qua /api/v1/import/images|audio.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { ExamPart } from '@prisma/client';
import { cut, dataPath, exists, insertMany, log, prisma, readText, slugify, stripHtml, uuid } from './lib';
import { partTagSlug, type SeedCtx } from './base';

const SRC = () => dataPath('examenglish', 'TOEIC_Full_Data');
const KEYS = path.join(__dirname, 'data', 'examenglish');
const UPLOAD = path.resolve(__dirname, '../../uploads');
const IMG_DIR = path.join(UPLOAD, 'question-images');
const AUDIO_DIR = path.join(UPLOAD, 'question-audio');
const IMG_URL = (f: string) => `/api/v1/import/images/${f}`;
const AUDIO_URL = (f: string) => `/api/v1/import/audio/${f}`;

type Opt = { key: string; text: string; audio?: string; correct: boolean };
type Q = { no: number; image?: string; audio?: string; stem: string; options: Opt[] };
type Group = { passageHtml?: string; questions: Q[] };

/** Đọc file noi_dung_cau_hoi.txt: các khối [ĐOẠN VĂN MỚI] … và "--- Câu n ---" */
function parseTxt(file: string): Group[] {
  const lines = readText(file).split('\n');
  const groups: Group[] = [];
  let g: Group = { questions: [] };
  let q: Q | null = null;
  let pendingAudio: string | undefined;
  const pushGroup = () => {
    if (g.questions.length || g.passageHtml) groups.push(g);
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('[ĐOẠN VĂN MỚI]')) {
      pushGroup();
      const body: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith('[/ĐOẠN VĂN MỚI]'); i++) body.push(lines[i]);
      g = { passageHtml: body.join('\n'), questions: [] };
      q = null;
      continue;
    }
    const m = /^--- Câu (\d+) ---/.exec(l);
    if (m) {
      q = { no: +m[1], stem: '', options: [] };
      g.questions.push(q);
      continue;
    }
    if (!q) continue;
    const t = l.trim();
    let mm: RegExpExecArray | null;
    if ((mm = /^\[Ảnh minh hoạ\]:\s*(\S+)/.exec(t))) q.image = mm[1];
    else if ((mm = /^\[Audio câu hỏi\]:\s*(\S+)/.exec(t))) q.audio = mm[1];
    else if ((mm = /^\[Audio đáp án [A-D]\]:\s*(\S+)/.exec(t))) pendingAudio = mm[1];
    else if ((mm = /^Câu hỏi:\s*(.*)$/.exec(t))) q.stem = mm[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    else if ((mm = /^([A-D])\.\s*(.*)$/.exec(t))) {
      const correct = /\[ĐÚNG\]\s*$/.test(mm[2]);
      q.options.push({ key: mm[1], text: mm[2].replace(/\s*\[ĐÚNG\]\s*$/, '').replace(/\.\.$/, '.').trim(), audio: pendingAudio, correct });
      pendingAudio = undefined;
    }
  }
  pushGroup();
  return groups;
}

/** Đáp án gốc từ XML examenglish: chỉ số phương án có feedback='Correct' theo thứ tự <item> */
function answerKeys(file: string): string[] {
  const xml = fs.readFileSync(path.join(KEYS, file), 'latin1');
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const choices = [...m[1].matchAll(/<choice\s+feedback=['"](\w+)['"]/g)].map((c) => c[1]);
    const i = choices.findIndex((c) => c === 'Correct');
    if (i < 0) throw new Error(`examenglish: thiếu đáp án trong ${file}`);
    return 'ABCD'[i];
  });
}

/** Bỏ thẻ ID3 đầu/cuối để ghép nhiều mp3 thành một luồng phát liền mạch */
function mp3Frames(buf: Buffer) {
  let s = 0;
  if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') s = 10 + ((buf[6] & 0x7f) << 21 | (buf[7] & 0x7f) << 14 | (buf[8] & 0x7f) << 7 | (buf[9] & 0x7f));
  let e = buf.length;
  if (e - s > 128 && buf.toString('latin1', e - 128, e - 125) === 'TAG') e -= 128;
  return buf.subarray(s, e);
}
function joinAudio(dir: string, files: string[], out: string) {
  const parts = files.map((f) => path.join(dir, f)).filter((p) => exists(p)).map((p) => mp3Frames(fs.readFileSync(p)));
  if (!parts.length) return null;
  fs.writeFileSync(path.join(AUDIO_DIR, out), Buffer.concat(parts));
  return AUDIO_URL(out);
}
function copyMedia(dir: string, file: string | undefined, out: string, kind: 'img' | 'audio') {
  if (!file || !exists(path.join(dir, file))) return null;
  fs.copyFileSync(path.join(dir, file), path.join(kind === 'img' ? IMG_DIR : AUDIO_DIR, out));
  return kind === 'img' ? IMG_URL(out) : AUDIO_URL(out);
}
const safe = (s: string) => slugify(s.replace(/\.[a-z0-9]+$/i, ''));

export async function importExamEnglish(ctx: SeedCtx) {
  const root = SRC();
  if (!exists(root)) return log('examenglish: không thấy thư mục, bỏ qua');
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  const dirOf = (prefix: string) => path.join(root, fs.readdirSync(root).find((d) => d.startsWith(prefix))!);

  const passages: any[] = [];
  const questions: any[] = [];
  const links: { questionId: string; part: ExamPart; no: number }[] = [];
  const base = (part: ExamPart) => ({ examType: 'TOEIC', part, skill: /P[1-4]$/.test(part) ? 'LISTENING' : 'READING', type: 'SINGLE_CHOICE', tagIds: [ctx.tags.get(partTagSlug(part))!], source: 'IMPORT', status: 'PUBLISHED', authorId: ctx.adminId });
  const add = (part: ExamPart, row: Record<string, unknown>) => {
    const id = uuid();
    questions.push({ id, ...base(part), ...row });
    links.push({ questionId: id, part, no: links.filter((l) => l.part === part).length + 1 });
  };
  const opts = (q: Q) => q.options.map((o) => ({ key: o.key, text: o.text }));
  const single = (q: Q, where: string) => {
    const c = q.options.filter((o) => o.correct);
    if (c.length !== 1) throw new Error(`examenglish ${where} câu ${q.no}: ${c.length} đáp án đúng`);
    return c[0].key;
  };

  // ---------- Part 1: ảnh + 4 câu mô tả (audio từng phương án → ghép A–D) ----------
  {
    const dir = dirOf('Part_1');
    for (const q of parseTxt(path.join(dir, 'noi_dung_cau_hoi.txt')).flatMap((g) => g.questions)) {
      add('TOEIC_P1', {
        stem: 'Chọn câu mô tả đúng nhất bức tranh.',
        options: opts(q),
        correctAnswer: { keys: [single(q, 'P1')] },
        imageUrl: copyMedia(dir, q.image, `exen-p1-${safe(q.image ?? String(q.no))}.jpg`, 'img'),
        audioUrl: joinAudio(dir, q.options.map((o) => o.audio!).filter(Boolean), `exen-p1-q${String(q.no).padStart(2, '0')}.mp3`),
        // Transcript các câu mô tả để học viên xem lại sau khi làm
        translationVi: q.options.map((o) => `(${o.key}) ${o.text}`).join('\n'),
      });
    }
  }

  // ---------- Part 2: câu hỏi + 3 câu đáp (ghép audio câu hỏi + A, B, C) ----------
  {
    const dir = dirOf('Part_2');
    for (const q of parseTxt(path.join(dir, 'noi_dung_cau_hoi.txt')).flatMap((g) => g.questions)) {
      add('TOEIC_P2', {
        stem: 'Nghe câu hỏi và chọn câu trả lời phù hợp nhất.',
        options: opts(q),
        correctAnswer: { keys: [single(q, 'P2')] },
        audioUrl: joinAudio(dir, [q.audio, ...q.options.map((o) => o.audio)].filter(Boolean) as string[], `exen-p2-q${String(q.no).padStart(2, '0')}.mp3`),
        translationVi: [`Q: ${q.stem}`, ...q.options.map((o) => `(${o.key}) ${o.text}`)].join('\n'),
      });
    }
  }

  // ---------- Part 3 / 4: hội thoại, bài nói (audio + transcript theo đoạn, đáp án từ XML) ----------
  for (const [part, prefix, keyFile, title] of [
    ['TOEIC_P3', 'Part_3', 'toeic_listening3.xml', 'Hội thoại'],
    ['TOEIC_P4', 'Part_4', 'toeic_listening4.xml', 'Bài nói ngắn'],
  ] as const) {
    const dir = dirOf(prefix);
    const keys = answerKeys(keyFile);
    let k = 0;
    parseTxt(path.join(dir, 'noi_dung_cau_hoi.txt')).forEach((g, gi) => {
      if (!g.questions.length) return;
      const pid = uuid();
      const audio = g.questions.find((q) => q.audio)?.audio;
      passages.push({
        id: pid,
        purpose: 'EXAM',
        examType: 'TOEIC',
        part,
        title: cut(`examenglish — ${title} ${gi + 1}`, 200),
        transcript: g.passageHtml ? stripHtml(g.passageHtml) : null,
        audioUrl: copyMedia(dir, audio, `exen-${part.slice(-2).toLowerCase()}-${gi + 1}.mp3`, 'audio'),
        status: 'PUBLISHED',
        authorId: ctx.adminId,
      });
      g.questions.forEach((q, qi) => {
        add(part, { passageId: pid, orderInPassage: qi + 1, stem: q.stem, options: opts(q), correctAnswer: { keys: [keys[k++]] } });
      });
    });
    if (k !== keys.length) throw new Error(`examenglish ${part}: ${k} câu nhưng XML có ${keys.length} đáp án`);
  }

  // ---------- Part 5: hoàn thành câu ----------
  {
    const dir = dirOf('Part_5');
    for (const q of parseTxt(path.join(dir, 'noi_dung_cau_hoi.txt')).flatMap((g) => g.questions)) {
      add('TOEIC_P5', { stem: q.stem.replace(/_{3,}/g, '_______'), options: opts(q), correctAnswer: { keys: [single(q, 'P5')] } });
    }
  }

  // ---------- Part 7: đọc hiểu đoạn đơn + đoạn kép (đáp án từ XML) ----------
  for (const [prefix, keyFile, title] of [
    ['Part_7', 'toeic_reading7.xml', 'Đọc hiểu'],
    ['Reading_8', 'toeic_double_passages.xml', 'Đọc kép'],
  ] as const) {
    const dir = dirOf(prefix);
    const keys = answerKeys(keyFile);
    let k = 0;
    const groups = parseTxt(path.join(dir, 'noi_dung_cau_hoi.txt'));
    // Đoạn kép: các khối văn bản liền nhau trước nhóm câu hỏi thuộc cùng một bộ
    let pendingHtml: string[] = [];
    groups.forEach((g, gi) => {
      if (g.passageHtml) pendingHtml.push(g.passageHtml);
      if (!g.questions.length) return;
      const pid = uuid();
      passages.push({
        id: pid,
        purpose: 'EXAM',
        examType: 'TOEIC',
        part: 'TOEIC_P7',
        title: cut(`examenglish — ${title} ${gi + 1}`, 200),
        contentMd: pendingHtml.map((h) => stripHtml(h)).join('\n\n---\n\n'),
        status: 'PUBLISHED',
        authorId: ctx.adminId,
      });
      pendingHtml = [];
      g.questions.forEach((q, qi) => add('TOEIC_P7', { passageId: pid, orderInPassage: qi + 1, stem: q.stem, options: opts(q), correctAnswer: { keys: [keys[k++]] } }));
    });
    if (k !== keys.length) throw new Error(`examenglish ${prefix}: ${k} câu nhưng XML có ${keys.length} đáp án`);
  }

  await insertMany(prisma.passage, passages);
  await insertMany(prisma.question, questions, 500);

  // Một đề luyện theo Part (MINI) gồm toàn bộ câu, đánh số liên tục như đề thật
  const order: ExamPart[] = ['TOEIC_P1', 'TOEIC_P2', 'TOEIC_P3', 'TOEIC_P4', 'TOEIC_P5', 'TOEIC_P7'];
  const testId = uuid();
  const count = (p: ExamPart) => links.filter((l) => l.part === p).length;
  const MIN: Record<string, number> = { TOEIC_P1: 4, TOEIC_P2: 9, TOEIC_P3: 13, TOEIC_P4: 13, TOEIC_P5: 8, TOEIC_P7: 40 };
  const TITLE: Record<string, string> = { TOEIC_P1: 'Part 1 — Mô tả tranh', TOEIC_P2: 'Part 2 — Hỏi đáp', TOEIC_P3: 'Part 3 — Hội thoại', TOEIC_P4: 'Part 4 — Bài nói ngắn', TOEIC_P5: 'Part 5 — Hoàn thành câu', TOEIC_P7: 'Part 7 — Đọc hiểu' };
  await prisma.mockTest.create({
    data: {
      id: testId,
      slug: 'examenglish-toeic-luyen-theo-part',
      title: 'examenglish — Luyện TOEIC theo Part (có audio)',
      examType: 'TOEIC',
      kind: 'MINI',
      level: 'Luyện theo Part',
      coverUrl: questions.find((q) => q.part === 'TOEIC_P1' && q.imageUrl)?.imageUrl ?? null,
      durationMin: order.reduce((s, p) => s + MIN[p], 0),
      totalQuestions: links.length,
      sections: order.map((p, i) => ({ part: p, title: TITLE[p], skill: /P[1-4]$/.test(p) ? 'LISTENING' : 'READING', order: i + 1, questions: count(p), durationMin: MIN[p] })),
      isFree: true,
      tags: ['examenglish', 'Luyện theo Part', 'Có audio'],
      status: 'PUBLISHED',
      authorId: ctx.adminId,
      reviewedById: ctx.headId,
    },
  });
  let no = 0;
  const rows = order.flatMap((p) => links.filter((l) => l.part === p).map((l) => ({ testId, questionId: l.questionId, part: p, questionNo: ++no })));
  await insertMany(prisma.mockTestQuestion, rows);
  log('examenglish questions', questions.length, 'passages', passages.length, Object.fromEntries(order.map((p) => [p, count(p)])));
}
