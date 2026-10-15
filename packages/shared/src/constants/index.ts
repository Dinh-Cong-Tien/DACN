// ==========================================
// ORBILINGO CONSTANTS & CONVERSION TABLES
// ==========================================

export const USER_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;

export const EXAM_TYPES = ['TOEIC', 'VSTEP'] as const;

export const SKILL_TYPES = [
  'LISTENING',
  'READING',
  'WRITING',
  'SPEAKING',
  'VOCABULARY',
  'GRAMMAR',
] as const;

export const TOEIC_PARTS = [
  { id: 'PART_1', name: 'Photographs', skill: 'LISTENING', questionCount: 6 },
  { id: 'PART_2', name: 'Question-Response', skill: 'LISTENING', questionCount: 25 },
  { id: 'PART_3', name: 'Conversations', skill: 'LISTENING', questionCount: 39 },
  { id: 'PART_4', name: 'Short Talks', skill: 'LISTENING', questionCount: 30 },
  { id: 'PART_5', name: 'Incomplete Sentences', skill: 'READING', questionCount: 30 },
  { id: 'PART_6', name: 'Text Completion', skill: 'READING', questionCount: 16 },
  { id: 'PART_7', name: 'Reading Comprehension', skill: 'READING', questionCount: 54 },
] as const;

export const VSTEP_LEVELS = [
  { level: 'B1', minScore: 4.0, maxScore: 5.5, cefr: 'B1 - Đạt chuẩn ra trường Đại học' },
  { level: 'B2', minScore: 6.0, maxScore: 8.0, cefr: 'B2 - Chuẩn giáo viên / Sau đại học' },
  { level: 'C1', minScore: 8.5, maxScore: 10.0, cefr: 'C1 - Cao cấp / Chuyên ngành tiếng Anh' },
] as const;

// BẢNG QUY ĐỔI ĐIỂM TOEIC TIÊU CHUẨN (ETS RAW SCORE -> SCALED SCORE)
// Chỉ số đại diện phân đoạn cho Listening & Reading (0 - 100 câu)
export const TOEIC_CONVERSION_MAP: Record<number, { listening: number; reading: number }> = {
  0: { listening: 5, reading: 5 },
  10: { listening: 40, reading: 35 },
  20: { listening: 95, reading: 75 },
  30: { listening: 145, reading: 120 },
  40: { listening: 195, reading: 165 },
  50: { listening: 245, reading: 215 },
  60: { listening: 305, reading: 265 },
  70: { listening: 360, reading: 320 },
  75: { listening: 390, reading: 350 },
  80: { listening: 420, reading: 385 },
  85: { listening: 450, reading: 415 },
  90: { listening: 475, reading: 445 },
  95: { listening: 495, reading: 475 },
  100: { listening: 495, reading: 495 },
};
