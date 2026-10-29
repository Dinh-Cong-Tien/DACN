import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, FileText, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { DAILY_ACTIVITY, HEATMAP_DATA, MOCK_ATTEMPTS, RADAR_SKILLS, SCORE_HISTORY, SKILL_SCORES, WEEKDAY_LABELS } from '@/shared/mocks';
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
  const current = SCORE_HISTORY[SCORE_HISTORY.length - 1];
  const target = Number(user?.target?.score ?? 750) || 750;
  const totalMinutes = DAILY_ACTIVITY.reduce((a, d) => a + d.minutes, 0);
  const accuracy = Math.round((MOCK_ATTEMPTS.reduce((a, x) => a + x.correct / x.total, 0) / MOCK_ATTEMPTS.length) * 100);

  const toneFor = (v: number) => (v >= 75 ? 'emerald' : v >= 60 ? 'amber' : 'violet');

  const cols: Column<AttemptSummary>[] = [
    {
      key: 'testTitle',
      header: 'Đề thi',
      render: (r) => (
        <Link to={`/app/mock-tests/${r.testId}/result`} className="font-bold text-slate-900 hover:text-indigo-700 underline-offset-2 hover:underline">
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
        <StatCard label="Điểm hiện tại" value={current} suffix={`/ ${target}`} icon={<Target />} tone="indigo" delta={Math.round(((current - SCORE_HISTORY[SCORE_HISTORY.length - 2]) / SCORE_HISTORY[SCORE_HISTORY.length - 2]) * 100)} deltaLabel="so với lần trước" />
        <StatCard label="Đề đã làm" value={MOCK_ATTEMPTS.length} icon={<FileText />} tone="violet" hint={`${range} ngày gần nhất`} />
        <StatCard label="Giờ học tuần này" value={Math.round((totalMinutes / 60) * 10) / 10} suffix="h" icon={<Clock />} tone="emerald" delta={12} deltaLabel="so với tuần trước" />
        <StatCard label="Độ chính xác" value={accuracy} suffix="%" icon={<CheckCircle2 />} tone="amber" hint="trung bình các đề" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card hard className="xl:col-span-2 animate-fade-up">
          <CardHeader title="Xu hướng điểm thi thử" subtitle={`${SCORE_HISTORY.length} lần gần nhất · mục tiêu ${target}`} icon={<TrendingUp />} action={<span className="sticker tilt-2 !bg-emerald-200">+{current - SCORE_HISTORY[0]} điểm</span>} />
          <div className="overflow-x-auto">
            <Sparkline data={SCORE_HISTORY} width={640} height={160} className="w-full [&>svg]:w-full [&>svg]:h-auto" />
          </div>
          <div className="flex justify-between mt-2 text-[11px] font-semibold text-slate-500">
            {SCORE_HISTORY.map((s, i) => (
              <span key={i} className="text-center">
                <span className="block text-slate-900 font-extrabold">{s}</span>L{i + 1}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <ProgressBar value={(current / target) * 100} label="Tiến tới mục tiêu" showValue tone="indigo" />
          </div>
        </Card>
        <Card hard tone="cream" className="animate-fade-up flex flex-col items-center" style={{ animationDelay: '80ms' }}>
          <CardHeader title="Bản đồ kỹ năng" subtitle="Điểm mạnh / yếu tổng quát" className="self-stretch" />
          <RadarChart data={RADAR_SKILLS} size={240} />
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
            <MiniBars data={DAILY_ACTIVITY.map((d, i) => ({ label: WEEKDAY_LABELS[i], value: d.minutes, tone: d.minutes === 0 ? 'slate' : i === 4 ? 'violet' : 'indigo' }))} height={140} />
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
          <DataTable columns={cols} rows={MOCK_ATTEMPTS} className="border-0 rounded-none rounded-b-2xl border-t-2 !border-t-slate-900" />
        </Card>
      </Reveal>
    </div>
  );
};
