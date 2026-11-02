import { useSearchParams } from 'react-router-dom';
import React from 'react';
import { Users, Lock, Unlock, KeyRound, UserCheck, Mail, UserPlus, Crown } from 'lucide-react';
import { MOCK_USERS } from '@/shared/mocks';
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
  const [params] = useSearchParams();
  useDocumentTitle('Quản lý người dùng');
  const count = (s: AppUser['status']) => MOCK_USERS.filter((u) => u.status === s).length;

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
          { label: 'Tổng tài khoản', value: MOCK_USERS.length, note: `${MOCK_USERS.filter((u) => u.plan === 'VIP').length} tài khoản VIP`, icon: Users, tone: 'indigo' },
          { label: 'Đang hoạt động', value: count('ACTIVE'), note: 'đăng nhập 7 ngày qua', icon: UserCheck, tone: 'emerald' },
          { label: 'Chờ kích hoạt', value: count('PENDING'), note: 'chưa xác thực email', icon: UserPlus, tone: 'amber' },
          { label: 'Đã khoá', value: count('LOCKED'), note: 'vi phạm hoặc theo yêu cầu', icon: Lock, tone: 'rose' },
        ]}
      />

      <CrudEditor<AppUser>
        rows={MOCK_USERS}
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
