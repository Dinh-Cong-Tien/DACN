import React from 'react';
import { Users, Lock, Unlock, KeyRound, UserCheck, Mail } from 'lucide-react';
import { MOCK_USERS } from '@/shared/mocks';
import type { AppRole, AppUser } from '@/shared/types';
import { formatDate, timeAgo, ROLE_LABEL } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Avatar, Badge, Button, Column, PageHeader, StatCard, Tone } from '@/shared/components/ui';
import { CrudEditor, CrudField } from '@/engines';
import { toast } from '@/shared/stores/uiStore';

const ROLE_TONE: Record<AppRole, Tone> = { GUEST: 'slate', STUDENT: 'indigo', TEACHER: 'emerald', HEAD_TEACHER: 'amber', ADMIN: 'rose' };
const STATUS_META: Record<AppUser['status'], { tone: Tone; label: string }> = {
  ACTIVE: { tone: 'emerald', label: 'Hoạt động' },
  LOCKED: { tone: 'rose', label: 'Đã khoá' },
  PENDING: { tone: 'amber', label: 'Chờ kích hoạt' },
};

const columns: Column<AppUser>[] = [
  {
    key: 'fullName',
    header: 'Người dùng',
    render: (u) => (
      <div className="flex items-center gap-3">
        <Avatar name={u.fullName} size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{u.fullName}</p>
          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'role', header: 'Vai trò', render: (u) => <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge> },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (u) => (
      <Badge tone={STATUS_META[u.status].tone} dot={u.status === 'ACTIVE'}>
        {STATUS_META[u.status].label}
      </Badge>
    ),
  },
  { key: 'plan', header: 'Gói', render: (u) => <Badge tone={u.plan === 'VIP' ? 'amber' : 'slate'} solid={u.plan === 'VIP'} size="xs">{u.plan}</Badge> },
  { key: 'joinedAt', header: 'Tham gia', render: (u) => <span className="text-xs text-slate-600">{formatDate(u.joinedAt)}</span> },
  { key: 'lastActiveAt', header: 'Hoạt động cuối', render: (u) => <span className="text-xs text-slate-500">{timeAgo(u.lastActiveAt)}</span> },
];

const fields: CrudField<AppUser>[] = [
  { key: 'fullName', label: 'Họ và tên', type: 'text', required: true, placeholder: 'Nguyễn Văn A' },
  { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@orbi.edu.vn' },
  {
    key: 'role',
    label: 'Vai trò',
    type: 'select',
    required: true,
    options: [
      { value: 'STUDENT', label: 'Học viên' },
      { value: 'TEACHER', label: 'Giáo viên' },
      { value: 'HEAD_TEACHER', label: 'Trưởng bộ môn' },
      { value: 'ADMIN', label: 'Quản trị viên' },
    ],
  },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'select',
    options: [
      { value: 'ACTIVE', label: 'Hoạt động' },
      { value: 'PENDING', label: 'Chờ kích hoạt' },
      { value: 'LOCKED', label: 'Đã khoá' },
    ],
  },
  {
    key: 'plan',
    label: 'Gói thành viên',
    type: 'select',
    options: [
      { value: 'FREE', label: 'Free' },
      { value: 'VIP', label: 'VIP' },
    ],
  },
];

export const AdminUsersPage: React.FC = () => {
  useDocumentTitle('Quản lý người dùng');
  const count = (s: AppUser['status']) => MOCK_USERS.filter((u) => u.status === s).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Người dùng & Phân quyền" icon={<Users />} description="Khởi tạo, kích hoạt, khoá/mở khoá tài khoản và cấp phát vai trò cho người dùng hệ thống." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Tổng tài khoản" value={MOCK_USERS.length} tone="indigo" icon={<Users />} />
        <StatCard label="Đang hoạt động" value={count('ACTIVE')} tone="emerald" icon={<UserCheck />} />
        <StatCard label="Chờ kích hoạt" value={count('PENDING')} tone="amber" icon={<Mail />} />
        <StatCard label="Đã khoá" value={count('LOCKED')} tone="rose" icon={<Lock />} />
      </div>

      <CrudEditor<AppUser>
        rows={MOCK_USERS}
        columns={columns}
        fields={fields}
        entityName="tài khoản"
        createLabel="Tạo tài khoản"
        idPrefix="u"
        searchKeys={['fullName', 'email']}
        filters={[
          {
            key: 'role',
            label: 'Vai trò',
            options: [
              { value: 'STUDENT', label: 'Học viên' },
              { value: 'TEACHER', label: 'Giáo viên' },
              { value: 'HEAD_TEACHER', label: 'Trưởng bộ môn' },
              { value: 'ADMIN', label: 'Quản trị viên' },
            ],
          },
          {
            key: 'status',
            label: 'Trạng thái',
            options: [
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'PENDING', label: 'Chờ kích hoạt' },
              { value: 'LOCKED', label: 'Đã khoá' },
            ],
          },
        ]}
        defaultValues={{ role: 'STUDENT', status: 'PENDING', plan: 'FREE', streak: 0, effortPoints: 0, joinedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() }}
        selectable
        bulkActions={(ids, clear) => (
          <>
            <Button
              size="xs"
              variant="danger"
              leftIcon={<Lock className="w-3.5 h-3.5" />}
              onClick={() => {
                toast.success(`Đã khoá ${ids.length} tài khoản`);
                clear();
              }}
            >
              Khoá tất cả
            </Button>
            <Button
              size="xs"
              variant="outline"
              leftIcon={<Mail className="w-3.5 h-3.5" />}
              onClick={() => {
                toast.info('Đang gửi email', `Gửi thông báo tới ${ids.length} người dùng.`);
                clear();
              }}
            >
              Gửi email
            </Button>
          </>
        )}
        rowActions={(u) => [
          ...(u.status === 'PENDING' ? [{ label: 'Kích hoạt tài khoản', icon: <UserCheck />, onClick: () => toast.success('Đã kích hoạt', `${u.fullName} có thể đăng nhập ngay.`) }] : []),
          u.status === 'LOCKED'
            ? { label: 'Mở khoá', icon: <Unlock />, onClick: () => toast.success('Đã mở khoá', `${u.fullName} đã được khôi phục quyền truy cập.`) }
            : { label: 'Khoá tài khoản', icon: <Lock />, onClick: () => toast.warning('Đã khoá tài khoản', `${u.fullName} không thể đăng nhập cho tới khi mở khoá.`) },
          { label: 'Đặt lại mật khẩu', icon: <KeyRound />, onClick: () => toast.info('Đã gửi email đặt lại mật khẩu', `Tới ${u.email}`) },
        ]}
      />
    </div>
  );
};
