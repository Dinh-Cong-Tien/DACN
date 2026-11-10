/**
 * Đề kiểm tra soạn riêng cho từng bài QUIZ / CHECKPOINT trong khoá (không trùng bài tập trong bài học,
 * không trùng bài kiểm tra khác, không trùng đề thi thử). Seed: prisma/seed/course-tests.ts
 */
export type AuthoredType = 'phoneme' | 'grammar-gap' | 'vocab-context' | 'listening' | 'speaking' | 'writing' | 'toeic-p2' | 'notice-cloze' | 'arrange' | 'text-cloze' | 'reading';

export interface AuthoredQuestion {
  /** Câu / tình huống cần xét (ô trống viết _____). Câu nghe có thể bỏ trống hoặc ghi câu hỏi in ra */
  text?: string;
  /** options[0] là đáp án đúng (seed tự xáo vị trí); 3–4 phương án, không trùng nhau */
  options: string[];
  /** Giải thích tiếng Việt vì sao đúng / vì sao các phương án khác sai */
  explain: string;
  /** Câu nghe: lời máy đọc cho học viên nghe (tiếng Anh). Có speak thì phải nghe mới trả lời được */
  speak?: string;
  /** Đoạn văn dùng chung (bài đọc, thông báo, tờ rơi…): các câu có cùng content được hiện chung một đoạn */
  passage?: { title?: string; content: string };
  /** Yêu cầu riêng của câu (mặc định dùng prompt của bài) */
  prompt?: string;
  /** Dạng câu riêng (mặc định dùng type của bài) */
  type?: AuthoredType;
}

export interface AuthoredTest {
  /** id bài QUIZ / CHECKPOINT trong CSDL */
  lessonId: string;
  /** tên bài (để đối chiếu khi đọc) */
  title: string;
  /** yêu cầu chung (tiếng Việt) */
  prompt: string;
  type: AuthoredType;
  questions: AuthoredQuestion[];
}
