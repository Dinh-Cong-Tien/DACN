import React, { useEffect, useMemo, useState } from 'react';
import { PenTool, Clock, Play, Send, Save, FileText, CheckCircle2, Pause } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { WRITING_CRITERIA } from '@/shared/constants/student';
import { errorMessage } from '@/shared/api/client';
import { startAttempt, submitAttempt, usePracticeTasks, useSubmitAssignment, type ApiQuestion } from '@/shared/api/learner';

type WritingTask = { id: string; task: string; minutes: number; minWords: number; prompt: string };
const toTask = (q: ApiQuestion): WritingTask => {
  const c = (q.taskConfig ?? {}) as { title?: string; minutes?: number; minWords?: number; keywords?: string[] };
  const prompt = c.keywords?.length ? `${q.stem}\nTừ khoá bắt buộc: ${c.keywords.join(', ')}` : q.stem;
  return { id: q.id, task: c.title ?? 'Đề Viết', minutes: c.minutes ?? 20, minWords: c.minWords ?? 120, prompt };
};
const EMPTY_TASK: WritingTask = { id: '', task: 'Đề Viết', minutes: 20, minWords: 120, prompt: '' };
import { cn, formatClock } from '@/shared/utils';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { Badge, Button, Card, CardHeader, Modal, PageHeader, ProgressBar, Switch, Tabs, Textarea } from '@/shared/components/ui';

/** Cùng bộ tiêu chí giáo viên dùng ở bàn chấm */
const CRITERIA = WRITING_CRITERIA;

export const StudentWritingPage: React.FC = () => {
  useDocumentTitle('Luyện Viết VSTEP');
  // Mở từ bài được giao: ?task=<id> chọn sẵn đề giáo viên giao
  const [params] = useSearchParams();
  const wanted = params.get('task');
  const assignmentId = params.get('assignment');
  const { data: vstep = [] } = usePracticeTasks('writing', { examType: 'VSTEP' });
  // Đề được giao không thuộc 2 đề VSTEP mặc định (vd. đề TOEIC) → tải thêm để tìm
  const { data: allWriting = [] } = usePracticeTasks('writing', { limit: 300 });
  const VSTEP_WRITING_TASKS = useMemo(() => {
    const list = vstep.map(toTask);
    const extra = wanted && !list.some((t) => t.id === wanted) ? allWriting.find((q) => q.id === wanted) : undefined;
    return extra ? [toTask(extra), ...list] : list;
  }, [vstep, allWriting, wanted]);
  const [taskId, setTaskId] = useState<string>(wanted ?? '');
  const task = VSTEP_WRITING_TASKS.find((t) => t.id === taskId) ?? VSTEP_WRITING_TASKS[0] ?? EMPTY_TASK;
  const submitAssignment = useSubmitAssignment();
  const [sending, setSending] = useState(false);
  const [drafts, setDrafts] = useLocalStorage<Record<string, string>>('orbi-writing-draft', {});
  const text = drafts[task.id] ?? '';
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(task.minutes * 60);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<string[]>([]);

  useEffect(() => {
    setRunning(false);
    setRemaining(task.minutes * 60);
  }, [task.id, task.minutes]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      toast.warning('Hết giờ', 'Hãy nộp bài hoặc tiếp tục chỉnh sửa (không tính giờ).');
      return;
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const pct = Math.min(100, (wordCount / task.minWords) * 100);
  const elapsed = task.minutes * 60 - remaining;

  const setText = (v: string) => setDrafts((d) => ({ ...d, [task.id]: v }));

  const submit = async () => {
    setSending(true);
    try {
      if (assignmentId) {
        // Bài được giao: nộp vào bài nộp của lớp
        await submitAssignment.mutateAsync({ id: assignmentId, content: text });
      } else {
        // Tự luyện: lưu thành lượt làm bài, giáo viên lớp bạn sẽ thấy trong hàng chờ chấm
        const r = await startAttempt({ questionIds: [task.id] });
        await submitAttempt(r.attempt.id, [{ questionId: task.id, textAnswer: text }], task.minutes * 60 - remaining);
      }
      setSummaryOpen(false);
      setSubmitted((s) => [...s, task.id]);
      setRunning(false);
      toast.success('Đã nộp bài', 'Giáo viên sẽ chấm theo rubric 4 tiêu chí.');
    } catch (e) {
      toast.error('Chưa nộp được bài', errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const outline =
    task.minWords < 200
      ? ['Dear + tên người nhận, nêu lý do viết', 'Đoạn 1: mô tả vấn đề đã gặp', 'Đoạn 2: ảnh hưởng tới chuyến đi', 'Đoạn 3: yêu cầu cụ thể', 'Kết thư lịch sự (Yours sincerely)']
      : ['Mở bài: paraphrase + nêu quan điểm', 'Thân 1: luận điểm + giải thích + ví dụ', 'Thân 2: quan điểm đối lập/bổ sung', 'Kết bài: khẳng định lại ý kiến', 'Dành 5 phút kiểm tra lỗi'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Luyện <span className="mark-coral mark">Viết</span> VSTEP
          </>
        }
        icon={<PenTool />}
        description="Task 1 (thư/email 120 từ) và Task 2 (bài luận 250 từ) theo đúng format Bộ GD&ĐT."
      />
      <Tabs
        variant="pill"
        value={taskId}
        onChange={setTaskId}
        items={VSTEP_WRITING_TASKS.map((t) => ({ key: t.id, label: t.task, icon: submitted.includes(t.id) ? <CheckCircle2 className="text-emerald-500" /> : <FileText /> }))}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Card hard tone="yellow" className="animate-fade-up">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="sticker tilt-1">{task.task}</span>
              <Badge tone="slate" solid icon={<Clock className="w-3 h-3" />}>
                {task.minutes} phút
              </Badge>
              <Badge tone="slate" solid>
                ≥ {task.minWords} từ
              </Badge>
            </div>
            <p className="font-display text-lg text-slate-900 leading-relaxed font-semibold whitespace-pre-line">{task.prompt}</p>
          </Card>

          <div className="rounded-2xl border-2 border-slate-900 shadow-hard bg-paper overflow-hidden animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center justify-between px-4 h-10 border-b-2 border-slate-900 bg-white">
              <span className="text-[12px] font-bold text-slate-700">Bài làm</span>
              <span className={cn('text-[12px] font-bold tabular-nums', wordCount >= task.minWords ? 'text-emerald-700' : 'text-slate-500')}>
                {wordCount} / {task.minWords} từ
              </span>
            </div>
            <div className="p-3 md:p-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={running ? 'Bắt đầu viết tại đây...' : 'Nhấn "Bắt đầu tính giờ" để làm bài như thi thật, hoặc viết tự do.'}
                className="min-h-[380px] text-[15px] leading-7 font-sans !bg-transparent !border-0 !shadow-none focus:!shadow-none"
                onFocus={() => !running && remaining === task.minutes * 60 && setRunning(true)}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t-2 border-slate-900 bg-white">
              <div className="flex-1 max-w-xs">
                <ProgressBar value={pct} size="sm" tone={pct >= 100 ? 'emerald' : 'indigo'} label={`${wordCount} / ${task.minWords} từ`} />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" leftIcon={<Save className="w-4 h-4" />} onClick={() => toast.info('Đã lưu nháp', 'Bản nháp được lưu tự động trên thiết bị này.')}>
                  Lưu nháp
                </Button>
                <Button size="sm" variant="gradient" leftIcon={<Send className="w-4 h-4" />} disabled={wordCount === 0} onClick={() => setSummaryOpen(true)}>
                  Nộp bài
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <Card hard tone={remaining < 300 ? 'coral' : 'ink'} className="text-center animate-slide-in-right">
            <p className="text-[11px] font-extrabold uppercase tracking-wider opacity-70">Thời gian còn lại</p>
            <p className={cn('font-display text-5xl font-extrabold mt-1 tabular-nums', remaining < 300 && running && 'animate-pulse')}>{formatClock(Math.max(0, remaining))}</p>
            <p className="text-[11px] opacity-70 mt-1">{running ? 'Đang tính giờ' : 'Tạm dừng'}</p>
            <Button
              fullWidth
              className="mt-4"
              variant={running ? 'white' : 'gradient'}
              leftIcon={running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              onClick={() => {
                if (!running && remaining <= 0) setRemaining(task.minutes * 60);
                setRunning((r) => !r);
              }}
            >
              {running ? 'Tạm dừng' : remaining <= 0 ? 'Làm lại' : 'Bắt đầu tính giờ'}
            </Button>
          </Card>
          <Card hard padding="sm" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Gợi ý bố cục" className="mb-2" />
            <ol className="space-y-2 text-xs text-slate-700">
              {outline.map((s, i) => (
                <li key={s} className="flex gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-300 border border-slate-900 text-slate-900 font-extrabold text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>

      <Modal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Tự đánh giá trước khi nộp"
        description={`${wordCount} từ · ${formatClock(elapsed)} · ${task.task}`}
        icon={<PenTool />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSummaryOpen(false)}>
              Viết tiếp
            </Button>
            <Button variant="success" leftIcon={<Send className="w-4 h-4" />} onClick={() => void submit()} loading={sending}>
              Nộp cho giáo viên
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {wordCount < task.minWords && <p className="p-3 rounded-xl bg-amber-100 border-2 border-slate-900 text-slate-900 text-xs font-semibold">Bài viết chưa đủ {task.minWords} từ tối thiểu. Bạn vẫn có thể nộp nhưng sẽ bị trừ điểm Task Fulfilment.</p>}
          {CRITERIA.map((c) => (
            <Switch key={c.key} checked={!!checks[c.key]} onChange={(v) => setChecks((s) => ({ ...s, [c.key]: v }))} label={c.label} description={c.desc} />
          ))}
        </div>
      </Modal>
    </div>
  );
};
