import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, Trophy, RotateCcw, ArrowRight, Play, FileText, Clock, BookOpen, AlertTriangle, Award, CalendarDays } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Badge, Button, Card, CardHeader, StatCard, ProgressBar, MiniBars, Sparkline, Heatmap, GradientPanel } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { LEARNING_PATH, DAILY_ACTIVITY, WEEKDAY_LABELS, SCORE_HISTORY, MOCK_MISTAKES, MOCK_VOCAB, MOCK_TESTS, MOCK_ACHIEVEMENTS, HEATMAP_DATA, MISTAKE_CAUSE_LABEL } from '@/shared/mocks';
import { cn, formatNumber } from '@/shared/utils';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

export const StudentDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan');
  const user = useAuthStore((s) => s.user);
  const now = Date.now();
  const dueMistakes = MOCK_MISTAKES.filter((m) => !m.isResolved && new Date(m.nextReviewAt).getTime() <= now);
  const dueVocab = MOCK_VOCAB.filter((v) => new Date(v.nextReviewAt).getTime() <= now);
  const currentMilestone = LEARNING_PATH.find((m) => m.status === 'CURRENT') ?? LEARNING_PATH[0];
  const currentItem = currentMilestone.items.find((i) => i.status === 'CURRENT') ?? currentMilestone.items[0];
  const earned = MOCK_ACHIEVEMENTS.filter((a) => a.earned).slice(-3);
  const daysLeft = user?.target?.examDate ? Math.max(0, Math.ceil((new Date(user.target.examDate).getTime() - now) / 86400000)) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 animate-fade-down">
        <div>
          <p className="text-sm font-semibold text-indigo-600">{greeting()} 👋</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{user?.fullName ?? 'Học viên'}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Mục tiêu <b className="text-slate-800">{user?.target ? `${user.target.examType} ${user.target.score}` : 'TOEIC 750'}</b>
            {daysLeft !== null && (
              <>
                {' '}
                · còn <b className="text-slate-800">{daysLeft} ngày</b> tới kỳ thi
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" to="/app/mock-tests" leftIcon={<FileText className="w-4 h-4" />}>
            Thi thử
          </Button>
          <Button size="sm" variant="gradient" to={currentItem.link} leftIcon={<Play className="w-4 h-4" />}>
            Học tiếp
          </Button>
        </div>
      </div>

      <Stagger className="grid grid-cols-2 xl:grid-cols-4 gap-4" step={80}>
        <StatCard label="Chuỗi ngày học" value={user?.streak ?? 12} suffix="ngày" icon={<Flame />} tone="amber" delta={8} deltaLabel="so với tuần trước" />
        <StatCard label="Điểm nỗ lực" value={user?.effortPoints ?? 2480} icon={<Zap />} tone="indigo" delta={12} deltaLabel="tuần này" format={formatNumber} />
        <StatCard label="Điểm thi gần nhất" value={715} suffix="/990" icon={<Trophy />} tone="emerald" delta={5} deltaLabel="ETS 2024 Test 1" />
        <StatCard label="Cần ôn hôm nay" value={dueMistakes.length + dueVocab.length} suffix="mục" icon={<RotateCcw />} tone="rose" hint="Lịch SM-2" />
      </Stagger>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <GradientPanel className="xl:col-span-2 animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-3 flex-1">
              <Badge tone="indigo" className="!bg-white/15 !text-white !border-white/20">
                {currentMilestone.title} · {currentMilestone.subtitle}
              </Badge>
              <h2 className="text-xl md:text-2xl font-black leading-tight">Tiếp tục: {currentItem.title}</h2>
              <p className="text-sm text-indigo-100">{currentMilestone.description}</p>
              <div className="flex items-center gap-3 text-xs font-semibold text-indigo-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {currentItem.durationMin} phút
                </span>
                <span>· {currentItem.skill}</span>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Tiến độ chặng</span>
                  <span>{currentMilestone.progress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full rounded-full bg-white transition-[width] duration-1000 ease-spring" style={{ width: `${currentMilestone.progress}%` }} />
                </div>
              </div>
            </div>
            <Button size="lg" variant="secondary" className="!bg-white !text-indigo-700 hover:!bg-indigo-50 shine shrink-0" to={currentItem.link} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Học ngay
            </Button>
          </div>
        </GradientPanel>

        <Card className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardHeader title="Điểm thi thử" subtitle="7 lần gần nhất" icon={<Trophy />} action={<Badge tone="emerald">+195</Badge>} />
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-4xl font-black text-slate-900">{SCORE_HISTORY[SCORE_HISTORY.length - 1]}</p>
              <p className="text-xs text-slate-400 font-semibold">từ {SCORE_HISTORY[0]} điểm</p>
            </div>
            <Sparkline data={SCORE_HISTORY} width={150} height={56} tone="emerald" />
          </div>
          <Link to="/app/progress" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
            Xem phân tích chi tiết <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="animate-fade-up" style={{ animationDelay: '150ms' }}>
          <CardHeader title="Hoạt động tuần này" subtitle="Phút học mỗi ngày" icon={<CalendarDays />} />
          <MiniBars data={DAILY_ACTIVITY.map((d, i) => ({ label: WEEKDAY_LABELS[i], value: d.minutes, tone: d.minutes === 0 ? 'slate' : 'indigo' }))} height={110} />
          <p className="text-xs text-slate-500 mt-3">
            Tổng <b className="text-slate-800">{DAILY_ACTIVITY.reduce((a, d) => a + d.minutes, 0)} phút</b> · {DAILY_ACTIVITY.reduce((a, d) => a + d.questions, 0)} câu hỏi
          </p>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <CardHeader title="Cần ôn hôm nay" subtitle="Lịch ôn ngắt quãng SM-2" icon={<RotateCcw />} action={<Button size="xs" variant="soft" to="/app/review">Ôn ngay</Button>} />
          <div className="space-y-2">
            {dueMistakes.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{m.question.stem}</p>
                  <Badge tone={MISTAKE_CAUSE_LABEL[m.cause].tone} size="xs" className="mt-1">
                    {MISTAKE_CAUSE_LABEL[m.cause].label}
                  </Badge>
                </div>
              </div>
            ))}
            {dueVocab.slice(0, 2).map((v) => (
              <div key={v.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                <p className="text-xs font-semibold text-slate-800">
                  {v.word} <span className="text-slate-400 font-normal">· {v.meaningVi}</span>
                </p>
              </div>
            ))}
            {dueMistakes.length + dueVocab.length > 5 && <p className="text-[11px] text-slate-400 text-center">+{dueMistakes.length + dueVocab.length - 5} mục khác</p>}
          </div>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '250ms' }}>
          <CardHeader title="Huy hiệu mới" subtitle="Thành tích gần đây" icon={<Award />} action={<Link to="/app/achievements" className="text-xs font-bold text-indigo-600 hover:underline">Tất cả</Link>} />
          <div className="space-y-2">
            {earned.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 transition animate-pop" style={{ animationDelay: `${300 + i * 80}ms` }}>
                <span className="text-2xl">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">{a.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{a.description}</p>
                </div>
                <Badge tone={a.rarity === 'EPIC' ? 'violet' : a.rarity === 'RARE' ? 'sky' : 'slate'} size="xs" className="ml-auto">
                  {a.rarity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <CardHeader title="Đề thi gợi ý cho bạn" subtitle="Phù hợp mức 650–750" icon={<FileText />} action={<Link to="/app/mock-tests" className="text-xs font-bold text-indigo-600 hover:underline">Kho đề</Link>} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MOCK_TESTS.slice(0, 3).map((t, i) => (
              <Link key={t.id} to={`/app/mock-tests/${t.id}`} className="group block p-4 rounded-2xl border border-slate-200 card-hover animate-fade-up" style={{ animationDelay: `${350 + i * 70}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <Badge tone={t.examType === 'TOEIC' ? 'indigo' : 'emerald'} size="xs">
                    {t.examType}
                  </Badge>
                  {t.isFree ? (
                    <Badge tone="emerald" size="xs">
                      Free
                    </Badge>
                  ) : (
                    <Badge tone="amber" size="xs">
                      VIP
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition line-clamp-2">{t.title}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t.totalQuestions} câu · {t.durationMinutes} phút · {formatNumber(t.attempts)} lượt
                </p>
              </Link>
            ))}
          </div>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '350ms' }}>
          <CardHeader title="Chuỗi chuyên cần" subtitle="16 tuần gần nhất" icon={<Flame />} />
          <Heatmap data={HEATMAP_DATA} weeks={16} />
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
            <span>Ít</span>
            <div className="flex gap-1">
              {['bg-slate-100', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600', 'bg-indigo-800'].map((c) => (
                <span key={c} className={cn('w-3 h-3 rounded-[3px]', c)} />
              ))}
            </div>
            <span>Nhiều</span>
          </div>
          <ProgressBar value={72} label="Chỉ số chuyên cần tháng" showValue tone="amber" size="sm" className="mt-4" />
        </Card>
      </div>
    </div>
  );
};
