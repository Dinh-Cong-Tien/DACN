import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, Users, Lock, ArrowRight, History, Trophy } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, Chip, Column, DataTable, PageHeader, Tabs } from '@/shared/components/ui';
import { MOCK_TESTS, MOCK_ATTEMPTS } from '@/shared/mocks';
import type { AttemptSummary } from '@/shared/types';
import { cn, formatDate, formatDuration, formatNumber } from '@/shared/utils';

type Filter = 'ALL' | 'FULL' | 'MINI' | 'FREE';

export const StudentMockTestsPage: React.FC = () => {
  useDocumentTitle('Thi thử');
  const navigate = useNavigate();
  const [tab, setTab] = useState('TOEIC');
  const [filter, setFilter] = useState<Filter>('ALL');

  const tests = useMemo(
    () =>
      MOCK_TESTS.filter((t) => t.examType === tab).filter((t) => {
        if (filter === 'FULL') return t.totalQuestions >= 150 || t.parts.length >= 4;
        if (filter === 'MINI') return t.totalQuestions < 150 && t.parts.length < 4;
        if (filter === 'FREE') return t.isFree;
        return true;
      }),
    [tab, filter]
  );

  const columns: Column<AttemptSummary>[] = [
    { key: 'testTitle', header: 'Đề thi', render: (r) => <span className="font-semibold text-slate-800">{r.testTitle}</span> },
    { key: 'examType', header: 'Loại', render: (r) => <Badge tone={r.examType === 'TOEIC' ? 'indigo' : 'emerald'} size="xs">{r.examType}</Badge> },
    {
      key: 'score',
      header: 'Điểm',
      align: 'center',
      render: (r) => (
        <span className={cn('font-black', r.score / r.maxScore >= 0.7 ? 'text-emerald-600' : 'text-amber-600')}>
          {r.score}
          <span className="text-slate-400 font-semibold">/{r.maxScore}</span>
        </span>
      ),
    },
    { key: 'correct', header: 'Đúng', align: 'center', render: (r) => `${r.correct}/${r.total}` },
    { key: 'durationSec', header: 'Thời gian', align: 'center', render: (r) => formatDuration(r.durationSec) },
    { key: 'date', header: 'Ngày', render: (r) => <span className="text-slate-500">{formatDate(r.date)}</span> },
    { key: 'act', header: '', align: 'right', render: (r) => <Link to={`/app/mock-tests/${r.testId}/result`} className="text-xs font-bold text-indigo-600 hover:underline" onClick={(e) => e.stopPropagation()}>Xem kết quả</Link> },
  ];

  return (
    <div>
      <PageHeader icon={<FileText />} title="Kho đề thi thử" description="Đề chuẩn format ETS / Bộ GD&ĐT, bấm giờ thật, audio phát một lần. Kết quả tự động phân tích và lưu lỗi sai." actions={<Tabs variant="pill" value={tab} onChange={setTab} items={[{ key: 'TOEIC', label: 'TOEIC', count: MOCK_TESTS.filter((t) => t.examType === 'TOEIC').length }, { key: 'VSTEP', label: 'VSTEP', count: MOCK_TESTS.filter((t) => t.examType === 'VSTEP').length }]} />} />

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
        {tests.map((t, i) => (
          <Link key={t.id} to={`/app/mock-tests/${t.id}`} className="group block animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <Card hover className="h-full flex flex-col" padding="sm">
              <div className={cn('h-24 -m-4 mb-3 rounded-t-2xl bg-gradient-to-br relative overflow-hidden', t.examType === 'TOEIC' ? 'from-indigo-500 to-violet-600' : 'from-emerald-500 to-teal-600')}>
                <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />
                <div className="absolute inset-0 p-4 flex items-end justify-between">
                  <span className="text-white font-black text-2xl drop-shadow">{t.examType}</span>
                  <div className="flex gap-1">
                    {t.tags?.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold backdrop-blur">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {!t.isFree && (
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="font-bold text-slate-900 group-hover:text-indigo-700 transition leading-snug">{t.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {t.level} · {t.parts.join(', ')}
              </p>
              <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {t.durationMinutes}'
                </span>
                <span>{t.totalQuestions} câu</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {formatNumber(t.attempts)}
                </span>
              </div>
              <Button size="sm" variant={t.isFree ? 'soft' : 'outline'} fullWidth className="mt-3" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t.isFree ? 'Xem chi tiết' : 'Đề VIP'}
              </Button>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="animate-fade-up">
        <CardHeader title="Lịch sử làm bài" subtitle={`${MOCK_ATTEMPTS.length} lượt thi gần nhất`} icon={<History />} action={<Badge tone="emerald" icon={<Trophy className="w-3 h-3" />}>Cao nhất: 715</Badge>} />
        <DataTable columns={columns} rows={MOCK_ATTEMPTS} onRowClick={(r) => navigate(`/app/mock-tests/${r.testId}/result`)} dense />
      </Card>
    </div>
  );
};
