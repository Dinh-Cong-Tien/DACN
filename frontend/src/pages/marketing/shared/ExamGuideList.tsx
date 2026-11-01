import React from 'react';
import { Link } from 'react-router-dom';
import { Img } from '@/shared/components/media/Img';
import type { BlogPost } from '@/shared/types';

/** Bộ bài "Giới thiệu kỳ thi" trên trang TOEIC / VSTEP: đánh số theo thứ tự nên đọc */
export const ExamGuideList: React.FC<{ posts: BlogPost[] }> = ({ posts }) => (
  <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
    {posts.map((p, i) => (
      <li key={p.id}>
        <Link to={`/blog/${p.slug}`} className="group block">
          <div className="overflow-hidden rounded-xl">
            <Img src={p.coverUrl} alt="" ratio="video" fallbackClass="bg-slate-200" className="transition-transform duration-500 group-hover:scale-[1.03]" />
          </div>
          <p className="mt-4 text-[12px] font-semibold tabular-nums text-slate-500">
            Bài {i + 1} · {p.readMin} phút đọc
          </p>
          <h3 className="mt-1 font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">{p.title}</h3>
          <p className="mt-1.5 line-clamp-3 text-[14px] leading-relaxed text-slate-600">{p.excerpt}</p>
        </Link>
      </li>
    ))}
  </ol>
);
