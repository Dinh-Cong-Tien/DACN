import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, FileText, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { useAttempts, useProgress } from '@/shared/api/learner';
import type { AttemptSummary } from '@/shared/types';
import { formatDate, formatDuration } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { Badge, Card, CardHeader, Column, DataTable, Heatmap, MiniBars, PageHeader, ProgressBar, RadarChart, Segmented, Sparkline, StatCard } from '@/shared/components/ui';
import { Reveal } from '@/shared/components/motion';

export const StudentProgressPage: React.FC = () => {
  useDocumentTitle('Tiến độ & Phân tích');
  const user = useAuthStore((s) => s.user);
  const [range, setRange] = useState('7');
  const { data: progress } = useProgress();
  const { data: history } = useAttempts({ pageSize: 100 });
  const SCORE_HISTORY = progress?.scoreHistory ?? [];
  const DAILY_ACTIVITY = progress?.dailyActivity ?? [];
  const HEATMAP_DATA = progress?.heatmap ?? {};
  const RADAR_SKILLS = progress?.radar ?? [];
  const SKILL_SCORES = progress?.skillScores ?? [];
  // Lượt làm bài trong khoảng thời gian đang chọn
  const since = Date.now() - Number(range) * 86400000;
  const attemptList = (history?.items ?? []).filter((a) => new Date(a.date).getTime() >= since);
  const current = SCORE_HISTORY[SCORE_HISTORY.length - 1] ?? 0;
  const prev = SCORE_HISTORY[SCORE_HISTORY.length - 2];
  // Chỉ có mục tiêu khi học viên đã đặt điểm TOEIC (không tự gán 750)
  const target = user?.target?.examType === 'TOEIC' ? Number(user.target.score) || null : null;
  const totalMinutes = DAILY_ACTIVITY.reduce((a, d) => a + d.minutes, 0);
  const accuracy = attemptList.length ? Math.round((attemptList.reduce((a, x) => a + x.correct / Math.max(1, x.total), 0) / attemptList.length) * 100) : 0;

  const toneFor = (v: number) => (v >= 75 ? 'emerald' : v >= 60 ? 'amber' : 'violet');

  const cols: Column<AttemptSummary>[] = [
    {
      key: 'testTitle',
      header: 'Đề thi',
      render: (r) => (
        <Link to={r.testId ? `/app/mock-tests/${r.testId}/result?attempt=${r.id}` : '/app/practice'} className="font-bold text-slate-900 hover:text-indigo-700 underline-offset-2 hover:underline">
          {r.testTitle}
        </Link>
      ),
    },
    { key: 'examType', header: 'Loại', render: (r) => <Badge tone={r.examType === 'TOEIC' ? 'indigo' : 'emerald'}>{r.examType}</Badge> },
    { key: 'score', header: 'Điểm', align: 'center', render: (r) => <span className="font-display font-extrabold text-indigo-700 text-base">{r.score}</span> },
    { key: 'correct', header: 'Đúng', align: 'center', render: (r) => `${r.correct}/${r.total}` },
    { key: 'durationSec', header: 'Thời gian', align: 'center', render: (r) => formatDuration(r.durationSec) },
    { key: 'date', header: 'Ngày', align: 'right', render: (r) => <span className="text-slate-500">{formatDate(r.date)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Tiến độ & <span className="mark">Phân tích</span>
          </>
        }
        icon={<TrendingUp />}
        description="Theo dõi điểm số, độ chính xác theo từng Part và thói quen học tập."
        actions={<Segmented options={[{ value: '7', label: '7 ngày' }, { value: '30', label: '30 ngày' }]} value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Điểm hiện tại" value={current} suffix={target ? `/ ${target}` : undefined} icon={<Target />} tone="indigo" delta={prev ? Math.round(((current - prev) / prev) * 100) : undefined} deltaLabel={prev ? 'so với lần trước' : undefined} hint={SCORE_HISTORY.length ? undefined : 'Chưa có đề TOEIC full'} />
        <StatCard label="Đề đã làm" value={attemptList.length} icon={<FileText />} tone="violet" hint={`${range} ngày gần nhất`} />
        <StatCard label="Giờ học tuần này" value={Math.round((totalMinutes / 60) * 10) / 10} suffix="h" icon={<Clock />} tone="emerald" hint={`${totalMinutes} phút trong 7 ngày`} />
        <StatCard label="Độ chính xác" value={accuracy} suffix="%" icon={<CheckCircle2 />} tone="amber" hint="trung bình các đề" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card hard className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Xu hướng điểm thi thử" subtitle={`${SCORE_HISTORY.length} lần gần nhất${target ? ` · mục tiêu ${target}` : ''}`} icon={<TrendingUp />} action={SCORE_HISTORY.length > 1 ? <span className="sticker tilt-2 !bg-emerald-200">{current - SCORE_HISTORY[0] >= 0 ? '+' : ''}{current - SCORE_HISTORY[0]} điểm</span> : undefined} />
          <div className="overflow-x-auto">
            <Sparkline data={SCORE_HISTORY.length > 1 ? SCORE_HISTORY : [0, 0]} width={640} height={160} className="w-full [&>svg]:w-full [&>svg]:h-auto" />
          </div>
          <div className="flex justify-between mt-2 text-[11px] font-semibold text-slate-500">
            {SCORE_HISTORY.map((s, i) => (
              <span key={i} className="text-center">
                <span className="block text-slate-900 font-extrabold">{s}</span>L{i + 1}
              </span>
            ))}
          </div>
          {target && (
            <div className="mt-4">
              <ProgressBar value={(current / target) * 100} label="Tiến tới mục tiêu" showValue tone="indigo" />
            </div>
          )}
        </Card>
        <Card hard tone="cream" className="animate-fade-up flex flex-col items-center" style={{ animationDelay: '80ms' }}>
          <CardHeader title="Bản đồ kỹ năng" subtitle="Điểm mạnh / yếu tổng quát" className="self-stretch" />
          <RadarChart data={RADAR_SKILLS} size={240} />
          {RADAR_SKILLS.some((s) => s.hasData === false) && <p className="text-[11px] text-slate-500 text-center">Chưa có dữ liệu: {RADAR_SKILLS.filter((s) => s.hasData === false).map((s) => s.label).join(', ')}</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Reveal>
          <Card hard>
            <CardHeader title="Độ chính xác theo Part" subtitle="Tỷ lệ đúng trong các bài luyện gần đây" />
            <div className="space-y-3">
              {SKILL_SCORES.map((s) => (
                <ProgressBar key={s.skill} value={(s.score / s.max) * 100} label={s.skill} showValue tone={toneFor(s.score)} size="sm" />
              ))}
            </div>
          </Card>
        </Reveal>
        <Reveal delay={80}>
          <Card hard>
            <CardHeader title="Thời gian học 7 ngày" subtitle={`Tổng ${totalMinutes} phút · ${DAILY_ACTIVITY.reduce((a, d) => a + d.questions, 0)} câu`} />
            <MiniBars data={DAILY_ACTIVITY.map((d) => ({ label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(`${d.date}T00:00:00`).getDay()], value: d.minutes, tone: d.minutes === 0 ? 'slate' : 'indigo' }))} height={140} />
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card hard>
          <CardHeader title="Lịch sử chuyên cần" subtitle="16 tuần gần nhất · càng đậm càng học nhiều" icon={<Calendar />} />
          <Heatmap data={HEATMAP_DATA} />
          <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500 font-semibold">
            Ít
            {['bg-slate-200', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600', 'bg-indigo-900'].map((c) => (
              <span key={c} className={`w-3 h-3 rounded-[3px] ${c}`} />
            ))}
            Nhiều
          </div>
        </Card>
      </Reveal>

      <Reveal>
        <Card hard padding="none">
          <div className="p-5 pb-0">
            <CardHeader title="Lịch sử thi thử" subtitle="Nhấn vào đề để xem phân tích chi tiết" />
          </div>
          <DataTable columns={cols} rows={attemptList} emptyTitle="Chưa có lượt làm bài" emptyDescription="Làm một bài luyện tập hoặc đề thi thử để xem lịch sử ở đây." className="border-0 rounded-none rounded-b-2xl border-t-2 !border-t-slate-900" />
        </Card>
      </Reveal>
    </div>
  );
};
