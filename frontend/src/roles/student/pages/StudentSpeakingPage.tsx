import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Square, Play, Send, Clock, CheckCircle2, RotateCcw, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, errorMessage, http } from '@/shared/api/client';
import { startAttempt, submitAttempt, usePracticeTasks, useSubmitAssignment } from '@/shared/api/learner';
import { cn, formatClock } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { Alert, Badge, Button, Card, CardHeader, PageHeader, DataTable, Column } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { appLocale } from '@/shared/i18n';

type Phase = 'IDLE' | 'PREP' | 'RECORDING' | 'DONE';

interface HistoryRow {
  id: string;
  part: string;
  date: string;
  durationSec: number;
  score?: number;
  status: 'GRADED' | 'PENDING';
  audioUrl?: string;
}

const PART_PHOTO = [PHOTOS.discussion, PHOTOS.meeting, PHOTOS.lecture];
const PART_TONE: Array<'teal' | 'coral' | 'yellow'> = ['teal', 'coral', 'yellow'];
const BAR_COUNT = 28;

export const StudentSpeakingPage: React.FC = () => {
  useDocumentTitle('Luyện Nói VSTEP');
  // Mở từ bài được giao: ?part=<id> vào thẳng phần giáo viên giao
  const [params] = useSearchParams();
  const assignmentId = params.get('assignment');
  const qc = useQueryClient();
  const { data: tasks = [] } = usePracticeTasks('speaking', { examType: 'VSTEP' });
  const VSTEP_SPEAKING_PARTS = useMemo(
    () =>
      tasks
        .map((q) => {
          const c = (q.taskConfig ?? {}) as { title?: string; minutes?: number };
          return { id: q.id, part: c.title ?? 'Phần thi Nói', minutes: c.minutes ?? 3, prompt: q.stem };
        })
        .sort((a, b) => a.part.localeCompare(b.part)),
    [tasks]
  );
  const { data: HISTORY = [] } = useQuery({ queryKey: ['learner', 'speaking-history'], queryFn: () => api.get<HistoryRow[]>('/learner/speaking/history') });
  const submitAssignment = useSubmitAssignment();
  const [sending, setSending] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const [partId, setPartId] = useState<string | null>(params.get('part'));
  const part = VSTEP_SPEAKING_PARTS.find((p) => p.id === partId);
  const partIdx = VSTEP_SPEAKING_PARTS.findIndex((p) => p.id === partId);
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [prep, setPrep] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setPhase('IDLE');
    setPrep(60);
    setElapsed(0);
    setAudioUrl(null);
    setMicError(null);
  }, [partId]);

  useEffect(() => {
    if (phase !== 'PREP') return;
    if (prep <= 0) {
      void startRecording();
      return;
    }
    const id = setInterval(() => setPrep((p) => p - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, prep]);

  useEffect(() => {
    if (phase !== 'RECORDING') return;
    const max = (part?.minutes ?? 3) * 60;
    if (elapsed >= max) {
      stopRecording();
      return;
    }
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, elapsed]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setElapsed(0);
      setPhase('RECORDING');
    } catch {
      setMicError('Không truy cập được micro. Hãy cấp quyền micro cho trình duyệt rồi thử lại.');
      setPhase('IDLE');
    }
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setPhase('DONE');
  };

  const reset = () => {
    setPhase('IDLE');
    setPrep(60);
    setElapsed(0);
    setAudioUrl(null);
  };

  const submit = async () => {
    if (!part || !blobRef.current) return;
    setSending(true);
    try {
      // 1. Tải file ghi âm lên máy chủ  2. Nộp bài kèm đường dẫn file
      const up = await http.post<{ data: { url: string } }>('/learner/uploads/recording', blobRef.current, { headers: { 'Content-Type': 'audio/webm' } });
      const audio = up.data.data.url;
      if (assignmentId) await submitAssignment.mutateAsync({ id: assignmentId, audioUrl: audio });
      else {
        const r = await startAttempt({ questionIds: [part.id] });
        await submitAttempt(r.attempt.id, [{ questionId: part.id, audioUrl: audio, timeSpentMs: elapsed * 1000 }], elapsed);
      }
      qc.invalidateQueries({ queryKey: ['learner', 'speaking-history'] });
      toast.success('Đã nộp bài nói', 'Giáo viên sẽ nhận xét theo 4 tiêu chí: Pronunciation, Fluency, Vocabulary, Grammar.');
      setPartId(null);
    } catch (e) {
      toast.error('Chưa nộp được bài nói', errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const cols: Column<HistoryRow>[] = [
    { key: 'part', header: 'Phần thi', render: (r) => <span className="font-bold text-slate-900">{r.part}</span> },
    { key: 'date', header: 'Ngày', render: (r) => new Date(r.date).toLocaleDateString(appLocale()) },
    { key: 'durationSec', header: 'Thời lượng', align: 'center', render: (r) => <span className="font-mono">{formatClock(r.durationSec)}</span> },
    { key: 'score', header: 'Điểm', align: 'center', render: (r) => (r.score !== undefined ? <span className="font-display font-extrabold text-indigo-700 text-base">{r.score.toFixed(1)}</span> : <span className="text-slate-400">—</span>) },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'right',
      render: (r) => (
        <Badge tone={r.status === 'GRADED' ? 'emerald' : 'amber'} dot>
          {r.status === 'GRADED' ? 'Đã chấm' : 'Chờ chấm'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Luyện <span className="mark-coral mark">Nói</span> VSTEP
          </>
        }
        icon={<Mic />}
        description="Ghi âm trả lời 3 phần thi Nói theo format Bộ GD&ĐT, nộp cho giáo viên nhận xét."
      />

      {!part ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VSTEP_SPEAKING_PARTS.map((p, i) => (
              <Card key={p.id} hard hover padding="none" className="animate-fade-up flex flex-col overflow-hidden" style={{ animationDelay: `${i * 70}ms` }} onClick={() => setPartId(p.id)}>
                <div className="relative h-36">
                  <Img src={PART_PHOTO[i]} alt={p.part} wrapperClass="absolute inset-0" fallbackClass="bg-indigo-200" />
                  <div className="absolute inset-0 bg-slate-900/30" />
                  <span className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white border-2 border-slate-900 font-display font-extrabold flex items-center justify-center shadow-hard-sm">{i + 1}</span>
                  <Badge tone="slate" solid size="xs" className="absolute top-3 right-3" icon={<Clock className="w-3 h-3" />}>
                    {p.minutes} phút
                  </Badge>
                </div>
                <div className="p-4 border-t-2 border-slate-900 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-slate-900">{p.part}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed flex-1">{p.prompt}</p>
                  <Button size="sm" variant="primary" className="mt-4" leftIcon={<Mic className="w-4 h-4" />}>
                    Luyện phần này
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Card hard className="animate-fade-up" style={{ animationDelay: '250ms' }}>
            <CardHeader title="Lịch sử bài nộp" subtitle="Các bản ghi âm gần đây" icon={<MessageSquare />} />
            <DataTable columns={cols} rows={HISTORY} dense emptyTitle="Chưa nộp bài nói nào" emptyDescription="Chọn một phần thi ở trên để ghi âm và nộp bài." />
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <Card hard tone={PART_TONE[partIdx] ?? 'teal'} className="animate-fade-up">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="sticker tilt-1">{part.part}</span>
                <Button size="xs" variant="white" onClick={() => setPartId(null)}>
                  Đổi phần thi
                </Button>
              </div>
              <p className="font-display text-lg font-semibold leading-relaxed">{part.prompt}</p>
            </Card>

            {micError && (
              <Alert type="warning" title="Chưa có quyền micro" onClose={() => setMicError(null)}>
                {micError}
              </Alert>
            )}

            <div className="rounded-2xl border-2 border-slate-900 shadow-hard bg-paper text-center p-8 md:p-10 animate-fade-up" style={{ animationDelay: '80ms' }}>
              {phase === 'IDLE' && (
                <div className="space-y-4">
                  <div className="relative inline-flex">
                    <span className="absolute inset-0 rounded-full bg-violet-400/50 animate-pulse-ring" />
                    <button onClick={() => setPhase('PREP')} className="relative w-28 h-28 rounded-full bg-violet-500 border-4 border-slate-900 text-white flex items-center justify-center shadow-hard hover:-translate-y-1 transition">
                      <Mic className="w-12 h-12" />
                    </button>
                  </div>
                  <p className="font-display font-bold text-slate-900 text-lg">Nhấn để bắt đầu</p>
                  <p className="text-xs text-slate-600">Bạn có 60 giây chuẩn bị, sau đó máy tự động ghi âm tối đa {part.minutes} phút.</p>
                </div>
              )}
              {phase === 'PREP' && (
                <div className="space-y-3 animate-scale-in">
                  <span className="sticker tilt-2 !bg-amber-300">Thời gian chuẩn bị</span>
                  <p className="font-display text-7xl font-extrabold text-slate-900 tabular-nums">{prep}</p>
                  <p className="text-xs text-slate-600">Hãy gạch ý chính trong đầu. Ghi âm sẽ tự bắt đầu.</p>
                  <Button variant="outline" size="sm" onClick={() => void startRecording()}>
                    Bỏ qua, ghi âm ngay
                  </Button>
                </div>
              )}
              {phase === 'RECORDING' && (
                <div className="space-y-4 animate-scale-in">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500 border-2 border-slate-900 text-white font-bold text-sm shadow-hard-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /> REC · {formatClock(elapsed)} / {formatClock(part.minutes * 60)}
                  </div>
                  <div className="flex items-end justify-center gap-1 h-24">
                    {Array.from({ length: BAR_COUNT }).map((_, i) => (
                      <span key={i} className={cn('w-2 rounded-full border border-slate-900 animate-bounce-soft', i % 3 === 0 ? 'bg-violet-500' : i % 3 === 1 ? 'bg-amber-300' : 'bg-indigo-500')} style={{ height: `${20 + ((i * 37) % 60)}%`, animationDelay: `${(i % 7) * 90}ms`, animationDuration: `${0.6 + (i % 4) * 0.15}s` }} />
                    ))}
                  </div>
                  <Button variant="danger" size="lg" leftIcon={<Square className="w-4 h-4 fill-current" />} onClick={stopRecording}>
                    Dừng ghi âm
                  </Button>
                </div>
              )}
              {phase === 'DONE' && (
                <div className="space-y-4 animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-400 border-2 border-slate-900 text-slate-900 flex items-center justify-center mx-auto animate-pop shadow-hard-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="font-display font-bold text-slate-900 text-lg">Đã ghi xong · {formatClock(elapsed)}</p>
                  {audioUrl ? (
                    <audio controls src={audioUrl} className="w-full max-w-md mx-auto" />
                  ) : (
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                      <Play className="w-3 h-3" /> Đang xử lý bản ghi...
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={reset}>
                      Ghi lại
                    </Button>
                    <Button variant="success" leftIcon={<Send className="w-4 h-4" />} onClick={() => void submit()} loading={sending}>
                      Nộp bài nói
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <aside className="space-y-4">
            <Card hard padding="sm" className="animate-slide-in-right">
              <CardHeader title="Tiêu chí chấm" className="mb-2" />
              <ul className="space-y-2 text-xs text-slate-700">
                {['Pronunciation — phát âm rõ, trọng âm đúng', 'Fluency — trôi chảy, ít ngập ngừng', 'Vocabulary — từ vựng phù hợp chủ đề', 'Grammar — cấu trúc đa dạng, chính xác'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            <Card hard tone="yellow" padding="sm" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
              <p className="text-xs font-extrabold uppercase tracking-wide mb-1">Mẹo nhanh</p>
              <p className="text-xs leading-relaxed">Mỗi ý trả lời theo công thức: Nêu ý → Giải thích → Ví dụ cá nhân. Đừng im lặng quá 3 giây; dùng "Well, let me think…" để nối ý.</p>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
};
