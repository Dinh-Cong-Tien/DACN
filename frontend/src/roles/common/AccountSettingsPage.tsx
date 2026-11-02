import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { ROLE_LABEL, formatDate, timeAgo } from '@/shared/utils';
import { authApi } from '@/shared/api/auth';
import { errorMessage } from '@/shared/api/client';
import { useRevokeSession, useSessions } from '@/shared/api/learner';
import { useDocumentTitle } from '@/shared/hooks';
import { Avatar, Badge, Button, Card, CardHeader, Input, PasswordInput, PageHeader, Switch, Tabs, Textarea } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';

/** Trang cài đặt tài khoản dùng chung cho Teacher / Head Teacher / Admin */
export const AccountSettingsPage: React.FC = () => {
  useDocumentTitle('Cài đặt tài khoản');
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const [tab, setTab] = useState('profile');
  // Hồ sơ lấy từ /auth/me (users: full_name, phone, organization, bio, settings)
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [organization, setOrganization] = useState(user?.organization ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const savedNotif = (user?.settings?.staffNotify ?? {}) as Partial<Record<'email' | 'assignment' | 'weekly' | 'system', boolean>>;
  const [notif, setNotif] = useState({ email: true, assignment: true, weekly: false, system: true, ...savedNotif });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState<'' | 'profile' | 'pw' | 'notif'>('');
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const revoke = useRevokeSession();

  if (!user) return null;

  const run = async (key: 'profile' | 'pw' | 'notif', fn: () => Promise<void>) => {
    setSaving(key);
    try {
      await fn();
    } catch (e) {
      toast.error('Chưa lưu được', errorMessage(e));
    } finally {
      setSaving('');
    }
  };

  const saveProfile = () =>
    run('profile', async () => {
      if (fullName.trim().length < 2) throw new Error('Họ và tên cần ít nhất 2 ký tự.');
      login(await authApi.updateMe({ fullName: fullName.trim(), phone: phone.trim() || null, organization: organization.trim() || null, bio: bio.trim() || null }));
      toast.success('Đã lưu hồ sơ', 'Thông tin cá nhân đã được cập nhật.');
    });

  const changePw = () => {
    if (!pw.current || pw.next.length < 8) return toast.error('Mật khẩu không hợp lệ', 'Mật khẩu mới cần tối thiểu 8 ký tự.');
    if (pw.next !== pw.confirm) return toast.error('Mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu xác nhận.');
    void run('pw', async () => {
      await authApi.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      toast.success('Đã đổi mật khẩu', 'Các phiên đăng nhập khác đã bị đăng xuất.');
    });
  };

  const saveNotif = () =>
    run('notif', async () => {
      login(await authApi.updateMe({ settings: { staffNotify: notif } }));
      toast.success('Đã lưu tuỳ chọn thông báo');
    });

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={
          <>
            Cài đặt <span className="mark">tài khoản</span>
          </>
        }
        description="Quản lý hồ sơ, bảo mật và tuỳ chọn thông báo."
      />
      <Tabs
        variant="pill"
        className="mb-6"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'profile', label: 'Hồ sơ', icon: <User /> },
          { key: 'security', label: 'Bảo mật', icon: <Lock /> },
          { key: 'notifications', label: 'Thông báo', icon: <Bell /> },
        ]}
      />

      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 animate-fade-up">
          <Card hard padding="none" className="overflow-hidden text-center">
            <Img src={PHOTOS.office} alt="Ảnh bìa" ratio="video" fallbackClass="bg-indigo-200" />
            <div className="px-5 pb-5 -mt-10 space-y-3">
              <div className="relative inline-block">
                <Avatar name={user.fullName} src={user.avatarUrl} size="xl" ring className="[&>img]:border-2 [&>img]:border-slate-900 [&>div]:border-2 [&>div]:border-slate-900" />
              </div>
              <div>
                <p className="font-display font-bold text-slate-900">{user.fullName}</p>
                <p className="text-xs text-slate-500 font-mono">{user.email}</p>
              </div>
              <div className="flex justify-center gap-1.5">
                <Badge tone="indigo">{ROLE_LABEL[user.role]}</Badge>
                <Badge tone={user.plan === 'VIP' ? 'amber' : 'slate'} solid={user.plan === 'VIP'}>
                  {user.plan}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">Tham gia từ {formatDate(user.joinedAt)}</p>
            </div>
          </Card>
          <Card hard>
            <CardHeader title="Thông tin cá nhân" subtitle="Hiển thị với học viên và đồng nghiệp" icon={<User />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Email" value={user.email} disabled hint="Email đăng nhập không thể thay đổi" />
              <Input label="Số điện thoại" placeholder="0901 234 567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Đơn vị / Trường" placeholder="Đại học Duy Tân" value={organization} onChange={(e) => setOrganization(e.target.value)} />
              <div className="md:col-span-2">
                <Textarea label="Giới thiệu ngắn" placeholder="Kinh nghiệm giảng dạy, chuyên môn…" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <Button leftIcon={<Save className="w-4 h-4" />} onClick={() => void saveProfile()} loading={saving === 'profile'}>
                Lưu thay đổi
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-up">
          <Card hard>
            <CardHeader title="Đổi mật khẩu" subtitle="Tối thiểu 8 ký tự, gồm chữ và số" icon={<Lock />} />
            <div className="space-y-4">
              <PasswordInput label="Mật khẩu hiện tại" value={pw.current} onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))} />
              <PasswordInput label="Mật khẩu mới" value={pw.next} onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))} />
              <PasswordInput label="Xác nhận mật khẩu mới" value={pw.confirm} onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))} />
              <Button onClick={changePw} fullWidth loading={saving === 'pw'}>
                Cập nhật mật khẩu
              </Button>
            </div>
          </Card>
          <Card hard tone="cream">
            <CardHeader title="Phiên đăng nhập" subtitle="Thiết bị đang đăng nhập tài khoản này" icon={<Shield />} />
            <div className="space-y-2">
              {loadingSessions && <p className="text-sm text-slate-500">Đang tải…</p>}
              {!loadingSessions && sessions.length === 0 && <p className="text-sm text-slate-500">Không có phiên đăng nhập nào khác.</p>}
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-900/10 bg-white">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.device}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {s.ip ? `${s.ip} · ` : ''}
                      {s.current ? 'Hiện tại' : `đăng nhập ${timeAgo(s.lastActiveAt)}`}
                    </p>
                  </div>
                  {s.current ? (
                    <Badge tone="emerald" dot>
                      Hiện tại
                    </Badge>
                  ) : (
                    <Button
                      size="xs"
                      variant="ghost"
                      loading={revoke.isPending && revoke.variables === s.id}
                      onClick={() => revoke.mutate(s.id, { onSuccess: () => toast.success('Đã đăng xuất thiết bị'), onError: (e) => toast.error('Chưa đăng xuất được', errorMessage(e)) })}
                    >
                      Đăng xuất
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'notifications' && (
        <Card hard className="animate-fade-up max-w-2xl">
          <CardHeader title="Tuỳ chọn thông báo" subtitle="Chọn kênh và loại thông báo bạn muốn nhận" icon={<Bell />} />
          <div className="space-y-5">
            <Switch checked={notif.email} onChange={(v) => setNotif((s) => ({ ...s, email: v }))} label="Nhận thông báo qua email" description="Gửi tới địa chỉ email đăng ký tài khoản." />
            <Switch checked={notif.assignment} onChange={(v) => setNotif((s) => ({ ...s, assignment: v }))} label="Bài nộp mới cần chấm" description="Thông báo khi học viên nộp bài tự luận." />
            <Switch checked={notif.weekly} onChange={(v) => setNotif((s) => ({ ...s, weekly: v }))} label="Báo cáo tuần" description="Tổng hợp tiến độ lớp học mỗi thứ Hai." />
            <Switch checked={notif.system} onChange={(v) => setNotif((s) => ({ ...s, system: v }))} label="Thông báo hệ thống" description="Bảo trì, cập nhật tính năng mới." />
          </div>
          <div className="flex justify-end mt-6">
            <Button leftIcon={<Save className="w-4 h-4" />} onClick={() => void saveNotif()} loading={saving === 'notif'}>
              Lưu
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
