import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Users, ArrowRight, Lock, Volume2, Timer, Flag } from 'lucide-react';
import { Badge, Chip, SectionTitle, Tabs, Button, EmptyState } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { MOCK_TESTS } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';

export const MockTestsPage: React.FC = () => {
  useDocumentTitle('Đề thi thử');
  const gate = useGate();
  const [tab, setTab] = useState('TOEIC');
  const [kind, setKind] = useState<'ALL' | 'FULL' | 'MINI' | 'FREE'>('ALL');
  const list = useMemo(
    () =>
      MOCK_TESTS.filter((t) => t.examType === tab).filter((t) => (kind === 'ALL' ? true : kind === 'FREE' ? t.isFree : kind === 'FULL' ? t.totalQuestions >= 150 || t.parts.length >= 4 : t.totalQuestions < 150 && t.parts.length < 4)),
    [tab, kind]
  );

  return (
    <div>
      <section className="bg-slate-900 text-white border-b-2 border-slate-900 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-dots opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_400px] gap-10 items-center">
          <div className="space-y-6">
            <SectionTitle dark align="left" eyebrow="Phòng thi thử" title={<>Thi như thật. <span className="mark mark-full">Chấm ngay</span>.</>} description="180+ đề TOEIC chuẩn ETS và VSTEP theo format Bộ GD&ĐT. Đồng hồ, audio phát một lần, bảng câu hỏi và tự nộp khi hết giờ." />
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                [Timer, 'Đếm ngược chuẩn 120 phút'],
                [Volume2, 'Audio không tua'],
                [Flag, 'Đánh dấu xem lại'],
              ].map(([Icon, l]) => {
                const I = Icon as React.ElementType;
                return (
                  <span key={l as string} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 font-semibold">
                    <I className="w-4 h-4 text-amber-300" /> {l as string}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="photo-frame tilt-2">
            <Img src={PHOTOS.flatlay} alt="" ratio="4/3" fallbackClass="bg-indigo-400" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs
            variant="pill"
            value={tab}
            onChange={setTab}
            items={[
              { key: 'TOEIC', label: 'TOEIC', count: MOCK_TESTS.filter((t) => t.examType === 'TOEIC').length },
              { key: 'VSTEP', label: 'VSTEP', count: MOCK_TESTS.filter((t) => t.examType === 'VSTEP').length },
            ]}
          />
          <div className="flex gap-2 flex-wrap">
            {(
              [
                ['ALL', 'Tất cả'],
                ['FULL', 'Full test'],
                ['MINI', 'Mini / Part'],
                ['FREE', 'Miễn phí'],
              ] as const
            ).map(([k, l]) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(k)} tone={k === 'FREE' ? 'emerald' : 'indigo'}>
                {l}
              </Chip>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState title="Chưa có đề phù hợp" />
        ) : (
          <Stagger key={tab + kind} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((t, i) => (
              <Link key={t.id} to={gate(`/app/mock-tests/${t.id}`)} className={cn('group bg-white rounded-3xl border-2 border-slate-900 shadow-hard overflow-hidden card-hard-hover block', i === 0 && 'sm:col-span-2 lg:col-span-1')}>
                <div className="relative">
                  <Img src={t.coverUrl} alt="" ratio="video" fallbackClass={t.examType === 'TOEIC' ? 'bg-indigo-200' : 'bg-violet-200'} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="sticker !py-1 !text-[10px] !bg-white">{t.examType}</span>
                    {!t.isFree && (
                      <span className="sticker !py-1 !text-[10px] !bg-amber-300 tilt-2">
                        <Lock className="w-3 h-3" /> VIP
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold">{t.year}</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge tone="slate" size="xs">
                      {t.level}
                    </Badge>
                    {t.tags?.filter((x) => x !== 'VIP').map((tag) => (
                      <Badge key={tag} tone={tag === 'Mới' ? 'violet' : tag === 'Phổ biến' ? 'amber' : 'slate'} size="xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">{t.title}</h3>
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-600 pt-3 border-t-2 border-slate-100">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {t.totalQuestions} câu
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {t.durationMinutes}'
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {formatNumber(t.attempts)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 group-hover:gap-2 transition-all">
                    Vào phòng thi <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </Stagger>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Reveal className="rounded-3xl bg-amber-200 border-2 border-slate-900 shadow-hard p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">Làm đề xong mới là bắt đầu.</h3>
            <p className="text-slate-700 mt-2 max-w-xl">Sau khi nộp, mỗi câu sai được phân loại nguyên nhân và lên lịch ôn lại. Đăng ký để không mất dữ liệu bài làm.</p>
          </div>
          <Button to="/auth/register" size="lg" variant="ink" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Tạo tài khoản miễn phí
          </Button>
        </Reveal>
      </section>
    </div>
  );
};
