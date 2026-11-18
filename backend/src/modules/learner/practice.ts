/**
 * Phụ trợ trang luyện tập của học viên:
 * - tổng quan số câu có sẵn theo Part,
 * - tải lên bản ghi âm bài Nói (lưu file cục bộ trong backend/uploads, ghi bảng media_files),
 * - lịch sử bài Nói đã nộp.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { badRequest, handler, me } from '../../core/http';
import { partToFe } from './learner.shared';

export const practiceRouter = Router();

/** Thư mục lưu file tải lên (ngoài src, đã bỏ qua trong git) */
export const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads/recordings');
export const AVATAR_DIR = path.resolve(__dirname, '../../../uploads/avatars');
export const LESSON_VIDEO_DIR = path.resolve(__dirname, '../../../uploads/lesson-videos');
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const AUDIO_TYPES: Record<string, string> = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/wav': 'wav', 'audio/x-wav': 'wav' };

practiceRouter.get(
  '/practice/overview',
  handler(async () => {
    const rows = await prisma.question.groupBy({
      by: ['part'],
      where: { status: 'PUBLISHED', deletedAt: null, skill: { in: ['LISTENING', 'READING'] }, type: { notIn: ['ESSAY', 'SPEAKING_RESPONSE'] } },
      _count: { _all: true },
    });
    const byPart: Record<string, number> = {};
    for (const r of rows) {
      const k = partToFe(r.part);
      byPart[k] = (byPart[k] ?? 0) + r._count._all;
    }
    return { byPart, total: Object.values(byPart).reduce((a, b) => a + b, 0) };
  })
);

/** Tải lên bản ghi âm (body nhị phân, Content-Type audio/*, tối đa 15 MB) → { url } dùng làm audioUrl khi nộp bài */
practiceRouter.post(
  '/uploads/recording',
  express.raw({ type: 'audio/*', limit: '15mb' }),
  handler(async (req) => {
    const userId = me(req).id;
    const mime = String(req.headers['content-type'] ?? '').split(';')[0].trim();
    const ext = AUDIO_TYPES[mime];
    const buf = req.body as Buffer;
    if (!ext) throw badRequest('Định dạng ghi âm không được hỗ trợ');
    if (!Buffer.isBuffer(buf) || buf.length < 100) throw badRequest('File ghi âm trống');
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const name = `${crypto.randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    const url = `/api/v1/learner/media/${name}`;
    await prisma.mediaFile.create({
      data: { ownerId: userId, storageKey: `recordings/${name}`, url, mimeType: mime, sizeBytes: BigInt(buf.length), checksumSha256: crypto.createHash('sha256').update(buf).digest('hex'), purpose: 'RECORDING', isPrivate: true },
    });
    return { url };
  })
);

/** Ảnh đại diện (body nhị phân image/jpeg|png|webp) → lưu data URL trong users.avatar_url, ghi media_files (AVATAR) */
practiceRouter.post(
  '/uploads/avatar',
  express.raw({ type: 'image/*', limit: '2mb' }),
  handler(async (req) => {
    const userId = me(req).id;
    const mime = String(req.headers['content-type'] ?? '').split(';')[0].trim();
    const ext = IMAGE_TYPES[mime];
    const buf = req.body as Buffer;
    if (!ext) throw badRequest('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP');
    if (!Buffer.isBuffer(buf) || !buf.length) throw badRequest('File ảnh trống');
    // Kiểm tra chữ ký tệp khớp loại khai báo (chặn file giả đuôi ảnh)
    const sig =
      ext === 'jpg' ? buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
      : ext === 'png' ? buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      : buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP';
    if (!sig) throw badRequest('Tệp không phải ảnh hợp lệ');
    // Lưu thẳng trong CSDL dạng data URL: ổ đĩa máy chủ (Render) bị xoá mỗi lần deploy/khởi động lại,
    // và đường dẫn tương đối /api/... trỏ nhầm sang tên miền frontend. Trình duyệt đã thu nhỏ ảnh còn ~256px (vài chục KB).
    if (buf.length > 300 * 1024) throw badRequest('Ảnh quá lớn sau khi thu nhỏ, vui lòng chọn ảnh khác');
    const name = `${crypto.randomUUID()}.${ext}`;
    const url = `data:${mime};base64,${buf.toString('base64')}`;
    const old = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { avatarUrl: true } });
    await prisma.$transaction([
      prisma.mediaFile.create({
        data: { ownerId: userId, storageKey: `inline/avatars/${name}`, url, mimeType: mime, sizeBytes: BigInt(buf.length), checksumSha256: crypto.createHash('sha256').update(buf).digest('hex'), purpose: 'AVATAR', isPrivate: false },
      }),
      prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } }),
      // Ảnh cũ do người dùng tải lên → đánh dấu xoá mềm (file vẫn giữ để không gãy link đang cache)
      prisma.mediaFile.updateMany({ where: { ownerId: userId, purpose: 'AVATAR', url: old.avatarUrl ?? '__none__', deletedAt: null }, data: { deletedAt: new Date() } }),
    ]);
    return { url };
  })
);

/** Học viên tự xoá tài khoản: xoá mềm (giữ số liệu thống kê), ẩn danh email để có thể đăng ký lại, thu hồi mọi phiên */
practiceRouter.post(
  '/account/delete',
  handler(async (req) => {
    const user = me(req);
    if (user.role !== 'STUDENT') throw badRequest('Chỉ tài khoản học viên được tự xoá; vai trò khác liên hệ quản trị viên');
    const now = new Date();
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { deletedAt: now, status: 'LOCKED', lockedReason: 'Người dùng tự xoá tài khoản', email: `deleted+${user.id}@orbi.invalid` } }),
      prisma.userToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } }),
      prisma.auditLog.create({ data: { actorId: user.id, actorRole: user.role, action: 'USER_SELF_DELETE', resourceType: 'USER', resourceId: user.id, severity: 'WARN' } }),
    ]);
    return { ok: true };
  })
);

/** Lịch sử bài Nói đã nộp (tự luyện + bài được giao qua phòng luyện) kèm điểm giáo viên chấm */
practiceRouter.get(
  '/speaking/history',
  handler(async (req) => {
    const rows = await prisma.attemptAnswer.findMany({
      where: { attempt: { userId: me(req).id }, question: { type: 'SPEAKING_RESPONSE' }, audioUrl: { not: null } },
      include: { question: { select: { taskConfig: true, part: true } }, attempt: { select: { submittedAt: true, startedAt: true } }, gradingAnswers: { where: { isFinal: true }, take: 1 } },
      orderBy: { answeredAt: 'desc' },
      take: 30,
    });
    return rows.map((a) => {
      const g = a.gradingAnswers[0];
      return {
        id: a.id,
        part: (a.question.taskConfig as { title?: string } | null)?.title ?? partToFe(a.question.part),
        date: (a.attempt.submittedAt ?? a.attempt.startedAt).toISOString(),
        durationSec: Math.round(a.timeSpentMs / 1000),
        score: g ? Number(g.totalScore) : undefined,
        status: g ? ('GRADED' as const) : ('PENDING' as const),
        audioUrl: a.audioUrl,
      };
    });
  })
);
