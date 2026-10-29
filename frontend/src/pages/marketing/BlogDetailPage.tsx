import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Bookmark, Share2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge, Breadcrumb, Button, Avatar } from '@/shared/components/ui';
import { Reveal } from '@/shared/components/motion';
import { Img } from '@/shared/components/media/Img';
import { BLOG_POSTS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug) ?? BLOG_POSTS[0];
  useDocumentTitle(post.title);
  const related = BLOG_POSTS.filter((p) => p.id !== post.id && p.categorySlug === post.categorySlug).slice(0, 2);
  const more = related.length ? related : BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Breadcrumb className="mb-6" items={[{ label: 'Trang chủ', to: '/' }, { label: 'Kinh nghiệm', to: '/blog' }, { label: post.category, to: `/blog/category/${post.categorySlug}` }, { label: 'Bài viết' }]} />
      <div className="grid lg:grid-cols-[1fr_320px] gap-12 items-start">
        <article className="space-y-8">
          <Reveal className="space-y-5">
            <div className="flex gap-2">
              <Badge tone="violet" solid>
                {post.category}
              </Badge>
              <Badge tone="slate" icon={<Clock className="w-3 h-3" />}>
                {post.readMin} phút đọc
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.08] text-balance">{post.title}</h1>
            <p className="text-lg text-slate-600 leading-relaxed">{post.excerpt}</p>
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y-2 border-slate-200">
              <div className="flex items-center gap-3">
                <Avatar name={post.author} src={post.authorAvatar} size="md" ring />
                <div>
                  <p className="text-sm font-bold text-slate-900">{post.author}</p>
                  <p className="text-xs text-slate-500">Giáo viên OrbiLingo · {formatDate(post.date)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" leftIcon={<Bookmark className="w-4 h-4" />} onClick={() => toast.success('Đã lưu bài viết')}>
                  Lưu
                </Button>
                <Button size="sm" variant="outline" leftIcon={<Share2 className="w-4 h-4" />} onClick={() => toast.info('Đã sao chép liên kết')}>
                  Chia sẻ
                </Button>
              </div>
            </div>
          </Reveal>
          <Reveal className="photo-frame">
            <Img src={post.coverUrl} alt={post.title} ratio="video" fallbackClass="bg-indigo-200" />
          </Reveal>
          <Reveal className="space-y-5 max-w-3xl">
            {post.content.map((para, i) => (
              <p key={i} className={i === 0 ? 'text-lg text-slate-800 leading-relaxed first-letter:font-display first-letter:text-5xl first-letter:font-extrabold first-letter:text-violet-500 first-letter:mr-1 first-letter:float-left' : 'text-slate-700 leading-relaxed'}>
                {para}
              </p>
            ))}
            <div className="rounded-2xl bg-amber-100 border-2 border-slate-900 p-5 text-sm text-slate-800">
              <b>Áp dụng ngay:</b> Mở phần Luyện tập, chọn đúng Part được nhắc trong bài và làm 10 câu với chế độ xem giải thích.
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map((t) => (
                <Badge key={t} tone="slate">
                  #{t}
                </Badge>
              ))}
            </div>
          </Reveal>
          <div className="flex justify-between pt-6 border-t-2 border-slate-200">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-indigo-700">
              <ArrowLeft className="w-4 h-4" /> Tất cả bài viết
            </Link>
            <Button to="/auth/register" size="sm" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Luyện ngay
            </Button>
          </div>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Bài liên quan</p>
          {more.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="block bg-white rounded-2xl border-2 border-slate-900 shadow-hard overflow-hidden card-hard-hover">
              <Img src={p.coverUrl} alt="" ratio="video" fallbackClass="bg-amber-200" />
              <div className="p-4">
                <p className="text-sm font-bold text-slate-900 leading-snug">{p.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {p.author} · {p.readMin}'
                </p>
              </div>
            </Link>
          ))}
          <div className="bg-indigo-600 text-white rounded-2xl border-2 border-slate-900 shadow-hard p-5">
            <p className="font-display font-extrabold text-lg">Thử sức với đề thật?</p>
            <p className="text-xs text-indigo-100 mt-1">Full test ETS 2024 miễn phí, chấm ngay.</p>
            <Button to="/mock-tests" variant="white" size="sm" fullWidth className="mt-3">
              Vào phòng thi
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};
