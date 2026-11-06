import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Download, Percent, UserX } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { useGradebook, useTeacherClasses, useTeacherStudents, type Gradebook, type GradebookExam } from '@/shared/api/teacher';
import { cn } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Panel, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';
import { LEVEL_NAME, TARGETS, TrackTabs, isBelow, levelOf, minScoreOf, useTrackClasses } from '../components/ExamTrack';
import { appLocale } from '@/shared/i18n';

/** Ô điểm: số = đã chấm; còn lại hiện theo trạng thái bài nộp */
const STATE_TEXT: Record<string, [string, string]> = {
  SUBMITTED: ['Chờ chấm', 'text-amber-600'],
  LATE: ['Nộp muộn', 'text-amber-600'],
  TODO: ['Chưa nộp', 'text-rose-500'],
  MISSED: ['Không nộp', 'text-rose-600'],
};
const MIN_ATTENDANCE = 80;
type ExamKey = 'TOEIC' | 'VSTEP';

/** Cấu trúc bảng điểm thi từng kỳ thi */
const SHEET: Record<ExamKey, { skills: { key: 'listening' | 'reading' | 'writing' | 'speaking'; label: string; scale: string }[]; total: string; totalNote: string; rule: string }> = {
  TOEIC: {
    skills: [
      { key: 'listening', label: 'Nghe', scale: 'thang 495' },
      { key: 'reading', label: 'Đọc', scale: 'thang 495' },
    ],
    total: 'Tổng điểm',
    totalNote: 'thang 990',
    rule: 'Nghe + Đọc (trung bình các lượt thi thử TOEIC) → tổng điểm thang 990, xét mốc 600+ / 650+',
  },
  VSTEP: {
    skills: [
      { key: 'listening', label: 'Nghe', scale: 'thang 10' },
      { key: 'reading', label: 'Đọc', scale: 'thang 10' },
      { key: 'writing', label: 'Viết', scale: 'thang 10' },
      { key: 'speaking', label: 'Nói', scale: 'thang 10' },
    ],
    total: 'Điểm tổng',
    totalNote: 'TB 4 kỹ năng, làm tròn 0,5',
    rule: 'Nghe, Đọc, Viết, Nói (trung bình các lượt thi thử VSTEP) → điểm tổng = TB 4 kỹ năng làm tròn 0,5 → Bậc 3 (B1) từ 4,0 · Bậc 4 (B2) từ 6,0',
  },
};

/** Điểm tổng của một bảng: TOEIC = tổng 990; VSTEP = TB 4 kỹ năng làm tròn 0,5 (đủ 4 kỹ năng mới tính) */
const overallOf = (type: ExamKey, e?: GradebookExam): number | null => {
  if (!e?.attempts) return null;
  if (type === 'TOEIC') return e.total;
  const four = [e.listening, e.reading, e.writing, e.speaking];
  return four.every((x) => x !== null) ? Math.round(((four as number[]).reduce((a, x) => a + x, 0) / 4) * 2) / 2 : null;
};

const num = (n: number | null, digits?: number) => (n === null ? '—' : n.toLocaleString(appLocale(), digits ? { minimumFractionDigits: digits, maximumFractionDigits: digits } : undefined));

type Verdict = { ok: boolean; muted?: boolean; text: string };
/** Xét mục tiêu: điểm tổng đạt ngưỡng bậc + chuyên cần ≥ 80% */
const verdictOf = (type: ExamKey, e: GradebookExam | undefined, overall: number | null, att: number | null, target: string): Verdict => {
  if (!e?.attempts) return { ok: false, muted: true, text: 'Chưa thi thử' };
  if (overall === null) return { ok: false, muted: true, text: 'Chưa đủ 4 kỹ năng' };
  const min = minScoreOf(type, target);
  if (min !== null && overall < min) return { ok: false, text: `Còn thiếu ${num(Math.round((min - overall) * 10) / 10)} điểm` };
  // TOEIC: "Đạt 600+"; VSTEP: "Đạt Bậc 3 (B1)"
  return att !== null && att < MIN_ATTENDANCE ? { ok: false, text: 'Đủ điểm, thiếu chuyên cần' } : { ok: true, text: `Đạt ${type === 'TOEIC' ? target : LEVEL_NAME[target]}` };
};

/** Một bảng điểm thi (TOEIC hoặc VSTEP) của cả lớp — mỗi kỳ thi một bảng riêng */
const ExamSheet: React.FC<{ type: ExamKey; className: string; students: Gradebook['students']; exam: Record<string, GradebookExam>; attendance: (id: string) => number | null; target: string }> = ({ type, className, students, exam, attendance, target }) => {
  const cfg = SHEET[type];
  const rows = students
    .map((st) => {
      const e = exam[st.id];
      const overall = overallOf(type, e);
      const att = attendance(st.id);
      return { st, e, overall, att, level: levelOf(type, overall), v: verdictOf(type, e, overall, att, target) };
    })
    .sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1) || (b.e?.attempts ?? 0) - (a.e?.attempts ?? 0));
  const scored = rows.filter((r) => r.overall !== null);
  const avg = scored.length ? Math.round((scored.reduce((a, r) => a + (r.overall ?? 0), 0) / scored.length) * 10) / 10 : null;
  const avgLevel = levelOf(type, avg);
  const passed = rows.filter((r) => r.v.ok).length;
  return (
    <Panel title={`Bảng điểm thi ${type} · lớp ${className}`} sub={cfg.rule} flush>
      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-100 px-5 py-3 text-sm">
        <span className="text-slate-500">
          Điểm tổng TB lớp: <b className="tabular-nums text-slate-900">{type === 'VSTEP' ? num(avg, 1) : num(avg)}</b>
          {avgLevel && <span className={cn('ml-1.5 font-semibold', isBelow(type, avgLevel) ? 'text-rose-600' : 'text-indigo-700')}>({LEVEL_NAME[avgLevel]})</span>}
        </span>
        <span className="text-slate-500">
          Đạt {type === 'TOEIC' ? target : LEVEL_NAME[target]}: <b className="tabular-nums text-emerald-600">{passed}</b>/{rows.length}
        </span>
        <span className="text-slate-500">
          Đã thi thử {type}: <b className="tabular-nums text-slate-900">{rows.filter((r) => r.e?.attempts).length}</b>/{rows.length}
        </span>
      </div>
      {students.length === 0 ? (
        <TEmpty title="Lớp chưa có học viên" />
      ) : (
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={cn(tbl.th, 'sticky left-0 bg-slate-50')}>Học viên</th>
                {cfg.skills.map((k) => (
                  <th key={k.key} className={cn(tbl.th, 'text-right')}>
                    <span className="block font-semibold text-slate-700">{k.label}</span>
                    <span className="block font-normal text-slate-400">{k.scale}</span>
                  </th>
                ))}
                <th className={cn(tbl.th, 'text-right')}>
                  <span className="block font-semibold text-slate-700">{cfg.total}</span>
                  <span className="block font-normal text-slate-400">{cfg.totalNote}</span>
                </th>
                <th className={cn(tbl.th, 'text-right')}>Số lượt thi</th>
                <th className={tbl.th}>{type === 'VSTEP' ? 'Bậc đạt' : 'Mốc điểm'}</th>
                <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
                <th className={tbl.th}>Mục tiêu {type === 'TOEIC' ? target : LEVEL_NAME[target]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ st, e, overall, att, level, v }) => (
                <tr key={st.id} className={tbl.tr}>
                  <td className={cn(tbl.td, 'sticky left-0 bg-white')}>
                    <span className="flex items-center gap-2.5">
                      <Avatar name={st.name} src={st.avatarUrl} size="xs" />
                      <span className="whitespace-nowrap font-medium text-slate-900">{st.name}</span>
                    </span>
                  </td>
                  {cfg.skills.map((k) => {
                    const val = e?.attempts ? e[k.key] : null;
                    const ungraded = val === null && !!e?.attempts;
                    return (
                      <td key={k.key} className={cn(tbl.td, 'whitespace-nowrap text-right tabular-nums', val === null ? 'text-slate-400' : 'text-slate-800')}>
                        {ungraded ? 'Chưa chấm' : type === 'VSTEP' ? num(val, 1) : num(val)}
                      </td>
                    );
                  })}
                  <td className={cn(tbl.td, 'text-right font-display text-[15px] font-bold tabular-nums', overall === null ? 'text-slate-400' : 'text-slate-900')}>{type === 'VSTEP' ? num(overall, 1) : num(overall)}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{e?.attempts || '—'}</td>
                  <td className={tbl.td}>
                    {level ? <span className={cn('inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-bold', isBelow(type, level) ? 'bg-rose-500/10 text-rose-600' : 'bg-indigo-500/10 text-indigo-700')}>{LEVEL_NAME[level] ?? level}</span> : <span className="text-slate-400">—</span>}
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
  );
};

/**
 * Bảng điểm của lớp — đúng kỳ thi của lớp, không gộp chung:
 *  - Lớp TOEIC (T…): bảng điểm thi TOEIC — Nghe, Đọc (495) → tổng 990 → mốc 600+ / 650+.
 *  - Lớp VSTEP (V…): bảng điểm thi VSTEP — Nghe, Đọc, Viết, Nói (10) → điểm tổng → Bậc 3 (B1) / Bậc 4 (B2).
 *  - Điểm bài tập trên lớp (điểm quá trình), tách riêng khỏi điểm thi.
 */
export const TeacherGradebookPage: React.FC = () => {
  useDocumentTitle('Bảng điểm');
  const [params, setParams] = useSearchParams();
  const classesQ = useTeacherClasses();
  const classes = classesQ.data ?? [];
  const { tracks, track, trackClasses, cls } = useTrackClasses(classes, params);
  const targets = TARGETS[track] ?? [];
  const target = targets.includes(params.get('muctieu') ?? '') ? params.get('muctieu')! : targets[0] ?? '';
  const gb = useGradebook(cls?.id);
  const roster = useTeacherStudents({ classId: cls?.id }).data ?? [];
  const setParam = (k: string, v: string) => setParams((p) => ({ ...Object.fromEntries(p), [k]: v }), { replace: true });

  if (classesQ.isLoading || (cls && gb.isLoading)) return <TLoading />;
  if (classesQ.error) return <TError error={classesQ.error} onRetry={() => classesQ.refetch()} />;

  const cols = gb.data?.assignments ?? [];
  const students = gb.data?.students ?? [];
  const exams = gb.data?.exams ?? { TOEIC: {}, VSTEP: {} };
  // lớp T… (TOEIC) chỉ có bảng điểm thi TOEIC, lớp V… (VSTEP) chỉ có bảng điểm thi VSTEP; THPT không có bảng thi
  const order: ExamKey[] = track === 'TOEIC' || track === 'VSTEP' ? [track] : [];
  /** null = chưa có buổi nào điểm danh */
  const attendance = (id: string) => roster.find((r) => r.id === id)?.attendanceRate ?? null;
  const scoreOf = (sid: string, aid: string) => gb.data?.scores[sid]?.[aid] ?? null;
  const stateOf = (sid: string, aid: string) => gb.data?.states[sid]?.[aid];
  /** Điểm quá trình = 70% trung bình các bài (quy về thang 10; bài quá hạn chưa nộp tính 0) + 30% chuyên cần */
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
    // chưa có bài nào được chấm / quá hạn → chưa có điểm quá trình (không lấy riêng chuyên cần làm điểm)
    if (!parts.length) return null;
    const avg = parts.reduce((x, y) => x + y, 0) / parts.length;
    const total = att !== null ? avg * 0.7 + (att / 10) * 0.3 : avg;
    return Math.round(total * 10) / 10;
  };
  const rows = students.map((st) => ({ st, ps: processScore(st.id), att: attendance(st.id), missing: cols.filter((a) => ['TODO', 'MISSED'].includes(stateOf(st.id, a.id) ?? '')).length })).sort((a, b) => (b.ps ?? -1) - (a.ps ?? -1));
  const passedOf = (type: ExamKey) => students.filter((st) => verdictOf(type, exams[type][st.id], overallOf(type, exams[type][st.id]), attendance(st.id), target).ok).length;
  const atts = rows.map((r) => r.att).filter((x): x is number => x !== null);

  const exportCsv = () => {
    if (!cls) return;
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const examCols = order.flatMap((t) => [...SHEET[t].skills.map((k) => `${k.label} (${k.scale})`), `${SHEET[t].total} (${SHEET[t].totalNote})`, `${t === 'VSTEP' ? 'Bậc' : 'Mốc điểm'}`, `Mục tiêu ${t === 'TOEIC' ? target : LEVEL_NAME[target]}`]);
    const header = ['Học viên', 'Email', ...examCols, 'Chuyên cần (%)', ...cols.map((a) => `${a.title} (/${a.maxScore})`), 'Điểm quá trình'];
    const lines = rows.map(({ st, ps, att }) => [
      st.name,
      st.email,
      ...order.flatMap((t) => {
        const e = exams[t][st.id];
        const o = overallOf(t, e);
        const lv = levelOf(t, o);
        return [...SHEET[t].skills.map((k) => (e?.attempts ? e[k.key] ?? '' : '')), o ?? '', lv ? LEVEL_NAME[lv] ?? lv : '', verdictOf(t, e, o, att, target).text];
      }),
      att ?? '',
      ...cols.map((a) => scoreOf(st.id, a.id) ?? STATE_TEXT[stateOf(st.id, a.id) ?? '']?.[0] ?? ''),
      ps ?? '',
    ]);
    const csv = '﻿' + [header, ...lines].map((l) => l.map(esc).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `bang-diem-${cls.code}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Đã xuất bảng điểm', `${cls.name} · ${rows.length} học viên`);
  };

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Kết quả' }, { label: 'Bảng điểm' }]}
        title={cls ? `Bảng điểm lớp ${cls.name}` : 'Bảng điểm'}
        sub={track === 'VSTEP' ? 'Lớp VSTEP: điểm Nghe, Đọc, Viết, Nói → điểm tổng → Bậc 3 (B1) / Bậc 4 (B2). Điểm bài tập trên lớp tách riêng bên dưới.' : track === 'TOEIC' ? 'Lớp TOEIC: điểm Nghe, Đọc → tổng điểm thang 990, xét mốc 600+ / 650+. Điểm bài tập trên lớp tách riêng bên dưới.' : 'Điểm bài tập trên lớp và điểm quá trình.'}
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
              {targets.length > 0 && (
                <select value={target} onChange={(e) => setParam('muctieu', e.target.value)} className={cn(inputCls, 'w-48 max-w-full')} aria-label="Mục tiêu">
                  {targets.map((l) => (
                    <option key={l} value={l}>
                      Mục tiêu {track === 'TOEIC' ? `${l} điểm` : LEVEL_NAME[l]}
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
            items={[
              ...order.map((t) => ({ label: `Đạt ${t === 'TOEIC' ? `TOEIC ${target}` : LEVEL_NAME[target]}`, value: `${passedOf(t)}/${students.length}`, note: `từ ${t === 'VSTEP' ? num(minScoreOf(t, target), 1) : minScoreOf(t, target)} điểm, chuyên cần ≥ ${MIN_ATTENDANCE}%`, icon: Award, tone: 'emerald' as const })),
              { label: 'Chuyên cần TB', value: atts.length ? `${Math.round(atts.reduce((a, x) => a + x, 0) / atts.length)}%` : '—', note: 'các buổi đã điểm danh', icon: Percent, tone: 'sky' as const },
              { label: 'Còn thiếu bài', value: rows.filter((r) => r.missing > 0).length, note: 'học viên chưa nộp đủ', icon: UserX, tone: 'rose' as const },
            ]}
          />

          {order.map((t) => (
            <ExamSheet key={t} type={t} className={cls.name} students={students} exam={exams[t]} attendance={attendance} target={target} />
          ))}

          <Panel title={`Điểm bài tập trên lớp · ${cls.name}`} sub={`Điểm các bài giáo viên giao, theo thang của từng bài — tách riêng, không tính vào điểm thi${order[0] ? ` ${order[0]}` : ''}. Điểm quá trình = 70% trung bình các bài (quy về thang 10) + 30% chuyên cần`} flush>
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
                      <th className={cn(tbl.th, 'text-right')}>Điểm quá trình</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ st, ps }) => (
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
                        <td className={cn(tbl.td, 'text-right font-semibold tabular-nums text-slate-900')}>{ps === null ? '—' : ps.toLocaleString(appLocale(), { minimumFractionDigits: 1 })}</td>
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
