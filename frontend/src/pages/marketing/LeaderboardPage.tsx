import React, { useState } from 'react';
import { Trophy, Flame, TrendingUp, TrendingDown, Minus, ArrowRight, Crown } from 'lucide-react';
import { Avatar, Badge, Button, Card, GradientPanel, SectionTitle, Segmented } from '@/shared/components/ui';
import { CountUp, Reveal, Stagger } from '@/shared/components/motion';
import { MOCK_LEADERBOARD } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';

const PODIUM = [
  { rank: 2, h: 'h-28', cls: 'from-slate-300 to-slate-400', medal: '🥈' },
  { rank: 1, h: 'h-36', cls: 'from-amber-300 to-amber-500', medal: '🥇' },
  { rank: 3, h: 'h-24', cls: 'from-orange-300 to-orange-400', medal: '🥉' },
];

export const LeaderboardPage: React.FC = () => {
  useDocumentTitle('Bảng vinh danh');
  const [period, setPeriod] = useState('week');
  const factor = period === 'week' ? 1 : 4.2;
  const rows = MOCK_LEADERBOARD.map((r) => ({ ...r, points: Math.round(r.points * factor), isMe: false }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-10">
      <Reveal>
        <SectionTitle eyebrow="Bảng vinh danh" title="Top học viên chuyên cần" description="Điểm nỗ lực tích luỹ từ câu hỏi luyện tập, đề thi thử, ôn tập và chuỗi ngày học liên tục." />
      </Reveal>
      <div className="flex justify-center animate-fade-up">
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'week', label: 'Tuần này' },
            { value: 'month', label: 'Tháng này' },
          ]}
        />
      </div>

      <div key={period} className="grid grid-cols-3 gap-3 items-end max-w-2xl mx-auto">
        {PODIUM.map((p, i) => {
          const r = rows.find((x) => x.rank === p.rank)!;
          return (
            <div key={p.rank} className="flex flex-col items-center gap-2 animate-pop" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="relative">
                <Avatar name={r.name} size={p.rank === 1 ? 'xl' : 'lg'} ring />
                {p.rank === 1 && <Crown className="w-6 h-6 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce-soft" />}
              </div>
              <p className="text-sm font-bold text-slate-900 text-center leading-tight">{r.name}</p>
              <p className="text-xs font-black text-indigo-600">
                <CountUp value={r.points} /> điểm
              </p>
              <div className={cn('w-full rounded-t-2xl bg-gradient-to-t flex items-start justify-center pt-3 text-2xl', p.h, p.cls)}>{p.medal}</div>
            </div>
          );
        })}
      </div>

      <Stagger key={`list-${period}`} className="space-y-2" step={40} whenVisible={false}>
        {rows.slice(3).map((r) => (
          <Card key={r.rank} padding="sm" className="flex items-center gap-4 hover:bg-indigo-50/30 transition">
            <span className="w-8 text-center font-black text-slate-400">#{r.rank}</span>
            <Avatar name={r.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{r.name}</p>
              <p className="text-xs text-slate-500">Mục tiêu: {r.target}</p>
            </div>
            <Badge tone="amber" icon={<Flame className="w-3 h-3" />} className="hidden sm:inline-flex">
              {r.streak} ngày
            </Badge>
            <span className={cn('text-xs font-bold flex items-center gap-0.5 w-10 justify-end', r.delta > 0 ? 'text-emerald-600' : r.delta < 0 ? 'text-rose-600' : 'text-slate-400')}>
              {r.delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : r.delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {r.delta !== 0 && Math.abs(r.delta)}
            </span>
            <span className="font-black text-indigo-700 text-sm w-20 text-right">{formatNumber(r.points)}</span>
          </Card>
        ))}
      </Stagger>

      <Reveal animation="scale-in">
        <GradientPanel tone="amber" className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 shrink-0" />
            <div>
              <h3 className="text-xl font-black">Bạn muốn có tên trên bảng này?</h3>
              <p className="text-amber-50 text-sm">Mỗi câu luyện tập +2 điểm, mỗi ngày học liên tục nhân hệ số streak.</p>
            </div>
          </div>
          <Button to="/auth/register" variant="secondary" className="bg-white text-amber-700 hover:bg-amber-50 shrink-0" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Tham gia ngay
          </Button>
        </GradientPanel>
      </Reveal>
    </div>
  );
};
