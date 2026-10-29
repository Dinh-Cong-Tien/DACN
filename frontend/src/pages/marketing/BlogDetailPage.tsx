import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, ArrowRight, Share2, Bookmark } from 'lucide-react';
import { Avatar, Badge, Breadcrumb, Button, Card, GradientPanel } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { BLOG_POSTS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug) ?? BLOG_POSTS[0];
  useDocumentTitle(post.title);
  const related = BLOG_POSTS.filter((p) => p.id !== post.id && p.categorySlug === post.categorySlug).concat(BLOG_POSTS.filter((p) => p.id !== post.id)).slice(0, 3);

  return (
    <div className="pb-24">
      <section className={`relative overflow-hidden bg-gradient-to-br ${post.gradient} text-white`}>
        <div aria-hidden className="absolute inset-0 bg-grid opacity-15" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20 space-y-5 animate-fade-up">
          <Breadcrumb items={[{ label: 'Blog', to: '/blog' }, { label: post.category, to: `/blog/category/${post.categorySlug}` }]} className="[&_*]:text-white/80" />
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{post.title}</h1>
          <p className="text-white/85 leading-relaxed">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm">
            <Avatar name={post.author} size="sm" ring />
            <span className="font-semibold">{post.author}</span>
            <span className="text-white/70">{formatDate(post.date)}</span>
            <span className="flex items-center gap-1 text-white/70">
              <Clock className="w-3.5 h-3.5" /> {post.readMin} phút đọc
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <Reveal>
          <Card padding="lg">
            <article className="space-y-5">
              {post.content.map((para, i) => (
                <p key={i} className={`leading-relaxed text-slate-700 ${i === 0 ? 'text-lg font-medium text-slate-800' : ''}`}>
                  {para}
                </p>
              ))}
            </article>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Badge key={t} tone="slate">
                    #{t}
                  </Badge>
                ))}
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
          </Card>
        </Reveal>

        <Reveal animation="scale-in">
          <GradientPanel tone="indigo" className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="text-xl font-black">Áp dụng ngay vào bài luyện tập</h3>
              <p className="text-indigo-100 text-sm mt-1">Tạo tài khoản để luyện theo chiến thuật vừa đọc và lưu câu sai vào Sổ tay.</p>
            </div>
            <Button to="/auth/register" variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50 shrink-0" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Bắt đầu miễn phí
            </Button>
          </GradientPanel>
        </Reveal>

        <div className="space-y-4">
          <Reveal>
            <h2 className="text-xl font-black text-slate-900">Bài viết liên quan</h2>
          </Reveal>
          <Stagger className="grid sm:grid-cols-3 gap-4">
            {related.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="block group">
                <Card padding="none" hover className="h-full overflow-hidden">
                  <div className={`h-20 bg-gradient-to-br ${p.gradient}`} />
                  <div className="p-4 space-y-2">
                    <Badge tone="slate" size="xs">
                      {p.category}
                    </Badge>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition">{p.title}</h3>
                    <p className="text-[11px] text-slate-400">{p.readMin} phút đọc</p>
                  </div>
                </Card>
              </Link>
            ))}
          </Stagger>
        </div>
      </div>
    </div>
  );
};
