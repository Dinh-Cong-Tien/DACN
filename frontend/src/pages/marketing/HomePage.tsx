import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Compass, FileText, AlertTriangle, RotateCcw, Calculator, FolderOpen, Trophy, Quote, CheckCircle2, Headphones, BookOpen } from 'lucide-react';
import { Badge, Button, Card, GradientPanel, SectionTitle } from '@/shared/components/ui';
import { CountUp, FloatingBlobs, Reveal, Stagger } from '@/shared/components/motion';
import { HOME_STATS, TESTIMONIALS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';

const STEPS = [
  { n: '01', title: 'Chẩn đoán đầu vào', desc: 'Bài test 15 phút xác định năng lực θ₀, điểm mạnh và lỗ hổng kiến thức.', icon: Target, cls: 'bg-sky-50 text-sky-600' },
  { n: '02', title: 'Lộ trình thích ứng', desc: 'Tự động phân bổ bài học 3 chặng: Nền tảng → Chuyên sâu → Thực chiến.', icon: Compass, cls: 'bg-violet-50 text-violet-600' },
  { n: '03', title: 'Luyện tập & Thi thử', desc: 'Phòng thi mô phỏng thật: đếm giờ, audio một lần, bảng câu hỏi.', icon: FileText, cls: 'bg-amber-50 text-amber-600' },
  { n: '04', title: 'Phân tích lỗi sai', desc: 'Câu sai tự động vào Sổ tay, phân loại ngữ pháp / từ vựng / nghe nhầm.', icon: AlertTriangle, cls: 'bg-rose-50 text-rose-600' },
  { n: '05', title: 'Ôn tập ngắt quãng', desc: 'SM-2 nhắc ôn đúng "thời điểm vàng" để không lặp lại lỗi cũ.', icon: RotateCcw, cls: 'bg-emerald-50 text-emerald-600' },
];

const TOOLS = [
  { to: '/score-converter', title: 'Quy đổi điểm', desc: 'TOEIC ↔ VSTEP ↔ CEFR ↔ IELTS trong một bảng tham chiếu.', icon: Calculator, tone: 'indigo' },
  { to: '/resources', title: 'Kho tài liệu mở', desc: 'PDF 24 chủ điểm ngữ pháp, 600 từ vựng, cẩm nang Writing.', icon: FolderOpen, tone: 'emerald' },
  { to: '/leaderboard', title: 'Bảng vinh danh', desc: 'Top học viên chuyên cần tuần này. Bạn sẽ ở đâu?', icon: Trophy, tone: 'amber' },
];

export const HomePage: React.FC = () => {
  useDocumentTitle('Trang chủ');
  return (
    <div className="pb-20">
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <FloatingBlobs />
        <div aria-hidden className="absolute inset-0 bg-dots opacity-60 mask-fade-b" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-700 text-xs font-bold shadow-soft animate-fade-down">
            <Sparkles className="w-4 h-4" />
            Nền tảng luyện thi thích ứng theo năng lực
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] max-w-4xl mx-auto animate-fade-up">
            Học thông minh. Luyện đúng mục tiêu.
            <span className="text-gradient block mt-2">Bứt phá TOEIC & VSTEP</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-150">
            Không còn làm đề vô định. OrbiLingo phân tích từng câu sai, chỉ ra lỗ hổng kiến thức và nhắc ôn tập ngắt quãng để bạn đạt mục tiêu điểm số nhanh nhất.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 animate-fade-up delay-300">
            <Button to="/auth/register" variant="gradient" size="xl" rightIcon={<ArrowRight className="w-5 h-5" />} className="shine w-full sm:w-auto">
              Làm bài đánh giá miễn phí
            </Button>
            <Button to="/mock-tests" variant="outline" size="xl" className="w-full sm:w-auto">
              Xem kho đề thi thử
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 animate-fade-in delay-500">
            {['Miễn phí mãi mãi', 'Không cần thẻ', 'Chuẩn ETS & Bộ GD&ĐT'].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 mt-16">
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4" step={90}>
            {HOME_STATS.map((s) => (
              <Card key={s.label} className="text-center" padding="sm">
                <p className="text-2xl md:text-3xl font-black text-slate-900">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-slate-500 font-semibold mt-1">{s.label}</p>
              </Card>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 5 STEPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-12">
        <Reveal>
          <SectionTitle eyebrow="Mô hình sư phạm" title="Vòng lặp học tập khép kín 5 bước" description="Mỗi thao tác làm bài đều được kết nối bằng dữ liệu thực, tạo thành quy trình cải thiện điểm số liên tục." />
        </Reveal>
        <Stagger className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" step={100}>
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.n} hover className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.cls}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-black text-slate-100">{s.n}</span>
                </div>
                <h3 className="font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </Card>
            );
          })}
        </Stagger>
      </section>

      {/* TOEIC vs VSTEP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <Reveal>
          <SectionTitle eyebrow="Hai kỳ thi, một nền tảng" title="Chọn mục tiêu của bạn" />
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal animation="slide-in-left">
            <GradientPanel tone="indigo" className="h-full">
              <Headphones className="w-10 h-10 mb-4 opacity-90" />
              <Badge tone="indigo" className="bg-white/15 text-white border-white/20 mb-3">
                Listening & Reading
              </Badge>
              <h3 className="text-2xl font-black">TOEIC 450 → 990</h3>
              <p className="text-indigo-100 text-sm mt-2 leading-relaxed">7 Part chuẩn ETS, 200 câu / 120 phút. Chiến thuật từng Part, bẫy nghe, word form và đọc hiểu đoạn kép.</p>
              <Button to="/toeic" variant="secondary" size="sm" className="mt-6 bg-white text-indigo-700 hover:bg-indigo-50" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Khám phá TOEIC
              </Button>
            </GradientPanel>
          </Reveal>
          <Reveal animation="slide-in-right">
            <GradientPanel tone="emerald" className="h-full">
              <BookOpen className="w-10 h-10 mb-4 opacity-90" />
              <Badge tone="emerald" className="bg-white/15 text-white border-white/20 mb-3">
                4 kỹ năng
              </Badge>
              <h3 className="text-2xl font-black">VSTEP B1 → C1</h3>
              <p className="text-emerald-100 text-sm mt-2 leading-relaxed">Format Bộ GD&ĐT: Nghe – Đọc – Viết – Nói. Bài mẫu Writing, khung trả lời Speaking và giáo viên chấm bài.</p>
              <Button to="/vstep" variant="secondary" size="sm" className="mt-6 bg-white text-emerald-700 hover:bg-emerald-50" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Khám phá VSTEP
              </Button>
            </GradientPanel>
          </Reveal>
        </div>
      </section>

      {/* TOOLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <Reveal>
          <SectionTitle eyebrow="Miễn phí cho mọi người" title="Công cụ không cần đăng nhập" />
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-5">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.to} to={t.to} className="block group">
                <Card hover className="space-y-3 h-full">
                  <div className={`w-12 h-12 rounded-2xl bg-${t.tone}-50 text-${t.tone}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{t.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
                  <span className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1">
                    Mở công cụ <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </Stagger>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <Reveal>
          <SectionTitle eyebrow="Học viên nói gì" title="Kết quả thật từ người học thật" />
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-5" step={120}>
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} hover className="flex flex-col">
              <Quote className="w-7 h-7 text-indigo-200 mb-3" />
              <p className="text-sm text-slate-700 leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
                <Badge tone="emerald" solid>
                  {t.score}
                </Badge>
              </div>
            </Card>
          ))}
        </Stagger>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Reveal animation="scale-in">
          <GradientPanel tone="slate" className="text-center py-14">
            <h2 className="text-3xl md:text-4xl font-black">Sẵn sàng bứt phá điểm số?</h2>
            <p className="text-slate-300 mt-3 max-w-xl mx-auto">Tạo tài khoản miễn phí, làm bài xếp lớp và nhận lộ trình cá nhân hoá trong 15 phút.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <Button to="/auth/register" variant="gradient" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} className="shine">
                Bắt đầu ngay
              </Button>
              <Button to="/pricing" variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                Xem bảng giá
              </Button>
            </div>
          </GradientPanel>
        </Reveal>
      </section>
    </div>
  );
};
