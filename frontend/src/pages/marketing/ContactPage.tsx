import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Clock, MessageCircle } from 'lucide-react';
import { Button, Input, Textarea, Select, SectionTitle, Card } from '@/shared/components/ui';
import { Reveal } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { cmsApi } from '@/shared/api/cms';
import { errorMessage } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { useDocumentTitle } from '@/shared/hooks';

export const ContactPage: React.FC = () => {
  useDocumentTitle('Liên hệ');
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ name: user?.fullName ?? '', email: user?.email ?? '', topic: 'support', message: '' });
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Thiếu thông tin', 'Vui lòng điền tên, email và nội dung.');
    setLoading(true);
    cmsApi
      .contact({ name: form.name.trim(), email: form.email.trim(), topic: form.topic, message: form.message.trim() })
      .then(() => {
        setForm((s) => ({ ...s, topic: 'support', message: '' }));
        toast.success('Đã gửi', 'Yêu cầu đã chuyển tới đội hỗ trợ, phản hồi sẽ gửi về email bạn để lại.');
      })
      .catch((err) => toast.error('Chưa gửi được', errorMessage(err)))
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
      <div className="space-y-8">
        <Reveal>
          <SectionTitle align="left" eyebrow="Liên hệ" title={<>Có người thật <span className="mark">trả lời</span>.</>} description="Giờ làm việc 8:00–22:00 mỗi ngày. Tin nhắn gửi ở đây được lưu thành yêu cầu hỗ trợ và chuyển thẳng tới đội hỗ trợ." />
        </Reveal>
        <Reveal className="photo-frame tilt-1">
          <Img src={PHOTOS.office} alt="Văn phòng OrbiLingo" ratio="video" fallbackClass="bg-indigo-200" />
        </Reveal>
        <Reveal className="grid sm:grid-cols-2 gap-4">
          {[
            [MapPin, 'Văn phòng', '54 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng', 'bg-amber-200'],
            [Phone, 'Hotline', '0236 555 0199', 'bg-indigo-100'],
            [Mail, 'Email', 'hello@orbilingo.vn', 'bg-violet-100'],
            [Clock, 'Giờ làm việc', '8:00 – 22:00, Thứ 2 – Chủ nhật', 'bg-sky-100'],
          ].map(([Icon, t, d, bg]) => {
            const I = Icon as React.ElementType;
            return (
              <div key={t as string} className={`rounded-2xl border-2 border-slate-900 p-4 ${bg as string}`}>
                <I className="w-5 h-5 text-slate-900" />
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mt-3">{t as string}</p>
                <p className="text-sm font-bold text-slate-900">{d as string}</p>
              </div>
            );
          })}
        </Reveal>
        <p className="text-sm text-slate-600 flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-emerald-600" /> Có thể hỏi nhanh qua khung chat ở góc phải màn hình.
        </p>
      </div>

      <Reveal delay={100}>
        <Card hard padding="lg" className="space-y-4">
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Gửi tin nhắn</h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Họ và tên" required value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Nguyễn Văn A" />
              <Input label="Email" required type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="name@example.com" />
            </div>
            <Select
              label="Chủ đề"
              value={form.topic}
              onChange={(e) => setForm((s) => ({ ...s, topic: e.target.value }))}
              options={[
                { value: 'support', label: 'Hỗ trợ kỹ thuật' },
                { value: 'billing', label: 'Thanh toán & gói VIP' },
                { value: 'teacher', label: 'Hợp tác giáo viên' },
                { value: 'school', label: 'Triển khai cho trường/lớp' },
                { value: 'other', label: 'Khác' },
              ]}
            />
            <Textarea label="Nội dung" required value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..." />
            <Button type="submit" size="lg" variant="gradient" fullWidth loading={loading} rightIcon={<Send className="w-4 h-4" />}>
              Gửi tin nhắn
            </Button>
            <p className="text-[11px] text-slate-500 text-center">Bằng việc gửi, bạn đồng ý để chúng tôi liên hệ lại qua email đã cung cấp.</p>
          </form>
        </Card>
      </Reveal>
    </div>
  );
};
