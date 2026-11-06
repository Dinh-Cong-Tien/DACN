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
import { LEVEL_NAME, TARGET_LEVELS, TrackTabs, hasLevels, levelOf, minScoreOf, useTrackClasses } from '../components/ExamTrack';
import { appLocale } from '@/shared/i18n';

/** Ô điểm: số = đã chấm; còn lại hiện theo trạng thái bài nộp */
const STATE_TEXT: Record<string, [string, string]> = {
  SUBMITTED: ['Chờ chấm', 'text-amber-600'],
  LATE: ['Nộp muộn', 'text-amber-600'],
  TODO: ['Chưa nộp', 'text-rose-500'],
  MISSED: ['Không nộp', 'text-rose-600'],
};
const MIN_ATTENDANCE = 80;
/** Điểm VSTEP: trung bình 4 kỹ năng (Nghe, Đọc, Viết, Nói), làm tròn đến 0,5 */
const vstepOverall = (xs: number[]) => Math.round((xs.reduce((a, x) => a + x, 0) / xs.length) * 2) / 2;
/** Cột điểm thi theo cấu trúc từng kỳ thi */
const SKILLS = {
  TOEIC: [
    { key: 'listening', label: 'Nghe', scale: 'thang 495' },
    { key: 'reading', label: 'Đọc', scale: 'thang 495' },
  ],
  VSTEP: [
    { key: 'listening', label: 'Nghe', scale: 'thang 10' },
    { key: 'reading', label: 'Đọc', scale: 'thang 10' },
    { key: 'writing', label: 'Viết', scale: 'thang 10' },
    { key: 'speaking', label: 'Nói', scale: 'thang 10' },
  ],
} as const;

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
  /** Điểm thi của học viên: chỉ đề full cùng kỳ thi với lớp (TOEIC thang 990 / VSTEP thang 10) */
  const examOf = (id: string) => gb.data?.exam?.[id];
  const mockOf = (id: string) => {
    const e = examOf(id);
    if (!e?.attempts) return null;
    if (track !== 'VSTEP') return e.total;
    const four = [e.listening, e.reading, e.writing, e.speaking];
    return four.every((x) => x !== null) ? vstepOverall(four as number[]) : null;
  };
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
  const verdict = (sid: string, mock: number | null, ps: number | null, att: number | null): { ok: boolean; muted?: boolean; text: string } => {
    const lowAtt = att !== null && att < MIN_ATTENDANCE;
    if (leveled) {
      if (mock === null) return { ok: false, muted: true, text: track === 'VSTEP' && examOf(sid)?.attempts ? 'Chưa đủ 4 kỹ năng' : 'Chưa thi thử' };
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
      return { st, ps, mock, ex: examOf(st.id), att, level: levelOf(track, mock), v: verdict(st.id, mock, ps, att), missing: cols.filter((a) => ['TODO', 'MISSED'].includes(stateOf(st.id, a.id) ?? '')).length };
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
    const sk = leveled ? SKILLS[track as 'TOEIC' | 'VSTEP'] : [];
    const header = ['Học viên', 'Email', ...sk.map((k) => `${k.label} (${k.scale})`), `${exam.mock} (${exam.scale})`, ...cols.map((a) => `${a.title} (/${a.maxScore})`), ...(leveled ? ['Bằng dự kiến'] : []), 'Chuyên cần (%)', 'Điểm quá trình', leveled ? `Mục tiêu ${LEVEL_NAME[target]}` : 'Xét thi'];
    const lines = rows.map(({ st, ps, mock, ex, att, level, v }) => [st.name, st.email, ...sk.map((k) => ex?.[k.key] ?? ''), mock ?? '', ...cols.map((a) => scoreOf(st.id, a.id) ?? STATE_TEXT[stateOf(st.id, a.id) ?? '']?.[0] ?? ''), ...(leveled ? [level ? LEVEL_NAME[level] ?? level : ''] : []), att ?? '', ps ?? '', v.text]);
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
                    { label: `${exam.mock} TB`, value: fmt(mockAvg), note: `${track === 'VSTEP' ? 'TB 4 kỹ năng' : exam.scale}${classLevel ? ` · ${classLevel === 'Chưa đạt' ? 'chưa đạt B1' : `≈ ${LEVEL_NAME[classLevel]}`}` : ''}`, icon: BarChart3, tone: 'indigo' },
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
            <Panel title={`Bảng điểm thi ${exam.label} · lớp ${cls.name}`} sub={track === 'VSTEP' ? 'Điểm từng kỹ năng (trung bình các lượt thi thử VSTEP) → điểm tổng = trung bình 4 kỹ năng làm tròn 0,5 → Bậc 3 (B1) từ 4,0 · Bậc 4 (B2) từ 6,0' : 'Điểm Nghe, Đọc (trung bình các lượt thi thử TOEIC) → tổng 990 → B1 · Bậc 3 từ 550, B2 · Bậc 4 từ 785'} flush>
              {students.length === 0 ? (
                <TEmpty title="Lớp chưa có học viên" />
              ) : (
                <div className="overflow-x-auto">
                  <table className={tbl.table}>
                    <thead className={tbl.thead}>
                      <tr>
                        <th className={cn(tbl.th, 'sticky left-0 bg-slate-50')}>Học viên</th>
                        {SKILLS[track as 'TOEIC' | 'VSTEP'].map((k) => (
                          <th key={k.key} className={cn(tbl.th, 'text-right')}>
                            <span className="block font-semibold text-slate-700">{k.label}</span>
                            <span className="block font-normal text-slate-400">{k.scale}</span>
                          </th>
                        ))}
                        <th className={cn(tbl.th, 'text-right')}>
                          <span className="block font-semibold text-slate-700">{track === 'TOEIC' ? 'Tổng điểm' : 'Điểm tổng'}</span>
                          <span className="block font-normal text-slate-400">{track === 'TOEIC' ? exam.scale : 'TB 4 kỹ năng, làm tròn 0,5'}</span>
                        </th>
                        <th className={cn(tbl.th, 'text-right')}>Số lượt thi</th>
                        <th className={tbl.th}>{track === 'VSTEP' ? 'Bậc đạt' : 'Bằng dự kiến'}</th>
                        <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
                        <th className={tbl.th}>Mục tiêu {LEVEL_NAME[target]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ st, ex, mock, att, level, v }) => (
                        <tr key={st.id} className={tbl.tr}>
                          <td className={cn(tbl.td, 'sticky left-0 bg-white')}>
                            <span className="flex items-center gap-2.5">
                              <Avatar name={st.name} src={st.avatarUrl} size="xs" />
                              <span className="whitespace-nowrap font-medium text-slate-900">{st.name}</span>
                            </span>
                          </td>
                          {SKILLS[track as 'TOEIC' | 'VSTEP'].map((k) => {
                            const val = ex?.[k.key] ?? null;
                            const ungraded = val === null && !!ex?.attempts && (k.key === 'writing' || k.key === 'speaking');
                            return (
                              <td key={k.key} className={cn(tbl.td, 'whitespace-nowrap text-right tabular-nums', val === null ? 'text-slate-400' : 'text-slate-800')}>
                                {ungraded ? 'Chưa chấm' : val === null ? '—' : track === 'VSTEP' ? val.toLocaleString(appLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : fmt(val)}
                              </td>
                            );
                          })}
                          <td className={cn(tbl.td, 'text-right font-display text-[15px] font-bold tabular-nums', mock === null ? 'text-slate-400' : 'text-slate-900')}>{mock === null ? '—' : track === 'VSTEP' ? mock.toLocaleString(appLocale(), { minimumFractionDigits: 1 }) : fmt(mock)}</td>
                          <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{ex?.attempts || '—'}</td>
                          <td className={tbl.td}>
                            {level ? <span className={cn('inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-bold', level === 'Chưa đạt' ? 'bg-rose-500/10 text-rose-600' : 'bg-indigo-500/10 text-indigo-700')}>{LEVEL_NAME[level] ?? level}</span> : <span className="text-slate-400">—</span>}
                          </td>
                          <td className={cn(tbl.td, 'text-right tabular-nums', att !== null && att < MIN_ATTENDANCE ? 'text-rose-600' : 'text-slate-800')}>{att === null ? '—' : `${att}%`}</td>
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
          )}

          <Panel
            title={leveled ? `Điểm bài tập trên lớp · ${cls.name}` : `Lớp ${cls.name} · ${exam.label}`}
            sub={leveled ? `Điểm các bài giáo viên giao, theo thang của từng bài — tách riêng, không tính vào điểm thi ${exam.label}. Điểm quá trình = 70% trung bình các bài (quy về thang 10) + 30% chuyên cần` : 'Điểm quá trình = 70% trung bình các bài (quy về thang 10, bài quá hạn chưa nộp tính 0) + 30% chuyên cần'}
            flush
          >
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
                      {!leveled && <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>}
                      <th className={cn(tbl.th, 'text-right')}>Điểm quá trình</th>
                      {!leveled && <th className={tbl.th}>Xét thi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ st, ps, att, v }) => (
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
                        {!leveled && <td className={cn(tbl.td, 'text-right tabular-nums', att !== null && att < MIN_ATTENDANCE ? 'text-rose-600' : 'text-slate-800')}>{att === null ? '—' : `${att}%`}</td>}
                        <td className={cn(tbl.td, 'text-right font-semibold tabular-nums text-slate-900')}>{ps === null ? '—' : ps.toLocaleString(appLocale(), { minimumFractionDigits: 1 })}</td>
                        {!leveled && (
                          <td className={tbl.td}>
                            <span className={cn('whitespace-nowrap text-[13px] font-semibold', v.ok ? 'text-emerald-600' : v.muted ? 'text-slate-400' : 'text-rose-600')}>{v.text}</span>
                          </td>
                        )}
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
