import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Send, Inbox } from 'lucide-react';
import { Button, Card, Input, Alert } from '@/shared/components/ui';
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
      setError('Email không hợp lệ.');
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
      <Card hard padding="lg" className="text-center space-y-4 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-200 border-2 border-slate-900 shadow-hard-sm text-emerald-800 flex items-center justify-center mx-auto animate-pop tilt-2">
          <Inbox className="w-8 h-8" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Kiểm tra hộp thư</h1>
        <p className="text-sm text-slate-600">
          Chúng tôi đã gửi liên kết đặt lại mật khẩu tới <b className="text-slate-900">{email}</b>. Liên kết có hiệu lực trong 30 phút.
        </p>
        <Button to="/auth/reset-password" fullWidth size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Mở trang đặt lại (demo)
        </Button>
        <button onClick={() => setSent(false)} className="text-xs font-bold text-slate-600 hover:text-violet-600">
          Nhập email khác
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 animate-fade-down">
        <span className="sticker tilt-1">Khôi phục tài khoản</span>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Quên mật khẩu?</h1>
        <p className="text-sm text-slate-600">Nhập email đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
      </div>
      <Card hard padding="lg" className="animate-fade-up space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" leftIcon={<Mail />} />
          <Button type="submit" fullWidth size="lg" variant="gradient" loading={loading} rightIcon={<Send className="w-4 h-4" />}>
            Gửi liên kết
          </Button>
        </form>
        <Link to="/auth/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-violet-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
        </Link>
      </Card>
    </div>
  );
};
