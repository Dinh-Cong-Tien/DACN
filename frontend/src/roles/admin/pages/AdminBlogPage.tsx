import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/shared/mocks';
import type { BlogPost } from '@/shared/types';
import { formatDate } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Column, PageHeader, StatCard } from '@/shared/components/ui';
import { CrudEditor, CrudField } from '@/engines';

const columns: Column<BlogPost>[] = [
  {
    key: 'title',
    header: 'Bài viết',
    render: (p) => (
      <div className="max-w-md">
        <p className="font-semibold text-slate-900 truncate">{p.title}</p>
        <p className="text-[11px] text-slate-400 truncate">{p.excerpt}</p>
      </div>
    ),
  },
  { key: 'category', header: 'Chuyên mục', render: (p) => <Badge tone="indigo">{p.category}</Badge> },
  { key: 'author', header: 'Tác giả', render: (p) => <span className="text-xs font-semibold text-slate-700">{p.author}</span> },
  { key: 'date', header: 'Ngày đăng', render: (p) => <span className="text-xs text-slate-500">{formatDate(p.date)}</span> },
  { key: 'readMin', header: 'Đọc', align: 'center', render: (p) => <span className="text-xs">{p.readMin} phút</span> },
  {
    key: 'tags',
    header: 'Thẻ',
    render: (p) => (
      <div className="flex flex-wrap gap-1">
        {p.tags.map((t) => (
          <Badge key={t} tone="slate" size="xs">
            {t}
          </Badge>
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
      <PageHeader title="Tin tức & Kinh nghiệm (CMS)" icon={<Newspaper />} description="Quản lý bài viết chia sẻ kinh nghiệm thi, lộ trình học và phương pháp học hiển thị ở trang công khai." />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Bài viết" value={BLOG_POSTS.length} tone="indigo" />
        <StatCard label="Chuyên mục" value={BLOG_CATEGORIES.length} tone="violet" />
        <StatCard label="Tác giả" value={new Set(BLOG_POSTS.map((p) => p.author)).size} tone="emerald" />
        <StatCard label="Lượt đọc tháng" value={18420} tone="amber" delta={14} deltaLabel="so với tháng trước" />
      </div>
      <CrudEditor<BlogPost>
        rows={BLOG_POSTS}
        columns={columns}
        fields={fields}
        entityName="bài viết"
        createLabel="Viết bài mới"
        idPrefix="b"
        searchKeys={['title', 'author']}
        filters={[{ key: 'category', label: 'Chuyên mục', options: BLOG_CATEGORIES.map((c) => ({ value: c.name, label: c.name })) }]}
        defaultValues={{ category: BLOG_CATEGORIES[0].name, categorySlug: BLOG_CATEGORIES[0].slug, author: 'Admin', date: new Date().toISOString().slice(0, 10), readMin: 5, gradient: 'from-indigo-500 to-violet-600', content: [], tags: [], slug: '', excerpt: '' }}
        rowActions={(p) => [{ label: 'Xem bài', icon: <ExternalLink />, onClick: () => window.open(`/blog/${p.slug}`, '_blank') }]}
      />
    </div>
  );
};
