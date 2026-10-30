import React from 'react';
import { ArrowRight, Heart, Target, Users, Lightbulb } from 'lucide-react';
import { Button, SectionTitle, Timeline, Card } from '@/shared/components/ui';
import { Reveal, Stagger, CountUp, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';

const TEAM = [
  { name: 'Lê Quốc Bảo', role: 'Trưởng bộ môn · VSTEP C1', img: 44, note: '12 năm giảng dạy, ĐH Ngoại ngữ Đà Nẵng' },
  { name: 'Trần Thu Hà', role: 'Giáo viên TOEIC · 985', img: 43, note: 'Chuyên Part 3–4, 3.000+ học viên' },
  { name: 'Phạm Ngọc Linh', role: 'Giáo viên VSTEP Writing', img: 42, note: 'Chấm 1.200+ bài Writing' },
  { name: 'Nguyễn Văn Dũng', role: 'Giáo viên TOEIC Reading', img: 41, note: 'Tác giả 7 lỗi Part 2' },
  { name: 'Phạm Quản Trị', role: 'Kỹ thuật & Sản phẩm', img: 45, note: 'Sinh viên năm 3, Khoa CNTT' },
];

const VALUES = [
  { icon: Target, t: 'Đúng chỗ yếu', d: 'Không học lại cái đã biết. Dữ liệu bài làm quyết định bạn học gì tiếp.', bg: 'bg-indigo-100' },
  { icon: Heart, t: 'Thật thà với người học', d: 'Điểm thi thử quy đổi theo ETS, không "bơm" để lấy lòng.', bg: 'bg-amber-200' },
  { icon: Users, t: 'Giáo viên là trung tâm', d: 'Công nghệ giúp giáo viên chấm nhanh hơn, không thay thế họ.', bg: 'bg-violet-100' },
  { icon: Lightbulb, t: 'Đơn giản để duy trì', d: 'Một việc rõ ràng mỗi ngày. 45 phút là đủ.', bg: 'bg-sky-100' },
];

export const AboutPage: React.FC = () => {
  useDocumentTitle('Giới thiệu');
  return (
    <div>
      <section className="relative bg-paper border-b-2 border-slate-900 overflow-hidden">
        <Doodles />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <div className="space-y-6">
            <SectionTitle align="left" eyebrow="Về OrbiLingo" title={<>Sinh ra từ một lớp luyện thi <span className="mark-coral mark">ở Đà Nẵng</span>.</>} description="Năm 2025, cô Hà có 28 học viên và một cuốn sổ ghi câu sai của từng người. Sổ đó giờ là OrbiLingo." />
            <Button to="/auth/register" variant="gradient" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Học thử miễn phí
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="photo-frame tilt-1 mt-10">
              <Img src={PHOTOS.classroom} alt="" ratio="3/4" fallbackClass="bg-indigo-200" />
            </div>
            <div className="photo-frame tilt-2">
              <Img src={PHOTOS.students2} alt="" ratio="3/4" fallbackClass="bg-amber-200" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            [24837, '+', 'học viên'],
            [38, '', 'giáo viên & cộng tác viên'],
            [183, '+', 'đề thi thử'],
            [147, '', 'điểm tăng trung bình'],
          ].map(([v, s, l], i) => (
            <div key={l as string} className={cn('rounded-2xl border-2 border-slate-900 p-5', ['bg-white', 'bg-amber-200', 'bg-indigo-100', 'bg-violet-100'][i])}>
              <p className="font-display text-4xl font-extrabold text-slate-900">
                <CountUp value={v as number} suffix={s as string} />
              </p>
              <p className="text-sm font-semibold text-slate-600 mt-1">{l as string}</p>
            </div>
          ))}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[360px_1fr] gap-12 items-start">
        <Reveal>
          <SectionTitle align="left" eyebrow="Hành trình" title="Từ cuốn sổ tới nền tảng" />
        </Reveal>
        <Reveal delay={100}>
          <Timeline
            items={[
              { id: '1', title: 'Tháng 3/2025 — Cuốn sổ lỗi sai', description: 'Lớp TOEIC 28 người. Mỗi buổi cô Hà ghi câu sai của từng bạn vào sổ và giao bài ôn riêng.', time: '2025', tone: 'amber' },
              { id: '2', title: 'Tháng 8/2025 — Bản Google Sheet', description: 'Sổ chuyển sang bảng tính, tự nhắc ôn sau 1-3-7 ngày. Điểm trung bình lớp tăng 62 điểm sau 2 tháng.', time: '2025', tone: 'indigo' },
              { id: '3', title: 'Tháng 1/2026 — Khởi động dự án', description: 'Đồ án chuyên ngành: xây nền tảng với thi thử, sổ tay lỗi sai, SM-2 và lớp học cho giáo viên.', time: '2026', tone: 'violet' },
              { id: '4', title: 'Tháng 10/2026 — Phiên bản hiện tại', description: '5 vai trò, 183 đề, 12.614 câu hỏi được duyệt. 24.837 học viên.', time: 'Nay', tone: 'emerald' },
            ]}
          />
        </Reveal>
      </section>

      <section className="bg-slate-900 text-white border-y-2 border-slate-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <Reveal>
            <SectionTitle dark align="left" eyebrow="Giá trị" title="Bốn điều chúng tôi không thoả hiệp" />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v) => (
              <div key={v.t} className={cn('rounded-3xl border-2 border-slate-900 p-6 text-slate-900', v.bg)}>
                <v.icon className="w-8 h-8" />
                <h3 className="font-display text-xl font-extrabold mt-5">{v.t}</h3>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">{v.d}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-10">
        <Reveal>
          <SectionTitle align="left" eyebrow="Đội ngũ" title="Những người đứng sau" description="Giáo viên thật, có lớp thật. Bạn sẽ gặp họ trong khoá học và bàn chấm bài." />
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {TEAM.map((m, i) => (
            <Card key={m.name} hard padding="none" className={cn('overflow-hidden', i % 2 ? 'tilt-2' : 'tilt-3')}>
              <img src={pravatar(m.img)} alt={m.name} className="w-full aspect-square object-cover border-b-2 border-slate-900" />
              <div className="p-4">
                <p className="font-display font-extrabold text-slate-900">{m.name}</p>
                <p className="text-xs font-bold text-violet-600">{m.role}</p>
                <p className="text-xs text-slate-500 mt-1">{m.note}</p>
              </div>
            </Card>
          ))}
        </Stagger>
      </section>
    </div>
  );
};
