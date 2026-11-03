/**
 * Icon 3D màu (Microsoft Fluent Emoji, /public/images/nav) cho menu header khu quản lý — cùng bộ với header trang chủ.
 * Tra theo nhãn menu để giáo viên, trưởng bộ môn, admin dùng chung một nghĩa cho cùng một mục.
 */
const f = (name: string) => `/images/nav/${name}.webp`;

export const STAFF_IMG: Record<string, string> = {
  // chung
  'Tổng quan': f('house'),
  'Lớp học': f('school'),
  'Tất cả lớp': f('school'),
  'Học viên': f('graduation-cap'),
  'Giáo viên': f('woman-teacher'),
  'Học liệu': f('books'),
  'Khoá học & bài giảng': f('laptop'),
  'Khoá học': f('laptop'),
  'Ngân hàng đề': f('page-facing-up'),
  'Ngữ pháp & Từ vựng': f('open-book'),
  'Ngân hàng câu hỏi': f('card-file-box'),
  'Báo cáo': f('chart-increasing'),
  'Báo cáo tổng kết': f('chart-increasing'),
  'Báo cáo đào tạo': f('chart-increasing'),
  // giáo viên
  'Lịch dạy': f('spiral-calendar'),
  'Lịch dạy tuần': f('spiral-calendar'),
  'Điểm danh': f('clipboard'),
  'Bài tập': f('memo'),
  'Danh sách bài tập': f('memo'),
  'Giao bài mới': f('plus'),
  'Bản nháp': f('pencil'),
  'Chấm bài': f('check-mark-button'),
  'Hồ sơ học viên': f('card-index'),
  'Cần theo dõi': f('warning'),
  'Bảng điểm': f('bar-chart'),
  'Thống kê lớp': f('chart-increasing'),
  'Học liệu của tôi': f('writing-hand'),
  'Tài liệu lớp': f('file-folder'),
  // trưởng bộ môn
  'Bộ môn': f('classical-building'),
  'Môn học': f('bookmark-tabs'),
  'Giảng dạy': f('light-bulb'),
  'Lịch dạy & điểm danh': f('spiral-calendar'),
  'Lịch học & điểm danh': f('spiral-calendar'),
  'Bài tập các lớp': f('memo'),
  'Tài liệu & bảng tin lớp': f('file-folder'),
  'Kết quả thi': f('trophy'),
  'Kết quả thi của học viên': f('trophy'),
  'Kiểm định chấm bài': f('balance-scale'),
  'Khiếu nại & phúc khảo': f('speech-balloon'),
  'Phê duyệt học liệu': f('check-mark-button'),
  // admin
  'Người dùng': f('identification-card'),
  'Tài khoản': f('key'),
  'Hỗ trợ học viên': f('telephone-receiver'),
  'Đào tạo': f('graduation-cap'),
  'Chất lượng': f('sports-medal'),
  'Nội dung': f('books'),
  'Cấu hình đề thi': f('gear'),
  'Nhãn kỹ năng': f('label'),
  'Đề Viết & Nói': f('fountain-pen'),
  'Tài liệu & FAQ': f('open-file-folder'),
  'Tin tức (CMS)': f('newspaper'),
  'Vận hành': f('toolbox'),
  'Gói VIP & thanh toán': f('credit-card'),
  'Gửi thông báo': f('megaphone'),
  'Thống kê': f('bar-chart'),
  'Thống kê hệ thống': f('bar-chart'),
  'Hệ thống': f('desktop-computer'),
  'Trạng thái dịch vụ': f('satellite-antenna'),
  'Nhật ký hệ thống': f('scroll'),
  'Cấu hình tham số': f('hammer-and-wrench'),
};

/** Icon riêng cho mục lớp động (mỗi lớp một mục) */
export const CLASS_IMG = { TOEIC: f('briefcase'), VSTEP: f('graduation-cap') } as const;
