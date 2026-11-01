import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { CLASS_MISTAKE_CAUSES, CLASS_PART_ACCURACY, CLASS_SCORE_DIST, MISTAKE_CAUSE_LABEL, MOCK_ASSIGNMENTS, MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_TESTS, TOEIC_PARTS_INFO, VSTEP_PARTS_INFO } from '@/shared/mocks';
import type { AssignmentTarget } from '@/shared/types';
import { cn, timeAgo } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Meter, Panel, Status, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';

const PART_INFO = [...TOEIC_PARTS_INFO, ...VSTEP_PARTS_INFO];

/** Thống kê một lớp: cùng chỉ số học viên thấy ở trang Tiến độ (điểm thi thử, % đúng từng Part, lỗi sai), giáo viên giao bài bù ngay từ chỗ yếu */
export const TeacherAnalyticsPage: React.FC = () => {
  useDocumentTitle('Thống kê lớp học');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const classId = MOCK_CLASSES.find((c) => c.id === params.get('class'))?.id ?? MOCK_CLASSES[0].id;
  const setClassId = (id: string) => setParams({ class: id }, { replace: true });
  const cls = MOCK_CLASSES.find((c) => c.id === classId) ?? MOCK_CLASSES[0];
  const accuracy = CLASS_PART_ACCURACY[cls.examType];
  const dist = CLASS_SCORE_DIST[cls.examType];
  const distMax = Math.max(...dist.map((d) => d.value));
  const causeTotal = CLASS_MISTAKE_CAUSES.reduce((a, c) => a + c.count, 0);
  const weakest = [...accuracy].sort((a, b) => a.value - b.value)[0];
  const assignments = MOCK_ASSIGNMENTS.filter((a) => a.classId === cls.id && a.status !== 'DRAFT');
  const students = [...MOCK_CLASS_STUDENTS].sort((a, b) => b.avgScore - a.avgScore);
  const practiceTest = MOCK_TESTS.find((t) => t.examType === cls.examType)!;

  /** Giao luyện riêng một phần thi đang yếu (Viết / Nói của VSTEP giao bằng đề Viết / Nói) */
  const assignPart = (partId: string) => {
    const target: AssignmentTarget =
      partId === 'VSTEP_WRITING' ? { kind: 'WRITING', taskId: 'vs-w-2' } : partId === 'VSTEP_SPEAKING' ? { kind: 'SPEAKING', partId: 'vs-s-2' } : { kind: 'EXAM', testId: practiceTest.id, setup: { mode: 'PRACTICE', parts: [partId], minutes: PART_INFO.find((p) => p.id === partId)?.minutes ?? null } };
    navigate('/teacher/assignments', { state: { assign: target, classId: cls.id } });
  };

  return (
    <div className="space-y-6">
      <TPageHead
        title="Thống kê lớp học"
        sub={`${cls.name} · ${cls.examType} · ${cls.studentsCount} học viên`}
        actions={
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'w-60')} aria-label="Chọn lớp">
            {MOCK_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      <Figures
        items={[
          { label: 'Điểm thi thử trung bình', value: cls.avgScore, note: cls.examType === 'TOEIC' ? 'thang 990' : 'thang 10' },
          { label: 'Hoàn thành bài tập', value: `${cls.completionRate}%`, note: `${assignments.length} bài đã giao` },
          { label: 'Chuyên cần', value: `${cls.attendanceRate}%`, note: 'tỷ lệ có mặt các buổi học' },
          { label: 'Phần yếu nhất', value: PART_INFO.find((p) => p.id === weakest.partId)?.name ?? '', note: `đúng ${weakest.value}%` },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Tỷ lệ đúng theo phần thi" sub="Trung bình cả lớp, bài thi thử gần nhất">
          <ul className="space-y-1">
            {accuracy.map((a) => {
              const info = PART_INFO.find((p) => p.id === a.partId);
              return (
                <li key={a.partId} className="grid grid-cols-[minmax(0,210px)_1fr_44px_auto] items-center gap-3 py-1 text-sm">
                  <span className="truncate text-slate-700">
                    {info?.name} <span className="text-slate-400">· {info?.nameVi}</span>
                  </span>
                  <Meter value={a.value} tone={a.value < 60 ? 'red' : a.value < 70 ? 'amber' : 'indigo'} className="h-2" />
                  <span className="text-right tabular-nums text-slate-800">{a.value}%</span>
                  <TBtn size="sm" variant="ghost" onClick={() => assignPart(a.partId)} className={a.value >= 70 ? 'invisible' : undefined}>
                    Giao luyện
                  </TBtn>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Phân bố điểm" sub={`Số học viên theo khoảng điểm · ${dist.reduce((a, d) => a + d.value, 0)} bài`}>
          <ul className="space-y-1">
            {dist.map((d) => (
              <li key={d.label} className="grid grid-cols-[minmax(0,150px)_1fr_32px] items-center gap-3 py-1 text-sm">
                <span className="text-slate-700">{d.label}</span>
                <Meter value={(d.value / distMax) * 100} className="h-2" />
                <span className="text-right tabular-nums text-slate-800">{d.value}</span>
              </li>
            ))}
          </ul>
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
                          <Meter value={(a.submitted / a.total) * 100} className="flex-1" />
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
          <table className={tbl.table}>
            <tbody>
              {CLASS_MISTAKE_CAUSES.map((c) => (
                <tr key={c.cause} className={tbl.tr}>
                  <td className={cn(tbl.td, 'text-slate-800')}>{MISTAKE_CAUSE_LABEL[c.cause]?.label}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.count} câu</td>
                  <td className={cn(tbl.td, 'w-16 text-right tabular-nums text-slate-500')}>{Math.round((c.count / causeTotal) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel title="Kết quả từng học viên" sub="Sắp theo điểm trung bình" flush>
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
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{s.avgScore}</td>
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
      </Panel>
    </div>
  );
};
