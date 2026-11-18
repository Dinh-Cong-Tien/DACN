import React, { useState } from 'react';
import { Trophy, Flame, ArrowUp, ArrowDown, Minus, Crown } from 'lucide-react';
import { useLeaderboard } from '@/shared/api/learner';
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
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700">
      <ArrowUp className="w-3 h-3" /> {d}
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-violet-600">
      <ArrowDown className="w-3 h-3" /> {Math.abs(d)}
    </span>
  );

/** Bục trao giải: mỗi bậc một chất liệu kim loại (vàng/bạc/đồng), mặt trên sáng, mặt trước tối dần như khối thật */
const PODIUM: { rank: number; h: number; label: string; metal: { top: string; front: [string, string]; ring: string; text: string } }[] = [
  { rank: 2, h: 112, label: 'Hạng nhì', metal: { top: '#eef2f7', front: ['#cfd6e0', '#8a95a6'], ring: '#c3ccd8', text: '#3f4a5c' } },
  { rank: 1, h: 152, label: 'Quán quân', metal: { top: '#ffe9a8', front: ['#f2c14e', '#b07a12'], ring: '#f2c14e', text: '#5c3d00' } },
  { rank: 3, h: 88, label: 'Hạng ba', metal: { top: '#f8d2b4', front: ['#dc9a68', '#94532a'], ring: '#d9925f', text: '#4d2810' } },
];

export const StudentLeaderboardPage: React.FC = () => {
  useDocumentTitle('Bảng vinh danh');
  const [scope, setScope] = useState<'week' | 'month' | 'all'>('week');
  const { data, isLoading } = useLeaderboard(scope);
  const leaderboard = data?.entries ?? [];
  const me = leaderboard.find((e) => e.isMe);
  const rest = leaderboard.filter((e) => e.rank > 3);
  const byRank = (r: number) => leaderboard.find((e) => e.rank === r) as LeaderboardEntry | undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Bảng <span className="mark">vinh danh</span>
          </>
        }
        icon={<Trophy />}
        description="Xếp hạng theo điểm nỗ lực tự học. Làm mới mỗi thứ Hai hằng tuần."
        actions={<Segmented options={[{ value: 'week', label: 'Tuần' }, { value: 'month', label: 'Tháng' }, { value: 'all', label: 'Tất cả' }]} value={scope} onChange={(v) => setScope(v as 'week' | 'month' | 'all')} />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <Card hard className="relative overflow-hidden" padding="lg">
            {leaderboard.length === 0 && <p className="py-10 text-center text-sm text-slate-600">{isLoading ? 'Đang tải…' : 'Chưa có ai ghi điểm trong khoảng thời gian này. Học và làm bài để lên bảng!'}</p>}
            {leaderboard.length > 0 && (
              <div className="relative mx-auto max-w-xl pt-8">
                <div className="flex items-end justify-center gap-2 sm:gap-3">
                  {PODIUM.map((p, i) => {
                    const e = byRank(p.rank);
                    return (
                      <div key={p.rank} className="flex w-[30%] max-w-[150px] flex-col items-center animate-fade-up" style={{ animationDelay: `${i * 120 + 80}ms` }}>
                        {e ? (
                          <>
                            <div className="relative mb-3">
                              {p.rank === 1 && <Crown className="absolute -top-7 left-1/2 h-6 w-6 -translate-x-1/2 text-amber-500 fill-amber-300" />}
                              <div className="rounded-full p-[3px]" style={{ background: `linear-gradient(135deg, ${p.metal.top}, ${p.metal.front[1]})` }}>
                                <div className="rounded-full bg-white p-0.5">
                                  <Avatar name={e.name} src={e.avatarUrl} size={p.rank === 1 ? 'xl' : 'lg'} />
                                </div>
                              </div>
                              {/* Huy chương số hạng gắn ở chân ảnh */}
                              <span className="absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-extrabold shadow" style={{ background: `linear-gradient(135deg, ${p.metal.top}, ${p.metal.front[0]})`, color: p.metal.text, boxShadow: '0 1px 2px rgba(0,0,0,.35)' }}>
                                {p.rank}
                              </span>
                            </div>
                            <p className="w-full truncate text-center font-display text-sm font-bold leading-tight text-slate-900">{e.name}</p>
                            <p className="mb-2 text-[12px] font-semibold tabular-nums text-slate-500">{formatNumber(e.points)} điểm</p>
                          </>
                        ) : (
                          <p className="mb-2 text-[12px] text-slate-400">Còn trống</p>
                        )}
                        {/* Khối bục: mặt trên (nghiêng) + mặt trước */}
                        <div className="w-full">
                          <div className="mx-[6px] h-2.5 rounded-t-[3px]" style={{ background: p.metal.top, transform: 'perspective(60px) rotateX(35deg)', transformOrigin: 'bottom' }} />
                          <div className="flex w-full flex-col items-center justify-start pt-3" style={{ height: p.h, background: `linear-gradient(180deg, ${p.metal.front[0]}, ${p.metal.front[1]})`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.45), inset 0 -12px 18px rgba(0,0,0,.12)' }}>
                            <span className="font-display text-4xl font-extrabold leading-none" style={{ color: p.metal.text, textShadow: '0 1px 0 rgba(255,255,255,.45)' }}>
                              {p.rank}
                            </span>
                            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: p.metal.text, opacity: 0.75 }}>
                              {p.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Sàn đặt bục */}
                <div className="h-2 rounded-b-md" style={{ background: 'linear-gradient(180deg, rgba(100,116,139,.55), rgba(100,116,139,.25))' }} />
              </div>
            )}
          </Card>

          {rest.length > 0 && <Card hard padding="none" className="overflow-hidden">
            <ul className="divide-y-2 divide-slate-900/10">
              {rest.map((e, i) => (
                <li key={e.rank} className={cn('flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 animate-fade-up transition-colors', e.isMe ? 'bg-amber-100' : 'hover:bg-slate-50')} style={{ animationDelay: `${i * 50 + 400}ms` }}>
                  <span className={cn('w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center font-display font-extrabold text-sm', e.isMe ? 'bg-slate-900 text-amber-300' : 'bg-white text-slate-900')}>{e.rank}</span>
                  <Avatar name={e.name} src={e.avatarUrl} size="sm" ring />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm truncate', e.isMe ? 'font-extrabold text-slate-900' : 'font-bold text-slate-800')}>
                      {e.name}{' '}
                      {e.isMe && (
                        <Badge tone="violet" solid size="xs" className="ml-1">
                          Bạn
                        </Badge>
                      )}
                    </p>
                    {e.target && <p className="text-[11px] text-slate-500">Mục tiêu {e.target}</p>}
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-violet-600">
                    <Flame className="w-3.5 h-3.5 fill-violet-500" /> {e.streak}
                  </span>
                  <span className="font-display font-extrabold text-slate-900 text-sm w-20 text-right">{formatNumber(e.points)}</span>
                  <span className="w-10 text-right">
                    <Delta d={e.delta} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>}
        </div>

        <aside>
          {me && (
            <Card hard tone="teal" className="sticky top-24 text-center space-y-3 animate-slide-in-right">
              <span className="sticker tilt-2 !bg-amber-300">Vị trí của bạn</span>
              <p className="font-display text-6xl font-extrabold">#{me.rank}</p>
              <div className="inline-block rounded-full border-[3px] border-slate-900 p-0.5 bg-white">
                <Avatar name={me.name} src={me.avatarUrl} size="lg" />
              </div>
              <p className="font-display font-bold">{me.name}</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/15 border-2 border-white/30 p-2">
                  <p className="font-display text-lg font-extrabold">{formatNumber(me.points)}</p>
                  <p className="text-[10px] uppercase opacity-80">Điểm</p>
                </div>
                <div className="rounded-xl bg-white/15 border-2 border-white/30 p-2">
                  <p className="font-display text-lg font-extrabold">{me.streak}</p>
                  <p className="text-[10px] uppercase opacity-80">Streak</p>
                </div>
              </div>
              <p className="text-xs opacity-90">
                {me.delta > 0 ? <>Tăng <b>{me.delta}</b> bậc so với kỳ trước. </> : null}
                {me.rank > 1 && byRank(me.rank - 1) ? `Còn ${formatNumber(byRank(me.rank - 1)!.points - me.points)} điểm để vượt #${me.rank - 1}.` : 'Bạn đang dẫn đầu!'}
              </p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
};
