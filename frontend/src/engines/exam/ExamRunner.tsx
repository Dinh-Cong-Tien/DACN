import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IMockTest, IQuestion } from '@toeic-vstep/shared';
import { Clock, Flag, Send, ChevronLeft, ChevronRight, AlertTriangle, Maximize2, Minimize2, Grid3X3, X } from 'lucide-react';
import { QuestionRenderer, PassageBlock } from './QuestionRenderer';
import { cn, formatClock } from '@/shared/utils';
import { Button, Modal, Logo, Badge } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

export interface ExamResultPayload {
  answers: Record<string, string>;
  flagged: string[];
  timeSpentSec: number;
  correctCount: number;
  total: number;
  bySection: { name: string; correct: number; total: number }[];
}

interface ExamRunnerProps {
  test: IMockTest;
  onSubmitExam: (result: ExamResultPayload) => void;
  onExit?: () => void;
  onSaveAnswer?: (questionId: string, key: string) => void;
}

/** Engine thi thử: focus mode, đếm ngược, auto-submit, bảng câu hỏi, cờ đánh dấu */
export const ExamRunner: React.FC<ExamRunnerProps> = ({ test, onSubmitExam, onExit, onSaveAnswer }) => {
  const sections = test.sections;
  const allQuestions: IQuestion[] = useMemo(() => sections.flatMap((s) => s.questions), [sections]);
  const totalSec = test.durationMinutes * 60;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(totalSec);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const current = allQuestions[currentIndex];
  const currentSection = sections.find((s) => s.questions.some((q) => q.id === current?.id));

  const finalize = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    let correct = 0;
    const bySection = sections.map((s) => {
      let c = 0;
      s.questions.forEach((q) => {
        const key = typeof q.correctAnswer === 'string' ? q.correctAnswer : Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer.key;
        if (answers[q.id] === key) c++;
      });
      correct += c;
      return { name: s.name, correct: c, total: s.questions.length };
    });
    onSubmitExam({ answers, flagged: Array.from(flagged), timeSpentSec: totalSec - Math.max(0, remaining), correctCount: correct, total: allQuestions.length, bySection });
  }, [answers, flagged, remaining, totalSec, allQuestions.length, sections, onSubmitExam, submitted]);

  // Đồng hồ đếm ngược + tự động nộp
  useEffect(() => {
    if (submitted) return;
    if (remaining <= 0) {
      toast.warning('Hết giờ!', 'Hệ thống tự động nộp bài của bạn.');
      finalize();
      return;
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, submitted, finalize]);

  // Cảnh báo khi còn 5 phút
  useEffect(() => {
    if (remaining === 300) toast.warning('Còn 5 phút', 'Hãy kiểm tra lại các câu đã đánh dấu.');
  }, [remaining]);

  // Phím tắt: ← → chuyển câu, A/B/C/D chọn đáp án, F đánh dấu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmOpen || exitOpen) return;
      const k = e.key.toUpperCase();
      if (e.key === 'ArrowRight') setCurrentIndex((i) => Math.min(allQuestions.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setCurrentIndex((i) => Math.max(0, i - 1));
      if (k === 'F') toggleFlag();
      if (['A', 'B', 'C', 'D'].includes(k) && current?.options.some((o) => o.key === k)) select(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, confirmOpen, exitOpen, allQuestions.length]);

  const select = (key: string) => {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: key }));
    onSaveAnswer?.(current.id, key);
  };

  const toggleFlag = () => {
    if (!current) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      /* ignore */
    }
  };

  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / allQuestions.length) * 100);
  const danger = remaining < 300;

  // Nhóm câu theo passage: hiển thị passage 1 lần cho cả nhóm
  const groupedPassage = current?.passage && allQuestions.filter((q) => q.passageId === current.passage?.id || q.passage?.id === current.passage?.id).length > 1 ? current.passage : null;

  const palette = (
    <div className="space-y-4">
      {sections.map((s) => {
        const startIdx = allQuestions.findIndex((q) => q.id === s.questions[0]?.id);
        return (
          <div key={s.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{s.name}</span>
              <span className="text-[10px] text-slate-400">{s.questions.filter((q) => answers[q.id]).length}/{s.questions.length}</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {s.questions.map((q, i) => {
                const idx = startIdx + i;
                const isA = !!answers[q.id];
                const isF = flagged.has(q.id);
                const isC = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setPaletteOpen(false);
                    }}
                    className={cn(
                      'h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all duration-200 relative',
                      isA ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400',
                      isF && 'ring-2 ring-amber-400 ring-offset-1',
                      isC && 'scale-110 shadow-md z-10'
                    )}
                  >
                    {idx + 1}
                    {isF && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-600" /> Đã làm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded ring-2 ring-amber-400" /> Đánh dấu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-slate-300 bg-white" /> Chưa làm
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="sm" to="#" />
            <div className="hidden md:block min-w-0">
              <h1 className="font-bold text-slate-900 text-sm truncate">{test.title}</h1>
              <p className="text-[11px] text-slate-500">
                {test.examType} · {allQuestions.length} câu · {test.durationMinutes} phút
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className={cn('flex items-center gap-2 px-3 md:px-4 h-10 rounded-xl font-mono font-black text-base md:text-lg transition-colors', danger ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse' : 'bg-slate-900 text-white')}>
              <Clock className="w-4 h-4" />
              <span>{formatClock(Math.max(0, remaining))}</span>
            </div>
            <button onClick={() => setPaletteOpen(true)} className="lg:hidden h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5">
              <Grid3X3 className="w-4 h-4" />
              {answered}/{allQuestions.length}
            </button>
            <button onClick={toggleFullscreen} className="hidden md:flex h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 items-center justify-center" title="Toàn màn hình">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <Button size="sm" variant="gradient" leftIcon={<Send className="w-4 h-4" />} onClick={() => setConfirmOpen(true)}>
              Nộp bài
            </Button>
            {onExit && (
              <button onClick={() => setExitOpen(true)} className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center" title="Thoát">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4 min-w-0">
          {currentSection && (
            <div className="flex items-center justify-between animate-fade-down">
              <Badge tone="violet" solid>
                {currentSection.name}
              </Badge>
              <span className="text-xs text-slate-500 font-semibold">
                Câu {currentIndex + 1} / {allQuestions.length}
              </span>
            </div>
          )}

          {groupedPassage && <PassageBlock passage={groupedPassage} examMode />}

          {current && (
            <div key={current.id} className="animate-slide-in-right">
              <QuestionRenderer question={current} index={currentIndex} selectedAnswer={answers[current.id]} onSelectAnswer={select} examMode hidePassage={!!groupedPassage} allowFlagReport={false} />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-soft sticky bottom-4">
            <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              <span className="hidden sm:inline">Câu trước</span>
            </Button>
            <button
              onClick={toggleFlag}
              className={cn(
                'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold border transition-all',
                current && flagged.has(current.id) ? 'bg-amber-100 text-amber-800 border-amber-300 animate-wiggle' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700'
              )}
            >
              <Flag className={cn('w-4 h-4', current && flagged.has(current.id) && 'fill-amber-500')} />
              <span className="hidden sm:inline">{current && flagged.has(current.id) ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}</span>
            </button>
            {currentIndex === allQuestions.length - 1 ? (
              <Button size="sm" variant="success" onClick={() => setConfirmOpen(true)} rightIcon={<Send className="w-4 h-4" />}>
                Nộp bài
              </Button>
            ) : (
              <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                <span className="hidden sm:inline">Câu tiếp</span>
              </Button>
            )}
          </div>
          <p className="text-center text-[11px] text-slate-400">
            Phím tắt: <b>←</b> <b>→</b> chuyển câu · <b>A B C D</b> chọn đáp án · <b>F</b> đánh dấu
          </p>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 shadow-soft p-5 space-y-4 animate-slide-in-right">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Bảng câu hỏi</span>
              <Badge tone="indigo">
                {answered}/{allQuestions.length}
              </Badge>
            </div>
            <div className="max-h-[55vh] overflow-y-auto pr-1">{palette}</div>
          </div>
        </aside>
      </div>

      <Modal open={paletteOpen} onClose={() => setPaletteOpen(false)} title="Bảng câu hỏi" size="md">
        {palette}
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Xác nhận nộp bài?"
        icon={<AlertTriangle className="text-amber-600" />}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Tiếp tục làm bài
            </Button>
            <Button variant="success" onClick={finalize}>
              Nộp bài ngay
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Bạn đã trả lời <b className="text-slate-900">{answered}</b> / {allQuestions.length} câu.
          </p>
          {allQuestions.length - answered > 0 && (
            <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">Còn {allQuestions.length - answered} câu chưa trả lời. Câu bỏ trống sẽ tính là sai.</p>
          )}
          {flagged.size > 0 && <p className="text-xs text-amber-700">Bạn còn {flagged.size} câu đang đánh dấu xem lại.</p>}
          <p className="text-xs">Thời gian còn lại: {formatClock(Math.max(0, remaining))}</p>
        </div>
      </Modal>

      <Modal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        title="Thoát bài thi?"
        size="sm"
        icon={<AlertTriangle className="text-rose-600" />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setExitOpen(false)}>
              Ở lại
            </Button>
            <Button variant="danger" onClick={onExit}>
              Thoát, không lưu
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Toàn bộ câu trả lời hiện tại sẽ không được lưu. Bạn chắc chứ?</p>
      </Modal>
    </div>
  );
};
