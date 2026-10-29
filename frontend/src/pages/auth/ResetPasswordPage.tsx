import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, KeyRound } from 'lucide-react';
import { Button, Card, PasswordInput } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';

const RULES = [
  { label: 'Ít nhất 8 ký tự', test: (p: string) => p.length >= 8 },
  { label: 'Có chữ hoa', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Có chữ số', test: (p: string) => /[0-9]/.test(p) },
];

export const ResetPasswordPage: React.FC = () => {
  useDocumentTitle('Đặt lại mật khẩu');
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!RULES.every((r) => r.test(pw))) er.pw = 'Mật khẩu chưa đủ điều kiện';
    if (confirm !== pw) er.confirm = 'Mật khẩu xác nhận không khớp';
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Đặt lại mật khẩu thành công', 'Hãy đăng nhập bằng mật khẩu mới.');
      navigate('/auth/login');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 animate-fade-down">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 border-2 border-slate-900 shadow-hard-sm text-violet-700 flex items-center justify-center tilt-2">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Đặt lại mật khẩu</h1>
        <p className="text-sm text-slate-600">Chọn mật khẩu mới cho tài khoản của bạn.</p>
      </div>
      <Card hard padding="lg" className="animate-fade-up">
        <form onSubmit={submit} className="space-y-4">
          <PasswordInput label="Mật khẩu mới" value={pw} onChange={(e) => setPw(e.target.value)} error={errors.pw} placeholder="Tối thiểu 8 ký tự" />
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {RULES.map((r) => {
              const ok = r.test(pw);
              return (
                <li key={r.label} className={cn('flex items-center gap-1.5 text-[11px] font-bold transition', ok ? 'text-emerald-700' : 'text-slate-400')}>
                  {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />} {r.label}
                </li>
              );
            })}
          </ul>
          <PasswordInput label="Xác nhận mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} placeholder="Nhập lại mật khẩu mới" />
          <Button type="submit" fullWidth size="lg" variant="gradient" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Cập nhật mật khẩu
          </Button>
        </form>
      </Card>
    </div>
  );
};
