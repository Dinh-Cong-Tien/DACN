import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';
import { Badge, Breadcrumb, Card, Chip, EmptyState, SectionTitle } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';
import { useNavigate } from 'react-router-dom';

export const BlogCategoryPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const cat = BLOG_CATEGORIES.find((c) => c.slug === slug);
  const list = BLOG_POSTS.filter((p) => p.categorySlug === slug);
  useDocumentTitle(cat?.name ?? 'Chuyên mục');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-8">
      <Reveal>
        <Breadcrumb items={[{ label: 'Blog', to: '/blog' }, { label: cat?.name ?? 'Chuyên mục' }]} className="justify-center" />
        <SectionTitle eyebrow="Chuyên mục" title={cat?.name ?? 'Không tìm thấy chuyên mục'} description={`${list.length} bài viết`} className="mt-3" />
      </Reveal>
      <div className="flex flex-wrap justify-center gap-2 animate-fade-up">
        {BLOG_CATEGORIES.map((c) => (
          <Chip key={c.slug} active={c.slug === slug} onClick={() => navigate(`/blog/category/${c.slug}`)}>
            {c.name}
          </Chip>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<Tag />} title="Chưa có bài viết trong chuyên mục này" />
      ) : (
        <Stagger key={slug} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" step={80} whenVisible={false}>
          {list.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="block group">
              <Card padding="none" hover className="h-full flex flex-col overflow-hidden">
                <div className={`h-28 bg-gradient-to-br ${p.gradient} relative`}>
                  <div aria-hidden className="absolute inset-0 bg-dots opacity-30" />
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <Badge tone="slate" size="xs" className="w-fit">
                    {p.category}
                  </Badge>
                  <h3 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{p.excerpt}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                    <span>{formatDate(p.date)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.readMin} phút
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </Stagger>
      )}
    </div>
  );
};
