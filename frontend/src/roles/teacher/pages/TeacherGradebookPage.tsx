import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Download, Percent, TrendingUp, UserX } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { GRADEBOOK, MOCK_ASSIGNMENTS, MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_SESSIONS } from '@/shared/mocks';
import type { Assignment, ClassStudent } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Panel, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';

/** Điểm tối đa của một bài: đề full theo thang kỳ thi, bài luyện / ngữ pháp theo số câu, Viết / Nói thang 10 */
const maxOf = (a: Assignment, exam: string) => (a.type === 'MOCK_TEST' ? (exam === 'TOEIC' ? 990 : 10) : a.type === 'ESSAY' || a.type === 'SPEAKING' ? 10 : a.id === 'as-2' ? 46 : a.id === 'as-11' ? 40 : 30);

/** Bảng điểm quá trình: điểm từng bài đã chấm, chuyên cần, điểm quá trình quy về thang 10 */
export const TeacherGradebookPage: React.FC = () => {
  useDocumentTitle('Bảng điểm');
  const [params, setParams] = useSearchParams();
  const cls = MOCK_CLASSES.find((c) => c.id === params.get('class')) ?? MOCK_CLASSES[0];
  const cols = MOCK_ASSIGNMENTS.filter((a) => a.classId === cls.id && a.status !== 'DRAFT' && (a.avgScore !== undefined || a.type === 'ESSAY' || a.type === 'SPEAKING'));
  const done = MOCK_SESSIONS.filter((s) => s.classId === cls.id && s.status === 'DONE');

  const scoreOf = (st: ClassStudent, a: Assignment): number | null => {
    const g = GRADEBOOK[st.id]?.[a.id];
    if (g !== undefined) return g;
    const k = Number(st.id.split('-')[1]);
    const max = maxOf(a, cls.examType);
    if (st.status === 'RISK' && k % 2 === 0) return null;
    const ratio = Math.min(1, st.avgScore / 900 + ((k * 7) % 9) / 100 - 0.04);
    return max === 10 ? Math.round(ratio * 20) / 2 : Math.round(ratio * max);
  };
  const attendance = (st: ClassStudent) => {
    const v = done.map((s) => s.attendance?.[st.id]).filter(Boolean);
    return v.length ? Math.round((v.filter((x) => x === 'PRESENT' || x === 'LATE').length / v.length) * 100) : 100;
  };
  /** Điểm quá trình = 70% trung bình các bài (quy về thang 10, bài chưa nộp tính 0) + 30% chuyên cần */
  const processScore = (st: ClassStudent) => {
    const parts = cols.map((a) => ((scoreOf(st, a) ?? 0) / maxOf(a, cls.examType)) * 10);
    const avg = parts.length ? parts.reduce((x, y) => x + y, 0) / parts.length : 0;
    return Math.round((avg * 0.7 + (attendance(st) / 10) * 0.3) * 10) / 10;
  };

  const rows = MOCK_CLASS_STUDENTS.map((st) => ({ st, ps: processScore(st), att: attendance(st), missing: cols.filter((a) => scoreOf(st, a) === null).length })).sort((a, b) => b.ps - a.ps);
  const avg = rows.length ? Math.round((rows.reduce((a, r) => a + r.ps, 0) / rows.length) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Học viên"
        title="Bảng điểm"
        sub="Điểm quá trình của lớp: điểm các bài đã chấm và chuyên cần. Dùng để xét điều kiện thi cuối khoá và gửi báo cáo cho trung tâm."
        actions={
          <>
            <select value={cls.id} onChange={(e) => setParams({ class: e.target.value }, { replace: true })} className={cn(inputCls, 'w-60')} aria-label="Chọn lớp">
              {MOCK_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <TBtn icon={<Download />} onClick={() => toast.success('Đã xuất bảng điểm', `${cls.name} · file Excel`)}>
              Xuất Excel
            </TBtn>
          </>
        }
      />

      <Figures
        items={[
          { label: 'Điểm quá trình TB', value: avg.toLocaleString('vi-VN'), note: 'thang 10', icon: TrendingUp, tone: 'indigo' },
          { label: 'Đủ điều kiện thi', value: `${rows.filter((r) => r.ps >= 5 && r.att >= 80).length}/${rows.length}`, note: 'điểm ≥ 5 và chuyên cần ≥ 80%', icon: Award, tone: 'emerald' },
          { label: 'Chuyên cần TB', value: `${Math.round(rows.reduce((a, r) => a + r.att, 0) / Math.max(1, rows.length))}%`, note: `${done.length} buổi đã dạy`, icon: Percent, tone: 'sky' },
          { label: 'Còn thiếu bài', value: rows.filter((r) => r.missing > 0).length, note: 'học viên chưa nộp đủ', icon: UserX, tone: 'rose' },
        ]}
      />

      <Panel title={cls.name} sub="Điểm quá trình = 70% trung bình các bài (quy về thang 10, bài chưa nộp tính 0) + 30% chuyên cần" flush>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={cn(tbl.th, 'sticky left-0 bg-slate-50')}>Học viên</th>
                {cols.map((a) => (
                  <th key={a.id} className={cn(tbl.th, 'min-w-[120px] text-right')}>
                    <span className="block font-semibold text-slate-700">{a.title.length > 26 ? `${a.title.slice(0, 26)}…` : a.title}</span>
                    <span className="block font-normal text-slate-400">/ {maxOf(a, cls.examType)}</span>
                  </th>
                ))}
                <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
                <th className={cn(tbl.th, 'text-right')}>Điểm quá trình</th>
                <th className={tbl.th}>Xét thi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ st, ps, att }) => {
                const ok = ps >= 5 && att >= 80;
                return (
                  <tr key={st.id} className={tbl.tr}>
                    <td className={cn(tbl.td, 'sticky left-0 bg-white')}>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={st.name} src={st.avatarUrl} size="xs" />
                        <span className="whitespace-nowrap font-medium text-slate-900">{st.name}</span>
                      </span>
                    </td>
                    {cols.map((a) => {
                      const v = scoreOf(st, a);
                      return (
                        <td key={a.id} className={cn(tbl.td, 'text-right tabular-nums', v === null ? 'text-rose-500' : 'text-slate-800')}>
                          {v === null ? 'Chưa nộp' : v.toLocaleString('vi-VN')}
                        </td>
                      );
                    })}
                    <td className={cn(tbl.td, 'text-right tabular-nums', att < 80 ? 'text-rose-600' : 'text-slate-800')}>{att}%</td>
                    <td className={cn(tbl.td, 'text-right font-display text-[15px] font-bold tabular-nums text-slate-900')}>{ps.toLocaleString('vi-VN', { minimumFractionDigits: 1 })}</td>
                    <td className={tbl.td}>
                      <span className={cn('text-[13px] font-semibold', ok ? 'text-emerald-600' : 'text-rose-600')}>{ok ? 'Đủ điều kiện' : att < 80 ? 'Thiếu chuyên cần' : 'Chưa đạt'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
