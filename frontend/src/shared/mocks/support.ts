import type { SupportInfo, SupportReply } from '@/shared/types';

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
  // TODO: thay bằng link Zalo OA / số Zalo thật của trung tâm
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

export const SUPPORT_REPLIES: SupportReply[] = [
  {
    id: 'compare',
    keywords: ['toeic hay vstep', 'vstep hay toeic', 'nen thi', 'khac nhau'],
    agentId: 'co-hanh',
    texts: [
      'Chào em, cô là Hạnh, cố vấn học tập bên OrbiLingo.',
      'Nếu em cần chứng chỉ để xin việc hoặc trường yêu cầu chuẩn đầu ra TOEIC thì thi TOEIC (thang 10–990, hiệu lực 2 năm).',
      'Còn nếu em là giáo viên, viên chức hoặc cần xét tốt nghiệp, học cao học theo khung bậc 6 bậc thì VSTEP phù hợp hơn.',
      'Em thi để làm gì, cô gợi ý lộ trình cụ thể cho nha?',
    ],
    links: [
      { label: 'Về kỳ thi TOEIC', to: '/toeic' },
      { label: 'Về kỳ thi VSTEP', to: '/vstep' },
    ],
  },
  {
    id: 'price',
    keywords: ['hoc phi', 'gia', 'bao nhieu tien', 'goi vip', 'thanh toan', 'phi'],
    texts: [
      'Dạ bên mình có 3 gói ạ:',
      'Free 0đ: bài xếp lớp, 3 đề thi thử/tuần, sổ tay lỗi sai cơ bản.',
      'VIP TOEIC 199.000đ/30 ngày: không giới hạn đề TOEIC, có kho đề ETS 2025.',
      'VSTEP Master 499.000đ/90 ngày: đề 4 kỹ năng, mỗi tháng 4 lượt chấm Writing và 2 lượt chấm Speaking.',
      'Thanh toán chuyển khoản hoặc ví điện tử, chưa dùng quá 3 đề thì được hoàn tiền trong 7 ngày nha bạn.',
    ],
    links: [{ label: 'Xem bảng giá', to: '/pricing' }],
  },
  {
    id: 'placement',
    keywords: ['dau vao', 'trinh do', 'kiem tra', 'xep lop', 'hoc thu'],
    texts: ['Dạ bạn học thử 5 phút trước, không cần tài khoản ạ.', 'Đăng ký miễn phí xong sẽ có bài xếp lớp khoảng 15 phút, làm xong là có điểm từng kỹ năng và lộ trình theo ngày thi của bạn.'],
    links: [{ label: 'Học thử 5 phút', to: '/try' }],
  },
  {
    id: 'mock',
    keywords: ['thi thu', 'de thi', 'full test', 'de mau'],
    texts: ['Hiện có 96 đề full test TOEIC và 87 đề mẫu VSTEP ạ.', 'Phòng thi thử chạy audio một lần, tính giờ như thi thật, nộp bài xong có giải thích từng câu.'],
    links: [{ label: 'Vào phòng thi thử', to: '/mock-tests' }],
  },
  {
    id: 'course',
    keywords: ['khoa hoc', 'lo trinh', 'video', 'giao vien', 'lop'],
    texts: ['Khoá học là video bài giảng có bản ghi, học xong mỗi bài có quiz ngắn ạ.', 'Sau bài xếp lớp, hệ thống tự xếp lộ trình theo điểm yếu và số buổi/tuần bạn chọn.'],
    links: [{ label: 'Xem khoá học', to: '/courses' }],
  },
  {
    id: 'login',
    keywords: ['dang nhap', 'mat khau', 'quen mat khau', 'loi', 'khong vao duoc', 'tai khoan'],
    agentId: 'minh-quan',
    texts: ['Chào bạn, mình là Quân bên kỹ thuật.', 'Bạn thử bấm "Quên mật khẩu" ở trang đăng nhập, link đặt lại sẽ gửi về email trong 1–2 phút (nhớ xem cả mục Spam).', 'Nếu vẫn không được, bạn gửi mình email đăng ký để mình kiểm tra nha.'],
    links: [{ label: 'Quên mật khẩu', to: '/auth/forgot-password' }],
  },
  {
    id: 'human',
    keywords: ['tu van vien', 'nguoi that', 'goi dien', 'hotline', 'so dien thoai', 'zalo', 'lien he'],
    texts: ['Dạ bạn để lại số điện thoại ở đây, mình gọi lại trong giờ làm việc (8:00–22:00) nha.', 'Cần gấp thì bạn gọi hotline 0236 555 0199 ạ.'],
  },
  {
    id: 'hello',
    keywords: ['xin chao', 'chao', 'hello', 'hi', 'alo', 'ad oi', 'shop oi'],
    texts: ['Dạ mình nghe ạ.', 'Bạn đang ôn TOEIC hay VSTEP, dự định thi khi nào?'],
  },
  {
    id: 'thanks',
    keywords: ['cam on', 'thanks', 'thank', 'ok', 'oke'],
    texts: ['Dạ không có gì ạ. Cần gì bạn cứ nhắn nha, chúc bạn ôn thi tốt!'],
  },
];

export const SUPPORT_FALLBACK = ['Dạ mình đã nhận câu hỏi rồi ạ, để mình kiểm tra rồi trả lời bạn ngay nha.', 'Nếu cần gấp bạn để lại số điện thoại, mình gọi lại liền.'];
export const SUPPORT_CONTACT_ACK = ['Dạ mình nhận được rồi ạ.', 'Mình sẽ gọi lại cho bạn trong khoảng 15 phút nữa nha.'];
export const SUPPORT_CONTACT_ACK_OFFLINE = ['Dạ mình nhận được rồi ạ.', 'Bên mình làm việc 8:00–22:00, sáng mai mình gọi lại sớm cho bạn nha.'];
