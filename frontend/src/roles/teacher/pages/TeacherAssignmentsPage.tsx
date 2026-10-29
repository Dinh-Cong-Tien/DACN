import React, { useState } from 'react';
import { Plus, ClipboardList, MoreHorizontal, Lock, Unlock, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_ASSIGNMENTS, MOCK_CLASSES, MOCK_TESTS } from '@/shared/mocks';
import type { Assignment, AssignmentType } from '@/shared/types';
import { formatDate } from '@/shared/utils';
import { Badge, Button, Card, Chip, Column, ConfirmDialog, DataTable, Dropdown, Input, Modal, PageHeader, ProgressBar, Select, StatCard, Stepper, Textarea } from '@/shared/components/ui';

const TYPE_LABEL: Record<AssignmentType, string> = { MOCK_TEST: 'Đề thi thử', PRACTICE: 'Luyện tập', ESSAY: 'Viết luận', SPEAKING: 'Nói' };
const TYPE_TONE: Record<AssignmentType, 'indigo' | 'emerald' | 'violet' | 'sky'> = { MOCK_TEST: 'indigo', PRACTICE: 'emerald', ESSAY: 'violet', SPEAKING: 'sky' };
const STATUS_LABEL: Record<Assignment['status'], string> = { OPEN: 'Đang mở', CLOSED: 'Đã đóng', DRAFT: 'Nháp' };

export const TeacherAssignmentsPage: React.FC = () => {
  useDocumentTitle('Bài tập & Đề thi');
  const [rows, setRows] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [status, setStatus] = useState<'ALL' | Assignment['status']>('ALL');
  const [classId, setClassId] = useState('');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [deleting, setDeleting] = useState<Assignment | null>(null);
  const [form, setForm] = useState({ classId: MOCK_CLASSES[0].id, type: 'MOCK_TEST' as AssignmentType, testId: MOCK_TESTS[0].id, title: '', dueDate: '', note: '' });

  const list = rows.filter((a) => (status === 'ALL' || a.status === status) && (!classId || a.classId === classId));
  const now = new Date();

  const toggleStatus = (a: Assignment) => {
    setRows((s) => s.map((x) => (x.id === a.id ? { ...x, status: x.status === 'OPEN' ? 'CLOSED' : 'OPEN' } : x)));
    toast.info(a.status === 'OPEN' ? 'Đã đóng bài tập' : 'Đã mở lại bài tập', a.title);
  };

  const remove = () => {
    if (!deleting) return;
    setRows((s) => s.filter((x) => x.id !== deleting.id));
    toast.success('Đã xoá bài tập', deleting.title);
    setDeleting(null);
  };

  const next = () => {
    if (step === 1 && form.type === 'MOCK_TEST' && !form.title) setForm((f) => ({ ...f, title: MOCK_TESTS.find((t) => t.id === f.testId)?.title ?? '' }));
    setStep((s) => s + 1);
  };

  const submit = () => {
    if (!form.title.trim() || !form.dueDate) return toast.error('Thiếu thông tin', 'Nhập tiêu đề và hạn nộp.');
    const cls = MOCK_CLASSES.find((c) => c.id === form.classId)!;
    setRows((s) => [{ id: `as-${Date.now().toString(36)}`, classId: cls.id, className: cls.name, title: form.title.trim(), type: form.type, dueDate: new Date(form.dueDate).toISOString(), submitted: 0, total: cls.studentsCount, status: 'OPEN', createdAt: new Date().toISOString().slice(0, 10) }, ...s]);
    setOpen(false);
    setStep(0);
    setForm({ classId: MOCK_CLASSES[0].id, type: 'MOCK_TEST', testId: MOCK_TESTS[0].id, title: '', dueDate: '', note: '' });
    toast.success('Đã giao bài', `${cls.studentsCount} học viên lớp ${cls.name} nhận được thông báo.`);
  };

  const cols: Column<Assignment>[] = [
    { key: 'title', header: 'Bài tập', render: (r) => (<div><p className="font-bold text-slate-900">{r.title}</p><p className="text-[11px] text-slate-500">{r.className}</p></div>) },
    { key: 'type', header: 'Loại', render: (r) => <Badge tone={TYPE_TONE[r.type]}>{TYPE_LABEL[r.type]}</Badge> },
    { key: 'dueDate', header: 'Hạn nộp', render: (r) => { const over = new Date(r.dueDate) < now && r.status === 'OPEN'; return (<div className="flex items-center gap-2"><span className="text-sm">{formatDate(r.dueDate)}</span>{over && <Badge tone="rose" size="xs">Quá hạn</Badge>}</div>); } },
    { key: 'submitted', header: 'Đã nộp', width: '170px', render: (r) => <ProgressBar value={r.total ? (r.submitted / r.total) * 100 : 0} size="sm" label={`${r.submitted}/${r.total}`} showValue tone="emerald" /> },
    { key: 'avgScore', header: 'Điểm TB', align: 'center', render: (r) => <span className="font-bold">{r.avgScore ?? '—'}</span> },
    { key: 'status', header: 'Trạng thái', render: (r) => <Badge tone={r.status === 'OPEN' ? 'emerald' : r.status === 'CLOSED' ? 'slate' : 'amber'} dot>{STATUS_LABEL[r.status]}</Badge> },
    {
      key: 'actions', header: '', align: 'right', width: '56px',
      render: (r) => (
        <Dropdown
          trigger={<button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><MoreHorizontal className="w-4 h-4" /></button>}
          items={[
            { label: r.status === 'OPEN' ? 'Đóng bài tập' : 'Mở bài tập', icon: r.status === 'OPEN' ? <Lock /> : <Unlock />, onClick: () => toggleStatus(r) },
            { divider: true, label: '' },
            { label: 'Xoá', icon: <Trash2 />, danger: true, onClick: () => setDeleting(r) },
          ]}
        />
      ),
    },
  ];

  const steps = [{ label: 'Lớp & loại' }, { label: 'Nội dung' }, { label: 'Hạn nộp' }];

  return (
    <div className="space-y-6">
      <PageHeader title="Bài tập & Đề thi" description="Giao bài tập về nhà, đề thi thử và bài tự luận theo hạn nộp." icon={<ClipboardList />} actions={<Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>Giao bài mới</Button>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Tổng bài tập" value={rows.length} tone="indigo" />
        <StatCard label="Đang mở" value={rows.filter((a) => a.status === 'OPEN').length} tone="emerald" />
        <StatCard label="Quá hạn" value={rows.filter((a) => a.status === 'OPEN' && new Date(a.dueDate) < now).length} tone="rose" />
        <StatCard label="Tỷ lệ nộp TB" value={Math.round((rows.reduce((s, a) => s + (a.total ? a.submitted / a.total : 0), 0) / rows.length) * 100)} suffix="%" tone="amber" />
      </div>

      <Card padding="sm" className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'OPEN', 'CLOSED', 'DRAFT'] as const).map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s === 'ALL' ? 'Tất cả' : STATUS_LABEL[s]}</Chip>
          ))}
        </div>
        <div className="md:ml-auto md:w-56">
          <Select inputSize="sm" placeholder="Tất cả lớp" options={MOCK_CLASSES.map((c) => ({ value: c.id, label: c.name }))} value={classId} onChange={(e) => setClassId(e.target.value)} />
        </div>
      </Card>

      <DataTable columns={cols} rows={list} emptyTitle="Không có bài tập" className="animate-fade-up" />

      <Modal open={open} onClose={() => setOpen(false)} title="Giao bài tập mới" size="lg" icon={<ClipboardList />}
        footer={
          <>
            {step > 0 && <Button variant="ghost" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep((s) => s - 1)}>Quay lại</Button>}
            {step < 2 ? <Button onClick={next} rightIcon={<ChevronRight className="w-4 h-4" />}>Tiếp tục</Button> : <Button variant="success" onClick={submit}>Giao bài</Button>}
          </>
        }
      >
        <Stepper steps={steps} current={step} className="mb-6" compact />
        {step === 0 && (
          <div className="space-y-4 animate-fade-up">
            <Select label="Lớp học" options={MOCK_CLASSES.map((c) => ({ value: c.id, label: `${c.name} (${c.studentsCount} HV)` }))} value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} />
            <Select label="Loại bài tập" options={(Object.keys(TYPE_LABEL) as AssignmentType[]).map((t) => ({ value: t, label: TYPE_LABEL[t] }))} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AssignmentType }))} />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            {form.type === 'MOCK_TEST' && <Select label="Chọn đề thi" options={MOCK_TESTS.map((t) => ({ value: t.id, label: `${t.title} · ${t.durationMinutes}p` }))} value={form.testId} onChange={(e) => setForm((f) => ({ ...f, testId: e.target.value, title: MOCK_TESTS.find((t) => t.id === e.target.value)?.title ?? f.title }))} />}
            <Input label="Tiêu đề bài tập" required placeholder="VD: Writing Task 2 — Environment" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Textarea label="Hướng dẫn cho học viên" placeholder="Yêu cầu, tiêu chí chấm, lưu ý..." value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <Input label="Hạn nộp" type="datetime-local" required value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-1">
              <p><b>Lớp:</b> {MOCK_CLASSES.find((c) => c.id === form.classId)?.name}</p>
              <p><b>Loại:</b> {TYPE_LABEL[form.type]}</p>
              <p><b>Tiêu đề:</b> {form.title || '—'}</p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} danger title="Xoá bài tập?" message="Bài nộp của học viên cho bài tập này cũng sẽ bị xoá." confirmText="Xoá" />
    </div>
  );
};
