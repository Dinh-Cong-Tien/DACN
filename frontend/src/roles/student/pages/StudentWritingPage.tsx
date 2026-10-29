import React, { useEffect, useMemo, useState } from 'react';
import { PenTool, Clock, Play, Send, Save, FileText, CheckCircle2 } from 'lucide-react';
import { VSTEP_WRITING_TASKS } from '@/shared/mocks';
import { cn, formatClock } from '@/shared/utils';
import { useDocumentTitle, useLocalStorage } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { Badge, Button, Card, CardHeader, Modal, PageHeader, ProgressBar, Switch, Tabs, Textarea } from '@/shared/components/ui';

const CRITERIA = [
  { key: 'task', label: 'Task Fulfilment', desc: 'Trả lời đủ các ý của đề, đúng số từ' },
  { key: 'coherence', label: 'Coherence & Cohesion', desc: 'Bố cục rõ, dùng từ nối hợp lý' },
  { key: 'lexical', label: 'Lexical Resource', desc: 'Từ vựng đa dạng, đúng ngữ cảnh' },
  { key: 'grammar', label: 'Grammatical Range', desc: 'Đa dạng cấu trúc, ít lỗi' },
];

export const StudentWritingPage: React.FC = () => {
  useDocumentTitle('Luyện Viết VSTEP');
  const [taskId, setTaskId] = useState(VSTEP_WRITING_TASKS[0].id);
  const task = VSTEP_WRITING_TASKS.find((t) => t.id === taskId) ?? VSTEP_WRITING_TASKS[0];
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

  const submit = () => {
    setSummaryOpen(false);
    setSubmitted((s) => [...s, task.id]);
    setRunning(false);
    toast.success('Đã nộp bài', 'Giáo viên sẽ chấm theo rubric 4 tiêu chí và phản hồi trong 48h.');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Luyện Viết VSTEP" icon={<PenTool />} description="Task 1 (thư/email 120 từ) và Task 2 (bài luận 250 từ) theo đúng format Bộ GD&ĐT." />
      <Tabs
        variant="pill"
        value={taskId}
        onChange={setTaskId}
        items={VSTEP_WRITING_TASKS.map((t) => ({ key: t.id, label: t.task, icon: submitted.includes(t.id) ? <CheckCircle2 className="text-emerald-500" /> : <FileText /> }))}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Card className="animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <Badge tone="violet">{task.task}</Badge>
              <Badge tone="slate" icon={<Clock className="w-3 h-3" />}>
                {task.minutes} phút
              </Badge>
              <Badge tone="slate">≥ {task.minWords} từ</Badge>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">{task.prompt}</p>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: '80ms' }} padding="sm">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={running ? 'Bắt đầu viết tại đây...' : 'Nhấn "Bắt đầu tính giờ" để làm bài như thi thật, hoặc viết tự do.'}
              className="min-h-[360px] text-[15px] leading-7 font-sans"
              onFocus={() => !running && remaining === task.minutes * 60 && setRunning(true)}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
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
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="text-center animate-slide-in-right">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Thời gian còn lại</p>
            <p className={cn('text-4xl font-black font-mono mt-1 transition-colors', remaining < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-900')}>{formatClock(Math.max(0, remaining))}</p>
            <Button
              fullWidth
              className="mt-4"
              variant={running ? 'outline' : 'primary'}
              leftIcon={running ? <Clock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              onClick={() => {
                if (!running && remaining <= 0) setRemaining(task.minutes * 60);
                setRunning((r) => !r);
              }}
            >
              {running ? 'Tạm dừng' : remaining <= 0 ? 'Làm lại' : 'Bắt đầu tính giờ'}
            </Button>
          </Card>
          <Card padding="sm" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Gợi ý bố cục" className="mb-2" />
            <ol className="space-y-2 text-xs text-slate-600">
              {(task.id === 'vs-w-1'
                ? ['Dear + tên người nhận, nêu lý do viết', 'Đoạn 1: mô tả vấn đề đã gặp', 'Đoạn 2: ảnh hưởng tới chuyến đi', 'Đoạn 3: yêu cầu cụ thể', 'Kết thư lịch sự (Yours sincerely)']
                : ['Mở bài: paraphrase + nêu quan điểm', 'Thân 1: luận điểm + giải thích + ví dụ', 'Thân 2: quan điểm đối lập/bổ sung', 'Kết bài: khẳng định lại ý kiến', 'Dành 5 phút kiểm tra lỗi']
              ).map((s, i) => (
                <li key={s} className="flex gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
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
            <Button variant="success" leftIcon={<Send className="w-4 h-4" />} onClick={submit}>
              Nộp cho giáo viên
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {wordCount < task.minWords && <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">Bài viết chưa đủ {task.minWords} từ tối thiểu. Bạn vẫn có thể nộp nhưng sẽ bị trừ điểm Task Fulfilment.</p>}
          {CRITERIA.map((c) => (
            <Switch key={c.key} checked={!!checks[c.key]} onChange={(v) => setChecks((s) => ({ ...s, [c.key]: v }))} label={c.label} description={c.desc} />
          ))}
        </div>
      </Modal>
    </div>
  );
};
