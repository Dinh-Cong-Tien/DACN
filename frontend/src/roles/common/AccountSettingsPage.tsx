import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Save, Camera } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { ROLE_LABEL, formatDate } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Avatar, Badge, Button, Card, CardHeader, Input, PasswordInput, PageHeader, Switch, Tabs, Textarea } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';

/** Trang cài đặt tài khoản dùng chung cho Teacher / Head Teacher / Admin */
export const AccountSettingsPage: React.FC = () => {
  useDocumentTitle('Cài đặt tài khoản');
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [tab, setTab] = useState('profile');
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [bio, setBio] = useState('Giảng viên tiếng Anh, 8 năm kinh nghiệm luyện thi TOEIC/VSTEP.');
  const [notif, setNotif] = useState({ email: true, assignment: true, weekly: false, system: true });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const saveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      updateUser({ fullName });
      setSaving(false);
      toast.success('Đã lưu hồ sơ', 'Thông tin cá nhân đã được cập nhật.');
    }, 600);
  };

  const changePw = () => {
    if (!pw.current || pw.next.length < 8) return toast.error('Mật khẩu không hợp lệ', 'Mật khẩu mới cần tối thiểu 8 ký tự.');
    if (pw.next !== pw.confirm) return toast.error('Mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu xác nhận.');
    setPw({ current: '', next: '', confirm: '' });
    toast.success('Đã đổi mật khẩu', 'Hãy đăng nhập lại trên các thiết bị khác.');
  };

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
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-300 border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-hard-sm hover:scale-110 transition">
                  <Camera className="w-4 h-4" />
                </button>
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
              <Input label="Số điện thoại" placeholder="0901 234 567" />
              <Input label="Đơn vị / Trường" placeholder="Đại học Duy Tân" />
              <div className="md:col-span-2">
                <Textarea label="Giới thiệu ngắn" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <Button leftIcon={<Save className="w-4 h-4" />} onClick={saveProfile} loading={saving}>
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
              <Button onClick={changePw} fullWidth>
                Cập nhật mật khẩu
              </Button>
            </div>
          </Card>
          <Card hard tone="cream">
            <CardHeader title="Phiên đăng nhập" subtitle="Thiết bị đang đăng nhập tài khoản này" icon={<Shield />} />
            <div className="space-y-2">
              {[
                ['Windows · Chrome 130', 'Đà Nẵng, VN · 113.161.72.10 · Hiện tại', true],
                ['iPhone 15 · Safari', 'Đà Nẵng, VN · 2 giờ trước', false],
                ['MacBook · Safari', 'Hà Nội, VN · 3 ngày trước', false],
              ].map(([d, l, cur]) => (
                <div key={d as string} className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-900/10 bg-white">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{d as string}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{l as string}</p>
                  </div>
                  {cur ? (
                    <Badge tone="emerald" dot>
                      Hiện tại
                    </Badge>
                  ) : (
                    <Button size="xs" variant="ghost" onClick={() => toast.success('Đã đăng xuất thiết bị')}>
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
            <Button leftIcon={<Save className="w-4 h-4" />} onClick={() => toast.success('Đã lưu tuỳ chọn thông báo')}>
              Lưu
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
