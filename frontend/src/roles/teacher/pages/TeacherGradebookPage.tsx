import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, BarChart3, Download, Percent, TrendingUp, UserX } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { useGradebook, useTeacherClasses, useTeacherStudents } from '@/shared/api/teacher';
import { cn } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Panel, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';
import { LEVEL_NAME, LevelDistribution, TARGET_LEVELS, TrackTabs, hasLevels, levelOf, minScoreOf, useTrackClasses } from '../components/ExamTrack';
import { appLocale } from '@/shared/i18n';

/** Ô điểm: số = đã chấm; còn lại hiện theo trạng thái bài nộp */
const STATE_TEXT: Record<string, [string, string]> = {
  SUBMITTED: ['Chờ chấm', 'text-amber-600'],
  LATE: ['Nộp muộn', 'text-amber-600'],
  TODO: ['Chưa nộp', 'text-rose-500'],
  MISSED: ['Không nộp', 'text-rose-600'],
};
const MIN_ATTENDANCE = 80;

/**
 * Bảng điểm theo kỳ thi (TOEIC / VSTEP / THPT, không gộp chung):
 *  - TOEIC, VSTEP: tổng kết theo điểm thi thử → bậc dự kiến (B1, B2, C1…), xét đạt mục tiêu bậc của lớp (kèm chuyên cần).
 *  - THPT: điểm quá trình thang 10.
 * Điểm quá trình = 70% trung bình các bài (quy về thang 10) + 30% chuyên cần.
 */
export const TeacherGradebookPage: React.FC = () => {
  useDocumentTitle('Bảng điểm');
  const [params, setParams] = useSearchParams();
  const classesQ = useTeacherClasses();
  const classes = classesQ.data ?? [];
  const { tracks, track, exam, trackClasses, cls } = useTrackClasses(classes, params);
  const leveled = hasLevels(track);
  const target = (TARGET_LEVELS as readonly string[]).includes(params.get('muctieu') ?? '') ? params.get('muctieu')! : 'B1';
  const targetMin = minScoreOf(track, target);
  const gb = useGradebook(cls?.id);
  const roster = useTeacherStudents({ classId: cls?.id }).data ?? [];
  const setParam = (k: string, v: string) => setParams((p) => ({ ...Object.fromEntries(p), [k]: v }), { replace: true });

  if (classesQ.isLoading || (cls && gb.isLoading)) return <TLoading />;
  if (classesQ.error) return <TError error={classesQ.error} onRetry={() => classesQ.refetch()} />;

  const cols = gb.data?.assignments ?? [];
  const students = gb.data?.students ?? [];
  /** null = chưa có buổi nào điểm danh */
  const attendance = (id: string) => roster.find((r) => r.id === id)?.attendanceRate ?? null;
  /** Điểm thi thử trung bình (đề full) theo thang của kỳ thi */
  const mockOf = (id: string) => roster.find((r) => r.id === id)?.avgScore || null;
  const scoreOf = (sid: string, aid: string) => gb.data?.scores[sid]?.[aid] ?? null;
  const stateOf = (sid: string, aid: string) => gb.data?.states[sid]?.[aid];
  const processScore = (sid: string): number | null => {
    const parts = cols
      .map((a) => {
        const v = scoreOf(sid, a.id);
        if (v !== null) return (v / (a.maxScore || 10)) * 10;
        const st = stateOf(sid, a.id);
        const overdue = st === 'MISSED' || (st === 'TODO' && !!a.dueDate && new Date(a.dueDate).getTime() < Date.now());
        return overdue ? 0 : null;
      })
      .filter((x): x is number => x !== null);
    const att = attendance(sid);
    if (!parts.length && att === null) return null;
    const avg = parts.length ? parts.reduce((x, y) => x + y, 0) / parts.length : 0;
    const total = parts.length && att !== null ? avg * 0.7 + (att / 10) * 0.3 : parts.length ? avg : (att ?? 0) / 10;
    return Math.round(total * 10) / 10;
  };

  /** Kết luận từng học viên: TOEIC / VSTEP xét bậc mục tiêu + chuyên cần; THPT xét điểm quá trình ≥ 5 + chuyên cần */
  const verdict = (mock: number | null, ps: number | null, att: number | null): { ok: boolean; muted?: boolean; text: string } => {
    const lowAtt = att !== null && att < MIN_ATTENDANCE;
    if (leveled) {
      if (mock === null) return { ok: false, muted: true, text: 'Chưa thi thử' };
      if (targetMin !== null && mock < targetMin) return { ok: false, text: `Còn thiếu ${(targetMin - mock).toLocaleString(appLocale(), { maximumFractionDigits: 1 })} điểm` };
      return lowAtt ? { ok: false, text: 'Đủ điểm, thiếu chuyên cần' } : { ok: true, text: `Đạt ${LEVEL_NAME[target]}` };
    }
    if (ps === null) return { ok: false, muted: true, text: 'Chưa có dữ liệu' };
    return ps >= 5 && !lowAtt ? { ok: true, text: 'Đủ điều kiện' } : { ok: false, text: lowAtt ? 'Thiếu chuyên cần' : 'Chưa đạt' };
  };

  const rows = students
    .map((st) => {
      const ps = processScore(st.id);
      const mock = mockOf(st.id);
      const att = attendance(st.id);
      return { st, ps, mock, att, level: levelOf(track, mock), v: verdict(mock, ps, att), missing: cols.filter((a) => ['TODO', 'MISSED'].includes(stateOf(st.id, a.id) ?? '')).length };
    })
    .sort((a, b) => (leveled ? (b.mock ?? -1) - (a.mock ?? -1) : (b.ps ?? -1) - (a.ps ?? -1)));
  const avgOf = (xs: (number | null)[]) => {
    const v = xs.filter((x): x is number => x !== null);
    return v.length ? Math.round((v.reduce((a, x) => a + x, 0) / v.length) * 10) / 10 : null;
  };
  const mockAvg = avgOf(rows.map((r) => r.mock));
  const psAvg = avgOf(rows.map((r) => r.ps));
  const attAvg = avgOf(rows.map((r) => r.att));
  const passed = rows.filter((r) => r.v.ok).length;
  const fmt = (n: number | null) => (n === null ? '—' : n.toLocaleString(appLocale()));
  const classLevel = levelOf(track, mockAvg);

  const exportCsv = () => {
    if (!cls) return;
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Học viên', 'Email', ...cols.map((a) => `${a.title} (/${a.maxScore})`), `${exam.mock} (${exam.scale})`, ...(leveled ? ['Bằng dự kiến'] : []), 'Chuyên cần (%)', 'Điểm quá trình', leveled ? `Mục tiêu ${LEVEL_NAME[target]}` : 'Xét thi'];
    const lines = rows.map(({ st, ps, mock, att, level, v }) => [st.name, st.email, ...cols.map((a) => scoreOf(st.id, a.id) ?? STATE_TEXT[stateOf(st.id, a.id) ?? '']?.[0] ?? ''), mock ?? '', ...(leveled ? [level ? LEVEL_NAME[level] ?? level : ''] : []), att ?? '', ps ?? '', v.text]);
    const csv = '﻿' + [header, ...lines].map((l) => l.map(esc).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `bang-diem-${exam.key.toLowerCase()}-${cls.code}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Đã xuất bảng điểm', `${cls.name} · ${rows.length} học viên`);
  };

  const attFigure = { label: 'Chuyên cần TB', value: attAvg === null ? '—' : `${Math.round(attAvg)}%`, note: 'các buổi đã điểm danh', icon: Percent, tone: 'sky' as const };
  const missFigure = { label: 'Còn thiếu bài', value: rows.filter((r) => r.missing > 0).length, note: 'học viên chưa nộp đủ', icon: UserX, tone: 'rose' as const };

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Kết quả' }, { label: `Bảng điểm ${exam.label}` }]}
        title={`Bảng điểm ${exam.label}`}
        sub={leveled ? `Tổng kết theo điểm ${exam.mock.toLowerCase()} (${exam.scale}), quy đổi bằng dự kiến B1 (bậc 3) hoặc B2 (bậc 4) để xét đạt mục tiêu của lớp.` : 'Điểm quá trình của lớp: điểm các bài đã chấm và chuyên cần.'}
        actions={
          cls && (
            <>
              <select value={cls.id} onChange={(e) => setParam('class', e.target.value)} className={cn(inputCls, 'w-40 max-w-full')} aria-label="Chọn lớp">
                {trackClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
              </select>
              {leveled && (
                <select value={target} onChange={(e) => setParam('muctieu', e.target.value)} className={cn(inputCls, 'w-48 max-w-full')} aria-label="Mục tiêu bậc">
                  {TARGET_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      Mục tiêu {LEVEL_NAME[l]} (từ {minScoreOf(track, l)})
                    </option>
                  ))}
                </select>
              )}
              <TBtn icon={<Download />} onClick={exportCsv} disabled={!rows.length}>
                Xuất Excel
              </TBtn>
            </>
          )
        }
      />

      <TrackTabs tracks={tracks} value={track} classes={classes} onChange={(muc) => setParams({ muc }, { replace: true })} />

      {!cls ? (
        <Panel>
          <TEmpty title="Bạn chưa có lớp nào" sub="Bảng điểm hiện theo từng lớp bạn phụ trách." />
        </Panel>
      ) : gb.error ? (
        <TError error={gb.error} onRetry={() => gb.refetch()} />
      ) : (
        <>
          <Figures
            items={
              leveled
                ? [
                    { label: `${exam.mock} TB`, value: fmt(mockAvg), note: `${exam.scale}${classLevel ? ` · ${classLevel === 'Chưa đạt' ? 'chưa đạt B1' : `≈ ${LEVEL_NAME[classLevel]}`}` : ''}`, icon: BarChart3, tone: 'indigo' },
                    { label: `Đạt ${LEVEL_NAME[target]}`, value: `${passed}/${rows.length}`, note: `điểm từ ${targetMin} và chuyên cần ≥ ${MIN_ATTENDANCE}%`, icon: Award, tone: 'emerald' },
                    attFigure,
                    missFigure,
                  ]
                : [
                    { label: 'Điểm quá trình TB', value: fmt(psAvg), note: 'thang 10', icon: TrendingUp, tone: 'indigo' },
                    { label: 'Đủ điều kiện', value: `${passed}/${rows.length}`, note: `điểm ≥ 5 và chuyên cần ≥ ${MIN_ATTENDANCE}%`, icon: Award, tone: 'emerald' },
                    attFigure,
                    missFigure,
                  ]
            }
          />

          {leveled && (
            <Panel title={`Phân bố bằng dự kiến · lớp ${cls.name}`} sub={`Theo điểm ${exam.mock.toLowerCase()} trung bình của từng học viên (${exam.scale})`}>
              <LevelDistribution track={track} scores={rows.map((r) => r.mock)} target={target} />
            </Panel>
          )}

          <Panel title={`Lớp ${cls.name} · ${exam.label}`} sub="Điểm quá trình = 70% trung bình các bài (quy về thang 10, bài quá hạn chưa nộp tính 0) + 30% chuyên cần" flush>
            {students.length === 0 ? (
              <TEmpty title="Lớp chưa có học viên" />
            ) : (
              <div className="overflow-x-auto">
                <table className={tbl.table}>
                  <thead className={tbl.thead}>
                    <tr>
                      <th className={cn(tbl.th, 'sticky left-0 bg-slate-50')}>Học viên</th>
                      {cols.map((a) => (
                        <th key={a.id} className={cn(tbl.th, 'min-w-[120px] text-right')}>
                          <span className="block font-semibold text-slate-700">{a.title.length > 26 ? `${a.title.slice(0, 26)}…` : a.title}</span>
                          <span className="block font-normal text-slate-400">/ {a.maxScore}</span>
                        </th>
                      ))}
                      <th className={cn(tbl.th, 'min-w-[110px] text-right')}>
                        <span className="block font-semibold text-slate-700">{exam.mock}</span>
                        <span className="block font-normal text-slate-400">{exam.scale}</span>
                      </th>
                      {leveled && <th className={tbl.th}>Bằng dự kiến</th>}
                      <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
                      <th className={cn(tbl.th, 'text-right')}>Điểm quá trình</th>
                      <th className={tbl.th}>{leveled ? `Mục tiêu ${LEVEL_NAME[target]}` : 'Xét thi'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ st, ps, mock, att, level, v }) => (
                      <tr key={st.id} className={tbl.tr}>
                        <td className={cn(tbl.td, 'sticky left-0 bg-white')}>
                          <span className="flex items-center gap-2.5">
                            <Avatar name={st.name} src={st.avatarUrl} size="xs" />
                            <span className="whitespace-nowrap font-medium text-slate-900">{st.name}</span>
                          </span>
                        </td>
                        {cols.map((a) => {
                          const val = scoreOf(st.id, a.id);
                          const s = STATE_TEXT[stateOf(st.id, a.id) ?? ''];
                          return (
                            <td key={a.id} className={cn(tbl.td, 'whitespace-nowrap text-right tabular-nums', val === null ? s?.[1] ?? 'text-slate-400' : 'text-slate-800')}>
                              {val !== null ? val.toLocaleString(appLocale()) : s?.[0] ?? '—'}
                            </td>
                          );
                        })}
                        <td className={cn(tbl.td, 'text-right font-semibold tabular-nums', mock === null ? 'text-slate-400' : 'text-slate-900')}>{fmt(mock)}</td>
                        {leveled && (
                          <td className={tbl.td}>
                            {level ? <span className={cn('inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-bold', level === 'Chưa đạt' ? 'bg-rose-500/10 text-rose-600' : 'bg-indigo-500/10 text-indigo-700')}>{LEVEL_NAME[level] ?? level}</span> : <span className="text-slate-400">—</span>}
                          </td>
                        )}
                        <td className={cn(tbl.td, 'text-right tabular-nums', att !== null && att < MIN_ATTENDANCE ? 'text-rose-600' : 'text-slate-800')}>{att === null ? '—' : `${att}%`}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums text-slate-800')}>{ps === null ? '—' : ps.toLocaleString(appLocale(), { minimumFractionDigits: 1 })}</td>
                        <td className={tbl.td}>
                          <span className={cn('whitespace-nowrap text-[13px] font-semibold', v.ok ? 'text-emerald-600' : v.muted ? 'text-slate-400' : 'text-rose-600')}>{v.text}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
};
