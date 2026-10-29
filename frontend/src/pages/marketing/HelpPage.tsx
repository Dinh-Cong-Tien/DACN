import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, FileText, AlertTriangle, CreditCard, Users, Settings, ArrowRight, LifeBuoy, HelpCircle } from 'lucide-react';
import { Button, Card, EmptyState, SearchInput, SectionTitle } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { useDocumentTitle } from '@/shared/hooks';

const TOPICS = [
  { icon: Rocket, title: 'Bắt đầu', desc: 'Đăng ký, xác thực email, làm bài xếp lớp và nhận lộ trình.', items: ['Tạo tài khoản', 'Bài thi xếp lớp', 'Đọc hiểu lộ trình 3 chặng'], cls: 'bg-indigo-50 text-indigo-600', to: '/faq' },
  { icon: FileText, title: 'Thi thử & Luyện tập', desc: 'Phòng thi focus mode, phím tắt, nộp bài và xem kết quả.', items: ['Audio chỉ phát 1 lần', 'Đánh dấu câu xem lại', 'Tự động nộp khi hết giờ'], cls: 'bg-violet-50 text-violet-600', to: '/faq' },
  { icon: AlertTriangle, title: 'Sổ tay lỗi sai & SRS', desc: 'Cách câu sai được lưu, phân loại và nhắc ôn tập.', items: ['Phân loại nguyên nhân', 'Lịch ôn 1-3-7-14-30 ngày', 'Luyện điểm yếu'], cls: 'bg-rose-50 text-rose-600', to: '/faq' },
  { icon: CreditCard, title: 'Thanh toán & VIP', desc: 'Gói dịch vụ, cách thanh toán và kích hoạt quyền lợi.', items: ['So sánh các gói', 'Hoàn tiền 7 ngày', 'Hoá đơn'], cls: 'bg-amber-50 text-amber-600', to: '/pricing' },
  { icon: Users, title: 'Lớp học & Giáo viên', desc: 'Tham gia lớp bằng mã mời, nộp bài tập, xem nhận xét.', items: ['Nhập mã lớp', 'Hạn nộp bài', 'Nhận xét Writing/Speaking'], cls: 'bg-emerald-50 text-emerald-600', to: '/faq' },
  { icon: Settings, title: 'Tài khoản & Bảo mật', desc: 'Đổi mật khẩu, cập nhật mục tiêu, quản lý thông báo.', items: ['Quên mật khẩu', 'Đổi mục tiêu điểm', 'Xoá tài khoản'], cls: 'bg-sky-50 text-sky-600', to: '/auth/forgot-password' },
];

export const HelpPage: React.FC = () => {
  useDocumentTitle('Trung tâm trợ giúp');
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();
  const list = TOPICS.filter((t) => !s || t.title.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s) || t.items.some((i) => i.toLowerCase().includes(s)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-10">
      <Reveal>
        <SectionTitle eyebrow="Trung tâm trợ giúp" title="Bạn cần hỗ trợ gì?" description="Tìm hướng dẫn theo chủ đề hoặc tra cứu câu hỏi thường gặp." />
      </Reveal>
      <div className="max-w-2xl mx-auto animate-fade-up">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm hướng dẫn: nộp bài, mã lớp, đổi mật khẩu..." inputSize="lg" />
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<LifeBuoy />} title="Không tìm thấy chủ đề" description="Thử từ khoá khác hoặc xem FAQ." action={<Button to="/faq">Xem FAQ</Button>} />
      ) : (
        <Stagger key={s} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" step={70} whenVisible={false}>
          {list.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.title} to={t.to} className="block group">
                <Card hover className="h-full space-y-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.cls} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900">{t.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {t.items.map((i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <HelpCircle className="w-3 h-3 text-slate-300" /> {i}
                      </li>
                    ))}
                  </ul>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-1">
                    Xem hướng dẫn <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </Stagger>
      )}
      <Reveal animation="scale-in">
        <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 text-white border-slate-900">
          <div className="flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="font-bold">Chưa giải quyết được vấn đề?</p>
              <p className="text-xs text-slate-400">Gửi yêu cầu hỗ trợ, phản hồi trong 24 giờ.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button to="/faq" variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
              FAQ
            </Button>
            <Button to="/contact" size="sm" variant="gradient">
              Liên hệ
            </Button>
          </div>
        </Card>
      </Reveal>
    </div>
  );
};
