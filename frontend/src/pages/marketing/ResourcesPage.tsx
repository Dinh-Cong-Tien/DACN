import React, { useMemo, useState } from 'react';
import { Download, FileText, FileAudio, File, ArrowRight } from 'lucide-react';
import { Badge, Chip, SectionTitle, Button, EmptyState } from '@/shared/components/ui';
import { Reveal, Stagger, CountUp } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { RESOURCES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { cn, formatNumber } from '@/shared/utils';

const ICON = { PDF: FileText, DOCX: File, AUDIO: FileAudio } as const;
const TILE = ['bg-white', 'bg-amber-200', 'bg-white', 'bg-indigo-100', 'bg-white', 'bg-violet-100', 'bg-white', 'bg-sky-100'];

export const ResourcesPage: React.FC = () => {
  useDocumentTitle('Kho tài liệu mở');
  const [cat, setCat] = useState('Tất cả');
  const cats = ['Tất cả', ...Array.from(new Set(RESOURCES.map((r) => r.category)))];
  const list = useMemo(() => RESOURCES.filter((r) => cat === 'Tất cả' || r.category === cat), [cat]);
  const total = RESOURCES.reduce((a, r) => a + r.downloads, 0);

  return (
    <div>
      <section className="bg-amber-200 border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_380px] gap-10 items-center">
          <div className="space-y-6">
            <SectionTitle align="left" eyebrow="Kho tài liệu mở" title={<>Tải về, in ra, <span className="mark-teal mark">học offline</span>.</>} description="PDF tóm tắt ngữ pháp, từ vựng theo chủ đề, bài mẫu Writing và audio luyện nghe. Miễn phí, không cần đăng nhập." />
            <div className="flex gap-6">
              <div>
                <p className="font-display text-4xl font-extrabold text-slate-900">{RESOURCES.length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">tài liệu</p>
              </div>
              <div>
                <p className="font-display text-4xl font-extrabold text-slate-900">
                  <CountUp value={total} />
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">lượt tải</p>
              </div>
            </div>
          </div>
          <div className="photo-frame tilt-2">
            <Img src={PHOTOS.books} alt="" ratio="4/3" fallbackClass="bg-indigo-200" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex gap-2 flex-wrap">
          {cats.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
        {list.length === 0 ? (
          <EmptyState title="Chưa có tài liệu" />
        ) : (
          <Stagger key={cat} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {list.map((r, i) => {
              const Icon = ICON[r.type];
              return (
                <div key={r.id} className={cn('rounded-3xl border-2 border-slate-900 shadow-hard p-5 flex flex-col card-hard-hover', TILE[i % TILE.length])}>
                  <div className="flex items-start justify-between">
                    <span className="w-11 h-11 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <Badge tone="slate" size="xs">
                      {r.type} · {r.size}
                    </Badge>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 mt-4 leading-snug">{r.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 flex-1">{r.description}</p>
                  <div className="flex items-center justify-between mt-4 text-[11px] font-bold text-slate-500">
                    <span>{r.pages ? `${r.pages} trang` : 'Audio'}</span>
                    <span>{formatNumber(r.downloads)} lượt</span>
                  </div>
                  <Button size="sm" variant="outline" fullWidth className="mt-3" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast.info('Đang tải xuống', `${r.title} (${r.size})`)}>
                    Tải xuống
                  </Button>
                </div>
              );
            })}
          </Stagger>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Reveal className="rounded-3xl bg-slate-900 text-white border-2 border-slate-900 shadow-hard p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h3 className="font-display text-2xl font-extrabold">Tài liệu là để đọc. Điểm là để luyện.</h3>
            <p className="text-slate-300 mt-1">Mỗi chủ điểm trong PDF đều có bộ 20 câu luyện tập trên hệ thống.</p>
          </div>
          <Button to="/auth/register" variant="gradient" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Luyện ngay
          </Button>
        </Reveal>
      </section>
    </div>
  );
};
