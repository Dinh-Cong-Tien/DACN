import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Lock, Unlock, UserRound, UserCheck, Clock, Star } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { DEPT_CLASSES, MOCK_GRADING_REVIEWS, MOCK_OBSERVATIONS, MOCK_TEACHERS, MOCK_SUBJECTS } from '@/shared/mocks';
import type { TeacherSummary, UserStatus } from '@/shared/types';
import { Avatar, Column } from '@/shared/components/ui';
import { CrudEditor } from '@/engines';
import { Figures, Status, TPageHead, type StatusTone } from '@/roles/teacher/components/TeacherKit';

const STATUS: Record<UserStatus, { label: string; tone: StatusTone }> = { ACTIVE: { label: 'Đang giảng dạy', tone: 'green' }, LOCKED: { label: 'Đã khoá', tone: 'red' }, PENDING: { label: 'Chờ duyệt', tone: 'amber' } };

const rating = (name: string) => {
  const r = MOCK_OBSERVATIONS.filter((o) => o.teacher === name && o.rating);
  return r.length ? Math.round((r.reduce((a, o) => a + (o.rating ?? 0), 0) / r.length) * 10) / 10 : null;
};

const columns: Column<TeacherSummary>[] = [
  {
    key: 'name',
    header: 'Giáo viên',
    render: (r) => (
      <Link to={`/head/teachers/${r.id}`} className="group flex items-center gap-3">
        <Avatar name={r.name} src={r.avatarUrl} size="md" status={r.status === 'ACTIVE' ? 'online' : 'offline'} />
        <div>
          <p className="font-semibold text-slate-900 group-hover:text-indigo-700">{r.name}</p>
          <p className="text-[12px] text-slate-500">{r.email}</p>
        </div>
      </Link>
    ),
  },
  { key: 'subject', header: 'Môn phụ trách', render: (r) => <span className="text-[13px] text-slate-700">{r.subject}</span> },
  { key: 'classesCount', header: 'Lớp', align: 'center', render: (r) => <span className="tabular-nums">{DEPT_CLASSES.filter((c) => c.teacherName === r.name).length}</span> },
  { key: 'studentsCount', header: 'Học viên', align: 'center', render: (r) => <span className="tabular-nums">{DEPT_CLASSES.filter((c) => c.teacherName === r.name).reduce((a, c) => a + c.studentsCount, 0)}</span> },
  { key: 'avgClassScore', header: 'Điểm TB lớp', align: 'center', render: (r) => <span className="font-display font-bold tabular-nums">{r.avgClassScore || '—'}</span> },
  {
    key: 'id',
    header: 'Dự giờ',
    align: 'center',
    render: (r) => {
      const v = rating(r.name);
      return v ? (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {v}
        </span>
      ) : (
        <span className="text-slate-400">—</span>
      );
    },
  },
  { key: 'status', header: 'Trạng thái', render: (r) => <Status tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Status> },
];

export const HeadTeachersPage: React.FC = () => {
  useDocumentTitle('Giáo viên bộ môn');
  const navigate = useNavigate();
  const pendingReview = MOCK_GRADING_REVIEWS.filter((r) => r.status === 'PENDING').length;
  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Bộ môn" title="Giáo viên bộ môn" sub="Đội ngũ giáo viên, lớp phụ trách, kết quả dự giờ và trạng thái tài khoản. Bấm vào tên để xem hồ sơ chuyên môn." />

      <Figures
        items={[
          { label: 'Tổng giáo viên', value: MOCK_TEACHERS.length, icon: Users, tone: 'indigo' },
          { label: 'Đang giảng dạy', value: MOCK_TEACHERS.filter((t) => t.status === 'ACTIVE').length, icon: UserCheck, tone: 'emerald' },
          { label: 'Chờ duyệt hồ sơ', value: MOCK_TEACHERS.filter((t) => t.status === 'PENDING').length, icon: Clock, tone: 'amber' },
          { label: 'Bài chờ kiểm định', value: pendingReview, note: 'bài Viết/Nói GV đã chấm', icon: Star, tone: 'rose' },
        ]}
      />

      <CrudEditor<TeacherSummary>
        rows={MOCK_TEACHERS}
        columns={columns}
        entityName="giáo viên"
        createLabel="Thêm giáo viên"
        idPrefix="t"
        searchKeys={['name', 'email', 'subject']}
        filters={[
          { key: 'status', label: 'Trạng thái', options: Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label })) },
          { key: 'subject', label: 'Môn', options: MOCK_SUBJECTS.map((s) => ({ value: s.name, label: s.name })) },
        ]}
        defaultValues={{ initials: 'GV', classesCount: 0, studentsCount: 0, avgClassScore: 0, status: 'PENDING', subject: MOCK_SUBJECTS[0].name }}
        fields={[
          { key: 'name', label: 'Họ và tên', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'subject', label: 'Môn phụ trách', type: 'select', options: MOCK_SUBJECTS.map((s) => ({ value: s.name, label: s.name })) },
          { key: 'status', label: 'Trạng thái', type: 'select', options: Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label })) },
        ]}
        rowActions={(row) => [
          { label: 'Xem hồ sơ chuyên môn', icon: <UserRound />, onClick: () => navigate(`/head/teachers/${row.id}`) },
          row.status === 'LOCKED'
            ? { label: 'Mở khoá tài khoản', icon: <Unlock />, onClick: () => toast.success('Đã mở khoá', row.name) }
            : { label: 'Khoá tài khoản', icon: <Lock />, onClick: () => toast.warning('Đã khoá tài khoản', `${row.name} · các lớp đang phụ trách cần phân công lại`) },
        ]}
      />
    </div>
  );
};
