import React, { useState } from 'react';
import { Trophy, Flame, ArrowUp, ArrowDown, Minus, Crown } from 'lucide-react';
import { MOCK_LEADERBOARD } from '@/shared/mocks';
import type { LeaderboardEntry } from '@/shared/types';
import { cn, formatNumber } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Avatar, Badge, Card, PageHeader, Segmented } from '@/shared/components/ui';

const Delta: React.FC<{ d: number }> = ({ d }) =>
  d === 0 ? (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-400">
      <Minus className="w-3 h-3" /> 0
    </span>
  ) : d > 0 ? (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
      <ArrowUp className="w-3 h-3" /> {d}
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600">
      <ArrowDown className="w-3 h-3" /> {Math.abs(d)}
    </span>
  );

const PODIUM: { rank: number; h: string; color: string; ring: string }[] = [
  { rank: 2, h: 'h-28', color: 'from-slate-300 to-slate-400', ring: 'ring-slate-300' },
  { rank: 1, h: 'h-40', color: 'from-amber-300 to-amber-500', ring: 'ring-amber-400' },
  { rank: 3, h: 'h-24', color: 'from-orange-300 to-orange-400', ring: 'ring-orange-300' },
];

export const StudentLeaderboardPage: React.FC = () => {
  useDocumentTitle('Bảng vinh danh');
  const [scope, setScope] = useState('week');
  const me = MOCK_LEADERBOARD.find((e) => e.isMe);
  const rest = MOCK_LEADERBOARD.filter((e) => e.rank > 3);
  const byRank = (r: number) => MOCK_LEADERBOARD.find((e) => e.rank === r) as LeaderboardEntry;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng vinh danh"
        icon={<Trophy />}
        description="Xếp hạng theo điểm nỗ lực tự học. Làm mới mỗi thứ Hai hằng tuần."
        actions={<Segmented options={[{ value: 'week', label: 'Tuần' }, { value: 'month', label: 'Tháng' }, { value: 'class', label: 'Lớp' }]} value={scope} onChange={setScope} />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <Card className="relative overflow-hidden" padding="lg">
            <div aria-hidden className="absolute inset-0 bg-dots opacity-60" />
            <div className="relative flex items-end justify-center gap-3 sm:gap-6">
              {PODIUM.map((p, i) => {
                const e = byRank(p.rank);
                return (
                  <div key={p.rank} className="flex flex-col items-center animate-fade-up w-28 sm:w-36" style={{ animationDelay: `${i * 150 + 100}ms` }}>
                    <div className="relative mb-2">
                      {p.rank === 1 && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-500 animate-bounce-soft" />}
                      <Avatar name={e.name} size={p.rank === 1 ? 'xl' : 'lg'} className={cn('rounded-full ring-4', p.ring)} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 text-center leading-tight truncate w-full">{e.name}</p>
                    <p className="text-[11px] text-slate-500">{formatNumber(e.points)} điểm</p>
                    <div className={cn('mt-2 w-full rounded-t-2xl bg-gradient-to-t flex items-start justify-center pt-3 text-white font-black text-2xl shadow-md', p.h, p.color)}>{p.rank}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {rest.map((e, i) => (
                <li key={e.rank} className={cn('flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 animate-fade-up transition-colors', e.isMe ? 'bg-indigo-50/70 ring-2 ring-inset ring-indigo-400' : 'hover:bg-slate-50')} style={{ animationDelay: `${i * 50 + 400}ms` }}>
                  <span className={cn('w-8 text-center font-black', e.isMe ? 'text-indigo-700' : 'text-slate-500')}>{e.rank}</span>
                  <Avatar name={e.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm truncate', e.isMe ? 'font-black text-indigo-900' : 'font-semibold text-slate-800')}>
                      {e.name} {e.isMe && <Badge tone="indigo" size="xs" className="ml-1">Bạn</Badge>}
                    </p>
                    <p className="text-[11px] text-slate-400">Mục tiêu {e.target}</p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" /> {e.streak}
                  </span>
                  <span className="font-black text-slate-900 text-sm w-20 text-right">{formatNumber(e.points)}</span>
                  <span className="w-10 text-right">
                    <Delta d={e.delta} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside>
          {me && (
            <Card className="sticky top-24 text-center space-y-3 animate-slide-in-right bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-0 shadow-lift">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200">Vị trí của bạn</p>
              <p className="text-6xl font-black">#{me.rank}</p>
              <Avatar name={me.name} size="lg" ring className="mx-auto" />
              <p className="font-bold">{me.name}</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/10 p-2">
                  <p className="text-lg font-black">{formatNumber(me.points)}</p>
                  <p className="text-[10px] uppercase text-indigo-200">Điểm</p>
                </div>
                <div className="rounded-xl bg-white/10 p-2">
                  <p className="text-lg font-black">{me.streak}</p>
                  <p className="text-[10px] uppercase text-indigo-200">Streak</p>
                </div>
              </div>
              <p className="text-xs text-indigo-100">
                Tăng <b>{me.delta}</b> bậc tuần này. Còn {formatNumber(byRank(me.rank - 1).points - me.points)} điểm để vượt #{me.rank - 1}.
              </p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
};
