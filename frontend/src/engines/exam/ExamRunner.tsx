import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IMockTest, IQuestion } from '@toeic-vstep/shared';
import { Clock, Flag, Send, ChevronLeft, ChevronRight, AlertTriangle, Maximize2, Minimize2, Grid3X3, X, ArrowLeft, ArrowRight, Volume2, Play } from 'lucide-react';
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
  /** Đánh dấu/bỏ đánh dấu câu (để tự lưu cùng đáp án) */
  onToggleFlag?: (questionId: string, flagged: boolean, key?: string) => void;
  /** Làm tiếp lượt đang dở: đáp án, cờ và thời gian đã trôi qua (giây) */
  initialAnswers?: Record<string, string>;
  initialFlagged?: string[];
  initialElapsedSec?: number;
  /** Báo số giây đã làm mỗi giây (để tự lưu — vào lại làm tiếp đúng thời gian còn lại) */
  onTick?: (elapsedSec: number) => void;
}

/** Engine thi thử: focus mode, đếm ngược, auto-submit, bảng câu hỏi, cờ đánh dấu */
export const ExamRunner: React.FC<ExamRunnerProps> = ({ test, onSubmitExam, onExit, onSaveAnswer, onToggleFlag, initialAnswers, initialFlagged, initialElapsedSec = 0, onTick }) => {
  const sections = test.sections;
  const allQuestions: IQuestion[] = useMemo(() => sections.flatMap((s) => s.questions), [sections]);
  // durationMinutes <= 0: luyện tập không giới hạn thời gian — đồng hồ đếm lên, không tự nộp
  const timed = test.durationMinutes > 0;
  const totalSec = test.durationMinutes * 60;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => ({ ...(initialAnswers ?? {}) }));
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set(initialFlagged ?? []));
  const [remaining, setRemaining] = useState(() => totalSec - initialElapsedSec);
  const [elapsed, setElapsed] = useState(initialElapsedSec);
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
    onSubmitExam({ answers, flagged: Array.from(flagged), timeSpentSec: timed ? totalSec - Math.max(0, remaining) : elapsed, correctCount: correct, total: allQuestions.length, bySection });
  }, [answers, flagged, remaining, elapsed, timed, totalSec, allQuestions.length, sections, onSubmitExam, submitted]);

  // Đồng hồ đếm ngược + tự động nộp
  useEffect(() => {
    if (submitted) return;
    if (timed && remaining <= 0) {
      toast.warning('Hết giờ!', 'Hệ thống tự động nộp bài của bạn.');
      finalize();
      return;
    }
    const id = setInterval(() => (timed ? setRemaining((r) => r - 1) : setElapsed((e) => e + 1)), 1000);
    return () => clearInterval(id);
  }, [remaining, submitted, finalize, timed]);

  useEffect(() => {
    onTick?.(timed ? totalSec - Math.max(0, remaining) : elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, elapsed]);

  // Cảnh báo khi còn 5 phút
  useEffect(() => {
    if (timed && remaining === 300) toast.warning('Còn 5 phút', 'Hãy kiểm tra lại các câu đã đánh dấu.');
  }, [remaining, timed]);

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

  const selectFor = (q: IQuestion, key: string) => {
    setAnswers((a) => ({ ...a, [q.id]: key }));
    onSaveAnswer?.(q.id, key);
  };
  const select = (key: string) => current && selectFor(current, key);

  const toggleFlag = () => {
    if (!current) return;
    const on = !flagged.has(current.id);
    setFlagged((prev) => {
      const next = new Set(prev);
      if (on) next.add(current.id);
      else next.delete(current.id);
      return next;
    });
    onToggleFlag?.(current.id, on, answers[current.id]);
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
  const danger = timed && remaining < 300;

  // Câu có đề kèm theo (ảnh/audio/đoạn văn) → chia đôi; các câu dùng chung đề hiện cùng nhau bên phải
  const passage = current?.passage ?? null;
  const group = useMemo(() => (passage?.id ? allQuestions.filter((q) => q.passage?.id === passage.id || q.passageId === passage.id) : current ? [current] : []), [passage, allQuestions, current]);

  // Chuyển câu trong nhóm → cuộn tới câu đó ở cột phải
  useEffect(() => {
    if (current && group.length > 1) document.getElementById(`exam-q-${current.id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [current, group.length]);

  // Audio phát ẩn như đề thi thật: vào câu có audio → tự phát 1 lần (không hiện thanh phát, không tua/nghe lại);
  // phát xong chờ thời gian trả lời rồi tự sang nhóm câu nghe tiếp theo.
  const [audio, setAudio] = useState<{ state: 'idle' | 'playing' | 'blocked' | 'waiting' | 'done'; left?: number }>({ state: 'idle' });
  const playedRef = useRef<Set<string>>(new Set());
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const startAudio = useRef<() => void>(() => undefined);
  const groupRef = useRef(group);
  groupRef.current = group;
  const passageId = passage?.id;
  useEffect(() => {
    const p = passage;
    if (submitted || !p?.id || (!p.audioUrl && !p.speakText)) {
      setAudio({ state: 'idle' });
      return;
    }
    if (playedRef.current.has(p.id)) {
      setAudio({ state: 'done' });
      return;
    }
    let alive = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    // Chỉ tính "đã phát" khi audio thực sự chạy (tránh StrictMode mount 2 lần đánh dấu nhầm)
    let startedAt = 0;
    const markStart = () => (startedAt = Date.now());
    const onEnd = () => {
      if (!alive) return;
      playedRef.current.add(p.id!);
      // Thời gian trả lời sau khi nghe: 5 giây/câu lẻ, 8 giây/câu với nhóm câu (giống đề TOEIC)
      const g = groupRef.current;
      let left = g.length > 1 ? 8 * g.length : 5;
      const lastIdx = allQuestions.indexOf(g[g.length - 1]);
      const next = allQuestions[lastIdx + 1];
      if (!next?.passage?.audioUrl && !next?.passage?.speakText) return setAudio({ state: 'done' });
      setAudio({ state: 'waiting', left });
      timer = setInterval(() => {
        left -= 1;
        if (left <= 0) {
          clearInterval(timer);
          setCurrentIndex(lastIdx + 1);
        } else setAudio({ state: 'waiting', left });
      }, 1000);
    };
    const play = () => {
      setAudio({ state: 'playing' });
      if (p.audioUrl) {
        const a = new Audio(p.audioUrl);
        audioEl.current = a;
        a.onended = onEnd;
        a.onplaying = markStart;
        a.play().catch(() => {
          // Trình duyệt chặn tự phát (vd. tải lại trang) → cần một lần bấm để bắt đầu
          if (alive) setAudio({ state: 'blocked' });
        });
      } else if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(p.speakText!);
        u.lang = 'en-US';
        u.onend = onEnd;
        u.onstart = markStart;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    };
    startAudio.current = play;
    play();
    return () => {
      alive = false;
      if (startedAt && Date.now() - startedAt > 500) playedRef.current.add(p.id!);
      if (timer) clearInterval(timer);
      audioEl.current?.pause();
      audioEl.current = null;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passageId, submitted]);

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
                      isA ? 'bg-indigo-600 text-white border-slate-900 animate-pop' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-900',
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
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top bar */}
      <header className="bg-cream/90 backdrop-blur-xl border-b-2 border-slate-900 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="sm" to="#" />
            <div className="hidden md:block min-w-0">
              <h1 className="font-bold text-slate-900 text-sm truncate">{test.title}</h1>
              <p className="text-[11px] text-slate-500">
                {test.examType} · {allQuestions.length} câu · {timed ? `${test.durationMinutes} phút` : 'không giới hạn thời gian'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {audio.state === 'blocked' ? (
              <button type="button" onClick={() => startAudio.current()} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-400">
                <Play className="h-4 w-4" /> <span className="max-sm:hidden">Bấm để bắt đầu nghe</span>
              </button>
            ) : audio.state === 'playing' || audio.state === 'waiting' ? (
              <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium tabular-nums text-slate-600" role="status">
                <Volume2 className={cn('h-4 w-4', audio.state === 'playing' && 'text-emerald-600')} />
                <span className="max-sm:hidden">{audio.state === 'playing' ? 'Đang phát audio' : `Câu tiếp sau ${audio.left}s`}</span>
              </span>
            ) : null}
            <div className={cn('flex items-center gap-2 px-3 md:px-4 h-10 rounded-xl font-mono font-black text-base md:text-lg transition-colors', danger ? 'bg-rose-100 text-rose-700 border-2 border-rose-500 animate-pulse' : 'bg-slate-900 text-amber-300 border-2 border-slate-900')}>
              <Clock className="w-4 h-4" />
              <span>{formatClock(timed ? Math.max(0, remaining) : elapsed)}</span>
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
          <div className="h-full bg-violet-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
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

          {current && passage ? (
            // Bố cục chia đôi: trái = ảnh/audio/đoạn văn (cuộn riêng), phải = các câu hỏi dùng chung đề đó
            <div key={passage.id} className="grid grid-cols-1 gap-4 lg:grid-cols-2 animate-fade-in">
              <div className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-13rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
                <PassageBlock passage={passage} examMode full hideAudio className="bg-white" />
              </div>
              <div className="min-w-0 space-y-3">
                {group.map((q) => {
                  const idx = allQuestions.indexOf(q);
                  return (
                    <div key={q.id} id={`exam-q-${q.id}`} className="scroll-mt-28" onClickCapture={() => idx !== currentIndex && setCurrentIndex(idx)}>
                      <QuestionRenderer
                        question={q}
                        index={idx}
                        selectedAnswer={answers[q.id]}
                        onSelectAnswer={(k) => selectFor(q, k)}
                        examMode
                        hidePassage
                        hideMeta
                        variant="plain"
                        allowFlagReport={false}
                        className={cn('transition-colors', group.length > 1 && q.id === current.id && 'border-slate-400 ring-1 ring-slate-300')}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            current && (
              <div key={current.id} className="animate-fade-in">
                <QuestionRenderer question={current} index={currentIndex} selectedAnswer={answers[current.id]} onSelectAnswer={select} examMode hideMeta variant="plain" allowFlagReport={false} />
              </div>
            )
          )}

          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-[0_8px_24px_-12px_rgba(16,24,40,0.25)] sticky bottom-4 z-10">
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
            Phím tắt: <ArrowLeft className="inline h-3 w-3 align-[-1px]" aria-label="mũi tên trái" /> <ArrowRight className="inline h-3 w-3 align-[-1px]" aria-label="mũi tên phải" /> chuyển câu · <b>A B C D</b> chọn đáp án · <b>F</b> đánh dấu
          </p>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Bảng câu hỏi</span>
              <Badge tone="indigo">
                {answered}/{allQuestions.length}
              </Badge>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">{palette}</div>
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
          <p className="text-xs">{timed ? `Thời gian còn lại: ${formatClock(Math.max(0, remaining))}` : `Đã làm: ${formatClock(elapsed)}`}</p>
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
              Thoát
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Các câu đã làm và thời gian được lưu lại. Lần sau mở đề này, bạn chọn làm tiếp hoặc làm lại từ đầu.</p>
      </Modal>
    </div>
  );
};
