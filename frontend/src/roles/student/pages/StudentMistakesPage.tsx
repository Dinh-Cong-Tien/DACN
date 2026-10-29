import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Target, RotateCcw, XCircle, Lightbulb, Flame } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, Chip, EmptyState, PageHeader, StatCard, Tabs, MiniBars } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { MOCK_MISTAKES, MISTAKE_CAUSE_LABEL } from '@/shared/mocks';
import type { Mistake, MistakeCause } from '@/shared/types';
import { cn, formatDate, timeAgo } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

export const StudentMistakesPage: React.FC = () => {
  useDocumentTitle('Sổ tay lỗi sai');
  const [items, setItems] = useState<Mistake[]>(MOCK_MISTAKES);
  const [tab, setTab] = useState('open');
  const [cause, setCause] = useState<MistakeCause | 'ALL'>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);
  const now = Date.now();

  const list = useMemo(() => items.filter((m) => (tab === 'open' ? !m.isResolved : m.isResolved)).filter((m) => cause === 'ALL' || m.cause === cause), [items, tab, cause]);
  const dueToday = items.filter((m) => !m.isResolved && new Date(m.nextReviewAt).getTime() <= now).length;
  const causeStats = (Object.keys(MISTAKE_CAUSE_LABEL) as MistakeCause[]).map((c) => ({ label: MISTAKE_CAUSE_LABEL[c].label, value: items.filter((m) => m.cause === c).length, tone: MISTAKE_CAUSE_LABEL[c].tone })).filter((s) => s.value > 0);

  const resolve = (id: string) => {
    setItems((s) => s.map((m) => (m.id === id ? { ...m, isResolved: true } : m)));
    toast.success('Đã đánh dấu đã hiểu', 'Câu này sẽ được ôn lại sau 14 ngày để kiểm tra.');
  };

  return (
    <div>
      <PageHeader icon={<AlertTriangle />} title="Sổ tay lỗi sai" description="Mọi câu sai từ luyện tập và thi thử được tự động lưu kèm đáp án đúng, lời giải và phân loại nguyên nhân." actions={<Button to="/app/drills" leftIcon={<Target className="w-4 h-4" />} variant="gradient">Luyện lại các câu này</Button>} />

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" step={70}>
        <StatCard label="Tổng lỗi sai" value={items.length} icon={<AlertTriangle />} tone="rose" />
        <StatCard label="Đã giải quyết" value={items.filter((m) => m.isResolved).length} icon={<CheckCircle2 />} tone="emerald" />
        <StatCard label="Cần ôn hôm nay" value={dueToday} icon={<RotateCcw />} tone="amber" hint="Theo lịch SM-2" />
        <StatCard label="Sai lặp lại" value={items.filter((m) => m.count > 1).length} icon={<Flame />} tone="orange" hint="Sai ≥ 2 lần" />
      </Stagger>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 animate-fade-down">
            <Tabs
              variant="pill"
              value={tab}
              onChange={setTab}
              items={[
                { key: 'open', label: 'Chưa giải quyết', count: items.filter((m) => !m.isResolved).length },
                { key: 'done', label: 'Đã giải quyết', count: items.filter((m) => m.isResolved).length },
              ]}
            />
            <div className="flex gap-1.5 flex-wrap">
              <Chip active={cause === 'ALL'} onClick={() => setCause('ALL')}>
                Tất cả
              </Chip>
              {causeStats.map((c) => {
                const key = (Object.keys(MISTAKE_CAUSE_LABEL) as MistakeCause[]).find((k) => MISTAKE_CAUSE_LABEL[k].label === c.label)!;
                return (
                  <Chip key={key} active={cause === key} onClick={() => setCause(key)} tone={c.tone}>
                    {c.label}
                  </Chip>
                );
              })}
            </div>
          </div>

          {list.length === 0 ? (
            <Card>
              <EmptyState icon={<CheckCircle2 />} title="Không có lỗi sai nào" description="Tuyệt vời! Hãy tiếp tục luyện tập để giữ phong độ." />
            </Card>
          ) : (
            list.map((m, i) => {
              const meta = MISTAKE_CAUSE_LABEL[m.cause];
              const open = expanded === m.id;
              const due = new Date(m.nextReviewAt).getTime() <= now;
              return (
                <Card key={m.id} padding="none" className={cn('overflow-hidden animate-fade-up transition-all', open && 'border-indigo-200 shadow-card')} style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="p-4 md:p-5">
                    <div className="flex items-start gap-3">
                      <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm', m.isResolved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>{m.isResolved ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <Badge tone={meta.tone} size="xs">
                            {meta.label}
                          </Badge>
                          <Badge tone="slate" size="xs">
                            {m.question.partOrSkill.replace('_', ' ')}
                          </Badge>
                          {m.count > 1 && (
                            <Badge tone="orange" size="xs" icon={<Flame className="w-3 h-3" />}>
                              Sai {m.count} lần
                            </Badge>
                          )}
                          {due && !m.isResolved && (
                            <Badge tone="amber" size="xs" dot>
                              Cần ôn hôm nay
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 leading-snug">{m.question.stem}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold line-through">
                            {m.userAnswer}. {m.question.options.find((o) => o.key === m.userAnswer)?.text}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> {m.correctAnswer}. {m.question.options.find((o) => o.key === m.correctAnswer)?.text}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Nguồn: {m.source} · {formatDate(m.date)} · Ôn lại: {due ? 'hôm nay' : timeAgo(m.nextReviewAt).replace('trước', 'tới')}
                        </p>
                      </div>
                      <button onClick={() => setExpanded(open ? null : m.id)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition shrink-0">
                        <ChevronDown className={cn('w-5 h-5 transition-transform duration-300', open && 'rotate-180')} />
                      </button>
                    </div>
                  </div>
                  <div className={cn('grid transition-[grid-template-rows] duration-300 ease-spring', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden">
                      <div className="px-4 md:px-5 pb-5 space-y-3">
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-sm text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 flex items-center gap-2 mb-1">
                            <Lightbulb className="w-4 h-4" /> Giải thích
                          </p>
                          {m.question.explanation}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {m.question.tags.map((t) => (
                            <Badge key={t} tone="slate" size="xs">
                              #{t}
                            </Badge>
                          ))}
                        </div>
                        {!m.isResolved && (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" to="/app/drills" leftIcon={<Target className="w-4 h-4" />}>
                              Luyện câu tương tự
                            </Button>
                            <Button size="sm" variant="success" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={() => resolve(m.id)}>
                              Đánh dấu đã hiểu
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          <Card className="animate-slide-in-right">
            <p className="font-bold text-slate-900 text-sm mb-1">Phân bố nguyên nhân</p>
            <p className="text-[11px] text-slate-500 mb-4">Hiểu vì sao sai quan trọng hơn sai câu nào</p>
            <MiniBars data={causeStats} height={100} />
          </Card>
          <Card className="animate-slide-in-right bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100" style={{ animationDelay: '100ms' }}>
            <p className="font-bold text-indigo-900 text-sm">Gợi ý từ hệ thống</p>
            <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">Bạn sai nhiều nhất ở nhóm <b>Nghe nhầm</b> và <b>Từ vựng</b>. Hãy luyện Part 2 mỗi ngày 10 câu và ôn flashcard chủ đề Business.</p>
            <Button size="sm" variant="gradient" fullWidth className="mt-3" to="/app/review">
              Ôn theo lịch SM-2
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
