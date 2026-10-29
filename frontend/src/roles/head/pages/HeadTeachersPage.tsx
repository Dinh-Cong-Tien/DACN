import React from 'react';
import { Users, Lock, Unlock } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_TEACHERS, MOCK_SUBJECTS } from '@/shared/mocks';
import type { TeacherSummary, UserStatus } from '@/shared/types';
import { Avatar, Badge, Column, PageHeader, StatCard } from '@/shared/components/ui';
import { CrudEditor } from '@/engines';

const STATUS: Record<UserStatus, { label: string; tone: 'emerald' | 'rose' | 'amber' }> = { ACTIVE: { label: 'Hoạt động', tone: 'emerald' }, LOCKED: { label: 'Đã khoá', tone: 'rose' }, PENDING: { label: 'Chờ duyệt', tone: 'amber' } };

const columns: Column<TeacherSummary>[] = [
  { key: 'name', header: 'Giáo viên', render: (r) => (<div className="flex items-center gap-3"><Avatar name={r.name} size="sm" /><div><p className="font-bold text-slate-900">{r.name}</p><p className="text-[11px] text-slate-500">{r.email}</p></div></div>) },
  { key: 'subject', header: 'Môn phụ trách', render: (r) => <span className="text-xs font-semibold">{r.subject}</span> },
  { key: 'classesCount', header: 'Lớp', align: 'center' },
  { key: 'studentsCount', header: 'Học viên', align: 'center' },
  { key: 'avgClassScore', header: 'Điểm TB lớp', align: 'center', render: (r) => <span className="font-black">{r.avgClassScore}</span> },
  { key: 'status', header: 'Trạng thái', render: (r) => <Badge tone={STATUS[r.status].tone} dot>{STATUS[r.status].label}</Badge> },
];

export const HeadTeachersPage: React.FC = () => {
  useDocumentTitle('Giáo viên bộ môn');
  return (
    <div className="space-y-6">
      <PageHeader title="Giáo viên bộ môn" description="Danh sách giáo viên, môn phụ trách và trạng thái tài khoản." icon={<Users />} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Tổng giáo viên" value={MOCK_TEACHERS.length} tone="amber" />
        <StatCard label="Đang hoạt động" value={MOCK_TEACHERS.filter((t) => t.status === 'ACTIVE').length} tone="emerald" />
        <StatCard label="Chờ duyệt" value={MOCK_TEACHERS.filter((t) => t.status === 'PENDING').length} tone="indigo" />
      </div>
      <CrudEditor<TeacherSummary>
        rows={MOCK_TEACHERS}
        columns={columns}
        entityName="giáo viên"
        createLabel="Thêm giáo viên"
        idPrefix="t"
        searchKeys={['name', 'email', 'subject']}
        filters={[{ key: 'status', label: 'Trạng thái', options: Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label })) }]}
        defaultValues={{ initials: 'GV', classesCount: 0, studentsCount: 0, avgClassScore: 0, status: 'PENDING', subject: MOCK_SUBJECTS[0].name }}
        fields={[
          { key: 'name', label: 'Họ và tên', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'subject', label: 'Môn phụ trách', type: 'select', options: MOCK_SUBJECTS.map((s) => ({ value: s.name, label: s.name })) },
          { key: 'status', label: 'Trạng thái', type: 'select', options: Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label })) },
        ]}
        rowActions={(row) => [
          row.status === 'LOCKED'
            ? { label: 'Mở khoá tài khoản', icon: <Unlock />, onClick: () => toast.success('Đã mở khoá', row.name) }
            : { label: 'Khoá tài khoản', icon: <Lock />, onClick: () => toast.warning('Đã khoá tài khoản', row.name) },
        ]}
      />
    </div>
  );
};
