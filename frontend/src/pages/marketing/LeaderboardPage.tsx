import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePublicLeaderboard } from '@/shared/api/cms';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';
import { Accent, PageHeader, Section, UnderlineTabs, ActionLink } from './shared/PageKit';

type Period = 'week' | 'month';
type Exam = 'ALL' | 'TOEIC' | 'VSTEP';

// Huy chương top 3: vàng, bạc, đồng
const MEDAL = ['bg-[#F2C94C] text-[#5C4300]', 'bg-[#D5D9DE] text-[#3D444D]', 'bg-[#E3A778] text-[#5A2E0E]'];

const RULES = [
  ['Nộp một bài luyện tập hoặc đề thi', '10 điểm'],
  ['Mỗi câu làm đúng trong bài', '2 điểm'],
  ['Hoàn thành một bài học', '10 điểm'],
  ['Ôn một thẻ (nhớ được / chưa nhớ)', '2 / 1 điểm'],
  ['Bài chép chính tả', '1 điểm mỗi 10% chính xác'],
  ['Mỗi phút học được ghi nhận', '1 điểm'],
  ['Báo lỗi câu hỏi được trưởng bộ môn xác nhận', '20 điểm'],
];

export const LeaderboardPage: React.FC = () => {
  useDocumentTitle('Bảng vinh danh');
  const gate = useGate();
  const [period, setPeriod] = useState<Period>('week');
  const [exam, setExam] = useState<Exam>('ALL');

  const { data, isLoading } = usePublicLeaderboard({ period, exam, limit: 10 });
  const rows = useMemo(() => (data?.entries ?? []).map((u) => ({ ...u, score: u.points, place: u.rank })), [data]);
  const fmt = (d?: string) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : '');
  const week = useMemo(() => {
    // Nhãn tuần/tháng hiện tại theo giờ Việt Nam
    const now = new Date(Date.now() + 7 * 3600_000);
    const dow = (now.getUTCDay() + 6) % 7;
    const mon = new Date(now.getTime() - dow * 86400_000).toISOString().slice(0, 10);
    const sun = new Date(now.getTime() + (6 - dow) * 86400_000).toISOString().slice(0, 10);
    return { label: `Tuần ${fmt(mon)} – ${fmt(sun)}`, month: `Tháng ${now.getUTCMonth() + 1}/${now.getUTCFullYear()}` };
  }, []);

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Bảng vinh danh' }]}
        eyebrow="Bảng vinh danh"
        title={<>Học viên <Accent>chuyên cần</Accent> nhất</>}
        lead="Xếp theo điểm nỗ lực cộng từ bài luyện tập, đề thi thử, bài học và thẻ ôn tập. Bảng tuần làm mới lúc 0:00 thứ Hai."
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
                <option value="week">{week.label}</option>
                <option value="month">{week.month}</option>
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
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                        {isLoading ? 'Đang tải bảng xếp hạng…' : 'Chưa có học viên nào ghi điểm trong kỳ này. Học ngay để có tên đầu tiên trên bảng!'}
                      </td>
                    </tr>
                  )}
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
                        {u.target && <p className="text-[12px] text-slate-500">Mục tiêu {u.target}</p>}
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
              <p className="mt-3 text-[13px] text-slate-500">Điểm được cộng ngay khi hoàn thành từng hoạt động trên.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="font-medium text-slate-900">Muốn có tên trên bảng?</p>
              <p className="mt-1 text-sm text-slate-600">Học và làm bài đều đặn mỗi ngày để tích điểm theo bảng bên cạnh.</p>
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
