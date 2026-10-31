import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MOCK_LEADERBOARD } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';
import { Accent, PageHeader, Section, UnderlineTabs, ActionLink } from './shared/PageKit';

type Period = 'week' | 'month';
type Exam = 'ALL' | 'TOEIC' | 'VSTEP';

// Huy chương top 3: vàng, bạc, đồng
const MEDAL = ['bg-[#F2C94C] text-[#5C4300]', 'bg-[#D5D9DE] text-[#3D444D]', 'bg-[#E3A778] text-[#5A2E0E]'];

const RULES = [
  ['1 câu luyện tập làm đúng', '2 điểm'],
  ['1 câu làm sai rồi ôn lại đúng', '3 điểm'],
  ['1 đề full test nộp đủ giờ', '150 điểm'],
  ['Mỗi ngày giữ chuỗi học', '20 điểm'],
];

export const LeaderboardPage: React.FC = () => {
  useDocumentTitle('Bảng vinh danh');
  const gate = useGate();
  const [period, setPeriod] = useState<Period>('week');
  const [exam, setExam] = useState<Exam>('ALL');

  const rows = useMemo(() => {
    const base = MOCK_LEADERBOARD.map((u) => ({ ...u, score: period === 'week' ? u.points : Math.round(u.points * 4.3 + u.streak * 7) }));
    return base
      .filter((u) => exam === 'ALL' || u.target.startsWith(exam))
      .sort((a, b) => b.score - a.score)
      .map((u, i) => ({ ...u, place: i + 1 }));
  }, [period, exam]);

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Bảng vinh danh' }]}
        eyebrow="Bảng vinh danh"
        title={<>Học viên <Accent>chuyên cần</Accent> nhất</>}
        lead="Xếp theo điểm nỗ lực: số câu luyện tập, đề thi thử đã nộp và chuỗi ngày học liên tục. Bảng tuần làm mới lúc 0:00 thứ Hai."
      />

      <Section innerClassName="pt-8 md:pt-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <UnderlineTabs
                className="sm:flex-1"
                value={exam}
                onChange={setExam}
                items={[
                  { value: 'ALL', label: 'Tất cả' },
                  { value: 'TOEIC', label: 'TOEIC' },
                  { value: 'VSTEP', label: 'VSTEP' },
                ]}
              />
              <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="Khoảng thời gian" className="mb-1 h-9 self-start rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none">
                <option value="week">Tuần 27/10 – 02/11</option>
                <option value="month">Tháng 10/2026</option>
              </select>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100/60 text-left text-[13px] text-slate-500">
                  <tr>
                    <th className="w-16 px-4 py-3 font-medium">Hạng</th>
                    <th className="px-4 py-3 font-medium">Học viên</th>
                    <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Chuỗi ngày</th>
                    <th className="px-4 py-3 text-right font-medium">Điểm</th>
                    <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Thay đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((u) => (
                    <tr key={u.name}>
                      <td className="px-4 py-3">
                        {u.place <= 3 ? (
                          <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold', MEDAL[u.place - 1])}>{u.place}</span>
                        ) : (
                          <span className="inline-block w-7 text-center tabular-nums text-slate-500">{u.place}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-[12px] text-slate-500">Mục tiêu {u.target}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums text-slate-600 sm:table-cell">{u.streak} ngày</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">{formatNumber(u.score)}</td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        <span className={cn('inline-flex items-center gap-0.5 text-[13px] tabular-nums', u.delta > 0 ? 'text-emerald-700' : u.delta < 0 ? 'text-violet-700' : 'text-slate-400')}>
                          {u.delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : u.delta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                          {u.delta !== 0 && Math.abs(u.delta)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-slate-500">Hiển thị 10 học viên đầu bảng. Tên được hiển thị khi học viên bật chế độ công khai trong phần cài đặt.</p>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Cách tính điểm</h2>
              <table className="mt-3 w-full text-sm">
                <tbody className="divide-y divide-slate-200 border-y border-slate-200">
                  {RULES.map(([r, p]) => (
                    <tr key={r}>
                      <td className="py-2.5 pr-3 text-slate-600">{r}</td>
                      <td className="py-2.5 text-right tabular-nums text-slate-900">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[13px] text-slate-500">Làm lại đề cũ không được tính thêm điểm. Bài nộp dưới 30% thời gian bị loại.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="font-medium text-slate-900">Muốn có tên trên bảng?</p>
              <p className="mt-1 text-sm text-slate-600">Học khoảng 20 phút mỗi ngày trong một tuần thường đủ vào top 50.</p>
              <ActionLink to={gate('/app/leaderboard', '/auth/register')} className="mt-4 w-full">
                Bắt đầu học
              </ActionLink>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
};
