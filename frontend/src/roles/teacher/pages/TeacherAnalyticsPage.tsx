import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { useClassAnalytics, useTeacherAssignments, useTeacherClasses, useTeacherLibrary, useTeacherStudents } from '@/shared/api/teacher';
import { MISTAKE_CAUSE_TEXT, PART_FORMAT, partLabel, partName } from '@/shared/constants/teacher';
import type { AssignmentTarget } from '@/shared/types';
import { cn, timeAgo } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { BarChart, HBarChart, LineChart } from '@/shared/components/charts/Charts';
import { BarChart3, CalendarCheck, Target, TrendingUp } from 'lucide-react';
import { Figures, Meter, Panel, Status, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';
import { appLocale } from '@/shared/i18n';

/** Thống kê một lớp: cùng chỉ số học viên thấy ở trang Tiến độ (điểm thi thử, % đúng từng Part, lỗi sai), giáo viên giao bài bù ngay từ chỗ yếu */
export const TeacherAnalyticsPage: React.FC = () => {
  useDocumentTitle('Thống kê lớp học');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const classesQ = useTeacherClasses();
  const classes = classesQ.data ?? [];
  const cls = classes.find((c) => c.id === params.get('class')) ?? classes[0];
  const setClassId = (id: string) => setParams({ class: id }, { replace: true });
  const an = useClassAnalytics(cls?.id);
  const students = [...(useTeacherStudents({ classId: cls?.id }).data ?? [])].sort((a, b) => b.avgScore - a.avgScore);
  const assignments = (useTeacherAssignments({ classId: cls?.id }).data ?? []).filter((a) => a.status !== 'DRAFT');
  const lib = useTeacherLibrary();

  if (classesQ.isLoading || (cls && an.isLoading)) return <TLoading />;
  if (classesQ.error) return <TError error={classesQ.error} onRetry={() => classesQ.refetch()} />;
  if (!cls) {
    return (
      <div className="space-y-6">
        <TPageHead eyebrow="Học viên" title="Thống kê lớp học" />
        <Panel>
          <TEmpty title="Bạn chưa có lớp nào" sub="Thống kê hiện theo từng lớp bạn phụ trách." />
        </Panel>
      </div>
    );
  }

  const data = an.data;
  const accuracy = data?.partAccuracy ?? [];
  const dist = data?.scoreDist ?? [];
  const causes = data?.mistakeCauses ?? [];
  const causeTotal = causes.reduce((a, c) => a + c.count, 0);
  const weakest = [...accuracy].sort((a, b) => a.value - b.value)[0];
  const trendIdx = (data?.scoreTrend.values ?? []).map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0);
  const weekly = (data?.weeklyProgress ?? []).filter((w) => w.value !== null);
  const practiceTest = lib.tests.find((t) => t.examType === cls.examType);

  /** Giao luyện riêng một phần thi đang yếu (Viết / Nói của VSTEP giao bằng đề Viết / Nói) */
  const assignPart = (partId: string) => {
    const writing = lib.writing.find((w) => w.examType === cls.examType);
    const speaking = lib.speaking.find((w) => w.examType === cls.examType);
    const target: AssignmentTarget | undefined =
      partId === 'VSTEP_WRITING' ? (writing ? { kind: 'WRITING', taskId: writing.id } : undefined) : partId === 'VSTEP_SPEAKING' ? (speaking ? { kind: 'SPEAKING', partId: speaking.id } : undefined) : practiceTest ? { kind: 'EXAM', testId: practiceTest.slug, setup: { mode: 'PRACTICE', parts: [partId], minutes: PART_FORMAT[partId]?.minutes ?? null } } : undefined;
    navigate('/teacher/assignments', { state: { assign: target, classId: cls.id } });
  };

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Học viên"
        title="Thống kê lớp học"
        sub={`${cls.name} · ${cls.examType} · ${cls.studentsCount} học viên`}
        actions={
          <select value={cls.id} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'w-60 max-w-full')} aria-label="Chọn lớp">
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      {an.error && <TError error={an.error} onRetry={() => an.refetch()} />}

      <Figures
        items={[
          { label: 'Điểm thi thử trung bình', value: cls.avgScore || '—', note: cls.examType === 'TOEIC' ? 'thang 990' : 'thang 10' },
          { label: 'Hoàn thành bài tập', value: assignments.length ? `${cls.completionRate}%` : '—', note: `${assignments.length} bài đã giao` },
          { label: 'Chuyên cần', value: cls.attendanceMarks ? `${cls.attendanceRate}%` : '—', note: 'tỷ lệ có mặt các buổi học' },
          { label: 'Phần yếu nhất', value: weakest ? partName(weakest.partId) : '—', note: weakest ? `đúng ${weakest.value}%` : 'chưa có bài làm' },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Tỷ lệ đúng theo phần thi" sub="Trung bình các bài làm của học viên trong lớp · phần dưới 70% nên giao luyện thêm" icon={Target} tone="indigo">
          {accuracy.length === 0 ? (
            <TEmpty title="Chưa có bài làm" sub="Số liệu hiện khi học viên trong lớp làm đề thi thử hoặc luyện Part." />
          ) : (
            <HBarChart
              ariaLabel="Tỷ lệ đúng theo phần thi"
              max={100}
              unit="%"
              labelWidth={170}
              data={accuracy.map((a) => ({ label: partLabel(a.partId), value: a.value }))}
              action={(d, i) => (
                <TBtn size="sm" variant="ghost" onClick={() => assignPart(accuracy[i].partId)} className={d.value >= 70 ? 'invisible' : undefined}>
                  Giao luyện
                </TBtn>
              )}
            />
          )}
        </Panel>

        <Panel title="Phân bố điểm" sub={`Số học viên theo khoảng điểm · bài thi thử gần nhất của mỗi học viên`} icon={BarChart3} tone="violet">
          {dist.length === 0 ? (
            <TEmpty title="Chưa có bài thi thử" sub="Phân bố điểm hiện khi học viên làm full đề." />
          ) : (
            <BarChart ariaLabel="Phân bố điểm thi thử" data={dist.map((d) => ({ label: d.label.replace(/ \(.*\)/, ''), value: d.value }))} unit=" học viên" height={240} />
          )}
        </Panel>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Điểm thi thử trung bình theo tháng" sub={cls.examType === 'TOEIC' ? 'Thang 990 · 6 tháng gần nhất' : 'Thang 10 · 6 tháng gần nhất'} icon={TrendingUp} tone="emerald">
          {trendIdx.length < 2 ? (
            <TEmpty title={trendIdx.length ? 'Mới có dữ liệu một tháng' : 'Chưa có bài thi thử'} sub="Biểu đồ cần điểm của ít nhất hai tháng." />
          ) : (
            <LineChart ariaLabel="Điểm thi thử trung bình theo tháng" labels={trendIdx.map((i) => data!.scoreTrend.labels[i])} series={[{ name: 'Điểm TB', values: trendIdx.map((i) => data!.scoreTrend.values[i] as number) }]} min={data!.scoreTrend.min} format={(v) => v.toLocaleString(appLocale())} />
          )}
        </Panel>
        <Panel title="Tỷ lệ trả lời đúng theo tuần" sub="Trung bình mọi bài làm của học viên trong lớp, 6 tuần gần nhất" icon={CalendarCheck} tone="sky">
          {weekly.length < 2 ? (
            <TEmpty title={weekly.length ? 'Mới có dữ liệu một tuần' : 'Chưa có bài làm'} sub="Biểu đồ cần dữ liệu của ít nhất hai tuần." />
          ) : (
            <LineChart ariaLabel="Tỷ lệ trả lời đúng theo tuần" labels={weekly.map((w) => `${w.weekStart.slice(8, 10)}/${w.weekStart.slice(5, 7)}`)} series={[{ name: cls.name, values: weekly.map((w) => w.value as number) }]} min={0} max={100} unit="%" />
          )}
        </Panel>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Tình hình nộp bài" sub="Các bài đã giao cho lớp" flush>
          {assignments.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Lớp chưa có bài tập nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={tbl.table}>
                <thead className={tbl.thead}>
                  <tr>
                    <th className={tbl.th}>Bài tập</th>
                    <th className={cn(tbl.th, 'w-48')}>Đã nộp</th>
                    <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className={tbl.tr}>
                      <td className={cn(tbl.td, 'text-slate-800')}>{a.title}</td>
                      <td className={tbl.td}>
                        <span className="flex items-center gap-2">
                          <Meter value={a.total ? (a.submitted / a.total) * 100 : 0} className="flex-1" />
                          <span className="w-12 text-right text-[13px] tabular-nums text-slate-600">
                            {a.submitted}/{a.total}
                          </span>
                        </span>
                      </td>
                      <td className={cn(tbl.td, 'text-right tabular-nums')}>{a.avgScore ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Nguyên nhân lỗi sai" sub="Gom từ Sổ tay lỗi sai của học viên trong lớp" flush>
          {causes.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Chưa có lỗi sai nào được ghi nhận.</p>
          ) : (
            <table className={tbl.table}>
              <tbody>
                {causes.map((c) => (
                  <tr key={c.cause} className={tbl.tr}>
                    <td className={cn(tbl.td, 'text-slate-800')}>{MISTAKE_CAUSE_TEXT[c.cause] ?? c.cause}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.count} câu</td>
                    <td className={cn(tbl.td, 'w-16 text-right tabular-nums text-slate-500')}>{Math.round((c.count / causeTotal) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      <Panel title="Kết quả từng học viên" sub="Sắp theo điểm trung bình" flush>
        {students.length === 0 ? (
          <TEmpty title="Lớp chưa có học viên" />
        ) : (
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={cn(tbl.th, 'w-12 text-right')}>Hạng</th>
                  <th className={tbl.th}>Học viên</th>
                  <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                  <th className={cn(tbl.th, 'w-48')}>Hoàn thành bài tập</th>
                  <th className={cn(tbl.th, 'text-right')}>Số ngày học liên tục</th>
                  <th className={tbl.th}>Hoạt động gần nhất</th>
                  <th className={tbl.th}>Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className={tbl.tr}>
                    <td className={cn(tbl.td, 'text-right tabular-nums text-slate-400')}>{i + 1}</td>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={s.name} src={s.avatarUrl} size="xs" />
                        <span className="whitespace-nowrap font-medium text-slate-900">{s.name}</span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{s.avgScore || '—'}</td>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2">
                        <Meter value={s.completion} tone={s.completion < 65 ? 'red' : s.completion < 80 ? 'amber' : 'indigo'} className="flex-1" />
                        <span className="w-10 text-right text-[13px] tabular-nums text-slate-600">{s.completion}%</span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{s.streak}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{timeAgo(s.lastActive)}</td>
                    <td className={tbl.td}>
                      <Status tone={s.status === 'GOOD' ? 'green' : s.status === 'WARNING' ? 'amber' : 'red'}>{s.status === 'GOOD' ? 'Ổn định' : s.status === 'WARNING' ? 'Cần nhắc' : 'Nguy cơ bỏ học'}</Status>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};
