import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { Button, Card, Input, Select, SectionTitle, Textarea } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';

const INFO = [
  { icon: MapPin, title: 'Địa chỉ', lines: ['54 Nguyễn Lương Bằng', 'Liên Chiểu, Đà Nẵng'] },
  { icon: Phone, title: 'Hotline', lines: ['0236 555 0199', 'T2 – T7, 8:00 – 21:00'] },
  { icon: Mail, title: 'Email', lines: ['hello@orbilingo.vn', 'support@orbilingo.vn'] },
  { icon: Clock, title: 'Phản hồi', lines: ['Trong vòng 24 giờ', 'Ưu tiên tài khoản VIP'] },
];

export const ContactPage: React.FC = () => {
  useDocumentTitle('Liên hệ');
  const [form, setForm] = useState({ name: '', email: '', topic: 'support', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = 'Vui lòng nhập họ tên';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Email không hợp lệ';
    if (form.message.trim().length < 10) er.message = 'Nội dung tối thiểu 10 ký tự';
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForm({ name: '', email: '', topic: 'support', message: '' });
      toast.success('Đã gửi liên hệ', 'Chúng tôi sẽ phản hồi qua email trong 24 giờ.');
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-12">
      <Reveal>
        <SectionTitle eyebrow="Liên hệ" title="Chúng tôi luôn sẵn sàng hỗ trợ" description="Gửi câu hỏi về lộ trình học, gói dịch vụ hoặc hợp tác giảng dạy." />
      </Reveal>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <Reveal animation="slide-in-left">
          <Card padding="lg">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Họ và tên" required value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} error={errors.name} placeholder="Nguyễn Văn A" />
                <Input label="Email" required type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} error={errors.email} placeholder="ban@example.com" />
              </div>
              <Select
                label="Chủ đề"
                value={form.topic}
                onChange={(e) => setForm((s) => ({ ...s, topic: e.target.value }))}
                options={[
                  { value: 'support', label: 'Hỗ trợ kỹ thuật' },
                  { value: 'billing', label: 'Thanh toán & gói VIP' },
                  { value: 'teacher', label: 'Hợp tác giảng dạy' },
                  { value: 'other', label: 'Khác' },
                ]}
              />
              <Textarea label="Nội dung" required value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} error={errors.message} placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..." />
              <Button type="submit" size="lg" loading={loading} leftIcon={<Send className="w-4 h-4" />}>
                Gửi liên hệ
              </Button>
            </form>
          </Card>
        </Reveal>
        <Stagger className="space-y-4" animation="slide-in-right">
          {INFO.map((i) => {
            const Icon = i.icon;
            return (
              <Card key={i.title} hover className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{i.title}</p>
                  {i.lines.map((l) => (
                    <p key={l} className="text-xs text-slate-500">
                      {l}
                    </p>
                  ))}
                </div>
              </Card>
            );
          })}
          <Card className="bg-indigo-600 text-white border-indigo-600">
            <MessageCircle className="w-6 h-6 mb-2" />
            <p className="font-bold">Hỏi nhanh qua FAQ</p>
            <p className="text-xs text-indigo-100 mt-1">Hầu hết câu hỏi phổ biến đã có câu trả lời.</p>
            <Button to="/faq" size="sm" variant="secondary" className="mt-3 bg-white text-indigo-700 hover:bg-indigo-50">
              Xem FAQ
            </Button>
          </Card>
        </Stagger>
      </div>
    </div>
  );
};
