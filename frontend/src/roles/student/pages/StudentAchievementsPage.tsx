import React, { useState } from 'react';
import { Award, Lock, Sparkles } from 'lucide-react';
import { MOCK_ACHIEVEMENTS } from '@/shared/mocks';
import type { Achievement } from '@/shared/types';
import { cn, formatDate } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Card, PageHeader, ProgressBar, RingProgress, Tabs, EmptyState } from '@/shared/components/ui';
import { Tone } from '@/shared/components/ui';

const RARITY: Record<Achievement['rarity'], { label: string; tone: Tone; glow: string }> = {
  COMMON: { label: 'Thường', tone: 'slate', glow: 'from-slate-200 to-slate-100' },
  RARE: { label: 'Hiếm', tone: 'sky', glow: 'from-sky-200 to-cyan-100' },
  EPIC: { label: 'Sử thi', tone: 'violet', glow: 'from-violet-200 to-fuchsia-100' },
  LEGENDARY: { label: 'Huyền thoại', tone: 'amber', glow: 'from-amber-200 to-orange-100' },
};

export const StudentAchievementsPage: React.FC = () => {
  useDocumentTitle('Huy hiệu thành tích');
  const [tab, setTab] = useState('all');
  const earned = MOCK_ACHIEVEMENTS.filter((a) => a.earned);
  const list = MOCK_ACHIEVEMENTS.filter((a) => (tab === 'all' ? true : tab === 'earned' ? a.earned : !a.earned));

  return (
    <div className="space-y-6">
      <PageHeader title="Huy hiệu thành tích" icon={<Award />} description="Ghi nhận cột mốc học tập của bạn. Mỗi huy hiệu đi kèm điểm nỗ lực." />

      <Card className="relative overflow-hidden animate-fade-up">
        <div aria-hidden className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br from-amber-200 to-orange-100 opacity-50 blur-2xl animate-float-slow" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <RingProgress value={(earned.length / MOCK_ACHIEVEMENTS.length) * 100} size={120} stroke={11} tone="amber">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{earned.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">/ {MOCK_ACHIEVEMENTS.length}</p>
            </div>
          </RingProgress>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-black text-slate-900">Bạn đã mở khoá {earned.length} huy hiệu</h2>
            <p className="text-sm text-slate-500 mt-1">Còn {MOCK_ACHIEVEMENTS.length - earned.length} huy hiệu đang chờ. Huy hiệu gần nhất: {earned[earned.length - 1]?.title}.</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {(Object.keys(RARITY) as Achievement['rarity'][]).map((r) => (
                <Badge key={r} tone={RARITY[r].tone} size="xs">
                  {RARITY[r].label}: {MOCK_ACHIEVEMENTS.filter((a) => a.rarity === r && a.earned).length}/{MOCK_ACHIEVEMENTS.filter((a) => a.rarity === r).length}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Tabs
        variant="pill"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'all', label: 'Tất cả', count: MOCK_ACHIEVEMENTS.length },
          { key: 'earned', label: 'Đã đạt', count: earned.length },
          { key: 'progress', label: 'Đang tiến hành', count: MOCK_ACHIEVEMENTS.length - earned.length },
        ]}
      />

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={<Award />} title="Chưa có huy hiệu" />
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {list.map((a, i) => {
            const r = RARITY[a.rarity];
            return (
              <Card key={a.id} padding="sm" className={cn('relative overflow-hidden text-center flex flex-col items-center transition-all duration-300', a.earned ? 'animate-pop hover:-translate-y-1 hover:shadow-card' : 'animate-fade-up')} style={{ animationDelay: `${i * 50}ms` }}>
                <div className={cn('absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-60', a.earned ? r.glow : 'from-slate-100 to-transparent')} />
                <div className={cn('relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mt-2 shadow-sm', a.earned ? 'bg-white' : 'bg-slate-100 grayscale opacity-60')}>
                  {a.earned ? a.icon : <Lock className="w-6 h-6 text-slate-400" />}
                  {a.earned && a.rarity === 'LEGENDARY' && <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-500 animate-wiggle" />}
                </div>
                <p className={cn('relative font-bold text-sm mt-3 leading-tight', a.earned ? 'text-slate-900' : 'text-slate-500')}>{a.title}</p>
                <p className="relative text-[11px] text-slate-500 mt-1 leading-snug flex-1">{a.description}</p>
                <Badge tone={r.tone} size="xs" className="relative mt-2">
                  {r.label}
                </Badge>
                <div className="relative w-full mt-3">
                  {a.earned ? (
                    <p className="text-[10px] font-semibold text-emerald-600">Đạt ngày {a.earnedAt ? formatDate(a.earnedAt) : ''}</p>
                  ) : (
                    <ProgressBar value={(a.progress / a.total) * 100} size="xs" tone="slate" label={`${a.progress}/${a.total}`} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
