import { ThreeBackground } from '@/shared/components/three/ThreeBackground';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle2, Play, Flame, Target, BookOpen, Users, FileText, AlertTriangle, RotateCcw, Compass, Quote, Headphones } from 'lucide-react';
import { Button, Card, SectionTitle, Avatar, Badge } from '@/shared/components/ui';
import { Reveal, Stagger, CountUp, Doodles, RotatingWords } from '@/shared/components/motion';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';
import { HOME_STATS, TESTIMONIALS, MOCK_TESTS, PRICING_PLANS, MOCK_COURSES } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { formatCurrency, formatNumber, cn } from '@/shared/utils';

const PARTNERS = ['ĐH Đà Nẵng', 'ĐH Duy Tân', 'ĐH Bách Khoa', 'ĐH FPT', 'VNU Hà Nội', 'ĐH Kinh tế', 'ĐH Ngoại ngữ', 'HUTECH', 'ĐH Sư phạm'];

const LOOP = [
  { n: '01', title: 'Thi xếp lớp 15 phút', text: '20 câu rải đều 7 Part. Hệ thống ước lượng trình độ hiện tại, chỉ ra Part nào đang kéo điểm bạn xuống.', photo: PHOTOS.notes, tag: 'Chẩn đoán' },
  { n: '02', title: 'Lộ trình 3 chặng theo ngày thi', text: 'Nền tảng → Chuyên sâu → Thực chiến. Mỗi tuần có mục tiêu cụ thể, tự giãn hoặc nén theo thời gian còn lại.', photo: PHOTOS.desk, tag: 'Cá nhân hoá' },
  { n: '03', title: 'Thi thử như thi thật', text: 'Đề chuẩn ETS 2024–2025 và format Bộ GD&ĐT. Audio phát một lần, không tua, tự nộp khi hết giờ.', photo: PHOTOS.headphones, tag: 'Luyện đề' },
  { n: '04', title: 'Sổ tay lỗi sai tự động', text: 'Câu sai được lưu kèm lời giải và nguyên nhân: ngữ pháp, từ vựng hay bẫy nghe. Không phải ghi chép tay.', photo: PHOTOS.writing, tag: 'Phân tích' },
  { n: '05', title: 'Ôn đúng lúc sắp quên', text: 'Thuật toán SM-2 nhắc lại sau 1, 3, 7, 14, 30 ngày. Mỗi sáng chỉ cần 10 phút ôn phần hệ thống gợi ý.', photo: PHOTOS.studying, tag: 'Ghi nhớ' },
];

/** Đường cong nét đứt nối ảnh bước i với ảnh bước i+1 (chỉ desktop) */
const LoopConnector: React.FC<{ containerRef: React.RefObject<HTMLDivElement>; photoRefs: React.MutableRefObject<(HTMLDivElement | null)[]> }> = ({ containerRef, photoRefs }) => {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [paths, setPaths] = useState<{ d: string; a: [number, number]; b: [number, number] }[]>([]);
  useLayoutEffect(() => {
    const box = containerRef.current;
    if (!box) return;
    // offsetLeft/Top bỏ qua transform (tilt, fade-up) nên vị trí ổn định
    const pos = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = el;
      while (n && n !== box) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };
    const calc = () => {
      setSize({ w: box.offsetWidth, h: box.offsetHeight });
      const els = photoRefs.current.filter(Boolean) as HTMLDivElement[];
      const out: { d: string; a: [number, number]; b: [number, number] }[] = [];
      for (let i = 0; i < els.length - 1; i++) {
        const p = pos(els[i]);
        const q = pos(els[i + 1]);
        const a: [number, number] = [p.x + p.w / 2, p.y + p.h + 14];
        const b: [number, number] = [q.x + q.w / 2, q.y - 14];
        const dy = b[1] - a[1];
        out.push({ d: `M ${a[0]} ${a[1]} C ${a[0]} ${a[1] + dy * 0.75}, ${b[0]} ${b[1] - dy * 0.75}, ${b[0]} ${b[1]}`, a, b });
      }
      setPaths(out);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(box);
    return () => ro.disconnect();
  }, [containerRef, photoRefs]);
  return (
    <svg aria-hidden className="hidden md:block absolute inset-0 pointer-events-none" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}>
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.d} fill="none" stroke="#141A2B" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 12" className="loop-dash" />
          <circle cx={p.a[0]} cy={p.a[1]} r="6" fill="#FA5330" stroke="#141A2B" strokeWidth="2" />
          <circle cx={p.b[0]} cy={p.b[1]} r="6" fill="#FFD24D" stroke="#141A2B" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
};

export const HomePage: React.FC = () => {
  const loopBoxRef = useRef<HTMLDivElement>(null);
  const loopPhotoRefs = useRef<(HTMLDivElement | null)[]>([]);
  useDocumentTitle('Trang chủ');
  const gate = useGate();
  const featured = MOCK_TESTS.filter((t) => t.isFree).slice(0, 3);

  return (
    <div className="overflow-hidden">
      {/* ================= HERO (nền tối, chữ khổng lồ gradient, ảnh người bên phải) ================= */}
      <section className="hero-dark relative bg-slate-950 text-white overflow-hidden pt-[72px]">
        <ThreeBackground variant="particles" dark className="opacity-50" />
        {/* Quầng sáng gradient hồng-cam phía sau chữ và ảnh */}
        <div aria-hidden className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full bg-violet-500/30 blur-[140px] animate-float-slow" />
        <div aria-hidden className="absolute top-1/3 -right-32 w-[560px] h-[560px] rounded-full bg-fuchsia-500/25 blur-[140px] animate-float" />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full bg-amber-400/15 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 pb-0 grid lg:grid-cols-[1.25fr_1fr] gap-8 items-end min-h-[calc(100vh-72px)]">
          <div className="space-y-6 pb-16 md:pb-24">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-bold text-slate-200 animate-fade-down">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" /> Kho đề ETS 2025 đã cập nhật
            </span>

            <h1 className="font-display font-extrabold tracking-tight animate-fade-up">
              <span className="block text-[4.2rem] sm:text-[6rem] lg:text-[8.2rem] leading-[1.15] pt-[0.05em] pb-[0.12em] -mb-[0.1em] hero-gradient-text">
                <RotatingWords words={['BỨT PHÁ', 'CHINH PHỤC', 'LÀM CHỦ']} interval={2800} />
              </span>
              <span className="block mt-3 text-2xl sm:text-3xl lg:text-4xl text-white font-bold">
                <span className="text-amber-300 mr-2">điểm số</span>
                TOEIC &amp; VSTEP của bạn
              </span>
            </h1>

            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base sm:text-lg font-semibold text-slate-300 animate-fade-up delay-100">
              <span>Xếp lớp 15 phút</span>
              <span className="text-violet-400">—</span>
              <span>Lộ trình riêng</span>
              <span className="text-violet-400">—</span>
              <span>Ôn đúng chỗ sai</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
              <Button to={gate('/onboarding/goal', '/try')} size="xl" variant="gradient" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Học thử miễn phí ngay
              </Button>
              <Button to="/mock-tests" size="xl" variant="white" leftIcon={<Play className="w-5 h-5" />} className="!border-white/20 !bg-white/10 !text-white hover:!bg-white hover:!text-slate-900">
                Xem kho đề thi thử
              </Button>
            </div>

            <div className="flex items-center gap-4 animate-fade-up delay-300">
              <div className="flex -space-x-3">
                {[21, 22, 23, 24, 25].map((n) => (
                  <img key={n} src={pravatar(n)} alt="" className="w-10 h-10 rounded-full border-2 border-slate-950 object-cover" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-white ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-slate-400 font-semibold">
                  <b className="text-white">24.800+</b> học viên đang học mỗi ngày
                </p>
              </div>
            </div>
          </div>

          {/* Ảnh người: cắt nền tối, đứng sát mép dưới, kèm thẻ nổi */}
          <div className="relative self-end hidden lg:flex justify-center h-[min(680px,calc(100vh-120px))]">
            {/* Vòng tròn gradient phía sau người (như mẫu) */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none">
              <div className="relative w-[640px] h-[640px] -mb-[120px] flex items-center justify-center">
                <div className="absolute w-[640px] h-[640px] rounded-full border border-white/5" />
                <div className="absolute w-[540px] h-[540px] rounded-full border-2 border-white/10 animate-spin-slow [border-top-color:rgba(255,210,77,0.6)]" />
                <div className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 opacity-90 animate-float-slow" />
              </div>
            </div>
            <img
              src="/images/hero-student.webp"
              alt="Học viên OrbiLingo"
              className="relative h-full w-auto object-contain object-bottom animate-fade-up delay-200 [filter:drop-shadow(0_20px_40px_rgba(0,0,0,0.45))_drop-shadow(0_0_24px_rgba(250,83,48,0.25))]"
            />
            <div className="absolute -left-12 -top-6 bg-white text-slate-900 rounded-2xl px-4 py-3 shadow-card animate-fade-up delay-500 tilt-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Sau 8 tuần</p>
              <p className="font-display text-2xl font-extrabold text-emerald-600">+145 điểm</p>
            </div>
            <div className="absolute -right-10 top-10 bg-amber-300 text-slate-900 rounded-2xl px-4 py-3 shadow-card animate-fade-up delay-700 tilt-2 flex items-center gap-2">
              <Flame className="w-6 h-6 text-violet-600 fill-violet-500" />
              <div>
                <p className="font-display text-xl font-extrabold leading-none">61 ngày</p>
                <p className="text-[10px] font-bold text-slate-700">streak của Long</p>
              </div>
            </div>
            <div className="absolute -left-8 bottom-8 bg-indigo-600 text-white rounded-2xl px-4 py-3 shadow-card animate-fade-up delay-700 tilt-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-100">Part 5 hôm nay</p>
              <p className="font-display text-2xl font-extrabold">28/30</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <section className="border-y-2 border-slate-900 bg-slate-900 text-white py-5 space-y-3">
        <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Học viên đến từ</p>
        <div className="marquee">
          <div className="marquee-track whitespace-nowrap">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <span key={i} className="mx-3 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 font-display font-bold text-sm md:text-base text-slate-100 transition-colors hover:bg-amber-300 hover:text-slate-900 hover:border-amber-300">
                <span className="w-7 h-7 rounded-lg bg-amber-300 text-slate-900 flex items-center justify-center text-[11px] font-black">{p.replace('ĐH ', '').slice(0, 2).toUpperCase()}</span>
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="marquee">
          <div className="marquee-track reverse whitespace-nowrap">
            {[...['TOEIC 450 → 990', 'VSTEP B1 · B2 · C1', 'Đề ETS 2024–2025', 'Audio phát một lần', 'Sổ tay lỗi sai', 'Ôn tập SM-2', 'Giáo viên chấm bài', 'Lớp học có mã mời'], ...['TOEIC 450 → 990', 'VSTEP B1 · B2 · C1', 'Đề ETS 2024–2025', 'Audio phát một lần', 'Sổ tay lỗi sai', 'Ôn tập SM-2', 'Giáo viên chấm bài', 'Lớp học có mã mời']].map((t, i) => (
              <span key={i} className="mx-6 inline-flex items-center gap-4 text-xs md:text-sm font-semibold text-slate-400">
                {t}
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {HOME_STATS.map((s, i) => (
            <div key={s.label} className={cn('rounded-2xl border-2 border-slate-900 p-5 md:p-6', ['bg-white', 'bg-amber-200', 'bg-indigo-100', 'bg-violet-100'][i])}>
              <p className="font-display text-3xl md:text-4xl font-extrabold text-slate-900">
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm font-semibold text-slate-600 mt-1">{s.label}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ================= 5-STEP LOOP (zigzag) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        <Reveal>
          <SectionTitle eyebrow="Cách OrbiLingo hoạt động" title={<>Không làm đề vô định. <span className="mark-teal mark">Làm đúng</span> việc cần làm.</>} description="Năm bước lặp lại mỗi tuần. Dữ liệu từ bài làm của bạn quyết định bước tiếp theo." />
        </Reveal>
        <div ref={loopBoxRef} className="relative space-y-14 md:space-y-28">
          <LoopConnector containerRef={loopBoxRef} photoRefs={loopPhotoRefs} />
          {LOOP.map((step, i) => (
            <Reveal key={step.n} className={cn('grid md:grid-cols-2 gap-8 md:gap-16 items-center', i % 2 === 1 && 'md:[&>*:first-child]:order-2')}>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-display text-6xl md:text-7xl font-extrabold text-slate-200 leading-none">{step.n}</span>
                  <span className="sticker !bg-indigo-100 tilt-2">{step.tag}</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{step.text}</p>
              </div>
              <div ref={(el) => (loopPhotoRefs.current[i] = el)} className={cn('photo-frame relative z-10 md:w-[82%]', i % 2 === 0 ? 'tilt-2 md:ml-auto' : 'tilt-1')}>
                <Img src={step.photo} alt={step.title} ratio="4/3" fallbackClass={['bg-amber-200', 'bg-indigo-200', 'bg-violet-200', 'bg-sky-200', 'bg-emerald-200'][i]} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= BENTO FEATURES ================= */}
      <section className="bg-slate-900 text-white py-16 md:py-24 relative">
        <div aria-hidden className="absolute inset-0 bg-dots opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <Reveal>
            <SectionTitle dark eyebrow="Tính năng" title="Mọi thứ cho một kỳ thi, trong một chỗ." description="Từ đề thi tới lớp học với giáo viên. Không cần cài thêm ứng dụng nào." />
          </Reveal>
          <div className="grid md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-5">
            <Reveal className="md:col-span-2 md:row-span-2">
              <Link to="/mock-tests" className="block h-full rounded-3xl bg-indigo-600 border-2 border-slate-900 shadow-hard p-7 md:p-9 group hover:-translate-y-1 transition">
                <div className="flex items-start justify-between">
                  <FileText className="w-10 h-10" />
                  <Badge tone="amber" solid>
                    180+ đề
                  </Badge>
                </div>
                <h3 className="font-display text-3xl font-extrabold mt-10">Phòng thi thử chuẩn ETS & Bộ GD&ĐT</h3>
                <p className="text-indigo-100 mt-3 max-w-md leading-relaxed">Đồng hồ đếm ngược, audio phát một lần, bảng câu hỏi và cờ đánh dấu. Nộp xong có ngay điểm quy đổi và danh sách câu sai.</p>
                <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
                  {featured.map((t) => (
                    <div key={t.id} className="rounded-xl bg-white/10 border border-white/20 p-3">
                      <p className="text-[10px] font-extrabold uppercase text-indigo-100">{t.examType}</p>
                      <p className="text-xs font-bold truncate">{t.title}</p>
                      <p className="text-[10px] text-indigo-200 mt-1">{formatNumber(t.attempts)} lượt làm</p>
                    </div>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 mt-8 font-bold group-hover:gap-3 transition-all">
                  Vào phòng thi <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <Link to={gate('/app/mistakes', '/auth/register')} className="block h-full rounded-3xl bg-amber-300 text-slate-900 border-2 border-slate-900 shadow-hard p-6 hover:-translate-y-1 transition">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="font-display text-xl font-extrabold mt-6">Sổ tay lỗi sai</h3>
                <p className="text-sm text-slate-700 mt-2">Tự lưu câu sai kèm nguyên nhân. Luyện lại đúng 10 câu bạn hay sai nhất.</p>
              </Link>
            </Reveal>
            <Reveal delay={200}>
              <Link to={gate('/app/review', '/auth/register')} className="block h-full rounded-3xl bg-violet-500 text-white border-2 border-slate-900 shadow-hard p-6 hover:-translate-y-1 transition">
                <RotateCcw className="w-8 h-8" />
                <h3 className="font-display text-xl font-extrabold mt-6">Flashcard SM-2</h3>
                <p className="text-sm text-violet-100 mt-2">600 từ Business theo chủ đề, lật thẻ, chấm 4 mức nhớ. Nhắc ôn đúng ngày.</p>
              </Link>
            </Reveal>
            <Reveal delay={150} className="md:col-span-1">
              <div className="h-full rounded-3xl overflow-hidden border-2 border-slate-900 shadow-hard relative min-h-[220px]">
                <Img src={PHOTOS.classroom} alt="Lớp học với giáo viên" wrapperClass="absolute inset-0" fallbackClass="bg-sky-300" />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-slate-900/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Users className="w-4 h-4" />
                    <p className="font-display font-bold">Lớp học với giáo viên</p>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">Mã mời 8 ký tự, bài tập có hạn nộp, chấm Writing/Speaking theo rubric.</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={250} className="md:col-span-2">
              <div className="h-full rounded-3xl bg-white text-slate-900 border-2 border-slate-900 shadow-hard p-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Compass className="w-6 h-6 text-indigo-600" />
                    <h3 className="font-display text-xl font-extrabold">Lộ trình 3 chặng</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">Nhập ngày thi và số phút mỗi ngày. Lộ trình tự chia tuần, mở khoá dần theo tiến độ thật của bạn.</p>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {['Nền tảng · 4 tuần', 'Chuyên sâu · 5 tuần', 'Thực chiến · 3 tuần'].map((s, i) => (
                      <span key={s} className={cn('px-3 py-1 rounded-lg border-2 border-slate-900 text-xs font-bold', ['bg-emerald-200', 'bg-amber-200', 'bg-violet-200'][i])}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="w-full sm:w-40 photo-frame tilt-2 shrink-0">
                  <Img src={PHOTOS.laptop} alt="" ratio="square" fallbackClass="bg-indigo-200" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= TOEIC vs VSTEP ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
        <Reveal>
          <SectionTitle eyebrow="Hai kỳ thi, một nền tảng" title={<>Bạn thi <span className="mark">TOEIC</span> hay <span className="mark mark-coral">VSTEP</span>?</>} description="Chọn kỳ thi khi bắt đầu, có thể đổi bất kỳ lúc nào. Mọi tiến độ được giữ nguyên." />
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <Card hard tone="teal" padding="lg" className="h-full relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full border-[16px] border-white/15" />
              <Badge tone="amber" solid>
                Listening & Reading
              </Badge>
              <h3 className="font-display text-4xl font-extrabold mt-4">TOEIC 450 → 990</h3>
              <p className="text-indigo-100 mt-3 leading-relaxed">200 câu, 120 phút, 7 Part. Thường dùng cho tốt nghiệp đại học và xin việc khối doanh nghiệp.</p>
              <ul className="mt-6 space-y-2 text-sm">
                {['Luyện từng Part với giải thích tức thì', 'Full test ETS 2023–2025', 'Từ vựng 20 chủ đề Business'].map((l) => (
                  <li key={l} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-300" /> {l}
                  </li>
                ))}
              </ul>
              <Button to="/toeic" variant="white" className="mt-8" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Lộ trình TOEIC
              </Button>
            </Card>
          </Reveal>
          <Reveal delay={120}>
            <Card hard tone="coral" padding="lg" className="h-full relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10" />
              <Badge tone="amber" solid>
                4 kỹ năng
              </Badge>
              <h3 className="font-display text-4xl font-extrabold mt-4">VSTEP B1 → C1</h3>
              <p className="text-violet-100 mt-3 leading-relaxed">Nghe – Đọc – Viết – Nói theo format Bộ GD&ĐT. Chuẩn đầu ra đại học, sau đại học và giáo viên.</p>
              <ul className="mt-6 space-y-2 text-sm">
                {['Đề mẫu ĐHQG, ĐH Đà Nẵng', 'Writing Task 1/2 có đếm từ và rubric', 'Speaking Part 1–3 ghi âm, giáo viên chấm'].map((l) => (
                  <li key={l} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-300" /> {l}
                  </li>
                ))}
              </ul>
              <Button to="/vstep" variant="white" className="mt-8" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Lộ trình VSTEP
              </Button>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ================= COURSES STRIP ================= */}
      <section className="bg-amber-100 border-y-2 border-slate-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <SectionTitle align="left" eyebrow="Khoá học" title="Giáo viên thật, video có transcript." description="Nhấn vào từ trong transcript để tra nghĩa. Mỗi bài có quiz củng cố." />
            <Button to="/courses" variant="ink" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Tất cả khoá học
            </Button>
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_COURSES.slice(0, 3).map((c, i) => (
              <Link key={c.id} to={`/courses/${c.id}`} className={cn('block bg-white rounded-3xl border-2 border-slate-900 shadow-hard overflow-hidden card-hard-hover', i === 1 && 'lg:-translate-y-3')}>
                <Img src={c.coverUrl} alt={c.title} ratio="video" fallbackClass="bg-indigo-200" />
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <Badge tone={c.examType === 'TOEIC' ? 'indigo' : 'violet'}>{c.examType}</Badge>
                    <Badge tone={c.isFree ? 'emerald' : 'amber'}>{c.isFree ? 'Miễn phí' : 'VIP'}</Badge>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mt-3 leading-snug">{c.title}</h3>
                  <div className="flex items-center justify-between mt-4 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-2">
                      <Avatar name={c.teacherName} src={pravatar(40 + i)} size="xs" /> {c.teacherName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> {c.rating} · {c.lessonsCount} bài
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
        <Reveal>
          <SectionTitle eyebrow="Học viên nói gì" title={<>Điểm số thật, người thật.</>} description="Ba trong số hàng nghìn học viên đã tăng điểm trong năm nay." />
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Card key={t.name} hard padding="lg" className={cn('relative', ['tilt-3', '', 'tilt-2'][i])}>
              <Quote className="w-8 h-8 text-violet-400 absolute top-5 right-5" />
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mt-4">"{t.quote}"</p>
              <div className="flex items-center justify-between mt-6 pt-5 border-t-2 border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} src={t.avatar} size="md" ring />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
                <span className="sticker !bg-emerald-200 !text-emerald-900 tilt-2">{t.score}</span>
              </div>
            </Card>
          ))}
        </Stagger>
      </section>

      {/* ================= PRICING SHORT ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <Reveal>
          <Card hard tone="cream" padding="lg" className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <span className="sticker tilt-1 !bg-amber-300">Bảng giá</span>
              <h3 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 mt-4">Bắt đầu miễn phí. Nâng cấp khi cần đề mới nhất.</h3>
              <p className="text-slate-600 mt-3 max-w-xl">Gói Free đủ để thi xếp lớp, luyện Part và dùng sổ tay lỗi sai. Gói VIP mở kho đề 2025 và không giới hạn flashcard.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PRICING_PLANS.map((p) => (
                <Link key={p.id} to="/pricing" className={cn('rounded-2xl border-2 border-slate-900 p-4 text-center hover:-translate-y-1 transition', p.highlight ? 'bg-violet-500 text-white shadow-hard' : 'bg-white')}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">{p.name}</p>
                  <p className="font-display text-lg font-extrabold mt-1">{p.price === 0 ? '0đ' : formatCurrency(p.price).replace(/\s/g, '')}</p>
                  <p className={cn('text-[10px] mt-0.5', p.highlight ? 'text-violet-100' : 'text-slate-500')}>{p.period}</p>
                </Link>
              ))}
            </div>
          </Card>
        </Reveal>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <ThreeBackground variant="globe" dark className="opacity-70" offsetX={0.6} />
        <Doodles tone="light" className="opacity-80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid lg:grid-cols-[1fr_380px] gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight text-balance">
              Kỳ thi tiếp theo của bạn là <span className="mark mark-full">khi nào</span>?
            </h2>
            <p className="text-slate-300 text-lg max-w-xl">Nhập ngày thi, làm bài xếp lớp 15 phút. Bạn sẽ có lộ trình tới ngày đó ngay hôm nay.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button to="/auth/register" size="xl" variant="gradient" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Tạo tài khoản miễn phí
              </Button>
              <Button to="/score-converter" size="xl" variant="white" leftIcon={<Target className="w-5 h-5" />}>
                Quy đổi điểm mục tiêu
              </Button>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Không cần thẻ
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Huỷ bất kỳ lúc nào
              </span>
              <span className="flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" /> Hỗ trợ 8:00–22:00 mỗi ngày
              </span>
            </p>
          </div>
          <div className="photo-frame tilt-1 hidden lg:block">
            <Img src={PHOTOS.graduation} alt="Tốt nghiệp" ratio="4/3" fallbackClass="bg-violet-300" />
          </div>
        </div>
      </section>
      <span className="hidden">
        <BookOpen />
      </span>
    </div>
  );
};
