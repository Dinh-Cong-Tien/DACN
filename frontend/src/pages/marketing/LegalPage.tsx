import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';

/** Một mục văn bản pháp lý: tiêu đề + các đoạn / gạch đầu dòng */
type Section = { h: string; p?: string[]; list?: string[] };

const UPDATED = '18/11/2026';
const CONTACT = 'hello@orbilingo.vn';

const PRIVACY: Section[] = [
  {
    h: '1. Thông tin chúng tôi thu thập',
    list: [
      'Thông tin tài khoản: họ tên, email, mật khẩu (chỉ lưu dạng đã mã hoá, không ai đọc được), ảnh đại diện, số điện thoại và thông tin hồ sơ nếu bạn tự điền.',
      'Khi đăng nhập bằng Google hoặc Facebook: mã định danh tài khoản, họ tên, email và ảnh đại diện mà Google/Facebook chia sẻ khi bạn đồng ý. Chúng tôi không nhận mật khẩu, danh bạ hay bài đăng của bạn.',
      'Dữ liệu học tập: bài làm, đáp án, điểm số, bài viết, bản ghi âm phần Nói, từ vựng đã lưu, tiến độ và lịch sử luyện tập.',
      'Dữ liệu kỹ thuật: địa chỉ IP, loại trình duyệt và thời điểm đăng nhập — dùng để giữ phiên đăng nhập an toàn và chống truy cập trái phép.',
    ],
  },
  {
    h: '2. Mục đích sử dụng',
    list: [
      'Tạo và duy trì tài khoản, cho phép bạn đăng nhập.',
      'Chấm bài, lưu tiến độ, lập lộ trình học và gợi ý nội dung phù hợp.',
      'Cho giáo viên của lớp bạn tham gia xem bài nộp và kết quả để nhận xét, chấm điểm.',
      'Gửi thông báo liên quan đến việc học (bài tập mới, kết quả chấm).',
      'Bảo vệ hệ thống: phát hiện đăng nhập bất thường, giới hạn số lần thử.',
    ],
  },
  {
    h: '3. Chia sẻ thông tin',
    p: [
      'OrbiLingo không bán, cho thuê hay trao đổi dữ liệu cá nhân của bạn. Thông tin chỉ được chia sẻ với giáo viên và quản lý học vụ của lớp bạn tham gia, các nhà cung cấp hạ tầng lưu trữ cần thiết để vận hành dịch vụ, hoặc cơ quan nhà nước khi pháp luật yêu cầu.',
    ],
  },
  {
    h: '4. Lưu trữ và bảo mật',
    p: [
      'Dữ liệu được lưu trên máy chủ cơ sở dữ liệu có mã hoá kết nối (SSL). Mật khẩu được băm một chiều; phiên đăng nhập dùng mã truy cập có thời hạn. Dữ liệu được giữ trong thời gian tài khoản còn hoạt động và được xoá khi bạn yêu cầu xoá tài khoản, trừ các bản ghi pháp luật bắt buộc lưu giữ.',
    ],
  },
  {
    h: '5. Quyền của bạn',
    list: [
      'Xem và sửa thông tin hồ sơ trong trang Cài đặt tài khoản.',
      'Yêu cầu bản sao dữ liệu hoặc yêu cầu xoá tài khoản và toàn bộ dữ liệu liên quan.',
      'Gỡ quyền truy cập của OrbiLingo trong phần cài đặt bảo mật của Google hoặc Facebook bất cứ lúc nào.',
    ],
  },
  {
    h: '6. Xoá dữ liệu',
    p: [
      `Để xoá tài khoản và dữ liệu (kể cả tài khoản tạo bằng Google/Facebook), gửi email tới ${CONTACT} từ địa chỉ email của tài khoản, tiêu đề "Yêu cầu xoá dữ liệu", hoặc gửi qua trang Liên hệ. Chúng tôi xử lý trong vòng 30 ngày và gửi xác nhận khi hoàn tất.`,
    ],
  },
  {
    h: '7. Trẻ em',
    p: ['Học viên dưới 16 tuổi nên sử dụng dịch vụ với sự đồng ý của cha mẹ hoặc người giám hộ.'],
  },
  {
    h: '8. Thay đổi chính sách',
    p: ['Khi chính sách thay đổi, chúng tôi cập nhật ngày hiệu lực ở đầu trang và thông báo trên hệ thống với các thay đổi quan trọng.'],
  },
];

const TERMS: Section[] = [
  {
    h: '1. Chấp nhận điều khoản',
    p: ['Khi tạo tài khoản hoặc sử dụng OrbiLingo, bạn đồng ý với các điều khoản dưới đây và Chính sách bảo mật.'],
  },
  {
    h: '2. Tài khoản',
    list: [
      'Bạn chịu trách nhiệm về thông tin đăng ký và giữ bí mật mật khẩu.',
      'Mỗi người dùng một tài khoản; không chia sẻ, mua bán tài khoản.',
      'Thông báo cho chúng tôi ngay khi phát hiện tài khoản bị truy cập trái phép.',
    ],
  },
  {
    h: '3. Sử dụng dịch vụ',
    list: [
      'Chỉ sử dụng cho mục đích học tập và giảng dạy.',
      'Không sao chép, phát tán đề thi, câu hỏi, audio, video và tài liệu của OrbiLingo khi chưa được phép.',
      'Không gian lận trong bài kiểm tra, không can thiệp, tấn công hoặc khai thác lỗi hệ thống.',
      'Không đăng tải nội dung vi phạm pháp luật, xúc phạm người khác trong lớp học, bình luận hay tin nhắn.',
    ],
  },
  {
    h: '4. Nội dung',
    p: [
      'Đề thi, bài giảng và tài liệu thuộc quyền sở hữu của OrbiLingo hoặc giáo viên đăng tải. Bài làm, bài viết và bản ghi âm bạn nộp vẫn thuộc về bạn; bạn cho phép OrbiLingo và giáo viên lớp học sử dụng chúng để chấm điểm và nhận xét.',
    ],
  },
  {
    h: '5. Kết quả học tập',
    p: ['Điểm số trên OrbiLingo là điểm ước tính phục vụ luyện tập, không thay thế kết quả của kỳ thi TOEIC hay VSTEP chính thức.'],
  },
  {
    h: '6. Tạm ngưng tài khoản',
    p: ['Chúng tôi có thể khoá tài khoản vi phạm điều khoản sau khi xem xét, và thông báo lý do cho chủ tài khoản.'],
  },
  {
    h: '7. Giới hạn trách nhiệm',
    p: ['Dịch vụ được cung cấp theo hiện trạng. Chúng tôi nỗ lực duy trì hệ thống ổn định nhưng không cam kết hoạt động liên tục, không gián đoạn.'],
  },
  {
    h: '8. Liên hệ',
    p: [`Mọi câu hỏi về điều khoản, gửi email tới ${CONTACT}.`],
  },
];

const DOCS = {
  privacy: { title: 'Chính sách bảo mật', intro: 'Chính sách này giải thích OrbiLingo thu thập thông tin gì, dùng để làm gì và bạn kiểm soát dữ liệu của mình như thế nào.', sections: PRIVACY, other: { to: '/terms', label: 'Điều khoản sử dụng' } },
  terms: { title: 'Điều khoản sử dụng', intro: 'Các quy định khi sử dụng nền tảng luyện thi TOEIC/VSTEP OrbiLingo.', sections: TERMS, other: { to: '/privacy', label: 'Chính sách bảo mật' } },
} as const;

/** Trang văn bản pháp lý (/privacy, /terms) — dạng tài liệu đọc, không trang trí */
export const LegalPage: React.FC<{ kind: keyof typeof DOCS }> = ({ kind }) => {
  const doc = DOCS[kind];
  useDocumentTitle(doc.title);
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-sm font-semibold text-slate-500">OrbiLingo · Cập nhật {UPDATED}</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">{doc.title}</h1>
      <p className="mt-5 text-base leading-relaxed text-slate-600">{doc.intro}</p>
      <div className="mt-10 space-y-9 border-t border-slate-200 pt-10">
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-bold text-slate-900">{s.h}</h2>
            {s.p?.map((t) => (
              <p key={t} className="mt-3 text-[15px] leading-relaxed text-slate-600">
                {t}
              </p>
            ))}
            {s.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-600 marker:text-slate-400">
                {s.list.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <p className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
        Xem thêm:{' '}
        <Link to={doc.other.to} className="font-medium text-indigo-700 hover:underline">
          {doc.other.label}
        </Link>{' '}
        ·{' '}
        <Link to="/contact" className="font-medium text-indigo-700 hover:underline">
          Liên hệ
        </Link>
      </p>
    </article>
  );
};
