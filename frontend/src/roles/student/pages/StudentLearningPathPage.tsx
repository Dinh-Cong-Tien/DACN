import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, CheckCircle2, Lock, Play, Clock, PlayCircle, Layers, FileText, RotateCcw, BookOpen, Target, CalendarDays } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Badge, Button, Card, PageHeader, ProgressBar, StatCard } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { usePath } from '@/shared/api/learner';
import type { PathItemType, PathStatus } from '@/shared/types';
import { cn } from '@/shared/utils';

const TYPE_META: Record<PathItemType, { icon: React.ElementType; label: string; cls: string }> = {
  LESSON: { icon: PlayCircle, label: 'Bài giảng', cls: 'bg-indigo-100 text-indigo-800' },
  PRACTICE: { icon: Layers, label: 'Luyện tập', cls: 'bg-sky-100 text-sky-800' },
  MOCK_TEST: { icon: FileText, label: 'Thi thử', cls: 'bg-violet-100 text-violet-800' },
  REVIEW: { icon: RotateCcw, label: 'Ôn tập', cls: 'bg-amber-100 text-amber-800' },
  VOCAB: { icon: BookOpen, label: 'Từ vựng', cls: 'bg-emerald-100 text-emerald-800' },
};

const STATUS_META: Record<PathStatus, { tone: 'emerald' | 'indigo' | 'slate'; label: string }> = {
  DONE: { tone: 'emerald', label: 'Hoàn thành' },
  CURRENT: { tone: 'indigo', label: 'Đang học' },
  LOCKED: { tone: 'slate', label: 'Chưa mở' },
};

const PHASE_PHOTO = [PHOTOS.notes, PHOTOS.laptop, PHOTOS.graduation];
const PHASE_TONE = ['bg-emerald-400', 'bg-indigo-600', 'bg-violet-500'];

export const StudentLearningPathPage: React.FC = () => {
  useDocumentTitle('Lộ trình của tôi');
  const user = useAuthStore((s) => s.user);
  const daysLeft = user?.target?.examDate ? Math.max(0, Math.ceil((new Date(user.target.examDate).getTime() - Date.now()) / 86400000)) : null;
  const { data: path, isLoading } = usePath();
  const LEARNING_PATH = path?.milestones ?? [];
  const allItems = LEARNING_PATH.flatMap((m) => m.items);
  const done = allItems.filter((i) => i.status === 'DONE').length;
  const totalMin = allItems.reduce((a, i) => a + i.durationMin, 0);

  return (
    <div>
      <PageHeader
        icon={<Compass />}
        eyebrow="Lộ trình 3 chặng"
        title={
          <>
            Lộ trình <span className="mark">cá nhân hoá</span>
          </>
        }
        description={`Sinh tự động từ mục tiêu của bạn và cập nhật theo từng bài làm.${user?.target ? ` Mục tiêu: ${user.target.examType} ${user.target.score}.` : ''}`}
        actions={
          daysLeft !== null ? (
            <span className="sticker tilt-2 !bg-amber-300">
              <CalendarDays className="w-3.5 h-3.5" /> Còn {daysLeft} ngày tới kỳ thi
            </span>
          ) : undefined
        }
      />

      {!path && (
        <Card hard className="mb-8">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display font-extrabold text-slate-900">{isLoading ? 'Đang tải lộ trình…' : 'Bạn chưa có lộ trình'}</p>
              {!isLoading && <p className="text-sm text-slate-500 mt-1">Đặt mục tiêu điểm và ngày thi, hệ thống sẽ lập lộ trình 3 chặng cho bạn.</p>}
            </div>
            {!isLoading && (
              <Button to="/onboarding/goal" leftIcon={<Play className="w-4 h-4" />}>
                Đặt mục tiêu
              </Button>
            )}
          </div>
        </Card>
      )}

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" step={70}>
        <StatCard label="Tiến độ tổng" value={Math.round((done / Math.max(1, allItems.length)) * 100)} suffix="%" icon={<Target />} tone="indigo" />
        <StatCard label="Mục đã hoàn thành" value={done} suffix={`/${allItems.length}`} icon={<CheckCircle2 />} tone="emerald" />
        <StatCard label="Thời lượng còn lại" value={Math.round((totalMin - allItems.filter((i) => i.status === 'DONE').reduce((a, i) => a + i.durationMin, 0)) / 60)} suffix="giờ" icon={<Clock />} tone="amber" />
        <StatCard label="Chặng hiện tại" value={`${LEARNING_PATH.find((m) => m.status === 'CURRENT')?.phase ?? 1}/3`} icon={<Compass />} tone="violet" />
      </Stagger>

      <div className="space-y-8">
        {LEARNING_PATH.map((m, mi) => {
          const locked = m.status === 'LOCKED';
          const current = m.status === 'CURRENT';
          return (
            <div key={m.id} className={cn('animate-fade-up', locked && 'opacity-80')} style={{ animationDelay: `${mi * 120}ms` }}>
              <Card hard padding="none" className={cn('overflow-hidden', current && 'shadow-hard-lg')}>
                <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
                  {/* Ảnh chặng */}
                  <div className="relative min-h-[180px] md:min-h-full border-b-2 md:border-b-0 md:border-r-2 border-slate-900">
                    <Img src={PHASE_PHOTO[mi]} alt={m.title} wrapperClass="absolute inset-0" fallbackClass={PHASE_TONE[mi]} className={cn(locked && 'grayscale')} />
                    <span className={cn('absolute top-3 left-3 w-14 h-14 rounded-2xl border-2 border-slate-900 shadow-hard-sm flex items-center justify-center font-display text-2xl font-extrabold', m.status === 'DONE' ? 'bg-emerald-400 text-slate-900' : current ? 'bg-amber-300 text-slate-900' : 'bg-white text-slate-400')}>
                      {m.status === 'DONE' ? <CheckCircle2 className="w-7 h-7" /> : locked ? <Lock className="w-6 h-6" /> : `0${m.phase}`}
                    </span>
                    <span className="absolute bottom-3 left-3 sticker tilt-3 !text-[10px]">{m.weeks}</span>
                  </div>
                  <div>
                    <div className={cn('p-5 md:p-6 border-b-2 border-slate-900/10', current && 'bg-amber-50')}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h2 className="font-display text-xl font-extrabold text-slate-900">{m.title}</h2>
                            <Badge tone={STATUS_META[m.status].tone} dot solid={current}>
                              {STATUS_META[m.status].label}
                            </Badge>
                            <span className="text-xs text-slate-500 font-bold">{m.subtitle}</span>
                          </div>
                          <p className="text-sm text-slate-600">{m.description}</p>
                        </div>
                        <div className="md:w-44 shrink-0">
                          <ProgressBar value={m.progress} showValue size="sm" tone={m.status === 'DONE' ? 'emerald' : 'indigo'} label={`${m.items.filter((i) => i.status === 'DONE').length}/${m.items.length} mục`} />
                        </div>
                      </div>
                    </div>
                    <ul className="divide-y divide-slate-200">
                      {m.items.map((it, ii) => {
                        const meta = TYPE_META[it.type];
                        const Icon = meta.icon;
                        const itemLocked = it.status === 'LOCKED';
                        const inner = (
                          <div className={cn('flex items-center gap-4 px-5 md:px-6 py-3.5 transition-all', !itemLocked && 'hover:bg-slate-50 hover:translate-x-0.5', it.status === 'CURRENT' && 'bg-indigo-50')}>
                            <span className="font-display text-lg font-extrabold text-slate-300 w-7 shrink-0">{String(ii + 1).padStart(2, '0')}</span>
                            <span className={cn('w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0', it.status === 'DONE' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : itemLocked ? 'bg-slate-100 text-slate-400 border-slate-200' : cn(meta.cls, 'border-slate-900'))}>
                              {it.status === 'DONE' ? <CheckCircle2 className="w-5 h-5" /> : itemLocked ? <Lock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-bold truncate', itemLocked ? 'text-slate-400' : 'text-slate-900')}>{it.title}</p>
                              <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
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
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
