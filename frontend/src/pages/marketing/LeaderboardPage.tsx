import React, { useState } from 'react';
import { Trophy, Flame, TrendingUp, TrendingDown, Minus, ArrowRight, Crown } from 'lucide-react';
import { Button, SectionTitle, Segmented, Avatar, Badge, Card } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { MOCK_LEADERBOARD } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';

export const LeaderboardPage: React.FC = () => {
  useDocumentTitle('Bảng vinh danh');
  const [period, setPeriod] = useState('week');
  const top3 = MOCK_LEADERBOARD.slice(0, 3);
  const rest = MOCK_LEADERBOARD.slice(3);
  const podium = [top3[1], top3[0], top3[2]];
  const H = ['h-28', 'h-40', 'h-20'];
  const BG = ['bg-slate-200', 'bg-amber-300', 'bg-violet-200'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-12">
      <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionTitle align="left" eyebrow="Bảng vinh danh" title={<>Top học viên <span className="mark">chuyên cần</span> tuần này</>} description="Điểm nỗ lực tính theo số câu luyện tập, đề thi thử và ngày học liên tục. Làm mới 0h thứ Hai hằng tuần." />
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'week', label: 'Tuần' },
            { value: 'month', label: 'Tháng' },
          ]}
        />
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-3 gap-3 items-end">
          {podium.map((u, i) => (
            <div key={u.rank} className="flex flex-col items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="relative">
                {u.rank === 1 && <Crown className="w-7 h-7 text-amber-500 fill-amber-300 absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce-soft" />}
                <Avatar name={u.name} src={u.avatarUrl} size={u.rank === 1 ? 'xl' : 'lg'} ring />
              </div>
              <p className="font-bold text-slate-900 text-sm text-center leading-tight">{u.name}</p>
              <p className="text-xs text-slate-500">{u.target}</p>
              <div className={cn('w-full rounded-t-2xl border-2 border-b-0 border-slate-900 flex flex-col items-center justify-start pt-3', H[i], BG[i])}>
                <span className="font-display text-3xl font-extrabold text-slate-900">#{u.rank}</span>
                <span className="text-xs font-bold text-slate-700">{formatNumber(u.points)} điểm</span>
              </div>
            </div>
          ))}
        </div>
        <div className="h-1 bg-slate-900 rounded-full" />
      </Reveal>

      <Stagger className="space-y-2">
        {rest.map((u) => (
          <div key={u.rank} className={cn('flex items-center gap-4 p-3 md:p-4 rounded-2xl border-2 bg-white', u.isMe ? 'border-slate-900 shadow-hard bg-amber-100' : 'border-slate-200 hover:border-slate-900 transition')}>
            <span className="w-8 text-center font-display font-extrabold text-slate-500">{u.rank}</span>
            <Avatar name={u.name} src={u.avatarUrl} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">
                {u.name} {u.isMe && <Badge tone="violet" size="xs">Bạn</Badge>}
              </p>
              <p className="text-xs text-slate-500">{u.target}</p>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-700">
              <Flame className="w-4 h-4 text-violet-600 fill-violet-500" /> {u.streak} ngày
            </span>
            <span className="font-display font-extrabold text-slate-900 w-24 text-right">{formatNumber(u.points)}</span>
            <span className={cn('w-12 flex items-center justify-end gap-0.5 text-xs font-bold', u.delta > 0 ? 'text-emerald-600' : u.delta < 0 ? 'text-rose-600' : 'text-slate-400')}>
              {u.delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : u.delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {Math.abs(u.delta) || ''}
            </span>
          </div>
        ))}
      </Stagger>

      <Reveal>
        <Card hard tone="teal" padding="lg" className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Trophy className="w-10 h-10 text-amber-300" />
            <div>
              <h3 className="font-display text-2xl font-extrabold">Muốn có tên ở đây?</h3>
              <p className="text-indigo-100 text-sm">Học 20 phút mỗi ngày là đủ vào top 50.</p>
            </div>
          </div>
          <Button to="/auth/register" variant="white" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Bắt đầu
          </Button>
        </Card>
      </Reveal>
    </div>
  );
};
