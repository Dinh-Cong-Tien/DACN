import React from 'react';
import { ArrowRight, Heart, Target, Users, Lightbulb } from 'lucide-react';
import { Button, SectionTitle, Timeline, Card } from '@/shared/components/ui';
import { Reveal, Stagger, CountUp, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { Avatar } from '@/shared/components/ui';
import { useOverview, useTeam } from '@/shared/api/cms';
import { useDocumentTitle } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { appLocale } from '@/shared/i18n';

const VALUES = [
  { icon: Target, t: 'Đúng chỗ yếu', d: 'Không học lại cái đã biết. Dữ liệu bài làm quyết định bạn học gì tiếp.', bg: 'bg-indigo-100' },
  { icon: Heart, t: 'Thật thà với người học', d: 'Điểm thi thử quy đổi theo ETS, không "bơm" để lấy lòng.', bg: 'bg-amber-200' },
  { icon: Users, t: 'Giáo viên là trung tâm', d: 'Công nghệ giúp giáo viên chấm nhanh hơn, không thay thế họ.', bg: 'bg-violet-100' },
  { icon: Lightbulb, t: 'Đơn giản để duy trì', d: 'Một việc rõ ràng mỗi ngày. 45 phút là đủ.', bg: 'bg-sky-100' },
];

export const AboutPage: React.FC = () => {
  useDocumentTitle('Giới thiệu');
  const { data: o } = useOverview();
  const { data: team = [] } = useTeam();
  const n = (v?: number) => (v ?? 0).toLocaleString(appLocale());
  return (
    <div>
      <section className="relative bg-paper border-b-2 border-slate-900 overflow-hidden">
        <Doodles />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <div className="space-y-6">
            <SectionTitle align="left" eyebrow="Về OrbiLingo" title={<>Luyện thi đúng chỗ yếu, <span className="mark-coral mark">từ dữ liệu bài làm</span>.</>} description="OrbiLingo là đồ án chuyên ngành của Khoa CNTT: nền tảng luyện thi TOEIC và VSTEP với thi thử, sổ tay lỗi sai, ôn tập ngắt quãng và lớp học cùng giáo viên." />
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
        <Stagger key={o ? 'data' : 'loading'} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            [o?.students ?? 0, '', 'học viên'],
            [o?.teachers ?? 0, '', 'giáo viên & trưởng bộ môn'],
            [o?.tests ?? 0, '', 'đề thi thử'],
            [o?.questions ?? 0, '', 'câu hỏi có đáp án'],
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
          <SectionTitle align="left" eyebrow="Hệ thống hiện tại" title="OrbiLingo hôm nay" description="Số liệu lấy trực tiếp từ cơ sở dữ liệu." />
        </Reveal>
        <Reveal delay={100}>
          <Timeline
            items={[
              { id: '1', title: 'Ngân hàng đề', description: `${n(o?.tests)} đề thi thử, ${n(o?.questions)} câu hỏi có đáp án và ${n(o?.passages)} bài đọc / bài nghe.`, time: 'Đề thi', tone: 'amber' },
              { id: '2', title: 'Học liệu', description: `${n(o?.courses)} khoá học với ${n(o?.lessons)} bài học, ${n(o?.words)} từ vựng có phiên âm và ví dụ.`, time: 'Học', tone: 'indigo' },
              { id: '3', title: 'Lớp học', description: `${n(o?.teachers)} giáo viên và trưởng bộ môn phụ trách lớp, chấm Viết/Nói theo tiêu chí.`, time: 'Lớp', tone: 'violet' },
              { id: '4', title: 'Học viên', description: `${n(o?.students)} tài khoản học viên đang hoạt động, 5 vai trò người dùng.`, time: 'Nay', tone: 'emerald' },
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
          {team.map((m, i) => (
            <Card key={m.id} hard padding="none" className={cn('overflow-hidden', i % 2 ? 'tilt-2' : 'tilt-3')}>
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt={m.name} className="w-full aspect-square object-cover border-b-2 border-slate-900" />
              ) : (
                <div className="flex aspect-square items-center justify-center border-b-2 border-slate-900 bg-indigo-100">
                  <Avatar name={m.name} size="xl" />
                </div>
              )}
              <div className="p-4">
                <p className="font-display font-extrabold text-slate-900">{m.name}</p>
                <p className="text-xs font-bold text-violet-600">
                  {m.role}
                  {m.department ? ` · ${m.department}` : ''}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {m.classes} lớp · {m.students} học viên
                </p>
              </div>
            </Card>
          ))}
        </Stagger>
      </section>
    </div>
  );
};
