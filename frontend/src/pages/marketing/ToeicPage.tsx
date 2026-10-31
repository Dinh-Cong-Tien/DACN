import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen } from 'lucide-react';
import { TOEIC_PARTS_INFO, MOCK_TESTS, SCORE_TABLE, SKILL_SCORES, MOCK_ATTEMPTS } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { PageHeader, Section, SectionHead, ActionLink, CtaStrip } from './shared/PageKit';
import { TestList } from './shared/TestList';

/** Bản xem trước phiếu kết quả thi thử (dữ liệu thật của lượt làm gần nhất trong mock) */
const ScoreReportPreview: React.FC = () => {
  const a = MOCK_ATTEMPTS[0];
  return (
    <figure className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-12px_rgba(16,24,40,0.14)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
        <div>
          <p className="text-sm font-semibold text-slate-900">{a.testTitle}</p>
          <p className="text-[12px] text-slate-500">Nộp bài 25/10/2026 · 1 giờ 54 phút</p>
        </div>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-700">Đã chấm</span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
        {[
          ['Tổng điểm', String(a.score), '/990'],
          ['Listening', String(a.listening), '/495'],
          ['Reading', String(a.reading), '/495'],
        ].map(([l, v, m]) => (
          <div key={l} className="px-5 py-4">
            <p className="text-[12px] text-slate-500">{l}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
              {v}
              <span className="text-sm font-normal text-slate-400">{m}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-2.5 px-5 py-4">
        <p className="text-[12px] text-slate-500">Tỉ lệ đúng theo Part</p>
        {SKILL_SCORES.map((s) => (
          <div key={s.skill} className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-[13px]">
            <span className="text-slate-600">{s.skill}</span>
            <span className="h-1.5 rounded-full bg-slate-100">
              <span className={cn('block h-full rounded-full', s.score < 62 ? 'bg-violet-500' : 'bg-indigo-600')} style={{ width: `${s.score}%` }} />
            </span>
            <span className="text-right tabular-nums text-slate-700">{s.score}%</span>
          </div>
        ))}
      </div>
      <figcaption className="border-t border-slate-200 px-5 py-3 text-[12px] text-slate-500">Part 4 và Part 7 dưới 62% → được xếp vào lộ trình tuần tới.</figcaption>
    </figure>
  );
};

export const ToeicPage: React.FC = () => {
  useDocumentTitle('Luyện thi TOEIC');
  const gate = useGate();
  const [active, setActive] = useState(TOEIC_PARTS_INFO[0].id);
  const part = TOEIC_PARTS_INFO.find((p) => p.id === active)!;
  const tests = MOCK_TESTS.filter((t) => t.examType === 'TOEIC').slice(0, 6);

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Luyện thi TOEIC' }]}
        title="Luyện thi TOEIC Listening & Reading"
        lead="Luyện từng Part với giải thích sau mỗi câu, thi thử full test đúng 120 phút, nộp bài là có điểm quy đổi 10–990 và biết Part nào đang kéo điểm xuống."
        actions={
          <>
            <ActionLink to={gate('/onboarding/goal', '/try')} size="lg">
              Làm bài xếp lớp miễn phí
            </ActionLink>
            <ActionLink to="/mock-tests" variant="secondary" size="lg">
              Xem đề thi thử
            </ActionLink>
          </>
        }
        facts={[
          { value: '200 câu', label: 'Số câu' },
          { value: '120 phút', label: 'Thời gian' },
          { value: '10 – 990', label: 'Thang điểm' },
          { value: '96 đề', label: 'Full test trên OrbiLingo' },
        ]}
        aside={<ScoreReportPreview />}
      />

      {/* Cấu trúc đề */}
      <Section>
        <SectionHead title="Cấu trúc đề thi" desc="7 Part, chia hai kỹ năng. Listening khoảng 45 phút (audio phát một lần), Reading 75 phút tự phân bổ." />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {(['Listening', 'Reading'] as const).map((skill) => (
              <div key={skill}>
                <p className="flex items-center gap-2 bg-[#F6F7F9] px-4 py-2.5 text-[13px] font-medium text-slate-600">
                  {skill === 'Listening' ? <Headphones className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  {skill} · {skill === 'Listening' ? '100 câu · ~45 phút' : '100 câu · 75 phút'}
                </p>
                {TOEIC_PARTS_INFO.filter((p) => p.skill === skill).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.id)}
                    className={cn(
                      'flex w-full items-center justify-between border-t border-slate-200 px-4 py-3 text-left text-sm transition-colors',
                      p.id === active ? 'bg-indigo-50 text-indigo-800' : 'text-slate-700 hover:bg-slate-50'
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
              <ActionLink to={gate('/app/practice', '/try')}>Luyện {part.name}</ActionLink>
              <Link to="/question-bank" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4">
                Xem câu hỏi mẫu
              </Link>
            </div>
          </article>
        </div>
      </Section>

      {/* Thang điểm */}
      <Section muted>
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
      <Section>
        <SectionHead title="Đề TOEIC trên OrbiLingo" desc="Đề ETS các năm và mini test theo kỹ năng. Đề miễn phí làm được ngay sau khi đăng ký." action={{ label: 'Tất cả đề thi', to: '/mock-tests' }} />
        <TestList tests={tests} />
        <div className="mt-12">
          <CtaStrip title="Chưa biết mình đang ở mức nào?" text="Bài xếp lớp 20 câu, khoảng 15 phút, có điểm ước lượng và lộ trình tới ngày thi." action={{ label: 'Làm bài xếp lớp', to: gate('/onboarding/goal', '/try') }} />
        </div>
      </Section>
    </div>
  );
};
