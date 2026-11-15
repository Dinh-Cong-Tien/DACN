import React, { useMemo, useState } from 'react';
import { fireConfetti } from '@/shared/components/motion/confetti';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Clock, RotateCcw, BookmarkPlus, Share2, Flag, CheckCircle2, XCircle } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, RingProgress, Tabs, EmptyState } from '@/shared/components/ui';
import { QuestionRenderer } from '@/engines';
import { useAttempt, useAttempts } from '@/shared/api/learner';
import { errorMessage } from '@/shared/api/client';
import { toast } from '@/shared/stores/uiStore';
import { cn, examSetupQuery, formatDuration, getCorrectKey } from '@/shared/utils';

const barTone = (p: number) => (p >= 70 ? 'bg-emerald-500' : p >= 40 ? 'bg-amber-500' : 'bg-rose-500');

interface ViewResult {
  answers: Record<string, string>;
  flagged: string[];
  timeSpentSec: number;
  correctCount: number;
  total: number;
  bySection: { name: string; correct: number; total: number }[];
}

export const StudentExamResultPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const attemptParam = new URLSearchParams(search).get('attempt') ?? undefined;
  // Không có ?attempt → lấy lượt nộp gần nhất của đề này
  const latest = useAttempts({ testId: id, pageSize: 1 }, !attemptParam);
  const attemptId = attemptParam ?? latest.data?.items[0]?.id;
  const { data: payload, isLoading, error } = useAttempt(attemptId);
  const [tab, setTab] = useState('wrong');
  const test = payload?.test;
  const setup = payload?.attempt.setup;
  const practice = setup?.mode === 'PRACTICE' || (!!payload && payload.attempt.mode !== 'FULL');
  const questions = useMemo(() => (test ? test.sections.flatMap((s) => s.questions) : []), [test]);
  useDocumentTitle(`Kết quả · ${test?.title ?? ''}`);

  const result = useMemo<ViewResult | null>(() => {
    if (!payload?.result || !test) return null;
    const ans = payload.result.answers;
    const answers: Record<string, string> = {};
    ans.forEach((a) => a.selectedKey && (answers[a.questionId] = a.selectedKey));
    const correctSet = new Set(ans.filter((a) => a.isCorrect).map((a) => a.questionId));
    return {
      answers,
      flagged: ans.filter((a) => a.isFlagged).map((a) => a.questionId),
      timeSpentSec: payload.result.summary.durationSec,
      correctCount: payload.result.summary.correct,
      total: payload.result.summary.total,
      bySection: test.sections.map((s) => ({ name: s.name, total: s.questions.length, correct: s.questions.filter((q) => correctSet.has(q.id)).length })),
    };
  }, [payload, test]);

  const pct = result ? Math.round((result.correctCount / Math.max(1, result.total)) * 100) : 0;
  React.useEffect(() => { if (result && pct >= 60) fireConfetti(); }, [pct, result]);

  if (!result || !test || !payload) {
    const loading = isLoading || latest.isLoading;
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Đề thi thử', to: '/app/mock-tests' }, { label: 'Kết quả' }]} title={<>Kết quả <span className="mark">bài thi</span></>} />
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải kết quả…</p>
        ) : (
          <EmptyState
            title={error ? 'Không tải được kết quả' : 'Chưa có kết quả'}
            description={error ? errorMessage(error) : 'Bạn chưa nộp bài nào cho đề này.'}
            action={<Button onClick={() => navigate(`/app/mock-tests/${id}`)}>Xem đề thi</Button>}
          />
        )}
      </div>
    );
  }

  const isVstep = test.examType === 'VSTEP';
  // Điểm do server quy đổi (TOEIC theo bảng quy đổi, VSTEP thang 10); luyện tập = số câu đúng
  const summary = payload.result!.summary;
  const pending = summary.status === 'GRADING';
  const score = summary.score;
  const maxScore = practice ? result.total : payload.result!.summary.maxScore || (isVstep ? 10 : 990);
  const wrong = questions.filter((q) => result.answers[q.id] !== getCorrectKey(q));
  const flaggedQ = questions.filter((q) => result.flagged.includes(q.id));
  const list = tab === 'all' ? questions : tab === 'wrong' ? wrong : flaggedQ;
  // Điểm từng kỹ năng (đề full): TOEIC Nghe/Đọc thang 495; VSTEP 4 kỹ năng thang 10
  const skillScores: { label: string; value?: number; max: number }[] = practice
    ? []
    : isVstep
      ? [
          { label: 'Nghe', value: summary.listening, max: 10 },
          { label: 'Đọc', value: summary.reading, max: 10 },
          { label: 'Viết', value: summary.writing, max: 10 },
          { label: 'Nói', value: summary.speaking, max: 10 },
        ].filter((k) => k.value !== undefined || pending)
      : [
          { label: 'Nghe (Listening)', value: summary.listening, max: 495 },
          { label: 'Đọc (Reading)', value: summary.reading, max: 495 },
        ].filter((k) => k.value !== undefined);
  const wrongAnswered = wrong.filter((q) => result.answers[q.id]).length;
  const blank = wrong.length - wrongAnswered;
  const ringPct = practice ? pct : Math.round((score / Math.max(1, maxScore)) * 100);
  // Đề full: xếp mức theo điểm quy đổi (thang 990 / 10); luyện tập: theo tỉ lệ câu đúng
  const lv = practice ? pct : ringPct;
  const tone = lv >= 75 ? 'emerald' : lv >= 50 ? 'amber' : 'rose';
  const level = pending
    ? { label: 'Đang chờ chấm', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', message: 'Giáo viên đang chấm bài Viết / Nói. Điểm tổng sẽ có khi chấm xong.' }
    : lv >= 75
      ? { label: 'Tốt', badge: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500', message: 'Bạn đã vượt mục tiêu chặng. Giữ nhịp luyện đề đều đặn.' }
      : lv >= 50
        ? { label: 'Khá', badge: 'bg-amber-500/15 text-amber-600', dot: 'bg-amber-500', message: 'Còn vài phần cần cải thiện — xem lại các câu sai bên dưới.' }
        : { label: 'Cần cải thiện', badge: 'bg-rose-500/10 text-rose-600', dot: 'bg-rose-500', message: 'Xem lại lỗi sai và luyện thêm các phần có tỉ lệ đúng thấp.' };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: `Đề thi thử ${test.examType}`, to: `/app/mock-tests?exam=${test.examType}` }, { label: test.title, to: `/app/mock-tests/${id}` }, { label: 'Kết quả' }]}
        title={
          <>
            Kết quả <span className="mark">bài thi</span>
          </>
        }
        description={test.title}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Share2 className="w-4 h-4" />} onClick={() => { void navigator.clipboard?.writeText(window.location.href); toast.info('Đã sao chép liên kết kết quả'); }}>
              Chia sẻ
            </Button>
            <Button size="sm" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={() => navigate(`/app/exam/${id}${setup ? examSetupQuery(setup) : ''}`)}>
              Làm lại
            </Button>
          </>
        }
      />

      {/* Tổng quan kết quả: điểm + chỉ số chính + kết quả theo phần */}
      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center justify-center gap-3 border-b border-slate-200 px-6 py-7 text-center md:border-b-0 md:border-r">
            <RingProgress value={ringPct} size={152} stroke={10} tone={tone}>
              <div>
                {pending ? (
                  <p className="font-display text-xl font-bold text-slate-500">Chờ chấm</p>
                ) : (
                  <>
                    <p className="font-display text-[40px] font-bold leading-none tabular-nums text-slate-900">{score}</p>
                    <p className="mt-1 text-[12px] font-medium text-slate-500">
                      / {maxScore} {practice ? 'câu đúng' : 'điểm'}
                    </p>
                  </>
                )}
              </div>
            </RingProgress>
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold', level.badge)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', level.dot)} />
              {level.label}
            </span>
            <p className="max-w-[220px] text-[13px] leading-snug text-slate-500">{level.message}</p>
            {skillScores.length > 0 && (
              <dl className="mt-1 w-full max-w-[220px] divide-y divide-slate-100 border-t border-slate-200 text-[13px]">
                {skillScores.map((k) => (
                  <div key={k.label} className="flex items-center justify-between py-1.5">
                    <dt className="text-slate-500">{k.label}</dt>
                    <dd className="tabular-nums text-slate-900">{k.value === undefined ? <span className="text-slate-400">Chờ chấm</span> : <><b className="font-semibold">{k.value}</b><span className="text-slate-400">/{k.max}</span></>}</dd>
                  </div>
                ))}
                {isVstep && summary.cefr && !pending && (
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-slate-500">Bậc CEFR</dt>
                    <dd className="font-semibold text-slate-900">{summary.cefr}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className="min-w-0 p-5 sm:p-6">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
              {[
                { icon: CheckCircle2, label: 'Câu đúng', value: `${result.correctCount}/${result.total}`, hint: `${pct}% chính xác` },
                { icon: XCircle, label: 'Câu sai', value: String(wrongAnswered), hint: `${blank} câu bỏ trống` },
                { icon: Clock, label: 'Thời gian', value: formatDuration(result.timeSpentSec), hint: `${Math.round(result.timeSpentSec / Math.max(1, result.total))}s / câu` },
                { icon: Flag, label: 'Đánh dấu', value: String(flaggedQ.length), hint: 'câu cần xem lại' },
              ].map((s) => (
                <div key={s.label} className="bg-white px-4 py-3">
                  <dt className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                    <s.icon className="h-3.5 w-3.5" /> {s.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{s.value}</dd>
                  <dd className="text-[12px] text-slate-400">{s.hint}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Kết quả theo phần</h2>
                <span className="text-[12px] text-slate-400">Số câu đúng / tổng</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {result.bySection.map((s) => {
                  const p = Math.round((s.correct / Math.max(1, s.total)) * 100);
                  return (
                    <li key={s.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-2.5 sm:grid-cols-[minmax(0,220px)_1fr_auto]">
                      <span className="truncate text-[13px] font-medium text-slate-700" title={s.name}>
                        {s.name}
                      </span>
                      <span className="col-span-2 row-start-2 h-1.5 overflow-hidden rounded-full bg-slate-100 sm:col-span-1 sm:row-start-auto">
                        <span className={cn('block h-full rounded-full transition-[width] duration-700', barTone(p))} style={{ width: `${Math.max(p, p > 0 ? 2 : 0)}%` }} />
                      </span>
                      <span className="col-start-2 row-start-1 text-right text-[13px] tabular-nums text-slate-500 sm:col-start-auto sm:row-start-auto">
                        <b className="font-semibold text-slate-900">{s.correct}</b>/{s.total}
                        <span className="ml-2 inline-block w-9 text-slate-400">{p}%</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Card hard className="animate-fade-up" padding="none">
        <div className="p-5 border-b-2 border-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <CardHeader title="Xem lại bài làm" subtitle="Đáp án đúng, giải thích chi tiết và phân loại lỗi" icon={<CheckCircle2 />} className="mb-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <Tabs
              variant="pill"
              value={tab}
              onChange={setTab}
              items={[
                { key: 'all', label: 'Tất cả', count: questions.length },
                { key: 'wrong', label: 'Câu sai', count: wrong.length },
                { key: 'flag', label: 'Đánh dấu', icon: <Flag />, count: flaggedQ.length },
              ]}
            />
            <Button size="sm" variant="soft" leftIcon={<BookmarkPlus className="w-4 h-4" />} onClick={() => navigate('/app/mistakes')}>
              Lưu lỗi sai
            </Button>
          </div>
        </div>
        <div className="p-5 space-y-5 bg-paper">
          {list.length === 0 ? (
            <EmptyState title="Không có câu nào" description={tab === 'wrong' ? 'Bạn không sai câu nào. Xuất sắc!' : 'Bạn chưa đánh dấu câu nào trong bài thi.'} compact />
          ) : (
            list.map((q, i) => (
              <div key={q.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone={result.answers[q.id] === getCorrectKey(q) ? 'emerald' : 'violet'} solid size="xs">
                    {result.answers[q.id] ? (result.answers[q.id] === getCorrectKey(q) ? 'Đúng' : `Bạn chọn ${result.answers[q.id]}`) : 'Bỏ trống'}
                  </Badge>
                  {result.flagged.includes(q.id) && (
                    <Badge tone="amber" size="xs" icon={<Flag className="w-3 h-3" />}>
                      Đã đánh dấu
                    </Badge>
                  )}
                </div>
                <QuestionRenderer question={q} index={questions.indexOf(q)} selectedAnswer={result.answers[q.id]} onSelectAnswer={() => undefined} showExplanation isReadOnly hideAudio />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
