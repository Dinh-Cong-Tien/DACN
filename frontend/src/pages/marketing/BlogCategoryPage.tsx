import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Chip, SectionTitle, Breadcrumb, EmptyState, Avatar, Badge } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { Img } from '@/shared/components/media/Img';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';

export const BlogCategoryPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const cat = BLOG_CATEGORIES.find((c) => c.slug === slug);
  const posts = BLOG_POSTS.filter((p) => p.categorySlug === slug);
  useDocumentTitle(cat?.name ?? 'Chủ đề');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-10">
      <Reveal className="space-y-5">
        <Breadcrumb items={[{ label: 'Trang chủ', to: '/' }, { label: 'Kinh nghiệm', to: '/blog' }, { label: cat?.name ?? 'Chủ đề' }]} />
        <SectionTitle align="left" eyebrow="Chủ đề" title={cat?.name ?? 'Không tìm thấy chủ đề'} description={`${posts.length} bài viết`} />
        <div className="flex gap-2 flex-wrap">
          {BLOG_CATEGORIES.map((c) => (
            <Chip key={c.slug} active={c.slug === slug} onClick={() => navigate(`/blog/category/${c.slug}`)}>
              {c.name}
            </Chip>
          ))}
        </div>
      </Reveal>
      {posts.length === 0 ? (
        <EmptyState title="Chưa có bài viết" description="Chủ đề này sẽ sớm có nội dung." />
      ) : (
        <Stagger key={slug} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white rounded-3xl border-2 border-slate-900 shadow-hard overflow-hidden card-hard-hover block">
              <Img src={p.coverUrl} alt={p.title} ratio="video" fallbackClass="bg-violet-200" />
              <div className="p-5 space-y-3">
                <Badge tone="slate">{p.category}</Badge>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-snug group-hover:underline decoration-4 decoration-amber-300 underline-offset-4">{p.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{p.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pt-3 border-t-2 border-slate-100">
                  <Avatar name={p.author} src={p.authorAvatar} size="xs" /> {p.author} · {formatDate(p.date)}
                </div>
              </div>
            </Link>
          ))}
        </Stagger>
      )}
    </div>
  );
};
