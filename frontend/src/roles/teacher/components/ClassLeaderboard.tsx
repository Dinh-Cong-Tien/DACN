import React, { useState } from 'react';
import { Flame, Medal, Trophy } from 'lucide-react';
import { useClassLeaderboard, type ClassLeaderboard as LB } from '@/shared/api/teacher';
import { Avatar } from '@/shared/components/ui';
import { cn, timeAgo } from '@/shared/utils';
import { Panel, TTabs, tbl } from './TeacherKit';

const MEDAL = ['text-amber-500', 'text-slate-400', 'text-orange-700'];

/** Bảng xếp hạng lớp — cùng cách tính điểm nỗ lực với Bảng vinh danh của học viên, chỉ gồm học viên trong lớp */
export const ClassLeaderboardPanel: React.FC<{ classId: string }> = ({ classId }) => {
  const [period, setPeriod] = useState<LB['period']>('week');
  const { data, isLoading } = useClassLeaderboard(classId, period);
  const rows = data?.entries ?? [];
  return (
    <Panel title="Xếp hạng trong lớp" sub="Điểm nỗ lực từ bài làm, ôn tập, bài học, giống Bảng vinh danh của học viên" icon={Trophy} tone="amber" flush>
      <div className="border-b border-slate-100 px-5 pt-2">
        <TTabs
          className="border-b-0"
          value={period}
          onChange={(k) => setPeriod(k as LB['period'])}
          items={[
            { key: 'week', label: 'Tuần này' },
            { key: 'month', label: 'Tháng này' },
            { key: 'all', label: 'Từ đầu' },
          ]}
        />
      </div>
      <div className="overflow-x-auto">
        <table className={tbl.table}>
          <thead className={tbl.thead}>
            <tr>
              <th className={cn(tbl.th, 'w-16 text-center')}>Hạng</th>
              <th className={tbl.th}>Học viên</th>
              <th className={cn(tbl.th, 'text-right')}>Điểm nỗ lực</th>
              <th className={cn(tbl.th, 'text-right')}>Chuỗi ngày học</th>
              <th className={tbl.th}>Hoạt động gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.userId} className={tbl.tr}>
                <td className={cn(tbl.td, 'text-center font-display font-extrabold tabular-nums text-slate-900')}>
                  {r.rank <= 3 && r.points > 0 ? <Medal className={cn('mx-auto h-5 w-5', MEDAL[r.rank - 1])} aria-label={`Hạng ${r.rank}`} /> : r.rank}
                </td>
                <td className={tbl.td}>
                  <span className="flex items-center gap-2.5">
                    <Avatar name={r.name} src={r.avatarUrl} size="sm" />
                    <span className="font-medium text-slate-900">{r.name}</span>
                  </span>
                </td>
                <td className={cn(tbl.td, 'text-right font-semibold tabular-nums text-slate-900')}>{r.points}</td>
                <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-orange-500" /> {r.streak} ngày
                  </span>
                </td>
                <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{r.lastActiveAt ? timeAgo(r.lastActiveAt) : '—'}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                  {isLoading ? 'Đang tải…' : 'Lớp chưa có học viên.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
