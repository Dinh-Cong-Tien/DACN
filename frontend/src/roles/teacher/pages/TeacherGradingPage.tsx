import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PenTool, Play, Save, Send, Sparkles, FileText, Mic, CheckCircle2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_SUBMISSIONS } from '@/shared/mocks';
import type { Submission } from '@/shared/types';
import { cn, timeAgo } from '@/shared/utils';
import { Avatar, Badge, Button, Card, CardHeader, Chip, EmptyState, PageHeader, Tabs, Textarea } from '@/shared/components/ui';

const CRITERIA = [
  { key: 'task', label: 'Task Fulfilment', desc: 'Đáp ứng yêu cầu đề bài' },
  { key: 'coherence', label: 'Coherence', desc: 'Mạch lạc, liên kết' },
  { key: 'lexical', label: 'Lexical Resource', desc: 'Từ vựng' },
  { key: 'grammar', label: 'Grammar', desc: 'Ngữ pháp & độ chính xác' },
] as const;

const FEEDBACK_BANK = [
  'Lập luận rõ ràng, bố cục đủ 4 đoạn.',
  'Cần đa dạng cấu trúc câu phức hơn.',
  'Chú ý chia động từ và mạo từ.',
  'Từ vựng học thuật tốt, ví dụ cụ thể.',
];

export const TeacherGradingPage: React.FC = () => {
  useDocumentTitle('Bàn chấm bài');
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [tab, setTab] = useState<Submission['status']>('PENDING');
  const [scores, setScores] = useState<Record<string, number>>({ task: 6, coherence: 6, lexical: 6, grammar: 6 });
  const [feedback, setFeedback] = useState('');

  const selected = useMemo(() => subs.find((s) => s.id === submissionId) ?? subs.find((s) => s.status === tab) ?? subs[0], [subs, submissionId, tab]);
  const list = subs.filter((s) => s.status === tab);
  const avg = Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / 4) * 10) / 10;
  const wordCount = selected?.content ? selected.content.trim().split(/\s+/).length : 0;

  const select = (s: Submission) => {
    navigate(`/teacher/grading/${s.id}`);
    setFeedback(s.feedback ?? '');
  };

  const save = (release = false) => {
    if (!selected) return;
    setSubs((all) => all.map((s) => (s.id === selected.id ? { ...s, score: avg, feedback, status: 'GRADED' } : s)));
    toast.success(release ? 'Đã trả bài cho học viên' : 'Đã lưu điểm', `${selected.studentName} · ${avg}/10`);
    if (release) setTab('GRADED');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Bàn chấm bài" description="Chấm bài tự luận Writing/Speaking theo 4 tiêu chí; bài trắc nghiệm được chấm tự động." icon={<PenTool />} />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        <Card padding="none" className="overflow-hidden animate-slide-in-left">
          <div className="p-3 border-b border-slate-100">
            <Tabs variant="pill" value={tab} onChange={(k) => setTab(k as Submission['status'])} items={[
              { key: 'PENDING', label: 'Chờ chấm', count: subs.filter((s) => s.status === 'PENDING').length },
              { key: 'GRADED', label: 'Đã chấm', count: subs.filter((s) => s.status === 'GRADED').length },
              { key: 'LATE', label: 'Nộp muộn', count: subs.filter((s) => s.status === 'LATE').length },
            ]} className="w-full" />
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {list.length === 0 && <EmptyState compact title="Không có bài nộp" />}
            {list.map((s, i) => (
              <button key={s.id} onClick={() => select(s)} className={cn('w-full flex items-center gap-3 p-4 text-left border-b border-slate-100 last:border-0 transition-all animate-fade-up border-l-2', selected?.id === s.id ? 'bg-emerald-50/60 border-l-emerald-500' : 'border-l-transparent hover:bg-slate-50')} style={{ animationDelay: `${i * 40}ms` }}>
                <Avatar name={s.studentName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{s.studentName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.assignmentTitle}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(s.submittedAt)}</p>
                </div>
                <div className="text-right">
                  <Badge tone={s.type === 'ESSAY' ? 'violet' : s.type === 'SPEAKING' ? 'sky' : 'indigo'} size="xs">{s.type}</Badge>
                  {s.score !== undefined && <p className="text-sm font-black text-emerald-700 mt-1">{s.score}</p>}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {selected ? (
          <div className="space-y-5" key={selected.id}>
            <Card className="animate-fade-up">
              <CardHeader
                title={selected.assignmentTitle}
                subtitle={`${selected.studentName} · nộp ${timeAgo(selected.submittedAt)}`}
                icon={selected.type === 'ESSAY' ? <FileText /> : selected.type === 'SPEAKING' ? <Mic /> : <CheckCircle2 />}
                action={<Badge tone={selected.status === 'GRADED' ? 'emerald' : selected.status === 'LATE' ? 'rose' : 'amber'} dot>{selected.status}</Badge>}
              />
              {selected.type === 'ESSAY' && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2"><span>Bài viết</span><span className="font-bold">{wordCount} từ</span></div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto">{selected.content}</div>
                </div>
              )}
              {selected.type === 'SPEAKING' && (
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-sky-100 bg-sky-50/50">
                  <button className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition"><Play className="w-5 h-5 ml-0.5" /></button>
                  <div className="flex-1">
                    <div className="flex items-end gap-0.5 h-8">
                      {Array.from({ length: 48 }).map((_, i) => <span key={i} className="flex-1 bg-sky-400/70 rounded-sm" style={{ height: `${20 + ((i * 37) % 80)}%` }} />)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">{selected.content}</p>
                  </div>
                </div>
              )}
              {selected.type === 'MOCK_TEST' && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-emerald-800">Bài trắc nghiệm đã được chấm tự động</p>
                  <p className="text-3xl font-black text-emerald-700 mt-1">{selected.score} <span className="text-base text-emerald-600/70">/ {selected.maxScore}</span></p>
                </div>
              )}
            </Card>

            {selected.type !== 'MOCK_TEST' && (
              <Card className="animate-fade-up" style={{ animationDelay: '80ms' }}>
                <CardHeader title="Chấm điểm theo rubric" subtitle="Thang 0–10 cho từng tiêu chí" action={<div className="text-right"><p className="text-3xl font-black text-emerald-700 animate-pop" key={avg}>{avg}</p><p className="text-[10px] font-bold uppercase text-slate-400">Điểm TB</p></div>} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CRITERIA.map((c) => (
                    <div key={c.key} className="p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div><p className="text-sm font-bold text-slate-900">{c.label}</p><p className="text-[11px] text-slate-500">{c.desc}</p></div>
                        <span className="text-lg font-black text-indigo-700">{scores[c.key]}</span>
                      </div>
                      <input type="range" min={0} max={10} step={0.5} value={scores[c.key]} onChange={(e) => setScores((s) => ({ ...s, [c.key]: Number(e.target.value) }))} className="w-full" />
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Nhận xét mẫu:</span>
                    {FEEDBACK_BANK.map((f) => <Chip key={f} onClick={() => setFeedback((v) => (v ? `${v} ${f}` : f))}>{f}</Chip>)}
                  </div>
                  <Textarea label="Nhận xét cho học viên" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Điểm mạnh, điểm cần cải thiện, gợi ý luyện tập..." />
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <Button variant="outline" leftIcon={<Save className="w-4 h-4" />} onClick={() => save(false)}>Lưu điểm</Button>
                  <Button variant="success" leftIcon={<Send className="w-4 h-4" />} onClick={() => save(true)}>Trả bài</Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card><EmptyState icon={<PenTool />} title="Chọn một bài nộp để chấm" /></Card>
        )}
      </div>
    </div>
  );
};
