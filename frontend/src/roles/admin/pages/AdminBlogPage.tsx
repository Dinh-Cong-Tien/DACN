import React from 'react';
import { Newspaper, ExternalLink, FolderTree, PenLine, Eye } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/shared/mocks';
import type { BlogPost } from '@/shared/types';
import { formatDate } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Avatar, Column } from '@/shared/components/ui';
import { Figures, TBtn, TPageHead } from '@/roles/teacher/components/TeacherKit';
import { Img } from '@/shared/components/media/Img';
import { CrudEditor, CrudField } from '@/engines';

const columns: Column<BlogPost>[] = [
  {
    key: 'title',
    header: 'Bài viết',
    render: (p) => (
      <div className="flex items-center gap-3 max-w-md">
        {p.coverUrl && <Img src={p.coverUrl} alt={p.title} wrapperClass="w-20 h-12 rounded-xl ring-1 ring-slate-200 overflow-hidden shrink-0" fallbackClass="bg-violet-100" />}
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{p.title}</p>
          <p className="text-[11px] text-slate-500 truncate">{p.excerpt}</p>
        </div>
      </div>
    ),
  },
  { key: 'category', header: 'Chuyên mục', render: (p) => <span className="whitespace-nowrap rounded-md bg-indigo-500/[0.08] px-2 py-0.5 text-[12px] font-semibold text-indigo-700">{p.category}</span> },
  {
    key: 'author',
    header: 'Tác giả',
    render: (p) => (
      <span className="flex items-center gap-2">
        <Avatar name={p.author} src={p.authorAvatar} size="xs" />
        <span className="whitespace-nowrap text-[13px] text-slate-700">{p.author}</span>
      </span>
    ),
  },
  { key: 'date', header: 'Ngày đăng', render: (p) => <span className="whitespace-nowrap text-[13px] tabular-nums text-slate-600">{formatDate(p.date)}</span> },
  { key: 'readMin', header: 'Đọc', align: 'center', render: (p) => <span className="text-[13px] tabular-nums text-slate-600">{p.readMin} phút</span> },
  {
    key: 'tags',
    header: 'Thẻ',
    render: (p) => (
      <div className="flex flex-wrap gap-1">
        {p.tags.map((t) => (
          <span key={t} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
            #{t}
          </span>
        ))}
      </div>
    ),
  },
];

const fields: CrudField<BlogPost>[] = [
  { key: 'title', label: 'Tiêu đề', type: 'text', required: true, colSpan: 2 },
  { key: 'excerpt', label: 'Tóm tắt', type: 'textarea' },
  { key: 'category', label: 'Chuyên mục', type: 'select', required: true, options: BLOG_CATEGORIES.map((c) => ({ value: c.name, label: c.name })) },
  { key: 'author', label: 'Tác giả', type: 'text', required: true },
  { key: 'date', label: 'Ngày đăng', type: 'date' },
  { key: 'readMin', label: 'Thời gian đọc (phút)', type: 'number' },
];

export const AdminBlogPage: React.FC = () => {
  useDocumentTitle('Quản lý tin tức');
  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Nội dung' }, { label: 'Tin tức' }]}
        title="Tin tức & Kinh nghiệm"
        sub="Bài viết kinh nghiệm thi, lộ trình và phương pháp học hiển thị ở mục Kinh nghiệm của trang công khai."
        actions={
          <TBtn icon={<ExternalLink />} onClick={() => window.open('/blog', '_blank')}>
            Xem trang tin tức
          </TBtn>
        }
      />
      <Figures
        items={[
          { label: 'Bài viết', value: BLOG_POSTS.length, icon: Newspaper, tone: 'indigo', note: 'đã xuất bản' },
          { label: 'Chuyên mục', value: BLOG_CATEGORIES.length, icon: FolderTree, tone: 'violet' },
          { label: 'Tác giả', value: new Set(BLOG_POSTS.map((p) => p.author)).size, icon: PenLine, tone: 'emerald', note: 'giáo viên đóng góp' },
          { label: 'Lượt đọc tháng', value: '18.420', icon: Eye, tone: 'amber', note: '+14% so với tháng trước' },
        ]}
      />
      <CrudEditor<BlogPost>
        rows={BLOG_POSTS}
        columns={columns}
        fields={fields}
        entityName="bài viết"
        createLabel="Viết bài mới"
        idPrefix="b"
        searchKeys={['title', 'author']}
        filters={[{ key: 'category', label: 'Chuyên mục', options: BLOG_CATEGORIES.map((c) => ({ value: c.name, label: c.name })) }]}
        defaultValues={{ category: BLOG_CATEGORIES[0].name, categorySlug: BLOG_CATEGORIES[0].slug, author: 'Admin', date: new Date().toISOString().slice(0, 10), readMin: 5, gradient: '', content: [], tags: [], slug: '', excerpt: '' }}
        rowActions={(p) => [{ label: 'Xem bài', icon: <ExternalLink />, onClick: () => window.open(`/blog/${p.slug}`, '_blank') }]}
      />
    </div>
  );
};
