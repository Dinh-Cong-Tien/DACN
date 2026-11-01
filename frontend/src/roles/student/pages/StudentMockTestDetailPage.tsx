import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronRight, Lock, Play } from 'lucide-react';
import { useDocumentTitle, useParamState } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Breadcrumb } from '@/shared/components/ui';
import { Img } from '@/shared/components/media/Img';
import { MOCK_TESTS, MOCK_ATTEMPTS, TOEIC_PARTS_INFO, VSTEP_PARTS_INFO } from '@/shared/mocks';
import { cn, examSetupQuery, formatDate, formatDuration, formatNumber } from '@/shared/utils';
import type { ExamSetup, TestPartInfo } from '@/shared/types';
import { ActionButton, UnderlineTabs } from '@/pages/marketing/shared/PageKit';

/** Phần không làm trong phòng thi (VSTEP Viết / Nói có trang luyện riêng) */
const OUTSIDE_EXAM: Record<string, { label: string; to: string }> = {
  VSTEP_WRITING: { label: 'Làm ở trang Luyện Viết', to: '/app/writing' },
  VSTEP_SPEAKING: { label: 'Làm ở trang Luyện Nói', to: '/app/speaking' },
};

const TIME_CHOICES = [5, 10, 15, 20, 30, 45, 60, 75, 90, 120];

const RULES_FULL = ['Audio phát một lần, không tua lại.', 'Hết giờ hệ thống tự nộp bài.', 'Phím F để đánh dấu câu cần xem lại.', 'Câu sai được lưu vào Sổ tay lỗi sai.'];

/**
 * Chi tiết một đề: hai cách làm trên cùng một đề.
 * - Làm full test: toàn bộ Part, đúng giờ thi thật.
 * - Luyện tập: chọn Part muốn làm, tự đặt thời gian (hoặc không giới hạn). Thay cho trang "Luyện theo Part" riêng trước đây.
 */
export const StudentMockTestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const test = MOCK_TESTS.find((t) => t.id === id) ?? MOCK_TESTS[0];
  useDocumentTitle(test.title);
  const [mode, setMode] = useParamState('mode', ['full', 'practice'], 'full');

  const info = test.examType === 'TOEIC' ? TOEIC_PARTS_INFO : VSTEP_PARTS_INFO;
  const parts = useMemo(() => test.partIds.map((p) => info.find((x) => x.id === p)).filter(Boolean) as TestPartInfo[], [test, info]);
  const selectable = parts.filter((p) => !OUTSIDE_EXAM[p.id]);
  const attempts = MOCK_ATTEMPTS.filter((a) => a.testId === test.id);
  const locked = !test.isFree && user?.plan === 'FREE';

  const [picked, setPicked] = useState<string[]>([]);
  // 'auto' = tổng thời gian gợi ý của các Part đã chọn; 'none' = không giới hạn
  const [time, setTime] = useState<'auto' | 'none' | number>('auto');
  const chosen = selectable.filter((p) => picked.includes(p.id));
  const suggested = chosen.reduce((a, p) => a + (p.minutes ?? Math.ceil(p.questions / 2)), 0);
  const minutes = time === 'auto' ? suggested : time === 'none' ? null : time;
  const questionCount = chosen.reduce((a, p) => a + p.questions, 0);

  const toggle = (pid: string) => setPicked((s) => (s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]));
  const allPicked = selectable.length > 0 && chosen.length === selectable.length;
  const start = (setup: ExamSetup) => navigate(`/app/exam/${test.id}${examSetupQuery(setup)}`);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Thi thử', to: `/app/mock-tests?exam=${test.examType}` }, { label: test.title }]} />

      {/* Đầu trang */}
      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[280px_1fr] md:p-5">
        <Img src={test.coverUrl} alt={test.title} ratio="video" wrapperClass="rounded-xl" fallbackClass="bg-slate-200" />
        <div className="flex flex-col justify-center">
          <p className="text-[13px] font-medium text-slate-500">
            {test.examType} · {test.level} · Năm {test.year}
            {!test.isFree && <span className="ml-2 font-semibold text-amber-700">Gói VIP</span>}
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900 md:text-[2rem]">{test.title}</h1>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {[
              [String(test.totalQuestions), 'câu hỏi'],
              [`${test.durationMinutes} phút`, 'thời gian thi'],
              [String(parts.length), 'phần'],
              [formatNumber(test.attempts), 'lượt làm'],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse">
                <dt className="text-[12px] text-slate-500">{l}</dt>
                <dd className="font-display text-xl font-bold tabular-nums text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {locked && (
        <p className="rounded-xl border border-amber-300/60 bg-amber-500/10 px-4 py-3 text-sm text-slate-700">
          Đề này thuộc gói VIP.{' '}
          <Link to="/pricing" className="font-semibold text-indigo-700 underline underline-offset-2">
            Nâng cấp
          </Link>{' '}
          để làm toàn bộ kho đề.
        </p>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <UnderlineTabs
            value={mode}
            onChange={setMode}
            items={[
              { value: 'full', label: 'Làm full test' },
              { value: 'practice', label: 'Luyện tập theo Part' },
            ]}
          />

          {mode === 'full' ? (
            <div className="pt-5">
              <p className="text-slate-600">
                Làm toàn bộ {test.totalQuestions} câu trong {test.durationMinutes} phút, giống phòng thi thật. Điểm được quy đổi theo thang {test.examType === 'TOEIC' ? '10–990' : '0–10'}.
              </p>
              <ol className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
                {parts.map((p) => (
                  <li key={p.id} className="flex items-center gap-4 py-3">
                    <span className="w-16 shrink-0 text-sm font-semibold text-slate-900">{p.name}</span>
                    <span className="min-w-0 flex-1 text-sm text-slate-600">{p.nameVi}</span>
                    <span className="shrink-0 text-[13px] tabular-nums text-slate-500">{p.questions} câu</span>
                  </li>
                ))}
              </ol>
              <ul className="mt-5 grid gap-x-6 gap-y-1.5 text-[13px] text-slate-500 sm:grid-cols-2">
                {RULES_FULL.map((r) => (
                  <li key={r} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {r}
                  </li>
                ))}
              </ul>
              <ActionButton size="lg" className="mt-6 w-full sm:w-auto" onClick={() => start({ mode: 'FULL', parts: test.partIds, minutes: test.durationMinutes })}>
                {locked ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                Bắt đầu thi · {test.durationMinutes} phút
              </ActionButton>
            </div>
          ) : (
            <div className="pt-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-slate-600">Chọn Part muốn làm, sau đó đặt thời gian.</p>
                {selectable.length > 1 && (
                  <button type="button" onClick={() => setPicked(allPicked ? [] : selectable.map((p) => p.id))} className="shrink-0 text-sm font-semibold text-indigo-700 hover:underline underline-offset-2">
                    {allPicked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                )}
              </div>

              <ul className="mt-4 space-y-2">
                {parts.map((p) => {
                  const outside = OUTSIDE_EXAM[p.id];
                  const on = picked.includes(p.id);
                  const body = (
                    <>
                      <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors', outside ? 'border-slate-200 bg-slate-100' : on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white')}>
                        {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-900">
                          {p.name} <span className="font-normal text-slate-500">· {p.nameVi}</span>
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-slate-500">{p.description}</span>
                      </span>
                      <span className="shrink-0 text-right text-[13px] tabular-nums text-slate-500">
                        {outside ? (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-indigo-700">
                            {outside.label} <ChevronRight className="h-4 w-4" />
                          </span>
                        ) : (
                          <>
                            {p.questions} câu
                            <span className="block text-[12px] text-slate-400">~{p.minutes ?? Math.ceil(p.questions / 2)} phút</span>
                          </>
                        )}
                      </span>
                    </>
                  );
                  const cls = cn('flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors', on ? 'border-indigo-500/50 bg-indigo-500/[0.06]' : 'border-slate-200 hover:bg-slate-900/[0.025]');
                  return (
                    <li key={p.id}>
                      {outside ? (
                        <Link to={outside.to} className={cls}>
                          {body}
                        </Link>
                      ) : (
                        <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(p.id)} className={cls}>
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Thời gian làm bài</span>
                  <select
                    value={String(time)}
                    onChange={(e) => setTime(e.target.value === 'auto' || e.target.value === 'none' ? e.target.value : Number(e.target.value))}
                    className="mt-1.5 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-64"
                  >
                    <option value="auto">Theo thời gian gợi ý{chosen.length ? ` (${suggested} phút)` : ''}</option>
                    <option value="none">Không giới hạn</option>
                    {TIME_CHOICES.map((m) => (
                      <option key={m} value={m}>
                        {m} phút
                      </option>
                    ))}
                  </select>
                </label>
                <ActionButton size="lg" disabled={!chosen.length} onClick={() => start({ mode: 'PRACTICE', parts: chosen.map((p) => p.id), minutes })}>
                  <Play className="h-4 w-4 fill-current" />
                  {chosen.length ? `Bắt đầu luyện · ${questionCount} câu · ${minutes ? `${minutes} phút` : 'không giới hạn'}` : 'Chọn ít nhất một Part'}
                </ActionButton>
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-semibold text-slate-900">Lịch sử làm đề này</p>
          {attempts.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Bạn chưa làm đề này.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-200">
              {attempts.map((a) => (
                <li key={a.id}>
                  <Link to={`/app/mock-tests/${a.testId}/result`} className="flex items-center justify-between gap-3 py-3 hover:text-indigo-700">
                    <span>
                      <span className="block font-display text-lg font-bold tabular-nums text-slate-900">
                        {a.score}
                        <span className="text-sm font-medium text-slate-400">/{a.maxScore}</span>
                      </span>
                      <span className="block text-[12px] text-slate-500">
                        {formatDate(a.date)} · {formatDuration(a.durationSec)}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};
