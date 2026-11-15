// ==========================================
// FRONTEND DOMAIN CONTRACT (UI-level types)
// Mở rộng từ @toeic-vstep/shared, dùng chung cho mock data & pages
// ==========================================
import type { ArticleGraphIndex, ExamType, IQuestion, ReviewStatus, SkillType } from '@toeic-vstep/shared';

export type { ExamType, IQuestion, ReviewStatus, SkillType };

export type AppRole = 'GUEST' | 'STUDENT' | 'TEACHER' | 'HEAD_TEACHER' | 'ADMIN';

/** Chế độ màu giao diện: sáng, tối hoặc theo cài đặt hệ điều hành */
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';
export type PlanType = 'FREE' | 'VIP';

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  avatarUrl?: string | null;
  status: UserStatus;
  /** Bộ môn của giáo viên / trưởng bộ môn */
  departmentId?: string | null;
  plan: PlanType;
  target?: { examType: ExamType; score: string; examDate?: string };
  streak: number;
  effortPoints: number;
  joinedAt: string;
  /** null = chưa từng hoạt động */
  lastActiveAt: string | null;
  /** Hồ sơ mở rộng trả về từ /auth/me */
  phone?: string;
  bio?: string;
  organization?: string;
  city?: string;
  settings?: Record<string, unknown>;
}

// ---------- COURSES / LESSONS ----------
export type LessonType = 'VIDEO' | 'READING' | 'QUIZ';
/**
 * Mục Khoá học chỉ gồm 3 lộ trình kiến thức chung, học lần lượt từ Bài 1 (bài sau mở khi xong bài trước).
 * Luyện thi theo đề nằm ở TOEIC / VSTEP, không nằm trong Khoá học.
 */
/** SKILL: khoá kỹ năng dùng tiếng Anh (giao tiếp, nghe, viết, công sở), không gắn với kỳ thi */
export type CourseCategory = 'GRAMMAR' | 'VOCABULARY' | 'SKILL' | 'FOUNDATION';

export interface TranscriptLine {
  start: number;
  end: number;
  text: string;
  textVi?: string;
}

/** Kiến thức đi kèm video bài giảng — khớp backend catalog/lesson-knowledge.ts */
export interface KnowledgeNode {
  label: string;
  meaningVi?: string;
  example?: string;
  children?: KnowledgeNode[];
}
export interface KnowledgePoint {
  title: string;
  formula?: string;
  note?: string;
  example?: string;
}
export interface LessonKnowledge {
  /** Chỉ ngữ pháp thật (thì, cấu trúc câu, từ loại…) */
  grammar: KnowledgePoint[];
  /** Phát âm: âm, đuôi -s/-ed, trọng âm, nối âm, ngữ điệu */
  pronunciation: KnowledgePoint[];
  /** Mẫu câu / cụm từ giao tiếp theo tình huống */
  phrases: KnowledgePoint[];
  /** Kỹ năng / mẹo làm bài */
  tips: KnowledgePoint[];
  vocab: { word: string; ipa?: string; pos?: string; meaningVi: string; example?: string }[];
  clauses: { title: string; markers: string[]; note?: string; example?: string }[];
  /** Cây mạo từ admin soạn (dùng cho bài tập a / an); giao diện học viên dùng articleGraph */
  articles: KnowledgeNode[];
}

/** Câu bài tập sau bài học / bài kiểm tra chặng — khớp backend catalog/lesson-exercises.ts */
export interface LessonExercise {
  id: string;
  type: 'vocab-meaning' | 'vocab-context' | 'grammar-formula' | 'grammar-name' | 'grammar-gap' | 'article' | 'phoneme' | 'notice-cloze' | 'arrange' | 'text-cloze' | 'reading' | 'toeic-p1' | 'toeic-p2' | 'toeic-p5' | 'toeic-p6' | 'listening' | 'speaking' | 'writing';
  prompt: string;
  /** Câu / cụm cần xét ("_____" = chỗ trống) */
  text?: string;
  options: string[];
  answer: number;
  explain: string;
  /** Đoạn văn dùng chung (bài đọc, quảng cáo, các câu cần sắp xếp; câu nghe: ảnh + audio) */
  passage?: { id?: string; title?: string; content: string; imageUrl?: string; audioUrl?: string; speak?: string };
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number;
  videoUrl?: string;
  transcript?: TranscriptLine[];
  knowledge?: LessonKnowledge;
  /** Đồ thị GraphRAG mạo từ của bài (index do backend dựng) — khớp packages/shared/src/logic/article-graphrag.ts */
  articleGraph?: ArticleGraphIndex;
  /** Bài tập sau bài học (video) hoặc đề của bài kiểm tra chặng */
  exercises?: LessonExercise[];
  /** Số câu bài tập (có ở danh sách bài, không cần tải chi tiết) */
  exerciseCount?: number;
  /** Điểm tối thiểu (%) để hoàn thành bài có bài tập / bài kiểm tra */
  passScorePct?: number;
  /** Vị trí video đã xem tới (giây) — để học tiếp đúng chỗ */
  lastPositionSec?: number;
  content?: string;
  /** Mô tả ngắn hiển thị trong danh sách bài của lộ trình */
  summary?: string;
  isCompleted: boolean;
  isLocked: boolean;
  isFree?: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  /** Phần lớn chứa chặng này (vd. 'Ôn kiến thức chung', 'Luyện theo chủ đề'); các chặng liền nhau cùng phần được gom lại */
  part?: string;
  lessons: Lesson[];
}

export type CourseTrack = 'TOEIC' | 'VSTEP' | 'THPT';
export const TRACK_LABEL: Record<CourseTrack, string> = { TOEIC: 'TOEIC', VSTEP: 'VSTEP', THPT: 'Tiếng Anh THPT' };

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: CourseCategory;
  /** Chỉ dùng cho khoá gắn với một kỳ thi (dữ liệu giáo viên / admin) */
  examType?: ExamType;
  /** Mục chính trong menu Khoá học */
  track?: CourseTrack;
  /** Nhóm trong mục chính (vd "Listening · Part 1–4", "Lớp 10") */
  trackGroup?: string;
  /** Học tuần tự (xong bài trước mới mở bài sau); khoá ôn thi = false */
  isSequential?: boolean;
  level: string;
  description: string;
  gradient: string; // tailwind gradient classes cho thumbnail
  coverUrl?: string;
  lessonsCount: number;
  durationHours: number;
  studentsCount: number;
  /** Điểm đánh giá trung bình — không có khi chưa có lượt đánh giá thật */
  rating?: number;
  isFree: boolean;
  progress?: number;
  teacherName: string;
  sections: CourseSection[];
}

export interface DictionaryEntry {
  word: string;
  ipa: string;
  pos: string;
  meaningVi: string;
  meaningEn: string;
  example: string;
}

// ---------- TESTS / ATTEMPTS ----------
export interface MockTestSummary {
  id: string;
  slug: string;
  title: string;
  examType: ExamType;
  level: string;
  durationMinutes: number;
  totalQuestions: number;
  parts: string[];
  /** Id các phần có trong đề (PART_1…PART_7 hoặc VSTEP_LISTENING…), dùng cho chế độ luyện tập chọn Part */
  partIds: string[];
  attempts: number;
  isFree: boolean;
  year: number;
  tags?: string[];
  coverUrl?: string;
}

/** Cách làm một đề: full test theo giờ thi thật, hoặc luyện tập chọn Part và tự đặt thời gian */
export type ExamMode = 'FULL' | 'PRACTICE';
export interface ExamSetup {
  mode: ExamMode;
  /** Id phần được chọn; FULL = toàn bộ phần của đề */
  parts: string[];
  /** Thời gian làm bài (phút); null = không giới hạn (đồng hồ đếm lên, không tự nộp) */
  minutes: number | null;
}

export interface AttemptSummary {
  id: string;
  testId: string;
  testTitle: string;
  examType: ExamType;
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  date: string;
  durationSec: number;
  listening?: number;
  reading?: number;
  /** VSTEP: điểm Viết/Nói do giáo viên chấm (chưa chấm → không có) */
  writing?: number;
  speaking?: number;
  cefr?: string;
  /** GRADING: còn bài Viết/Nói chờ chấm, chưa có điểm tổng */
  status?: string;
  mode?: string;
}

export interface SkillScore {
  skill: string;
  score: number;
  max: number;
}

// ---------- MISTAKES / SRS ----------
export type MistakeCause =
  | 'GRAMMAR'
  | 'VOCABULARY'
  | 'LISTENING'
  | 'READING'
  | 'TIME_PRESSURE'
  | 'CARELESS'
  | 'UNCLASSIFIED';

export interface Mistake {
  id: string;
  question: IQuestion;
  userAnswer: string;
  correctAnswer: string;
  cause: MistakeCause;
  source: string;
  date: string;
  count: number;
  isResolved: boolean;
  nextReviewAt: string;
  note?: string;
}

export interface VocabWord {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  meaningVi: string;
  meaningEn?: string;
  example: string;
  exampleVi?: string;
  topic: string;
  status: ReviewStatus;
  nextReviewAt: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface VocabTopic {
  id: string;
  name: string;
  icon: string;
  total: number;
  learned: number;
  gradient: string;
}

export interface GrammarTopic {
  id: string;
  slug: string;
  title: string;
  level: string;
  category: string;
  summary: string;
  rules: { title: string; detail: string; example: string }[];
  questionsCount: number;
  progress: number;
}

// ---------- LEARNING PATH ----------
export type PathItemType = 'LESSON' | 'PRACTICE' | 'MOCK_TEST' | 'REVIEW' | 'VOCAB';
export type PathStatus = 'DONE' | 'CURRENT' | 'LOCKED';

export interface PathItem {
  id: string;
  title: string;
  type: PathItemType;
  durationMin: number;
  status: PathStatus;
  link: string;
  skill?: string;
}

export interface Milestone {
  id: string;
  phase: 1 | 2 | 3;
  title: string;
  subtitle: string;
  description: string;
  status: PathStatus;
  progress: number;
  weeks: string;
  items: PathItem[];
}

// ---------- GAMIFICATION ----------
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  progress: number;
  total: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  avatarUrl?: string;
  points: number;
  streak: number;
  delta: number;
  target: string;
  isMe?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'REVIEW' | 'ASSIGNMENT' | 'ACHIEVEMENT' | 'SYSTEM' | 'CLASS';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface DailyActivity {
  date: string;
  minutes: number;
  questions: number;
}

// ---------- TEACHER ----------
export interface ClassRoom {
  /** Học viên đang trong lớp (chỉ trả cho giáo viên/trưởng bộ môn/admin) — đếm học viên khác nhau khi gộp lớp */
  studentIds?: string[];
  /** Số lượt đã điểm danh (để tính chuyên cần gộp theo trọng số) */
  attendanceMarks?: number;
  id: string;
  name: string;
  code: string;
  examType: ExamType;
  /** Mục của lớp — trùng 3 mục khoá học: TOEIC / VSTEP / Tiếng Anh THPT (lớp THPT chấm thang 10 như VSTEP) */
  track?: CourseTrack;
  /** Khoá học của lớp — lớp nằm trong khoá, học viên vào lớp được ghi danh khoá */
  course?: ClassCourse;
  teacherName: string;
  studentsCount: number;
  assignmentsCount: number;
  avgScore: number;
  completionRate: number;
  attendanceRate: number;
  createdAt: string;
  schedule: string;
  /** Phòng học hoặc hình thức online */
  room?: string;
  gradient: string;
  coverUrl?: string;
}

/** Khoá học của lớp */
export interface ClassCourse {
  id: string;
  slug: string;
  title: string;
  track?: CourseTrack;
  trackGroup?: string;
}

/** Tiến độ khoá học của từng học viên trong lớp */
export interface ClassCourseProgress {
  lessonsTotal: number;
  /** Từng bài: số học viên trong lớp đã học xong, điểm bài tập trung bình */
  lessons: { lessonId: string; done: number; avgPct: number | null }[];
  students: {
    studentId: string;
    enrolled: boolean;
    lessonsDone: number;
    progressPct: number;
    /** Điểm bài tập sau bài trung bình (%) của các bài đã xong */
    avgExercisePct: number | null;
    /** Bài tiếp theo cần học (null = đã học hết khoá) */
    currentLesson: string | null;
    lastStudyAt: string | null;
  }[];
}

export interface ClassStudent {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  email: string;
  avgScore: number;
  /** % hoàn thành các bài đã đến hạn (null = chưa có bài nào đến hạn) */
  completion: number | null;
  /** % chuyên cần (null = chưa có buổi điểm danh) */
  attendanceRate?: number | null;
  streak: number;
  lastActive: string | null;
  status: 'GOOD' | 'WARNING' | 'RISK';
}

/** MOCK_TEST: full đề thi thử · PRACTICE: một số Part của đề · LESSON: bài giảng trong Khoá học · GRAMMAR: chủ điểm ngữ pháp · VOCAB: bộ flashcard từ vựng · ESSAY / SPEAKING: đề Luyện Viết / Luyện Nói */
export type AssignmentType = 'MOCK_TEST' | 'PRACTICE' | 'LESSON' | 'GRAMMAR' | 'VOCAB' | 'ESSAY' | 'SPEAKING' | 'DICTATION';
export type AssignmentStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

/** Nội dung bài giao trỏ thẳng tới chức năng học viên đang dùng, để học viên bấm là làm được ngay */
export type AssignmentTarget =
  | { kind: 'EXAM'; testId: string; setup: ExamSetup }
  | { kind: 'LESSON'; courseId: string; lessonIds: string[] }
  | { kind: 'GRAMMAR'; slug: string }
  | { kind: 'VOCAB'; topicId: string }
  | { kind: 'WRITING'; taskId: string }
  | { kind: 'SPEAKING'; partId: string }
  | { kind: 'DICTATION'; passageId: string };

/** Tình trạng một bài được giao, nhìn từ phía học viên */
export interface MyAssignmentState {
  status: 'TODO' | 'SUBMITTED' | 'GRADED' | 'MISSED';
  submittedAt?: string;
  score?: number;
  feedback?: string;
  /** Phúc khảo gần nhất (bài Viết / Nói đã có điểm) */
  appeal?: { status: 'OPEN' | 'RESOLVED' | 'REJECTED'; resolution?: string };
}

/** Tiêu chí chấm bài tự luận: dùng chung cho trang Luyện Viết / Luyện Nói của học viên và bàn chấm của giáo viên */
export interface RubricCriterion {
  key: string;
  label: string;
  desc: string;
}

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  title: string;
  type: AssignmentType;
  dueDate: string;
  submitted: number;
  total: number;
  status: AssignmentStatus;
  avgScore?: number;
  createdAt: string;
  target: AssignmentTarget;
  /** Lời dặn của giáo viên, hiện cho học viên */
  note?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  initials: string;
  avatarUrl?: string;
  submittedAt: string;
  score?: number;
  maxScore: number;
  status: 'PENDING' | 'GRADED' | 'LATE';
  type: AssignmentType;
  content?: string;
  feedback?: string;
}

/** Một buổi dạy trên lịch của giáo viên */
export type AttendanceMark = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
export interface ClassSession {
  id: string;
  classId: string;
  /** Ngày học, dạng YYYY-MM-DD */
  date: string;
  start: string;
  end: string;
  room: string;
  /** Nội dung dự kiến của buổi (giáo án) */
  topic: string;
  status: 'DONE' | 'UPCOMING' | 'CANCELLED';
  /** Điểm danh theo id học viên; chỉ có ở buổi đã dạy */
  attendance?: Record<string, AttendanceMark>;
  /** Ghi chú sau buổi dạy */
  note?: string;
}

/** Thông báo giáo viên đăng lên bảng tin lớp */
export interface ClassAnnouncement {
  id: string;
  classId: string;
  title: string;
  body: string;
  createdAt: string;
  pinned?: boolean;
  readCount: number;
}

/** Ghi chú của giáo viên về một học viên (trao đổi, nhắc nhở, liên hệ phụ huynh…) */
export interface StudentNote {
  id: string;
  studentId: string;
  date: string;
  kind: 'NOTE' | 'REMINDER' | 'CONTACT';
  text: string;
}

export interface Material {
  id: string;
  classId: string;
  title: string;
  type: 'VIDEO' | 'PDF' | 'DOC' | 'AUDIO';
  size: string;
  uploadedAt: string;
  downloads: number;
}

// ---------- HEAD TEACHER ----------
export interface Subject {
  id: string;
  name: string;
  code: string;
  examType: ExamType;
  teachersCount: number;
  classesCount: number;
  questionsCount: number;
  lead: string;
}

export interface TeacherSummary {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  email: string;
  subject: string;
  classesCount: number;
  studentsCount: number;
  avgClassScore: number;
  /** Thang của avgClassScore: 990 (lớp TOEIC) hoặc 10 (lớp VSTEP); null = chưa có điểm */
  avgClassScale?: 990 | 10 | null;
  status: UserStatus;
}

export interface ApprovalRequest {
  id: string;
  type: 'QUESTION' | 'TEST' | 'LESSON' | 'POST';
  title: string;
  author: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  summary: string;
}

export interface Complaint {
  id: string;
  student: string;
  subject: string;
  questionRef: string;
  content: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED';
  createdAt: string;
}

export interface ClassReport {
  classId: string;
  className: string;
  teacher: string;
  students: number;
  avgScore: number;
  attendance: number;
  /** null = chưa có điểm thi lẫn điểm danh nên chưa xếp loại */
  grade: 'A' | 'B' | 'C' | 'D' | null;
  /** % thay đổi điểm TB 30 ngày gần nhất so với 30 ngày trước; null = chưa đủ dữ liệu 2 kỳ */
  trend: number | null;
}

/** Kiểm định chấm bài: trưởng bộ môn chấm lại bài Viết/Nói giáo viên đã chấm, cùng bộ tiêu chí */
export interface GradingReview {
  id: string;
  classId: string;
  className: string;
  teacher: string;
  studentName: string;
  avatarUrl?: string;
  type: 'ESSAY' | 'SPEAKING';
  /** id đề trong VSTEP_WRITING_TASKS / VSTEP_SPEAKING_PARTS */
  taskId: string;
  content: string;
  gradedAt: string;
  /** Điểm theo tiêu chí (thang 10) giáo viên đã chấm, key = RubricCriterion.key */
  teacherCriteria: Record<string, number>;
  teacherFeedback: string;
  status: 'PENDING' | 'AGREED' | 'ADJUSTED';
  headCriteria?: Record<string, number>;
  headNote?: string;
}

/** Buổi dự giờ của trưởng bộ môn */
export interface ClassObservation {
  id: string;
  classId: string;
  teacher: string;
  date: string;
  start: string;
  topic: string;
  status: 'PLANNED' | 'DONE';
  /** 1–5 */
  rating?: number;
  strengths?: string;
  improvements?: string;
}

/** Học viên trong phạm vi bộ môn (gắn với lớp đang học) */
export interface DeptStudent extends Omit<ClassStudent, 'avgScore'> {
  classId: string;
  /** null = chưa có bài được chấm */
  avgScore: number | null;
  /** null = chưa có buổi nào được điểm danh */
  attendance: number | null;
}

// ---------- ADMIN ----------
export interface AuditLog {
  id: string;
  actor: string;
  role: AppRole;
  action: string;
  target: string;
  ip: string;
  createdAt: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

export interface SkillTag {
  id: string;
  name: string;
  slug: string;
  skill: SkillType;
  questionsCount: number;
  parentId?: string | null;
}

export interface CourseTreeNode {
  id: string;
  title: string;
  type: 'CATEGORY' | 'COURSE' | 'SECTION';
  children?: CourseTreeNode[];
  meta?: string;
}

export interface ServiceStatus {
  name: string;
  status: 'UP' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  uptime: string;
  description: string;
}

export interface SystemSetting {
  key: string;
  label: string;
  description: string;
  type: 'TOGGLE' | 'NUMBER' | 'TEXT' | 'SELECT';
  value: string | number | boolean;
  options?: string[];
  group: string;
}

// ---------- MARKETING ----------
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: string;
  date: string;
  readMin: number;
  /** Lượt xem */
  views?: number;
  gradient: string;
  coverUrl?: string;
  authorAvatar?: string;
  /** Từng khối nội dung: dòng bắt đầu '## ' là tiêu đề mục, '- ' là gạch đầu dòng, còn lại là đoạn văn */
  content: string[];
  tags: string[];
}

export interface ResourceDoc {
  id: string;
  title: string;
  type: 'PDF' | 'DOCX' | 'AUDIO';
  category: string;
  pages: number;
  downloads: number;
  size: string;
  description: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  highlight?: boolean;
  badge?: string;
}

export interface ScoreRow {
  cefr: string;
  vstep: string;
  toeic: string;
  ielts: string;
  toefl: string;
  description: string;
}

/** Nhận xét học viên: điểm trước/sau, ngày và nơi thi */
export interface Testimonial {
  name: string;
  role: string;
  avatar?: string;
  exam: 'TOEIC' | 'VSTEP';
  /** Tên bài thi hiển thị dưới điểm, vd "TOEIC Listening & Reading" */
  test: string;
  before: string;
  after: string;
  weeks: number;
  examDate: string;
  venue: string;
  /** Số phiếu điểm (TOEIC) hoặc số hiệu chứng chỉ (VSTEP) để đối chiếu; nên che bớt, vd "•••• 4821" */
  certificateId?: string;
  target: string;
  score: string;
  quote: string;
}

/** Khối giới thiệu kỳ thi ở trang chủ: ảnh + bảng thông tin thực tế của kỳ thi */
export interface ExamTrack {
  id: 'toeic' | 'vstep';
  name: string;
  photo: string;
  photoAlt: string;
  desc: string;
  facts: { label: string; value: string }[];
  to: string;
  cta: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface TestPartInfo {
  id: string;
  name: string;
  nameVi: string;
  skill: string;
  questions: number;
  minutes?: number;
  description: string;
  tips: string[];
}

// ============ SUPPORT CHAT ============
export interface ChatLink {
  label: string;
  to: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  /** system: dòng thông báo giữa khung, vd "Cô Hạnh đã tham gia" */
  from: 'user' | 'agent' | 'system';
  /** Người trả lời khi from = 'agent' */
  agentId?: string;
  text: string;
  /** ISO time */
  at: string;
  links?: ChatLink[];
}

/** Câu trả lời mẫu của tư vấn viên: khớp khi tin nhắn chứa một trong các từ khoá (không dấu, chữ thường) */
export interface SupportReply {
  id: string;
  keywords: string[];
  /** Mỗi phần tử là một bóng tin riêng, gửi lần lượt như người gõ thật */
  texts: string[];
  /** Người trả lời; bỏ trống = tư vấn viên đang trực */
  agentId?: string;
  links?: ChatLink[];
}

export interface SupportInfo {
  team: string;
  agents: SupportAgent[];
  /** Thời gian phản hồi hiển thị ở đầu khung */
  replyTime: string;
  /** Lời mời bật lên cạnh nút chat khi chưa mở lần nào trong phiên */
  teaser: string;
  hotline: string;
  /** Link nhắn Zalo (Zalo OA hoặc zalo.me/<số điện thoại>) */
  zaloUrl: string;
  email: string;
  /** Giờ trực, dạng [giờ mở, giờ đóng] theo giờ VN */
  hours: [number, number];
  quickTopics: { label: string; message: string }[];
}

// ---------- ADMIN: vận hành ----------
export type TicketStatus = 'OPEN' | 'PENDING' | 'RESOLVED';
/** Yêu cầu hỗ trợ: học viên gửi qua khung chat hỗ trợ, email hoặc hotline */
export interface SupportTicket {
  id: string;
  userName: string;
  email: string;
  avatarUrl?: string;
  plan: PlanType;
  channel: 'CHAT' | 'EMAIL' | 'PHONE';
  category: 'ACCOUNT' | 'PAYMENT' | 'EXAM' | 'CONTENT' | 'OTHER';
  subject: string;
  status: TicketStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  createdAt: string;
  assignee?: string;
  messages: { from: 'USER' | 'STAFF'; text: string; at: string }[];
}

/** Giao dịch mua gói VIP (khớp bảng giá học viên thấy ở /pricing) */
export interface PaymentTxn {
  id: string;
  userName: string;
  email: string;
  planId: string;
  amount: number;
  method: 'MOMO' | 'VNPAY' | 'CARD' | 'BANK';
  status: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  createdAt: string;
}

/** Thông báo hệ thống gửi tới nhóm người dùng (hiện trong chuông thông báo và/hoặc email) */
export interface Broadcast {
  id: string;
  title: string;
  body: string;
  audience: 'ALL' | 'STUDENT' | 'VIP' | 'TEACHER' | 'HEAD_TEACHER';
  channels: ('IN_APP' | 'EMAIL')[];
  status: 'SENT' | 'SCHEDULED' | 'DRAFT';
  at: string;
  reach: number;
  /** % đã mở, chỉ có khi đã gửi */
  openRate?: number;
}
