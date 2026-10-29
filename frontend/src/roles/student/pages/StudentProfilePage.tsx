import React from 'react';
import { User, Flame, Zap, Award, Target, Calendar, Pencil, FileText, BookOpen, CheckCircle2, Trophy } from 'lucide-react';
import { MOCK_ACHIEVEMENTS } from '@/shared/mocks';
import { formatDate, ROLE_LABEL } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, StatCard, Timeline, ProgressBar } from '@/shared/components/ui';

export const StudentProfilePage: React.FC = () => {
  useDocumentTitle('Hồ sơ cá nhân');
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  const earned = MOCK_ACHIEVEMENTS.filter((a) => a.earned);
  const daysLeft = user.target?.examDate ? Math.max(0, Math.ceil((new Date(user.target.examDate).getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ cá nhân"
        icon={<User />}
        actions={
          <Button to="/app/settings" variant="outline" leftIcon={<Pencil className="w-4 h-4" />}>
            Chỉnh sửa
          </Button>
        }
      />

      <Card className="relative overflow-hidden animate-fade-up" padding="none">
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 relative">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />
        </div>
        <div className="px-6 pb-6 -mt-10 flex flex-col md:flex-row md:items-end gap-4">
          <Avatar name={user.fullName} size="xl" ring className="shrink-0" />
          <div className="flex-1 md:pb-1">
            <h2 className="text-2xl font-black text-slate-900">{user.fullName}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge tone="indigo">{ROLE_LABEL[user.role]}</Badge>
              <Badge tone={user.plan === 'VIP' ? 'amber' : 'slate'}>{user.plan === 'VIP' ? 'VIP Member' : 'Gói Free'}</Badge>
              <Badge tone="slate" icon={<Calendar className="w-3 h-3" />}>
                Tham gia {formatDate(user.joinedAt)}
              </Badge>
            </div>
          </div>
          {user.target && (
            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 md:min-w-[220px]">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                <Target className="w-3 h-3" /> Mục tiêu
              </p>
              <p className="text-xl font-black text-slate-900 mt-1">
                {user.target.examType} {user.target.score}
              </p>
              {daysLeft !== null && <p className="text-xs text-slate-500">Còn {daysLeft} ngày tới kỳ thi · {formatDate(user.target.examDate!)}</p>}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Chuỗi ngày học" value={user.streak} suffix="ngày" icon={<Flame />} tone="amber" />
        <StatCard label="Điểm nỗ lực" value={user.effortPoints} icon={<Zap />} tone="indigo" delta={8} deltaLabel="tuần này" />
        <StatCard label="Huy hiệu" value={earned.length} suffix={`/ ${MOCK_ACHIEVEMENTS.length}`} icon={<Award />} tone="violet" />
        <StatCard label="Điểm thi thử tốt nhất" value={715} icon={<Trophy />} tone="emerald" hint="ETS 2024 Test 1" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardHeader title="Huy hiệu đã đạt" subtitle={`${earned.length} huy hiệu`} icon={<Award />} action={<Button to="/app/achievements" size="xs" variant="ghost">Xem tất cả</Button>} />
          <div className="grid grid-cols-2 gap-3">
            {earned.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 animate-pop" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="text-2xl">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{a.title}</p>
                  <p className="text-[11px] text-slate-500">{a.earnedAt ? formatDate(a.earnedAt) : ''}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ProgressBar value={(earned.length / MOCK_ACHIEVEMENTS.length) * 100} label="Tiến độ sưu tập" showValue tone="violet" size="sm" />
          </div>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
          <CardHeader title="Hoạt động gần đây" subtitle="Dòng thời gian học tập" icon={<Calendar />} />
          <Timeline
            items={[
              { id: 't1', title: 'Đạt 715 điểm — ETS 2024 Test 1', description: 'Listening 380 · Reading 335', time: '25/10', tone: 'emerald', icon: <Trophy /> },
              { id: 't2', title: 'Hoàn thành Part 5 — 30 câu tốc độ', description: '24/30 câu đúng · 12 phút', time: '22/10', tone: 'indigo', icon: <FileText /> },
              { id: 't3', title: 'Ôn 18 thẻ flashcard chủ đề Office', description: 'Nhớ tốt 15/18 thẻ', time: '21/10', tone: 'violet', icon: <BookOpen /> },
              { id: 't4', title: 'Giải quyết 5 câu trong Sổ tay lỗi sai', description: 'Chủ đề: Word Form, Preposition', time: '20/10', tone: 'amber', icon: <CheckCircle2 /> },
              { id: 't5', title: 'Mở khoá huy hiệu "Cú đêm chăm chỉ"', description: 'Học sau 22h trong 5 ngày', time: '30/09', tone: 'rose', icon: <Award /> },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};
