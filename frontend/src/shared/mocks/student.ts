import type { Achievement, AppNotification, DailyActivity, LeaderboardEntry, Milestone, Mistake, VocabTopic, VocabWord } from '@/shared/types';
import { TOEIC_PART2, TOEIC_PART3, TOEIC_PART5, TOEIC_PART6, TOEIC_PART7, VSTEP_READING } from './questions';
import { daysFromNow } from '@/shared/utils';

export const LEARNING_PATH: Milestone[] = [
  {
    id: 'm1',
    phase: 1,
    title: 'Chặng 1 — Nền tảng',
    subtitle: 'Tuần 1–4',
    weeks: '4 tuần',
    description: 'Củng cố ngữ pháp cốt lõi, từ vựng 600 từ Business và làm quen format 7 Part.',
    status: 'DONE',
    progress: 100,
    items: [
      { id: 'p1-1', title: 'Cấu trúc đề thi TOEIC L&R', type: 'LESSON', durationMin: 12, status: 'DONE', link: '/app/courses/c-toeic-foundation/lessons/l-1-1', skill: 'Tổng quan' },
      { id: 'p1-2', title: 'Word Form: Nhận diện từ loại', type: 'LESSON', durationMin: 14, status: 'DONE', link: '/app/courses/c-toeic-foundation/lessons/l-2-1', skill: 'Grammar' },
      { id: 'p1-3', title: 'Luyện Part 5 — 30 câu', type: 'PRACTICE', durationMin: 15, status: 'DONE', link: '/app/practice/session/PART_5', skill: 'Reading' },
      { id: 'p1-4', title: 'Flashcard: Office & HR (40 từ)', type: 'VOCAB', durationMin: 10, status: 'DONE', link: '/app/vocabulary', skill: 'Vocabulary' },
    ],
  },
  {
    id: 'm2',
    phase: 2,
    title: 'Chặng 2 — Chuyên sâu',
    subtitle: 'Tuần 5–9',
    weeks: '5 tuần',
    description: 'Chiến thuật từng Part, xử lý bẫy Listening Part 3–4 và tăng tốc đọc Part 7.',
    status: 'CURRENT',
    progress: 46,
    items: [
      { id: 'p2-1', title: 'Part 2: 5 dạng câu hỏi Wh-', type: 'LESSON', durationMin: 13, status: 'DONE', link: '/app/courses/c-toeic-foundation/lessons/l-3-2', skill: 'Listening' },
      { id: 'p2-2', title: 'Luyện Part 2 — 25 câu', type: 'PRACTICE', durationMin: 15, status: 'DONE', link: '/app/practice/session/PART_2', skill: 'Listening' },
      { id: 'p2-3', title: 'Paraphrase trong Part 3', type: 'LESSON', durationMin: 15, status: 'CURRENT', link: '/app/courses/c-toeic-intensive/lessons/l-1-1', skill: 'Listening' },
      { id: 'p2-4', title: 'Luyện Part 3 — 3 hội thoại', type: 'PRACTICE', durationMin: 12, status: 'LOCKED', link: '/app/practice/session/PART_3', skill: 'Listening' },
      { id: 'p2-5', title: 'Ôn tập lỗi sai tuần này', type: 'REVIEW', durationMin: 10, status: 'LOCKED', link: '/app/review', skill: 'Review' },
      { id: 'p2-6', title: 'Mini Test Listening #1', type: 'MOCK_TEST', durationMin: 45, status: 'LOCKED', link: '/app/mock-tests/toeic-listening-mini-1', skill: 'Listening' },
    ],
  },
  {
    id: 'm3',
    phase: 3,
    title: 'Chặng 3 — Thực chiến',
    subtitle: 'Tuần 10–12',
    weeks: '3 tuần',
    description: 'Thi thử Full Test chuẩn ETS, phân tích điểm yếu và tinh chỉnh chiến thuật trước ngày thi.',
    status: 'LOCKED',
    progress: 0,
    items: [
      { id: 'p3-1', title: 'ETS 2024 — Test 1 (Full)', type: 'MOCK_TEST', durationMin: 120, status: 'LOCKED', link: '/app/mock-tests/ets-2024-01', skill: 'Full' },
      { id: 'p3-2', title: 'Phân tích lỗi & luyện điểm yếu', type: 'REVIEW', durationMin: 30, status: 'LOCKED', link: '/app/drills', skill: 'Review' },
      { id: 'p3-3', title: 'ETS 2024 — Test 2 (Full)', type: 'MOCK_TEST', durationMin: 120, status: 'LOCKED', link: '/app/mock-tests/ets-2024-02', skill: 'Full' },
    ],
  },
];

export const MOCK_MISTAKES: Mistake[] = [
  { id: 'mk-1', question: TOEIC_PART5[1], userAnswer: 'B', correctAnswer: 'C', cause: 'VOCABULARY', source: 'ETS 2024 — Test 1', date: '2026-10-25T09:30:00.000Z', count: 2, isResolved: false, nextReviewAt: daysFromNow(0) },
  { id: 'mk-2', question: TOEIC_PART5[4], userAnswer: 'B', correctAnswer: 'A', cause: 'GRAMMAR', source: 'ETS 2024 — Test 1', date: '2026-10-25T09:30:00.000Z', count: 1, isResolved: false, nextReviewAt: daysFromNow(0) },
  { id: 'mk-3', question: TOEIC_PART2[1], userAnswer: 'C', correctAnswer: 'B', cause: 'LISTENING', source: 'Luyện Part 2', date: '2026-10-22T14:10:00.000Z', count: 3, isResolved: false, nextReviewAt: daysFromNow(1) },
  { id: 'mk-4', question: TOEIC_PART7[1], userAnswer: 'D', correctAnswer: 'C', cause: 'READING', source: 'ETS 2023 — Test 5', date: '2026-10-15T08:00:00.000Z', count: 1, isResolved: false, nextReviewAt: daysFromNow(3) },
  { id: 'mk-5', question: TOEIC_PART6[1], userAnswer: 'B', correctAnswer: 'A', cause: 'READING', source: 'ETS 2023 — Test 5', date: '2026-10-15T08:00:00.000Z', count: 1, isResolved: true, nextReviewAt: daysFromNow(14) },
  { id: 'mk-6', question: TOEIC_PART3[1], userAnswer: 'A', correctAnswer: 'B', cause: 'LISTENING', source: 'Mini Test Listening #1', date: '2026-10-08T19:45:00.000Z', count: 2, isResolved: false, nextReviewAt: daysFromNow(0) },
  { id: 'mk-7', question: TOEIC_PART5[2], userAnswer: 'A', correctAnswer: 'B', cause: 'GRAMMAR', source: 'Luyện Part 5', date: '2026-10-05T10:00:00.000Z', count: 1, isResolved: true, nextReviewAt: daysFromNow(30) },
  { id: 'mk-8', question: VSTEP_READING[1], userAnswer: 'A', correctAnswer: 'B', cause: 'VOCABULARY', source: 'VSTEP B1 — Đề mẫu số 1', date: '2026-09-12T10:00:00.000Z', count: 1, isResolved: false, nextReviewAt: daysFromNow(7) },
  { id: 'mk-9', question: TOEIC_PART5[7], userAnswer: 'A', correctAnswer: 'B', cause: 'CARELESS', source: 'TOEIC Part 5 — 30 câu', date: '2026-10-22T14:10:00.000Z', count: 1, isResolved: false, nextReviewAt: daysFromNow(2) },
];

export const MISTAKE_CAUSE_LABEL: Record<string, { label: string; tone: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' | 'teal' | 'orange' | 'fuchsia' }> = {
  GRAMMAR: { label: 'Ngữ pháp', tone: 'violet' },
  VOCABULARY: { label: 'Từ vựng', tone: 'rose' },
  LISTENING: { label: 'Nghe nhầm', tone: 'sky' },
  READING: { label: 'Đọc hiểu', tone: 'amber' },
  TIME_PRESSURE: { label: 'Áp lực thời gian', tone: 'orange' },
  CARELESS: { label: 'Bất cẩn', tone: 'slate' },
  UNCLASSIFIED: { label: 'Chưa phân loại', tone: 'slate' },
};

export const VOCAB_TOPICS: VocabTopic[] = [
  { id: 'vt-office', name: 'Office & Administration', icon: '🏢', total: 40, learned: 32, gradient: 'from-indigo-500 to-violet-500' },
  { id: 'vt-hr', name: 'Human Resources', icon: '👥', total: 35, learned: 18, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'vt-marketing', name: 'Marketing & Sales', icon: '📈', total: 38, learned: 9, gradient: 'from-rose-500 to-pink-500' },
  { id: 'vt-finance', name: 'Finance & Banking', icon: '💳', total: 36, learned: 0, gradient: 'from-amber-400 to-orange-500' },
  { id: 'vt-travel', name: 'Travel & Transportation', icon: '✈️', total: 30, learned: 0, gradient: 'from-sky-500 to-cyan-500' },
  { id: 'vt-academic', name: 'VSTEP Academic Words', icon: '🎓', total: 50, learned: 12, gradient: 'from-fuchsia-500 to-purple-500' },
];

const mkWord = (id: string, word: string, ipa: string, pos: string, meaningVi: string, example: string, topic: string, status: VocabWord['status'], days: number, reps = 0): VocabWord => ({
  id,
  word,
  ipa,
  pos,
  meaningVi,
  example,
  topic,
  status,
  nextReviewAt: daysFromNow(days),
  easeFactor: 2.5,
  intervalDays: Math.max(1, days),
  repetitions: reps,
});

export const MOCK_VOCAB: VocabWord[] = [
  mkWord('w-1', 'implement', '/ˈɪm.plɪ.ment/', 'verb', 'thực hiện, triển khai', 'The company will implement the new policy next month.', 'Office & Administration', 'REVIEWING', 0, 3),
  mkWord('w-2', 'quarterly', '/ˈkwɔː.tə.li/', 'adjective', 'hàng quý', 'Managers must submit quarterly budgets.', 'Finance & Banking', 'REVIEWING', 0, 2),
  mkWord('w-3', 'reschedule', '/ˌriːˈʃedʒ.uːl/', 'verb', 'dời lịch', 'The meeting was rescheduled to Thursday.', 'Office & Administration', 'LEARNING', 0, 1),
  mkWord('w-4', 'invoice', '/ˈɪn.vɔɪs/', 'noun', 'hoá đơn', 'Please send the invoice by Friday.', 'Finance & Banking', 'LEARNING', 0, 0),
  mkWord('w-5', 'recruit', '/rɪˈkruːt/', 'verb', 'tuyển dụng', 'We are recruiting two new designers.', 'Human Resources', 'MASTERED', 21, 6),
  mkWord('w-6', 'itinerary', '/aɪˈtɪn.ər.ər.i/', 'noun', 'lịch trình chuyến đi', 'The travel agent sent us a detailed itinerary.', 'Travel & Transportation', 'LEARNING', 1, 1),
  mkWord('w-7', 'revenue', '/ˈrev.ən.juː/', 'noun', 'doanh thu', 'Revenue grew by 12% last year.', 'Finance & Banking', 'REVIEWING', 2, 3),
  mkWord('w-8', 'appoint', '/əˈpɔɪnt/', 'verb', 'bổ nhiệm', 'She was appointed director in May.', 'Human Resources', 'MASTERED', 30, 7),
  mkWord('w-9', 'campaign', '/kæmˈpeɪn/', 'noun', 'chiến dịch', 'The marketing campaign launches next week.', 'Marketing & Sales', 'LEARNING', 0, 0),
  mkWord('w-10', 'offset', '/ˈɒf.set/', 'verb', 'bù trừ, triệt tiêu', 'Higher costs offset the gains.', 'VSTEP Academic Words', 'LEARNING', 0, 0),
  mkWord('w-11', 'sustainable', '/səˈsteɪ.nə.bəl/', 'adjective', 'bền vững', 'We need sustainable growth.', 'VSTEP Academic Words', 'REVIEWING', 3, 2),
  mkWord('w-12', 'negotiate', '/nəˈɡəʊ.ʃi.eɪt/', 'verb', 'đàm phán', 'They negotiated a better contract.', 'Marketing & Sales', 'LEARNING', 0, 1),
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a-1', title: 'Bước chân đầu tiên', description: 'Hoàn thành bài thi xếp lớp', icon: '🚀', earned: true, earnedAt: '2026-08-15', progress: 1, total: 1, rarity: 'COMMON' },
  { id: 'a-2', title: 'Chuỗi 7 ngày', description: 'Học liên tục 7 ngày', icon: '🔥', earned: true, earnedAt: '2026-08-22', progress: 7, total: 7, rarity: 'COMMON' },
  { id: 'a-3', title: 'Chiến binh 30 ngày', description: 'Học liên tục 30 ngày', icon: '⚡', earned: false, progress: 12, total: 30, rarity: 'RARE' },
  { id: 'a-4', title: 'Thợ săn lỗi', description: 'Giải quyết 50 câu trong Sổ tay lỗi sai', icon: '🎯', earned: false, progress: 23, total: 50, rarity: 'RARE' },
  { id: 'a-5', title: 'Bậc thầy từ vựng', description: 'Thuộc 500 từ vựng', icon: '📚', earned: false, progress: 212, total: 500, rarity: 'EPIC' },
  { id: 'a-6', title: 'Vượt mốc 700', description: 'Đạt 700+ trong bài thi thử', icon: '🏆', earned: true, earnedAt: '2026-10-25', progress: 1, total: 1, rarity: 'EPIC' },
  { id: 'a-7', title: 'Cú đêm chăm chỉ', description: 'Học sau 22h trong 5 ngày', icon: '🦉', earned: true, earnedAt: '2026-09-30', progress: 5, total: 5, rarity: 'COMMON' },
  { id: 'a-8', title: 'Hoàn hảo', description: 'Đạt 100% một bài luyện tập 20+ câu', icon: '💎', earned: false, progress: 0, total: 1, rarity: 'LEGENDARY' },
  { id: 'a-9', title: 'Top 10 tuần', description: 'Vào top 10 bảng xếp hạng tuần', icon: '🥇', earned: false, progress: 0, total: 1, rarity: 'EPIC' },
  { id: 'a-10', title: 'Người đóng góp', description: 'Báo cáo 5 câu hỏi có vấn đề được duyệt', icon: '🛠️', earned: false, progress: 1, total: 5, rarity: 'RARE' },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Phạm Hoàng Long', initials: 'HL', points: 5420, streak: 61, delta: 0, target: 'TOEIC 900' },
  { rank: 2, name: 'Đỗ Thị Mai', initials: 'TM', points: 5180, streak: 44, delta: 1, target: 'VSTEP C1' },
  { rank: 3, name: 'Vũ Đức Thành', initials: 'ĐT', points: 4960, streak: 38, delta: -1, target: 'TOEIC 850' },
  { rank: 4, name: 'Nguyễn Khánh Vy', initials: 'KV', points: 4310, streak: 29, delta: 2, target: 'TOEIC 800' },
  { rank: 5, name: 'Trần Gia Huy', initials: 'GH', points: 4120, streak: 33, delta: 0, target: 'VSTEP B2' },
  { rank: 6, name: 'Lý Bảo Ngọc', initials: 'BN', points: 3880, streak: 21, delta: 3, target: 'TOEIC 750' },
  { rank: 7, name: 'Hoàng Minh Quân', initials: 'MQ', points: 3540, streak: 18, delta: -2, target: 'VSTEP B2' },
  { rank: 8, name: 'Nguyễn Minh Anh', initials: 'MA', points: 2480, streak: 12, delta: 4, target: 'TOEIC 750', isMe: true },
  { rank: 9, name: 'Bùi Thanh Tùng', initials: 'TT', points: 2310, streak: 9, delta: -1, target: 'TOEIC 650' },
  { rank: 10, name: 'Đặng Hải Yến', initials: 'HY', points: 2190, streak: 15, delta: 0, target: 'VSTEP B1' },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'n-1', title: '5 câu cần ôn hôm nay', message: 'Lịch ôn ngắt quãng SM-2 đã tới. Ôn ngay để không quên!', type: 'REVIEW', isRead: false, createdAt: daysFromNow(0), link: '/app/review' },
  { id: 'n-2', title: 'Bài tập mới: ETS 2024 Test 2', message: 'Giáo viên Trần Thu Hà đã giao bài, hạn nộp 02/11.', type: 'ASSIGNMENT', isRead: false, createdAt: '2026-10-28T08:00:00.000Z', link: '/app/mock-tests/ets-2024-02' },
  { id: 'n-3', title: 'Huy hiệu mới: Vượt mốc 700 🏆', message: 'Chúc mừng! Bạn đạt 715 điểm trong ETS 2024 Test 1.', type: 'ACHIEVEMENT', isRead: false, createdAt: '2026-10-25T09:40:00.000Z', link: '/app/achievements' },
  { id: 'n-4', title: 'Lớp TOEIC K12 có tài liệu mới', message: 'File "Part 7 Double Passage Strategy.pdf" vừa được tải lên.', type: 'CLASS', isRead: true, createdAt: '2026-10-24T15:00:00.000Z' },
  { id: 'n-5', title: 'Bảo trì hệ thống', message: 'Hệ thống bảo trì 02:00–03:00 ngày 30/10. Vui lòng lưu bài làm.', type: 'SYSTEM', isRead: true, createdAt: '2026-10-23T10:00:00.000Z' },
];

export const DAILY_ACTIVITY: DailyActivity[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  const minutes = [35, 50, 20, 0, 65, 45, 30][i];
  return { date: d.toISOString().slice(0, 10), minutes, questions: Math.round(minutes * 1.4) };
});

export const HEATMAP_DATA: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  const today = new Date();
  for (let i = 0; i < 16 * 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const seed = (i * 7919) % 100;
    out[key] = seed < 25 ? 0 : seed < 50 ? 12 : seed < 75 ? 28 : seed < 92 ? 45 : 70;
  }
  return out;
})();

export const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
