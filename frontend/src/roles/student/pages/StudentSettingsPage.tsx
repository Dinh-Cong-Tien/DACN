import React, { useRef, useState } from 'react';
import { User, Target, Bell, Lock, Save, Camera, Trash2, Users, KeyRound } from 'lucide-react';
import type { ExamType } from '@/shared/types';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { authApi } from '@/shared/api/auth';
import { api, errorMessage } from '@/shared/api/client';
import { uploadAvatar, useGoal, useJoinClass, useSaveGoal } from '@/shared/api/learner';
import { ROLE_LABEL, formatDate } from '@/shared/utils';
import { Avatar, Badge, Button, Card, CardHeader, ConfirmDialog, Input, PageHeader, PasswordInput, Select, Switch, Tabs } from '@/shared/components/ui';

const SCORES: Record<ExamType, string[]> = {
  TOEIC: ['450', '550', '650', '750', '850', '900+'],
  VSTEP: ['B1', 'B2', 'C1'],
};

export const StudentSettingsPage: React.FC = () => {
  useDocumentTitle('Cài đặt');
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = useState('profile');
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const settings = ((user as (typeof user & { settings?: Record<string, unknown>; phone?: string }) | null)?.settings ?? {}) as { notifyTypes?: Record<string, boolean>; dailyGoalMinutes?: number };
  const [phone, setPhone] = useState((user as (typeof user & { phone?: string }) | null)?.phone ?? '');
  const { data: goal } = useGoal();
  const saveGoal = useSaveGoal();
  const join = useJoinClass();
  const [examType, setExamType] = useState<ExamType>(user?.target?.examType ?? 'TOEIC');
  const [score, setScore] = useState(user?.target?.score ?? '750');
  const [examDate, setExamDate] = useState(user?.target?.examDate?.slice(0, 10) ?? '');
  const [minutes, setMinutes] = useState(settings.dailyGoalMinutes ?? 20); // cùng mặc định với backend (progress.ts)
  const [notif, setNotif] = useState({ review: true, assignment: true, streak: true, marketing: false, ...(settings.notifyTypes ?? {}) });
  // Đồng bộ form mục tiêu với mục tiêu đang hiệu lực trên máy chủ
  React.useEffect(() => {
    if (!goal) return;
    setExamType(goal.examType);
    setScore(goal.targetScore ? String(goal.targetScore) : (goal.targetLevel ?? ''));
    if (goal.targetDate) setExamDate(goal.targetDate);
    setMinutes(goal.minutesPerDay);
  }, [goal]);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [code, setCode] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setUploading(true);
    uploadAvatar(f)
      .then((url) => {
        updateUser({ avatarUrl: url });
        toast.success('Đã cập nhật ảnh đại diện');
      })
      .catch((err) => toast.error('Chưa tải được ảnh', errorMessage(err)))
      .finally(() => setUploading(false));
  };

  if (!user) return null;

  const saveProfile = () => {
    setSaving(true);
    authApi
      .updateMe({ fullName, phone: phone || null })
      .then((u) => {
        updateUser(u);
        toast.success('Đã lưu hồ sơ');
      })
      .catch((e) => toast.error('Chưa lưu được hồ sơ', errorMessage(e)))
      .finally(() => setSaving(false));
  };

  const saveTarget = () => {
    const isToeic = examType === 'TOEIC';
    saveGoal.mutate(
      {
        examType,
        targetScore: isToeic ? Math.min(990, parseInt(score, 10) || 750) : null,
        targetLevel: isToeic ? null : score,
        targetDate: examDate || null,
        minutesPerDay: Math.min(480, Math.max(10, minutes)),
        studyDays: goal?.studyDays ?? [1, 2, 3, 4, 5],
      } as Parameters<typeof saveGoal.mutate>[0],
      {
        onSuccess: () => {
          authApi.me().then(updateUser).catch(() => undefined);
          toast.success('Đã cập nhật mục tiêu', `Lộ trình được lập lại theo ${examType} ${score}.`);
        },
        onError: (e) => toast.error('Chưa cập nhật được mục tiêu', errorMessage(e)),
      }
    );
  };

  const changePw = () => {
    if (!pw.current || pw.next.length < 8) return toast.error('Mật khẩu không hợp lệ', 'Mật khẩu mới cần tối thiểu 8 ký tự.');
    if (pw.next !== pw.confirm) return toast.error('Mật khẩu không khớp');
    authApi
      .changePassword(pw.current, pw.next)
      .then(() => {
        setPw({ current: '', next: '', confirm: '' });
        toast.success('Đã đổi mật khẩu', 'Các thiết bị khác sẽ phải đăng nhập lại.');
      })
      .catch((e) => toast.error('Chưa đổi được mật khẩu', errorMessage(e)));
  };

  const joinClass = () => {
    if (code.trim().length < 6) return toast.error('Mã mời không hợp lệ', 'Mã lớp có dạng T203A1, giáo viên gửi khi mở lớp.');
    join.mutate(code.trim().toUpperCase(), {
      onSuccess: (c) => {
        toast.success('Đã vào lớp', c.name);
        setCode('');
      },
      onError: (e) => toast.error('Chưa vào được lớp', errorMessage(e)),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={
          <>
            <span className="mark">Cài đặt</span> tài khoản
          </>
        }
        description="Hồ sơ, mục tiêu học tập, thông báo và bảo mật tài khoản."
      />
      <Tabs
        variant="pill"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'profile', label: 'Hồ sơ', icon: <User /> },
          { key: 'target', label: 'Mục tiêu', icon: <Target /> },
          { key: 'notifications', label: 'Thông báo', icon: <Bell /> },
          { key: 'security', label: 'Bảo mật', icon: <Lock /> },
        ]}
      />

      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 animate-fade-up">
          <Card hard tone="cream" className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="rounded-full border-[3px] border-slate-900 bg-white p-1 shadow-hard-sm">
                <Avatar name={user.fullName} src={user.avatarUrl} size="xl" />
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatar} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Đổi ảnh đại diện" className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-amber-300 border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-hard-sm hover:-translate-y-0.5 transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="font-display font-bold text-slate-900">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="flex justify-center gap-1.5">
              <Badge tone="indigo">{ROLE_LABEL[user.role]}</Badge>
              <Badge tone={user.plan === 'VIP' ? 'amber' : 'slate'}>{user.plan}</Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">Tham gia {formatDate(user.joinedAt)}</p>
          </Card>
          <div className="space-y-5">
            <Card hard>
              <CardHeader title="Thông tin cá nhân" icon={<User />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <Input label="Email" value={user.email} disabled hint="Email đăng nhập không thể thay đổi" />
                <Input label="Số điện thoại" placeholder="0901 234 567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input label="Trường / Đơn vị" placeholder="Đại học Duy Tân" />
              </div>
              <div className="flex justify-end mt-5">
                <Button leftIcon={<Save className="w-4 h-4" />} onClick={saveProfile} loading={saving}>
                  Lưu thay đổi
                </Button>
              </div>
            </Card>
            <Card hard tone="yellow">
              <CardHeader title="Tham gia lớp học" subtitle="Nhập mã mời do giáo viên cung cấp" icon={<Users />} />
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input placeholder="T203A1" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} leftIcon={<KeyRound />} className="font-mono tracking-widest uppercase" />
                </div>
                <Button variant="secondary" onClick={joinClass}>
                  Tham gia
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'target' && (
        <Card hard className="animate-fade-up max-w-2xl">
          <CardHeader title="Mục tiêu học tập" subtitle="Lộ trình cá nhân hoá sẽ tự điều chỉnh theo mục tiêu này" icon={<Target />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Kỳ thi"
              value={examType}
              options={[
                { value: 'TOEIC', label: 'TOEIC Listening & Reading' },
                { value: 'VSTEP', label: 'VSTEP 4 kỹ năng' },
              ]}
              onChange={(e) => {
                const t = e.target.value as ExamType;
                setExamType(t);
                setScore(SCORES[t][Math.floor(SCORES[t].length / 2)]);
              }}
            />
            <Select label="Điểm mục tiêu" value={score} options={SCORES[examType].map((s) => ({ value: s, label: s }))} onChange={(e) => setScore(e.target.value)} />
            <Input label="Ngày thi dự kiến" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            <Input label="Thời gian học mỗi ngày (phút)" type="number" min={15} max={180} step={15} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} hint="Khuyến nghị 30–60 phút" />
          </div>
          <div className="flex justify-end mt-5">
            <Button leftIcon={<Save className="w-4 h-4" />} onClick={saveTarget}>
              Cập nhật mục tiêu
            </Button>
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card hard className="animate-fade-up max-w-2xl">
          <CardHeader title="Tuỳ chọn thông báo" icon={<Bell />} />
          <div className="space-y-5">
            <Switch checked={notif.review} onChange={(v) => setNotif((s) => ({ ...s, review: v }))} label="Nhắc ôn tập ngắt quãng" description="Thông báo khi có thẻ/câu sai đến hạn ôn theo SM-2." />
            <Switch checked={notif.assignment} onChange={(v) => setNotif((s) => ({ ...s, assignment: v }))} label="Bài tập từ giáo viên" description="Khi có bài tập mới hoặc sắp tới hạn nộp." />
            <Switch checked={notif.streak} onChange={(v) => setNotif((s) => ({ ...s, streak: v }))} label="Nhắc giữ chuỗi ngày học" description="Nhắc lúc 20:00 nếu hôm nay chưa học." />
            <Switch checked={notif.marketing} onChange={(v) => setNotif((s) => ({ ...s, marketing: v }))} label="Ưu đãi & tin tức" description="Email về khoá học mới và khuyến mãi." />
          </div>
          <div className="flex justify-end mt-6">
            <Button leftIcon={<Save className="w-4 h-4" />} onClick={() =>
                authApi
                  .updateMe({ settings: { notifyTypes: notif, dailyGoalMinutes: minutes } })
                  .then((u) => {
                    updateUser(u);
                    toast.success('Đã lưu tuỳ chọn thông báo');
                  })
                  .catch((e) => toast.error('Chưa lưu được', errorMessage(e)))
              }>
              Lưu
            </Button>
          </div>
        </Card>
      )}

      {tab === 'security' && (
        <div className="space-y-5 animate-fade-up max-w-2xl">
          <Card hard>
            <CardHeader title="Đổi mật khẩu" subtitle="Tối thiểu 8 ký tự" icon={<Lock />} />
            <div className="space-y-4">
              <PasswordInput label="Mật khẩu hiện tại" value={pw.current} onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))} />
              <PasswordInput label="Mật khẩu mới" value={pw.next} onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))} />
              <PasswordInput label="Xác nhận mật khẩu mới" value={pw.confirm} onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))} />
              <Button onClick={changePw}>Cập nhật mật khẩu</Button>
            </div>
          </Card>
          <Card hard className="!border-violet-600 !shadow-hard-coral bg-violet-50">
            <CardHeader title="Khu vực nguy hiểm" subtitle="Hành động không thể hoàn tác" icon={<Trash2 />} />
            <p className="text-sm text-slate-700 mb-4">Xoá tài khoản sẽ xoá toàn bộ lịch sử học tập, sổ tay lỗi sai và từ vựng đã lưu.</p>
            <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleteOpen(true)}>
              Xoá tài khoản
            </Button>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        danger
        title="Xoá tài khoản vĩnh viễn?"
        message={`Toàn bộ dữ liệu của ${user.email} sẽ bị xoá và không thể khôi phục.`}
        confirmText="Xoá tài khoản"
        onConfirm={() => {
          setDeleteOpen(false);
          api
            .post('/learner/account/delete')
            .then(() => {
              toast.info('Đã xoá tài khoản', 'Cảm ơn bạn đã học cùng OrbiLingo.');
              logout();
            })
            .catch((e) => toast.error('Chưa xoá được tài khoản', errorMessage(e)));
        }}
      />
    </div>
  );
};
