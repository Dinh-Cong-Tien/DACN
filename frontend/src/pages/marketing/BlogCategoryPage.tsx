import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';

export const BlogCategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const categoryPosts = [
    {
      slug: 'chien-thuat-tranh-bay-part-2-toeic',
      title: 'Tuyệt chiêu tránh bẫy câu hỏi Yes/No và từ đồng âm trong TOEIC Part 2',
      readTime: '5 phút đọc',
      date: '15 Tháng 10, 2026',
      excerpt: 'Rất nhiều thí sinh mất điểm oan ở Part 2 vì phản xạ trả lời trực tiếp. Hãy cùng khám phá 5 dạng câu trả lời gián tiếp phổ biến nhất.',
    },
    {
      slug: 'lo-trinh-on-toeic-tu-mat-goc-len-650',
      title: 'Lộ trình 90 ngày tự học TOEIC từ mất gốc lên 650+ dành cho người đi làm',
      readTime: '10 phút đọc',
      date: '02 Tháng 10, 2026',
      excerpt: 'Kế hoạch học tập phân bổ chỉ 30 phút mỗi ngày kết hợp giữa luyện nghe chủ động và làm bài tập ngữ pháp thực chiến.',
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Blog
        </Link>

        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Chuyên mục</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 capitalize">
            {slug?.replace(/-/g, ' ')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Tổng hợp các bài viết chuyên môn và hướng dẫn thực hành theo chủ đề.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryPosts.map((post) => (
            <div
              key={post.slug}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {post.date}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 leading-snug hover:text-indigo-600 transition">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{post.excerpt}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  to={`/blog/${post.slug}`}
                  className="font-bold text-xs text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                >
                  <span>Đọc bài viết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
