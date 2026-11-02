import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, ChevronRight, Share2 } from 'lucide-react';
import { Avatar } from '@/shared/components/ui';
import { Img } from '@/shared/components/media/Img';
import { usePost, usePosts } from '@/shared/api/cms';
import { TOEIC_GUIDE_SLUG, VSTEP_GUIDE_SLUG } from '@/shared/constants/public';
import { EmptyState, SkeletonCard } from '@/shared/components/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { cn, formatDate } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';
import { Eyebrow } from './shared/PageKit';

/** Bộ bài Giới thiệu kỳ thi: trang kỳ thi tương ứng (breadcrumb, liên kết cuối bài) */
const SERIES: Record<string, { exam: string; to: string }> = {
  [TOEIC_GUIDE_SLUG]: { exam: 'TOEIC', to: '/toeic' },
  [VSTEP_GUIDE_SLUG]: { exam: 'VSTEP', to: '/vstep' },
};

type Block = { kind: 'h2'; text: string; id: string } | { kind: 'p'; text: string } | { kind: 'ul'; items: string[] };

/** content[]: '## ' → tiêu đề mục, '- ' → gạch đầu dòng (gom các dòng liền nhau), còn lại là đoạn văn */
function toBlocks(content: string[]): Block[] {
  const out: Block[] = [];
  content.forEach((line, i) => {
    if (line.startsWith('## ')) out.push({ kind: 'h2', text: line.slice(3), id: `muc-${i}` });
    else if (line.startsWith('- ')) {
      const last = out[out.length - 1];
      if (last?.kind === 'ul') last.items.push(line.slice(2));
      else out.push({ kind: 'ul', items: [line.slice(2)] });
    } else out.push({ kind: 'p', text: line });
  });
  return out;
}

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { data: post, isLoading, isError } = usePost(slug);
  const { data: same } = usePosts(post ? { category: post.categorySlug, pageSize: 200 } : undefined);
  useDocumentTitle(post?.title ?? 'Bài viết');
  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-14"><SkeletonCard lines={8} /></div>;
  if (isError || !post) return <EmptyState title="Không tìm thấy bài viết" description="Bài viết có thể đã bị gỡ hoặc đường dẫn chưa đúng." action={<Link to="/blog" className="font-semibold text-indigo-700">Về trang Kinh nghiệm</Link>} />;
  const series = SERIES[post.categorySlug];
  // Bộ bài giới thiệu kỳ thi xếp theo thứ tự trong series
  const siblings = [...(same?.items ?? [post])].sort((a, b) => ((a as { seriesOrder?: number }).seriesOrder ?? 0) - ((b as { seriesOrder?: number }).seriesOrder ?? 0));
  const idx = siblings.findIndex((p) => p.id === post.id);
  const prev = series ? siblings[idx - 1] : undefined;
  const next = series ? siblings[idx + 1] : undefined;
  const related = (post.related?.length ? post.related : siblings.filter((p) => p.id !== post.id)).slice(0, 3);
  const blocks = toBlocks(post.content);
  const headings = blocks.filter((b): b is Extract<Block, { kind: 'h2' }> => b.kind === 'h2');

  const crumbs = series
    ? [{ label: 'Trang chủ', to: '/' }, { label: `Luyện thi ${series.exam}`, to: series.to }, { label: 'Giới thiệu kỳ thi' }]
    : [{ label: 'Trang chủ', to: '/' }, { label: 'Kinh nghiệm', to: '/blog' }, { label: post.category, to: `/blog/category/${post.categorySlug}` }];

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] text-slate-500">
          {crumbs.map((c, i) => (
            <React.Fragment key={c.label}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              {c.to ? (
                <Link to={c.to} className="hover:text-slate-900 hover:underline underline-offset-2">
                  {c.label}
                </Link>
              ) : (
                <span className="text-slate-700">{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="mt-8 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="min-w-0">
            <Eyebrow>{series ? `Giới thiệu kỳ thi ${series.exam} · Bài ${idx + 1}/${siblings.length}` : post.category}</Eyebrow>
            <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 text-balance md:text-[2.7rem]">{post.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{post.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={post.author} src={post.authorAvatar} size="md" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{post.author}</p>
                  <p className="text-[13px] text-slate-500">
                    Giáo viên OrbiLingo · {formatDate(post.date)} · {post.readMin} phút đọc
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => toast.success('Đã lưu bài viết')} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-900">
                  <Bookmark className="h-4 w-4" /> Lưu
                </button>
                <button type="button" onClick={() => toast.info('Đã sao chép liên kết')} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-900">
                  <Share2 className="h-4 w-4" /> Chia sẻ
                </button>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl">
              <Img src={post.coverUrl} alt={post.title} ratio="video" fallbackClass="bg-slate-200" />
            </div>

            <div className="mt-10 max-w-3xl space-y-5 text-[17px] leading-[1.75] text-slate-700">
              {blocks.map((b, i) =>
                b.kind === 'h2' ? (
                  <h2 key={i} id={b.id} className="scroll-mt-24 pt-4 font-display text-[1.45rem] font-bold leading-snug tracking-tight text-slate-900">
                    {b.text}
                  </h2>
                ) : b.kind === 'ul' ? (
                  <ul key={i} className="list-disc space-y-2 pl-6 marker:text-slate-400">
                    {b.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{b.text}</p>
                )
              )}
            </div>

            <div className="mt-8 flex max-w-3xl flex-wrap gap-x-3 gap-y-1 text-[13px] text-slate-500">
              {post.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>

            {/* Bài trước / bài sau trong bộ Giới thiệu kỳ thi */}
            {series && (prev || next) && (
              <nav className="mt-10 grid max-w-3xl gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
                {prev ? (
                  <Link to={`/blog/${prev.slug}`} className="group rounded-xl border border-slate-200 p-4 hover:bg-slate-900/[0.025]">
                    <span className="flex items-center gap-1 text-[12px] text-slate-500">
                      <ArrowLeft className="h-3.5 w-3.5" /> Bài {idx}
                    </span>
                    <span className="mt-1 block font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">{prev.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link to={`/blog/${next.slug}`} className="group rounded-xl border border-slate-200 p-4 text-right hover:bg-slate-900/[0.025]">
                    <span className="flex items-center justify-end gap-1 text-[12px] text-slate-500">
                      Bài {idx + 2} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="mt-1 block font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">{next.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </article>

          <aside className="space-y-8 lg:sticky lg:top-24">
            {headings.length > 1 && (
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">Mục lục</p>
                <ol className="mt-3 space-y-2 border-l border-slate-200">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-4 text-[14px] text-slate-600 hover:border-indigo-600 hover:text-slate-900">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {series ? (
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">Giới thiệu kỳ thi {series.exam}</p>
                <ol className="mt-3 space-y-1">
                  {siblings.map((p, i) => (
                    <li key={p.id}>
                      <Link
                        to={`/blog/${p.slug}`}
                        aria-current={p.id === post.id ? 'page' : undefined}
                        className={cn('flex gap-3 rounded-lg px-3 py-2 text-[14px] leading-snug transition-colors', p.id === post.id ? 'bg-indigo-500/[0.08] font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-900/[0.03] hover:text-slate-900')}
                      >
                        <span className="w-4 shrink-0 tabular-nums text-slate-400">{i + 1}</span>
                        <span>{p.title}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link to={series.to} className="mt-4 inline-flex items-center gap-1 px-3 text-sm font-semibold text-indigo-700 hover:underline underline-offset-2">
                  Về trang Luyện thi {series.exam} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              related.length > 0 && (
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">Bài cùng chủ đề</p>
                  <ul className="mt-3 space-y-4">
                    {related.map((p) => (
                      <li key={p.id}>
                        <Link to={`/blog/${p.slug}`} className="group flex gap-3">
                          <Img src={p.coverUrl} alt="" ratio="4/3" wrapperClass="w-20 shrink-0 rounded-lg" fallbackClass="bg-slate-200" />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">{p.title}</span>
                            <span className="mt-1 block text-[12px] text-slate-500">
                              {p.author} · {p.readMin} phút đọc
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
