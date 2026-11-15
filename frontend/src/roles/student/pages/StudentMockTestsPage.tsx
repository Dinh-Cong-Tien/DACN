import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, Users, Lock, ArrowRight, History, Trophy } from 'lucide-react';
import { useDocumentTitle, useParamState } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, Chip, Column, DataTable, PageHeader } from '@/shared/components/ui';
import { TestCover } from '@/shared/components/media/TestCover';
import { Img } from '@/shared/components/media/Img';
import { useAttempts, useTests } from '@/shared/api/learner';
import type { AttemptSummary } from '@/shared/types';
import { cn, formatDate, formatDuration, formatNumber } from '@/shared/utils';
import { VipBadge, useIsVip } from '@/shared/components/vip/VipBadge';

type Filter = 'ALL' | 'FULL' | 'MINI' | 'FREE';

export const StudentMockTestsPage: React.FC = () => {
  const isVip = useIsVip();
  const navigate = useNavigate();
  // kỳ thi chọn từ menu TOEIC / VSTEP → trang chỉ hiện đề và lịch sử của kỳ thi đó
  const [tab] = useParamState('exam', ['TOEIC', 'VSTEP'], 'TOEIC');
  useDocumentTitle(`Đề thi thử ${tab}`);
  const [filter, setFilter] = useState<Filter>('ALL');
  React.useEffect(() => setFilter('ALL'), [tab]);
  const { data: testList = [], isLoading } = useTests();
  const { data: history } = useAttempts();
  const attemptList = (history?.items ?? []).filter((a) => a.examType === tab);
  const best = attemptList.filter((a) => a.maxScore >= 900).reduce((m, a) => Math.max(m, a.score), 0);

  const tests = useMemo(
    () =>
      testList.filter((t) => t.examType === tab).filter((t) => {
        if (filter === 'FULL') return t.totalQuestions >= 150 || t.parts.length >= 4;
        if (filter === 'MINI') return t.totalQuestions < 150 && t.parts.length < 4;
        if (filter === 'FREE') return t.isFree;
        return true;
      }),
    [tab, filter, testList]
  );

  const columns: Column<AttemptSummary>[] = [
    { key: 'testTitle', header: 'Đề thi', render: (r) => <span className="font-bold text-slate-900">{r.testTitle}</span> },
    { key: 'examType', header: 'Loại', render: (r) => <Badge tone={r.examType === 'TOEIC' ? 'indigo' : 'emerald'} size="xs">{r.examType}</Badge> },
    {
      key: 'score',
      header: 'Điểm',
      align: 'center',
      render: (r) => (
        <span className={cn('font-display font-extrabold', r.score / r.maxScore >= 0.7 ? 'text-emerald-700' : 'text-amber-700')}>
          {r.score}
          <span className="text-slate-400 font-semibold">/{r.maxScore}</span>
        </span>
      ),
    },
    { key: 'correct', header: 'Đúng', align: 'center', render: (r) => `${r.correct}/${r.total}` },
    { key: 'durationSec', header: 'Thời gian', align: 'center', render: (r) => formatDuration(r.durationSec) },
    { key: 'date', header: 'Ngày', render: (r) => <span className="text-slate-500">{formatDate(r.date)}</span> },
    { key: 'act', header: '', align: 'right', render: (r) => <Link to={`/app/mock-tests/${r.testId}/result?attempt=${r.id}`} className="text-xs font-extrabold text-indigo-700 hover:underline" onClick={(e) => e.stopPropagation()}>Xem kết quả</Link> },
  ];

  return (
    <div>
      <PageHeader
        icon={<FileText />}
        title={
          <>
            Đề thi thử <span className="mark">{tab}</span>
          </>
        }
        description={tab === 'TOEIC' ? 'Đề chuẩn format ETS: full 200 câu hoặc luyện theo Part, bấm giờ thật, audio phát một lần. Nộp bài là có điểm quy đổi và câu sai tự vào sổ tay.' : 'Đề theo định dạng Bộ GD&ĐT đủ 4 kỹ năng. Nghe, Đọc chấm ngay khi nộp; Viết, Nói do giáo viên chấm.'}
      />

      <div className="flex gap-2 flex-wrap mb-5 animate-fade-down">
        {(
          [
            ['ALL', 'Tất cả'],
            ['FULL', 'Full Test'],
            ['MINI', 'Mini / Part'],
            ['FREE', 'Miễn phí'],
          ] as [Filter, string][]
        ).map(([k, l]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>
            {l}
          </Chip>
        ))}
      </div>

      {isLoading && <p className="text-sm text-slate-500 mb-6">Đang tải đề thi…</p>}
      <div key={`${tab}-${filter}`} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        {tests.map((t, i) => (
          <Link key={t.id} to={`/app/mock-tests/${t.id}`} className="group block animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <Card hard hover padding="none" className="h-full flex flex-col overflow-hidden">
              <div className="relative">
                <Img src={t.coverUrl} ratio="video" alt={t.title} fallbackClass="bg-slate-900" className="group-hover:scale-105 transition-transform duration-700" fallback={<TestCover examType={t.examType} title={t.title} totalQuestions={t.totalQuestions} durationMinutes={t.durationMinutes} year={t.year} className="transition-transform duration-700 group-hover:scale-[1.03]" />} />
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <Badge tone={t.examType === 'TOEIC' ? 'indigo' : 'emerald'} solid size="xs">
                    {t.examType}
                  </Badge>
                  {t.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} tone="slate" solid size="xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {!t.isFree && <VipBadge locked={!isVip} className="absolute top-3 right-3 shadow-sm" />}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="font-display font-extrabold text-slate-900 leading-snug group-hover:text-indigo-700 transition">{t.title}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {t.level} · {t.parts.join(', ')}
                </p>
                <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-slate-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {t.durationMinutes}'
                  </span>
                  <span>{t.totalQuestions} câu</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {formatNumber(t.attempts)}
                  </span>
                </div>
                <Button size="sm" variant={t.isFree || isVip ? 'primary' : 'outline'} fullWidth className="mt-3" leftIcon={!t.isFree && !isVip ? <Lock className="w-3.5 h-3.5" /> : undefined} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t.isFree || isVip ? 'Xem chi tiết' : 'Xem đề VIP'}
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card hard className="animate-fade-up">
        <CardHeader title="Lịch sử làm bài" subtitle={`${attemptList.length} lượt thi gần nhất`} icon={<History />} action={best > 0 ? <Badge tone="emerald" solid icon={<Trophy className="w-3 h-3" />}>Cao nhất: {best}</Badge> : undefined} />
        <DataTable columns={columns} rows={attemptList} emptyTitle="Chưa có lượt thi nào" emptyDescription="Chọn một đề ở trên để bắt đầu." onRowClick={(r) => navigate(`/app/mock-tests/${r.testId}/result?attempt=${r.id}`)} dense />
      </Card>
    </div>
  );
};
