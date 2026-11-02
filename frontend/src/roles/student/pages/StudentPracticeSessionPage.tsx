import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { Breadcrumb, EmptyState, Button } from '@/shared/components/ui';
import { PracticeEngine } from '@/engines';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { startAttempt, submitAttempt, usePartsInfo, type AttemptPayload } from '@/shared/api/learner';
import { getCorrectKey } from '@/shared/utils';

/** Số câu mỗi phiên luyện (Part có bài đọc/hội thoại lấy trọn nhóm câu) */
const SESSION_SIZE = 10;

export const StudentPracticeSessionPage: React.FC = () => {
  const { part = 'PART_5' } = useParams<{ part: string }>();
  const { data: partsInfo = [] } = usePartsInfo('TOEIC');
  const info = partsInfo.find((p) => p.id === part);
  const title = info ? `${info.name} · ${info.nameVi}` : part === 'VSTEP_READING' ? 'VSTEP Reading' : part === 'VSTEP_LISTENING' ? 'VSTEP Listening' : part.replace('_', ' ');
  useDocumentTitle(`Luyện ${title}`);

  const [session, setSession] = useState<AttemptPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wrongKeys = useRef(new Map<string, string>());
  const submitted = useRef(false);

  // Mỗi lần vào trang = một lượt luyện (exam_attempts mode PART_SESSION); câu sai được ghi vào Sổ tay lỗi sai khi kết thúc
  useEffect(() => {
    let alive = true;
    setSession(null);
    setError(null);
    wrongKeys.current.clear();
    submitted.current = false;
    startAttempt({ parts: [part], questionCount: SESSION_SIZE, examType: part.startsWith('VSTEP') ? 'VSTEP' : 'TOEIC' })
      .then((r) => alive && setSession(r))
      .catch((e) => alive && setError(errorMessage(e)));
    return () => {
      alive = false;
    };
  }, [part]);

  const questions = session ? session.test.sections.flatMap((s) => s.questions) : [];

  const finish = () => {
    if (!session || submitted.current) return;
    submitted.current = true;
    // Câu không sai = chọn đúng đáp án (PracticeEngine bắt buộc trả lời mới sang câu)
    const answers = questions.map((q) => ({ questionId: q.id, selectedKey: wrongKeys.current.get(q.id) ?? getCorrectKey(q) }));
    submitAttempt(session.attempt.id, answers)
      .then((r) => r.xpGained && toast.success('Đã lưu kết quả luyện tập', `+${r.xpGained} điểm nỗ lực.`))
      .catch((e) => toast.error('Chưa lưu được kết quả', errorMessage(e)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap animate-fade-down">
        <Breadcrumb items={[{ label: 'Luyện tập', to: '/app/practice' }, { label: title }]} />
        {info && (
          <span className="sticker tilt-2 !text-[10px]">
            {info.questions} câu trong đề thật · {info.skill}
          </span>
        )}
      </div>
      {error ? (
        <EmptyState title="Chưa mở được phiên luyện" description={error} action={<Button to="/app/practice">Quay lại</Button>} />
      ) : !session ? (
        <p className="text-sm text-slate-500">Đang chọn câu hỏi…</p>
      ) : (
        <PracticeEngine
          key={session.attempt.id}
          title={title}
          questions={questions}
          exitTo="/app/practice"
          onMistakeRecorded={(qid, key) => {
            wrongKeys.current.set(qid, key);
            toast.warning('Đã lưu vào Sổ tay lỗi sai', 'Câu này sẽ xuất hiện trong lịch ôn ngắt quãng.');
          }}
          onFinishPractice={finish}
        />
      )}
    </div>
  );
};
