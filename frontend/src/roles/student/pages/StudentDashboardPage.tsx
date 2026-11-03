import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Play, Clock, BookOpen, AlertTriangle, RotateCcw, Trophy, ChevronRight, CalendarDays, Target } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Badge, Button, Card, ProgressBar, MiniBars, Sparkline, Heatmap, Avatar, AvatarGroup } from '@/shared/components/ui';
import { Stagger, CountUp, Reveal } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { MISTAKE_CAUSE_LABEL } from '@/shared/constants/student';
import { useAchievements, useAttempts, useLeaderboard, usePath, useProgress, useReviewDue, useTests } from '@/shared/api/learner';
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
  const { data: due } = useReviewDue();
  const { data: path } = usePath();
  const { data: progress } = useProgress();
  const { data: achievements = [] } = useAchievements();
  const { data: board } = useLeaderboard('week');
  const { data: allTests = [] } = useTests();
  const { data: fullHistory } = useAttempts({ mode: 'FULL', pageSize: 20 });
  const dueMistakes = due?.mistakes ?? [];
  const dueVocab = due?.words ?? [];
  const LEARNING_PATH = path?.milestones ?? [];
  // Chưa có lộ trình → gợi ý đặt mục tiêu
  const milestone = LEARNING_PATH.find((m) => m.status === 'CURRENT') ?? LEARNING_PATH[0] ?? { title: 'Chặng khởi động', subtitle: 'Chưa có lộ trình', description: 'Đặt mục tiêu và làm bài xếp lớp để hệ thống lập lộ trình học riêng cho bạn.', progress: 0, items: [] };
  const item = milestone.items.find((i) => i.status === 'CURRENT') ?? milestone.items[0] ?? { title: 'Đặt mục tiêu học', link: '/onboarding/goal', durationMin: 5, skill: 'Bắt đầu' };
  const earned = achievements.filter((a) => a.earned).slice(-4);
  const nextBadge = achievements.filter((a) => !a.earned && a.total).sort((a, b) => (b.progress ?? 0) / (b.total ?? 1) - (a.progress ?? 0) / (a.total ?? 1))[0];
  const SCORE_HISTORY = progress?.scoreHistory ?? [];
  const DAILY_ACTIVITY = progress?.dailyActivity ?? [];
  const HEATMAP_DATA = progress?.heatmap ?? {};
  // điểm đề full gần nhất theo kỳ thi mục tiêu của học viên (VSTEP thang 10, TOEIC thang 990)
  const goalExam = user?.target?.examType ?? 'TOEIC';
  const lastFull = fullHistory?.items.find((a) => a.examType === goalExam && a.score != null);
  const activeDays = Object.values(HEATMAP_DATA).filter((m) => m > 0).length;
  const goalMinutes = progress?.totals.dailyGoalMinutes ?? 20;
  const daysLeft = user?.target?.examDate ? Math.max(0, Math.ceil((new Date(user.target.examDate).getTime() - now) / 86400000)) : null;
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
  const firstName = (user?.fullName ?? 'bạn').split(' ').slice(-1)[0];
  const peers = (board?.entries ?? []).filter((p) => !p.isMe).slice(0, 5);
  const totalMin = DAILY_ACTIVITY.reduce((a, d) => a + d.minutes, 0);
  const suggested = allTests.filter((t) => t.examType === (user?.target?.examType ?? 'TOEIC')).slice(0, 3);

  return (
    <div className="space-y-10">
      {/* ===== Chào + số liệu hôm nay (một dải, không hộp màu) ===== */}
      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-end animate-fade-up">
        <div className="space-y-4">
          <p className="text-sm font-bold text-indigo-700 capitalize">
            {greeting()} · {today}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
            {firstName} ơi, hôm nay học <span className="mark">{goalMinutes} phút</span> nhé.
          </h1>
          <p className="text-base text-slate-500 max-w-xl">
            {user?.target ? (
              <>
                Mục tiêu <b className="text-slate-900">{user.target.examType} {user.target.score}</b>
                {daysLeft !== null && (
                  <>
                    {' '}· còn <b className="text-slate-900">{daysLeft} ngày</b> tới kỳ thi
                  </>
                )}
                {LEARNING_PATH.length ? `. Bạn đang ở ${milestone.title.toLowerCase()}.` : '.'}
              </>
            ) : (
              'Bạn chưa đặt mục tiêu. Đặt mục tiêu để nhận lộ trình học riêng.'
            )}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button variant="gradient" size="lg" to={item.link} leftIcon={<Play className="w-4 h-4" />}>
              Học tiếp: {item.title}
            </Button>
            <Button variant="outline" size="lg" to="/app/mock-tests">
              Làm đề thi thử
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-900/10 p-2 grid grid-cols-3 divide-x divide-slate-900/10">
          {[
            { label: 'Chuỗi ngày học', value: user?.streak ?? 0, suffix: 'ngày', icon: <Flame className="w-4 h-4 text-violet-500 fill-violet-500" />, sub: `Dài nhất ${progress?.totals.longestStreak ?? 0} ngày` },
            { label: 'Điểm gần nhất', value: lastFull?.score ?? null, suffix: goalExam === 'VSTEP' ? '/10' : '/990', icon: <Trophy className="w-4 h-4 text-amber-500" />, sub: lastFull?.testTitle ?? 'Chưa làm đề full' },
            { label: 'Cần ôn hôm nay', value: dueMistakes.length + dueVocab.length, suffix: 'mục', icon: <RotateCcw className="w-4 h-4 text-indigo-600" />, sub: 'theo lịch SM-2' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {s.icon}
                {s.label}
              </div>
              <p className="font-display text-3xl font-extrabold text-slate-900 mt-2 leading-none">
                {s.value === null ? '—' : <CountUp value={s.value} />}
                {s.value !== null && <span className="font-sans text-xs font-semibold text-slate-400 ml-1">{s.suffix}</span>}
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5 truncate">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Tiếp tục học (khối nhấn duy nhất) + điểm thi thử ===== */}
      <section className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-indigo-600 text-white grid md:grid-cols-[1fr_300px] min-h-[300px]">
            <div aria-hidden className="absolute inset-0 bg-dots opacity-15" />
            <div className="relative p-7 md:p-9 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <span className="sticker !bg-amber-300 !shadow-none !border-transparent">
                  {milestone.title} · {milestone.subtitle}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">Tiếp tục: {item.title}</h2>
                <p className="text-indigo-100 text-sm max-w-md leading-relaxed">{milestone.description}</p>
                <div className="flex items-center gap-4 text-xs text-indigo-100">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {item.durationMin} phút
                  </span>
                  <span>· {item.skill}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Tiến độ chặng</span>
                  <span>{milestone.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-amber-300 rounded-full transition-[width] duration-1000 ease-spring" style={{ width: `${milestone.progress}%` }} />
                </div>
                <Button variant="white" size="md" to={item.link} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Học ngay
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <Img src={PHOTOS.studying} alt="Học viên đang học" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-600/20 to-transparent" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Card className="h-full flex flex-col justify-between" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Điểm thi thử</p>
                <p className="font-display text-5xl font-extrabold text-slate-900 mt-2 leading-none">{SCORE_HISTORY.at(-1) ?? '—'}</p>
                <p className="text-sm text-slate-500 mt-2">
                  {SCORE_HISTORY.length > 1 ? (
                    <>
                      từ {SCORE_HISTORY[0]} điểm ·{' '}
                      <span className={SCORE_HISTORY.at(-1)! >= SCORE_HISTORY[0] ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {SCORE_HISTORY.at(-1)! >= SCORE_HISTORY[0] ? '+' : ''}
                        {SCORE_HISTORY.at(-1)! - SCORE_HISTORY[0]}
                      </span>{' '}
                      sau {SCORE_HISTORY.length} lần
                    </>
                  ) : SCORE_HISTORY.length === 1 ? (
                    'Sau 1 lần thi thử'
                  ) : (
                    'Làm một đề TOEIC full để xem điểm quy đổi'
                  )}
                </p>
              </div>
              {SCORE_HISTORY.length > 1 && <Badge tone={SCORE_HISTORY.at(-1)! >= SCORE_HISTORY[0] ? 'emerald' : 'amber'}>{SCORE_HISTORY.at(-1)! >= SCORE_HISTORY[0] ? 'Đang tăng' : 'Cần cố gắng'}</Badge>}
            </div>
            <Sparkline data={SCORE_HISTORY.length > 1 ? SCORE_HISTORY : [0, 0]} width={320} height={90} tone="indigo" className="w-full mt-4 [&>svg]:w-full" />
            <Link to="/app/progress" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:gap-2 transition-all mt-3">
              Xem phân tích chi tiết <ChevronRight className="w-4 h-4" />
            </Link>
          </Card>
        </Reveal>
      </section>

      {/* ===== Đề thi gợi ý (card ảnh như trang chủ) ===== */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">{user?.target ? `Mục tiêu ${user.target.examType} ${user.target.score}` : 'Đề mới trong kho'}</p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Đề thi gợi ý cho bạn</h2>
          </div>
          <Link to="/app/mock-tests" className="text-sm font-bold text-slate-700 hover:text-indigo-700 inline-flex items-center gap-1">
            Kho đề <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Stagger className="grid md:grid-cols-3 gap-5">
          {suggested.map((t) => (
            <Link key={t.id} to={`/app/mock-tests/${t.id}`} className="group block rounded-3xl overflow-hidden bg-white border border-slate-900/10 card-hover">
              <div className="relative">
                <Img src={t.coverUrl ?? PHOTOS.notes} alt={t.title} ratio="video" fallbackClass="bg-indigo-100" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge tone="slate" solid size="xs">
                    {t.examType}
                  </Badge>
                  {!t.isFree && (
                    <Badge tone="amber" solid size="xs">
                      VIP
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors">{t.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5">
                  {t.totalQuestions} câu · {t.durationMinutes} phút · {formatNumber(t.attempts)} lượt
                </p>
              </div>
            </Link>
          ))}
        </Stagger>
      </section>

      {/* ===== Hoạt động · Cần ôn · Huy hiệu ===== */}
      <section className="grid lg:grid-cols-3 gap-6">
        <Reveal>
          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Hoạt động tuần này</h3>
                <p className="text-sm text-slate-500">Phút học mỗi ngày</p>
              </div>
              <CalendarDays className="w-5 h-5 text-slate-400" />
            </div>
            <MiniBars data={DAILY_ACTIVITY.map((d) => ({ label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(`${d.date}T00:00:00`).getDay()], value: d.minutes, tone: d.minutes >= 60 ? 'violet' : 'indigo' }))} height={130} />
            <p className="text-sm text-slate-600 mt-4">
              Tổng <b className="text-slate-900">{totalMin} phút</b> · {DAILY_ACTIVITY.reduce((a, d) => a + d.questions, 0)} câu hỏi
            </p>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Cần ôn hôm nay</h3>
                <p className="text-sm text-slate-500">Lịch ôn ngắt quãng SM-2</p>
              </div>
              <Button size="xs" variant="soft" to="/app/review">
                Ôn ngay
              </Button>
            </div>
            <ul className="divide-y divide-slate-900/10">
              {dueMistakes.length + dueVocab.length === 0 && <li className="py-3 text-sm text-slate-500">Không có mục nào cần ôn hôm nay.</li>}
              {dueMistakes.slice(0, 3).map((m) => (
                <li key={m.id} className="py-3 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{m.question.stem}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{MISTAKE_CAUSE_LABEL[m.cause].label}</p>
                  </div>
                </li>
              ))}
              {dueVocab.slice(0, 2).map((v) => (
                <li key={v.id} className="py-3 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </span>
                  <p className="text-sm text-slate-800 min-w-0 truncate">
                    <b>{v.word}</b> <span className="text-slate-500">· {v.meaningVi}</span>
                  </p>
                </li>
              ))}
            </ul>
            {dueMistakes.length + dueVocab.length > 5 && <p className="text-xs text-slate-500 mt-2">+{dueMistakes.length + dueVocab.length - 5} mục khác</p>}
          </Card>
        </Reveal>

        <Reveal delay={160}>
          <Card className="h-full">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Huy hiệu mới</h3>
                <p className="text-sm text-slate-500">Thành tích gần đây</p>
              </div>
              <Link to="/app/achievements" className="text-xs font-bold text-indigo-700">
                Tất cả
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {earned.length === 0 && <p className="col-span-4 text-sm text-slate-500">Chưa có huy hiệu. Hoàn thành bài thi đầu tiên để nhận huy hiệu đầu tiên.</p>}
              {earned.map((a, i) => (
                <div key={a.id} className="text-center animate-pop" style={{ animationDelay: `${i * 90}ms` }} title={a.description}>
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-2xl shadow-inner">{a.icon}</div>
                  <p className="text-[11px] font-semibold text-slate-700 mt-2 leading-tight">{a.title}</p>
                </div>
              ))}
            </div>
            {nextBadge && (
              <div className="mt-5 pt-5 border-t border-slate-900/10">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-600 inline-flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> {nextBadge.title}
                  </span>
                  <span className="font-bold text-slate-900">
                    {Math.min(nextBadge.progress ?? 0, nextBadge.total ?? 0)}/{nextBadge.total}
                  </span>
                </div>
                <ProgressBar value={((nextBadge.progress ?? 0) / (nextBadge.total ?? 1)) * 100} size="sm" tone="amber" />
              </div>
            )}
          </Card>
        </Reveal>
      </section>

      {/* ===== Chuyên cần + bạn học ===== */}
      <section className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Reveal>
          <Card>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Chuỗi chuyên cần</h3>
                <p className="text-sm text-slate-500">16 tuần gần nhất · mỗi ô là một ngày</p>
              </div>
              <Badge tone="indigo">{Math.round((activeDays / (16 * 7)) * 100)}% ngày có học</Badge>
            </div>
            <Heatmap data={HEATMAP_DATA} weeks={16} />
            <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
              Ít
              {['bg-slate-200', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600', 'bg-indigo-900'].map((c) => (
                <span key={c} className={cn('w-3 h-3 rounded-[3px]', c)} />
              ))}
              Nhiều
            </div>
          </Card>
        </Reveal>
        <Reveal delay={100}>
          <Card className="h-full flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg">Bạn học cùng mục tiêu</h3>
              <p className="text-sm text-slate-500 mt-1">Bảng xếp hạng tuần này</p>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <AvatarGroup names={peers.map((p) => p.name)} srcs={peers.map((p) => p.avatarUrl)} size="md" max={5} />
              <span className="text-sm font-semibold text-slate-700">{peers.length ? `${board?.entries.length ?? 0} người có điểm tuần này` : 'Chưa có ai ghi điểm tuần này'}</span>
            </div>
            <ul className="mt-5 space-y-2.5">
              {peers.slice(0, 3).map((p) => (
                <li key={p.name} className="flex items-center gap-3 text-sm">
                  <Avatar name={p.name} src={p.avatarUrl} size="xs" />
                  <span className="flex-1 truncate text-slate-700">{p.name}</span>
                  <span className="text-xs text-slate-500">{p.target}</span>
                </li>
              ))}
            </ul>
            <Link to="/app/leaderboard" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 mt-5 hover:gap-2 transition-all">
              Xem bảng vinh danh <ChevronRight className="w-4 h-4" />
            </Link>
          </Card>
        </Reveal>
      </section>
    </div>
  );
};
