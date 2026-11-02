import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RevealPhoto } from '@/shared/components/motion';
import { Img } from '@/shared/components/media/Img';
import { usePostCategories, usePosts } from '@/shared/api/cms';
import { EmptyState, SkeletonGrid } from '@/shared/components/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { formatDate, formatNumber } from '@/shared/utils';
import type { BlogPost } from '@/shared/types';
import { Section, Accent, Eyebrow } from './shared/PageKit';

const Meta: React.FC<{ p: BlogPost }> = ({ p }) => (
  <p className="text-[13px] text-slate-500">
    <span className="text-slate-700">{p.author}</span> · {formatDate(p.date)} · {p.readMin} phút đọc
  </p>
);

export const BlogPage: React.FC = () => {
  useDocumentTitle('Kinh nghiệm thi');
  const { data, isLoading } = usePosts({ pageSize: 200 });
  const { data: BLOG_CATEGORIES = [] } = usePostCategories();
  const BLOG_POSTS = data?.items ?? [];
  const [featured, ...rest] = BLOG_POSTS;
  const popular = [...BLOG_POSTS].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const [email, setEmail] = useState('');

  if (isLoading) return <div className="bg-page"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"><SkeletonGrid count={6} /></div></div>;
  if (!featured) return <div className="bg-page"><EmptyState title="Chưa có bài viết" description="Bài viết mới sẽ sớm được đăng." /></div>;

  return (
    <div className="bg-page">
      {/* Đầu trang kiểu chuyên mục báo: tên chuyên mục + thanh chủ đề */}
      <header className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <Eyebrow>Blog OrbiLingo</Eyebrow>
          <h1 className="mt-3 font-display text-[2.3rem] md:text-[3.2rem] font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Kinh nghiệm <Accent>thi thật</Accent>
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">Mẹo làm bài, lộ trình và phương pháp học do giáo viên OrbiLingo viết. Bài nào cũng ghi rõ tác giả và ngày đăng.</p>
          <nav aria-label="Chủ đề" className="mt-6 flex gap-6 overflow-x-auto no-scrollbar text-sm">
            <span className="-mb-px shrink-0 border-b-2 border-indigo-600 pb-3 font-medium text-slate-900">Tất cả</span>
            {BLOG_CATEGORIES.map((c) => (
              <Link key={c.slug} to={`/blog/category/${c.slug}`} className="-mb-px shrink-0 border-b-2 border-transparent pb-3 text-slate-500 hover:text-slate-900">
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <Section innerClassName="pt-10 md:pt-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <div>
            {/* Bài nổi bật */}
            <Link to={`/blog/${featured.slug}`} className="group grid gap-6 md:grid-cols-[1.25fr_1fr] md:items-center">
              <div className="overflow-hidden rounded-xl">
                <RevealPhoto parallax>
                  <Img src={featured.coverUrl} alt={featured.title} ratio="video" fallbackClass="bg-slate-200" className="transition-transform duration-700 group-hover:scale-[1.03]" />
                </RevealPhoto>
              </div>
              <div>
                <p className="text-[13px] font-medium text-indigo-700">{featured.category}</p>
                <h2 className="mt-2 font-display text-2xl md:text-[1.9rem] font-bold leading-tight text-slate-900 group-hover:underline decoration-slate-300 underline-offset-4">{featured.title}</h2>
                <p className="mt-3 leading-relaxed text-slate-600">{featured.excerpt}</p>
                <div className="mt-4">
                  <Meta p={featured} />
                </div>
              </div>
            </Link>

            {/* Bài mới */}
            <h2 className="mt-14 border-b border-slate-200 pb-3 text-lg font-semibold text-slate-900">Bài mới</h2>
            <ul className="divide-y divide-slate-200">
              {rest.map((p) => (
                <li key={p.id}>
                  <Link to={`/blog/${p.slug}`} className="group grid grid-cols-[1fr_120px] gap-5 py-6 sm:grid-cols-[220px_1fr]">
                    <div className="order-2 overflow-hidden rounded-lg sm:order-1">
                      <RevealPhoto>
                        <Img src={p.coverUrl} alt={p.title} ratio="4/3" fallbackClass="bg-slate-200" className="transition-transform duration-500 group-hover:scale-[1.04]" />
                      </RevealPhoto>
                    </div>
                    <div className="order-1 sm:order-2">
                      <p className="text-[13px] font-medium text-indigo-700">{p.category}</p>
                      <h3 className="mt-1 text-lg font-semibold leading-snug text-slate-900 group-hover:underline decoration-slate-300 underline-offset-4">{p.title}</h3>
                      <p className="mt-1.5 hidden text-[15px] leading-relaxed text-slate-600 line-clamp-2 sm:block">{p.excerpt}</p>
                      <div className="mt-2">
                        <Meta p={p} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="border-b border-slate-200 pb-3 text-base font-semibold text-slate-900">Đọc nhiều</h2>
              <ol className="divide-y divide-slate-200">
                {popular.map((p, i) => (
                  <li key={p.id}>
                    <Link to={`/blog/${p.slug}`} className="group flex gap-3 py-3.5">
                      <span className="w-5 shrink-0 text-lg font-semibold tabular-nums text-slate-300">{i + 1}</span>
                      <span>
                        <span className="block text-[15px] font-medium leading-snug text-slate-900 group-hover:text-indigo-700">{p.title}</span>
                        <span className="mt-0.5 block text-[12px] text-slate-500">{formatNumber(p.views ?? 0)} lượt xem</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return toast.error('Email chưa hợp lệ', 'Kiểm tra lại địa chỉ email giúp mình nhé.');
                toast.success('Đã đăng ký', 'Bài mới sẽ được gửi vào sáng thứ Hai hằng tuần.');
                setEmail('');
              }}
              className="rounded-xl border border-slate-200 p-5"
            >
              <p className="font-medium text-slate-900">Nhận bài mới mỗi thứ Hai</p>
              <p className="mt-1 text-sm text-slate-600">Một email mỗi tuần, huỷ bất kỳ lúc nào.</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                aria-label="Email"
                className="mt-4 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
              />
              <button type="submit" className="mt-2 h-10 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">
                Đăng ký
              </button>
            </form>
          </aside>
        </div>
      </Section>
    </div>
  );
};
