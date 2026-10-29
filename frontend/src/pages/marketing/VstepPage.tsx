import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, BookOpen, PenTool, Mic, Lightbulb, FileText, Users, GraduationCap } from 'lucide-react';
import { Badge, Button, Card, GradientPanel, SectionTitle } from '@/shared/components/ui';
import { CountUp, FloatingBlobs, Reveal, Stagger } from '@/shared/components/motion';
import { MOCK_TESTS, VSTEP_PARTS_INFO, SCORE_TABLE } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';

const ICONS: Record<string, React.ElementType> = { Listening: Headphones, Reading: BookOpen, Writing: PenTool, Speaking: Mic };
const TONES: Record<string, string> = { Listening: 'bg-sky-50 text-sky-600', Reading: 'bg-violet-50 text-violet-600', Writing: 'bg-amber-50 text-amber-600', Speaking: 'bg-rose-50 text-rose-600' };

export const VstepPage: React.FC = () => {
  useDocumentTitle('Luyện thi VSTEP');
  const tests = MOCK_TESTS.filter((t) => t.examType === 'VSTEP');
  const levels = SCORE_TABLE.filter((r) => ['B1', 'B2', 'C1'].includes(r.cefr));

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden py-16 md:py-24">
        <FloatingBlobs tone="emerald" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 animate-fade-up">
            <Badge tone="emerald" size="md">
              VSTEP · Khung năng lực 6 bậc Việt Nam
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Đạt chuẩn <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">VSTEP B1 – B2 – C1</span> với 4 kỹ năng
            </h1>
            <p className="text-slate-600 leading-relaxed">Format Bộ GD&ĐT: Nghe – Đọc – Viết – Nói. Bài mẫu Writing theo rubric, khung trả lời Speaking và giáo viên chấm bài chi tiết.</p>
            <div className="flex flex-wrap gap-3">
              <Button to="/auth/register" variant="success" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Bắt đầu lộ trình VSTEP
              </Button>
              <Button to="/mock-tests" variant="outline" size="lg">
                Thi thử ngay
              </Button>
            </div>
          </div>
          <Stagger className="grid grid-cols-2 gap-4" animation="scale-in">
            {[
              { v: 4, s: ' kỹ năng', l: 'Nghe · Đọc · Viết · Nói' },
              { v: 172, s: ' phút', l: 'Tổng thời gian thi' },
              { v: 10, s: ' điểm', l: 'Thang điểm tối đa' },
              { v: 3, s: ' bậc', l: 'B1 · B2 · C1' },
            ].map((x) => (
              <Card key={x.l} padding="sm" className="text-center">
                <GraduationCap className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-slate-900">
                  <CountUp value={x.v} suffix={x.s} />
                </p>
                <p className="text-xs text-slate-500 font-semibold">{x.l}</p>
              </Card>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <Reveal>
          <SectionTitle eyebrow="Cấu trúc đề thi" title="4 kỹ năng của bài thi VSTEP" />
        </Reveal>
        <Stagger className="grid md:grid-cols-2 gap-5" step={110}>
          {VSTEP_PARTS_INFO.map((p) => {
            const Icon = ICONS[p.skill];
            return (
              <Card key={p.id} hover className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${TONES[p.skill]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{p.nameVi}</h3>
                      <p className="text-xs text-slate-500">{p.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge tone="slate" size="xs">
                      {p.questions} {p.skill === 'Writing' || p.skill === 'Speaking' ? 'phần' : 'câu'}
                    </Badge>
                    <Badge tone="amber" size="xs">
                      {p.minutes} phút
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{p.description}</p>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Mẹo làm bài
                  </p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {p.tips.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <Reveal>
          <SectionTitle eyebrow="Thang điểm" title="Bậc VSTEP tương đương" />
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-5">
          {levels.map((r, i) => (
            <Card key={r.cefr} hover className={`space-y-2 border-t-4 ${['border-t-emerald-400', 'border-t-teal-500', 'border-t-cyan-600'][i]}`}>
              <p className="text-3xl font-black text-slate-900">{r.cefr}</p>
              <p className="text-sm font-bold text-emerald-700">{r.vstep}</p>
              <p className="text-xs text-slate-500">
                TOEIC {r.toeic} · IELTS {r.ielts}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{r.description}</p>
            </Card>
          ))}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <Reveal>
          <SectionTitle eyebrow="Thi thử" title="Đề VSTEP mới nhất" align="left" />
        </Reveal>
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tests.map((t) => (
            <Link key={t.id} to="/mock-tests" className="block">
              <Card hover className="h-full space-y-3">
                <div className="flex items-center justify-between">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <Badge tone={t.isFree ? 'emerald' : 'amber'} size="xs">
                    {t.isFree ? 'Miễn phí' : 'VIP'}
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
                <p className="text-xs text-slate-500">{t.parts.join(' · ')}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {formatNumber(t.attempts)} lượt làm
                </p>
              </Card>
            </Link>
          ))}
        </Stagger>
        <Reveal animation="scale-in">
          <GradientPanel tone="emerald" className="text-center">
            <h3 className="text-2xl font-black">Làm bài xếp lớp VSTEP miễn phí</h3>
            <p className="text-emerald-100 mt-2">Xác định bậc hiện tại và nhận lộ trình học 4 kỹ năng phù hợp.</p>
            <Button to="/auth/register" variant="secondary" size="lg" className="mt-6 bg-white text-emerald-700 hover:bg-emerald-50" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Đăng ký miễn phí
            </Button>
          </GradientPanel>
        </Reveal>
      </section>
    </div>
  );
};
