import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, BellRing, GraduationCap, Search, TrendingDown, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import type { ClassStudent, DeptStudent } from '@/shared/types';
import { headApi, useHeadClasses, useHeadStudents, type HeadClass } from '@/shared/api/head';
import { errorMessage } from '@/shared/api/client';
import { Avatar } from '@/shared/components/ui';
import { cn, timeAgo, staffPath, formatNumber } from '@/shared/utils';
import { pooledAttendance } from '@/shared/constants/staff';
import { Figures, Panel, Status, TBtn, TPageHead, TTabs, inputCls, tbl, CompletionMeter } from '@/roles/teacher/components/TeacherKit';
import { STUDENT_STATUS } from './HeadClassDetailPage';

const EMPTY_S: DeptStudent[] = [];
const EMPTY_C: HeadClass[] = [];

/** Học viên toàn bộ môn: phát hiện sớm học viên nguy cơ để nhắc giáo viên chủ nhiệm */
export const HeadStudentsPage: React.FC = () => {
  useDocumentTitle('Học viên bộ môn');
  const [status, setStatus] = useState<'ALL' | ClassStudent['status']>('ALL');
  const [classId, setClassId] = useState('ALL');
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [reminded, setReminded] = useState<string[]>([]);
  const studentsQ = useHeadStudents();
  const DEPT_STUDENTS = studentsQ.data ?? EMPTY_S;
  const DEPT_CLASSES = useHeadClasses().data ?? EMPTY_C;
  const clsOf = (id: string) => DEPT_CLASSES.find((c) => c.id === id) ?? ({ id, name: '—', teacherName: '—' } as HeadClass);

  const scope = DEPT_STUDENTS.filter((s) => classId === 'ALL' || s.classId === classId);
  const list = scope.filter((s) => (status === 'ALL' || s.status === status) && (s.name.toLowerCase().includes(q.toLowerCase()) || s.email.includes(q.toLowerCase())));
  const risk = DEPT_STUDENTS.filter((s) => s.status === 'RISK');
  const key = (s: DeptStudent) => `${s.id}:${s.classId}`;
  const remind = async (rows: DeptStudent[]) => {
    const fresh = rows.filter((s) => !reminded.includes(key(s)));
    if (!fresh.length) return toast.info('Đã nhắc trước đó', 'Giáo viên đã nhận được nhắc nhở cho các học viên này.');
    try {
      await Promise.all(fresh.map((s) => headApi.remindTeacher(s.id, s.classId)));
      setReminded((r) => [...r, ...fresh.map(key)]);
      const teachers = new Set(fresh.map((s) => clsOf(s.classId).teacherName));
      toast.success('Đã nhắc giáo viên chủ nhiệm', `${fresh.length} học viên · gửi tới ${[...teachers].join(', ')}`);
    } catch (e) {
      toast.error('Không gửi được nhắc nhở', errorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Bộ môn"
        title="Học viên bộ môn"
        sub="Kết quả, chuyên cần và mức độ hoạt động của học viên trong mọi lớp. Học viên nguy cơ bỏ học được gửi nhắc cho giáo viên chủ nhiệm."
        actions={
          <TBtn variant="primary" icon={<BellRing />} disabled={!risk.length} onClick={() => void remind(risk)}>
            Nhắc GV về {risk.length} học viên nguy cơ
          </TBtn>
        }
      />

      <Figures
        items={[
          { label: 'Học viên theo dõi', value: new Set(DEPT_STUDENTS.map((s) => s.id)).size, note: `trong ${DEPT_CLASSES.length} lớp của bộ môn`, icon: Users, tone: 'indigo' },
          { label: 'Nguy cơ bỏ học', value: new Set(risk.map((s) => s.id)).size, note: 'chuyên cần thấp, lâu không học', icon: AlertTriangle, tone: 'rose' },
          { label: 'Cần nhắc', value: new Set(DEPT_STUDENTS.filter((s) => s.status === 'WARNING').map((s) => s.id)).size, icon: TrendingDown, tone: 'amber' },
          { label: 'Chuyên cần TB', value: DEPT_CLASSES.some((c) => c.attendanceMarks) ? `${pooledAttendance(DEPT_CLASSES)}%` : '—', icon: GraduationCap, tone: 'emerald' },
        ]}
      />

      <Panel flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 pt-3 lg:flex-row lg:items-end lg:justify-between">
          <TTabs
            className="border-b-0"
            value={status}
            onChange={(k) => setStatus(k as typeof status)}
            items={[
              { key: 'ALL', label: 'Tất cả', count: scope.length },
              { key: 'RISK', label: 'Nguy cơ bỏ học', count: scope.filter((s) => s.status === 'RISK').length },
              { key: 'WARNING', label: 'Cần nhắc', count: scope.filter((s) => s.status === 'WARNING').length },
              { key: 'GOOD', label: 'Ổn định', count: scope.filter((s) => s.status === 'GOOD').length },
            ]}
          />
          <div className="flex flex-col gap-2 pb-3 sm:flex-row">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'sm:w-56')} aria-label="Lọc theo lớp">
              <option value="ALL">Tất cả lớp</option>
              {DEPT_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="relative sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm học viên" className={cn(inputCls, 'w-full pl-9')} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Học viên</th>
                <th className={tbl.th}>Lớp · Giáo viên</th>
                <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                <th className={cn(tbl.th, 'w-40')}>Hoàn thành bài</th>
                <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
                <th className={tbl.th}>Hoạt động</th>
                <th className={tbl.th}>Tình trạng</th>
                <th className={tbl.th} />
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const c = clsOf(s.classId);
                return (
                  <tr key={key(s)} className={tbl.tr}>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                        <span className="min-w-0">
                          <Link to={staffPath(`/students/${s.id}`)} className="block whitespace-nowrap font-medium text-slate-900 hover:text-indigo-700">
                            {s.name}
                          </Link>
                          <span className="block text-[12px] text-slate-500">{s.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap')}>
                      <Link to={staffPath(`/classes/${c.id}`)} className="text-slate-800 hover:text-indigo-700">
                        {c.name}
                      </Link>
                      <p className="text-[12px] text-slate-500">{c.teacherName}</p>
                    </td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{s.avgScore == null ? '—' : formatNumber(s.avgScore)}</td>
                    <td className={tbl.td}>
                      <CompletionMeter value={s.completion} />
                    </td>
                    <td className={cn(tbl.td, 'text-right tabular-nums', s.attendance !== null && s.attendance < 75 && 'font-semibold text-rose-600')}>{s.attendance === null ? '—' : `${s.attendance}%`}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{timeAgo(s.lastActive)}</td>
                    <td className={tbl.td}>
                      <Status tone={STUDENT_STATUS[s.status].tone}>{STUDENT_STATUS[s.status].label}</Status>
                    </td>
                    <td className={cn(tbl.td, 'text-right')}>
                      {s.status !== 'GOOD' &&
                        (reminded.includes(key(s)) ? (
                          <span className="whitespace-nowrap text-[12px] text-slate-400">Đã nhắc GV</span>
                        ) : (
                          <TBtn size="sm" onClick={() => void remind([s])}>
                            Nhắc GV
                          </TBtn>
                        ))}
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-500">
                    {studentsQ.isLoading ? "Đang tải…" : "Không có học viên nào khớp bộ lọc."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
