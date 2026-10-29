import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Tag, Newspaper } from 'lucide-react';
import { Badge, Card, SectionTitle } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';

export const BlogPage: React.FC = () => {
  useDocumentTitle('Kinh nghiệm & Cẩm nang');
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-10">
      <Reveal>
        <SectionTitle eyebrow="Blog" title="Kinh nghiệm thi & Cẩm nang học" description="Chiến thuật, lộ trình và phương pháp từ đội ngũ giáo viên OrbiLingo." />
      </Reveal>

      <Reveal animation="scale-in">
        <Link to={`/blog/${featured.slug}`} className="block group">
          <Card padding="none" hover className="grid md:grid-cols-2 overflow-hidden">
            <div className={`relative min-h-[240px] bg-gradient-to-br ${featured.gradient} p-8 flex flex-col justify-end text-white`}>
              <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />
              <Newspaper className="relative w-10 h-10 opacity-80 mb-auto" />
              <Badge className="relative bg-white/20 text-white border-white/30 w-fit">Nổi bật</Badge>
            </div>
            <div className="p-8 space-y-4">
              <Badge tone="indigo">{featured.category}</Badge>
              <h2 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-700 transition">{featured.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{featured.author}</span>
                <span>{formatDate(featured.date)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featured.readMin} phút đọc
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                Đọc bài <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Card>
        </Link>
      </Reveal>

      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        <Stagger className="grid sm:grid-cols-2 gap-5" step={80}>
          {rest.map((p) => (
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
        <aside className="space-y-4">
          <Reveal animation="slide-in-right">
            <Card>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" /> Chuyên mục
              </h3>
              <ul className="space-y-1">
                {BLOG_CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/blog/category/${c.slug}`} className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
                      {c.name}
                      <span className="text-xs text-slate-400">{BLOG_POSTS.filter((p) => p.categorySlug === c.slug).length}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <Reveal animation="slide-in-right" delay={100}>
            <Card>
              <h3 className="font-bold text-slate-900 mb-3">Thẻ phổ biến</h3>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(BLOG_POSTS.flatMap((p) => p.tags))).map((t) => (
                  <Badge key={t} tone="slate">
                    #{t}
                  </Badge>
                ))}
              </div>
            </Card>
          </Reveal>
        </aside>
      </div>
    </div>
  );
};
