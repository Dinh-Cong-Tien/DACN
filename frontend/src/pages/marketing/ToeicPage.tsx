import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, BookOpen, Clock, ListChecks, Lightbulb, FileText, Users } from 'lucide-react';
import { Accordion, Badge, Button, Card, GradientPanel, SectionTitle } from '@/shared/components/ui';
import { CountUp, FloatingBlobs, Reveal, Stagger } from '@/shared/components/motion';
import { MOCK_TESTS, TOEIC_PARTS_INFO, SCORE_TABLE } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';

export const ToeicPage: React.FC = () => {
  useDocumentTitle('Luyện thi TOEIC');
  const tests = MOCK_TESTS.filter((t) => t.examType === 'TOEIC').slice(0, 4);
  const listening = TOEIC_PARTS_INFO.filter((p) => p.skill === 'Listening');
  const reading = TOEIC_PARTS_INFO.filter((p) => p.skill === 'Reading');

  const partItems = (parts: typeof TOEIC_PARTS_INFO) =>
    parts.map((p) => ({
      id: p.id,
      icon: p.skill === 'Listening' ? <Headphones /> : <BookOpen />,
      title: (
        <span className="flex items-center gap-2 flex-wrap">
          {p.name} · {p.nameVi}
          <Badge tone="slate" size="xs">
            {p.questions} câu
          </Badge>
          {p.minutes && (
            <Badge tone="amber" size="xs">
              ~{p.minutes} phút
            </Badge>
          )}
        </span>
      ),
      content: (
        <div className="space-y-3">
          <p>{p.description}</p>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Mẹo làm bài
            </p>
            <ul className="space-y-1 text-xs text-amber-900">
              {p.tips.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    }));

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden py-16 md:py-24">
        <FloatingBlobs />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 animate-fade-up">
            <Badge tone="indigo" size="md">
              TOEIC Listening & Reading
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Chinh phục <span className="text-gradient">TOEIC 450 → 990</span> theo đúng chuẩn ETS
            </h1>
            <p className="text-slate-600 leading-relaxed">200 câu hỏi, 120 phút, 7 Part. Hiểu rõ cấu trúc từng Part, nhận diện bẫy và luyện với đề thi thử có bộ đếm giờ thật.</p>
            <div className="flex flex-wrap gap-3">
              <Button to="/auth/register" variant="gradient" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Bắt đầu lộ trình TOEIC
              </Button>
              <Button to="/mock-tests" variant="outline" size="lg">
                Thi thử ngay
              </Button>
            </div>
          </div>
          <Stagger className="grid grid-cols-2 gap-4" animation="scale-in">
            {[
              { icon: ListChecks, v: 200, s: ' câu', l: 'Tổng số câu' },
              { icon: Clock, v: 120, s: ' phút', l: 'Thời gian' },
              { icon: Headphones, v: 100, s: ' câu', l: 'Listening (45\')' },
              { icon: BookOpen, v: 100, s: ' câu', l: 'Reading (75\')' },
            ].map((x) => {
              const Icon = x.icon;
              return (
                <Card key={x.l} padding="sm" className="text-center">
                  <Icon className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-2xl font-black text-slate-900">
                    <CountUp value={x.v} suffix={x.s} />
                  </p>
                  <p className="text-xs text-slate-500 font-semibold">{x.l}</p>
                </Card>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <Reveal>
          <SectionTitle eyebrow="Cấu trúc đề thi" title="7 Part của bài thi TOEIC" description="Nhấn vào từng Part để xem mô tả và mẹo làm bài." />
        </Reveal>
        <div className="grid lg:grid-cols-2 gap-8">
          <Reveal animation="slide-in-left">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
              <Headphones className="w-5 h-5 text-indigo-600" /> Listening — Part 1–4 (45 phút)
            </h3>
            <Accordion items={partItems(listening)} defaultOpen="PART_1" />
          </Reveal>
          <Reveal animation="slide-in-right">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-violet-600" /> Reading — Part 5–7 (75 phút)
            </h3>
            <Accordion items={partItems(reading)} defaultOpen="PART_5" />
          </Reveal>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <Reveal>
          <SectionTitle eyebrow="Thang điểm" title="Điểm TOEIC tương ứng trình độ nào?" />
        </Reveal>
        <Reveal>
          <Card padding="none" className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                <tr>
                  <th className="text-left px-5 py-3">CEFR</th>
                  <th className="text-left px-5 py-3">TOEIC</th>
                  <th className="text-left px-5 py-3">VSTEP</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_TABLE.map((r) => (
                  <tr key={r.cefr} className="border-t border-slate-100 hover:bg-indigo-50/40 transition">
                    <td className="px-5 py-3 font-black text-indigo-700">{r.cefr}</td>
                    <td className="px-5 py-3 font-bold text-slate-900">{r.toeic}</td>
                    <td className="px-5 py-3 text-slate-600">{r.vstep}</td>
                    <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Reveal>
        <div className="text-center">
          <Button to="/score-converter" variant="soft" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Mở công cụ quy đổi điểm
          </Button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <Reveal>
          <SectionTitle eyebrow="Thi thử" title="Đề TOEIC nổi bật" align="left" />
        </Reveal>
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tests.map((t) => (
            <Link key={t.id} to="/mock-tests" className="block">
              <Card hover className="h-full space-y-3">
                <div className="flex items-center justify-between">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <Badge tone={t.isFree ? 'emerald' : 'amber'} size="xs">
                    {t.isFree ? 'Miễn phí' : 'VIP'}
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
                <p className="text-xs text-slate-500">
                  {t.totalQuestions} câu · {t.durationMinutes} phút · {t.level}
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {formatNumber(t.attempts)} lượt làm
                </p>
              </Card>
            </Link>
          ))}
        </Stagger>
        <Reveal animation="scale-in">
          <GradientPanel tone="indigo" className="text-center">
            <h3 className="text-2xl font-black">Bắt đầu với bài đánh giá năng lực 15 phút</h3>
            <p className="text-indigo-100 mt-2">Nhận lộ trình TOEIC cá nhân hoá ngay sau khi hoàn thành.</p>
            <Button to="/auth/register" variant="secondary" size="lg" className="mt-6 bg-white text-indigo-700 hover:bg-indigo-50" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Đăng ký miễn phí
            </Button>
          </GradientPanel>
        </Reveal>
      </section>
    </div>
  );
};
