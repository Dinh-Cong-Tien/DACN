import React, { useEffect, useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useTeacherAssignments, useTeacherClasses, useTeacherLibrary, useTeacherMutation, type AssignmentInput, type TAssignment } from '@/shared/api/teacher';
import { ASSIGNMENT_TYPE_LABEL, describeTarget } from '@/shared/constants/teacher';
import type { Assignment, AssignmentTarget } from '@/shared/types';
import { assignmentHref, cn, formatDateTime } from '@/shared/utils';
import { ConfirmDialog } from '@/shared/components/ui';
import { Figures, Meter, Panel, Status, TBtn, TPageHead, TTabs, inputCls, tbl, type StatusTone } from '../components/TeacherKit';
import { AssignDialog } from '../components/AssignDialog';
import { TError, TLoading } from '../components/TeacherState';

const STATUS: Record<Assignment['status'], [StatusTone, string]> = { OPEN: ['green', 'Đang mở'], CLOSED: ['gray', 'Đã đóng'], DRAFT: ['amber', 'Bản nháp'] };

/** Điểm TB: đề full hiện theo thang điểm, bài luyện / ngữ pháp hiện số câu đúng */
const avgText = (a: TAssignment) => (a.avgScore === undefined ? '—' : a.type === 'PRACTICE' || a.type === 'GRAMMAR' ? `${a.avgScore} câu` : String(a.avgScore));

export const TeacherAssignmentsPage: React.FC = () => {
  useDocumentTitle('Bài tập');
  // Mở từ trang Học liệu: state.assign mang sẵn nội dung cần giao
  const location = useLocation();
  const preset = (location.state as { assign?: AssignmentTarget; classId?: string } | null) ?? null;
  const [params, setParams] = useSearchParams();
  const { data: rows = [], isLoading, error, refetch } = useTeacherAssignments();
  const classes = useTeacherClasses().data ?? [];
  const lib = useTeacherLibrary();
  const create = useTeacherMutation(teacherApi.createAssignment);
  const update = useTeacherMutation((v: { id: string; status: 'OPEN' | 'CLOSED' }) => teacherApi.updateAssignment(v.id, { status: v.status }));
  const remove = useTeacherMutation(teacherApi.deleteAssignment);
  const status = (['OPEN', 'CLOSED', 'DRAFT'].includes(params.get('status') ?? '') ? params.get('status') : 'ALL') as 'ALL' | Assignment['status'];
  const setStatus = (k: string) => setParams(k === 'ALL' ? {} : { status: k }, { replace: true });
  const [classId, setClassId] = useState('');
  const [open, setOpen] = useState(Boolean(preset?.assign) || params.get('new') === '1');
  // Menu "Giao bài mới": ?new=1 mở hộp thoại
  useEffect(() => {
    if (params.get('new') === '1') setOpen(true);
  }, [params]);
  const [deleting, setDeleting] = useState<TAssignment | null>(null);

  const now = Date.now();
  const byClass = rows.filter((a) => !classId || a.classId === classId);
  const list = byClass.filter((a) => status === 'ALL' || a.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openRows = byClass.filter((a) => a.status === 'OPEN');
  const overdue = openRows.filter((a) => a.dueDate && new Date(a.dueDate).getTime() < now);
  const withStudents = openRows.filter((r) => r.total > 0);
  const rate = withStudents.length ? Math.round((withStudents.reduce((a, r) => a + r.submitted / r.total, 0) / withStudents.length) * 100) : 0;

  const setRowStatus = (a: TAssignment, s: 'OPEN' | 'CLOSED') =>
    update.mutate(
      { id: a.id, status: s },
      {
        onSuccess: () => toast.info(s === 'CLOSED' ? 'Đã đóng bài tập' : a.status === 'DRAFT' ? 'Đã giao bài tập' : 'Đã mở lại bài tập', a.title),
        onError: (e) => toast.error('Không cập nhật được bài tập', errorMessage(e)),
      }
    );

  const close = () => {
    setOpen(false);
    if (params.get('new')) setParams({}, { replace: true });
  };

  const save = (input: AssignmentInput) =>
    create.mutate(input, {
      onSuccess: (a) => {
        close();
        toast.success(a.status === 'DRAFT' ? 'Đã lưu nháp' : 'Đã giao bài', a.status === 'DRAFT' ? a.title : `${a.total} học viên lớp ${a.className} nhận được thông báo.`);
      },
      onError: (e) => toast.error('Không giao được bài', errorMessage(e)),
    });

  if (isLoading) return <TLoading />;
  if (error) return <TError error={error} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Giảng dạy"
        title="Bài tập của lớp"
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
          onChange={setStatus}
          items={[
            { key: 'ALL', label: 'Tất cả', count: byClass.length },
            { key: 'OPEN', label: 'Đang mở', count: openRows.length },
            { key: 'CLOSED', label: 'Đã đóng', count: byClass.filter((a) => a.status === 'CLOSED').length },
            { key: 'DRAFT', label: 'Bản nháp', count: byClass.filter((a) => a.status === 'DRAFT').length },
          ]}
        />
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'sm:w-60')} aria-label="Lọc theo lớp">
          <option value="">Tất cả lớp</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Panel flush>
        {list.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">{rows.length ? 'Không có bài tập nào khớp bộ lọc.' : 'Chưa giao bài tập nào. Bấm “Giao bài tập” để bắt đầu.'}</p>
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
                  const late = a.status === 'OPEN' && !!a.dueDate && new Date(a.dueDate).getTime() < now;
                  return (
                    <tr key={a.id} className={tbl.tr}>
                      <td className={cn(tbl.td, 'min-w-[320px]')}>
                        <p className="font-medium text-slate-900">{a.title}</p>
                        <p className="mt-0.5 text-[12px] text-slate-500">
                          {a.className} · {ASSIGNMENT_TYPE_LABEL[a.type]}
                        </p>
                        <p className="text-[12px] text-slate-500">{describeTarget(a.target, lib)}</p>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap')}>
                        <p className="tabular-nums text-slate-700">{a.dueDate ? formatDateTime(a.dueDate) : 'Không hạn'}</p>
                        {late && <p className="text-[12px] text-rose-600">Đã quá hạn</p>}
                      </td>
                      <td className={tbl.td}>
                        <span className="flex items-center gap-2">
                          <Meter value={a.total ? (a.submitted / a.total) * 100 : 0} tone={late ? 'red' : 'indigo'} className="flex-1" />
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
                            <TBtn size="sm" disabled={update.isPending} onClick={() => setRowStatus(a, 'OPEN')}>
                              Giao
                            </TBtn>
                          ) : (
                            <TBtn size="sm" variant="ghost" disabled={update.isPending} onClick={() => setRowStatus(a, a.status === 'OPEN' ? 'CLOSED' : 'OPEN')}>
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

      <AssignDialog open={open} onClose={close} onSave={save} saving={create.isPending} initial={preset?.assign ? { target: preset.assign, classId: preset.classId } : undefined} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          const d = deleting;
          remove.mutate(d.id, { onSuccess: () => toast.success('Đã xoá bài tập', d.title), onError: (e) => toast.error('Không xoá được bài tập', errorMessage(e)) });
          setDeleting(null);
        }}
        title="Xoá bài tập?"
        message={deleting ? `"${deleting.title}" sẽ bị gỡ khỏi lớp ${deleting.className}. Điểm học viên đã nộp vẫn được lưu trong lịch sử.` : ''}
        confirmText="Xoá"
        danger
      />
    </div>
  );
};
