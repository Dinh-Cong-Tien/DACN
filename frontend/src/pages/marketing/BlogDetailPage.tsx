import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark, CheckCircle2 } from 'lucide-react';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
        </Link>

        {/* Article Container */}
        <article className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Mẹo thi TOEIC & VSTEP
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Tuyệt chiêu tránh bẫy câu hỏi Yes/No và từ đồng âm trong bài thi tiếng Anh ({slug})
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <User className="w-4 h-4 text-indigo-600" /> Thầy Hoàng TOEIC 990
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> 15 Tháng 10, 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> 5 phút đọc
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Đã sao chép liên kết bài viết!')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
            <p className="font-semibold text-base text-slate-900">
              Trong phần thi Listening (đặc biệt là Part 2 TOEIC), người ra đề thường lợi dụng phản xạ tâm lý thông thường của thí sinh để gài bẫy. Hãy cùng phân tích các bẫy điển hình và giải pháp phòng tránh.
            </p>

            <h3 className="text-lg font-black text-slate-900 pt-2">1. Bẫy từ đồng âm (Homophones) và từ lặp lại</h3>
            <p>
              Nếu trong câu hỏi xuất hiện từ khóa như <em>"project"</em> hay <em>"copy"</em>, đáp án chứa chính xác từ đó với nghĩa khác thường là đáp án sai. Người ra đề muốn kiểm tra xem bạn có thực sự nghe hiểu ngữ cảnh hay chỉ bắt từ khóa rời rạc.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="font-bold text-xs text-indigo-900">Ví dụ thực tế:</div>
              <p className="text-xs text-slate-700">
                <strong>Hỏi:</strong> Where can I find the extra copy paper?
                <br />
                <strong>Đáp án bẫy (Sai):</strong> She will copy the file later.
                <br />
                <strong>Đáp án đúng:</strong> It’s in the storage cabinet on the second floor.
              </p>
            </div>

            <h3 className="text-lg font-black text-slate-900 pt-2">2. Bẫy câu trả lời gián tiếp (Indirect Response)</h3>
            <p>
              Xu hướng đề thi mới nhất từ ETS có đến 40% câu hỏi sử dụng phương thức trả lời vòng hoặc đưa ra thông tin đối ứng thay vì trả lời thẳng thắn:
            </p>
            <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-600">
              <li>Hỏi thời gian nhưng trả lời bằng người phụ trách: <em>"Ask Mr. Tanaka, he manages the schedule."</em></li>
              <li>Hỏi lựa chọn A hay B nhưng chọn phương án C hoàn toàn mới.</li>
              <li>Trả lời bằng một câu hỏi ngược lại: <em>"Haven't you checked your email yet?"</em></li>
            </ul>

            <h3 className="text-lg font-black text-slate-900 pt-2">3. Kết luận và lời khuyên ôn tập</h3>
            <p>
              Để khắc phục triệt để các bẫy này, bạn không nên chỉ nghe thụ động. Hãy sử dụng tính năng <strong>Sổ tay lỗi sai cá nhân trên OrbiLingo</strong> để lưu lại các câu Part 2 đã làm sai và nghe lại sau 1 ngày, 3 ngày và 7 ngày theo đúng thuật toán Spaced Repetition.
            </p>
          </div>

          {/* CTA Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-black">Muốn kiểm tra trình độ nghe hiện tại của bạn?</h4>
              <p className="text-xs text-indigo-100 mt-1">
                Làm bài test chẩn đoán 10 phút để AI phát hiện ngay dạng câu hỏi bạn hay sai nhất.
              </p>
            </div>
            <Link
              to="/auth/register"
              className="px-6 py-3 bg-white text-indigo-600 font-bold text-xs rounded-2xl hover:bg-indigo-50 transition shrink-0"
            >
              Làm bài test miễn phí
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};
