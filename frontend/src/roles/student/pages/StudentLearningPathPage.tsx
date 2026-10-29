import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, CheckCircle2, Lock, Play, Clock, PlayCircle, Layers, FileText, RotateCcw, BookOpen, Target, CalendarDays } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Badge, Button, Card, PageHeader, ProgressBar, StatCard } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { LEARNING_PATH } from '@/shared/mocks';
import type { PathItemType, PathStatus } from '@/shared/types';
import { cn } from '@/shared/utils';

const TYPE_META: Record<PathItemType, { icon: React.ElementType; label: string; cls: string }> = {
  LESSON: { icon: PlayCircle, label: 'Bài giảng', cls: 'bg-indigo-50 text-indigo-600' },
  PRACTICE: { icon: Layers, label: 'Luyện tập', cls: 'bg-sky-50 text-sky-600' },
  MOCK_TEST: { icon: FileText, label: 'Thi thử', cls: 'bg-violet-50 text-violet-600' },
  REVIEW: { icon: RotateCcw, label: 'Ôn tập', cls: 'bg-amber-50 text-amber-600' },
  VOCAB: { icon: BookOpen, label: 'Từ vựng', cls: 'bg-rose-50 text-rose-600' },
};

const STATUS_META: Record<PathStatus, { tone: 'emerald' | 'indigo' | 'slate'; label: string }> = {
  DONE: { tone: 'emerald', label: 'Hoàn thành' },
  CURRENT: { tone: 'indigo', label: 'Đang học' },
  LOCKED: { tone: 'slate', label: 'Chưa mở' },
};

export const StudentLearningPathPage: React.FC = () => {
  useDocumentTitle('Lộ trình của tôi');
  const user = useAuthStore((s) => s.user);
  const daysLeft = user?.target?.examDate ? Math.max(0, Math.ceil((new Date(user.target.examDate).getTime() - Date.now()) / 86400000)) : 52;
  const allItems = LEARNING_PATH.flatMap((m) => m.items);
  const done = allItems.filter((i) => i.status === 'DONE').length;
  const totalMin = allItems.reduce((a, i) => a + i.durationMin, 0);

  return (
    <div>
      <PageHeader
        icon={<Compass />}
        title="Lộ trình cá nhân hoá"
        description={`Lộ trình 3 chặng được sinh tự động từ bài thi xếp lớp và cập nhật theo từng bài làm của bạn. Mục tiêu: ${user?.target ? `${user.target.examType} ${user.target.score}` : 'TOEIC 750'}.`}
        actions={
          <Badge tone="amber" size="md" icon={<CalendarDays className="w-3.5 h-3.5" />}>
            Còn {daysLeft} ngày tới kỳ thi
          </Badge>
        }
      />

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" step={70}>
        <StatCard label="Tiến độ tổng" value={Math.round((done / allItems.length) * 100)} suffix="%" icon={<Target />} tone="indigo" />
        <StatCard label="Mục đã hoàn thành" value={done} suffix={`/${allItems.length}`} icon={<CheckCircle2 />} tone="emerald" />
        <StatCard label="Thời lượng còn lại" value={Math.round((totalMin - allItems.filter((i) => i.status === 'DONE').reduce((a, i) => a + i.durationMin, 0)) / 60)} suffix="giờ" icon={<Clock />} tone="amber" />
        <StatCard label="Chặng hiện tại" value={`${LEARNING_PATH.find((m) => m.status === 'CURRENT')?.phase ?? 1}/3`} icon={<Compass />} tone="violet" />
      </Stagger>

      <div className="relative">
        <div aria-hidden className="absolute left-5 md:left-7 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-400 via-indigo-400 to-slate-200" />
        <div className="space-y-6">
          {LEARNING_PATH.map((m, mi) => {
            const locked = m.status === 'LOCKED';
            const current = m.status === 'CURRENT';
            return (
              <div key={m.id} className="relative pl-14 md:pl-20 animate-fade-up" style={{ animationDelay: `${mi * 120}ms` }}>
                <span
                  className={cn(
                    'absolute left-0 md:left-1 top-5 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ring-4 ring-slate-50 transition-all',
                    m.status === 'DONE' ? 'bg-emerald-500 text-white' : current ? 'bg-indigo-600 text-white scale-110 shadow-glow' : 'bg-white text-slate-400 border border-slate-200'
                  )}
                >
                  {m.status === 'DONE' ? <CheckCircle2 className="w-5 h-5" /> : locked ? <Lock className="w-4 h-4" /> : m.phase}
                  {current && <span className="absolute inset-0 rounded-2xl bg-indigo-500/40 animate-pulse-ring" />}
                </span>

                <Card className={cn('transition-all', current && 'border-indigo-200 shadow-card', locked && 'opacity-80')} padding="none">
                  <div className={cn('p-5 md:p-6 border-b border-slate-100', current && 'bg-gradient-to-r from-indigo-50/70 to-transparent')}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h2 className="text-lg font-black text-slate-900">{m.title}</h2>
                          <Badge tone={STATUS_META[m.status].tone} dot>
                            {STATUS_META[m.status].label}
                          </Badge>
                          <span className="text-xs text-slate-400 font-semibold">{m.subtitle}</span>
                        </div>
                        <p className="text-sm text-slate-500">{m.description}</p>
                      </div>
                      <div className="md:w-44 shrink-0">
                        <ProgressBar value={m.progress} showValue size="sm" tone={m.status === 'DONE' ? 'emerald' : 'indigo'} label={`${m.items.filter((i) => i.status === 'DONE').length}/${m.items.length} mục`} />
                      </div>
                    </div>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {m.items.map((it, ii) => {
                      const meta = TYPE_META[it.type];
                      const Icon = meta.icon;
                      const itemLocked = it.status === 'LOCKED';
                      const inner = (
                        <div className={cn('flex items-center gap-4 px-5 md:px-6 py-3.5 transition-all', !itemLocked && 'hover:bg-slate-50 hover:translate-x-0.5', it.status === 'CURRENT' && 'bg-indigo-50/40')}>
                          <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', it.status === 'DONE' ? 'bg-emerald-50 text-emerald-600' : itemLocked ? 'bg-slate-100 text-slate-400' : meta.cls)}>
                            {it.status === 'DONE' ? <CheckCircle2 className="w-5 h-5" /> : itemLocked ? <Lock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-semibold truncate', itemLocked ? 'text-slate-400' : 'text-slate-800')}>{it.title}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{meta.label}</span>·<span>{it.skill}</span>·
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {it.durationMin} phút
                              </span>
                            </p>
                          </div>
                          {it.status === 'CURRENT' && (
                            <Button size="xs" variant="gradient" leftIcon={<Play className="w-3 h-3" />} className="animate-pop">
                              Học ngay
                            </Button>
                          )}
                          {it.status === 'DONE' && (
                            <Badge tone="emerald" size="xs">
                              Xong
                            </Badge>
                          )}
                        </div>
                      );
                      return (
                        <li key={it.id} className="animate-fade-in" style={{ animationDelay: `${mi * 120 + ii * 40}ms` }}>
                          {itemLocked ? <div className="cursor-not-allowed">{inner}</div> : <Link to={it.link}>{inner}</Link>}
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
