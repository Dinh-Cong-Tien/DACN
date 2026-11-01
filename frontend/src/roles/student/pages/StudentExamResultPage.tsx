import React, { useMemo, useState } from 'react';
import { fireConfetti } from '@/shared/components/motion/confetti';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Clock, Target, AlertTriangle, RotateCcw, BookmarkPlus, Share2, Flag, CheckCircle2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, ProgressBar, RingProgress, StatCard, Tabs, EmptyState } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { QuestionRenderer } from '@/engines';
import { MOCK_TESTS, buildMockTest } from '@/shared/mocks';
import { toast } from '@/shared/stores/uiStore';
import { cn, examSetupQuery, formatDuration, getCorrectKey } from '@/shared/utils';
import type { ExamSetup } from '@/shared/types';

interface StoredResult {
  answers: Record<string, string>;
  flagged: string[];
  timeSpentSec: number;
  correctCount: number;
  total: number;
  bySection: { name: string; correct: number; total: number }[];
  testId?: string;
  title?: string;
  examType?: 'TOEIC' | 'VSTEP';
  setup?: ExamSetup;
}

function readStored(id: string): StoredResult | null {
  try {
    const raw = localStorage.getItem('orbi-last-result');
    const r = raw ? (JSON.parse(raw) as StoredResult) : null;
    return r?.testId === id ? r : null;
  } catch {
    return null;
  }
}

export const StudentExamResultPage: React.FC = () => {
  const { id = 'ets-2024-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const summary = MOCK_TESTS.find((t) => t.id === id);
  const stored = useMemo(() => readStored(id), [id]);
  const setup = stored?.setup;
  const practice = setup?.mode === 'PRACTICE';
  const test = useMemo(() => buildMockTest(id, summary?.examType ?? 'TOEIC', summary?.title, setup), [id, summary, setup]);
  const questions = useMemo(() => test.sections.flatMap((s) => s.questions), [test]);
  useDocumentTitle(`Kết quả · ${test.title}`);
  const [tab, setTab] = useState('wrong');

  const result = useMemo<StoredResult>(() => {
    if (stored) return stored;
    // Demo fallback: giả lập đúng 11/19, sai các câu còn lại
    const answers: Record<string, string> = {};
    questions.forEach((q, i) => {
      const correct = getCorrectKey(q);
      answers[q.id] = i % 5 === 2 || i % 7 === 4 ? (q.options.find((o) => o.key !== correct)?.key ?? correct) : correct;
    });
    const bySection = test.sections.map((s) => ({ name: s.name, total: s.questions.length, correct: s.questions.filter((q) => answers[q.id] === getCorrectKey(q)).length }));
    return { answers, flagged: [questions[1]?.id, questions[5]?.id].filter(Boolean) as string[], timeSpentSec: 1140, correctCount: bySection.reduce((a, s) => a + s.correct, 0), total: questions.length, bySection };
  }, [stored, questions, test]);

  const isVstep = test.examType === 'VSTEP';
  const pct = Math.round((result.correctCount / Math.max(1, result.total)) * 100);
  React.useEffect(() => { if (pct >= 60) fireConfetti(); }, [pct]);
  // Luyện tập theo Part: không quy đổi thang điểm, chỉ tính số câu đúng
  const score = practice ? result.correctCount : isVstep ? Math.round((result.correctCount / result.total) * 10 * 2) / 2 : Math.round(((result.correctCount / result.total) * 990) / 5) * 5;
  const maxScore = practice ? result.total : isVstep ? 10 : 990;
  const wrong = questions.filter((q) => result.answers[q.id] !== getCorrectKey(q));
  const flaggedQ = questions.filter((q) => result.flagged.includes(q.id));
  const list = tab === 'all' ? questions : tab === 'wrong' ? wrong : flaggedQ;
  const tone = pct >= 75 ? 'emerald' : pct >= 50 ? 'amber' : 'violet';
  const cardTone = pct >= 75 ? 'teal' : pct >= 50 ? 'yellow' : 'coral';

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Thi thử', to: '/app/mock-tests' }, { label: test.title, to: `/app/mock-tests/${id}` }, { label: 'Kết quả' }]}
        title={
          <>
            Kết quả <span className="mark">bài thi</span>
          </>
        }
        description={test.title}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Share2 className="w-4 h-4" />} onClick={() => toast.info('Đã sao chép liên kết kết quả')}>
              Chia sẻ
            </Button>
            <Button size="sm" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={() => navigate(`/app/exam/${id}${setup ? examSetupQuery(setup) : ''}`)}>
              Làm lại
            </Button>
          </>
        }
      />

      <Card hard tone={cardTone} className="mb-6 animate-scale-in" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="relative flex justify-center">
            <div className="rounded-full bg-white border-2 border-slate-900 p-2 shadow-hard">
              <RingProgress value={pct} size={176} stroke={14} tone={tone}>
                <div className="text-center">
                  <p className="font-display text-4xl font-extrabold text-slate-900">{score}</p>
                  <p className="text-[11px] font-extrabold uppercase text-slate-500">/{maxScore} {practice ? 'câu đúng' : 'điểm'}</p>
                </div>
              </RingProgress>
            </div>
            <span className={cn('absolute -top-2 -right-2 w-12 h-12 rounded-2xl border-2 border-slate-900 bg-amber-300 flex items-center justify-center shadow-hard-sm animate-bounce-soft', pct < 50 && 'bg-white')}>
              <Trophy className={cn('w-6 h-6', pct >= 50 ? 'text-slate-900' : 'text-slate-300')} />
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">{pct >= 75 ? 'Tuyệt vời! Bạn đã vượt mục tiêu chặng.' : pct >= 50 ? 'Khá tốt — còn vài điểm cần cải thiện.' : 'Đừng nản, hãy xem lại lỗi sai và luyện thêm.'}</h2>
              <p className="text-sm mt-1 opacity-90 font-semibold">
                Đúng <b>{result.correctCount}</b>/{result.total} câu · Sai {wrong.length} câu · {flaggedQ.length} câu đánh dấu · {formatDuration(result.timeSpentSec)}
              </p>
            </div>
            <div className="space-y-3 rounded-2xl bg-white/85 border-2 border-slate-900 p-4 text-slate-900">
              {result.bySection.map((s, i) => (
                <div key={s.name} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <ProgressBar value={(s.correct / Math.max(1, s.total)) * 100} label={s.name} showValue size="md" tone={s.correct / s.total >= 0.7 ? 'emerald' : 'amber'} />
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    {s.correct}/{s.total} câu đúng
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Stagger className="grid grid-cols-3 gap-4 mb-6" step={70}>
        <StatCard label="Độ chính xác" value={pct} suffix="%" icon={<Target />} tone={tone} />
        <StatCard label="Thời gian làm" value={formatDuration(result.timeSpentSec)} icon={<Clock />} tone="sky" hint={`Trung bình ${Math.round(result.timeSpentSec / Math.max(1, result.total))}s / câu`} />
        <StatCard label="Lỗi sai đã lưu" value={wrong.length} suffix="câu" icon={<AlertTriangle />} tone="violet" hint="Sổ tay lỗi sai" />
      </Stagger>

      <Card hard className="animate-fade-up" padding="none">
        <div className="p-5 border-b-2 border-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <CardHeader title="Xem lại bài làm" subtitle="Đáp án đúng, giải thích chi tiết và phân loại lỗi" icon={<CheckCircle2 />} className="mb-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <Tabs
              variant="pill"
              value={tab}
              onChange={setTab}
              items={[
                { key: 'all', label: 'Tất cả', count: questions.length },
                { key: 'wrong', label: 'Câu sai', count: wrong.length },
                { key: 'flag', label: 'Đánh dấu', icon: <Flag />, count: flaggedQ.length },
              ]}
            />
            <Button size="sm" variant="soft" leftIcon={<BookmarkPlus className="w-4 h-4" />} onClick={() => toast.success('Đã lưu vào Sổ tay lỗi sai', `${wrong.length} câu được thêm vào lịch ôn SM-2.`)}>
              Lưu lỗi sai
            </Button>
          </div>
        </div>
        <div className="p-5 space-y-5 bg-paper">
          {list.length === 0 ? (
            <EmptyState title="Không có câu nào" description={tab === 'wrong' ? 'Bạn không sai câu nào. Xuất sắc!' : 'Bạn chưa đánh dấu câu nào trong bài thi.'} compact />
          ) : (
            list.map((q, i) => (
              <div key={q.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone={result.answers[q.id] === getCorrectKey(q) ? 'emerald' : 'violet'} solid size="xs">
                    {result.answers[q.id] ? (result.answers[q.id] === getCorrectKey(q) ? 'Đúng' : `Bạn chọn ${result.answers[q.id]}`) : 'Bỏ trống'}
                  </Badge>
                  {result.flagged.includes(q.id) && (
                    <Badge tone="amber" size="xs" icon={<Flag className="w-3 h-3" />}>
                      Đã đánh dấu
                    </Badge>
                  )}
                </div>
                <QuestionRenderer question={q} index={questions.indexOf(q)} selectedAnswer={result.answers[q.id]} onSelectAnswer={() => undefined} showExplanation isReadOnly />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
