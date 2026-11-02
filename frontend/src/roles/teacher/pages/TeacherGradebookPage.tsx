import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Download, Percent, TrendingUp, UserX } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { useGradebook, useTeacherClasses, useTeacherStudents } from '@/shared/api/teacher';
import { cn } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Panel, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';

/** Ô điểm: số = đã chấm; còn lại hiện theo trạng thái bài nộp */
const STATE_TEXT: Record<string, [string, string]> = {
  SUBMITTED: ['Chờ chấm', 'text-amber-600'],
  LATE: ['Nộp muộn', 'text-amber-600'],
  TODO: ['Chưa nộp', 'text-rose-500'],
  MISSED: ['Không nộp', 'text-rose-600'],
};

/** Bảng điểm quá trình: điểm từng bài đã chấm, chuyên cần, điểm quá trình quy về thang 10 */
export const TeacherGradebookPage: React.FC = () => {
  useDocumentTitle('Bảng điểm');
  const [params, setParams] = useSearchParams();
  const classesQ = useTeacherClasses();
  const classes = classesQ.data ?? [];
  const cls = classes.find((c) => c.id === params.get('class')) ?? classes[0];
  const gb = useGradebook(cls?.id);
  const roster = useTeacherStudents({ classId: cls?.id }).data ?? [];

  if (classesQ.isLoading || (cls && gb.isLoading)) return <TLoading />;
  if (classesQ.error) return <TError error={classesQ.error} onRetry={() => classesQ.refetch()} />;

  const cols = gb.data?.assignments ?? [];
  const students = gb.data?.students ?? [];
  /** null = chưa có buổi nào điểm danh */
  const attendance = (id: string) => roster.find((r) => r.id === id)?.attendanceRate ?? null;
  const scoreOf = (sid: string, aid: string) => gb.data?.scores[sid]?.[aid] ?? null;
  const stateOf = (sid: string, aid: string) => gb.data?.states[sid]?.[aid];
  /** Điểm quá trình = 70% trung bình các bài (quy về thang 10; bài quá hạn chưa nộp tính 0, bài chưa đến hạn / chờ chấm bỏ qua) + 30% chuyên cần */
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

  const rows = students
    .map((st) => ({ st, ps: processScore(st.id), att: attendance(st.id), missing: cols.filter((a) => ['TODO', 'MISSED'].includes(stateOf(st.id, a.id) ?? '')).length }))
    .sort((a, b) => (b.ps ?? -1) - (a.ps ?? -1));
  const scored = rows.filter((r) => r.ps !== null);
  const avg = scored.length ? Math.round((scored.reduce((a, r) => a + (r.ps ?? 0), 0) / scored.length) * 10) / 10 : null;
  const attRows = rows.filter((r) => r.att !== null);
  const eligible = (r: (typeof rows)[number]) => r.ps !== null && r.ps >= 5 && (r.att ?? 100) >= 80;

  /** Xuất CSV (Excel mở được) từ dữ liệu đang hiển thị */
  const exportCsv = () => {
    if (!cls) return;
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Học viên', 'Email', ...cols.map((a) => `${a.title} (/${a.maxScore})`), 'Chuyên cần (%)', 'Điểm quá trình', 'Xét thi'];
    const lines = rows.map(({ st, ps, att }) => [st.name, st.email, ...cols.map((a) => scoreOf(st.id, a.id) ?? STATE_TEXT[stateOf(st.id, a.id) ?? '']?.[0] ?? ''), att ?? '', ps ?? '', eligible({ st, ps, att, missing: 0 }) ? 'Đủ điều kiện' : 'Chưa đạt']);
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
        eyebrow="Học viên"
        title="Bảng điểm"
        sub="Điểm quá trình của lớp: điểm các bài đã chấm và chuyên cần. Dùng để xét điều kiện thi cuối khoá và gửi báo cáo cho trung tâm."
        actions={
          cls && (
            <>
              <select value={cls.id} onChange={(e) => setParams({ class: e.target.value }, { replace: true })} className={cn(inputCls, 'w-60 max-w-full')} aria-label="Chọn lớp">
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <TBtn icon={<Download />} onClick={exportCsv} disabled={!rows.length}>
                Xuất Excel
              </TBtn>
            </>
          )
        }
      />

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
              { label: 'Điểm quá trình TB', value: avg === null ? '—' : avg.toLocaleString('vi-VN'), note: 'thang 10', icon: TrendingUp, tone: 'indigo' },
              { label: 'Đủ điều kiện thi', value: `${rows.filter(eligible).length}/${rows.length}`, note: 'điểm ≥ 5 và chuyên cần ≥ 80%', icon: Award, tone: 'emerald' },
              { label: 'Chuyên cần TB', value: attRows.length ? `${Math.round(attRows.reduce((a, r) => a + (r.att ?? 0), 0) / attRows.length)}%` : '—', note: attRows.length ? 'các buổi đã điểm danh' : 'chưa điểm danh buổi nào', icon: Percent, tone: 'sky' },
              { label: 'Còn thiếu bài', value: rows.filter((r) => r.missing > 0).length, note: 'học viên chưa nộp đủ', icon: UserX, tone: 'rose' },
            ]}
          />

          <Panel title={cls.name} sub="Điểm quá trình = 70% trung bình các bài (quy về thang 10, bài quá hạn chưa nộp tính 0) + 30% chuyên cần" flush>
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
                      <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
                      <th className={cn(tbl.th, 'text-right')}>Điểm quá trình</th>
                      <th className={tbl.th}>Xét thi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const { st, ps, att } = r;
                      const ok = eligible(r);
                      return (
                        <tr key={st.id} className={tbl.tr}>
                          <td className={cn(tbl.td, 'sticky left-0 bg-white')}>
                            <span className="flex items-center gap-2.5">
                              <Avatar name={st.name} src={st.avatarUrl} size="xs" />
                              <span className="whitespace-nowrap font-medium text-slate-900">{st.name}</span>
                            </span>
                          </td>
                          {cols.map((a) => {
                            const v = scoreOf(st.id, a.id);
                            const s = STATE_TEXT[stateOf(st.id, a.id) ?? ''];
                            return (
                              <td key={a.id} className={cn(tbl.td, 'whitespace-nowrap text-right tabular-nums', v === null ? s?.[1] ?? 'text-slate-400' : 'text-slate-800')}>
                                {v !== null ? v.toLocaleString('vi-VN') : s?.[0] ?? '—'}
                              </td>
                            );
                          })}
                          <td className={cn(tbl.td, 'text-right tabular-nums', att !== null && att < 80 ? 'text-rose-600' : 'text-slate-800')}>{att === null ? '—' : `${att}%`}</td>
                          <td className={cn(tbl.td, 'text-right font-display text-[15px] font-bold tabular-nums text-slate-900')}>{ps === null ? '—' : ps.toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</td>
                          <td className={tbl.td}>
                            {ps === null ? (
                              <span className="text-[13px] text-slate-400">Chưa có dữ liệu</span>
                            ) : (
                              <span className={cn('text-[13px] font-semibold', ok ? 'text-emerald-600' : 'text-rose-600')}>{ok ? 'Đủ điều kiện' : att !== null && att < 80 ? 'Thiếu chuyên cần' : 'Chưa đạt'}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
