import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, Headphones, BookOpen, Timer } from 'lucide-react';
import { useCountdown, useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, ProgressBar, Modal } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { QuestionRenderer } from '@/engines';
import { useLocalStorage } from '@/shared/hooks';
import { startAttempt, submitAttempt, type AttemptPayload } from '@/shared/api/learner';
import { errorMessage } from '@/shared/api/client';
import { DEFAULT_ONBOARDING, type OnboardingState } from './GoalPage';
import { cn, formatClock } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

const TOTAL_SEC = 15 * 60;

export const PlacementTestPage: React.FC = () => {
  useDocumentTitle('Bài thi xếp lớp');
  const navigate = useNavigate();
  const [ob] = useLocalStorage<OnboardingState>('orbi-onboarding', DEFAULT_ONBOARDING);
  // Đề xếp lớp lấy ngẫu nhiên từ ngân hàng câu hỏi thật: Nghe (Part 2) + Ngữ pháp (Part 5) + Đọc (Part 7), hoặc Đọc/Nghe VSTEP
  const [session, setSession] = useState<AttemptPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    const parts = ob.examType === 'VSTEP' ? ['VSTEP_READING', 'VSTEP_LISTENING'] : ['PART_2', 'PART_5', 'PART_7'];
    startAttempt({ parts, questionCount: 4, examType: ob.examType })
      .then(setSession)
      .catch((e) => setLoadError(errorMessage(e)));
  }, [ob.examType]);
  const questions = useMemo(() => (session ? session.test.sections.flatMap((s) => s.questions) : []), [session]);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const finish = () => {
    if (done) return;
    if (!session) return;
    setDone(true);
    // Chấm trên máy chủ (luồng #2: exam_attempts) rồi chuyển sang trang kết quả
    submitAttempt(session.attempt.id, Object.entries(answers).map(([questionId, selectedKey]) => ({ questionId, selectedKey })))
      .then((r) => {
        const res = r.result;
        localStorage.setItem('orbi-placement', JSON.stringify({ correct: res?.summary.correct ?? 0, total: res?.summary.total ?? questions.length, attemptId: r.attempt.id, partResults: res?.partResults ?? [] }));
        navigate('/onboarding/placement-result');
      })
      .catch((e) => {
        setDone(false);
        toast.error('Chưa nộp được bài', errorMessage(e));
      });
  };

  const remaining = useCountdown(TOTAL_SEC, () => {
    toast.warning('Hết giờ', 'Tự động nộp bài xếp lớp.');
    finish();
  }, started && !done);

  const q = questions[index];
  const answered = Object.keys(answers).length;

  if (!started) {
    return (
      <Card hard padding="none" className="animate-scale-in overflow-hidden max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px]">
          <div className="p-7 md:p-10 space-y-6">
            <span className="sticker tilt-1">Bước 5 / 6</span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Bài thi xếp lớp <span className="mark">15 phút</span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{questions.length} câu trộn Nghe – Đọc – Ngữ pháp, chọn ngẫu nhiên từ ngân hàng đề thi. Kết quả dùng để ước lượng năng lực ban đầu và sinh lộ trình 3 chặng phù hợp.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: `${questions.length}`, l: 'câu hỏi', Icon: BookOpen, cls: 'bg-indigo-100' },
                { v: '15', l: 'phút', Icon: Timer, cls: 'bg-amber-100' },
                { v: '1 lần', l: 'phát audio', Icon: Headphones, cls: 'bg-violet-100' },
              ].map((s, i) => (
                <div key={s.l} className={cn('rounded-2xl border-2 border-slate-900 p-3 text-center animate-pop', s.cls)} style={{ animationDelay: `${i * 80}ms` }}>
                  <s.Icon className="w-4 h-4 mx-auto text-slate-700 mb-1" />
                  <p className="font-display text-2xl font-extrabold text-slate-900 leading-none">{s.v}</p>
                  <p className="text-[10px] font-extrabold uppercase text-slate-600 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {loadError && <p className="text-sm font-semibold text-rose-600">{loadError}</p>}
              <Button size="xl" variant="gradient" disabled={!questions.length} onClick={() => setStarted(true)}>
                Bắt đầu làm bài
              </Button>
              <p className="text-xs text-slate-500">Không chắc câu nào? Cứ chọn đáp án bạn nghĩ là đúng — hệ thống cần thấy điểm mạnh/yếu thật.</p>
            </div>
          </div>
          <div className="relative bg-indigo-600 min-h-[260px]">
            <Img src={PHOTOS.writing} alt="Làm bài xếp lớp" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-600" />
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl border-2 border-slate-900 p-3 shadow-hard-sm tilt-3">
              <p className="text-[11px] font-extrabold uppercase text-slate-500">Mẹo nhỏ</p>
              <p className="text-xs font-bold text-slate-900">Đeo tai nghe, tắt thông báo, ngồi 15 phút không gián đoạn.</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <Card hard padding="sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge tone="indigo" solid>
              Câu {index + 1}/{questions.length}
            </Badge>
            <span className="text-xs text-slate-600 font-bold">{answered} đã trả lời</span>
          </div>
          <div className={cn('flex items-center gap-2 px-3 h-9 rounded-xl border-2 border-slate-900 font-mono font-black', remaining < 120 ? 'bg-violet-500 text-white animate-pulse' : 'bg-slate-900 text-amber-300')}>
            <Clock className="w-4 h-4" />
            {formatClock(Math.max(0, remaining))}
          </div>
        </div>
        <ProgressBar value={(answered / questions.length) * 100} size="sm" className="mt-3" />
      </Card>

      {q && (
        <div key={q.id} className="animate-slide-in-right">
          <QuestionRenderer question={q} index={index} selectedAnswer={answers[q.id]} onSelectAnswer={(k) => setAnswers((a) => ({ ...a, [q.id]: k }))} examMode allowFlagReport={false} />
        </div>
      )}

      <div className="flex items-center justify-between bg-white p-3 md:p-4 rounded-2xl border-2 border-slate-900 shadow-hard">
        <Button variant="outline" size="sm" disabled={index === 0} leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setIndex((i) => i - 1)}>
          Câu trước
        </Button>
        {index === questions.length - 1 ? (
          <Button size="sm" variant="success" rightIcon={<Send className="w-4 h-4" />} onClick={() => setConfirm(true)}>
            Nộp bài
          </Button>
        ) : (
          <Button size="sm" rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setIndex((i) => i + 1)}>
            Câu tiếp
          </Button>
        )}
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Nộp bài xếp lớp?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Làm tiếp
            </Button>
            <Button variant="success" onClick={finish}>
              Nộp bài
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn đã trả lời <b>{answered}</b>/{questions.length} câu. {answered < questions.length && 'Câu bỏ trống sẽ tính là sai.'}
        </p>
      </Modal>
    </div>
  );
};
