/**
 * Hằng số giao diện của khu vực công khai (không phải dữ liệu nghiệp vụ — dữ liệu lấy từ API).
 * Thông tin liên hệ, câu chào của chat hỗ trợ, mô tả hai kỳ thi trên trang chủ, slug bộ bài giới thiệu kỳ thi.
 */
import { PHOTOS } from '@/shared/components/media/Img';
import type { ExamTrack, SupportInfo } from '@/shared/types';

export const TOEIC_GUIDE_SLUG = 'gioi-thieu-toeic';
export const VSTEP_GUIDE_SLUG = 'gioi-thieu-vstep';

/** Ghi chú cho từng phần của lộ trình khoá học (theo course_sections.part_title) */
export const COURSE_PART_NOTE: Record<string, string> = {
  'Ôn kiến thức chung': 'Ôn lại kiến thức chung trước khi vào chủ đề. Kết thúc bằng bài kiểm tra giữa khoá.',
  'Luyện theo chủ đề': 'Mở sau bài kiểm tra giữa khoá. Mỗi chủ đề dùng lại kiến thức đã ôn ở Phần 1 để luyện sơ bộ.',
};

export const SUPPORT_INFO: SupportInfo = {
  team: 'Tư vấn OrbiLingo',
  agents: [
    { id: 'thu-trang', name: 'Thu Trang', role: 'Tư vấn viên', avatar: '/images/support/thu-trang.webp' },
    { id: 'co-hanh', name: 'Cô Hạnh', role: 'Cố vấn học tập', avatar: '/images/support/co-hanh.webp' },
    { id: 'minh-quan', name: 'Minh Quân', role: 'Hỗ trợ kỹ thuật', avatar: '/images/support/minh-quan.webp' },
  ],
  replyTime: 'Thường trả lời trong vài phút',
  teaser: 'Bạn đang ôn TOEIC hay VSTEP? Mình tư vấn lộ trình miễn phí nha.',
  hotline: '0236 555 0199',
  zaloUrl: 'https://zalo.me/02365550199',
  email: 'hello@orbilingo.vn',
  hours: [8, 22],
  quickTopics: [
    { label: 'Nên thi TOEIC hay VSTEP?', message: 'Mình nên thi TOEIC hay VSTEP?' },
    { label: 'Học phí', message: 'Cho mình hỏi học phí các gói' },
    { label: 'Kiểm tra trình độ', message: 'Mình muốn kiểm tra trình độ' },
    { label: 'Lỗi đăng nhập', message: 'Mình bị lỗi không đăng nhập được' },
  ],
};

export const SUPPORT_GREETING = ['Chào bạn, mình là Trang bên OrbiLingo.', 'Bạn đang ôn TOEIC hay VSTEP, cần mình hỗ trợ gì không ạ?'];
export const SUPPORT_FALLBACK = ['Dạ mình đã nhận câu hỏi rồi ạ, để mình kiểm tra rồi trả lời bạn ngay nha.', 'Nếu cần gấp bạn để lại số điện thoại, mình gọi lại liền.'];
export const SUPPORT_CONTACT_ACK = ['Dạ mình nhận được rồi ạ.', 'Mình sẽ gọi lại cho bạn trong khoảng 15 phút nữa nha.'];
export const SUPPORT_CONTACT_ACK_OFFLINE = ['Dạ mình nhận được rồi ạ.', 'Bên mình làm việc 8:00–22:00, sáng mai mình gọi lại sớm cho bạn nha.'];

/** Hai kỳ thi trên trang chủ. Dòng "Trên OrbiLingo" được điền số đề thật bằng `examTracks(counts)`. */
export function examTracks(counts: { toeic: number; vstep: number }): ExamTrack[] {
  return [
    {
      id: 'toeic',
      name: 'TOEIC Listening & Reading',
      photo: PHOTOS.team,
      photoAlt: 'Nhân viên văn phòng làm việc bên laptop',
      desc: 'Bài thi tiếng Anh môi trường công sở của ETS. Nhiều trường dùng làm chuẩn đầu ra, doanh nghiệp dùng khi tuyển dụng.',
      facts: [
        { label: 'Cấu trúc', value: 'Nghe 100 câu (45 phút) · Đọc 100 câu (75 phút)' },
        { label: 'Thang điểm', value: '10 – 990' },
        { label: 'Hiệu lực', value: '2 năm kể từ ngày thi' },
        { label: 'Trên OrbiLingo', value: `${counts.toeic} đề full test, luyện riêng từng Part 1–7` },
      ],
      to: '/toeic',
      cta: 'Xem lộ trình TOEIC',
    },
    {
      id: 'vstep',
      name: 'VSTEP bậc 3–5',
      photo: PHOTOS.campus,
      photoAlt: 'Sinh viên tung mũ trong lễ tốt nghiệp',
      desc: 'Bài thi theo Khung năng lực ngoại ngữ 6 bậc của Bộ GD&ĐT. Dùng xét chuẩn đầu ra đại học, thạc sĩ và chuẩn giáo viên.',
      facts: [
        { label: 'Cấu trúc', value: 'Nghe 40 phút · Đọc 60 phút · Viết 60 phút · Nói 12 phút' },
        { label: 'Thang điểm', value: '0 – 10, quy ra bậc 3, 4, 5 (B1, B2, C1)' },
        { label: 'Nơi thi', value: 'Trường đại học được Bộ GD&ĐT cấp phép' },
        { label: 'Trên OrbiLingo', value: `${counts.vstep} đề mẫu, Viết và Nói có giáo viên chấm` },
      ],
      to: '/vstep',
      cta: 'Xem lộ trình VSTEP',
    },
  ];
}
