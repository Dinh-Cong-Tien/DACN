import React from 'react';
import { User, Flame, Zap, Award, Target, Calendar, Pencil, FileText, Trophy } from 'lucide-react';
import { useAchievements, useAttempts, useProgress } from '@/shared/api/learner';
type TimelineItem = React.ComponentProps<typeof Timeline>['items'][number];
import { cn, formatDate, ROLE_LABEL } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, StatCard, Timeline, ProgressBar } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';

const TILTS = ['tilt-1', 'tilt-2', 'tilt-3'];

export const StudentProfilePage: React.FC = () => {
  useDocumentTitle('Hồ sơ cá nhân');
  const user = useAuthStore((s) => s.user);
  const { data: achievements = [] } = useAchievements();
  const { data: progress } = useProgress();
  const { data: history } = useAttempts({ pageSize: 5 });
  if (!user) return null;
  const earned = achievements.filter((a) => a.earned);
  const best = progress?.totals.bestToeic ?? null;
  // Dòng thời gian từ dữ liệu thật: lượt làm bài gần nhất + huy hiệu đã đạt
  const timeline: (TimelineItem & { at: string })[] = [
    ...(history?.items ?? []).map((a) => ({
      id: a.id,
      title: `${a.testTitle} — ${a.score}/${a.maxScore}`,
      description: `${a.correct}/${a.total} câu đúng${a.listening !== undefined ? ` · Listening ${a.listening} · Reading ${a.reading ?? 0}` : ''}`,
      time: formatDate(a.date, { day: '2-digit', month: '2-digit' }),
      tone: 'indigo' as const,
      icon: <FileText />,
      at: a.date,
    })),
    ...earned.map((a) => ({ id: a.id, title: `Mở khoá huy hiệu "${a.title}"`, description: a.description, time: a.earnedAt ? formatDate(a.earnedAt, { day: '2-digit', month: '2-digit' }) : '', tone: 'sky' as const, icon: <Award />, at: a.earnedAt ?? '' })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);
  const daysLeft = user.target?.examDate ? Math.max(0, Math.ceil((new Date(user.target.examDate).getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Hồ sơ <span className="mark">cá nhân</span>
          </>
        }
        icon={<User />}
        actions={
          <Button to="/app/settings" variant="outline" leftIcon={<Pencil className="w-4 h-4" />}>
            Chỉnh sửa
          </Button>
        }
      />

      <Card hard className="relative overflow-hidden animate-fade-up" padding="none">
        <div className="relative h-40 md:h-48 border-b-2 border-slate-900">
          <Img src={PHOTOS.campus} alt="Ảnh bìa" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-300" />
          <div className="absolute inset-0 bg-slate-900/20" />
          <span className="absolute top-4 right-4 sticker tilt-2 !bg-amber-300">Học viên từ {formatDate(user.joinedAt, { month: '2-digit', year: 'numeric' })}</span>
        </div>
        <div className="px-6 pb-6 -mt-12 flex flex-col md:flex-row md:items-end gap-4">
          <div className="rounded-full border-[3px] border-slate-900 bg-white p-1 shadow-hard w-fit">
            <Avatar name={user.fullName} src={user.avatarUrl} size="xl" />
          </div>
          <div className="flex-1 md:pb-1">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">{user.fullName}</h2>
            <p className="text-sm text-slate-600 font-semibold">{user.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge tone="indigo">{ROLE_LABEL[user.role]}</Badge>
              <Badge tone={user.plan === 'VIP' ? 'amber' : 'slate'}>{user.plan === 'VIP' ? 'VIP Member' : 'Gói Free'}</Badge>
              <Badge tone="slate" icon={<Calendar className="w-3 h-3" />}>
                Tham gia {formatDate(user.joinedAt)}
              </Badge>
            </div>
          </div>
          {user.target && (
            <div className="rounded-2xl bg-slate-900 text-white border-2 border-slate-900 p-4 md:min-w-[230px] shadow-hard-coral">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Target className="w-3 h-3" /> Mục tiêu
              </p>
              <p className="font-display text-2xl font-extrabold mt-1">
                {user.target.examType} {user.target.score}
              </p>
              {daysLeft !== null && (
                <p className="text-xs text-slate-300">
                  Còn <b className="text-white">{daysLeft} ngày</b> · thi {formatDate(user.target.examDate!)}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Chuỗi ngày học" value={user.streak} suffix="ngày" icon={<Flame />} tone="amber" />
        <StatCard label="Điểm nỗ lực" value={progress?.totals.xp ?? user.effortPoints} icon={<Zap />} tone="indigo" />
        <StatCard label="Huy hiệu" value={earned.length} suffix={`/ ${achievements.length}`} icon={<Award />} tone="violet" />
        <StatCard label="Điểm thi thử tốt nhất" value={best ?? 0} icon={<Trophy />} tone="emerald" hint={best === null ? 'Chưa làm đề TOEIC full' : 'TOEIC full test'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card hard className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardHeader
            title="Huy hiệu đã đạt"
            subtitle={`${earned.length} huy hiệu`}
            icon={<Award />}
            action={
              <Button to="/app/achievements" size="xs" variant="ghost">
                Xem tất cả
              </Button>
            }
          />
          <div className="grid grid-cols-2 gap-3">
            {earned.length === 0 && <p className="col-span-2 text-sm text-slate-500">Chưa có huy hiệu nào.</p>}
            {earned.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-900 bg-amber-50 animate-pop" style={{ animationDelay: `${i * 80}ms` }}>
                <span className={cn('w-11 h-11 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-2xl shrink-0', TILTS[i % 3])}>{a.icon}</span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-slate-900 truncate">{a.title}</p>
                  <p className="text-[11px] text-slate-500">{a.earnedAt ? formatDate(a.earnedAt) : ''}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ProgressBar value={(earned.length / Math.max(1, achievements.length)) * 100} label="Tiến độ sưu tập" showValue tone="violet" size="sm" />
          </div>
        </Card>
        <Card hard className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Hoạt động gần đây" subtitle="Dòng thời gian học tập" icon={<Calendar />} />
          {timeline.length ? <Timeline items={timeline} /> : <p className="text-sm text-slate-500">Chưa có hoạt động. Bài làm và huy hiệu sẽ hiện ở đây.</p>}
        </Card>
      </div>
    </div>
  );
};
