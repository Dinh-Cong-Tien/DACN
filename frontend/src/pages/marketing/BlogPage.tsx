import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Tag } from 'lucide-react';
import { Badge, SectionTitle, Avatar, Button } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { Img } from '@/shared/components/media/Img';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';

export const BlogPage: React.FC = () => {
  useDocumentTitle('Kinh nghiệm thi');
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-12">
      <Reveal>
        <SectionTitle align="left" eyebrow="Kinh nghiệm thi" title={<>Bài viết từ giáo viên, <span className="mark">không copy</span> từ mạng.</>} description="Mẹo làm bài, lộ trình, phương pháp học. Mỗi bài có tên tác giả và ngày đăng." />
      </Reveal>

      <Reveal>
        <Link to={`/blog/${featured.slug}`} className="group grid lg:grid-cols-[1.2fr_1fr] rounded-3xl border-2 border-slate-900 shadow-hard bg-white overflow-hidden card-hard-hover">
          <Img src={featured.coverUrl} alt={featured.title} ratio="video" fallbackClass="bg-indigo-200" wrapperClass="lg:aspect-auto lg:min-h-[340px]" />
          <div className="p-7 md:p-9 flex flex-col justify-center space-y-4">
            <div className="flex gap-2">
              <Badge tone="violet" solid>
                Nổi bật
              </Badge>
              <Badge tone="slate">{featured.category}</Badge>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight group-hover:underline decoration-4 decoration-amber-300 underline-offset-4">{featured.title}</h2>
            <p className="text-slate-600 leading-relaxed">{featured.excerpt}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold pt-2">
              <Avatar name={featured.author} src={featured.authorAvatar} size="sm" />
              <span className="text-slate-900">{featured.author}</span> · {formatDate(featured.date)} ·
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {featured.readMin} phút đọc
              </span>
            </div>
          </div>
        </Link>
      </Reveal>

      <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-start">
        <Stagger className="grid sm:grid-cols-2 gap-6">
          {rest.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white rounded-3xl border-2 border-slate-900 shadow-hard overflow-hidden card-hard-hover block">
              <Img src={p.coverUrl} alt={p.title} ratio="video" fallbackClass="bg-amber-200" />
              <div className="p-5 space-y-3">
                <Badge tone="slate">{p.category}</Badge>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-snug group-hover:underline decoration-4 decoration-amber-300 underline-offset-4">{p.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{p.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pt-3 border-t-2 border-slate-100">
                  <Avatar name={p.author} src={p.authorAvatar} size="xs" /> {p.author} · {formatDate(p.date)} · {p.readMin}'
                </div>
              </div>
            </Link>
          ))}
        </Stagger>
        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-hard p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Chủ đề
            </p>
            <ul className="space-y-1">
              {BLOG_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/blog/category/${c.slug}`} className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-amber-100 hover:text-slate-900 transition">
                    {c.name}
                    <span className="text-xs text-slate-400">{BLOG_POSTS.filter((p) => p.categorySlug === c.slug).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl border-2 border-slate-900 shadow-hard p-5 space-y-3">
            <p className="font-display font-extrabold text-lg">Nhận bài mới mỗi thứ Hai</p>
            <p className="text-xs text-slate-300">Một email, không spam. Huỷ bất kỳ lúc nào.</p>
            <Button to="/auth/register" variant="gradient" size="sm" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
              Đăng ký nhận
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};
