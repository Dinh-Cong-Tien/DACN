import React, { useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { ASSIGNMENT_TYPE_LABEL, MOCK_ASSIGNMENTS, MOCK_CLASSES, describeTarget } from '@/shared/mocks';
import type { Assignment, AssignmentTarget } from '@/shared/types';
import { assignmentHref, cn, formatDateTime } from '@/shared/utils';
import { ConfirmDialog } from '@/shared/components/ui';
import { Figures, Meter, Panel, Status, TBtn, TPageHead, TTabs, inputCls, tbl, type StatusTone } from '../components/TeacherKit';
import { AssignDialog } from '../components/AssignDialog';

const STATUS: Record<Assignment['status'], [StatusTone, string]> = { OPEN: ['green', 'Đang mở'], CLOSED: ['gray', 'Đã đóng'], DRAFT: ['amber', 'Bản nháp'] };

/** Điểm TB: đề full hiện theo thang điểm, bài luyện / ngữ pháp hiện số câu đúng */
const avgText = (a: Assignment) => (a.avgScore === undefined ? '—' : a.type === 'PRACTICE' || a.type === 'GRAMMAR' ? `${a.avgScore} câu` : String(a.avgScore));

export const TeacherAssignmentsPage: React.FC = () => {
  useDocumentTitle('Bài tập');
  // Mở từ trang Học liệu: state.assign mang sẵn nội dung cần giao
  const location = useLocation();
  const preset = (location.state as { assign?: AssignmentTarget; classId?: string } | null) ?? null;
  const [rows, setRows] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [status, setStatus] = useState<'ALL' | Assignment['status']>('ALL');
  const [classId, setClassId] = useState('');
  const [open, setOpen] = useState(Boolean(preset?.assign));
  const [deleting, setDeleting] = useState<Assignment | null>(null);

  const now = Date.now();
  const byClass = rows.filter((a) => !classId || a.classId === classId);
  const list = byClass.filter((a) => status === 'ALL' || a.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openRows = byClass.filter((a) => a.status === 'OPEN');
  const overdue = openRows.filter((a) => new Date(a.dueDate).getTime() < now);
  const rate = openRows.length ? Math.round((openRows.reduce((a, r) => a + r.submitted / r.total, 0) / openRows.length) * 100) : 0;

  const setRowStatus = (a: Assignment, s: Assignment['status']) => {
    setRows((all) => all.map((x) => (x.id === a.id ? { ...x, status: s } : x)));
    toast.info(s === 'CLOSED' ? 'Đã đóng bài tập' : 'Đã mở bài tập', a.title);
  };

  const save = (a: Assignment) => {
    setRows((s) => [a, ...s]);
    setOpen(false);
    toast.success(a.status === 'DRAFT' ? 'Đã lưu nháp' : 'Đã giao bài', a.status === 'DRAFT' ? a.title : `${a.total} học viên lớp ${a.className} nhận được thông báo.`);
  };

  return (
    <div className="space-y-6">
      <TPageHead
        title="Bài tập"
        sub="Giao đề thi thử, bài giảng, chủ điểm ngữ pháp, bộ từ vựng, đề Viết / Nói cho từng lớp và theo dõi tình hình nộp bài."
        actions={
          <TBtn variant="primary" icon={<Plus />} onClick={() => setOpen(true)}>
            Giao bài tập
          </TBtn>
        }
      />

      <Figures
        items={[
          { label: 'Đang mở', value: openRows.length, note: `${byClass.length} bài đã tạo` },
          { label: 'Quá hạn chưa đóng', value: overdue.length, note: overdue.length ? 'nên đóng hoặc gia hạn' : 'không có' },
          { label: 'Bản nháp', value: byClass.filter((a) => a.status === 'DRAFT').length, note: 'chưa gửi cho học viên' },
          { label: 'Tỷ lệ nộp bài', value: `${rate}%`, note: 'trung bình các bài đang mở' },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <TTabs
          className="flex-1"
          value={status}
          onChange={(k) => setStatus(k as typeof status)}
          items={[
            { key: 'ALL', label: 'Tất cả', count: byClass.length },
            { key: 'OPEN', label: 'Đang mở', count: openRows.length },
            { key: 'CLOSED', label: 'Đã đóng', count: byClass.filter((a) => a.status === 'CLOSED').length },
            { key: 'DRAFT', label: 'Bản nháp', count: byClass.filter((a) => a.status === 'DRAFT').length },
          ]}
        />
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'sm:w-60')} aria-label="Lọc theo lớp">
          <option value="">Tất cả lớp</option>
          {MOCK_CLASSES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Panel flush>
        {list.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">Không có bài tập nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Bài tập</th>
                  <th className={tbl.th}>Hạn nộp</th>
                  <th className={cn(tbl.th, 'w-44')}>Đã nộp</th>
                  <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                  <th className={tbl.th}>Trạng thái</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const late = a.status === 'OPEN' && new Date(a.dueDate).getTime() < now;
                  return (
                    <tr key={a.id} className={tbl.tr}>
                      <td className={cn(tbl.td, 'min-w-[320px]')}>
                        <p className="font-medium text-slate-900">{a.title}</p>
                        <p className="mt-0.5 text-[12px] text-slate-500">
                          {a.className} · {ASSIGNMENT_TYPE_LABEL[a.type]}
                        </p>
                        <p className="text-[12px] text-slate-500">{describeTarget(a.target)}</p>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap')}>
                        <p className="tabular-nums text-slate-700">{formatDateTime(a.dueDate)}</p>
                        {late && <p className="text-[12px] text-rose-600">Đã quá hạn</p>}
                      </td>
                      <td className={tbl.td}>
                        <span className="flex items-center gap-2">
                          <Meter value={(a.submitted / a.total) * 100} tone={late ? 'red' : 'indigo'} className="flex-1" />
                          <span className="w-12 text-right text-[13px] tabular-nums text-slate-600">
                            {a.submitted}/{a.total}
                          </span>
                        </span>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap text-right tabular-nums')}>{avgText(a)}</td>
                      <td className={tbl.td}>
                        <Status tone={STATUS[a.status][0]}>{STATUS[a.status][1]}</Status>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                        <span className="inline-flex gap-1">
                          <a href={assignmentHref(a.target)} target="_blank" rel="noreferrer" title="Xem bài như học viên" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          {a.status === 'DRAFT' ? (
                            <TBtn size="sm" onClick={() => setRowStatus(a, 'OPEN')}>
                              Giao
                            </TBtn>
                          ) : (
                            <TBtn size="sm" variant="ghost" onClick={() => setRowStatus(a, a.status === 'OPEN' ? 'CLOSED' : 'OPEN')}>
                              {a.status === 'OPEN' ? 'Đóng' : 'Mở lại'}
                            </TBtn>
                          )}
                          <TBtn size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700" onClick={() => setDeleting(a)}>
                            Xoá
                          </TBtn>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AssignDialog open={open} onClose={() => setOpen(false)} onSave={save} initial={preset?.assign ? { target: preset.assign, classId: preset.classId } : undefined} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          setRows((s) => s.filter((x) => x.id !== deleting.id));
          toast.success('Đã xoá bài tập', deleting.title);
          setDeleting(null);
        }}
        title="Xoá bài tập?"
        message={deleting ? `"${deleting.title}" sẽ bị gỡ khỏi lớp ${deleting.className}, kể cả bài học viên đã nộp.` : ''}
        confirmText="Xoá"
        danger
      />
    </div>
  );
};
