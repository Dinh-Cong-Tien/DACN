import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Send, Clock, CheckCircle2, RotateCcw, MessageSquare } from 'lucide-react';
import { VSTEP_SPEAKING_PARTS } from '@/shared/mocks';
import { cn, formatClock } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { Alert, Badge, Button, Card, CardHeader, PageHeader, DataTable, Column } from '@/shared/components/ui';

type Phase = 'IDLE' | 'PREP' | 'RECORDING' | 'DONE';

interface HistoryRow {
  id: string;
  part: string;
  date: string;
  duration: string;
  score?: number;
  status: 'GRADED' | 'PENDING';
}

const HISTORY: HistoryRow[] = [
  { id: 'h-1', part: 'Part 2 — Solution Discussion', date: '28/10/2026', duration: '03:42', status: 'PENDING' },
  { id: 'h-2', part: 'Part 1 — Social Interaction', date: '21/10/2026', duration: '02:15', score: 7.0, status: 'GRADED' },
  { id: 'h-3', part: 'Part 3 — Topic Development', date: '14/10/2026', duration: '04:50', score: 6.5, status: 'GRADED' },
];

const BAR_COUNT = 28;

export const StudentSpeakingPage: React.FC = () => {
  useDocumentTitle('Luyện Nói VSTEP');
  const [partId, setPartId] = useState<string | null>(null);
  const part = VSTEP_SPEAKING_PARTS.find((p) => p.id === partId);
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

  const submit = () => {
    toast.success('Đã nộp bài nói', 'Giáo viên sẽ nhận xét theo 4 tiêu chí: Pronunciation, Fluency, Vocabulary, Grammar.');
    setPartId(null);
  };

  const cols: Column<HistoryRow>[] = [
    { key: 'part', header: 'Phần thi', render: (r) => <span className="font-semibold text-slate-800">{r.part}</span> },
    { key: 'date', header: 'Ngày' },
    { key: 'duration', header: 'Thời lượng', align: 'center' },
    { key: 'score', header: 'Điểm', align: 'center', render: (r) => (r.score !== undefined ? <span className="font-black text-indigo-700">{r.score.toFixed(1)}</span> : <span className="text-slate-400">—</span>) },
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
      <PageHeader title="Luyện Nói VSTEP" icon={<Mic />} description="Ghi âm trả lời 3 phần thi Nói theo format Bộ GD&ĐT, nộp cho giáo viên nhận xét." />

      {!part ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VSTEP_SPEAKING_PARTS.map((p, i) => (
              <Card key={p.id} hover className="animate-fade-up flex flex-col" style={{ animationDelay: `${i * 70}ms` }} onClick={() => setPartId(p.id)}>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white font-black flex items-center justify-center">{i + 1}</span>
                  <Badge tone="slate" icon={<Clock className="w-3 h-3" />}>
                    {p.minutes} phút
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-900">{p.part}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed flex-1">{p.prompt}</p>
                <Button size="sm" variant="soft" className="mt-4" leftIcon={<Mic className="w-4 h-4" />}>
                  Luyện phần này
                </Button>
              </Card>
            ))}
          </div>
          <Card className="animate-fade-up" style={{ animationDelay: '250ms' }}>
            <CardHeader title="Lịch sử bài nộp" subtitle="Các bản ghi âm gần đây" icon={<MessageSquare />} />
            <DataTable columns={cols} rows={HISTORY} dense />
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <Card className="animate-fade-up">
              <div className="flex items-center justify-between gap-3 mb-3">
                <Badge tone="rose">{part.part}</Badge>
                <Button size="xs" variant="ghost" onClick={() => setPartId(null)}>
                  Đổi phần thi
                </Button>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">{part.prompt}</p>
            </Card>

            {micError && <Alert type="warning" title="Chưa có quyền micro" onClose={() => setMicError(null)}>{micError}</Alert>}

            <Card className="text-center animate-fade-up" style={{ animationDelay: '80ms' }} padding="lg">
              {phase === 'IDLE' && (
                <div className="space-y-4">
                  <div className="relative inline-flex">
                    <span className="absolute inset-0 rounded-full bg-rose-400/40 animate-pulse-ring" />
                    <button onClick={() => setPhase('PREP')} className="relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lift hover:scale-105 transition">
                      <Mic className="w-10 h-10" />
                    </button>
                  </div>
                  <p className="font-bold text-slate-900">Nhấn để bắt đầu</p>
                  <p className="text-xs text-slate-500">Bạn có 60 giây chuẩn bị, sau đó máy tự động ghi âm tối đa {part.minutes} phút.</p>
                </div>
              )}
              {phase === 'PREP' && (
                <div className="space-y-3 animate-scale-in">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">Thời gian chuẩn bị</p>
                  <p className="text-6xl font-black font-mono text-slate-900">{prep}</p>
                  <p className="text-xs text-slate-500">Hãy gạch ý chính trong đầu. Ghi âm sẽ tự bắt đầu.</p>
                  <Button variant="outline" size="sm" onClick={() => void startRecording()}>
                    Bỏ qua, ghi âm ngay
                  </Button>
                </div>
              )}
              {phase === 'RECORDING' && (
                <div className="space-y-4 animate-scale-in">
                  <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" /> Đang ghi âm · {formatClock(elapsed)} / {formatClock(part.minutes * 60)}
                  </div>
                  <div className="flex items-end justify-center gap-1 h-20">
                    {Array.from({ length: BAR_COUNT }).map((_, i) => (
                      <span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 to-pink-400 animate-bounce-soft" style={{ height: `${20 + ((i * 37) % 60)}%`, animationDelay: `${(i % 7) * 90}ms`, animationDuration: `${0.6 + (i % 4) * 0.15}s` }} />
                    ))}
                  </div>
                  <Button variant="danger" size="lg" leftIcon={<Square className="w-4 h-4 fill-current" />} onClick={stopRecording}>
                    Dừng ghi âm
                  </Button>
                </div>
              )}
              {phase === 'DONE' && (
                <div className="space-y-4 animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pop">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-slate-900">Đã ghi xong · {formatClock(elapsed)}</p>
                  {audioUrl ? (
                    <audio controls src={audioUrl} className="w-full max-w-md mx-auto" />
                  ) : (
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Play className="w-3 h-3" /> Đang xử lý bản ghi...
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={reset}>
                      Ghi lại
                    </Button>
                    <Button variant="success" leftIcon={<Send className="w-4 h-4" />} onClick={submit}>
                      Nộp bài nói
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
          <aside className="space-y-4">
            <Card padding="sm" className="animate-slide-in-right">
              <CardHeader title="Tiêu chí chấm" className="mb-2" />
              <ul className="space-y-2 text-xs text-slate-600">
                {['Pronunciation — phát âm rõ, trọng âm đúng', 'Fluency — trôi chảy, ít ngập ngừng', 'Vocabulary — từ vựng phù hợp chủ đề', 'Grammar — cấu trúc đa dạng, chính xác'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            <Card padding="sm" className={cn('animate-slide-in-right bg-indigo-50/60 border-indigo-100')} style={{ animationDelay: '100ms' }}>
              <p className="text-xs font-bold text-indigo-900 mb-1">Mẹo nhanh</p>
              <p className="text-xs text-indigo-800 leading-relaxed">Mỗi ý trả lời theo công thức: Nêu ý → Giải thích → Ví dụ cá nhân. Đừng im lặng quá 3 giây; dùng "Well, let me think…" để nối ý.</p>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
};
