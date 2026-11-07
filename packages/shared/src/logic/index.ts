import { TOEIC_CONVERSION_MAP, VSTEP_LEVELS } from '../constants';
import { ISrsCalculateResult, MistakePrimaryCause } from '../types';

// ==========================================
// 1. THUẬT TOÁN QUY ĐỔI ĐIỂM TOEIC (ETS SCALED SCORE)
// ==========================================
export function calculateToeicScore(rawListening: number, rawReading: number) {
  const clampL = Math.max(0, Math.min(100, Math.round(rawListening)));
  const clampR = Math.max(0, Math.min(100, Math.round(rawReading)));

  // Nội suy tuyến tính từng phân đoạn dựa theo TOEIC_CONVERSION_MAP
  function getScore(raw: number, type: 'listening' | 'reading'): number {
    const keys = Object.keys(TOEIC_CONVERSION_MAP)
      .map(Number)
      .sort((a, b) => a - b);
    
    // Tìm cận dưới và cận trên
    let lower = keys[0];
    let upper = keys[keys.length - 1];

    for (let i = 0; i < keys.length - 1; i++) {
      if (raw >= keys[i] && raw <= keys[i + 1]) {
        lower = keys[i];
        upper = keys[i + 1];
        break;
      }
    }

    if (lower === upper) {
      return TOEIC_CONVERSION_MAP[lower][type];
    }

    const lowerScore = TOEIC_CONVERSION_MAP[lower][type];
    const upperScore = TOEIC_CONVERSION_MAP[upper][type];
    const ratio = (raw - lower) / (upper - lower);

    // Điểm TOEIC mỗi kỹ năng luôn chia hết cho 5
    const interpolated = lowerScore + ratio * (upperScore - lowerScore);
    return Math.round(interpolated / 5) * 5;
  }

  const listeningScore = getScore(clampL, 'listening');
  const readingScore = getScore(clampR, 'reading');

  return {
    rawListening: clampL,
    rawReading: clampR,
    listeningScore,
    readingScore,
    totalScore: listeningScore + readingScore,
  };
}

// ==========================================
// 2. THUẬT TOÁN TÍNH ĐIỂM VSTEP (4 KỸ NĂNG & QUY BẬC)
// ==========================================
export function calculateVstepScore(scores: {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
}) {
  const { listening, reading, writing, speaking } = scores;
  
  // Điểm VSTEP là trung bình cộng 4 kỹ năng trên thang điểm 10, làm tròn đến 0.5
  const rawAvg = (listening + reading + writing + speaking) / 4;
  const finalScore = Math.round(rawAvg * 2) / 2;

  let cefrLevel = 'Dưới B1';
  let isPassed = false;

  if (finalScore >= 8.5) {
    cefrLevel = 'C1';
    isPassed = true;
  } else if (finalScore >= 6.0) {
    cefrLevel = 'B2';
    isPassed = true;
  } else if (finalScore >= 4.0) {
    cefrLevel = 'B1';
    isPassed = true;
  }

  return {
    individualScores: { listening, reading, writing, speaking },
    finalScore,
    cefrLevel,
    isPassed,
  };
}

// ==========================================
// 3. THUẬT TOÁN SPACED REPETITION (SUPERMEMO SM-2)
// ==========================================
/**
 * Thuật toán SM-2 tính toán ngày ôn tập tiếp theo
 * @param currentInterval Khoảng cách hiện tại (ngày)
 * @param repetitions Số lần ghi nhớ liên tiếp
 * @param easeFactor Hệ số ghi nhớ (mặc định khởi điểm 2.5)
 * @param quality Đánh giá người học: 0 (quên hẳn) -> 5 (nhớ hoàn hảo)
 */
export function calculateNextSrsReview(params: {
  currentInterval: number;
  repetitions: number;
  easeFactor: number;
  quality: number;
}): ISrsCalculateResult {
  const { currentInterval, repetitions, easeFactor, quality } = params;

  let nextInterval: number;
  let nextRepetitions: number;

  // Nếu đánh giá dưới 3, coi như quên hoặc nhớ sai -> Reset chuỗi nhớ
  if (quality < 3) {
    nextRepetitions = 0;
    nextInterval = 1; // Ôn lại vào ngày mai
  } else {
    // Nhớ thành công
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(currentInterval * easeFactor);
    }
    nextRepetitions = repetitions + 1;
  }

  // Cập nhật Ease Factor theo công thức SM-2 chuẩn
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    intervalDays: nextInterval,
    repetitions: nextRepetitions,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    nextReviewAt: nextReviewDate,
  };
}

// ==========================================
// 4. PHÂN LOẠI LỖI (ERROR INTELLIGENCE CLASSIFIER)
// ==========================================
export function classifyMistake(params: {
  skillType: string;
  tags: string[];
  timeSpentSec?: number;
  isBlanks?: boolean;
}): MistakePrimaryCause {
  const { skillType, tags, timeSpentSec, isBlanks } = params;

  if (isBlanks) {
    return 'TIME_PRESSURE';
  }

  // Phân loại dựa trên Tags & Kỹ năng
  const tagStr = tags.join(' ').toLowerCase();

  if (tagStr.includes('tense') || tagStr.includes('passive') || tagStr.includes('clause') || tagStr.includes('grammar')) {
    return 'GRAMMAR_MISUNDERSTANDING';
  }

  if (tagStr.includes('vocab') || tagStr.includes('collocation') || tagStr.includes('idiom') || tagStr.includes('word_choice')) {
    return 'VOCABULARY_DEFICIT';
  }

  if (skillType === 'LISTENING') {
    return 'LISTENING_MISHEARD';
  }

  if (skillType === 'READING') {
    return 'READING_MISINTERPRETATION';
  }

  if (timeSpentSec && timeSpentSec < 5) {
    return 'CARELESS_MISTAKE'; // Chọn bừa hoặc ấn nhầm quá nhanh
  }

  return 'UNCLASSIFIED';
}

export * from './article-graphrag';
