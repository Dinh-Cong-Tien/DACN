import { Router } from 'express';
import { z } from 'zod';
import type { Faq, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { optionalAuth } from '../../core/auth';
import { badRequest, handler, notFound, pageQuery, paged, parse } from '../../core/http';
import { ymd } from '../../core/dto';
import { gradientAt } from '../catalog/mappers';

/**
 * /api/v1/cms — nội dung công khai của website: blog & bài giới thiệu kỳ thi, FAQ, bảng giá,
 * cảm nhận học viên, tài liệu mở, bảng quy đổi điểm, số liệu trang chủ, chat hỗ trợ.
 */
export const cmsRouter = Router();

const PUBLISHED = { status: 'PUBLISHED' as const, deletedAt: null };
const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

// ---------------- Blog ----------------
type Block = string | { type?: string; text?: string; items?: string[] };
/** content_blocks → string[] theo quy ước frontend: '## ' tiêu đề, '- ' gạch đầu dòng, còn lại đoạn văn */
const toContent = (blocks: Prisma.JsonValue): string[] =>
  (Array.isArray(blocks) ? (blocks as Block[]) : []).flatMap((b) => {
    if (typeof b === 'string') return [b];
    if (b.type === 'heading') return [`## ${b.text ?? ''}`];
    if (b.type === 'bullet') return [`- ${b.text ?? ''}`];
    if (b.type === 'list') return (b.items ?? []).map((i) => `- ${i}`);
    return [b.text ?? ''];
  });

type PostRow = Prisma.PostGetPayload<{ include: { author: { select: { fullName: true; avatarUrl: true } } } }>;
const toBlogPost = (p: PostRow, i: number, withContent = true) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category ?? 'Tin tức',
  categorySlug: p.categorySlug ?? 'tin-tuc',
  author: p.author?.fullName ?? 'OrbiLingo',
  authorAvatar: p.author?.avatarUrl ?? undefined,
  date: ymd(p.publishedAt ?? p.createdAt) as string,
  readMin: p.readMinutes,
  views: p.viewsCount,
  gradient: gradientAt(i),
  coverUrl: p.coverUrl ?? undefined,
  content: withContent ? toContent(p.contentBlocks) : [],
  tags: p.tags,
  kind: p.kind,
  examType: p.examType ?? undefined,
  seriesOrder: p.seriesOrder ?? undefined,
});
const postInclude = { author: { select: { fullName: true, avatarUrl: true } } } as const;

// GET /cms/posts?category=toeic&kind=BLOG&q=&page=1&pageSize=12 → { items: BlogPost[], total, page, pageSize }
cmsRouter.get(
  '/posts',
  handler(async (req) => {
    const q = parse(pageQuery.extend({ category: z.string().optional(), kind: z.enum(['BLOG', 'EXAM_GUIDE', 'NEWS']).optional(), tag: z.string().optional() }), req.query);
    const where: Prisma.PostWhereInput = {
      ...PUBLISHED,
      kind: q.kind,
      categorySlug: q.category,
      ...(q.tag ? { tags: { has: q.tag } } : {}),
      ...(q.q ? { OR: [{ title: { contains: q.q, mode: 'insensitive' } }, { excerpt: { contains: q.q, mode: 'insensitive' } }] } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.post.findMany({ where, include: postInclude, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
      prisma.post.count({ where }),
    ]);
    return paged(rows.map((p, i) => toBlogPost(p, i, false)), total, q);
  })
);

// GET /cms/posts/categories → [{ slug, name, count }]
cmsRouter.get(
  '/posts/categories',
  handler(async () => {
    const rows = await prisma.post.groupBy({ by: ['categorySlug', 'category'], where: PUBLISHED, _count: true, orderBy: { categorySlug: 'asc' } });
    return rows.filter((r) => r.categorySlug).map((r) => ({ slug: r.categorySlug as string, name: r.category ?? r.categorySlug, count: r._count }));
  })
);

// GET /cms/exam-guides/:examType → BlogPost[] (bộ bài Giới thiệu kỳ thi, theo series_order)
cmsRouter.get(
  '/exam-guides/:examType',
  handler(async (req) => {
    const examType = parse(z.enum(['TOEIC', 'VSTEP']), String(req.params.examType).toUpperCase());
    const rows = await prisma.post.findMany({ where: { ...PUBLISHED, kind: 'EXAM_GUIDE', examType }, include: postInclude, orderBy: { seriesOrder: 'asc' } });
    return rows.map((p, i) => toBlogPost(p, i));
  })
);

// GET /cms/posts/:slug → BlogPost (+ tăng lượt xem) kèm bài liên quan
cmsRouter.get(
  '/posts/:slug',
  handler(async (req) => {
    const slug = String(req.params.slug);
    const p = await prisma.post.findFirst({ where: { ...PUBLISHED, ...(isUuid(slug) ? { id: slug } : { slug }) }, include: postInclude });
    if (!p) throw notFound('Bài viết');
    await prisma.post.update({ where: { id: p.id }, data: { viewsCount: { increment: 1 } } });
    const related = await prisma.post.findMany({
      where: { ...PUBLISHED, id: { not: p.id }, categorySlug: p.categorySlug },
      include: postInclude,
      orderBy: p.kind === 'EXAM_GUIDE' ? { seriesOrder: 'asc' } : { publishedAt: 'desc' },
      take: p.kind === 'EXAM_GUIDE' ? 20 : 3,
    });
    return { ...toBlogPost({ ...p, viewsCount: p.viewsCount + 1 }, 0), related: related.map((r, i) => toBlogPost(r, i + 1, false)) };
  })
);

// ---------------- FAQ / Bảng giá / Cảm nhận / Tài liệu ----------------

// GET /cms/faqs?category= → FaqItem[]
cmsRouter.get(
  '/faqs',
  handler(async (req) => {
    const { category } = parse(z.object({ category: z.string().optional() }), req.query);
    const rows = await prisma.faq.findMany({ where: { showInFaq: true, category }, orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }] });
    return rows.map((f) => ({ id: f.id, question: f.question, answer: f.answer, category: f.category }));
  })
);

const period = (days: number | null) => (days === null ? 'mãi mãi' : `/ ${days} ngày`);

// GET /cms/plans → PricingPlan[] (gói đang bán)
cmsRouter.get(
  '/plans',
  handler(async () => {
    const rows = await prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: [{ orderIndex: 'asc' }, { price: 'asc' }] });
    return rows.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice === null ? undefined : Number(p.compareAtPrice),
      period: period(p.durationDays),
      durationDays: p.durationDays,
      examScope: p.examScope ?? undefined,
      description: p.description ?? '',
      features: (p.featuresDisplay as { text: string; included: boolean }[]) ?? [],
      highlight: p.isHighlighted || undefined,
      badge: p.badge ?? undefined,
    }));
  })
);

/** dd/mm/yyyy như dữ liệu hiển thị ở frontend */
const dmy = (d: Date | null) => (d ? `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}` : '');

// GET /cms/testimonials?exam=TOEIC → Testimonial[]
cmsRouter.get(
  '/testimonials',
  handler(async (req) => {
    const { exam } = parse(z.object({ exam: z.enum(['TOEIC', 'VSTEP']).optional() }), req.query);
    const rows = await prisma.testimonial.findMany({ where: { isPublished: true, examType: exam }, orderBy: [{ examDate: 'desc' }, { createdAt: 'asc' }] });
    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.roleText ?? '',
      avatar: t.avatarUrl ?? undefined,
      exam: t.examType,
      test: t.testName,
      before: t.scoreBefore,
      after: t.scoreAfter,
      weeks: t.weeks,
      examDate: dmy(t.examDate),
      venue: t.venue ?? '',
      certificateId: t.certificateMasked ?? undefined,
      target: `${t.examType} ${t.scoreAfter}`,
      score: `${t.scoreBefore} → ${t.scoreAfter}`,
      quote: t.quote,
    }));
  })
);

const sizeText = (b: bigint | null) => {
  if (b === null) return '';
  const n = Number(b);
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
};

// GET /cms/resources?category= → ResourceDoc[] (tài nguyên công khai: materials.class_id NULL)
cmsRouter.get(
  '/resources',
  optionalAuth,
  handler(async (req) => {
    const { category } = parse(z.object({ category: z.string().optional() }), req.query);
    const rows = await prisma.material.findMany({ where: { classId: null, deletedAt: null, category }, orderBy: [{ downloadsCount: 'desc' }, { createdAt: 'asc' }] });
    return rows.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type === 'DOC' ? 'DOCX' : m.type,
      category: m.category ?? 'Khác',
      pages: m.pages ?? 0,
      downloads: m.downloadsCount,
      size: sizeText(m.sizeBytes),
      description: m.description ?? '',
      isVip: m.isVip,
      // Tài liệu VIP chỉ trả link khi đã đăng nhập
      fileUrl: m.isVip && !req.user ? undefined : (m.fileUrl ?? undefined),
    }));
  })
);

// POST /cms/resources/:id/download → tăng lượt tải, trả link
cmsRouter.post(
  '/resources/:id/download',
  optionalAuth,
  handler(async (req) => {
    const id = String(req.params.id);
    if (!isUuid(id)) throw notFound('Tài liệu');
    const m = await prisma.material.findFirst({ where: { id, classId: null, deletedAt: null } });
    if (!m) throw notFound('Tài liệu');
    if (m.isVip && !req.user) throw badRequest('Đăng nhập để tải tài liệu này', 'LOGIN_REQUIRED');
    const r = await prisma.material.update({ where: { id: m.id }, data: { downloadsCount: { increment: 1 } } });
    return { fileUrl: r.fileUrl, downloads: r.downloadsCount };
  })
);

// ---------------- Cấu hình công khai ----------------

// GET /cms/score-table → ScoreRow[] (system_settings 'score.equivalences')
cmsRouter.get(
  '/score-table',
  handler(async () => {
    const s = await prisma.systemSetting.findUnique({ where: { key: 'score.equivalences' } });
    return (Array.isArray(s?.value) ? s.value : []) as unknown[];
  })
);

// GET /cms/score-conversion/:examType → bảng quy đổi số câu đúng → điểm (score.conversion.TOEIC|VSTEP)
cmsRouter.get(
  '/score-conversion/:examType',
  handler(async (req) => {
    const examType = parse(z.enum(['TOEIC', 'VSTEP']), String(req.params.examType).toUpperCase());
    const s = await prisma.systemSetting.findUnique({ where: { key: `score.conversion.${examType}` } });
    if (!s) throw notFound('Bảng quy đổi');
    return s.value;
  })
);

// GET /cms/home-stats → số liệu thật cho trang chủ [{ label, value, suffix }]
cmsRouter.get(
  '/home-stats',
  handler(async () => {
    const [students, questions, tests, courses, lessons] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', deletedAt: null, status: 'ACTIVE' } }),
      prisma.question.count({ where: PUBLISHED }),
      prisma.mockTest.count({ where: { ...PUBLISHED, kind: { in: ['FULL', 'MINI'] } } }),
      prisma.course.count({ where: PUBLISHED }),
      prisma.lesson.count({ where: PUBLISHED }),
    ]);
    return [
      { key: 'students', label: 'Học viên đang học', value: students, suffix: '' },
      { key: 'questions', label: 'Câu hỏi có đáp án & lời giải', value: questions, suffix: '' },
      { key: 'tests', label: 'Đề thi thử', value: tests, suffix: '' },
      { key: 'lessons', label: 'Bài học trong khoá', value: lessons, suffix: '' },
      { key: 'courses', label: 'Khoá học', value: courses, suffix: '' },
    ];
  })
);

// ---------------- Chat hỗ trợ ----------------

/** Bỏ dấu tiếng Việt + chữ thường để khớp từ khoá */
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const toReply = (f: Faq) => ({ id: f.id, keywords: f.keywords, texts: f.chatTexts?.length ? f.chatTexts : [f.answer], links: (f.links as { label: string; to: string }[] | null) ?? undefined });

// GET /cms/support/replies → SupportReply[] (câu trả lời mẫu của chat)
cmsRouter.get(
  '/support/replies',
  handler(async () => (await prisma.faq.findMany({ where: { showInChat: true }, orderBy: { orderIndex: 'asc' } })).map(toReply))
);

const FALLBACK = ['Dạ mình đã nhận câu hỏi rồi ạ, để mình kiểm tra rồi trả lời bạn ngay nha.', 'Nếu cần gấp bạn để lại số điện thoại, mình gọi lại liền.'];

/**
 * POST /cms/support/messages { ticketId?, text, name?, email? }
 * Lưu tin nhắn vào ticket (tạo mới nếu chưa có, channel CHAT), bot trả lời theo FAQ show_in_chat.
 * Khách chưa đăng nhập phải có email ở tin đầu tiên.
 */
cmsRouter.post(
  '/support/messages',
  optionalAuth,
  handler(async (req) => {
    const body = parse(
      z.object({ ticketId: z.string().uuid().optional(), text: z.string().trim().min(1).max(2000), name: z.string().trim().max(120).optional(), email: z.string().trim().email().optional() }),
      req.body
    );
    let ticket = body.ticketId ? await prisma.ticket.findUnique({ where: { id: body.ticketId } }) : null;
    if (body.ticketId && !ticket) throw notFound('Cuộc trò chuyện');
    if (!ticket) {
      if (!req.user && !body.email) throw badRequest('Vui lòng để lại email để bên mình phản hồi', 'EMAIL_REQUIRED');
      ticket = await prisma.ticket.create({
        data: {
          userId: req.user?.id,
          guestName: req.user ? null : (body.name ?? 'Khách'),
          guestEmail: req.user ? null : body.email,
          channel: 'CHAT',
          category: 'OTHER',
          subject: body.text.slice(0, 200),
        },
      });
    }
    await prisma.ticketMessage.create({ data: { ticketId: ticket.id, senderType: 'USER', senderId: req.user?.id, text: body.text } });

    const text = normalize(body.text);
    const faqs = await prisma.faq.findMany({ where: { showInChat: true }, orderBy: { orderIndex: 'asc' } });
    const hit = faqs.find((f) => f.keywords.some((k) => text.includes(normalize(k))));
    const reply = hit ? toReply(hit) : { id: 'fallback', keywords: [], texts: FALLBACK, links: undefined };
    await prisma.ticketMessage.createMany({ data: reply.texts.map((t) => ({ ticketId: ticket.id, senderType: 'BOT', text: t, links: (reply.links ?? undefined) as Prisma.InputJsonValue | undefined })) });
    if (!hit && ticket.status === 'RESOLVED') await prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'OPEN' } });
    return { ticketId: ticket.id, reply, matched: !!hit };
  })
);

// GET /cms/support/tickets/:id/messages → ChatMessage[] của cuộc trò chuyện (id UUID không đoán được)
cmsRouter.get(
  '/support/tickets/:id/messages',
  optionalAuth,
  handler(async (req) => {
    const id = String(req.params.id);
    if (!isUuid(id)) throw notFound('Cuộc trò chuyện');
    const t = await prisma.ticket.findUnique({ where: { id }, include: { ticketMessageTickets: { orderBy: { createdAt: 'asc' } } } });
    if (!t) throw notFound('Cuộc trò chuyện');
    return {
      ticketId: t.id,
      status: t.status,
      messages: t.ticketMessageTickets.map((m) => ({
        id: m.id,
        from: m.senderType === 'USER' ? 'user' : m.senderType === 'SYSTEM' ? 'system' : 'agent',
        text: m.text,
        at: m.createdAt.toISOString(),
        links: (m.links as { label: string; to: string }[] | null) ?? undefined,
      })),
    };
  })
);

// ---------------- Bảng vinh danh công khai ----------------

/** Ngày hiện tại theo giờ Việt Nam (UTC+7), dạng YYYY-MM-DD */
const vnToday = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const shiftDays = (ymdStr: string, n: number) => new Date(new Date(`${ymdStr}T00:00:00Z`).getTime() + n * 86400_000).toISOString().slice(0, 10);

/** Khoảng [from, to) của tuần (bắt đầu thứ Hai) hoặc tháng hiện tại, lùi `back` kỳ */
function leaderboardRange(period: 'week' | 'month', back = 0) {
  const today = vnToday();
  if (period === 'week') {
    const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // 0 = thứ Hai
    const from = shiftDays(today, -dow - 7 * back);
    return { from, to: shiftDays(from, 7) };
  }
  const [y, m] = today.split('-').map(Number);
  const d0 = new Date(Date.UTC(y, m - 1 - back, 1));
  const d1 = new Date(Date.UTC(y, m - back, 1));
  return { from: d0.toISOString().slice(0, 10), to: d1.toISOString().slice(0, 10) };
}

async function publicRanking(period: 'week' | 'month', exam: 'ALL' | 'TOEIC' | 'VSTEP', back = 0) {
  const r = leaderboardRange(period, back);
  const rows = await prisma.$queryRaw<{ user_id: string; points: bigint }[]>`
    SELECT d.user_id, SUM(d.xp) AS points
    FROM daily_activities d JOIN users u ON u.id = d.user_id
    LEFT JOIN learning_goals g ON g.user_id = u.id AND g.is_active
    WHERE d.activity_date >= ${r.from}::date AND d.activity_date < ${r.to}::date
      AND u.role = 'STUDENT' AND u.deleted_at IS NULL AND u.status = 'ACTIVE'
      AND coalesce((u.settings->>'showOnLeaderboard')::boolean, true)
      AND (${exam} = 'ALL' OR g.exam_type::text = ${exam})
    GROUP BY d.user_id HAVING SUM(d.xp) > 0 ORDER BY points DESC LIMIT 100`;
  return { range: r, list: rows.map((x) => ({ userId: x.user_id, points: Number(x.points) })) };
}

// GET /cms/leaderboard?period=week|month&exam=ALL|TOEIC|VSTEP&limit=10 → { from, to, entries: LeaderboardEntry[] } (không cần đăng nhập)
cmsRouter.get(
  '/leaderboard',
  handler(async (req) => {
    const q = parse(
      z.object({ period: z.enum(['week', 'month']).default('week'), exam: z.enum(['ALL', 'TOEIC', 'VSTEP']).default('ALL'), limit: z.coerce.number().int().min(3).max(50).default(10) }),
      req.query
    );
    const [cur, prev] = await Promise.all([publicRanking(q.period, q.exam), publicRanking(q.period, q.exam, 1)]);
    const prevRank = new Map(prev.list.map((x, i) => [x.userId, i + 1]));
    const top = cur.list.slice(0, q.limit);
    const ids = top.map((x) => x.userId);
    const [users, goals] = await Promise.all([
      prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, fullName: true, avatarUrl: true, streakCurrent: true } }),
      prisma.learningGoal.findMany({ where: { userId: { in: ids }, isActive: true } }),
    ]);
    const umap = new Map(users.map((u) => [u.id, u]));
    const gmap = new Map(goals.map((g) => [g.userId, g]));
    const entries = top.map((x, i) => {
      const u = umap.get(x.userId)!;
      const g = gmap.get(x.userId);
      const pr = prevRank.get(x.userId);
      return {
        rank: i + 1,
        name: u.fullName,
        initials: u.fullName.split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase(),
        avatarUrl: u.avatarUrl ?? undefined,
        points: x.points,
        streak: u.streakCurrent,
        delta: pr ? pr - (i + 1) : 0,
        target: g ? `${g.examType} ${g.targetScore ?? g.targetLevel ?? ''}`.trim() : '',
      };
    });
    return { period: q.period, from: cur.range.from, to: shiftDays(cur.range.to, -1), entries };
  })
);
