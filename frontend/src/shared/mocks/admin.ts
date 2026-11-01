import { PHOTOS, pravatar, unsplash } from '@/shared/components/media/Img';
import type { AppNotification, AppUser, AuditLog, CourseTreeNode, ServiceStatus, SkillTag, SystemSetting } from '@/shared/types';

const u = (id: string, fullName: string, email: string, role: AppUser['role'], status: AppUser['status'], plan: AppUser['plan'], joinedAt: string, lastActiveAt: string, streak = 0, effortPoints = 0): AppUser => ({
  id,
  fullName,
  email,
  role,
  status,
  plan,
  joinedAt,
  lastActiveAt,
  streak,
  effortPoints,
  avatarUrl: pravatar(Number(id.split('-')[1]) + 10),
});

export const MOCK_USERS: AppUser[] = [
  u('u-1', 'Nguyễn Minh Anh', 'student@orbi.edu.vn', 'STUDENT', 'ACTIVE', 'FREE', '2026-08-15', '2026-10-29T07:30:00.000Z', 12, 2480),
  u('u-2', 'Phạm Hoàng Long', 'hoanglong@gmail.com', 'STUDENT', 'ACTIVE', 'VIP', '2026-06-02', '2026-10-29T06:10:00.000Z', 61, 5420),
  u('u-3', 'Trần Thu Hà', 'teacher@orbi.edu.vn', 'TEACHER', 'ACTIVE', 'VIP', '2026-05-02', '2026-10-29T08:00:00.000Z'),
  u('u-4', 'Lê Quốc Bảo', 'head@orbi.edu.vn', 'HEAD_TEACHER', 'ACTIVE', 'VIP', '2026-03-10', '2026-10-28T17:00:00.000Z'),
  u('u-5', 'Phạm Quản Trị', 'admin@orbi.edu.vn', 'ADMIN', 'ACTIVE', 'VIP', '2026-01-01', '2026-10-29T09:00:00.000Z'),
  u('u-6', 'Đỗ Thị Mai', 'thimai@gmail.com', 'STUDENT', 'ACTIVE', 'VIP', '2026-07-12', '2026-10-28T21:00:00.000Z', 44, 5180),
  u('u-7', 'Vũ Đức Thành', 'ducthanh@gmail.com', 'STUDENT', 'ACTIVE', 'FREE', '2026-08-20', '2026-10-27T19:00:00.000Z', 3, 4960),
  u('u-8', 'Nguyễn Khánh Vy', 'khanhvy@gmail.com', 'STUDENT', 'LOCKED', 'FREE', '2026-09-01', '2026-10-22T10:00:00.000Z', 0, 4310),
  u('u-9', 'Phạm Ngọc Linh', 'linh.pham@orbi.edu.vn', 'TEACHER', 'ACTIVE', 'VIP', '2026-05-20', '2026-10-28T15:00:00.000Z'),
  u('u-10', 'Nguyễn Văn Dũng', 'dung.nguyen@orbi.edu.vn', 'TEACHER', 'ACTIVE', 'VIP', '2026-06-15', '2026-10-28T11:00:00.000Z'),
  u('u-11', 'Đinh Công Minh', 'minh.dinh@orbi.edu.vn', 'TEACHER', 'PENDING', 'FREE', '2026-10-27', '2026-10-27T09:00:00.000Z'),
  u('u-12', 'Trần Gia Huy', 'giahuy@gmail.com', 'STUDENT', 'ACTIVE', 'FREE', '2026-09-05', '2026-10-29T08:00:00.000Z', 33, 4120),
  u('u-13', 'Lý Bảo Ngọc', 'baongoc@gmail.com', 'STUDENT', 'ACTIVE', 'FREE', '2026-09-18', '2026-10-24T14:00:00.000Z', 1, 3880),
  u('u-14', 'Hoàng Minh Quân', 'minhquan@gmail.com', 'STUDENT', 'ACTIVE', 'VIP', '2026-08-01', '2026-10-28T20:30:00.000Z', 18, 3540),
  u('u-15', 'Bùi Thanh Tùng', 'thanhtung@gmail.com', 'STUDENT', 'PENDING', 'FREE', '2026-10-28', '2026-10-28T09:00:00.000Z', 0, 0),
  u('u-16', 'Võ Thanh Trúc', 'truc.vo@orbi.edu.vn', 'TEACHER', 'LOCKED', 'FREE', '2026-04-11', '2026-09-30T10:00:00.000Z'),
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'lg-1', actor: 'Phạm Quản Trị', role: 'ADMIN', action: 'UPDATE_ROLE', target: 'Đinh Công Minh → TEACHER', ip: '113.161.72.10', createdAt: '2026-10-29T08:52:00.000Z', severity: 'WARN' },
  { id: 'lg-2', actor: 'Lê Quốc Bảo', role: 'HEAD_TEACHER', action: 'APPROVE_TEST', target: 'VSTEP B2 — Đề cuối khoá 5', ip: '14.241.55.201', createdAt: '2026-10-29T08:20:00.000Z', severity: 'INFO' },
  { id: 'lg-3', actor: 'Phạm Quản Trị', role: 'ADMIN', action: 'LOCK_USER', target: 'Nguyễn Khánh Vy', ip: '113.161.72.10', createdAt: '2026-10-28T16:40:00.000Z', severity: 'CRITICAL' },
  { id: 'lg-4', actor: 'Trần Thu Hà', role: 'TEACHER', action: 'CREATE_ASSIGNMENT', target: 'ETS 2024 — Test 2 · TOEIC 650+ K12', ip: '171.224.18.9', createdAt: '2026-10-26T09:05:00.000Z', severity: 'INFO' },
  { id: 'lg-5', actor: 'system', role: 'ADMIN', action: 'BACKUP_DB', target: 'orbilingo_prod · 1.8 GB', ip: '127.0.0.1', createdAt: '2026-10-29T02:00:00.000Z', severity: 'INFO' },
  { id: 'lg-6', actor: 'Phạm Quản Trị', role: 'ADMIN', action: 'UPDATE_SETTING', target: 'free_daily_ai_quota: 5 → 3', ip: '113.161.72.10', createdAt: '2026-10-27T11:12:00.000Z', severity: 'WARN' },
  { id: 'lg-7', actor: 'Nguyễn Văn Dũng', role: 'TEACHER', action: 'UPLOAD_MATERIAL', target: 'Part 7 Double Passage Strategy.pdf', ip: '27.72.100.44', createdAt: '2026-10-24T15:00:00.000Z', severity: 'INFO' },
  { id: 'lg-8', actor: 'unknown', role: 'GUEST', action: 'LOGIN_FAILED x5', target: 'admin@orbi.edu.vn', ip: '45.133.1.77', createdAt: '2026-10-23T03:14:00.000Z', severity: 'CRITICAL' },
  { id: 'lg-9', actor: 'Phạm Quản Trị', role: 'ADMIN', action: 'DELETE_QUESTION', target: 'p7-old-114 (trùng lặp)', ip: '113.161.72.10', createdAt: '2026-10-22T10:30:00.000Z', severity: 'WARN' },
  { id: 'lg-10', actor: 'Lê Quốc Bảo', role: 'HEAD_TEACHER', action: 'REJECT_QUESTION_SET', target: '10 câu Part 7 — Đoạn ba Logistics', ip: '14.241.55.201', createdAt: '2026-10-24T10:40:00.000Z', severity: 'INFO' },
];

export const MOCK_SKILL_TAGS: SkillTag[] = [
  { id: 'tg-1', name: 'Word Form', slug: 'word-form', skill: 'GRAMMAR', questionsCount: 412 },
  { id: 'tg-2', name: 'Tense', slug: 'tense', skill: 'GRAMMAR', questionsCount: 356 },
  { id: 'tg-3', name: 'Preposition', slug: 'preposition', skill: 'GRAMMAR', questionsCount: 288 },
  { id: 'tg-4', name: 'Relative Clause', slug: 'relative-clause', skill: 'GRAMMAR', questionsCount: 190 },
  { id: 'tg-5', name: 'Paraphrase', slug: 'paraphrase', skill: 'LISTENING', questionsCount: 520 },
  { id: 'tg-6', name: 'Wh-Question', slug: 'wh-question', skill: 'LISTENING', questionsCount: 310 },
  { id: 'tg-7', name: 'Main Idea', slug: 'main-idea', skill: 'READING', questionsCount: 240 },
  { id: 'tg-8', name: 'Detail / Scanning', slug: 'detail', skill: 'READING', questionsCount: 610 },
  { id: 'tg-9', name: 'Inference', slug: 'inference', skill: 'READING', questionsCount: 275 },
  { id: 'tg-10', name: 'Business Vocabulary', slug: 'business-vocab', skill: 'VOCABULARY', questionsCount: 730 },
  { id: 'tg-11', name: 'Academic Words', slug: 'academic-words', skill: 'VOCABULARY', questionsCount: 380 },
  { id: 'tg-12', name: 'Essay Structure', slug: 'essay-structure', skill: 'WRITING', questionsCount: 64 },
];

export const MOCK_COURSE_TREE: CourseTreeNode[] = [
  {
    id: 'cat-toeic',
    title: 'TOEIC Listening & Reading',
    type: 'CATEGORY',
    meta: '4 khoá',
    children: [
      { id: 'c-toeic-foundation', title: 'TOEIC Foundation — 450 → 650', type: 'COURSE', meta: '42 bài · 8.4k HV', children: [{ id: 's1', title: 'Chương 1 — Làm quen bài thi', type: 'SECTION', meta: '3 bài' }, { id: 's2', title: 'Chương 2 — Ngữ pháp Part 5', type: 'SECTION', meta: '4 bài' }, { id: 's3', title: 'Chương 3 — Listening Part 1 & 2', type: 'SECTION', meta: '3 bài' }] },
      { id: 'c-toeic-intensive', title: 'TOEIC Intensive — 650 → 850', type: 'COURSE', meta: '56 bài · 5.1k HV', children: [{ id: 's1', title: 'Chương 1 — Part 3 & 4 nâng cao', type: 'SECTION', meta: '2 bài' }, { id: 's2', title: 'Chương 2 — Part 7 đoạn kép', type: 'SECTION', meta: '2 bài' }] },
      { id: 'c-grammar-24', title: '24 Chủ điểm Ngữ pháp', type: 'COURSE', meta: '24 bài · 11.2k HV' },
      { id: 'c-vocab-business', title: 'Từ vựng 20 chủ đề Business', type: 'COURSE', meta: '20 bài · 9.8k HV' },
    ],
  },
  {
    id: 'cat-vstep',
    title: 'VSTEP 4 kỹ năng',
    type: 'CATEGORY',
    meta: '2 khoá',
    children: [
      { id: 'c-vstep-b1', title: 'VSTEP B1 Complete', type: 'COURSE', meta: '48 bài · 6.7k HV', children: [{ id: 's1', title: 'Chương 1 — Tổng quan', type: 'SECTION', meta: '2 bài' }, { id: 's2', title: 'Chương 2 — Writing Task 1', type: 'SECTION', meta: '3 bài' }] },
      { id: 'c-vstep-b2', title: 'VSTEP B2 Master', type: 'COURSE', meta: '60 bài · 3.2k HV' },
    ],
  },
];

export const MOCK_SERVICES: ServiceStatus[] = [
  { name: 'API Gateway', status: 'UP', latencyMs: 42, uptime: '99.98%', description: 'Express REST API · v1.4.2' },
  { name: 'PostgreSQL', status: 'UP', latencyMs: 8, uptime: '99.99%', description: 'Primary DB · 30 models · 1.8 GB' },
  { name: 'Redis Cache', status: 'UP', latencyMs: 2, uptime: '99.97%', description: 'Session & quota counters' },
  { name: 'Media Storage (S3)', status: 'DEGRADED', latencyMs: 310, uptime: '99.80%', description: 'Audio/Video CDN · 128 GB used' },
  { name: 'Email Service', status: 'UP', latencyMs: 120, uptime: '99.90%', description: 'SMTP relay · 2.1k mails/ngày' },
  { name: 'Background Jobs', status: 'UP', latencyMs: 0, uptime: '99.95%', description: 'SRS scheduler · Backup · Reports' },
];

export const MOCK_SETTINGS: SystemSetting[] = [
  { key: 'site_name', label: 'Tên hệ thống', description: 'Hiển thị trên tiêu đề trang và email.', type: 'TEXT', value: 'OrbiLingo', group: 'Chung' },
  { key: 'allow_register', label: 'Cho phép đăng ký mới', description: 'Tắt để chỉ Admin tạo tài khoản.', type: 'TOGGLE', value: true, group: 'Chung' },
  { key: 'maintenance_mode', label: 'Chế độ bảo trì', description: 'Chặn truy cập người dùng thường, chỉ Admin vào được.', type: 'TOGGLE', value: false, group: 'Chung' },
  { key: 'default_exam', label: 'Kỳ thi mặc định cho học viên mới', description: 'Dùng khi học viên bỏ qua Onboarding.', type: 'SELECT', value: 'TOEIC', options: ['TOEIC', 'VSTEP'], group: 'Học tập' },
  { key: 'free_mock_per_week', label: 'Số đề thi thử miễn phí / tuần', description: 'Hạn mức cho tài khoản Free.', type: 'NUMBER', value: 3, group: 'Học tập' },
  { key: 'free_daily_dictionary', label: 'Lượt tra từ điển / ngày (Free)', description: 'Áp dụng cho Guest theo IP và Free theo tài khoản.', type: 'NUMBER', value: 50, group: 'Học tập' },
  { key: 'srs_intervals', label: 'Chu kỳ ôn tập SRS (ngày)', description: 'Các mốc nhắc ôn ngắt quãng.', type: 'TEXT', value: '1, 3, 7, 14, 30', group: 'Học tập' },
  { key: 'streak_grace_hours', label: 'Giờ ân hạn giữ chuỗi', description: 'Số giờ sau nửa đêm vẫn tính là ngày hôm trước.', type: 'NUMBER', value: 4, group: 'Động lực' },
  { key: 'effort_points_per_question', label: 'Điểm nỗ lực / câu hỏi', description: 'Điểm cộng khi hoàn thành 1 câu luyện tập.', type: 'NUMBER', value: 2, group: 'Động lực' },
  { key: 'leaderboard_reset', label: 'Chu kỳ reset bảng xếp hạng', description: 'Thời điểm làm mới điểm xếp hạng.', type: 'SELECT', value: 'Hàng tuần', options: ['Hàng ngày', 'Hàng tuần', 'Hàng tháng'], group: 'Động lực' },
  { key: 'rate_limit_rpm', label: 'Rate limit (requests/phút)', description: 'Giới hạn theo IP cho API công khai.', type: 'NUMBER', value: 120, group: 'Bảo mật' },
  { key: 'require_email_verify', label: 'Bắt buộc xác thực email', description: 'Người dùng phải xác thực trước khi vào Onboarding.', type: 'TOGGLE', value: true, group: 'Bảo mật' },
  { key: 'session_ttl_days', label: 'Thời hạn phiên đăng nhập (ngày)', description: 'Refresh token hết hạn sau số ngày này.', type: 'NUMBER', value: 30, group: 'Bảo mật' },
];

export const ADMIN_TRAFFIC = [
  { label: 'T2', value: 1840 },
  { label: 'T3', value: 2110 },
  { label: 'T4', value: 1960 },
  { label: 'T5', value: 2380 },
  { label: 'T6', value: 2540 },
  { label: 'T7', value: 3120 },
  { label: 'CN', value: 2890 },
];

export const ADMIN_SIGNUPS = [42, 58, 51, 77, 69, 95, 88, 102, 97, 120, 131, 128];

export const ADMIN_NOTIFICATIONS: AppNotification[] = [
  { id: 'an-1', title: 'Dịch vụ chấm Speaking phản hồi chậm', message: 'Thời gian xử lý trung bình 4,2 giây, vượt ngưỡng 3 giây.', type: 'SYSTEM', isRead: false, createdAt: '2026-11-02T07:15:00.000Z', link: '/admin/system' },
  { id: 'an-2', title: '28 tài khoản mới hôm qua', message: 'Tăng 18% so với trung bình tuần, 6 tài khoản nâng cấp VIP.', type: 'SYSTEM', isRead: false, createdAt: '2026-11-02T00:05:00.000Z', link: '/admin/analytics' },
  { id: 'an-3', title: 'Đăng nhập bất thường', message: '5 lần đăng nhập sai liên tiếp vào tài khoản head@orbi.edu.vn.', type: 'SYSTEM', isRead: false, createdAt: '2026-11-01T22:40:00.000Z', link: '/admin/audit-logs' },
  { id: 'an-4', title: 'Sao lưu dữ liệu hoàn tất', message: 'Bản sao lưu 01/11 lúc 03:00, dung lượng 2,4 GB.', type: 'SYSTEM', isRead: true, createdAt: '2026-11-01T03:10:00.000Z' },
];
