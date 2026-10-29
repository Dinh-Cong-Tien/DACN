import React, { useState } from 'react';
import { Download, FileText, FileAudio, File, FolderOpen } from 'lucide-react';
import { Badge, Button, Card, Chip, SectionTitle, EmptyState } from '@/shared/components/ui';
import { CountUp, Reveal, Stagger } from '@/shared/components/motion';
import { RESOURCES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

const ICON = { PDF: FileText, DOCX: File, AUDIO: FileAudio } as const;
const TONE = { PDF: 'bg-rose-50 text-rose-600', DOCX: 'bg-sky-50 text-sky-600', AUDIO: 'bg-emerald-50 text-emerald-600' } as const;

export const ResourcesPage: React.FC = () => {
  useDocumentTitle('Kho tài liệu mở');
  const cats = ['Tất cả', ...Array.from(new Set(RESOURCES.map((r) => r.category)))];
  const [cat, setCat] = useState('Tất cả');
  const list = RESOURCES.filter((r) => cat === 'Tất cả' || r.category === cat);
  const total = RESOURCES.reduce((a, r) => a + r.downloads, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-10">
      <Reveal>
        <SectionTitle eyebrow="Free Resource Hub" title="Kho tài liệu mở" description="Tải miễn phí tài liệu PDF tóm tắt ngữ pháp, từ vựng và cẩm nang luyện thi. Không cần đăng nhập." />
      </Reveal>
      <Reveal animation="scale-in">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { v: RESOURCES.length, l: 'Tài liệu' },
            { v: total, l: 'Lượt tải' },
            { v: cats.length - 1, l: 'Chủ đề' },
          ].map((s) => (
            <Card key={s.l} padding="sm" className="text-center">
              <p className="text-2xl font-black text-slate-900">
                <CountUp value={s.v} />
              </p>
              <p className="text-xs text-slate-500 font-semibold">{s.l}</p>
            </Card>
          ))}
        </div>
      </Reveal>
      <div className="flex flex-wrap justify-center gap-2 animate-fade-up">
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<FolderOpen />} title="Chưa có tài liệu" />
      ) : (
        <Stagger key={cat} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" step={60} whenVisible={false}>
          {list.map((r) => {
            const Icon = ICON[r.type];
            return (
              <Card key={r.id} hover className="flex flex-col space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${TONE[r.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge tone="slate" size="xs">
                    {r.type} · {r.size}
                  </Badge>
                </div>
                <div className="flex-1">
                  <Badge tone="indigo" size="xs" className="mb-2">
                    {r.category}
                  </Badge>
                  <h3 className="font-bold text-slate-900 leading-snug">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    {r.pages > 0 ? `${r.pages} trang · ` : ''}
                    {formatNumber(r.downloads)} lượt tải
                  </span>
                  <Button size="xs" variant="soft" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => toast.info('Đang chuẩn bị tải xuống', r.title)}>
                    Tải xuống
                  </Button>
                </div>
              </Card>
            );
          })}
        </Stagger>
      )}
    </div>
  );
};
