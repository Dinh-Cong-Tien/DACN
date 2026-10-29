import type { AttemptSummary, MockTestSummary, SkillScore, TestPartInfo } from '@/shared/types';

export const MOCK_TESTS: MockTestSummary[] = [
  { id: 'ets-2024-01', slug: 'ets-2024-test-1', title: 'ETS TOEIC 2024 — Test 1', examType: 'TOEIC', level: '550–750', durationMinutes: 120, totalQuestions: 200, parts: ['Part 1–7'], attempts: 12840, isFree: true, year: 2024, tags: ['Full Test', 'Mới'] },
  { id: 'ets-2024-02', slug: 'ets-2024-test-2', title: 'ETS TOEIC 2024 — Test 2', examType: 'TOEIC', level: '550–750', durationMinutes: 120, totalQuestions: 200, parts: ['Part 1–7'], attempts: 9530, isFree: true, year: 2024, tags: ['Full Test'] },
  { id: 'ets-2024-03', slug: 'ets-2024-test-3', title: 'ETS TOEIC 2024 — Test 3', examType: 'TOEIC', level: '650–850', durationMinutes: 120, totalQuestions: 200, parts: ['Part 1–7'], attempts: 7210, isFree: false, year: 2024, tags: ['Full Test', 'VIP'] },
  { id: 'ets-2023-05', slug: 'ets-2023-test-5', title: 'ETS TOEIC 2023 — Test 5', examType: 'TOEIC', level: '450–650', durationMinutes: 120, totalQuestions: 200, parts: ['Part 1–7'], attempts: 15420, isFree: true, year: 2023, tags: ['Full Test', 'Phổ biến'] },
  { id: 'toeic-listening-mini-1', slug: 'toeic-listening-mini-1', title: 'TOEIC Listening Mini Test #1', examType: 'TOEIC', level: '450+', durationMinutes: 45, totalQuestions: 100, parts: ['Part 1–4'], attempts: 6230, isFree: true, year: 2024, tags: ['Listening'] },
  { id: 'toeic-reading-mini-1', slug: 'toeic-reading-mini-1', title: 'TOEIC Reading Mini Test #1', examType: 'TOEIC', level: '450+', durationMinutes: 75, totalQuestions: 100, parts: ['Part 5–7'], attempts: 5810, isFree: true, year: 2024, tags: ['Reading'] },
  { id: 'vstep-b1-01', slug: 'vstep-b1-mock-1', title: 'VSTEP B1 — Đề mẫu Bộ GD&ĐT số 1', examType: 'VSTEP', level: 'B1', durationMinutes: 160, totalQuestions: 75, parts: ['Nghe', 'Đọc', 'Viết', 'Nói'], attempts: 4120, isFree: true, year: 2024, tags: ['4 kỹ năng'] },
  { id: 'vstep-b2-01', slug: 'vstep-b2-mock-1', title: 'VSTEP B2 — Đề mẫu ĐHQG Hà Nội', examType: 'VSTEP', level: 'B2', durationMinutes: 160, totalQuestions: 75, parts: ['Nghe', 'Đọc', 'Viết', 'Nói'], attempts: 3380, isFree: true, year: 2024, tags: ['4 kỹ năng', 'Mới'] },
  { id: 'vstep-b2-02', slug: 'vstep-b2-mock-2', title: 'VSTEP B2 — Đề luyện tập số 2', examType: 'VSTEP', level: 'B2', durationMinutes: 100, totalQuestions: 60, parts: ['Nghe', 'Đọc'], attempts: 2210, isFree: false, year: 2025, tags: ['VIP'] },
  { id: 'vstep-c1-01', slug: 'vstep-c1-mock-1', title: 'VSTEP C1 — Đề nâng cao', examType: 'VSTEP', level: 'C1', durationMinutes: 160, totalQuestions: 75, parts: ['Nghe', 'Đọc', 'Viết', 'Nói'], attempts: 980, isFree: false, year: 2025, tags: ['VIP', 'Khó'] },
  { id: 'ets-2025-01', slug: 'ets-2025-test-1', title: 'ETS TOEIC 2025 — Test 1', examType: 'TOEIC', level: '650–900', durationMinutes: 120, totalQuestions: 200, parts: ['Part 1–7'], attempts: 3100, isFree: false, year: 2025, tags: ['Full Test', 'VIP', 'Mới'] },
  { id: 'toeic-part5-drill', slug: 'toeic-part5-drill', title: 'TOEIC Part 5 — 30 câu tốc độ', examType: 'TOEIC', level: '550+', durationMinutes: 15, totalQuestions: 30, parts: ['Part 5'], attempts: 18900, isFree: true, year: 2024, tags: ['Part Test', 'Phổ biến'] },
];

export const MOCK_ATTEMPTS: AttemptSummary[] = [
  { id: 'at-01', testId: 'ets-2024-01', testTitle: 'ETS TOEIC 2024 — Test 1', examType: 'TOEIC', score: 715, maxScore: 990, correct: 143, total: 200, date: '2026-10-25T09:30:00.000Z', durationSec: 6840, listening: 380, reading: 335 },
  { id: 'at-02', testId: 'toeic-part5-drill', testTitle: 'TOEIC Part 5 — 30 câu tốc độ', examType: 'TOEIC', score: 24, maxScore: 30, correct: 24, total: 30, date: '2026-10-22T14:10:00.000Z', durationSec: 720 },
  { id: 'at-03', testId: 'ets-2023-05', testTitle: 'ETS TOEIC 2023 — Test 5', examType: 'TOEIC', score: 680, maxScore: 990, correct: 136, total: 200, date: '2026-10-15T08:00:00.000Z', durationSec: 7100, listening: 360, reading: 320 },
  { id: 'at-04', testId: 'toeic-listening-mini-1', testTitle: 'TOEIC Listening Mini Test #1', examType: 'TOEIC', score: 375, maxScore: 495, correct: 76, total: 100, date: '2026-10-08T19:45:00.000Z', durationSec: 2650, listening: 375 },
  { id: 'at-05', testId: 'ets-2024-02', testTitle: 'ETS TOEIC 2024 — Test 2', examType: 'TOEIC', score: 640, maxScore: 990, correct: 128, total: 200, date: '2026-09-28T09:00:00.000Z', durationSec: 7150, listening: 340, reading: 300 },
  { id: 'at-06', testId: 'vstep-b1-01', testTitle: 'VSTEP B1 — Đề mẫu số 1', examType: 'VSTEP', score: 6.5, maxScore: 10, correct: 48, total: 60, date: '2026-09-12T10:00:00.000Z', durationSec: 5400 },
];

export const SCORE_HISTORY = [520, 560, 590, 610, 640, 680, 715];

export const SKILL_SCORES: SkillScore[] = [
  { skill: 'Part 1', score: 83, max: 100 },
  { skill: 'Part 2', score: 72, max: 100 },
  { skill: 'Part 3', score: 68, max: 100 },
  { skill: 'Part 4', score: 61, max: 100 },
  { skill: 'Part 5', score: 80, max: 100 },
  { skill: 'Part 6', score: 70, max: 100 },
  { skill: 'Part 7', score: 55, max: 100 },
];

export const RADAR_SKILLS = [
  { label: 'Listening', value: 72 },
  { label: 'Reading', value: 66 },
  { label: 'Grammar', value: 78 },
  { label: 'Vocabulary', value: 61 },
  { label: 'Speed', value: 58 },
];

export const TOEIC_PARTS_INFO: TestPartInfo[] = [
  { id: 'PART_1', name: 'Part 1', nameVi: 'Mô tả tranh', skill: 'Listening', questions: 6, description: 'Nghe 4 câu mô tả và chọn câu đúng nhất với bức tranh.', tips: ['Quan sát tranh trước khi audio phát', 'Chú ý thì hiện tại tiếp diễn và bị động', 'Cẩn thận bẫy từ liên tưởng'] },
  { id: 'PART_2', name: 'Part 2', nameVi: 'Hỏi – Đáp', skill: 'Listening', questions: 25, description: 'Nghe một câu hỏi và 3 câu trả lời, chọn câu đáp phù hợp nhất.', tips: ['Bắt từ để hỏi (Wh-word) đầu câu', 'Loại đáp án lặp từ trong câu hỏi', 'Câu trả lời gián tiếp ngày càng phổ biến'] },
  { id: 'PART_3', name: 'Part 3', nameVi: 'Hội thoại ngắn', skill: 'Listening', questions: 39, description: '13 đoạn hội thoại, mỗi đoạn 3 câu hỏi. Có thể kèm bảng biểu.', tips: ['Đọc trước câu hỏi trong lúc chờ', 'Chú ý paraphrase đáp án', 'Câu hỏi suy luận thường ở cuối'] },
  { id: 'PART_4', name: 'Part 4', nameVi: 'Bài nói ngắn', skill: 'Listening', questions: 30, description: '10 bài nói đơn thoại (thông báo, quảng cáo, tin nhắn thoại...).', tips: ['Xác định ngữ cảnh ngay 2 câu đầu', 'Chú ý số liệu, thời gian, địa điểm', 'Gạch chân keyword trong câu hỏi'] },
  { id: 'PART_5', name: 'Part 5', nameVi: 'Hoàn thành câu', skill: 'Reading', questions: 30, minutes: 10, description: 'Chọn từ/cụm từ phù hợp điền vào chỗ trống. Tập trung ngữ pháp & từ vựng.', tips: ['Nhìn 4 đáp án trước để xác định dạng bài', 'Word form: nhìn từ đứng trước/sau chỗ trống', 'Không quá 30 giây mỗi câu'] },
  { id: 'PART_6', name: 'Part 6', nameVi: 'Hoàn thành đoạn văn', skill: 'Reading', questions: 16, minutes: 8, description: '4 đoạn văn, mỗi đoạn 4 chỗ trống (gồm 1 câu chèn).', tips: ['Đọc cả đoạn để nắm ngữ cảnh', 'Câu chèn: chú ý từ nối và đại từ', 'Thì động từ phụ thuộc vào ngữ cảnh toàn đoạn'] },
  { id: 'PART_7', name: 'Part 7', nameVi: 'Đọc hiểu', skill: 'Reading', questions: 54, minutes: 55, description: 'Đoạn đơn, đoạn kép, đoạn ba. Email, quảng cáo, bài báo, tin nhắn...', tips: ['Đọc câu hỏi trước, scan đoạn văn sau', 'Đoạn kép/ba: câu hỏi liên kết thông tin', 'Quản lý thời gian: không sa lầy một đoạn'] },
];

export const VSTEP_PARTS_INFO: TestPartInfo[] = [
  { id: 'VSTEP_LISTENING', name: 'Listening', nameVi: 'Kỹ năng Nghe', skill: 'Listening', questions: 35, minutes: 40, description: '3 phần: thông báo/hướng dẫn, hội thoại, bài giảng. Nghe một lần duy nhất.', tips: ['Đọc câu hỏi trong thời gian chờ', 'Part 3 bài giảng: chú ý từ nối lập luận', 'Ghi chú keyword khi nghe'] },
  { id: 'VSTEP_READING', name: 'Reading', nameVi: 'Kỹ năng Đọc', skill: 'Reading', questions: 40, minutes: 60, description: '4 bài đọc, độ khó tăng dần từ B1 đến C1, mỗi bài 10 câu.', tips: ['Bài 1–2 dễ: làm nhanh lấy điểm', 'Bài 4 khó: chọn lọc câu dễ trước', 'Vocabulary in context: dựa vào ngữ cảnh'] },
  { id: 'VSTEP_WRITING', name: 'Writing', nameVi: 'Kỹ năng Viết', skill: 'Writing', questions: 2, minutes: 60, description: 'Task 1: viết thư/email 120 từ (20 phút). Task 2: viết luận 250 từ (40 phút).', tips: ['Task 2 chiếm 2/3 điểm', 'Dàn ý 3 phút trước khi viết', 'Đủ số từ, đúng bố cục'] },
  { id: 'VSTEP_SPEAKING', name: 'Speaking', nameVi: 'Kỹ năng Nói', skill: 'Speaking', questions: 3, minutes: 12, description: 'Part 1 giao tiếp xã hội, Part 2 thảo luận giải pháp, Part 3 phát triển chủ đề.', tips: ['Trả lời đủ ý, có ví dụ', 'Part 2: so sánh 3 lựa chọn rồi chốt', 'Part 3: dùng sơ đồ gợi ý để triển khai'] },
];
