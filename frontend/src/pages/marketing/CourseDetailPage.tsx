import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, CheckCircle2, PlayCircle, ArrowRight, ShieldCheck, Award } from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const syllabus = [
    {
      module: 'Chương 1: Nền tảng cấu trúc đề & Phương pháp nghe',
      lessons: [
        { title: 'Bài 1: Tổng quan định dạng đề thi và bẫy phát âm nối từ', duration: '25 phút', preview: true },
        { title: 'Bài 2: Kỹ thuật phân tích hình ảnh tả người trong Part 1', duration: '35 phút', preview: true },
        { title: 'Bài 3: Nhận diện bẫy từ đồng âm & bẫy thì tương lai', duration: '40 phút', preview: false },
      ],
    },
    {
      module: 'Chương 2: Ngữ pháp cốt lõi và từ vựng chuyên ngành',
      lessons: [
        { title: 'Bài 4: Hệ thống 12 thì tiếng Anh trong môi trường doanh nghiệp', duration: '45 phút', preview: false },
        { title: 'Bài 5: Hòa hợp Chủ vị & Mệnh đề quan hệ rút gọn', duration: '50 phút', preview: false },
        { title: 'Bài 6: 200 từ vựng chủ đề Hợp đồng (Contracts) & Đàm phán', duration: '30 phút', preview: false },
      ],
    },
    {
      module: 'Chương 3: Thực chiến đề thi & Phân tích lỗi sai',
      lessons: [
        { title: 'Bài 7: Luyện đề Mini Test số 1 kèm chẩn đoán lỗi tự động', duration: '60 phút', preview: false },
        { title: 'Bài 8: Review câu sai với thuật toán Spaced Repetition', duration: '30 phút', preview: false },
      ],
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Course Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
              Lộ trình chuẩn hóa
            </span>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.95 (1,420 đánh giá)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Khóa học Chinh phục Mục tiêu Điểm số Cá nhân hóa ({id?.toUpperCase()})
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
            Tối ưu hóa thời gian học với công nghệ phát hiện lỗ hổng kiến thức. Mọi câu làm sai trong bài tập của khóa học sẽ tự động được xếp vào lịch ôn tập ngắt quãng cá nhân của bạn.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-6 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                32 Bài giảng chuyên sâu
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                45 Giờ thực hành
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Chứng nhận hoàn thành
              </span>
            </div>

            <Link
              to="/auth/register"
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition"
            >
              <span>Đăng ký học ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Syllabus Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Giáo trình chi tiết</h2>
          <div className="space-y-4">
            {syllabus.map((s, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-black text-slate-900">{s.module}</h3>
                <div className="divide-y divide-slate-100">
                  {s.lessons.map((lesson, lIdx) => (
                    <div key={lIdx} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-semibold text-slate-800">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{lesson.duration}</span>
                        {lesson.preview && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Học thử
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
