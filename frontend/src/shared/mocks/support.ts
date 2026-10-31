import type { SupportInfo, SupportReply } from '@/shared/types';

export const SUPPORT_INFO: SupportInfo = {
  name: 'Hỗ trợ OrbiLingo',
  hotline: '0236 555 0199',
  email: 'hello@orbilingo.vn',
  hours: [8, 22],
  quickTopics: [
    { label: 'Nên thi TOEIC hay VSTEP?', message: 'Mình nên thi TOEIC hay VSTEP?' },
    { label: 'Học phí các gói', message: 'Học phí các gói thế nào?' },
    { label: 'Kiểm tra trình độ', message: 'Mình muốn kiểm tra trình độ đầu vào' },
    { label: 'Gặp tư vấn viên', message: 'Cho mình gặp tư vấn viên' },
  ],
};

export const SUPPORT_GREETING =
  'Chào bạn 👋 Mình là tư vấn viên OrbiLingo. Bạn đang ôn TOEIC hay VSTEP, mục tiêu bao nhiêu điểm? Cứ hỏi, mình trả lời ngay trong giờ trực.';

export const SUPPORT_REPLIES: SupportReply[] = [
  {
    id: 'compare',
    keywords: ['toeic hay vstep', 'vstep hay toeic', 'nen thi', 'khac nhau'],
    text: 'TOEIC phù hợp nếu bạn cần chứng chỉ cho doanh nghiệp hoặc chuẩn đầu ra nhiều trường (thang 10–990, hiệu lực 2 năm). VSTEP là chứng chỉ bậc 3–5 của Bộ GD&ĐT, hay dùng cho giáo viên, viên chức, xét tốt nghiệp và cao học. Bạn cho mình biết bạn thi để làm gì nhé?',
    links: [
      { label: 'Tìm hiểu TOEIC', to: '/toeic' },
      { label: 'Tìm hiểu VSTEP', to: '/vstep' },
    ],
  },
  {
    id: 'price',
    keywords: ['hoc phi', 'gia', 'bao nhieu tien', 'goi vip', 'thanh toan', 'phi'],
    text: 'Có 3 gói: Free 0đ (bài xếp lớp, 3 đề thi thử/tuần, sổ tay lỗi sai cơ bản), VIP TOEIC 199.000đ/30 ngày (không giới hạn đề TOEIC, kho đề ETS 2025), VSTEP Master 499.000đ/90 ngày (đề VSTEP 4 kỹ năng, 4 lượt chấm Writing + 2 lượt chấm Speaking mỗi tháng). Thanh toán chuyển khoản hoặc ví điện tử, hoàn tiền trong 7 ngày nếu chưa dùng quá 3 đề.',
    links: [{ label: 'Xem bảng giá', to: '/pricing' }],
  },
  {
    id: 'placement',
    keywords: ['dau vao', 'trinh do', 'kiem tra', 'xep lop', 'hoc thu'],
    text: 'Bạn có thể học thử 5 phút ngay không cần tài khoản. Sau khi đăng ký miễn phí sẽ có bài xếp lớp khoảng 15 phút, xong là có điểm từng kỹ năng và lộ trình theo ngày thi của bạn.',
    links: [{ label: 'Học thử 5 phút', to: '/try' }],
  },
  {
    id: 'mock',
    keywords: ['thi thu', 'de thi', 'full test', 'de mau'],
    text: 'Hiện có 96 đề full test TOEIC và 87 đề mẫu VSTEP. Phòng thi thử chạy audio một lần, tính giờ như thi thật, có giải thích từng câu sau khi nộp.',
    links: [{ label: 'Vào phòng thi thử', to: '/mock-tests' }],
  },
  {
    id: 'course',
    keywords: ['khoa hoc', 'lo trinh', 'video', 'giao vien', 'lop'],
    text: 'Khoá học là video bài giảng có bản ghi, kèm quiz sau mỗi bài. Sau bài đầu vào, hệ thống xếp lộ trình theo điểm yếu và số buổi/tuần bạn chọn.',
    links: [{ label: 'Xem khoá học', to: '/courses' }],
  },
  {
    id: 'human',
    keywords: ['tu van vien', 'nguoi that', 'goi dien', 'hotline', 'so dien thoai', 'zalo', 'lien he'],
    text: 'Bạn để lại số điện thoại hoặc email ở đây, tư vấn viên sẽ gọi lại trong giờ trực (8:00–22:00). Hoặc gọi thẳng hotline 0236 555 0199.',
    links: [{ label: 'Trang liên hệ', to: '/contact' }],
  },
  {
    id: 'hello',
    keywords: ['xin chao', 'chao', 'hello', 'hi', 'alo'],
    text: 'Chào bạn! Bạn đang ôn TOEIC hay VSTEP, và dự định thi khi nào?',
  },
  {
    id: 'thanks',
    keywords: ['cam on', 'thanks', 'thank'],
    text: 'Không có gì nè. Cần gì cứ nhắn, chúc bạn ôn thi tốt!',
  },
];

export const SUPPORT_FALLBACK =
  'Mình đã ghi nhận câu hỏi. Tư vấn viên sẽ trả lời chi tiết trong ít phút — nếu cần gấp, bạn để lại số điện thoại hoặc gọi 0236 555 0199 nhé.';
export const SUPPORT_CONTACT_ACK = 'Cảm ơn bạn, mình đã nhận thông tin liên hệ. Tư vấn viên sẽ gọi/nhắn lại trong giờ trực.';
