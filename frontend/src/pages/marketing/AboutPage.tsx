import React from 'react';
import { Target, Heart, Lightbulb, Rocket, Users, ArrowRight, Code2, GraduationCap } from 'lucide-react';
import { Avatar, Badge, Button, Card, GradientPanel, SectionTitle, Timeline } from '@/shared/components/ui';
import { CountUp, FloatingBlobs, Reveal, Stagger } from '@/shared/components/motion';
import { HOME_STATS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';

const VALUES = [
  { icon: Target, title: 'Đúng mục tiêu', desc: 'Mọi bài học đều gắn với điểm số và ngày thi của bạn, không học lan man.', cls: 'bg-indigo-50 text-indigo-600' },
  { icon: Lightbulb, title: 'Dựa trên dữ liệu', desc: 'Lộ trình thích ứng theo từng câu trả lời, lỗi sai được phân tích tự động.', cls: 'bg-amber-50 text-amber-600' },
  { icon: Heart, title: 'Thân thiện', desc: 'Giao diện tập trung, động lực hàng ngày và cộng đồng học viên hỗ trợ.', cls: 'bg-rose-50 text-rose-600' },
];

const TEAM = [
  { name: 'Lê Quốc Bảo', role: 'Trưởng bộ môn · Học thuật', tag: 'VSTEP C1' },
  { name: 'Trần Thu Hà', role: 'Giáo viên TOEIC', tag: '8 năm' },
  { name: 'Phạm Ngọc Linh', role: 'Giáo viên VSTEP', tag: 'Writing & Speaking' },
  { name: 'Nguyễn Văn Dũng', role: 'Giáo viên Listening', tag: 'ETS Certified' },
];

const MILESTONES = [
  { id: 'm1', title: 'Khởi động dự án', description: 'Thiết kế vòng lặp học tập 5 bước và kiến trúc Monorepo.', time: '01/2026', tone: 'indigo' as const, icon: <Rocket /> },
  { id: 'm2', title: 'Ra mắt Engine thi thử', description: 'Phòng thi focus mode, audio một lần, chấm điểm tự động.', time: '04/2026', tone: 'violet' as const, icon: <Code2 /> },
  { id: 'm3', title: 'Sổ tay lỗi sai & SRS', description: 'Tự động phân loại lỗi, lịch ôn ngắt quãng SM-2.', time: '07/2026', tone: 'emerald' as const, icon: <Lightbulb /> },
  { id: 'm4', title: 'Mở lớp học & giáo viên', description: 'Giáo viên tạo lớp, giao bài, chấm Writing/Speaking.', time: '10/2026', tone: 'amber' as const, icon: <GraduationCap /> },
];

export const AboutPage: React.FC = () => {
  useDocumentTitle('Giới thiệu');
  return (
    <div className="pb-24">
      <section className="relative overflow-hidden py-16 md:py-24 text-center">
        <FloatingBlobs />
        <div className="relative max-w-3xl mx-auto px-4 space-y-5 animate-fade-up">
          <Badge tone="indigo" size="md">
            Về OrbiLingo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Sứ mệnh: giúp mọi người học <span className="text-gradient">đúng cách</span>, đạt <span className="text-gradient">đúng mục tiêu</span>
          </h1>
          <p className="text-slate-600 leading-relaxed">OrbiLingo ra đời từ một đồ án chuyên ngành với niềm tin rằng luyện thi không nên là làm đề vô định. Chúng tôi xây dựng nền tảng thích ứng, nơi mỗi câu sai đều trở thành cơ hội tiến bộ.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HOME_STATS.map((s) => (
            <Card key={s.label} padding="sm" className="text-center">
              <p className="text-2xl font-black text-slate-900">
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
            </Card>
          ))}
        </Stagger>
        <Reveal>
          <SectionTitle eyebrow="Giá trị cốt lõi" title="Điều chúng tôi tin" />
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-5">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <Card key={v.title} hover className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${v.cls}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </Card>
            );
          })}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12">
        <Reveal animation="slide-in-left">
          <SectionTitle eyebrow="Hành trình" title="Các cột mốc phát triển" align="left" className="mb-8" />
          <Timeline items={MILESTONES} />
        </Reveal>
        <Reveal animation="slide-in-right">
          <SectionTitle eyebrow="Đội ngũ" title="Người đồng hành cùng bạn" align="left" className="mb-8" />
          <div className="grid sm:grid-cols-2 gap-4">
            {TEAM.map((t, i) => (
              <Card key={t.name} hover className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <Avatar name={t.name} size="lg" ring />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <Badge tone="indigo" size="xs" className="mt-1">
                    {t.tag}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal animation="scale-in">
          <GradientPanel tone="indigo" className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12 shrink-0" />
              <div>
                <h3 className="text-2xl font-black">Cùng học với hơn 24.000 học viên</h3>
                <p className="text-indigo-100 text-sm">Bắt đầu miễn phí hôm nay.</p>
              </div>
            </div>
            <Button to="/auth/register" variant="secondary" size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 shrink-0" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Tham gia ngay
            </Button>
          </GradientPanel>
        </Reveal>
      </section>
    </div>
  );
};
