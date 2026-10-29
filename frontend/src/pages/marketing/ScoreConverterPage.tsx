import React, { useMemo, useState } from 'react';
import { Calculator, ArrowRightLeft, Info, ArrowRight } from 'lucide-react';
import { Badge, Card, Input, Select, SectionTitle, Button } from '@/shared/components/ui';
import { Reveal, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
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
  let best: ScoreRow | null = null;
  for (const r of SCORE_TABLE) {
    const range = parseRange(r[key]);
    if (range && n >= range[0]) best = r;
  }
  return best;
}

const HINT: Record<Source, string> = { TOEIC: 'Nhập điểm 10 – 990', VSTEP: 'Nhập điểm 0 – 10', IELTS: 'Nhập band 1.0 – 9.0', CEFR: 'Nhập A1, A2, B1, B2, C1, C2' };
const BG = ['bg-slate-100', 'bg-sky-100', 'bg-indigo-100', 'bg-amber-200', 'bg-violet-100', 'bg-emerald-100'];

export const ScoreConverterPage: React.FC = () => {
  useDocumentTitle('Quy đổi điểm');
  const [source, setSource] = useState<Source>('TOEIC');
  const [value, setValue] = useState('650');
  const row = useMemo(() => findRow(source, value), [source, value]);

  return (
    <div>
      <section className="relative bg-paper border-b-2 border-slate-900 overflow-hidden">
        <Doodles />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
          <div className="space-y-6">
            <SectionTitle align="left" eyebrow="Công cụ miễn phí" title={<>TOEIC của bạn bằng <span className="mark">VSTEP</span> bao nhiêu?</>} description="Quy đổi TOEIC ↔ VSTEP ↔ CEFR ↔ IELTS theo Khung năng lực ngoại ngữ 6 bậc Việt Nam. Nhập điểm, xem bậc tương đương ngay." />
            <div className="photo-frame tilt-1 max-w-sm">
              <Img src={PHOTOS.notes} alt="" ratio="video" fallbackClass="bg-amber-200" />
            </div>
          </div>
          <Reveal animation="scale-in">
            <Card hard padding="lg" className="space-y-5">
              <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <Select
                  label="Loại điểm nguồn"
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value as Source);
                    setValue(e.target.value === 'CEFR' ? 'B1' : e.target.value === 'TOEIC' ? '650' : '6.0');
                  }}
                  options={[
                    { value: 'TOEIC', label: 'TOEIC (10 – 990)' },
                    { value: 'VSTEP', label: 'VSTEP (0 – 10)' },
                    { value: 'IELTS', label: 'IELTS (1 – 9)' },
                    { value: 'CEFR', label: 'CEFR (A1 – C2)' },
                  ]}
                />
                <div className="hidden sm:flex w-11 h-11 rounded-xl bg-amber-300 border-2 border-slate-900 text-slate-900 items-center justify-center mb-0.5">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <Input label="Điểm của bạn" value={value} onChange={(e) => setValue(e.target.value)} hint={HINT[source]} leftIcon={<Calculator />} />
              </div>
              {row ? (
                <div key={row.cefr} className="rounded-2xl bg-slate-900 text-white border-2 border-slate-900 p-5 animate-pop">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Kết quả tương đương</p>
                    <Badge tone="amber" solid size="md">
                      CEFR {row.cefr}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      ['TOEIC', row.toeic],
                      ['VSTEP', row.vstep],
                      ['IELTS', row.ielts],
                      ['TOEFL iBT', row.toefl],
                    ].map(([l, v]) => (
                      <div key={l} className="rounded-xl bg-white/10 border border-white/15 p-3">
                        <p className="text-[10px] font-extrabold uppercase text-slate-400">{l}</p>
                        <p className="font-display text-lg font-extrabold leading-tight mt-1">{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 mt-4 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" /> {row.description}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-rose-600 font-semibold">Giá trị không hợp lệ. {HINT[source]}.</p>
              )}
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-8">
        <Reveal>
          <SectionTitle align="left" eyebrow="Bảng đầy đủ" title="Sáu bậc, năm thang điểm" description="Tham chiếu theo Thông tư 01/2014/TT-BGDĐT và khuyến nghị của ETS. Chỉ mang tính tương đối." />
        </Reveal>
        <Reveal>
          <div className="rounded-3xl border-2 border-slate-900 bg-white shadow-hard overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  {['CEFR', 'VSTEP (KNLNNVN)', 'TOEIC', 'IELTS', 'TOEFL iBT', 'Mô tả'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCORE_TABLE.map((r, i) => (
                  <tr key={r.cefr} className={cn('border-t-2 border-slate-200 transition', row?.cefr === r.cefr ? 'bg-amber-100' : '')}>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex w-10 h-10 rounded-xl border-2 border-slate-900 items-center justify-center font-display font-extrabold', BG[i])}>{r.cefr}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{r.vstep}</td>
                    <td className="px-4 py-3 font-bold text-indigo-700">{r.toeic}</td>
                    <td className="px-4 py-3 text-slate-700">{r.ielts}</td>
                    <td className="px-4 py-3 text-slate-700">{r.toefl}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal className="rounded-3xl bg-indigo-600 text-white border-2 border-slate-900 shadow-hard p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h3 className="font-display text-2xl font-extrabold">Biết bậc rồi, giờ biết mình đang ở đâu.</h3>
            <p className="text-indigo-100 mt-1">Thi xếp lớp 15 phút để có điểm ước lượng và lộ trình tới mục tiêu.</p>
          </div>
          <Button to="/auth/register" variant="white" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Thi xếp lớp
          </Button>
        </Reveal>
      </section>
    </div>
  );
};
