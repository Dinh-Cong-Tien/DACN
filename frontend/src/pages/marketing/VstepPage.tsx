import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Headphones, BookOpen, PenTool, Mic, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Button, Card, SectionTitle, Badge, Accordion } from '@/shared/components/ui';
import { Reveal, Stagger, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';
import { VSTEP_PARTS_INFO, MOCK_TESTS } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';

const VSTEP_LEVELS_UI = [
  { level: 'B1', bac: 3, score: '4.0 – 5.5', who: 'Chuẩn đầu ra tốt nghiệp đại học tại hầu hết trường. Giao tiếp được trong tình huống quen thuộc.', need: ['Nghe hiểu thông báo, hội thoại ngắn', 'Viết email 120 từ đúng bố cục', 'Nói 2–3 phút về chủ đề đời sống'] },
  { level: 'B2', bac: 4, score: '6.0 – 8.0', who: 'Yêu cầu với cao học, giáo viên tiếng Anh THCS/THPT và nhiều vị trí doanh nghiệp.', need: ['Đọc bài học thuật 600–800 từ', 'Viết luận 250 từ có lập luận', 'Thảo luận giải pháp, phản biện'] },
  { level: 'C1', bac: 5, score: '8.5 – 10', who: 'Giảng viên, nghiên cứu sinh, chuyên ngành ngôn ngữ Anh. Sử dụng linh hoạt trong học thuật.', need: ['Từ vựng học thuật nâng cao', 'Bài viết mạch lạc, cấu trúc phức', 'Phát triển chủ đề trừu tượng 5 phút'] },
];

const ICONS: Record<string, React.ElementType> = { Listening: Headphones, Reading: BookOpen, Writing: PenTool, Speaking: Mic };
const TONES = ['bg-indigo-100 text-indigo-800', 'bg-violet-100 text-violet-800', 'bg-amber-200 text-slate-900', 'bg-sky-100 text-sky-800'];

export const VstepPage: React.FC = () => {
  useDocumentTitle('Luyện thi VSTEP');
  const gate = useGate();
  const tests = MOCK_TESTS.filter((t) => t.examType === 'VSTEP');

  return (
    <div>
      <section className="relative bg-violet-500 text-white overflow-hidden border-b-2 border-slate-900">
        <Doodles tone="light" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <div className="space-y-6">
            <span className="sticker tilt-1 !bg-amber-300">VSTEP · Khung năng lực 6 bậc</span>
            <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.02]">
              Bốn kỹ năng, <br />
              một kế hoạch <span className="mark mark-full">rõ ràng</span>.
            </h1>
            <p className="text-violet-100 text-lg max-w-xl leading-relaxed">Nghe, Đọc chấm tự động. Viết, Nói ghi lại rồi giáo viên chấm theo rubric 4 tiêu chí của Bộ GD&ĐT. Mục tiêu B1, B2 hay C1 đều có lộ trình riêng.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button to="/auth/register" size="lg" variant="ink" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Thi xếp lớp VSTEP
              </Button>
              <Button to="/mock-tests" size="lg" variant="white">
                Đề mẫu Bộ GD&ĐT
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="photo-frame tilt-1 mt-8">
              <Img src={PHOTOS.writing} alt="Luyện viết VSTEP" ratio="3/4" fallbackClass="bg-violet-300" />
            </div>
            <div className="photo-frame tilt-2">
              <Img src={PHOTOS.discussion} alt="Luyện nói VSTEP" ratio="3/4" fallbackClass="bg-amber-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-10">
        <Reveal>
          <SectionTitle align="left" eyebrow="Bậc năng lực" title={<>Bạn cần <span className="mark-coral mark">bậc mấy</span>?</>} description="Hầu hết trường đại học yêu cầu B1 để tốt nghiệp; cao học và giáo viên tiếng Anh cần B2 trở lên." />
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-5">
          {VSTEP_LEVELS_UI.map((l, i) => (
            <div key={l.level} className={cn('rounded-3xl border-2 border-slate-900 shadow-hard p-6 md:p-7', ['bg-white', 'bg-amber-200', 'bg-indigo-600 text-white'][i])}>
              <p className="font-display text-5xl font-extrabold">{l.level}</p>
              <p className={cn('text-sm font-bold mt-1', i === 2 ? 'text-indigo-100' : 'text-slate-600')}>Bậc {l.bac} · {l.score} điểm</p>
              <p className={cn('mt-4 leading-relaxed text-sm', i === 2 ? 'text-indigo-50' : 'text-slate-700')}>{l.who}</p>
              <ul className="mt-5 space-y-1.5 text-sm">
                {l.need.map((n) => (
                  <li key={n} className="flex items-center gap-2">
                    <CheckCircle2 className={cn('w-4 h-4', i === 2 ? 'text-amber-300' : 'text-emerald-600')} /> {n}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Stagger>
      </section>

      {/* Skills */}
      <section className="bg-slate-900 text-white py-16 md:py-24 border-y-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <Reveal>
            <SectionTitle dark eyebrow="Cấu trúc đề" title="Bốn phần thi, gần 3 giờ." description="Thời gian và số câu theo đề mẫu chính thức. Nhấn vào từng phần để xem mẹo." />
          </Reveal>
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            <Accordion
              defaultOpen={VSTEP_PARTS_INFO[0].id}
              items={VSTEP_PARTS_INFO.map((p, i) => {
                const Icon = ICONS[p.skill] ?? BookOpen;
                return {
                  id: p.id,
                  icon: <Icon />,
                  title: (
                    <span className="flex items-center gap-3 flex-wrap">
                      <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase', TONES[i])}>{p.nameVi}</span>
                      <span className="text-slate-900">
                        {p.questions} {p.skill === 'Writing' || p.skill === 'Speaking' ? 'phần' : 'câu'} · {p.minutes} phút
                      </span>
                    </span>
                  ),
                  content: (
                    <div className="space-y-3">
                      <p>{p.description}</p>
                      <div className="rounded-xl bg-amber-100 border-2 border-slate-900 p-4">
                        <p className="font-bold text-slate-900 flex items-center gap-2 mb-2 text-sm">
                          <Lightbulb className="w-4 h-4 text-amber-600" /> Mẹo
                        </p>
                        <ul className="space-y-1 text-sm text-slate-800">
                          {p.tips.map((t) => (
                            <li key={t}>• {t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ),
                };
              })}
            />
            <div className="space-y-4">
              <Card hard tone="yellow" padding="md">
                <p className="text-[10px] font-extrabold uppercase tracking-wider">Tổng thời gian</p>
                <p className="font-display text-4xl font-extrabold mt-1 flex items-center gap-2">
                  <Clock className="w-7 h-7" /> 172 phút
                </p>
                <p className="text-sm mt-2 text-slate-800">Nghe 40 · Đọc 60 · Viết 60 · Nói 12</p>
              </Card>
              <Card hard padding="md" className="flex items-center gap-4">
                <img src={pravatar(42)} alt="" className="w-14 h-14 rounded-full border-2 border-slate-900 object-cover" />
                <div>
                  <p className="font-bold text-slate-900">Cô Phạm Ngọc Linh</p>
                  <p className="text-xs text-slate-500">Giảng viên VSTEP · chấm 1.200+ bài Writing</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tests */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-10">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <SectionTitle align="left" eyebrow="Đề mẫu" title="Đề VSTEP theo format chính thức" />
          <Button to="/mock-tests" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Xem tất cả
          </Button>
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tests.map((t) => (
            <Link key={t.id} to={gate(`/app/mock-tests/${t.id}`)} className="block bg-white rounded-3xl border-2 border-slate-900 shadow-hard overflow-hidden card-hard-hover">
              <Img src={t.coverUrl} alt="" ratio="video" fallbackClass="bg-violet-200" />
              <div className="p-4 space-y-2">
                <div className="flex gap-1.5 flex-wrap">
                  <Badge tone="violet" size="xs">
                    {t.level}
                  </Badge>
                  {t.tags?.map((tag) => (
                    <Badge key={tag} tone={tag === 'VIP' ? 'amber' : 'slate'} size="xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-display font-bold text-slate-900 leading-snug">{t.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  {t.parts.join(' · ')} · {formatNumber(t.attempts)} lượt
                </p>
              </div>
            </Link>
          ))}
        </Stagger>
      </section>
    </div>
  );
};
