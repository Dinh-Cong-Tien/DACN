import React, { useMemo, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { useScoreTable } from '@/shared/api/cms';
import type { ScoreRow } from '@/shared/types';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { Accent, PageHeader, Section, SectionHead, CtaStrip } from './shared/PageKit';

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

function findRow(SCORE_TABLE: ScoreRow[], source: Source, value: string): ScoreRow | null {
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

const HINT: Record<Source, string> = { TOEIC: 'Điểm từ 10 đến 990', VSTEP: 'Điểm từ 0 đến 10', IELTS: 'Band từ 1.0 đến 9.0', CEFR: 'A1, A2, B1, B2, C1 hoặc C2' };
const DEFAULT: Record<Source, string> = { TOEIC: '650', VSTEP: '6.0', IELTS: '6.0', CEFR: 'B1' };

const NOTES = [
  'Bậc VSTEP theo Khung năng lực ngoại ngữ 6 bậc (Thông tư 01/2014/TT-BGDĐT), tương ứng CEFR A1–C2.',
  'Mức TOEIC theo tài liệu ánh xạ TOEIC – CEFR của ETS, tính trên tổng điểm Listening + Reading.',
  'TOEIC Listening & Reading không đo Viết và Nói, nên nhiều nơi yêu cầu thêm chứng chỉ 4 kỹ năng.',
  'Mỗi trường, mỗi cơ quan có bảng quy đổi riêng. Hãy đối chiếu văn bản của nơi bạn nộp chứng chỉ.',
];

const inputCls = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[15px] text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15';

export const ScoreConverterPage: React.FC = () => {
  useDocumentTitle('Quy đổi điểm');
  const [source, setSource] = useState<Source>('TOEIC');
  const [value, setValue] = useState('650');
  const { data: SCORE_TABLE = [] } = useScoreTable();
  const row = useMemo(() => findRow(SCORE_TABLE, source, value), [SCORE_TABLE, source, value]);

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Công cụ' }, { label: 'Quy đổi điểm' }]}
        eyebrow="Công cụ"
        title={<><Accent>Quy đổi điểm</Accent> TOEIC, VSTEP, IELTS, CEFR</>}
        lead="Nhập điểm bạn đang có, xem bậc tương đương ở các thang điểm khác. Công cụ miễn phí, không cần đăng nhập."
      />

      <Section innerClassName="pt-10 md:pt-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Công cụ */}
          <div className="rounded-xl border border-slate-200">
            <div className="grid items-start gap-4 border-b border-slate-200 p-5 sm:grid-cols-[1fr_auto_1fr] md:p-6">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Bạn đang có</span>
                <select
                  value={source}
                  onChange={(e) => {
                    const s = e.target.value as Source;
                    setSource(s);
                    setValue(DEFAULT[s]);
                  }}
                  className={inputCls}
                >
                  <option value="TOEIC">Điểm TOEIC (10 – 990)</option>
                  <option value="VSTEP">Điểm VSTEP (0 – 10)</option>
                  <option value="IELTS">Band IELTS (1 – 9)</option>
                  <option value="CEFR">Trình độ CEFR (A1 – C2)</option>
                </select>
              </label>
              <ArrowRightLeft className="mx-auto mt-10 hidden h-5 w-5 text-slate-400 sm:block" />
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Điểm</span>
                <input value={value} onChange={(e) => setValue(e.target.value)} inputMode={source === 'CEFR' ? 'text' : 'decimal'} className={cn(inputCls, 'tabular-nums')} />
                <span className="mt-1 block text-[12px] text-slate-500">{HINT[source]}</span>
              </label>
            </div>

            <div className="p-5 md:p-6" aria-live="polite">
              {row ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-slate-500">Tương đương</p>
                    <p className="text-sm text-slate-500">
                      CEFR <span className="text-lg font-semibold text-slate-900">{row.cefr}</span>
                    </p>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 sm:grid-cols-4">
                    {[
                      ['TOEIC', row.toeic],
                      ['VSTEP', row.vstep],
                      ['IELTS', row.ielts],
                      ['TOEFL iBT', row.toefl],
                    ].map(([l, v], i) => (
                      <div key={l} className={cn('p-3.5', i % 2 === 1 && 'border-l border-slate-200', i >= 2 && 'border-t border-slate-200 sm:border-t-0', i === 2 && 'sm:border-l')}>
                        <dt className="text-[12px] text-slate-500">{l}</dt>
                        <dd className="mt-1 font-semibold leading-snug text-slate-900 tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-[15px] text-slate-600">{row.description}</p>
                </>
              ) : (
                <p className="text-sm text-violet-700">Giá trị chưa hợp lệ. {HINT[source]}.</p>
              )}
            </div>
          </div>

          {/* Lưu ý */}
          <aside className="text-[15px] leading-relaxed text-slate-600">
            <h2 className="text-base font-semibold text-slate-900">Lưu ý khi dùng bảng quy đổi</h2>
            <ol className="mt-3 space-y-3">
              {NOTES.map((n, i) => (
                <li key={n} className="flex gap-3">
                  <span className="tabular-nums text-slate-400">{i + 1}.</span>
                  {n}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </Section>

      <Section muted>
        <SectionHead title="Bảng quy đổi đầy đủ" desc="Dòng tô nền ứng với điểm bạn vừa nhập." />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-[13px] text-slate-500">
              <tr className="border-b border-slate-200">
                {['CEFR', 'VSTEP (KNLNN Việt Nam)', 'TOEIC (L+R)', 'IELTS', 'TOEFL iBT', 'Mô tả'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium first:pl-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SCORE_TABLE.map((r) => (
                <tr key={r.cefr} className={cn('transition-colors', row?.cefr === r.cefr && 'bg-indigo-500/10')}>
                  <td className="px-5 py-3 font-semibold text-slate-900">{r.cefr}</td>
                  <td className="px-4 py-3 text-slate-800">{r.vstep}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-800">{r.toeic}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{r.ielts}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{r.toefl}</td>
                  <td className="px-4 py-3 text-slate-500">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-12">
          <CtaStrip title="Biết bậc mục tiêu rồi, còn bậc hiện tại?" text="Bài xếp lớp khoảng 15 phút cho điểm ước lượng và lộ trình tới mục tiêu." action={{ label: 'Làm bài xếp lớp', to: '/try' }} />
        </div>
      </Section>
    </div>
  );
};
