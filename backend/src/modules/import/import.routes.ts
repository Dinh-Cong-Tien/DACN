/**
 * Nhập đề TOEIC từ file Word (.docx) vào ngân hàng câu hỏi.
 *  POST /import/word/preview  (body nhị phân .docx ≤ 20 MB) → xem trước, KHÔNG ghi DB (ảnh nhúng lưu tạm)
 *  POST /import/word/confirm  (JSON: bản xem trước đã chỉnh) → tạo passages + questions (+ đề tuỳ chọn) trong 1 transaction
 *  POST /import/audio         (body nhị phân mp3/m4a/wav/ogg ≤ 30 MB) → gắn audio cho câu / nhóm Part 1–4
 *  GET  /import/template.docx, /import/images/:file, /import/audio/:file  (công khai — ảnh/audio của câu hỏi)
 * Quyền: giáo viên (câu vào trạng thái Nháp, gửi duyệt ở "Học liệu của tôi"), trưởng bộ môn, admin.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';
import { z } from 'zod';
import mammoth from 'mammoth';
import type { ContentStatus, ExamPart, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { auth, allow } from '../../core/auth';
import { badRequest, handler, me, notFound, parse } from '../../core/http';
import { audit } from '../admin/audit';
import { uniqueSlug } from '../admin/admin.content';
import { htmlToLines, parseLines, type PartNo } from './docx-parser';

export const importRouter = Router();

const UPLOAD_ROOT = path.resolve(__dirname, '../../../uploads');
const IMG_DIR = path.join(UPLOAD_ROOT, 'question-images');
const AUDIO_DIR = path.join(UPLOAD_ROOT, 'question-audio');
const TEMPLATE = path.resolve(__dirname, '../../../assets/mau-nhap-de-toeic.docx');
const TMP_PREFIX = 'tmp-';
const TMP_TTL_MS = 24 * 3600_000;

const IMG_EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp' };
const IMG_MIME = Object.fromEntries(Object.entries(IMG_EXT).map(([m, e]) => [e, m]));
const AUDIO_EXT: Record<string, string> = { 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/wave': 'wav', 'audio/ogg': 'ogg' };
const AUDIO_MIME: Record<string, string> = { mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg' };
const SAFE_FILE = /^[a-z0-9-]+\.(png|jpg|gif|webp|bmp|mp3|m4a|wav|ogg)$/i;

const PART_ENUM: Record<PartNo, ExamPart> = { 1: 'TOEIC_P1', 2: 'TOEIC_P2', 3: 'TOEIC_P3', 4: 'TOEIC_P4', 5: 'TOEIC_P5', 6: 'TOEIC_P6', 7: 'TOEIC_P7' };
const PART_TITLE: Record<PartNo, string> = {
  1: 'Part 1 — Mô tả tranh',
  2: 'Part 2 — Hỏi đáp',
  3: 'Part 3 — Hội thoại',
  4: 'Part 4 — Bài nói ngắn',
  5: 'Part 5 — Hoàn thành câu',
  6: 'Part 6 — Hoàn thành đoạn văn',
  7: 'Part 7 — Đọc hiểu',
};
const PART_MINUTES: Record<PartNo, number> = { 1: 4, 2: 9, 3: 17, 4: 15, 5: 10, 6: 8, 7: 57 };

/** Xoá ảnh tạm (bản xem trước không được lưu) quá 24 giờ */
function sweepTemp() {
  try {
    const now = Date.now();
    for (const f of fs.readdirSync(IMG_DIR)) {
      if (!f.startsWith(TMP_PREFIX)) continue;
      const p = path.join(IMG_DIR, f);
      if (now - fs.statSync(p).mtimeMs > TMP_TTL_MS) fs.rmSync(p, { force: true });
    }
  } catch {
    /* thư mục chưa có */
  }
}

// ----------------------------------------------------------------- công khai
importRouter.get('/template.docx', (_req, res, next) => {
  if (!fs.existsSync(TEMPLATE)) return next(notFound('File mẫu'));
  res.download(TEMPLATE, 'mau-nhap-de-toeic.docx');
});
const serve = (dir: string, mimeOf: (ext: string) => string | undefined) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const file = String(req.params.file ?? '');
  if (!SAFE_FILE.test(file)) return next(notFound('Tệp'));
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) return next(notFound('Tệp'));
  res.setHeader('Content-Type', mimeOf(file.split('.').pop()!.toLowerCase()) ?? 'application/octet-stream');
  res.setHeader('Cache-Control', file.startsWith(TMP_PREFIX) ? 'no-store' : 'public, max-age=604800');
  fs.createReadStream(p).pipe(res);
};
importRouter.get('/images/:file', serve(IMG_DIR, (e) => IMG_MIME[e]));
importRouter.get('/audio/:file', serve(AUDIO_DIR, (e) => AUDIO_MIME[e]));

// ----------------------------------------------------------------- cần đăng nhập
importRouter.use(auth, allow('TEACHER', 'HEAD_TEACHER'));

importRouter.post(
  '/word/preview',
  express.raw({ type: () => true, limit: '20mb' }),
  handler(async (req) => {
    const buf = req.body as Buffer;
    if (!Buffer.isBuffer(buf) || buf.length === 0) throw badRequest('Chưa chọn file');
    // .docx là gói ZIP: bắt đầu bằng "PK\x03\x04"
    if (buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b || buf[2] !== 0x03 || buf[3] !== 0x04) throw badRequest('File không phải định dạng Word .docx (file .doc cũ hãy mở bằng Word và lưu lại thành .docx)', 'NOT_DOCX');
    fs.mkdirSync(IMG_DIR, { recursive: true });
    sweepTemp();
    let html: string;
    try {
      const out = await mammoth.convertToHtml(
        { buffer: buf },
        {
          styleMap: ['u => u'],
          convertImage: mammoth.images.imgElement(async (image) => {
            const ext = IMG_EXT[image.contentType] ?? null;
            if (!ext) return { src: '' };
            const data = Buffer.from(await image.read('base64'), 'base64');
            const name = `${TMP_PREFIX}${crypto.randomUUID()}.${ext}`;
            fs.writeFileSync(path.join(IMG_DIR, name), data);
            return { src: `/api/v1/import/images/${name}` };
          }),
        }
      );
      html = out.value;
    } catch {
      throw badRequest('Không đọc được nội dung file Word (file hỏng hoặc không phải .docx)', 'BAD_DOCX');
    }
    if (!/word\/document\.xml/.test(buf.toString('latin1', 0, Math.min(buf.length, 200_000))) && !html) throw badRequest('File không phải tài liệu Word', 'NOT_DOCX');
    const result = parseLines(htmlToLines(html));
    return { ...result, total: result.questions.length };
  })
);

importRouter.post(
  '/audio',
  express.raw({ type: () => true, limit: '30mb' }),
  handler(async (req) => {
    const buf = req.body as Buffer;
    if (!Buffer.isBuffer(buf) || buf.length === 0) throw badRequest('Chưa chọn file audio');
    const mime = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    let original = '';
    try {
      original = decodeURIComponent(String(req.headers['x-file-name'] ?? ''));
    } catch {
      original = '';
    }
    const ext = AUDIO_EXT[mime] ?? (/\.(mp3|m4a|wav|ogg)$/i.exec(original)?.[1].toLowerCase() ?? '');
    if (!ext) throw badRequest('Chỉ nhận audio MP3, M4A, WAV, OGG');
    // Kiểm chữ ký tệp: MP3 (ID3 / frame sync), WAV (RIFF), OGG (OggS), M4A (ftyp)
    const sig = buf.subarray(0, 12);
    const okSig =
      (ext === 'mp3' && (sig.toString('latin1', 0, 3) === 'ID3' || (sig[0] === 0xff && (sig[1] & 0xe0) === 0xe0))) ||
      (ext === 'wav' && sig.toString('latin1', 0, 4) === 'RIFF') ||
      (ext === 'ogg' && sig.toString('latin1', 0, 4) === 'OggS') ||
      (ext === 'm4a' && sig.toString('latin1', 4, 8) === 'ftyp');
    if (!okSig) throw badRequest('Nội dung file không đúng định dạng audio');
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    const name = `${crypto.randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(AUDIO_DIR, name), buf);
    const url = `/api/v1/import/audio/${name}`;
    await prisma.mediaFile.create({
      data: { ownerId: me(req).id, storageKey: `question-audio/${name}`, url, mimeType: AUDIO_MIME[ext], sizeBytes: BigInt(buf.length), checksumSha256: crypto.createHash('sha256').update(buf).digest('hex'), purpose: 'QUESTION_AUDIO' },
    });
    return { url, name: original || name, sizeBytes: buf.length };
  })
);

// ----------------------------------------------------------------- lưu
const part = z.number().int().min(1).max(7);
const url = z.string().max(500).regex(/^\/api\/v1\/import\/(images|audio)\/[a-z0-9-]+\.[a-z0-9]+$/i, 'Đường dẫn tệp không hợp lệ');
const confirmBody = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED']).default('DRAFT'),
  groups: z
    .array(
      z.object({
        ref: z.string().max(20),
        part,
        title: z.string().max(500).default(''),
        content: z.string().max(20000).default(''),
        imageUrls: z.array(url).max(10).default([]),
        audioUrl: url.nullish(),
      })
    )
    .max(200)
    .default([]),
  questions: z
    .array(
      z.object({
        ref: z.string().max(20),
        questionNo: z.number().int().min(1).max(300),
        part,
        stem: z.string().max(5000).default(''),
        options: z.array(z.object({ key: z.enum(['A', 'B', 'C', 'D']), text: z.string().max(1000) })).min(2).max(4),
        correctAnswer: z.enum(['A', 'B', 'C', 'D']).nullish(),
        explanation: z.string().max(10000).nullish(),
        imageUrls: z.array(url).max(5).default([]),
        audioUrl: url.nullish(),
        groupRef: z.string().max(20).nullish(),
      })
    )
    .min(1, 'Không có câu hỏi nào để lưu')
    .max(300),
  createTest: z.object({ title: z.string().trim().min(3).max(200), isFree: z.boolean().default(true) }).nullish(),
});

/** Ảnh tạm → ảnh chính thức (đổi tên, ghi media_files). Trả map url cũ → url mới. */
function promoteImages(urls: string[], ownerId: string) {
  const map = new Map<string, string>();
  const media: Prisma.MediaFileCreateManyInput[] = [];
  for (const u of new Set(urls)) {
    const file = u.split('/').pop()!;
    if (!file.startsWith(TMP_PREFIX)) {
      map.set(u, u);
      continue;
    }
    const src = path.join(IMG_DIR, file);
    if (!fs.existsSync(src)) throw badRequest('Ảnh trong bản xem trước đã hết hạn — hãy tải file Word lên lại');
    const finalName = file.slice(TMP_PREFIX.length);
    fs.renameSync(src, path.join(IMG_DIR, finalName));
    const finalUrl = `/api/v1/import/images/${finalName}`;
    const data = fs.readFileSync(path.join(IMG_DIR, finalName));
    media.push({ ownerId, storageKey: `question-images/${finalName}`, url: finalUrl, mimeType: IMG_MIME[finalName.split('.').pop()!.toLowerCase()] ?? 'image/png', sizeBytes: BigInt(data.length), checksumSha256: crypto.createHash('sha256').update(data).digest('hex'), purpose: 'QUESTION_IMAGE' });
    map.set(u, finalUrl);
  }
  return { map, media };
}

importRouter.post(
  '/word/confirm',
  handler(async (req) => {
    const u = me(req);
    const b = parse(confirmBody, req.body);
    // Giáo viên: luôn lưu Nháp, gửi duyệt ở "Học liệu của tôi"
    const status: ContentStatus = u.role === 'TEACHER' ? 'DRAFT' : b.status;
    const groups = new Map(b.groups.map((g) => [g.ref, g]));
    // Kiểm tra trước khi ghi
    const problems: string[] = [];
    for (const q of b.questions) {
      const g = q.groupRef ? groups.get(q.groupRef) : null;
      if (q.groupRef && !g) problems.push(`Câu ${q.questionNo}: không tìm thấy đoạn văn của nhóm`);
      if (g && g.part !== q.part) problems.push(`Câu ${q.questionNo}: Part ${q.part} khác Part ${g.part} của nhóm`);
      const need = q.part === 2 ? 3 : 4;
      if (status !== 'DRAFT') {
        if (q.options.length !== need) problems.push(`Câu ${q.questionNo}: Part ${q.part} cần ${need} phương án`);
        if (!q.correctAnswer) problems.push(`Câu ${q.questionNo}: chưa có đáp án`);
      }
      if (q.correctAnswer && !q.options.some((o) => o.key === q.correctAnswer)) problems.push(`Câu ${q.questionNo}: đáp án ${q.correctAnswer} không có trong phương án`);
      if ((q.part === 6 || q.part === 7) && !q.groupRef) problems.push(`Câu ${q.questionNo}: Part ${q.part} phải thuộc một đoạn văn`);
    }
    if (problems.length) throw badRequest(`${problems.length} lỗi cần sửa trước khi lưu: ${problems.slice(0, 5).join('; ')}${problems.length > 5 ? '…' : ''}`, 'IMPORT_INVALID');

    const tags = await prisma.skillTag.findMany({ where: { slug: { in: Object.keys(PART_ENUM).map((p) => `toeic-p${p}`) } }, select: { id: true, slug: true } });
    const tagOf = (p: PartNo) => tags.find((t) => t.slug === `toeic-p${p}`)?.id;
    const { map: imgMap, media } = promoteImages([...b.groups.flatMap((g) => g.imageUrls), ...b.questions.flatMap((q) => q.imageUrls)], u.id);
    const img = (x?: string) => (x ? (imgMap.get(x) ?? x) : null);
    const ordered = [...b.questions].sort((x, y) => x.part - y.part || x.questionNo - y.questionNo);

    const result = await prisma.$transaction(
      async (tx) => {
        if (media.length) await tx.mediaFile.createMany({ data: media, skipDuplicates: true });
        const passageId = new Map<string, string>();
        for (const g of b.groups) {
          if (!b.questions.some((q) => q.groupRef === g.ref)) continue;
          const p = g.part as PartNo;
          const listening = p <= 4;
          const row = await tx.passage.create({
            data: {
              purpose: 'EXAM',
              examType: 'TOEIC',
              part: PART_ENUM[p],
              title: g.title.slice(0, 200) || null,
              contentMd: listening ? null : g.content || null,
              transcript: listening ? g.content || null : null,
              imageUrl: img(g.imageUrls[0]),
              audioUrl: g.audioUrl ?? null,
              isFree: true,
              status,
              authorId: u.id,
            },
          });
          passageId.set(g.ref, row.id);
        }
        const order = new Map<string, number>();
        const ids: string[] = [];
        for (const q of ordered) {
          const p = q.part as PartNo;
          const gid = q.groupRef ? passageId.get(q.groupRef) : undefined;
          const n = gid ? (order.get(gid) ?? 0) + 1 : null;
          if (gid) order.set(gid, n!);
          const tag = tagOf(p);
          const row = await tx.question.create({
            data: {
              passageId: gid ?? null,
              orderInPassage: n,
              examType: 'TOEIC',
              part: PART_ENUM[p],
              skill: p <= 4 ? 'LISTENING' : 'READING',
              type: 'SINGLE_CHOICE',
              tagIds: tag ? [tag] : [],
              stem: q.stem.trim() || `Câu ${q.questionNo}`,
              options: q.options,
              correctAnswer: q.correctAnswer ? { keys: [q.correctAnswer] } : undefined,
              explanationMd: q.explanation || null,
              imageUrl: img(q.imageUrls[0]),
              audioUrl: q.audioUrl ?? null,
              source: 'IMPORT',
              status,
              authorId: u.id,
            },
          });
          ids.push(row.id);
        }
        let test: { id: string; slug: string; title: string } | null = null;
        if (b.createTest) {
          const parts = [...new Set(ordered.map((q) => q.part as PartNo))];
          const full = u.role !== 'TEACHER' && ordered.length === 200 && parts.length === 7;
          const minutes = full ? 120 : Math.max(10, Math.round(parts.reduce((a, p) => a + (PART_MINUTES[p] * ordered.filter((q) => q.part === p).length) / ({ 1: 6, 2: 25, 3: 39, 4: 30, 5: 30, 6: 16, 7: 54 } as Record<number, number>)[p], 0)));
          const t = await tx.mockTest.create({
            data: {
              slug: uniqueSlug(b.createTest.title),
              title: b.createTest.title,
              examType: 'TOEIC',
              kind: full ? 'FULL' : 'MINI',
              durationMin: minutes,
              totalQuestions: ids.length,
              sections: parts.map((p, i) => ({ part: PART_ENUM[p], title: PART_TITLE[p], skill: p <= 4 ? 'LISTENING' : 'READING', order: i + 1, questions: ordered.filter((q) => q.part === p).length })),
              isFree: b.createTest.isFree,
              tags: ['Nhập từ Word'],
              status,
              authorId: u.id,
            },
          });
          await tx.mockTestQuestion.createMany({ data: ids.map((qid, i) => ({ testId: t.id, questionId: qid, part: PART_ENUM[ordered[i].part as PartNo], questionNo: i + 1 })) });
          test = { id: t.id, slug: t.slug, title: t.title };
        }
        return { questionIds: ids, passages: passageId.size, test };
      },
      { timeout: 60_000 }
    );
    // Cập nhật số câu của nhãn Part
    for (const t of tags) {
      const c = await prisma.question.count({ where: { tagIds: { has: t.id }, deletedAt: null } });
      await prisma.skillTag.update({ where: { id: t.id }, data: { questionsCount: c } });
    }
    if (u.role !== 'TEACHER') await audit(req, 'QUESTION_IMPORT', 'question', null, { after: { count: result.questionIds.length, status, test: result.test?.id ?? null } });
    return { created: result.questionIds.length, passages: result.passages, status, test: result.test };
  })
);
