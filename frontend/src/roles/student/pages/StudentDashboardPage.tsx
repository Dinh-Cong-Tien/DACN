import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Play, Clock, BookOpen, AlertTriangle, RotateCcw, Trophy, ChevronRight, CalendarDays, Target } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Badge, Button, Card, ProgressBar, MiniBars, Sparkline, Heatmap, Avatar, AvatarGroup } from '@/shared/components/ui';
import { Stagger, CountUp, Reveal } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { LEARNING_PATH, DAILY_ACTIVITY, WEEKDAY_LABELS, SCORE_HISTORY, MOCK_MISTAKES, MOCK_VOCAB, MOCK_TESTS, MOCK_ACHIEVEMENTS, HEATMAP_DATA, MISTAKE_CAUSE_LABEL, MOCK_LEADERBOARD } from '@/shared/mocks';
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
  const milestone = LEARNING_PATH.find((m) => m.status === 'CURRENT') ?? LEARNING_PATH[0];
  const item = milestone.items.find((i) => i.status === 'CURRENT') ?? milestone.items[0];
  const earned = MOCK_ACHIEVEMENTS.filter((a) => a.earned).slice(-4);
  const daysLeft = user?.target?.examDate ? Math.max(0, Math.ceil((new Date(user.target.examDate).getTime() - now) / 86400000)) : null;
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
  const firstName = (user?.fullName ?? 'bạn').split(' ').slice(-1)[0];
  const peers = MOCK_LEADERBOARD.filter((p) => !p.isMe).slice(0, 5);
  const totalMin = DAILY_ACTIVITY.reduce((a, d) => a + d.minutes, 0);
  const suggested = MOCK_TESTS.filter((t) => t.examType === (user?.target?.examType ?? 'TOEIC')).slice(0, 3);

  return (
    <div className="space-y-10">
      {/* ===== Chào + số liệu hôm nay (một dải, không hộp màu) ===== */}
      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-end animate-fade-up">
        <div className="space-y-4">
          <p className="text-sm font-bold text-indigo-700 capitalize">
            {greeting()} · {today}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
            {firstName} ơi, hôm nay học <span className="mark">45 phút</span> nhé.
          </h1>
          <p className="text-base text-slate-500 max-w-xl">
            Mục tiêu <b className="text-slate-900">{user?.target?.examType ?? 'TOEIC'} {user?.target?.score ?? '750'}</b>
            {daysLeft !== null && (
              <>
                {' '}· còn <b className="text-slate-900">{daysLeft} ngày</b> tới kỳ thi
              </>
            )}
            . Bạn đang ở {milestone.title.toLowerCase()}, đúng nhịp so với lộ trình.
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
            { label: 'Chuỗi ngày học', value: user?.streak ?? 0, suffix: 'ngày', icon: <Flame className="w-4 h-4 text-violet-500 fill-violet-500" />, sub: '+2 so với tuần trước' },
            { label: 'Điểm gần nhất', value: 715, suffix: '/990', icon: <Trophy className="w-4 h-4 text-amber-500" />, sub: 'ETS 2024 Test 1' },
            { label: 'Cần ôn hôm nay', value: dueMistakes.length + dueVocab.length, suffix: 'mục', icon: <RotateCcw className="w-4 h-4 text-indigo-600" />, sub: 'theo lịch SM-2' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {s.icon}
                {s.label}
              </div>
              <p className="font-display text-3xl font-extrabold text-slate-900 mt-2 leading-none">
                <CountUp value={s.value} />
                <span className="font-sans text-xs font-semibold text-slate-400 ml-1">{s.suffix}</span>
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
                <p className="font-display text-5xl font-extrabold text-slate-900 mt-2 leading-none">715</p>
                <p className="text-sm text-slate-500 mt-2">
                  từ 520 điểm · <span className="text-emerald-700 font-bold">+195</span> sau 7 lần
                </p>
              </div>
              <Badge tone="emerald">Đang tăng</Badge>
            </div>
            <Sparkline data={SCORE_HISTORY} width={320} height={90} tone="indigo" className="w-full mt-4 [&>svg]:w-full" />
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
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Phù hợp mức 650–750</p>
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
            <MiniBars data={DAILY_ACTIVITY.map((d, i) => ({ label: WEEKDAY_LABELS[i], value: d.minutes, tone: d.minutes >= 60 ? 'violet' : 'indigo' }))} height={130} />
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
              {earned.map((a, i) => (
                <div key={a.id} className="text-center animate-pop" style={{ animationDelay: `${i * 90}ms` }} title={a.description}>
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-2xl shadow-inner">{a.icon}</div>
                  <p className="text-[11px] font-semibold text-slate-700 mt-2 leading-tight">{a.title}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-slate-900/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600 inline-flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Chiến binh 30 ngày
                </span>
                <span className="font-bold text-slate-900">12/30</span>
              </div>
              <ProgressBar value={40} size="sm" tone="amber" />
            </div>
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
              <Badge tone="indigo">72% ngày có học</Badge>
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
              <p className="text-sm text-slate-500 mt-1">Đang học ngay lúc này</p>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <AvatarGroup names={peers.map((p) => p.name)} srcs={peers.map((p) => p.avatarUrl)} size="md" max={5} />
              <span className="text-sm font-semibold text-slate-700">+128 người khác</span>
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
