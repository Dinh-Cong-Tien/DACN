import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen } from 'lucide-react';
import { usePartsInfo, useTests } from '@/shared/api/catalog';
import { useExamGuides, useScoreTable } from '@/shared/api/cms';
import { TOEIC_GUIDE_SLUG } from '@/shared/constants/public';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import type { PartInfo } from '@/shared/api/catalog';
import { Accent, PageHeader, Section, SectionHead, ActionLink, CtaStrip } from './shared/PageKit';
import { TestList } from './shared/TestList';
import { ExamGuideList } from './shared/ExamGuideList';
import { appLocale } from '@/shared/i18n';

/** Ngân hàng câu hỏi TOEIC theo Part (số câu thật trong CSDL) */
const BankPreview: React.FC<{ parts: PartInfo[] }> = ({ parts }) => {
  const total = parts.reduce((a, p) => a + (p.bankCount ?? 0), 0);
  const sum = (skill: string) => parts.filter((p) => p.skill === skill).reduce((a, p) => a + (p.bankCount ?? 0), 0);
  const max = Math.max(1, ...parts.map((p) => p.bankCount ?? 0));
  return (
    <figure className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-12px_rgba(16,24,40,0.14)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
        <div>
          <p className="text-sm font-semibold text-slate-900">Ngân hàng câu hỏi TOEIC</p>
          <p className="text-[12px] text-slate-500">Số câu đã duyệt, dùng cho luyện Part và đề thi thử</p>
        </div>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-700">Cập nhật trực tiếp</span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
        {[
          ['Tổng số câu', total],
          ['Listening', sum('Listening')],
          ['Reading', sum('Reading')],
        ].map(([l, v]) => (
          <div key={l as string} className="px-5 py-4">
            <p className="text-[12px] text-slate-500">{l}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{(v as number).toLocaleString(appLocale())}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2.5 px-5 py-4">
        <p className="text-[12px] text-slate-500">Số câu theo Part</p>
        {parts.map((p) => (
          <div key={p.id} className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-3 text-[13px]">
            <span className="text-slate-600">{p.name}</span>
            <span className="h-1.5 rounded-full bg-slate-100">
              <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${((p.bankCount ?? 0) / max) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums text-slate-700">{(p.bankCount ?? 0).toLocaleString(appLocale())}</span>
          </div>
        ))}
      </div>
      <figcaption className="border-t border-slate-200 px-5 py-3 text-[12px] text-slate-500">Sau mỗi bài làm, phiếu điểm cho biết tỉ lệ đúng từng Part và đưa Part yếu vào lộ trình.</figcaption>
    </figure>
  );
};

export const ToeicPage: React.FC = () => {
  useDocumentTitle('Luyện thi TOEIC');
  const gate = useGate();
  const { data: TOEIC_PARTS_INFO = [] } = usePartsInfo('TOEIC');
  const { data: allTests = [] } = useTests({ examType: 'TOEIC' });
  const { data: TOEIC_GUIDES = [] } = useExamGuides('TOEIC');
  const { data: SCORE_TABLE = [] } = useScoreTable();
  const [active, setActive] = useState('PART_1');
  const part = TOEIC_PARTS_INFO.find((p) => p.id === active) ?? TOEIC_PARTS_INFO[0];
  const tests = allTests.slice(0, 6);

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Luyện thi TOEIC' }]}
        eyebrow="Luyện thi TOEIC"
        title={<>Luyện thi TOEIC <Accent>Listening & Reading</Accent></>}
        lead="Luyện từng Part với giải thích sau mỗi câu, thi thử full test đúng 120 phút, nộp bài là có điểm quy đổi 10–990 và biết Part nào đang kéo điểm xuống."
        actions={
          <>
            <ActionLink to={gate('/onboarding/goal', '/try')} size="lg">
              Làm bài xếp lớp miễn phí
            </ActionLink>
            <ActionLink to="/mock-tests?exam=TOEIC" variant="secondary" size="lg">
              Xem đề thi thử
            </ActionLink>
          </>
        }
        facts={[
          { value: '200 câu', label: 'Số câu' },
          { value: '120 phút', label: 'Thời gian' },
          { value: '10 – 990', label: 'Thang điểm' },
          { value: `${allTests.length} đề`, label: 'Full test trên OrbiLingo' },
        ]}
        aside={<BankPreview parts={TOEIC_PARTS_INFO} />}
      />

      {/* Bộ bài giới thiệu kỳ thi */}
      <Section>
        <SectionHead
          title="Tìm hiểu kỳ thi TOEIC"
          desc="8 bài đọc theo thứ tự: kỳ thi là gì, cấu trúc đề, cách tính điểm, đăng ký, quy định ngày thi, chứng chỉ, mức điểm cần đạt và cách bắt đầu ôn."
          action={{ label: 'Xem dạng danh sách', to: `/blog/category/${TOEIC_GUIDE_SLUG}` }}
        />
        <ExamGuideList posts={TOEIC_GUIDES} />
      </Section>

      {/* Cấu trúc đề */}
      <Section muted>
        <SectionHead title="Cấu trúc đề thi" desc="7 Part, chia hai kỹ năng. Listening khoảng 45 phút (audio phát một lần), Reading 75 phút tự phân bổ." />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {(['Listening', 'Reading'] as const).map((skill) => (
              <div key={skill}>
                <p className="flex items-center gap-2 bg-slate-100/60 px-4 py-2.5 text-[13px] font-medium text-slate-600">
                  {skill === 'Listening' ? <Headphones className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  {skill} · {skill === 'Listening' ? '100 câu · ~45 phút' : '100 câu · 75 phút'}
                </p>
                {TOEIC_PARTS_INFO.filter((p) => p.skill === skill).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.id)}
                    className={cn(
                      'flex w-full items-center justify-between border-t border-slate-200 px-4 py-3 text-left text-sm transition-colors',
                      p.id === active ? 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span>
                      <span className="font-medium">{p.name}</span> · {p.nameVi}
                    </span>
                    <span className="tabular-nums text-slate-500">{p.questions} câu</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {part && (
          <article key={part.id} className="rounded-xl border border-slate-200 p-6 md:p-8 animate-fade-in">
            <p className="text-[13px] text-slate-500">
              {part.skill} · {part.questions} câu{part.minutes ? ` · nên dành ~${part.minutes} phút` : ''}
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">
              {part.name}: {part.nameVi}
            </h3>
            <p className="mt-3 text-[17px] leading-relaxed text-slate-700">{part.description}</p>
            <h4 className="mt-7 text-sm font-semibold text-slate-900">Giáo viên lưu ý</h4>
            <ol className="mt-3 space-y-3 border-l-2 border-indigo-200 pl-5">
              {part.tips.map((t, i) => (
                <li key={t} className="text-[15px] text-slate-700">
                  <span className="mr-2 font-semibold tabular-nums text-indigo-700">{i + 1}.</span>
                  {t}
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ActionLink to={gate('/app/mock-tests?exam=TOEIC', '/try')}>Luyện {part.name} trong đề thi thử</ActionLink>
              <Link to="/question-bank" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4">
                Xem câu hỏi mẫu
              </Link>
            </div>
          </article>
          )}
        </div>
      </Section>

      {/* Thang điểm */}
      <Section>
        <SectionHead
          title="Điểm TOEIC tương đương bậc mấy?"
          desc="Quy đổi theo CEFR và Khung năng lực ngoại ngữ 6 bậc của Việt Nam. Chỉ mang tính tham khảo, mỗi trường có quy định riêng."
          action={{ label: 'Mở công cụ quy đổi', to: '/score-converter' }}
        />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-[13px] text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 font-medium">CEFR</th>
                <th className="px-4 py-3 font-medium">TOEIC (L+R)</th>
                <th className="px-4 py-3 font-medium">VSTEP</th>
                <th className="px-4 py-3 font-medium">IELTS</th>
                <th className="px-5 py-3 font-medium">Mô tả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SCORE_TABLE.map((r) => (
                <tr key={r.cefr}>
                  <td className="px-5 py-3 font-semibold text-slate-900">{r.cefr}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-900">{r.toeic}</td>
                  <td className="px-4 py-3 text-slate-700">{r.vstep}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{r.ielts}</td>
                  <td className="px-5 py-3 text-slate-500">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Đề thi thử */}
      <Section muted>
        <SectionHead title="Đề TOEIC trên OrbiLingo" desc="Đề full test 200 câu, có audio, đáp án và lời giải. Đề miễn phí làm được ngay sau khi đăng ký." action={{ label: 'Tất cả đề TOEIC', to: '/mock-tests?exam=TOEIC' }} />
        <TestList tests={tests} />
        <div className="mt-12">
          <CtaStrip title="Chưa biết mình đang ở mức nào?" text="Bài xếp lớp ngắn khoảng 15 phút, có điểm ước lượng và lộ trình tới ngày thi." action={{ label: 'Làm bài xếp lớp', to: gate('/onboarding/goal', '/try') }} />
        </div>
      </Section>
    </div>
  );
};
