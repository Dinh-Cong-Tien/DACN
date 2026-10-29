import React, { useMemo, useState } from 'react';
import { Calculator, ArrowRightLeft, Info } from 'lucide-react';
import { Badge, Card, Input, Select, SectionTitle, Alert } from '@/shared/components/ui';
import { Reveal } from '@/shared/components/motion';
import { SCORE_TABLE } from '@/shared/mocks';
import type { ScoreRow } from '@/shared/types';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';

type Source = 'TOEIC' | 'VSTEP' | 'IELTS' | 'CEFR';

/** Parse "550 – 780", "< 30", "990", "8.5 – 10", "Bậc 3 (4.0 – 5.5)" → [min, max] */
function parseRange(s: string): [number, number] | null {
  const inner = s.includes('(') ? s.slice(s.indexOf('(') + 1, s.indexOf(')')) : s;
  const nums = inner.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (!nums.length) return null;
  if (inner.trim().startsWith('<')) return [0, nums[0] - 0.01];
  if (nums.length === 1) return [nums[0], nums[0]];
  return [nums[0], nums[1]];
}

function findRow(source: Source, value: string): ScoreRow | null {
  if (source === 'CEFR') return SCORE_TABLE.find((r) => r.cefr.toLowerCase() === value.trim().toLowerCase()) ?? null;
  const n = Number(value);
  if (Number.isNaN(n) || value === '') return null;
  const key = source === 'TOEIC' ? 'toeic' : source === 'VSTEP' ? 'vstep' : 'ielts';
  for (const r of SCORE_TABLE) {
    const range = parseRange(r[key]);
    if (range && n >= range[0] && n <= range[1]) return r;
  }
  // nằm giữa các khoảng → lấy hàng gần nhất phía dưới
  let best: ScoreRow | null = null;
  for (const r of SCORE_TABLE) {
    const range = parseRange(r[key]);
    if (range && n >= range[0]) best = r;
  }
  return best;
}

const HINT: Record<Source, string> = { TOEIC: 'Nhập điểm 10 – 990', VSTEP: 'Nhập điểm 0 – 10', IELTS: 'Nhập band 1.0 – 9.0', CEFR: 'Nhập A1, A2, B1, B2, C1, C2' };

export const ScoreConverterPage: React.FC = () => {
  useDocumentTitle('Quy đổi điểm');
  const [source, setSource] = useState<Source>('TOEIC');
  const [value, setValue] = useState('650');
  const row = useMemo(() => findRow(source, value), [source, value]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-10">
      <Reveal>
        <SectionTitle eyebrow="Công cụ miễn phí" title="Quy đổi điểm TOEIC ↔ VSTEP ↔ CEFR ↔ IELTS" description="Tham chiếu theo Khung năng lực ngoại ngữ 6 bậc Việt Nam (KNLNNVN) và Khung tham chiếu châu Âu CEFR." />
      </Reveal>

      <Reveal animation="scale-in">
        <Card padding="lg" className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <Select
              label="Loại điểm nguồn"
              value={source}
              onChange={(e) => {
                setSource(e.target.value as Source);
                setValue(e.target.value === 'CEFR' ? 'B1' : e.target.value === 'TOEIC' ? '650' : e.target.value === 'VSTEP' ? '6.0' : '6.0');
              }}
              options={[
                { value: 'TOEIC', label: 'TOEIC (10 – 990)' },
                { value: 'VSTEP', label: 'VSTEP (0 – 10)' },
                { value: 'IELTS', label: 'IELTS (1 – 9)' },
                { value: 'CEFR', label: 'CEFR (A1 – C2)' },
              ]}
            />
            <div className="hidden sm:flex w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 items-center justify-center mb-0.5">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <Input label="Điểm của bạn" value={value} onChange={(e) => setValue(e.target.value)} hint={HINT[source]} leftIcon={<Calculator />} />
          </div>

          {row ? (
            <div key={row.cefr} className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 animate-pop">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-indigo-100">Kết quả tương đương</p>
                <Badge className="bg-white/20 text-white border-white/30">CEFR {row.cefr}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['TOEIC', row.toeic],
                  ['VSTEP', row.vstep],
                  ['IELTS', row.ielts],
                  ['TOEFL iBT', row.toefl],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">{l}</p>
                    <p className="text-lg font-black mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-indigo-100 mt-4 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" /> {row.description}
              </p>
            </div>
          ) : (
            <Alert type="warning" className="mt-6" title="Không tìm thấy mức tương đương">
              Kiểm tra lại giá trị nhập. {HINT[source]}.
            </Alert>
          )}
        </Card>
      </Reveal>

      <Reveal>
        <h2 className="text-xl font-black text-slate-900 mb-4">Bảng quy đổi đầy đủ</h2>
        <Card padding="none" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
              <tr>
                {['CEFR', 'VSTEP (KNLNNVN)', 'TOEIC L&R', 'IELTS', 'TOEFL iBT', 'Mô tả'].map((h) => (
                  <th key={h} className={cn('text-left px-5 py-3', h === 'Mô tả' && 'hidden lg:table-cell')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCORE_TABLE.map((r) => {
                const active = row?.cefr === r.cefr;
                return (
                  <tr key={r.cefr} className={cn('border-t border-slate-100 transition-colors duration-500', active ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-300' : 'hover:bg-slate-50')}>
                    <td className="px-5 py-3.5 font-black text-indigo-700">{r.cefr}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{r.vstep}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{r.toeic}</td>
                    <td className="px-5 py-3.5 text-slate-700">{r.ielts}</td>
                    <td className="px-5 py-3.5 text-slate-700">{r.toefl}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{r.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <p className="text-xs text-slate-400 mt-3">* Bảng quy đổi mang tính tham khảo, tổng hợp từ ETS, Bộ GD&ĐT (Thông tư 01/2014) và British Council. Mỗi đơn vị tuyển dụng/đào tạo có thể áp dụng chuẩn riêng.</p>
      </Reveal>
    </div>
  );
};
