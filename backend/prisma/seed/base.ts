/** Dữ liệu nền (mục 10.13): tài khoản, bộ môn, lớp, quyền, tham số, gói, rubric, nhãn kỹ năng, CMS. */
import bcrypt from 'bcryptjs';
import type { ExamPart, ExamType, SkillType, UserRole, UserStatus } from '@prisma/client';
import { DAY_MS, MOCKS, dateOnly, insertMany, log, prisma, slugify, timeOf, uuid } from './lib';

export const DEMO_PASSWORD = 'Orbi@2026';

export interface SeedCtx {
  users: Map<string, string>; // email → id
  userByName: Map<string, string>; // họ tên → id (giáo viên / tác giả)
  depts: Map<string, string>; // code → id
  tags: Map<string, string>; // slug → id
  rubrics: Map<string, string>; // code → id
  adminId: string;
  headId: string;
  /** Đăng ký nhãn kỹ năng (chưa ghi DB); gọi flushTags() trước khi ghi bảng có FK tới skill_tags */
  addTag: (slug: string, name: string, skill: SkillType, examType: ExamType | null, parentId?: string) => string;
  flushTags: () => Promise<void>;
}

// ---------- Phân quyền ----------
export const PERMISSIONS: Record<Exclude<UserRole, never>, string[]> = {
  STUDENT: ['learning.self', 'exam.take', 'class.join', 'ticket.create', 'bookmark.manage'],
  TEACHER: ['learning.self', 'class.manage', 'session.attendance', 'assignment.manage', 'grading.grade', 'student.note', 'material.upload', 'content.draft', 'ticket.create'],
  HEAD_TEACHER: [
    'class.manage', 'class.view_department', 'teacher.view', 'teacher.assign', 'content.draft', 'content.approve', 'question.approve',
    'grading.review', 'observation.manage', 'complaint.handle', 'report.department', 'ticket.create',
  ],
  ADMIN: [
    'user.manage', 'user.lock', 'role.assign', 'content.manage', 'content.approve', 'question.approve', 'class.manage', 'payment.view',
    'payment.confirm', 'payment.refund', 'plan.manage', 'ticket.handle', 'broadcast.send', 'setting.manage', 'audit.view', 'report.system',
  ],
};

const TOEIC_PARTS: { part: ExamPart; skill: SkillType; name: string }[] = [
  { part: 'TOEIC_P1', skill: 'LISTENING', name: 'Part 1 — Mô tả tranh' },
  { part: 'TOEIC_P2', skill: 'LISTENING', name: 'Part 2 — Hỏi đáp' },
  { part: 'TOEIC_P3', skill: 'LISTENING', name: 'Part 3 — Hội thoại' },
  { part: 'TOEIC_P4', skill: 'LISTENING', name: 'Part 4 — Bài nói ngắn' },
  { part: 'TOEIC_P5', skill: 'READING', name: 'Part 5 — Hoàn thành câu' },
  { part: 'TOEIC_P6', skill: 'READING', name: 'Part 6 — Hoàn thành đoạn văn' },
  { part: 'TOEIC_P7', skill: 'READING', name: 'Part 7 — Đọc hiểu' },
];
export const partTagSlug = (p: ExamPart) => p.toLowerCase().replace('_', '-'); // toeic-p1

/** Bảng quy đổi TOEIC (số câu đúng 0–100 → điểm thang 5–495), nội suy từ các mốc bảng ETS phổ biến, làm tròn 5. */
function toeicTable(anchors: [number, number][]) {
  const out: Record<string, number> = {};
  for (let c = 0; c <= 100; c++) {
    const i = anchors.findIndex(([x]) => x >= c);
    const [x1, y1] = anchors[Math.max(0, i - 1)];
    const [x2, y2] = anchors[i];
    const y = x2 === x1 ? y2 : y1 + ((y2 - y1) * (c - x1)) / (x2 - x1);
    out[c] = Math.min(495, Math.max(5, Math.round(y / 5) * 5));
  }
  return out;
}

export async function seedBase(): Promise<SeedCtx> {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = new Map<string, string>();
  const userByName = new Map<string, string>();

  // ---------- Bộ môn (từ danh mục môn học của Trưởng bộ môn) ----------
  const depts = new Map<string, string>();
  const subjects: any[] = MOCKS.MOCK_SUBJECTS;
  const deptRows = subjects.map((s) => {
    const id = uuid();
    depts.set(s.code, id);
    return { id, code: s.code, name: s.name, examType: s.examType as ExamType, description: `Bộ môn ${s.name}` };
  });
  const deptOfSubject = (subject: string) => deptRows.find((d) => d.name === subject)?.id ?? depts.get('TOEIC-LR')!;

  // ---------- Tài khoản ----------
  type U = { email: string; fullName: string; role: UserRole; status: UserStatus; avatarUrl?: string; departmentId?: string; bio?: string };
  const list: U[] = [];
  const statusOf = new Map<string, UserStatus>((MOCKS.MOCK_USERS as any[]).map((u) => [u.email, u.status]));
  const avatarOf = new Map<string, string>((MOCKS.MOCK_USERS as any[]).map((u) => [u.email, u.avatarUrl]));

  list.push({ email: 'admin@orbi.edu.vn', fullName: 'Phạm Quản Trị', role: 'ADMIN', status: 'ACTIVE', avatarUrl: avatarOf.get('admin@orbi.edu.vn') });
  list.push({ email: 'head@orbi.edu.vn', fullName: 'Lê Quốc Bảo', role: 'HEAD_TEACHER', status: 'ACTIVE', avatarUrl: avatarOf.get('head@orbi.edu.vn'), departmentId: depts.get('TOEIC-LR') });
  for (const t of MOCKS.MOCK_TEACHERS as any[]) {
    list.push({
      email: t.email,
      fullName: t.name,
      role: 'TEACHER',
      status: t.email === 'teacher@orbi.edu.vn' ? 'ACTIVE' : t.status,
      avatarUrl: t.avatarUrl,
      departmentId: deptOfSubject(t.subject),
      bio: `Giáo viên bộ môn ${t.subject}.`,
    });
  }
  const seenEmail = new Set(list.map((u) => u.email));
  const studentEmail = new Map<string, string>(); // id mock (s-1, ds-cl-2-0) → email
  for (const s of MOCKS.DEPT_STUDENTS as any[]) {
    // Học viên demo (s-1, Nguyễn Minh Anh) đăng nhập bằng student@orbi.edu.vn
    let email: string = s.id === 's-1' ? 'student@orbi.edu.vn' : s.email;
    if (seenEmail.has(email)) email = email.replace('@', `.${slugify(s.name.split(' ')[0])}@`);
    if (seenEmail.has(email)) continue;
    seenEmail.add(email);
    studentEmail.set(s.id, email);
    list.push({ email, fullName: s.name, role: 'STUDENT', status: s.id === 's-1' ? 'ACTIVE' : (statusOf.get(s.email) ?? 'ACTIVE'), avatarUrl: s.avatarUrl });
  }

  const now = new Date();
  const today = dateOnly(now);
  const today0 = () => today;
  // Ngày tham gia hợp lý cho tài khoản khởi tạo (không để mọi tài khoản = lúc chạy seed):
  //  - có ngày trong dữ liệu cũ (MOCK_USERS.joinedAt) → dùng đúng ngày đó
  //  - học viên khác → 3 ngày trước khi lớp đầu tiên khai giảng; giáo viên khác → 30 ngày trước lớp đầu tiên họ dạy
  const classStart = new Map<string, Date>((MOCKS.DEPT_CLASSES as any[]).map((c) => [c.id, dateOnly(new Date(c.createdAt))]));
  const knownJoin = new Map<string, Date>((MOCKS.MOCK_USERS as any[]).map((u) => [u.email, dateOnly(new Date(u.joinedAt))]));
  const firstClassOfStudent = new Map<string, Date>();
  for (const s of MOCKS.DEPT_STUDENTS as any[]) {
    const email = studentEmail.get(s.id);
    const d = classStart.get(s.classId);
    if (email && d && (!firstClassOfStudent.has(email) || d < firstClassOfStudent.get(email)!)) firstClassOfStudent.set(email, d);
  }
  const firstClassOfTeacher = new Map<string, Date>();
  for (const c of MOCKS.DEPT_CLASSES as any[]) {
    const t = list.find((u) => u.fullName === c.teacherName);
    const d = classStart.get(c.id)!;
    if (t && (!firstClassOfTeacher.has(t.email) || d < firstClassOfTeacher.get(t.email)!)) firstClassOfTeacher.set(t.email, d);
  }
  const joinedAt = (u: U): Date =>
    knownJoin.get(u.email) ??
    (u.role === 'STUDENT'
      ? new Date((firstClassOfStudent.get(u.email) ?? today0()).getTime() - 3 * DAY_MS)
      : new Date((firstClassOfTeacher.get(u.email) ?? new Date('2026-03-01T00:00:00Z')).getTime() - 30 * DAY_MS));
  const joinedOf = new Map(list.map((u) => [u.email, joinedAt(u)]));
  // Bộ môn trước (head_id gán sau khi có user), rồi tới user (department_id)
  await insertMany(prisma.department, deptRows);
  await insertMany(
    prisma.user,
    list.map((u) => {
      const id = uuid();
      users.set(u.email, id);
      if (u.role !== 'STUDENT') userByName.set(u.fullName, id);
      return {
        id,
        email: u.email,
        passwordHash: hash,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        departmentId: u.departmentId,
        createdAt: joinedOf.get(u.email),
        emailVerifiedAt: u.status === 'PENDING' ? null : joinedOf.get(u.email),
        lockedReason: u.status === 'LOCKED' ? 'Tạm khoá theo yêu cầu quản trị' : null,
        settings: { theme: 'system', locale: 'vi', timezone: 'Asia/Ho_Chi_Minh', dailyGoalMinutes: 30, notifyEmail: true, notifyInApp: true, showOnLeaderboard: true },
      };
    })
  );
  const headId = users.get('head@orbi.edu.vn')!;
  const adminId = users.get('admin@orbi.edu.vn')!;

  await prisma.department.updateMany({ data: { headId } });
  log('users', list.length, 'departments', deptRows.length);

  // ---------- Lớp học + thành viên + buổi học ----------
  const classRows: any[] = [];
  const memberRows: any[] = [];
  const sessionRows: any[] = [];
  const DOW: Record<string, number> = { CN: 0, T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6 };
  for (const c of MOCKS.DEPT_CLASSES as any[]) {
    const teacherId = userByName.get(c.teacherName);
    if (!teacherId) continue;
    const teacher = list.find((u) => u.fullName === c.teacherName)!;
    const id = uuid();
    const start = dateOnly(new Date(c.createdAt));
    const end = new Date(start.getTime() + 16 * 7 * DAY_MS);
    // Lớp được tạo 7 ngày trước khai giảng nhưng không sớm hơn ngày giáo viên tham gia
    const teacherJoined = joinedOf.get(teacher.email)!;
    const createdAt = new Date(Math.max(start.getTime() - 7 * DAY_MS, teacherJoined.getTime()));
    classRows.push({
      id,
      departmentId: teacher.departmentId,
      teacherId,
      name: c.name,
      code: c.code,
      examType: c.examType,
      room: c.room,
      scheduleText: c.schedule,
      coverUrl: c.coverUrl,
      startDate: start,
      endDate: end,
      maxStudents: c.studentsCount,
      description: `Lớp ${c.name} — ${c.schedule}`,
      createdAt,
    });
    for (const s of (MOCKS.DEPT_STUDENTS as any[]).filter((x) => x.classId === c.id)) {
      const sid = users.get(studentEmail.get(s.id) ?? '');
      // Vào lớp khi lớp khai giảng, nhưng không trước ngày tạo tài khoản
      const joined = joinedOf.get(studentEmail.get(s.id) ?? '');
      if (sid) memberRows.push({ classId: id, studentId: sid, joinedAt: joined && joined > start ? joined : start });
    }
    // "T2 – T4 – T6 · 19:00" → các thứ + giờ bắt đầu, buổi 90 phút
    const [daysPart, timePart] = String(c.schedule).split('·').map((x: string) => x.trim());
    const days = daysPart.split(/[–-]/).map((x: string) => DOW[x.trim()]).filter((x: number | undefined) => x !== undefined);
    const [hh, mm] = (timePart ?? '19:00').split(':').map(Number);
    const endMin = hh * 60 + mm + 90;
    const endStr = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
    // Không có dữ liệu điểm danh lịch sử thật → chỉ sinh buổi từ hôm nay trở đi (giáo viên điểm danh dần khi dạy)
    const todayUtc = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
    for (let t = Math.max(start.getTime(), todayUtc); t <= end.getTime(); t += DAY_MS) {
      const d = new Date(t);
      if (!days.includes(d.getUTCDay())) continue;
      sessionRows.push({
        classId: id,
        teacherId,
        sessionDate: d,
        startTime: timeOf(timePart ?? '19:00'),
        endTime: timeOf(endStr),
        room: c.room,
        // DONE chỉ khi giáo viên đã điểm danh (cùng quy tắc với nghiệp vụ điểm danh) — seed không có điểm danh nên mọi buổi là UPCOMING;
        // buổi đã qua mà UPCOMING = "chưa điểm danh"
        status: 'UPCOMING',
      });
    }
  }
  await insertMany(prisma.class, classRows);
  await insertMany(prisma.classMember, memberRows);
  await insertMany(prisma.classSession, sessionRows);
  log('classes', classRows.length, 'members', memberRows.length, 'sessions', sessionRows.length);

  // ---------- Quyền ----------
  await insertMany(
    prisma.rolePermission,
    Object.entries(PERMISSIONS).flatMap(([role, codes]) => codes.map((permissionCode) => ({ role: role as UserRole, permissionCode, grantedById: adminId })))
  );

  // ---------- Tham số hệ thống ----------
  const settings: any[] = (MOCKS.MOCK_SETTINGS as any[]).map((s) => ({
    key: s.key,
    groupName: s.group,
    label: s.label,
    description: s.description,
    valueType: s.type,
    value: s.value,
    options: s.options ?? undefined,
    updatedById: adminId,
  }));
  settings.push(
    {
      key: 'score.conversion.TOEIC',
      groupName: 'Quy đổi điểm',
      label: 'Bảng quy đổi điểm TOEIC Listening & Reading',
      description: 'Số câu đúng mỗi phần (0–100) → điểm thang 5–495. Đề có bảng riêng sẽ ghi đè.',
      valueType: 'JSON',
      value: {
        LISTENING: toeicTable([[0, 5], [6, 5], [10, 20], [20, 85], [30, 145], [40, 200], [50, 255], [60, 305], [70, 360], [80, 410], [90, 460], [96, 495], [100, 495]]),
        READING: toeicTable([[0, 5], [10, 5], [15, 10], [20, 60], [30, 115], [40, 170], [50, 225], [60, 275], [70, 330], [80, 385], [90, 440], [97, 495], [100, 495]]),
      },
      updatedById: adminId,
    },
    {
      key: 'score.conversion.VSTEP',
      groupName: 'Quy đổi điểm',
      label: 'Quy đổi điểm VSTEP → bậc năng lực',
      description: 'Điểm trung bình 4 kỹ năng (thang 10, làm tròn 0.5) → bậc.',
      valueType: 'JSON',
      value: { bands: [{ min: 8.5, level: 'C1' }, { min: 6, level: 'B2' }, { min: 4, level: 'B1' }, { min: 0, level: null }], perSkillMax: 10, rounding: 0.5 },
      updatedById: adminId,
    },
    { key: 'score.equivalences', groupName: 'Quy đổi điểm', label: 'Bảng tương đương CEFR – VSTEP – TOEIC – IELTS – TOEFL', valueType: 'JSON', value: MOCKS.SCORE_TABLE, updatedById: adminId },
    { key: 'exam.autosave_seconds', groupName: 'Học tập', label: 'Chu kỳ tự lưu bài thi (giây)', valueType: 'NUMBER', value: 15, updatedById: adminId }
  );
  await insertMany(prisma.systemSetting, settings);

  // ---------- Gói dịch vụ ----------
  const ENT: Record<string, object> = {
    free: { MOCK_TEST: { limit: 3, period: 'WEEK' }, MOCK_TEST_VIP: { limit: 0 }, DICTIONARY: { limit: 50, period: 'DAY' }, SRS_WORDS: { limit: 200 }, TEACHER_GRADING: { limit: 0 } },
    'vip-toeic': { MOCK_TEST: { limit: null }, MOCK_TEST_VIP: { limit: null, exam: 'TOEIC' }, DICTIONARY: { limit: null }, SRS_WORDS: { limit: null }, TEACHER_GRADING: { limit: 0 } },
    'vstep-master': { MOCK_TEST: { limit: null }, MOCK_TEST_VIP: { limit: null, exam: 'VSTEP' }, DICTIONARY: { limit: null }, SRS_WORDS: { limit: null }, TEACHER_GRADING: { limit: 4, period: 'MONTH' } },
  };
  // Quyền lợi hiển thị khớp entitlements ở trên và chức năng hệ thống đang có (không ghi tính năng chưa làm)
  const FEATURES: Record<string, { text: string; included: boolean }[]> = {
    free: [
      { text: 'Bài thi xếp lớp & lộ trình 3 chặng', included: true },
      { text: '3 đề thi thử / tuần', included: true },
      { text: 'Luyện theo Part, sổ tay lỗi sai', included: true },
      { text: 'Flashcard ôn ngắt quãng tối đa 200 từ', included: true },
      { text: '50 lượt tra từ điển / ngày', included: true },
      { text: 'Đề thi VIP', included: false },
      { text: 'Giáo viên chấm Viết / Nói', included: false },
    ],
    'vip-toeic': [
      { text: 'Tất cả quyền lợi gói Free', included: true },
      { text: 'Không giới hạn đề thi thử', included: true },
      { text: 'Mở các đề TOEIC VIP', included: true },
      { text: 'Flashcard không giới hạn số từ', included: true },
      { text: 'Tra từ điển không giới hạn', included: true },
      { text: 'Đề VSTEP VIP', included: false },
      { text: 'Giáo viên chấm Viết / Nói', included: false },
    ],
    'vstep-master': [
      { text: 'Tất cả quyền lợi gói Free', included: true },
      { text: 'Không giới hạn đề thi thử', included: true },
      { text: 'Mở các đề VSTEP VIP', included: true },
      { text: 'Flashcard không giới hạn số từ', included: true },
      { text: 'Tra từ điển không giới hạn', included: true },
      { text: '4 lượt giáo viên chấm Viết / Nói mỗi tháng', included: true },
    ],
  };
  await insertMany(
    prisma.subscriptionPlan,
    (MOCKS.PRICING_PLANS as any[]).map((p, i) => {
      const days = /(\d+)\s*ngày/.exec(p.period)?.[1];
      return {
        code: p.id.toUpperCase().replace(/-/g, '_') + (days ? `_${days}` : ''),
        name: p.name,
        description: p.description,
        price: BigInt(p.price),
        durationDays: days ? Number(days) : null,
        examScope: p.id.includes('toeic') ? 'TOEIC' : p.id.includes('vstep') ? 'VSTEP' : null,
        entitlements: ENT[p.id] ?? {},
        featuresDisplay: FEATURES[p.id] ?? [],
        badge: null, // không tự gắn nhãn 'Phổ biến nhất' khi chưa có số liệu bán thật
        isHighlighted: !!p.highlight,
        orderIndex: i,
      };
    })
  );

  // ---------- Rubric ----------
  const rubrics = new Map<string, string>();
  const crit = (arr: any[]) => arr.map((c) => ({ key: c.key, label: c.label, description: c.desc, weight: +(1 / arr.length).toFixed(4) }));
  const rubricRows = [
    { code: 'VSTEP_WRITING_T1', name: 'VSTEP Writing Task 1 — Thư / email', examType: 'VSTEP', skill: 'WRITING', criteria: crit(MOCKS.WRITING_CRITERIA) },
    { code: 'VSTEP_WRITING_T2', name: 'VSTEP Writing Task 2 — Bài luận', examType: 'VSTEP', skill: 'WRITING', criteria: crit(MOCKS.WRITING_CRITERIA) },
    { code: 'VSTEP_SPEAKING_P1', name: 'VSTEP Speaking Part 1 — Tương tác xã hội', examType: 'VSTEP', skill: 'SPEAKING', criteria: crit(MOCKS.SPEAKING_CRITERIA) },
    { code: 'VSTEP_SPEAKING_P2', name: 'VSTEP Speaking Part 2 — Thảo luận giải pháp', examType: 'VSTEP', skill: 'SPEAKING', criteria: crit(MOCKS.SPEAKING_CRITERIA) },
    { code: 'VSTEP_SPEAKING_P3', name: 'VSTEP Speaking Part 3 — Phát triển chủ đề', examType: 'VSTEP', skill: 'SPEAKING', criteria: crit(MOCKS.SPEAKING_CRITERIA) },
    { code: 'TOEIC_WRITING', name: 'TOEIC Writing', examType: 'TOEIC', skill: 'WRITING', criteria: crit(MOCKS.WRITING_CRITERIA) },
    { code: 'TOEIC_SPEAKING', name: 'TOEIC Speaking', examType: 'TOEIC', skill: 'SPEAKING', criteria: crit(MOCKS.SPEAKING_CRITERIA) },
  ].map((r) => {
    const id = uuid();
    rubrics.set(r.code, id);
    return { id, ...r, examType: r.examType as ExamType, skill: r.skill as SkillType };
  });
  await insertMany(prisma.rubric, rubricRows);

  // ---------- Nhãn kỹ năng ----------
  const tags = new Map<string, string>();
  const tagRows: any[] = [];
  const addTag = (slug: string, name: string, skill: SkillType, examType: ExamType | null, parentId?: string) => {
    if (tags.has(slug)) return tags.get(slug)!;
    const id = uuid();
    tags.set(slug, id);
    tagRows.push({ id, slug, name, skill, examType, parentId });
    return id;
  };
  for (const p of TOEIC_PARTS) addTag(partTagSlug(p.part), `TOEIC ${p.name}`, p.skill, 'TOEIC');
  for (const t of MOCKS.MOCK_SKILL_TAGS as any[]) addTag(t.slug, t.name, t.skill, null);
  let flushed = 0;
  const flushTags = async () => {
    const pending = tagRows.slice(flushed);
    flushed = tagRows.length;
    // cha trước con
    await insertMany(prisma.skillTag, pending.filter((t) => !t.parentId));
    await insertMany(prisma.skillTag, pending.filter((t) => t.parentId));
  };
  await flushTags();

  // ---------- CMS: FAQ, câu trả lời chat, bài viết, cảm nhận, tài nguyên ----------
  await insertMany(prisma.faq, [
    ...(MOCKS.FAQS as any[]).map((f, i) => ({ category: f.category, question: f.question, answer: f.answer, keywords: [], chatTexts: [], showInFaq: true, showInChat: false, orderIndex: i })),
    ...(MOCKS.SUPPORT_REPLIES as any[]).map((r, i) => ({
      category: 'Chat hỗ trợ',
      question: r.keywords?.[0] ?? r.id,
      answer: (r.texts as string[]).join('\n'),
      keywords: r.keywords ?? [],
      chatTexts: r.texts,
      links: r.links ?? undefined,
      showInFaq: false,
      showInChat: true,
      orderIndex: 100 + i,
    })),
  ]);

  const posts: any[] = [];
  const usedSlugs = new Set<string>();
  const toBlocks = (content: string[]) =>
    content.map((t) => (t.startsWith('## ') ? { type: 'heading', text: t.slice(3) } : t.startsWith('- ') ? { type: 'bullet', text: t.slice(2) } : { type: 'paragraph', text: t }));
  const pushPost = (p: any, kind: 'BLOG' | 'EXAM_GUIDE', examType?: ExamType, order?: number) => {
    let slug = p.slug;
    if (usedSlugs.has(slug)) slug = `${slug}-${(examType ?? 'blog').toLowerCase()}`;
    usedSlugs.add(slug);
    posts.push({
      kind,
      slug,
      title: p.title,
      excerpt: String(p.excerpt).slice(0, 400),
      contentBlocks: toBlocks(p.content ?? []),
      category: p.category,
      categorySlug: p.categorySlug,
      tags: p.tags ?? [],
      examType: examType ?? null,
      seriesOrder: order ?? null,
      authorId: userByName.get(p.author) ?? null,
      coverUrl: p.coverUrl,
      readMinutes: p.readMin ?? 5,
      status: 'PUBLISHED',
      publishedAt: new Date(p.date),
    });
  };
  // Series giới thiệu kỳ thi nạp trước để giữ slug gốc; bài blog trùng tiêu đề với series thì bỏ (tránh 2 bản)
  (MOCKS.TOEIC_GUIDES as any[]).forEach((p, i) => pushPost(p, 'EXAM_GUIDE', 'TOEIC', i + 1));
  (MOCKS.VSTEP_GUIDES as any[]).forEach((p, i) => pushPost(p, 'EXAM_GUIDE', 'VSTEP', i + 1));
  const guideTitles = new Set(posts.map((p) => p.title));
  for (const p of MOCKS.BLOG_POSTS as any[]) if (!guideTitles.has(p.title)) pushPost(p, 'BLOG');
  await insertMany(prisma.post, posts);

  // Cảm nhận học viên: không nạp dữ liệu mẫu (người và điểm số bịa). Chỉ thêm khi có học viên thật đồng ý công khai.

  const DOCS = [
    { key: 'tu-vung-toeic', title: 'Từ vựng TOEIC theo chủ đề (có phiên âm, ví dụ)', category: 'Từ vựng', description: 'Toàn bộ các bộ từ vựng TOEIC trong hệ thống: từ, loại từ, phiên âm, nghĩa và câu ví dụ.' },
    { key: 'ngu-phap', title: 'Tóm tắt các chủ điểm ngữ pháp', category: 'Ngữ pháp', description: 'Các chủ điểm ngữ pháp đã xuất bản kèm quy tắc và ví dụ.' },
    { key: 'quy-doi-diem', title: 'Bảng quy đổi điểm TOEIC – VSTEP – CEFR – IELTS', category: 'Quy đổi điểm', description: 'Bảng tương đương đang dùng trong công cụ quy đổi điểm của hệ thống.' },
    { key: 'chep-chinh-ta', title: 'Lời thoại các bài nghe chép chính tả', category: 'Luyện nghe', description: 'Transcript của các bài chép chính tả trong mục Luyện nghe.' },
    { key: 'de-viet-noi', title: 'Đề Viết và Nói', category: 'Viết & Nói', description: 'Đề Viết/Nói VSTEP và đề TOEIC Speaking trong ngân hàng câu hỏi.' },
  ];
  await insertMany(
    prisma.material,
    DOCS.map((d) => ({
      classId: null,
      uploadedById: adminId,
      title: d.title,
      description: d.description,
      type: 'DOC',
      category: d.category,
      fileUrl: `/api/v1/cms/resources/files/${d.key}`,
      isVip: false,
    }))
  );
  log('settings', settings.length, 'posts', posts.length, 'rubrics', rubricRows.length);

  return { users, userByName, depts, tags, rubrics, adminId, headId, addTag, flushTags };
}

export const TOEIC_PART_LIST = TOEIC_PARTS;
