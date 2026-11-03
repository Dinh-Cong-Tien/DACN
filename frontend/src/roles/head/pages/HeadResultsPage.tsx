import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, FileCheck2, Search, TrendingUp, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useHeadClasses, useHeadResults, type ResultQuery } from '@/shared/api/head';
import type { ExamType } from '@/shared/types';
import { Avatar, Pagination } from '@/shared/components/ui';
import { cn, formatDateTime, staffPath } from '@/shared/utils';
import { Figures, Panel, TPageHead, TTabs, inputCls, tbl } from '@/roles/teacher/components/TeacherKit';

export const MODE_LABEL: Record<string, string> = { FULL: 'Thi thử', PRACTICE: 'Luyện Part', PART_SESSION: 'Luyện Part', ADAPTIVE: 'Thích ứng', DRILL: 'Luyện điểm yếu', LESSON_QUIZ: 'Bài kiểm tra', DICTATION: 'Chép chính tả' };
export const durationText = (sec: number) => (sec >= 3600 ? `${Math.floor(sec / 3600)} giờ ${Math.round((sec % 3600) / 60)} phút` : `${Math.max(1, Math.round(sec / 60))} phút`);

/** Kết quả làm bài của học viên trong các lớp: thi thử, luyện Part, bài kiểm tra */
export const HeadResultsPage: React.FC = () => {
  useDocumentTitle('Kết quả thi của học viên');
  const [mode, setMode] = useState<'ALL' | NonNullable<ResultQuery['mode']>>('FULL');
  const [examType, setExamType] = useState<'' | ExamType>('');
  const [classId, setClassId] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const query: ResultQuery = { page, pageSize: 20, mode: mode === 'ALL' ? undefined : mode, examType: examType || undefined, classId: classId || undefined, q: q.trim() || undefined };
  const res = useHeadResults(query);
  const data = res.data;
  const classes = useHeadClasses().data ?? [];
  const reset = <T,>(set: (v: T) => void) => (v: T) => (set(v), setPage(1));
  const sum = data?.summary;

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Giảng dạy" title="Kết quả thi của học viên" sub="Bài thi thử, luyện Part và bài kiểm tra học viên trong các lớp đã nộp. Bấm tên học viên để xem toàn bộ hồ sơ học tập." />
      <Figures
        items={[
          { label: 'Lượt làm bài', value: sum?.attempts ?? '—', note: 'theo bộ lọc hiện tại', icon: FileCheck2, tone: 'indigo' },
          { label: 'Bài thi thử', value: sum?.fullTests ?? '—', note: `${sum?.students ?? 0} học viên đã thi`, icon: Users, tone: 'violet' },
          { label: 'Điểm TB TOEIC', value: sum?.avgToeic ?? '—', note: 'đề full · thang 990', icon: TrendingUp, tone: 'sky' },
          { label: 'Điểm TB VSTEP', value: sum?.avgVstep ?? '—', note: 'đề full · thang 10', icon: Award, tone: 'emerald' },
        ]}
      />
      <Panel flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 pt-3 xl:flex-row xl:items-end xl:justify-between">
          <TTabs
            className="border-b-0"
            value={mode}
            onChange={(k) => reset(setMode)(k as typeof mode)}
            items={[
              { key: 'FULL', label: 'Thi thử' },
              { key: 'PRACTICE', label: 'Luyện Part' },
              { key: 'OTHER', label: 'Bài khác' },
              { key: 'ALL', label: 'Tất cả' },
            ]}
          />
          <div className="flex flex-col gap-2 pb-3 sm:flex-row">
            <select value={examType} onChange={(e) => reset(setExamType)(e.target.value as typeof examType)} className={cn(inputCls, 'sm:w-36')} aria-label="Kỳ thi">
              <option value="">Mọi kỳ thi</option>
              <option value="TOEIC">TOEIC</option>
              <option value="VSTEP">VSTEP</option>
            </select>
            <select value={classId} onChange={(e) => reset(setClassId)(e.target.value)} className={cn(inputCls, 'sm:w-56')} aria-label="Lọc theo lớp">
              <option value="">Tất cả lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="relative sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => reset(setQ)(e.target.value)} placeholder="Tìm học viên" className={cn(inputCls, 'w-full pl-9')} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Học viên</th>
                <th className={tbl.th}>Bài làm</th>
                <th className={cn(tbl.th, 'text-right')}>Điểm</th>
                <th className={cn(tbl.th, 'text-right')}>Đúng</th>
                <th className={tbl.th}>Thời gian</th>
                <th className={tbl.th}>Nộp lúc</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((r) => (
                <tr key={r.id} className={tbl.tr}>
                  <td className={tbl.td}>
                    <span className="flex items-center gap-2.5">
                      <Avatar name={r.studentName} src={r.avatarUrl} size="sm" />
                      <span className="min-w-0">
                        <Link to={staffPath(`/students/${r.studentId}`)} className="block whitespace-nowrap font-medium text-slate-900 hover:text-indigo-700">
                          {r.studentName}
                        </Link>
                        <span className="block text-[12px] text-slate-500">{r.className}</span>
                      </span>
                    </span>
                  </td>
                  <td className={tbl.td}>
                    <p className="text-slate-800">{r.testTitle}</p>
                    <p className="text-[12px] text-slate-500">
                      {MODE_LABEL[r.mode] ?? r.mode}
                      {r.examType && ` · ${r.examType}`}
                    </p>
                  </td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-right tabular-nums')}>
                    {r.score !== undefined ? <span className="font-semibold text-slate-900">{r.score}</span> : '—'}
                    {r.listening !== undefined && r.reading !== undefined && (
                      <p className="text-[12px] text-slate-500">
                        L {r.listening} · R {r.reading}
                      </p>
                    )}
                    {r.cefr && <p className="text-[12px] text-slate-500">{r.cefr}</p>}
                  </td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-right tabular-nums text-slate-600')}>{r.correct !== undefined ? `${r.correct}/${r.total}` : '—'}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{durationText(r.durationSec)}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{r.submittedAt ? formatDateTime(r.submittedAt) : '—'}</td>
                </tr>
              ))}
              {!data?.items.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    {res.isLoading ? 'Đang tải…' : 'Chưa có bài làm nào khớp bộ lọc.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && data.total > data.pageSize && (
          <div className="border-t border-slate-100 px-5 py-3">
            <Pagination page={page} totalPages={Math.ceil(data.total / data.pageSize)} total={data.total} pageSize={data.pageSize} onChange={setPage} />
          </div>
        )}
      </Panel>
    </div>
  );
};
