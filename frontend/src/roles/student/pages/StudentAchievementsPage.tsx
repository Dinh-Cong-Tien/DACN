import React, { useState } from 'react';
import { Award, Lock, Sparkles } from 'lucide-react';
import { useAchievements } from '@/shared/api/learner';
import type { Achievement } from '@/shared/types';
import { cn, formatDate } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Card, PageHeader, ProgressBar, RingProgress, Tabs, EmptyState } from '@/shared/components/ui';
import { Tone } from '@/shared/components/ui';
import { Doodles } from '@/shared/components/motion';

const RARITY: Record<Achievement['rarity'], { label: string; tone: Tone; ring: string; bg: string }> = {
  COMMON: { label: 'Thường', tone: 'slate', ring: 'bg-slate-200', bg: 'bg-white' },
  RARE: { label: 'Hiếm', tone: 'sky', ring: 'bg-sky-300', bg: 'bg-sky-50' },
  EPIC: { label: 'Sử thi', tone: 'violet', ring: 'bg-violet-400', bg: 'bg-violet-50' },
  LEGENDARY: { label: 'Huyền thoại', tone: 'amber', ring: 'bg-amber-300', bg: 'bg-amber-50' },
};

const TILTS = ['tilt-1', 'tilt-2', 'tilt-3', 'tilt-2', 'tilt-1'];

export const StudentAchievementsPage: React.FC = () => {
  useDocumentTitle('Huy hiệu thành tích');
  const [tab, setTab] = useState('all');
  const { data: achievements = [] } = useAchievements();
  const earned = achievements.filter((a) => a.earned);
  const list = achievements.filter((a) => (tab === 'all' ? true : tab === 'earned' ? a.earned : !a.earned));

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Huy hiệu <span className="mark">thành tích</span>
          </>
        }
        icon={<Award />}
        description="Ghi nhận cột mốc học tập của bạn. Mỗi huy hiệu đi kèm điểm nỗ lực."
      />

      <Card hard tone="ink" className="relative overflow-hidden animate-fade-up">
        <Doodles tone="light" className="opacity-40" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <RingProgress value={(earned.length / Math.max(1, achievements.length)) * 100} size={128} stroke={12} tone="amber" trackClass="stroke-white/15">
            <div className="text-center">
              <p className="font-display text-3xl font-extrabold text-white">{earned.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">/ {achievements.length}</p>
            </div>
          </RingProgress>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-display text-2xl font-extrabold text-white">Bạn đã mở khoá {earned.length} huy hiệu</h2>
            <p className="text-sm text-slate-300 mt-1">Còn {achievements.length - earned.length} huy hiệu đang chờ. {earned.length ? `Huy hiệu gần nhất: ${earned[earned.length - 1].title}.` : 'Hoàn thành bài thi đầu tiên để nhận huy hiệu.'}</p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              {(Object.keys(RARITY) as Achievement['rarity'][]).map((r, i) => (
                <span key={r} className={cn('sticker !text-[10px] !py-1', TILTS[i], r === 'LEGENDARY' && '!bg-amber-300', r === 'EPIC' && '!bg-violet-200', r === 'RARE' && '!bg-sky-200')}>
                  {RARITY[r].label}: {achievements.filter((a) => a.rarity === r && a.earned).length}/{achievements.filter((a) => a.rarity === r).length}
                </span>
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
          { key: 'all', label: 'Tất cả', count: achievements.length },
          { key: 'earned', label: 'Đã đạt', count: earned.length },
          { key: 'progress', label: 'Đang tiến hành', count: achievements.length - earned.length },
        ]}
      />

      {list.length === 0 ? (
        <Card hard>
          <EmptyState icon={<Award />} title="Chưa có huy hiệu" />
        </Card>
      ) : (
        <div key={tab} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {list.map((a, i) => {
            const r = RARITY[a.rarity];
            return (
              <div
                key={a.id}
                className={cn('relative rounded-2xl border-2 border-slate-900 p-4 text-center flex flex-col items-center transition-all duration-300', a.earned ? cn(r.bg, 'shadow-hard animate-pop hover:-translate-y-1 hover:shadow-hard-lg') : 'bg-slate-100 border-dashed animate-fade-up')}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Huy hiệu tròn kiểu sticker */}
                <div className={cn('relative w-20 h-20 rounded-full border-[3px] border-slate-900 flex items-center justify-center text-4xl mt-1', a.earned ? cn(r.ring, 'shadow-hard-sm', TILTS[i % TILTS.length]) : 'bg-slate-200 grayscale opacity-60')}>
                  {a.earned ? <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,0.25)]">{a.icon}</span> : <Lock className="w-7 h-7 text-slate-500" />}
                  {a.earned && a.rarity === 'LEGENDARY' && <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-500 animate-wiggle" />}
                </div>
                <p className={cn('font-display font-bold text-sm mt-3 leading-tight', a.earned ? 'text-slate-900' : 'text-slate-500')}>{a.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug flex-1">{a.description}</p>
                <Badge tone={r.tone} size="xs" className="mt-2">
                  {r.label}
                </Badge>
                <div className="w-full mt-3">
                  {a.earned ? (
                    <p className="text-[10px] font-bold text-emerald-700">Đạt ngày {a.earnedAt ? formatDate(a.earnedAt) : ''}</p>
                  ) : (
                    <ProgressBar value={(a.progress / a.total) * 100} size="xs" tone="slate" label={`${a.progress}/${a.total}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
