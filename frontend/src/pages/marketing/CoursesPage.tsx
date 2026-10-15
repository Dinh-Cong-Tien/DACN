import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, ArrowRight, CheckCircle2, Filter } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'TOEIC' | 'VSTEP'>('ALL');

  const courses = [
    {
      id: 'toeic-450',
      title: 'Khóa học Nền tảng TOEIC 450+ cấp tốc',
      target: 'TOEIC',
      level: 'Mất gốc đến 450+',
      lessonsCount: 32,
      duration: '45 giờ học',
      rating: 4.9,
      students: 1420,
      description: 'Lấy lại toàn bộ nền tảng ngữ pháp câu, 600 từ vựng cốt lõi và chiến thuật làm bài Part 1, 2, 5 cơ bản.',
      badge: 'Bán chạy nhất',
    },
    {
      id: 'toeic-750',
      title: 'Khóa học Bứt phá TOEIC 750+ Chuyên sâu',
      target: 'TOEIC',
      level: 'Trung cấp đến 750+',
      lessonsCount: 48,
      duration: '60 giờ học',
      rating: 4.95,
      students: 2150,
      description: 'Chuyên trị bẫy Part 3, 4 đoạn văn dài và tốc độ đọc quét Part 7 đoạn kép - đoạn ba. Luyện tư duy phản xạ.',
      badge: 'Khuyên dùng',
    },
    {
      id: 'vstep-b1',
      title: 'Luyện thi VSTEP B1 Đầu ra Đại học',
      target: 'VSTEP',
      level: 'A2 lên B1',
      lessonsCount: 36,
      duration: '50 giờ học',
      rating: 4.88,
      students: 980,
      description: 'Học cả 4 kỹ năng Nghe - Nói - Đọc - Viết. Bổ sung các mẫu câu viết thư (Task 1) và Speaking Part 1.',
      badge: 'Cấp tốc 30 ngày',
    },
    {
      id: 'vstep-b2',
      title: 'Chinh phục VSTEP B2 – Thạc sĩ & Giáo viên',
      target: 'VSTEP',
      level: 'B1 lên B2',
      lessonsCount: 52,
      duration: '75 giờ học',
      rating: 4.92,
      students: 1340,
      description: 'Chiến thuật làm bài thi máy tính, kỹ thuật phát triển luận điểm Writing Task 2 và giải quyết tình huống Speaking.',
      badge: 'Chuyên sâu',
    },
  ];

  const filtered = filter === 'ALL' ? courses : courses.filter((c) => c.target === filter);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Khóa học Luyện thi Cá nhân hóa</h1>
          <p className="text-slate-600 text-sm">
            Mỗi bài giảng đều tích hợp bài tập thực hành thích ứng, tự động ghi nhận câu sai vào Sổ tay lỗi để ôn tập ngắt quãng.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2">
          {['ALL', 'TOEIC', 'VSTEP'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag as any)}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all ${
                filter === tag
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tag === 'ALL' ? 'Tất cả khóa học' : `Lộ trình ${tag}`}
            </button>
          ))}
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      course.target === 'TOEIC'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    {course.target} • {course.level}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {course.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 hover:text-indigo-600 transition">
                  <Link to={`/courses/${course.id}`}>{course.title}</Link>
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    {course.lessonsCount} bài giảng
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    {course.students.toLocaleString()} học viên
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {course.rating}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/courses/${course.id}`}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <span>Xem chi tiết giáo trình</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
