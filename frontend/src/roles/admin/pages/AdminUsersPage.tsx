import { useSearchParams } from 'react-router-dom';
import React, { useMemo } from 'react';
import { Users, Lock, Unlock, KeyRound, UserCheck, UserPlus, Crown } from 'lucide-react';
import { adminApi, useAdminInvalidate, useAdminUsers } from '@/shared/api/admin';
import { errorMessage } from '@/shared/api/client';
import type { AppRole, AppUser } from '@/shared/types';
import { formatDate, timeAgo, ROLE_LABEL } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Avatar, Button, Column } from '@/shared/components/ui';
import { Figures, Status, TBtn, TPageHead, type StatusTone } from '@/roles/teacher/components/TeacherKit';
import { CrudEditor, CrudField } from '@/engines';
import { toast } from '@/shared/stores/uiStore';

const ROLE_CHIP: Record<AppRole, string> = {
  GUEST: 'bg-slate-100 text-slate-600 ring-slate-200',
  STUDENT: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70',
  TEACHER: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
  HEAD_TEACHER: 'bg-amber-50 text-amber-800 ring-amber-200/70',
  ADMIN: 'bg-violet-50 text-violet-700 ring-violet-200/70',
};
const STATUS_META: Record<AppUser['status'], { tone: StatusTone; label: string }> = {
  ACTIVE: { tone: 'green', label: 'Hoạt động' },
  LOCKED: { tone: 'red', label: 'Đã khoá' },
  PENDING: { tone: 'amber', label: 'Chờ kích hoạt' },
};

const columns: Column<AppUser>[] = [
  {
    key: 'fullName',
    header: 'Người dùng',
    render: (u) => (
      <div className="flex items-center gap-3">
        <Avatar name={u.fullName} src={u.avatarUrl} size="md" ring status={u.status === 'ACTIVE' ? 'online' : 'offline'} />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{u.fullName}</p>
          <p className="text-xs text-slate-500 truncate">{u.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'role', header: 'Vai trò', render: (u) => <span className={`inline-flex items-center whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_CHIP[u.role]}`}>{ROLE_LABEL[u.role]}</span> },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (u) => <Status tone={STATUS_META[u.status].tone}>{STATUS_META[u.status].label}</Status>,
  },
  {
    key: 'plan',
    header: 'Gói',
    render: (u) =>
      u.plan === 'VIP' ? (
        <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[11px] font-bold text-white">
          <Crown className="h-3 w-3" /> VIP
        </span>
      ) : (
        <span className="text-xs font-medium text-slate-500">Free</span>
      ),
  },
  { key: 'joinedAt', header: 'Tham gia', render: (u) => <span className="text-[13px] tabular-nums text-slate-600">{formatDate(u.joinedAt)}</span> },
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
];

/** Mật khẩu tạm khi admin đặt lại (chưa có dịch vụ email → hiện cho admin gửi người dùng) */
const tempPassword = () => `Orbi${Math.random().toString(36).slice(2, 8)}!`;

export const AdminUsersPage: React.FC = () => {
  const [params] = useSearchParams();
  useDocumentTitle('Quản lý người dùng');
  const { data, isLoading } = useAdminUsers();
  const refresh = useAdminInvalidate();
  const users = useMemo<AppUser[]>(() => data?.items ?? [], [data]);
  const byStatus = data?.stats.byStatus ?? {};
  const total = Object.values(data?.stats.byRole ?? {}).reduce<number>((a, b) => a + (b ?? 0), 0);

  const run = async (fn: () => Promise<unknown>, ok: string, desc?: string) => {
    try {
      await fn();
      toast.success(ok, desc);
      await refresh();
    } catch (e) {
      toast.error('Không thực hiện được', errorMessage(e));
    }
  };
  const bulk = (ids: string[], clear: () => void, action: 'LOCK' | 'UNLOCK') =>
    run(
      () => adminApi.bulkUsers({ ids, action }).then(clear),
      action === 'LOCK' ? `Đã khoá ${ids.length} tài khoản` : `Đã mở khoá ${ids.length} tài khoản`
    );

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Người dùng"
        title="Tài khoản & phân quyền"
        sub="Khởi tạo, kích hoạt, khoá hoặc mở khoá tài khoản và cấp vai trò Học viên · Giáo viên · Trưởng bộ môn · Quản trị viên."
        actions={
          <TBtn to="/admin/classes" icon={<Users />}>
            Lớp học
          </TBtn>
        }
      />

      <Figures
        items={[
          { label: 'Tổng tài khoản', value: total, note: `${users.filter((u) => u.plan === 'VIP').length} tài khoản VIP`, icon: Users, tone: 'indigo' },
          { label: 'Đang hoạt động', value: byStatus.ACTIVE ?? 0, note: `${data?.stats.activeLast7d ?? 0} đăng nhập 7 ngày qua`, icon: UserCheck, tone: 'emerald' },
          { label: 'Chờ kích hoạt', value: byStatus.PENDING ?? 0, note: 'chưa xác thực email', icon: UserPlus, tone: 'amber' },
          { label: 'Đã khoá', value: byStatus.LOCKED ?? 0, note: 'vi phạm hoặc theo yêu cầu', icon: Lock, tone: 'rose' },
        ]}
      />

      <CrudEditor<AppUser>
        rows={users}
        loading={isLoading}
        columns={columns}
        fields={fields}
        entityName="tài khoản"
        createLabel="Tạo tài khoản"
        idPrefix="u"
        searchKeys={['fullName', 'email']}
        initialSearch={params.get('q') ?? ''}
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
        defaultValues={{ role: 'STUDENT', status: 'ACTIVE' }}
        onCreate={async (v) => {
          const u = await adminApi.createUser({ fullName: v.fullName, email: v.email, role: v.role, status: v.status });
          if (u.temporaryPassword) toast.info('Mật khẩu tạm thời', `${u.email}: ${u.temporaryPassword} — gửi cho người dùng và yêu cầu đổi sau khi đăng nhập.`);
          void refresh();
          return u;
        }}
        onUpdate={async (row, v) => {
          const u = await adminApi.updateUser(row.id, { fullName: v.fullName, email: v.email, role: v.role, status: v.status });
          void refresh();
          return u;
        }}
        onDelete={async (row) => {
          await adminApi.deleteUser(row.id);
          void refresh();
        }}
        selectable
        bulkActions={(ids, clear) => (
          <>
            <Button size="xs" variant="danger" leftIcon={<Lock className="w-3.5 h-3.5" />} onClick={() => bulk(ids, clear, 'LOCK')}>
              Khoá tất cả
            </Button>
            <Button size="xs" variant="outline" leftIcon={<Unlock className="w-3.5 h-3.5" />} onClick={() => bulk(ids, clear, 'UNLOCK')}>
              Mở khoá tất cả
            </Button>
          </>
        )}
        rowActions={(u) => [
          ...(u.status === 'PENDING'
            ? [{ label: 'Kích hoạt tài khoản', icon: <UserCheck />, onClick: () => run(() => adminApi.updateUser(u.id, { status: 'ACTIVE' }), 'Đã kích hoạt', `${u.fullName} có thể đăng nhập ngay.`) }]
            : []),
          u.status === 'LOCKED'
            ? { label: 'Mở khoá', icon: <Unlock />, onClick: () => run(() => adminApi.lockUser(u.id, false), 'Đã mở khoá', `${u.fullName} đã được khôi phục quyền truy cập.`) }
            : { label: 'Khoá tài khoản', icon: <Lock />, onClick: () => run(() => adminApi.lockUser(u.id, true, 'Khoá bởi quản trị viên'), 'Đã khoá tài khoản', `${u.fullName} không thể đăng nhập cho tới khi mở khoá.`) },
          {
            label: 'Đặt lại mật khẩu',
            icon: <KeyRound />,
            onClick: () => {
              const pw = tempPassword();
              void run(() => adminApi.updateUser(u.id, { password: pw }), 'Đã đặt lại mật khẩu', `Mật khẩu tạm của ${u.email}: ${pw}`);
            },
          },
        ]}
      />
    </div>
  );
};
