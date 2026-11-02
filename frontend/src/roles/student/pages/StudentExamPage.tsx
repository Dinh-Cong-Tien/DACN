import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ExamRunner } from '@/engines';
import { useDocumentTitle } from '@/shared/hooks';
import { EmptyState, Button } from '@/shared/components/ui';
import { parseExamSetup } from '@/shared/utils';
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
  const started = useRef(false);
  const pending = useRef(new Map<string, SaveAnswerItem>());
  const submit = useSubmitAttempt();

  // Bắt đầu (hoặc làm tiếp) lượt làm bài — chỉ một lần
  useEffect(() => {
    if (!setup || started.current) return;
    started.current = true;
    startAttempt({ testId: id, mode: setup.mode, parts: setup.mode === 'PRACTICE' ? setup.parts : undefined, minutes: setup.mode === 'PRACTICE' ? setup.minutes : undefined, assignmentId })
      .then(setPayload)
      .catch((e) => setStartError(errorMessage(e)));
  }, [setup, id, assignmentId]);

  // Tự lưu định kỳ các đáp án mới chọn
  useEffect(() => {
    const attemptId = payload?.attempt.id;
    if (!attemptId) return;
    const flush = () => {
      if (!pending.current.size) return;
      const batch = [...pending.current.values()];
      pending.current.clear();
      saveAnswers(attemptId, batch).catch(() => batch.forEach((b) => pending.current.set(b.questionId, b)));
    };
    const t = setInterval(flush, AUTOSAVE_MS);
    return () => {
      clearInterval(t);
      flush();
    };
  }, [payload?.attempt.id]);

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

  return (
    <div className="fixed inset-0 z-50 bg-paper overflow-y-auto">
      <ExamRunner
        test={test}
        onSaveAnswer={(questionId, key) => pending.current.set(questionId, { questionId, selectedKey: key })}
        onSubmitExam={(r) => {
          pending.current.clear();
          const answers: SaveAnswerItem[] = Object.entries(r.answers).map(([questionId, selectedKey]) => ({ questionId, selectedKey, isFlagged: r.flagged.includes(questionId) || undefined }));
          submit.mutate(
            { id: payload.attempt.id, answers, timeSpentSec: r.timeSpentSec },
            {
              onSuccess: (res) => {
                if (res.xpGained) toast.success('Đã nộp bài', `+${res.xpGained} điểm nỗ lực.`);
                navigate(`/app/mock-tests/${id}/result?attempt=${payload.attempt.id}`);
              },
              onError: (e) => toast.error('Nộp bài chưa thành công', errorMessage(e)),
            }
          );
        }}
        onExit={() => navigate(`/app/mock-tests/${id}`)}
      />
    </div>
  );
};
