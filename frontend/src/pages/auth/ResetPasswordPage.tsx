import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Card, PasswordInput } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';

export const ResetPasswordPage: React.FC = () => {
  useDocumentTitle('Đặt lại mật khẩu');
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const rules = [
    { ok: pw.length >= 8, label: 'Tối thiểu 8 ký tự' },
    { ok: /[A-Z]/.test(pw), label: 'Có chữ in hoa' },
    { ok: /[0-9]/.test(pw), label: 'Có chữ số' },
    { ok: pw.length > 0 && pw === confirm, label: 'Mật khẩu xác nhận khớp' },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (pw.length < 8) er.pw = 'Mật khẩu tối thiểu 8 ký tự';
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
      <div className="text-center space-y-2 animate-fade-down">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-float">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đặt lại mật khẩu</h1>
        <p className="text-sm text-slate-500">Tạo mật khẩu mới cho tài khoản của bạn.</p>
      </div>
      <Card padding="lg" className="animate-fade-up">
        <form onSubmit={submit} className="space-y-4">
          <PasswordInput label="Mật khẩu mới" value={pw} onChange={(e) => setPw(e.target.value)} error={errors.pw} placeholder="••••••••" autoComplete="new-password" />
          <PasswordInput label="Xác nhận mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} placeholder="••••••••" autoComplete="new-password" />
          <ul className="grid grid-cols-2 gap-1.5">
            {rules.map((r) => (
              <li key={r.label} className={cn('flex items-center gap-1.5 text-[11px] font-semibold transition-colors', r.ok ? 'text-emerald-600' : 'text-slate-400')}>
                <CheckCircle2 className={cn('w-3.5 h-3.5 transition-transform', r.ok && 'scale-110')} /> {r.label}
              </li>
            ))}
          </ul>
          <Button type="submit" fullWidth size="lg" variant="gradient" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Cập nhật mật khẩu
          </Button>
        </form>
      </Card>
    </div>
  );
};
