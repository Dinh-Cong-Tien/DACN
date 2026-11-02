import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { cmsApi, useResources } from '@/shared/api/cms';
import { errorMessage } from '@/shared/api/client';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { cn, formatNumber } from '@/shared/utils';
import type { ResourceDoc } from '@/shared/types';
import { Accent, PageHeader, Section, CtaStrip } from './shared/PageKit';

/** Ô nhãn loại tệp kiểu trình quản lý tài liệu */
const TYPE_TAG: Record<ResourceDoc['type'], { label: string; cls: string }> = {
  PDF: { label: 'PDF', cls: 'bg-red-50 text-red-700 border-red-200' },
  DOCX: { label: 'DOC', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  AUDIO: { label: 'MP3', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const ResourcesPage: React.FC = () => {
  useDocumentTitle('Kho tài liệu mở');
  const gate = useGate();
  const [cat, setCat] = useState('Tất cả');
  const [q, setQ] = useState('');
  const { data: RESOURCES = [], isLoading, refetch } = useResources();
  const cats = ['Tất cả', ...Array.from(new Set(RESOURCES.map((r) => r.category)))];
  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    return RESOURCES.filter((r) => (cat === 'Tất cả' || r.category === cat) && (!key || r.title.toLowerCase().includes(key))).sort((a, b) => b.downloads - a.downloads);
  }, [cat, q, RESOURCES]);
  const total = RESOURCES.reduce((a, r) => a + r.downloads, 0);
  const updated = RESOURCES.map((r) => r.updatedAt ?? '').sort().pop();

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Công cụ' }, { label: 'Kho tài liệu' }]}
        eyebrow="Tài liệu miễn phí"
        title={<>Kho <Accent>tài liệu</Accent> ôn thi</>}
        lead="Tài liệu tạo trực tiếp từ dữ liệu học tập trên hệ thống: từ vựng theo chủ đề, tóm tắt ngữ pháp, bảng quy đổi điểm, lời thoại bài nghe và đề Viết/Nói. Mở ra là in được."
        facts={[
          { value: String(RESOURCES.length), label: 'Tài liệu' },
          { value: formatNumber(total), label: 'Lượt tải' },
          { value: updated ? `${updated.slice(5, 7)}/${updated.slice(0, 4)}` : '—', label: 'Cập nhật gần nhất' },
        ]}
      />

      <Section innerClassName="pt-10 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Danh mục */}
          <nav aria-label="Danh mục" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <p className="mb-2 text-[13px] font-medium text-slate-500">Danh mục</p>
            <ul className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
              {cats.map((c) => {
                const n = c === 'Tất cả' ? RESOURCES.length : RESOURCES.filter((r) => r.category === c).length;
                return (
                  <li key={c} className="shrink-0">
                    <button
                      onClick={() => setCat(c)}
                      className={cn('flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors', cat === c ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50')}
                    >
                      {c}
                      <span className="text-xs tabular-nums text-slate-400">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Danh sách tệp */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-[13px] text-slate-500">{list.length} tài liệu · sắp theo lượt tải</p>
              <label className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tài liệu" className="h-9 w-52 rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none" />
              </label>
            </div>

            {isLoading ? (
              <div className="rounded-xl border border-slate-200 px-6 py-14 text-center text-sm text-slate-500">Đang tải tài liệu…</div>
            ) : list.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center text-sm text-slate-500">Không tìm thấy tài liệu phù hợp.</div>
            ) : (
              <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                {list.map((r) => {
                  const t = TYPE_TAG[r.type] ?? TYPE_TAG.PDF;
                  return (
                    <li key={r.id} className="flex items-start gap-4 px-4 py-4 hover:bg-slate-50 sm:px-5">
                      <span className={cn('mt-0.5 flex h-11 w-9 shrink-0 items-end justify-center rounded-md border pb-1 text-[10px] font-semibold', t.cls)}>{t.label}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{r.title}</p>
                        <p className="mt-0.5 text-[14px] text-slate-600">{r.description}</p>
                        <p className="mt-1.5 text-[12px] text-slate-500">
                          {r.category} · {r.pages ? `${r.pages} trang · ` : ''}
                          {r.size ? `${r.size} · ` : ''}
                          {formatNumber(r.downloads)} lượt tải
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          cmsApi
                            .download(r.id)
                            .then(({ fileUrl }) => {
                              if (!fileUrl) return toast.info('Tài liệu VIP', 'Đăng nhập tài khoản VIP để tải tài liệu này.');
                              window.open(fileUrl, '_blank', 'noopener');
                              void refetch();
                            })
                            .catch((e) => toast.error('Chưa tải được tài liệu', errorMessage(e)))
                        }
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-[13px] font-semibold text-slate-800 hover:border-indigo-600 hover:text-indigo-700"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Tải về</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-14">
          <CtaStrip title="Đọc xong thì luyện ngay" text="Mỗi chủ điểm trong tài liệu có bộ câu hỏi tương ứng trên hệ thống, sai câu nào được lưu lại để ôn." action={{ label: 'Luyện tập miễn phí', to: gate('/app/practice', '/auth/register') }} />
        </div>
      </Section>
    </div>
  );
};
