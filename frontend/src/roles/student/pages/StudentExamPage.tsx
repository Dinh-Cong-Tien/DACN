import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ExamRunner } from '@/engines';
import { useDocumentTitle } from '@/shared/hooks';
import { EmptyState, Button } from '@/shared/components/ui';
import { History, RotateCcw, Play } from 'lucide-react';
import { formatClock, parseExamSetup } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { saveAnswers, startAttempt, useSubmitAttempt, useTest, type AttemptPayload, type SaveAnswerItem } from '@/shared/api/learner';

/** Chu kỳ tự lưu đáp án (luồng #4 — 15 giây) */
const AUTOSAVE_MS = 15_000;

export const StudentExamPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { data: summary, error: testError } = useTest(id);
  // ?parts=…&time=… → luyện tập theo Part; không có query → full test
  const setup = useMemo(() => (summary ? parseExamSetup(search, summary.partIds ?? [], summary.durationMinutes ?? 120) : null), [search, summary]);
  const assignmentId = new URLSearchParams(search).get('assignment') ?? undefined;

  const [payload, setPayload] = useState<AttemptPayload | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  // Có lượt đang làm dở cùng đề → hỏi "Tiếp tục" hay "Làm lại từ đầu" trước khi vào phòng thi
  const [askResume, setAskResume] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const started = useRef(false);
  const elapsedRef = useRef(0);
  // Đã bấm nộp → không tự lưu nữa (lượt đã đóng; lần vào sau mở lượt mới, không hỏi làm tiếp)
  const submittedRef = useRef(false);
  const pending = useRef(new Map<string, SaveAnswerItem>());
  const submit = useSubmitAttempt();

  const start = (restart?: boolean) =>
    startAttempt({ testId: id, mode: setup!.mode, parts: setup!.mode === 'PRACTICE' ? setup!.parts : undefined, minutes: setup!.mode === 'PRACTICE' ? setup!.minutes : undefined, assignmentId, restart });

  // Bắt đầu lượt làm bài — chỉ một lần; máy chủ trả resumed khi còn lượt chưa nộp
  useEffect(() => {
    if (!setup || started.current) return;
    started.current = true;
    start()
      .then((p) => {
        setPayload(p);
        setAskResume(!!p.resumed);
      })
      .catch((e) => setStartError(errorMessage(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup, id, assignmentId]);

  const restart = () => {
    setRestarting(true);
    start(true)
      .then((p) => {
        setPayload(p);
        setAskResume(false);
      })
      .catch((e) => toast.error('Chưa làm lại được', errorMessage(e)))
      .finally(() => setRestarting(false));
  };

  // Tự lưu định kỳ các đáp án mới chọn
  useEffect(() => {
    const attemptId = payload?.attempt.id;
    if (!attemptId) return;
    // Lưu cả thời gian đã làm để lần sau vào lại làm tiếp đúng thời gian còn lại
    const flush = () => {
      if (askResume || submittedRef.current || !elapsedRef.current) return;
      const batch = [...pending.current.values()];
      pending.current.clear();
      saveAnswers(attemptId, batch, elapsedRef.current).catch(() => batch.forEach((b) => pending.current.set(b.questionId, b)));
    };
    const t = setInterval(flush, AUTOSAVE_MS);
    // Đóng tab / chuyển ứng dụng → lưu ngay
    const onHide = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [payload?.attempt.id, askResume]);

  const test = payload?.test;
  useDocumentTitle(`Phòng thi · ${test?.title ?? summary?.title ?? ''}`);

  if (testError || startError)
    return (
      <div className="fixed inset-0 z-50 bg-paper overflow-y-auto flex items-center justify-center p-6">
        <EmptyState
          title="Không mở được phòng thi"
          description={startError ?? errorMessage(testError)}
          action={<Button onClick={() => navigate(`/app/mock-tests/${id}`)}>Quay lại đề thi</Button>}
        />
      </div>
    );

  if (!test || !payload) return <div className="fixed inset-0 z-50 bg-paper flex items-center justify-center text-sm text-slate-500">Đang chuẩn bị đề thi…</div>;

  if (askResume) {
    const total = test.sections.reduce((a, s) => a + s.questions.length, 0);
    const answered = payload.attempt.answers.filter((a) => a.selectedKey).length;
    const spent = payload.attempt.timeSpentSec ?? 0;
    const limit = payload.attempt.timeLimitSec;
    const left = limit ? Math.max(0, limit - spent) : null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-paper p-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(16,24,40,0.35)]" role="dialog" aria-labelledby="resume-title">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <History className="h-5 w-5" />
          </span>
          <h1 id="resume-title" className="mt-4 text-lg font-semibold text-slate-900">
            Bạn đang làm dở bài này
          </h1>
          <p className="mt-1 text-sm text-slate-500">{test.title}</p>
          <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-center">
            {[
              ['Đã làm', `${answered}/${total} câu`],
              ['Thời gian đã làm', formatClock(spent)],
              ['Còn lại', left === null ? 'Không giới hạn' : formatClock(left)],
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-2 py-2.5">
                <dt className="text-[11px] text-slate-500">{k}</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          {left === 0 && <p className="mt-3 text-[13px] text-amber-700">Bài đã hết giờ — tiếp tục sẽ nộp các câu đã làm.</p>}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={restart} loading={restarting} leftIcon={<RotateCcw className="h-4 w-4" />}>
              Làm lại từ đầu
            </Button>
            <Button onClick={() => setAskResume(false)} disabled={restarting} leftIcon={<Play className="h-4 w-4" />}>
              Tiếp tục làm bài
            </Button>
          </div>
          <p className="mt-3 text-[12px] text-slate-400">Làm lại từ đầu sẽ bỏ các câu đã làm của lượt này.</p>
          <button type="button" onClick={() => navigate(`/app/mock-tests/${id}`)} className="mt-1 text-[12px] font-medium text-slate-500 hover:text-slate-800">
            Quay lại trang đề
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-paper overflow-y-auto">
      <ExamRunner
        key={payload.attempt.id}
        test={test}
        initialAnswers={Object.fromEntries(payload.attempt.answers.filter((a) => a.selectedKey).map((a) => [a.questionId, a.selectedKey as string]))}
        initialFlagged={payload.attempt.answers.filter((a) => a.isFlagged).map((a) => a.questionId)}
        // Làm tiếp: thời gian đã làm lưu lần cuối (thời gian thoát ra ngoài không bị tính)
        initialElapsedSec={payload.attempt.timeSpentSec ?? 0}
        onTick={(sec) => (elapsedRef.current = sec)}
        onSaveAnswer={(questionId, key) => pending.current.set(questionId, { ...pending.current.get(questionId), questionId, selectedKey: key })}
        onToggleFlag={(questionId, isFlagged, key) => pending.current.set(questionId, { ...pending.current.get(questionId), questionId, selectedKey: key ?? pending.current.get(questionId)?.selectedKey ?? null, isFlagged })}
        onSubmitExam={(r) => {
          pending.current.clear();
          submittedRef.current = true;
          const answers: SaveAnswerItem[] = Object.entries(r.answers).map(([questionId, selectedKey]) => ({ questionId, selectedKey, isFlagged: r.flagged.includes(questionId) || undefined }));
          submit.mutate(
            { id: payload.attempt.id, answers, timeSpentSec: r.timeSpentSec },
            {
              onSuccess: (res) => {
                if (res.xpGained) toast.success('Đã nộp bài', `+${res.xpGained} điểm nỗ lực.`);
                navigate(`/app/mock-tests/${id}/result?attempt=${payload.attempt.id}`);
              },
              onError: (e) => {
                submittedRef.current = false;
                toast.error('Nộp bài chưa thành công', errorMessage(e));
              },
            }
          );
        }}
        onExit={() => navigate(`/app/mock-tests/${id}`)}
      />
    </div>
  );
};
