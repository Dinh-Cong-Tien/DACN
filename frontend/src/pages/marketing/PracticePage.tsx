import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, BookOpen, PenTool, Mic, Zap, Lock } from 'lucide-react';
import { Badge, Button, SectionTitle, Card } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { TOEIC_PARTS_INFO, VSTEP_PARTS_INFO, QUESTIONS_BY_PART } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn } from '@/shared/utils';

const SKILL_ICON: Record<string, React.ElementType> = { Listening: Headphones, Reading: BookOpen, Writing: PenTool, Speaking: Mic };
const TILES = ['bg-white', 'bg-indigo-100', 'bg-amber-200', 'bg-white', 'bg-violet-100', 'bg-white', 'bg-sky-100'];

export const PracticePage: React.FC = () => {
  useDocumentTitle('Luyện tập kỹ năng');
  const gate = useGate();
  return (
    <div>
      <section className="bg-paper border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_380px] gap-10 items-center">
          <SectionTitle align="left" eyebrow="Luyện tập" title={<>Luyện từng Part, <span className="mark-coral mark">giải thích ngay</span> sau mỗi câu.</>} description="Chọn Part TOEIC hoặc kỹ năng VSTEP. Mỗi phiên 10–30 câu, có combo, có tổng kết và câu sai tự vào sổ tay." />
          <div className="relative">
            <div className="photo-frame tilt-1">
              <Img src={PHOTOS.typing} alt="" ratio="4/3" fallbackClass="bg-indigo-200" />
            </div>
            <span className="sticker tilt-2 absolute -bottom-4 -right-2 !bg-amber-300">
              <Zap className="w-3.5 h-3.5" /> Combo x5
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <Reveal>
          <SectionTitle align="left" eyebrow="TOEIC" title="7 Part Listening & Reading" />
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOEIC_PARTS_INFO.map((p, i) => {
            const Icon = SKILL_ICON[p.skill];
            const count = QUESTIONS_BY_PART[p.id]?.length ?? 0;
            return (
              <Link key={p.id} to={gate(`/app/practice/session/${p.id}`, '/auth/register')} className={cn('group rounded-3xl border-2 border-slate-900 shadow-hard p-5 card-hard-hover block', TILES[i], i === 6 && 'lg:col-span-2')}>
                <div className="flex items-start justify-between">
                  <span className="w-11 h-11 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <Badge tone="slate" size="xs">
                    {p.questions} câu / đề
                  </Badge>
                </div>
                <p className="font-display text-2xl font-extrabold text-slate-900 mt-5">{p.name}</p>
                <p className="text-sm font-bold text-slate-700">{p.nameVi}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-4 text-xs font-bold">
                  <span className="text-slate-500">{count > 0 ? `${count} câu mẫu` : 'Sắp có'}</span>
                  <span className="flex items-center gap-1 text-violet-600 group-hover:gap-2 transition-all">
                    Luyện <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </Stagger>
      </section>

      <section className="bg-violet-500 text-white border-y-2 border-slate-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Reveal>
            <SectionTitle dark align="left" eyebrow="VSTEP" title="4 kỹ năng theo format Bộ GD&ĐT" />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VSTEP_PARTS_INFO.map((p) => {
              const Icon = SKILL_ICON[p.skill];
              const auto = p.skill === 'Listening' || p.skill === 'Reading';
              return (
                <Link key={p.id} to={gate(p.skill === 'Writing' ? '/app/writing' : p.skill === 'Speaking' ? '/app/speaking' : `/app/practice/session/${p.id}`, '/auth/register')} className="bg-white text-slate-900 rounded-3xl border-2 border-slate-900 shadow-hard p-5 card-hard-hover block">
                  <div className="flex items-start justify-between">
                    <span className="w-11 h-11 rounded-xl bg-violet-100 border-2 border-slate-900 text-violet-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <Badge tone={auto ? 'emerald' : 'amber'} size="xs">
                      {auto ? 'Chấm tự động' : 'Giáo viên chấm'}
                    </Badge>
                  </div>
                  <p className="font-display text-2xl font-extrabold mt-5">{p.nameVi}</p>
                  <p className="text-xs text-slate-600 mt-2">{p.description}</p>
                  <p className="text-xs font-bold text-slate-500 mt-4">{p.minutes} phút trong đề thật</p>
                </Link>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <Card hard tone="ink" padding="lg" className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-amber-300 text-slate-900 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-display text-2xl font-extrabold">Luyện tập cần tài khoản</h3>
                <p className="text-slate-300 mt-1">Để sổ tay lỗi sai và lịch ôn hoạt động, hệ thống cần lưu bài làm của bạn. Đăng ký mất chưa tới một phút.</p>
              </div>
            </div>
            <Button to={gate('/app/practice', '/auth/register')} size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Tạo tài khoản
            </Button>
          </Card>
        </Reveal>
      </section>
    </div>
  );
};
