import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, ArrowRight, Tag } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState('ALL');

  const posts = [
    {
      slug: 'chien-thuat-tranh-bay-part-2-toeic',
      title: 'Tuyệt chiêu tránh bẫy câu hỏi Yes/No và từ đồng âm trong TOEIC Part 2',
      category: 'Mẹo thi TOEIC',
      readTime: '5 phút đọc',
      date: '15 Tháng 10, 2026',
      excerpt: 'Rất nhiều thí sinh mất điểm oan ở Part 2 vì phản xạ trả lời trực tiếp. Hãy cùng khám phá 5 dạng câu trả lời gián tiếp phổ biến nhất.',
      author: 'Thầy Hoàng TOEIC 990',
    },
    {
      slug: 'huong-dan-viet-thu-vstep-writing-task-1',
      title: 'Hướng dẫn cấu trúc viết thư trang trọng đạt điểm tối đa VSTEP Writing Task 1',
      category: 'Kỹ năng VSTEP',
      readTime: '7 phút đọc',
      date: '12 Tháng 10, 2026',
      excerpt: 'Nắm vững bố cục 4 phần chuẩn: Lý do viết thư, giải thích chi tiết, đề xuất giải pháp và lời kết lịch sự.',
      author: 'Cô Mai Anh VSTEP C1',
    },
    {
      slug: 'phuong-phap-spaced-repetition-hoc-tu-vung',
      title: 'Tại sao Spaced Repetition (Lặp lại ngắt quãng) là phương pháp học từ vựng hiệu quả nhất?',
      category: 'Phương pháp học',
      readTime: '6 phút đọc',
      date: '08 Tháng 10, 2026',
      excerpt: 'Khám phá đường cong quên lãng Ebbinghaus và cách thuật toán SuperMemo SM-2 giúp não bộ ghi nhớ từ vựng vĩnh viễn.',
      author: 'OrbiLingo R&D Team',
    },
    {
      slug: 'lo-trinh-on-toeic-tu-mat-goc-len-650',
      title: 'Lộ trình 90 ngày tự học TOEIC từ mất gốc lên 650+ dành cho người đi làm',
      category: 'Lộ trình học',
      readTime: '10 phút đọc',
      date: '02 Tháng 10, 2026',
      excerpt: 'Kế hoạch học tập phân bổ chỉ 30 phút mỗi ngày kết hợp giữa luyện nghe chủ động và làm bài tập ngữ pháp thực chiến.',
      author: 'Thầy Hoàng TOEIC 990',
    },
  ];

  const filtered = selectedCat === 'ALL' ? posts : posts.filter((p) => p.category === selectedCat);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Góc chia sẻ kinh nghiệm & Kiến thức</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Blog & Cẩm nang Luyện thi</h1>
          <p className="text-slate-600 text-sm">
            Cập nhật đề thi mới nhất, bí quyết phân bổ thời gian và các phân tích ngữ pháp chuyên sâu từ chuyên gia.
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex justify-center flex-wrap gap-2">
          {['ALL', 'Mẹo thi TOEIC', 'Kỹ năng VSTEP', 'Phương pháp học', 'Lộ trình học'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả bài viết' : cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((post) => (
            <div
              key={post.slug}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug hover:text-indigo-600 transition">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">{post.excerpt}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">{post.author}</span>
                <Link
                  to={`/blog/${post.slug}`}
                  className="font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
                >
                  <span>Đọc tiếp</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
