import React, { useMemo, useState } from 'react';
import { Target, Play, ArrowLeft, Zap, TrendingDown } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, Chip, PageHeader, ProgressBar, RadarChart } from '@/shared/components/ui';
import { PracticeEngine } from '@/engines';
import { MOCK_MISTAKES, MISTAKE_CAUSE_LABEL, QUESTIONS_BY_PART, RADAR_SKILLS, SKILL_SCORES } from '@/shared/mocks';
import type { IQuestion, MistakeCause } from '@/shared/types';
import { cn } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

const SIZES = [5, 10, 15];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const StudentDrillsPage: React.FC = () => {
  useDocumentTitle('Luyện điểm yếu');
  const [size, setSize] = useState(10);
  const [cause, setCause] = useState<MistakeCause | 'ALL'>('ALL');
  const [questions, setQuestions] = useState<IQuestion[] | null>(null);

  const openMistakes = useMemo(() => MOCK_MISTAKES.filter((m) => !m.isResolved).filter((m) => cause === 'ALL' || m.cause === cause), [cause]);
  const weakest = [...SKILL_SCORES].sort((a, b) => a.score - b.score).slice(0, 3);

  const start = () => {
    const base = openMistakes.map((m) => m.question);
    const ids = new Set(base.map((q) => q.id));
    const pool = shuffle(Object.values(QUESTIONS_BY_PART).flat().filter((q) => !ids.has(q.id)));
    const set = [...shuffle(base), ...pool].slice(0, size);
    setQuestions(set);
    toast.info('Đã tạo bộ luyện', `${Math.min(base.length, size)} câu từ Sổ tay lỗi sai + ${Math.max(0, size - base.length)} câu cùng dạng.`);
  };

  if (questions) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setQuestions(null)}>
          Tạo bộ khác
        </Button>
        <PracticeEngine title="Luyện điểm yếu" questions={questions} exitTo="/app/drills" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<Target />}
        title={
          <>
            Luyện <span className="mark-coral mark">điểm yếu</span>
          </>
        }
        description="Tạo bộ câu hỏi bám sát đúng các lỗi bạn hay mắc, bổ sung thêm câu cùng dạng từ ngân hàng để củng cố."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <div className="space-y-5">
          <Card hard className="animate-fade-up">
            <CardHeader title="Thiết lập bộ luyện" subtitle="Chọn số câu và nhóm lỗi muốn tập trung" icon={<Zap />} />
            <div className="space-y-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Số câu hỏi</p>
                <div className="grid grid-cols-3 gap-2 max-w-sm">
                  {SIZES.map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={cn('rounded-2xl border-2 py-3 font-display font-extrabold transition-all duration-200', size === s ? 'border-slate-900 bg-indigo-600 text-white shadow-hard -translate-y-0.5' : 'border-slate-200 text-slate-700 hover:border-slate-900')}>
                      {s} câu
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Nhóm nguyên nhân</p>
                <div className="flex flex-wrap gap-2">
                  <Chip active={cause === 'ALL'} onClick={() => setCause('ALL')}>
                    Tất cả ({MOCK_MISTAKES.filter((m) => !m.isResolved).length})
                  </Chip>
                  {(Object.keys(MISTAKE_CAUSE_LABEL) as MistakeCause[])
                    .filter((c) => MOCK_MISTAKES.some((m) => !m.isResolved && m.cause === c))
                    .map((c) => (
                      <Chip key={c} active={cause === c} onClick={() => setCause(c)} tone={MISTAKE_CAUSE_LABEL[c].tone}>
                        {MISTAKE_CAUSE_LABEL[c].label} ({MOCK_MISTAKES.filter((m) => !m.isResolved && m.cause === c).length})
                      </Chip>
                    ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-100 border-2 border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="text-sm text-slate-800">
                  Bộ luyện gồm <b className="text-slate-900">{Math.min(openMistakes.length, size)}</b> câu từ sổ lỗi sai
                  {size > openMistakes.length && (
                    <>
                      {' '}
                      + <b className="text-slate-900">{size - openMistakes.length}</b> câu cùng dạng
                    </>
                  )}
                  .
                </div>
                <Button variant="gradient" size="lg" leftIcon={<Play className="w-4 h-4" />} onClick={start}>
                  Bắt đầu luyện
                </Button>
              </div>
            </div>
          </Card>

          <Card hard className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Câu sẽ xuất hiện" subtitle={`${openMistakes.length} câu đang chờ luyện lại`} />
            <div className="space-y-2">
              {openMistakes.slice(0, 6).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl border-2 border-slate-200 hover:border-slate-900 transition animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="font-display text-sm font-extrabold text-slate-300 w-6">{String(i + 1).padStart(2, '0')}</span>
                  <Badge tone={MISTAKE_CAUSE_LABEL[m.cause].tone} size="xs">
                    {MISTAKE_CAUSE_LABEL[m.cause].label}
                  </Badge>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1 flex-1">{m.question.stem}</p>
                  <span className="text-[10px] font-extrabold text-slate-500">x{m.count}</span>
                </div>
              ))}
              {openMistakes.length === 0 && <p className="text-sm text-slate-500 text-center py-3 font-semibold">Không có câu sai trong nhóm này — bộ luyện sẽ lấy câu cùng dạng từ ngân hàng.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card hard tone="sky" className="flex flex-col items-center animate-slide-in-right">
            <p className="font-display font-bold text-slate-900 text-sm self-start">Bản đồ năng lực</p>
            <RadarChart data={RADAR_SKILLS} size={230} tone="violet" />
          </Card>
          <Card hard className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <CardHeader title="3 Part yếu nhất" icon={<TrendingDown />} />
            <div className="space-y-3">
              {weakest.map((s) => (
                <ProgressBar key={s.skill} value={s.score} label={s.skill} showValue size="sm" tone="violet" />
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-semibold">Mục tiêu: đưa mỗi Part lên ≥ 75% trước ngày thi.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
