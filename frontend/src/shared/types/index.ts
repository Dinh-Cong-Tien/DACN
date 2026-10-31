// ==========================================
// FRONTEND DOMAIN CONTRACT (UI-level types)
// Mở rộng từ @toeic-vstep/shared, dùng chung cho mock data & pages
// ==========================================
import type { ExamType, IQuestion, ReviewStatus, SkillType } from '@toeic-vstep/shared';

export type { ExamType, IQuestion, ReviewStatus, SkillType };

export type AppRole = 'GUEST' | 'STUDENT' | 'TEACHER' | 'HEAD_TEACHER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';
export type PlanType = 'FREE' | 'VIP';

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  avatarUrl?: string | null;
  status: UserStatus;
  plan: PlanType;
  target?: { examType: ExamType; score: string; examDate?: string };
  streak: number;
  effortPoints: number;
  joinedAt: string;
  lastActiveAt: string;
}

// ---------- COURSES / LESSONS ----------
export type LessonType = 'VIDEO' | 'READING' | 'QUIZ';

export interface TranscriptLine {
  start: number;
  end: number;
  text: string;
  textVi?: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number;
  videoUrl?: string;
  transcript?: TranscriptLine[];
  content?: string;
  isCompleted: boolean;
  isLocked: boolean;
  isFree?: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  examType: ExamType;
  level: string;
  description: string;
  gradient: string; // tailwind gradient classes cho thumbnail
  coverUrl?: string;
  lessonsCount: number;
  durationHours: number;
  studentsCount: number;
  rating: number;
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
  attempts: number;
  isFree: boolean;
  year: number;
  tags?: string[];
  coverUrl?: string;
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
  id: string;
  name: string;
  code: string;
  examType: ExamType;
  teacherName: string;
  studentsCount: number;
  assignmentsCount: number;
  avgScore: number;
  completionRate: number;
  attendanceRate: number;
  createdAt: string;
  schedule: string;
  gradient: string;
  coverUrl?: string;
}

export interface ClassStudent {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  email: string;
  avgScore: number;
  completion: number;
  streak: number;
  lastActive: string;
  status: 'GOOD' | 'WARNING' | 'RISK';
}

export type AssignmentType = 'MOCK_TEST' | 'PRACTICE' | 'ESSAY' | 'SPEAKING';
export type AssignmentStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

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
  grade: 'A' | 'B' | 'C' | 'D';
  trend: number;
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
  gradient: string;
  coverUrl?: string;
  authorAvatar?: string;
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
  email: string;
  /** Giờ trực, dạng [giờ mở, giờ đóng] theo giờ VN */
  hours: [number, number];
  quickTopics: { label: string; message: string }[];
}
