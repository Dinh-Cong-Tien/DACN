import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, PenTool, Mic, ArrowRight, Lock } from 'lucide-react';
import { Badge, Card, GradientPanel, SectionTitle, Button } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { TOEIC_PARTS_INFO, VSTEP_PARTS_INFO } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';

const ICONS: Record<string, React.ElementType> = { Listening: Headphones, Reading: BookOpen, Writing: PenTool, Speaking: Mic };
const TONES: Record<string, string> = { Listening: 'bg-sky-50 text-sky-600', Reading: 'bg-violet-50 text-violet-600', Writing: 'bg-amber-50 text-amber-600', Speaking: 'bg-rose-50 text-rose-600' };

export const PracticePage: React.FC = () => {
  useDocumentTitle('Luyện tập');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-14">
      <Reveal>
        <SectionTitle eyebrow="Luyện tập theo kỹ năng" title="Luyện từng Part, xem giải thích ngay" description="Mỗi câu trả lời được phản hồi tức thì kèm lời giải. Câu sai tự động lưu vào Sổ tay lỗi sai của bạn." />
      </Reveal>

      <section className="space-y-6">
        <Reveal>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Badge tone="indigo" solid>
              TOEIC
            </Badge>
            7 Part Listening & Reading
          </h2>
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" step={70}>
          {TOEIC_PARTS_INFO.map((p) => {
            const Icon = ICONS[p.skill];
            return (
              <Link key={p.id} to="/auth/register" className="block group">
                <Card hover className="h-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TONES[p.skill]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge tone="slate" size="xs">
                      {p.questions} câu
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{p.name}</p>
                    <h3 className="font-bold text-slate-900">{p.nameVi}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{p.description}</p>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Đăng nhập để luyện <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </Stagger>
      </section>

      <section className="space-y-6">
        <Reveal>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Badge tone="emerald" solid>
              VSTEP
            </Badge>
            4 kỹ năng
          </h2>
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" step={90}>
          {VSTEP_PARTS_INFO.map((p) => {
            const Icon = ICONS[p.skill];
            return (
              <Link key={p.id} to="/auth/register" className="block group">
                <Card hover className="h-full space-y-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TONES[p.skill]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">{p.nameVi}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{p.description}</p>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    Luyện ngay <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </Stagger>
      </section>

      <Reveal animation="scale-in">
        <GradientPanel tone="indigo" className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black">Luyện tập không giới hạn với tài khoản miễn phí</h3>
            <p className="text-indigo-100 mt-1 text-sm">Phản hồi tức thì, giải thích chi tiết, sổ tay lỗi sai và lịch ôn tự động.</p>
          </div>
          <Button to="/auth/register" variant="secondary" size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 shrink-0" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Tạo tài khoản
          </Button>
        </GradientPanel>
      </Reveal>
    </div>
  );
};
