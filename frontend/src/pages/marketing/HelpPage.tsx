import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Rocket, FileText, AlertTriangle, CreditCard, Users, Settings, ArrowRight, BookOpen } from 'lucide-react';
import { Input, SectionTitle, Button } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';

const TOPICS = [
  { icon: Rocket, t: 'Bắt đầu', d: 'Tạo tài khoản, thi xếp lớp, đọc lộ trình 3 chặng.', n: 8, bg: 'bg-amber-200' },
  { icon: FileText, t: 'Thi thử', d: 'Audio không phát, mất mạng giữa bài, xem lại đáp án.', n: 12, bg: 'bg-white' },
  { icon: AlertTriangle, t: 'Sổ tay lỗi sai & ôn tập', d: 'Lịch SM-2 hoạt động thế nào, đánh dấu đã hiểu.', n: 6, bg: 'bg-indigo-100' },
  { icon: CreditCard, t: 'Gói VIP & thanh toán', d: 'Chuyển khoản, kích hoạt, hoàn tiền.', n: 9, bg: 'bg-white' },
  { icon: Users, t: 'Lớp học', d: 'Nhập mã mời, nộp bài, xem nhận xét giáo viên.', n: 7, bg: 'bg-violet-100' },
  { icon: Settings, t: 'Tài khoản', d: 'Đổi email, mật khẩu, xoá tài khoản.', n: 5, bg: 'bg-white' },
];

export const HelpPage: React.FC = () => {
  useDocumentTitle('Trung tâm trợ giúp');
  const [q, setQ] = useState('');
  const list = TOPICS.filter((t) => (t.t + t.d).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <section className="bg-indigo-600 text-white border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_360px] gap-10 items-center">
          <div className="space-y-6">
            <SectionTitle dark align="left" eyebrow="Trung tâm trợ giúp" title={<>Bạn cần <span className="mark mark-full">giúp gì</span>?</>} description="Hướng dẫn từng bước kèm ảnh chụp màn hình. Cập nhật theo phiên bản hiện tại." />
            <div className="max-w-xl">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm hướng dẫn... (ví dụ: mã mời lớp)" leftIcon={<Search />} inputSize="lg" />
            </div>
          </div>
          <div className="photo-frame tilt-2 hidden lg:block">
            <Img src={PHOTOS.desk} alt="" ratio="4/3" fallbackClass="bg-indigo-400" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <Stagger key={q} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((t) => (
            <Link key={t.t} to="/faq" className={cn('group rounded-3xl border-2 border-slate-900 shadow-hard p-6 card-hard-hover block', t.bg)}>
              <t.icon className="w-8 h-8 text-slate-900" />
              <h3 className="font-display text-xl font-extrabold text-slate-900 mt-5">{t.t}</h3>
              <p className="text-sm text-slate-600 mt-2">{t.d}</p>
              <p className="text-xs font-bold text-violet-600 mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                {t.n} bài hướng dẫn <ArrowRight className="w-3.5 h-3.5" />
              </p>
            </Link>
          ))}
        </Stagger>
        <Reveal className="rounded-3xl bg-slate-900 text-white border-2 border-slate-900 shadow-hard p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-amber-300 shrink-0" />
            <div>
              <h3 className="font-display text-2xl font-extrabold">Vẫn chưa tìm thấy?</h3>
              <p className="text-slate-300 mt-1">Xem câu hỏi thường gặp hoặc nhắn trực tiếp cho đội hỗ trợ.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button to="/faq" variant="white">
              FAQ
            </Button>
            <Button to="/contact" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Liên hệ
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
