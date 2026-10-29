import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, MailCheck, KeyRound } from 'lucide-react';
import { Button, Card, Input } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';

export const ForgotPasswordPage: React.FC = () => {
  useDocumentTitle('Quên mật khẩu');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success('Đã gửi email khôi phục');
    }, 600);
  };

  if (sent) {
    return (
      <Card padding="lg" className="text-center space-y-4 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pop">
          <MailCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Kiểm tra hộp thư của bạn</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Chúng tôi đã gửi liên kết đặt lại mật khẩu tới <b className="text-slate-800">{email}</b>. Liên kết có hiệu lực trong 15 phút.
        </p>
        <Button to="/auth/reset-password" fullWidth variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Mở trang đặt lại mật khẩu (demo)
        </Button>
        <button onClick={() => setSent(false)} className="text-xs font-semibold text-indigo-600 hover:underline">
          Không nhận được? Gửi lại
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 animate-fade-down">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-float">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quên mật khẩu?</h1>
        <p className="text-sm text-slate-500">Nhập email đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
      </div>
      <Card padding="lg" className="animate-fade-up">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="name@example.com" leftIcon={<Mail />} />
          <Button type="submit" fullWidth size="lg" variant="gradient" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Gửi liên kết khôi phục
          </Button>
        </form>
        <Link to="/auth/login" className="mt-5 flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
        </Link>
      </Card>
    </div>
  );
};
