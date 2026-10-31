import React from 'react';
import { VSTEP_PARTS_INFO, MOCK_TESTS } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { PageHeader, Section, SectionHead, ActionLink, CtaStrip } from './shared/PageKit';
import { TestList } from './shared/TestList';

const LEVELS = [
  { level: 'B1', bac: 'Bậc 3', score: '4.0 – 5.5', who: 'Chuẩn đầu ra tốt nghiệp đại học ở hầu hết các trường', can: 'Nghe thông báo, hội thoại quen thuộc; viết email 120 từ; nói 2–3 phút về đời sống' },
  { level: 'B2', bac: 'Bậc 4', score: '6.0 – 8.0', who: 'Đầu vào/đầu ra thạc sĩ, giáo viên tiếng Anh tiểu học – THCS, nhiều vị trí doanh nghiệp', can: 'Đọc bài học thuật 600–800 từ; viết luận 250 từ có lập luận; thảo luận, phản biện' },
  { level: 'C1', bac: 'Bậc 5', score: '8.5 – 10', who: 'Giáo viên tiếng Anh THPT, giảng viên, nghiên cứu sinh', can: 'Dùng từ vựng học thuật linh hoạt; bài viết mạch lạc, cấu trúc phức; phát triển chủ đề trừu tượng' },
];

const GRADING: Record<string, string> = { Listening: 'Chấm tự động', Reading: 'Chấm tự động', Writing: 'Giáo viên chấm theo 4 tiêu chí', Speaking: 'Giáo viên chấm bản ghi âm' };

/** Bản xem trước phiếu chấm Writing của giáo viên (nội dung mẫu) */
const WritingFeedbackPreview: React.FC = () => (
  <figure className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-12px_rgba(16,24,40,0.14)]">
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
      <div>
        <p className="text-sm font-semibold text-slate-900">Writing Task 2 · Đề mẫu B2 số 1</p>
        <p className="text-[12px] text-slate-500">256 từ · nộp 19/10/2026 · chấm sau 31 giờ</p>
      </div>
      <p className="text-right">
        <span className="block text-2xl font-semibold tabular-nums text-slate-900">6.0</span>
        <span className="text-[12px] text-slate-500">/10 · B2</span>
      </p>
    </div>
    <dl className="divide-y divide-slate-200 text-sm">
      {[
        ['Hoàn thành nhiệm vụ', '6.5', 'Đủ ba ý, ví dụ ở đoạn 2 còn chung chung.'],
        ['Tổ chức bài', '6.0', 'Thiếu câu chuyển giữa đoạn 2 và 3.'],
        ['Từ vựng', '5.5', 'Lặp "important" 5 lần; thử "crucial", "vital".'],
        ['Ngữ pháp', '6.0', 'Sai mạo từ ở 4 chỗ, đã gạch chân trong bài.'],
      ].map(([c, s, n]) => (
        <div key={c} className="grid grid-cols-[1fr_auto] gap-x-4 px-5 py-3">
          <dt className="text-slate-700">{c}</dt>
          <dd className="font-semibold tabular-nums text-slate-900">{s}</dd>
          <dd className="col-span-2 mt-0.5 text-[13px] text-slate-500">{n}</dd>
        </div>
      ))}
    </dl>
    <figcaption className="flex items-center gap-2.5 border-t border-slate-200 px-5 py-3 text-[12px] text-slate-500">
      <img src="/images/support/co-hanh.webp" alt="" className="w-7 h-7 rounded-full object-cover" />
      Chấm bởi cô Nguyễn Thu Hạnh · giảng viên VSTEP
    </figcaption>
  </figure>
);

export const VstepPage: React.FC = () => {
  useDocumentTitle('Luyện thi VSTEP');
  const gate = useGate();
  const tests = MOCK_TESTS.filter((t) => t.examType === 'VSTEP');

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Luyện thi VSTEP' }]}
        title="Luyện thi VSTEP bậc 3–5 (B1, B2, C1)"
        lead="Nghe và Đọc chấm tự động ngay khi nộp. Viết và Nói được giáo viên chấm theo tiêu chí của Bộ GD&ĐT, có nhận xét từng lỗi để biết lần sau sửa gì."
        actions={
          <>
            <ActionLink to={gate('/onboarding/goal', '/try')} size="lg">
              Làm bài xếp lớp miễn phí
            </ActionLink>
            <ActionLink to="/mock-tests" variant="secondary" size="lg">
              Xem đề mẫu
            </ActionLink>
          </>
        }
        facts={[
          { value: '4 kỹ năng', label: 'Nghe · Đọc · Viết · Nói' },
          { value: '172 phút', label: 'Thời gian' },
          { value: '0 – 10', label: 'Thang điểm' },
          { value: '87 đề', label: 'Đề mẫu trên OrbiLingo' },
        ]}
        aside={<WritingFeedbackPreview />}
      />

      {/* Bậc năng lực */}
      <Section>
        <SectionHead title="Bạn cần bậc nào?" desc="Điểm VSTEP là trung bình 4 kỹ năng, làm tròn 0.5. Dưới 4.0 không được cấp chứng chỉ." />
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-[#F6F7F9] text-left text-[13px] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Bậc</th>
                <th className="px-4 py-3 font-medium">Điểm trung bình</th>
                <th className="px-4 py-3 font-medium">Thường được yêu cầu cho</th>
                <th className="px-5 py-3 font-medium">Cần làm được</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {LEVELS.map((l) => (
                <tr key={l.level} className="align-top">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-900 whitespace-nowrap">{l.level}</span>
                    <span className="block whitespace-nowrap text-[13px] text-slate-500">{l.bac}</span>
                  </td>
                  <td className="px-4 py-4 tabular-nums text-slate-900">{l.score}</td>
                  <td className="px-4 py-4 text-slate-700">{l.who}</td>
                  <td className="px-5 py-4 text-slate-600">{l.can}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Cấu trúc đề */}
      <Section muted>
        <SectionHead title="Cấu trúc bài thi" desc="Theo định dạng đề thi VSTEP.3-5 ban hành kèm Quyết định 729/QĐ-BGDĐT. Thi trên máy tính hoặc giấy tuỳ đơn vị tổ chức." />
        <div className="grid gap-4 md:grid-cols-2">
          {VSTEP_PARTS_INFO.map((p) => (
            <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {p.nameVi} <span className="font-normal text-slate-500">({p.name})</span>
                </h3>
                <p className="shrink-0 text-sm tabular-nums text-slate-600">{p.minutes} phút</p>
              </div>
              <p className="mt-1 text-[13px] text-slate-500">
                {p.questions} {p.skill === 'Writing' || p.skill === 'Speaking' ? 'phần' : 'câu'} · {GRADING[p.skill]}
              </p>
              <p className="mt-3 text-slate-700 leading-relaxed">{p.description}</p>
              <ul className="mt-4 space-y-1.5 border-t border-slate-200 pt-4 text-[14px] text-slate-600">
                {p.tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* Đề mẫu */}
      <Section>
        <SectionHead title="Đề VSTEP trên OrbiLingo" desc="Đề mẫu theo định dạng chính thức và đề luyện tập theo từng bậc." action={{ label: 'Tất cả đề thi', to: '/mock-tests' }} />
        <TestList tests={tests} />
        <div className="mt-12">
          <CtaStrip title="Không chắc nên thi B1 hay B2?" text="Bài xếp lớp khoảng 15 phút cho biết bậc hiện tại và số tuần cần để lên bậc mục tiêu." action={{ label: 'Làm bài xếp lớp', to: gate('/onboarding/goal', '/try') }} />
        </div>
      </Section>
    </div>
  );
};
