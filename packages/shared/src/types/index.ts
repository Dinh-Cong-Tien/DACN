// ==========================================
// ORBILINGO SHARED TYPES & INTERFACES
// ==========================================

export type ExamType = 'TOEIC' | 'VSTEP';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type SkillType = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING' | 'VOCABULARY' | 'GRAMMAR';

export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_IN_BLANK'
  | 'MATCHING'
  | 'ESSAY'
  | 'SPEAKING_AUDIO';

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'COMPLETED' | 'EXPIRED';

export type MistakePrimaryCause =
  | 'GRAMMAR_MISUNDERSTANDING'
  | 'VOCABULARY_DEFICIT'
  | 'LISTENING_MISHEARD'
  | 'READING_MISINTERPRETATION'
  | 'TIME_PRESSURE'
  | 'CARELESS_MISTAKE'
  | 'UNCLASSIFIED';

export type ReviewStatus = 'LEARNING' | 'REVIEWING' | 'MASTERED';

// ==========================================
// USER & AUTH
// ==========================================
export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  streakCount: number;
  lastStudyAt?: string | null;
  profile?: IUserProfile | null;
}

export interface IUserProfile {
  fullName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
}

// ==========================================
// QUESTION & PASSAGE
// ==========================================
export interface IQuestionOption {
  key: string;   // 'A', 'B', 'C', 'D'
  text: string;  // Nội dung lựa chọn
}

export interface IQuestion {
  id: string;
  examType: ExamType;
  type: QuestionType;
  skillType: SkillType;
  partOrSkill: string;
  level: string;
  stem: string;
  options: IQuestionOption[];
  correctAnswer: { key: string } | string | string[];
  explanation?: string | null;
  difficulty: number;
  tags: string[];
  passageId?: string | null;
  passage?: IPassage | null;
  orderInPassage?: number;
}

export interface IPassage {
  id: string;
  examType: ExamType;
  partOrSkill: string;
  title?: string | null;
  content: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  /** Câu nghe không có tệp audio: lời máy đọc (text-to-speech) */
  speakText?: string | null;
}

// ==========================================
// EXAM & ATTEMPTS
// ==========================================
export interface IMockTest {
  id: string;
  title: string;
  slug: string;
  examType: ExamType;
  targetLevel?: string | null;
  durationMinutes: number;
  totalQuestions: number;
  sections: IMockTestSection[];
}

export interface IMockTestSection {
  id: string;
  name: string;
  skillType: SkillType;
  durationMins?: number | null;
  orderIndex: number;
  questions: IQuestion[];
}

export interface IExamAttemptAnswer {
  questionId: string;
  selectedKey?: string;
  textAnswer?: string;
  answeredAt: string;
  isFlagged?: boolean;
}

export interface IExamAttempt {
  id: string;
  userId: string;
  testId: string;
  status: AttemptStatus;
  answers: Record<string, IExamAttemptAnswer>;
  score?: number | null;
  listeningScore?: number | null;
  readingScore?: number | null;
  writingScore?: number | null;
  speakingScore?: number | null;
  correctCount?: number | null;
  totalCount: number;
  timeSpentSec: number;
  startedAt: string;
  submittedAt?: string | null;
  weakSkills?: Record<string, number> | null;
}

// ==========================================
// ERROR INTELLIGENCE & MISTAKE NOTEBOOK
// ==========================================
export interface IMistakeItem {
  id: string;
  userId: string;
  questionId: string;
  question: IQuestion;
  userWrongAnswer: any;
  mistakeCount: number;
  sourceContext: string;
  primaryCause: MistakePrimaryCause;
  grammarTopicTag?: string | null;
  notes?: string | null;
  isResolved: boolean;
  nextReviewAt: string;
}

// ==========================================
// SPACED REPETITION (SRS)
// ==========================================
export interface ISrsItem {
  id: string;
  userId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt?: string | null;
}

export interface ISrsCalculateResult {
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  nextReviewAt: Date;
}
