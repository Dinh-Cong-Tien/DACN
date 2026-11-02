/** Cấu trúc các phần thi (nội dung tham chiếu tĩnh của kỳ thi, khớp TestPartInfo ở frontend). */
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

export const TOEIC_PARTS_INFO: TestPartInfo[] = [
  { id: 'PART_1', name: 'Part 1', nameVi: 'Mô tả tranh', skill: 'Listening', questions: 6, minutes: 4, description: 'Nghe 4 câu mô tả và chọn câu đúng nhất với bức tranh.', tips: ['Quan sát tranh trước khi audio phát', 'Chú ý thì hiện tại tiếp diễn và bị động', 'Cẩn thận bẫy từ liên tưởng'] },
  { id: 'PART_2', name: 'Part 2', nameVi: 'Hỏi – Đáp', skill: 'Listening', questions: 25, minutes: 8, description: 'Nghe một câu hỏi và 3 câu trả lời, chọn câu đáp phù hợp nhất.', tips: ['Bắt từ để hỏi (Wh-word) đầu câu', 'Loại đáp án lặp từ trong câu hỏi', 'Câu trả lời gián tiếp ngày càng phổ biến'] },
  { id: 'PART_3', name: 'Part 3', nameVi: 'Hội thoại ngắn', skill: 'Listening', questions: 39, minutes: 17, description: '13 đoạn hội thoại, mỗi đoạn 3 câu hỏi. Có thể kèm bảng biểu.', tips: ['Đọc trước câu hỏi trong lúc chờ', 'Chú ý paraphrase đáp án', 'Câu hỏi suy luận thường ở cuối'] },
  { id: 'PART_4', name: 'Part 4', nameVi: 'Bài nói ngắn', skill: 'Listening', questions: 30, minutes: 16, description: '10 bài nói đơn thoại (thông báo, quảng cáo, tin nhắn thoại...).', tips: ['Xác định ngữ cảnh ngay 2 câu đầu', 'Chú ý số liệu, thời gian, địa điểm', 'Gạch chân keyword trong câu hỏi'] },
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
