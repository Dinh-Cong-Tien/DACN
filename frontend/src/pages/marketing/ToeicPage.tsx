import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Headphones, BookOpen, Lightbulb, CheckCircle2, Star } from 'lucide-react';
import { Button, Card, SectionTitle, Badge, Chip } from '@/shared/components/ui';
import { Reveal, Stagger, CountUp, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { TOEIC_PARTS_INFO, MOCK_TESTS, SCORE_TABLE } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';

export const ToeicPage: React.FC = () => {
  useDocumentTitle('Luyện thi TOEIC');
  const gate = useGate();
  const [active, setActive] = useState(TOEIC_PARTS_INFO[0].id);
  const part = TOEIC_PARTS_INFO.find((p) => p.id === active)!;
  const tests = MOCK_TESTS.filter((t) => t.examType === 'TOEIC').slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-indigo-600 text-white overflow-hidden border-b-2 border-slate-900">
        <Doodles tone="light" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="space-y-6">
            <span className="sticker tilt-1 !bg-amber-300">TOEIC Listening & Reading</span>
            <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.02]">
              200 câu. 120 phút. <br />
              Biết rõ mình mất điểm ở <span className="mark mark-full">Part nào</span>.
            </h1>
            <p className="text-indigo-100 text-lg max-w-xl leading-relaxed">Luyện từng Part với giải thích ngay sau mỗi câu, rồi thi thử full test chuẩn ETS. Điểm quy đổi 10–990 có ngay sau khi nộp.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button to="/auth/register" size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Thi xếp lớp TOEIC
              </Button>
              <Button to="/mock-tests" size="lg" variant="white">
                Kho đề TOEIC
              </Button>
            </div>
            <div className="flex gap-8 pt-2">
              {[
                ['7', 'Part'],
                ['42', 'đề full test'],
                ['12.6k', 'câu hỏi'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-3xl font-extrabold">{v}</p>
                  <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="photo-frame tilt-2">
              <Img src={PHOTOS.headphones} alt="Luyện nghe TOEIC" ratio="4/3" fallbackClass="bg-indigo-400" />
            </div>
            <div className="absolute -bottom-5 -left-4 bg-white text-slate-900 rounded-2xl border-2 border-slate-900 shadow-hard px-4 py-3 tilt-1 hidden sm:block">
              <p className="text-[10px] font-extrabold uppercase text-slate-500">Điểm trung bình học viên</p>
              <p className="font-display text-2xl font-extrabold">
                <CountUp value={715} /> <span className="text-sm text-emerald-600">+145</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Parts explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-10">
        <Reveal>
          <SectionTitle align="left" eyebrow="Cấu trúc đề" title={<>Bảy Part, bảy chiến thuật <span className="mark">khác nhau</span>.</>} description="Chọn một Part để xem số câu, thời gian khuyến nghị và mẹo làm bài từ giáo viên OrbiLingo." />
        </Reveal>
        <div className="flex gap-2 flex-wrap">
          {TOEIC_PARTS_INFO.map((p) => (
            <Chip key={p.id} active={p.id === active} onClick={() => setActive(p.id)} tone={p.skill === 'Listening' ? 'indigo' : 'violet'}>
              {p.name} · {p.nameVi}
            </Chip>
          ))}
        </div>
        <div key={part.id} className="grid lg:grid-cols-[1fr_360px] gap-6 animate-fade-up">
          <Card hard padding="lg" className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn('w-14 h-14 rounded-2xl border-2 border-slate-900 flex items-center justify-center', part.skill === 'Listening' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700')}>
                {part.skill === 'Listening' ? <Headphones className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
              </span>
              <div>
                <h3 className="font-display text-2xl font-extrabold text-slate-900">
                  {part.name} — {part.nameVi}
                </h3>
                <div className="flex gap-2 mt-1">
                  <Badge tone={part.skill === 'Listening' ? 'indigo' : 'violet'}>{part.skill}</Badge>
                  <Badge tone="slate">{part.questions} câu</Badge>
                  {part.minutes && (
                    <Badge tone="amber" icon={<Clock className="w-3 h-3" />}>
                      ~{part.minutes} phút
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-slate-700 text-lg leading-relaxed">{part.description}</p>
            <div className="rounded-2xl bg-amber-100 border-2 border-slate-900 p-5">
              <p className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-600" /> Mẹo từ giáo viên
              </p>
              <ol className="space-y-2">
                {part.tips.map((t, i) => (
                  <li key={t} className="flex gap-3 text-sm text-slate-800">
                    <span className="font-display font-extrabold text-violet-600">{i + 1}.</span> {t}
                  </li>
                ))}
              </ol>
            </div>
            <Button to="/auth/register" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Luyện {part.name} ngay
            </Button>
          </Card>
          <div className="space-y-4">
            <div className="photo-frame tilt-1">
              <Img src={part.skill === 'Listening' ? PHOTOS.headphones : PHOTOS.notes} alt="" ratio="4/3" fallbackClass="bg-amber-200" />
            </div>
            <Card hard tone="ink" padding="md">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">Phân bổ thời gian Reading</p>
              <ul className="mt-3 space-y-2 text-sm">
                {TOEIC_PARTS_INFO.filter((p) => p.minutes).map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="text-slate-300">{p.name}</span>
                    <span className="font-bold">{p.minutes} phút</span>
                  </li>
                ))}
                <li className="flex items-center justify-between border-t border-white/10 pt-2 font-bold">
                  <span>Tổng Reading</span>
                  <span className="text-amber-300">75 phút</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Score table */}
      <section className="bg-amber-100 border-y-2 border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[380px_1fr] gap-10 items-start">
          <Reveal className="space-y-4">
            <SectionTitle align="left" eyebrow="Thang điểm" title="TOEIC của bạn tương đương bậc mấy?" description="Bảng quy đổi theo CEFR và Khung năng lực 6 bậc Việt Nam." />
            <Button to="/score-converter" variant="ink" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Mở công cụ quy đổi
            </Button>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-3xl border-2 border-slate-900 bg-white shadow-hard overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    {['CEFR', 'TOEIC', 'VSTEP', 'IELTS', 'Ý nghĩa'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCORE_TABLE.map((r, i) => (
                    <tr key={r.cefr} className={cn('border-t-2 border-slate-100', i % 2 ? 'bg-slate-50' : '')}>
                      <td className="px-4 py-3 font-display font-extrabold text-slate-900">{r.cefr}</td>
                      <td className="px-4 py-3 font-bold text-indigo-700">{r.toeic}</td>
                      <td className="px-4 py-3 text-slate-700">{r.vstep}</td>
                      <td className="px-4 py-3 text-slate-700">{r.ielts}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{r.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tests */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-10">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <SectionTitle align="left" eyebrow="Đề thi thử" title="Đề TOEIC được làm nhiều nhất tuần này" />
          <Button to="/mock-tests" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Xem tất cả
          </Button>
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tests.map((t) => (
            <Link key={t.id} to={gate(`/app/mock-tests/${t.id}`)} className="block bg-white rounded-3xl border-2 border-slate-900 shadow-hard overflow-hidden card-hard-hover">
              <Img src={t.coverUrl} alt="" ratio="video" fallbackClass="bg-indigo-200" />
              <div className="p-4 space-y-2">
                <div className="flex gap-1.5 flex-wrap">
                  {t.tags?.map((tag) => (
                    <Badge key={tag} tone={tag === 'VIP' ? 'amber' : tag === 'Mới' ? 'violet' : 'slate'} size="xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-display font-bold text-slate-900 leading-snug">{t.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  {t.totalQuestions} câu · {t.durationMinutes} phút · {formatNumber(t.attempts)} lượt
                </p>
              </div>
            </Link>
          ))}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Reveal>
          <Card hard tone="teal" padding="lg" className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-3xl font-extrabold">Sẵn sàng biết điểm hiện tại?</h3>
              <p className="text-indigo-100 mt-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-300 fill-current" /> 15 phút · 20 câu · miễn phí · không cần thẻ
              </p>
            </div>
            <Button to="/auth/register" size="xl" variant="white" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Làm bài xếp lớp
            </Button>
          </Card>
        </Reveal>
      </section>
      <span className="hidden">
        <CheckCircle2 />
      </span>
    </div>
  );
};
