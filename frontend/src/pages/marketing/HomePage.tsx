import { ThreeBackground } from '@/shared/components/three/ThreeBackground';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle2, Play, Flame, Target, BookOpen, Users, FileText, AlertTriangle, RotateCcw, Compass, Quote, Headphones } from 'lucide-react';
import { Button, Card, SectionTitle, Avatar, Badge } from '@/shared/components/ui';
import { Reveal, Stagger, CountUp, Doodles, TypeLoop } from '@/shared/components/motion';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';
import { HOME_STATS, HOME_EXAM_TRACKS, TESTIMONIALS, PRICING_PLANS, MOCK_COURSES } from '@/shared/mocks';
import { useDocumentTitle, useGate, useInView } from '@/shared/hooks';
import { formatCurrency, cn } from '@/shared/utils';
import { LoopConnector } from './home/LoopConnector';
import { ExamTrackCard } from './home/ExamTrackCard';

/** Trường của học viên (logo chính thức lấy từ Wikimedia, lưu tại public/images/universities) */
const PARTNERS: { name: string; logo: string }[] = [
  { name: 'ĐH Đà Nẵng', logo: 'udn' },
  { name: 'ĐH Duy Tân', logo: 'dtu' },
  { name: 'ĐH Bách khoa Hà Nội', logo: 'hust' },
  { name: 'ĐH FPT', logo: 'fpt' },
  { name: 'ĐHQG Hà Nội', logo: 'vnu' },
  { name: 'ĐH Kinh tế Quốc dân', logo: 'neu' },
  { name: 'ĐH Ngoại ngữ – ĐHQGHN', logo: 'ulis' },
  { name: 'HUTECH', logo: 'hutech' },
  { name: 'ĐH Sư phạm Hà Nội', logo: 'hnue' },
];

const MARQUEE_POINTS = ['TOEIC 450 → 990', 'VSTEP B1 · B2 · C1', 'Đề ETS 2024–2025', 'Audio phát một lần', 'Sổ tay lỗi sai', 'Ôn tập SM-2', 'Giáo viên chấm bài', 'Lớp học có mã mời'];

const HERO_WORDS = ['BỨT PHÁ', 'CHINH PHỤC', 'LÀM CHỦ'];

const LOOP = [
  { n: '01', title: 'Thi xếp lớp 15 phút', text: '20 câu rải đều 7 Part. Hệ thống ước lượng trình độ hiện tại, chỉ ra Part nào đang kéo điểm bạn xuống.', photo: PHOTOS.notes, tag: 'Chẩn đoán' },
  { n: '02', title: 'Lộ trình 3 chặng theo ngày thi', text: 'Nền tảng → Chuyên sâu → Thực chiến. Mỗi tuần có mục tiêu cụ thể, tự giãn hoặc nén theo thời gian còn lại.', photo: PHOTOS.desk, tag: 'Cá nhân hoá' },
  { n: '03', title: 'Thi thử như thi thật', text: 'Đề chuẩn ETS 2024–2025 và format Bộ GD&ĐT. Audio phát một lần, không tua, tự nộp khi hết giờ.', photo: PHOTOS.headphones, tag: 'Luyện đề' },
  { n: '04', title: 'Sổ tay lỗi sai tự động', text: 'Câu sai được lưu kèm lời giải và nguyên nhân: ngữ pháp, từ vựng hay bẫy nghe. Không phải ghi chép tay.', photo: PHOTOS.writing, tag: 'Phân tích' },
  { n: '05', title: 'Ôn đúng lúc sắp quên', text: 'Thuật toán SM-2 nhắc lại sau 1, 3, 7, 14, 30 ngày. Mỗi sáng chỉ cần 10 phút ôn phần hệ thống gợi ý.', photo: PHOTOS.studying, tag: 'Ghi nhớ' },
];

/**
 * Thẻ tính năng dạng ảnh: ảnh phủ kín, lớp tối dần từ dưới lên, chữ ngắn ở đáy.
 * Dùng chung cho mọi ô trong bento (khác nhau bằng props), ảnh phóng nhẹ khi hover.
 */
const FeatureCard: React.FC<{
  to: string;
  photo: string;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  text: string;
  badge?: string;
  cta?: string;
  large?: boolean;
  children?: React.ReactNode;
}> = ({ to, photo, icon, iconClass, title, text, badge, cta, large, children }) => (
  <Link to={to} className={cn('group relative isolate block h-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900', large ? 'min-h-[420px] md:min-h-[520px]' : 'min-h-[240px]')}>
    {/* bọc riêng vì wrapper của Img luôn có class relative */}
    <div className="absolute inset-0 -z-10">
      <Img src={photo} alt={title} wrapperClass="h-full" fallbackClass="bg-slate-800" className="transition-[opacity,transform] duration-700 ease-out group-hover:scale-105" />
    </div>
    <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/5" />
    <div className="flex h-full flex-col justify-between p-5 md:p-7">
      <div className="flex items-start justify-between gap-3">
        <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg [&>svg]:w-5 [&>svg]:h-5', iconClass)}>{icon}</span>
        {badge && <span className="px-2.5 py-1 rounded-md bg-amber-300 text-slate-900 text-xs font-bold">{badge}</span>}
      </div>
      <div className={large ? 'max-w-lg' : undefined}>
        <h3 className={cn('font-display font-extrabold text-white leading-tight', large ? 'text-2xl md:text-4xl' : 'text-lg md:text-xl')}>{title}</h3>
        <p className={cn('text-slate-300 mt-2', large ? 'text-base md:text-lg' : 'text-sm')}>{text}</p>
        {children}
        {cta && (
          <span className="inline-flex items-center gap-2 mt-5 font-bold text-white group-hover:gap-3 transition-all">
            {cta} <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  </Link>
);

/**
 * Một hàng trong 5 bước: ẩn khi ở ngoài khung nhìn, cuộn tới thì mờ dần hiện ra và trượt nhẹ lên.
 * Hiệu ứng tiết chế: chỉ opacity + dịch chuyển dọc nhỏ, các phần lệch nhau vài chục ms.
 */
const StepRow: React.FC<{ index: number; step: (typeof LOOP)[number]; photoRef: (el: HTMLDivElement | null) => void; onToggle?: (index: number, on: boolean) => void }> = ({ index: i, step, photoRef, onToggle }) => {
  const { ref, inView: on } = useInView<HTMLDivElement>({ once: false, threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  useEffect(() => onToggle?.(i, on), [i, on, onToggle]);
  const textLeft = i % 2 === 0;
  const base = 'transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none';
  const show = (delay: number) => ({ transitionDelay: on ? `${delay}ms` : '0ms' });
  const state = on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';
  return (
    <div ref={ref} className={cn('grid md:grid-cols-2 gap-8 md:gap-16 items-center', !textLeft && 'md:[&>*:first-child]:order-2')}>
      <div className="space-y-4">
        <div className={cn('flex items-center gap-4', base, state)} style={show(0)}>
          <span className="font-display text-6xl md:text-7xl font-extrabold leading-[1.1] bg-gradient-to-br from-amber-200 via-amber-300 to-orange-500 bg-clip-text text-transparent">{step.n}</span>
          <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-bold text-amber-300">{step.tag}</span>
        </div>
        <h3 className={cn('font-display text-2xl md:text-3xl font-extrabold text-white', base, state)} style={show(80)}>
          {step.title}
        </h3>
        <p className={cn('text-slate-400 leading-relaxed text-lg', base, state)} style={show(160)}>
          {step.text}
        </p>
      </div>
      <div ref={photoRef} className={cn('night-photo relative z-10 md:w-[82%]', textLeft && 'md:ml-auto', base, on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')} style={show(120)}>
        <Img src={step.photo} alt={step.title} ratio="4/3" fallbackClass="bg-slate-800" />
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const loopBoxRef = useRef<HTMLDivElement>(null);
  const loopPhotoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [rowsOn, setRowsOn] = useState<boolean[]>([]);
  const toggleRow = useCallback((idx: number, on: boolean) => {
    setRowsOn((prev) => {
      if (Boolean(prev[idx]) === on) return prev;
      const next = [...prev];
      next[idx] = on;
      return next;
    });
  }, []);
  useDocumentTitle('Trang chủ');
  const gate = useGate();

  return (
    <div className="relative overflow-hidden night-bg text-white">
      {/* Nền đêm xuyên suốt trang: sao + quầng sáng tím-hồng-cam rải dọc trang */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-stars opacity-60" />
        <div className="absolute inset-0 bg-stars-2 animate-twinkle" />
        <div className="absolute top-[18%] -left-40 w-[620px] h-[620px] rounded-full bg-violet-500/20 blur-[140px]" />
        <div className="absolute top-[34%] -right-40 w-[560px] h-[560px] rounded-full bg-fuchsia-600/20 blur-[140px]" />
        <div className="absolute top-[52%] left-1/4 w-[520px] h-[520px] rounded-full bg-indigo-500/15 blur-[140px]" />
        <div className="absolute top-[70%] -right-20 w-[600px] h-[600px] rounded-full bg-amber-400/10 blur-[150px]" />
        <div className="absolute bottom-[4%] -left-32 w-[560px] h-[560px] rounded-full bg-violet-600/20 blur-[140px]" />
      </div>
      {/* ================= HERO (nền tối, chữ khổng lồ gradient, ảnh người bên phải) ================= */}
      <section className="hero-dark relative text-white overflow-hidden pt-[72px]">
        <ThreeBackground variant="particles" dark className="opacity-50" />
        {/* Quầng sáng gradient hồng-cam phía sau chữ và ảnh */}
        <div aria-hidden className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full bg-violet-500/30 blur-[140px] animate-float-slow" />
        <div aria-hidden className="absolute top-1/3 -right-32 w-[560px] h-[560px] rounded-full bg-fuchsia-500/25 blur-[140px] animate-float" />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full bg-amber-400/15 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 pb-0 grid lg:grid-cols-[1.25fr_1fr] gap-8 items-end min-h-[calc(100vh-72px)]">
          <div className="space-y-6 pb-16 md:pb-24">
            <h1 className="font-display font-extrabold tracking-tight animate-fade-up">
              <span className="sr-only">{HERO_WORDS.join(', ')} </span>
              <span className="block text-[3rem] sm:text-[5.1rem] lg:text-[7rem] leading-[1.15] pt-[0.05em] pb-[0.12em] -mb-[0.1em] hero-type-word">
                <TypeLoop words={HERO_WORDS} />
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
                  <b className="text-white">24.837</b> học viên đang học mỗi ngày
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
      <section className="relative isolate border-y border-white/10 bg-white/[0.02] py-5 space-y-3">
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -left-40 -top-24 w-[520px] h-[260px] bg-violet-500/20 blur-[100px]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -right-40 -bottom-24 w-[520px] h-[260px] bg-indigo-500/20 blur-[100px]" />
        <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Học viên đến từ</p>
        <div className="marquee">
          <div className="marquee-track whitespace-nowrap">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <span key={i} aria-hidden={i >= PARTNERS.length || undefined} className="mx-3 inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-xl border border-white/10 bg-white/5 font-display font-bold text-sm md:text-base text-slate-100 transition-colors hover:bg-amber-300 hover:text-slate-900 hover:border-amber-300">
                {/* nền trắng để logo trong suốt / màu tối vẫn rõ trên nền đêm */}
                <span className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                  <img src={`/images/universities/${p.logo}.webp`} alt={`Logo ${p.name}`} loading="lazy" decoding="async" className="max-w-full max-h-full object-contain" />
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
        <div className="marquee">
          <div className="marquee-track reverse whitespace-nowrap">
            {[...MARQUEE_POINTS, ...MARQUEE_POINTS].map((t, i) => (
              <span key={i} className="mx-6 inline-flex items-center gap-4 text-xs md:text-sm font-semibold text-slate-400">
                {t}
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      {/* Hàng số liệu kiểu báo cáo: chữ trắng, đường kẻ mảnh, không thẻ kính / không gradient */}
      <section className="relative isolate max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <p className="text-xs font-medium text-slate-500 mb-4">Số liệu OrbiLingo tính đến tháng 10/2026</p>
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 border-y border-white/10">
          {HOME_STATS.map((s, i) => {
            const plus = s.suffix.trim() === '+';
            return (
              <div
                key={s.label}
                className={cn(
                  'py-7 md:py-9 pr-4 md:pr-8',
                  i % 2 === 1 ? 'pl-5 md:pl-8 border-l border-white/10' : 'pl-0',
                  i === 2 && 'lg:pl-8 lg:border-l lg:border-white/10',
                  i >= 2 && 'border-t border-white/10 lg:border-t-0'
                )}
              >
                <p className="font-display text-[2.1rem] md:text-5xl font-bold leading-none tracking-tight text-white tabular-nums">
                  <CountUp value={s.value} />
                  {plus ? <span className="text-amber-300">+</span> : <span className="text-lg md:text-2xl font-semibold text-slate-400 ml-1.5">{s.suffix.trim()}</span>}
                </p>
                <p className="text-sm text-slate-400 mt-3">{s.label}</p>
              </div>
            );
          })}
        </Stagger>
      </section>

      {/* ================= 5-STEP LOOP (zigzag) ================= */}
      <section className="relative isolate max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        <div aria-hidden className="night-divider -z-10" />
        <div aria-hidden className="night-grid night-grid-top -inset-x-[20vw] -z-10" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -right-[18vw] top-[18%] w-[560px] h-[560px] bg-amber-400/15 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -left-[18vw] top-[38%] w-[560px] h-[560px] bg-fuchsia-500/20 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -right-[18vw] top-[60%] w-[560px] h-[560px] bg-indigo-500/20 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -left-[18vw] top-[80%] w-[560px] h-[560px] bg-violet-500/20 blur-[140px]" />
        <Reveal>
          <SectionTitle dark eyebrow="Cách OrbiLingo hoạt động" title={<>Không làm đề vô định. <span className="hero-gradient-text">Làm đúng</span> việc cần làm.</>} description="Năm bước lặp lại mỗi tuần. Dữ liệu từ bài làm của bạn quyết định bước tiếp theo." />
        </Reveal>
        <div ref={loopBoxRef} className="relative space-y-14 md:space-y-28">
          <LoopConnector containerRef={loopBoxRef} photoRefs={loopPhotoRefs} rowsOn={rowsOn} dark />
          {LOOP.map((step, i) => (
            <StepRow key={step.n} index={i} step={step} photoRef={(el) => (loopPhotoRefs.current[i] = el)} onToggle={toggleRow} />
          ))}
        </div>
      </section>

      {/* ================= BENTO FEATURES ================= */}
      <section className="relative isolate py-16 md:py-24">
        <div aria-hidden className="night-divider -z-10" />
        <div aria-hidden className="aurora -z-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <Reveal>
            <SectionTitle dark eyebrow="Tính năng" title={<>Mọi thứ cho một kỳ thi, <span className="hero-gradient-text">trong một chỗ.</span></>} description="Từ đề thi tới lớp học với giáo viên. Không cần cài thêm ứng dụng nào." />
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            <Reveal className="md:col-span-2 md:row-span-2">
              <FeatureCard to="/mock-tests" photo={PHOTOS.library} icon={<FileText />} iconClass="bg-indigo-500" title="Phòng thi thử chuẩn ETS & Bộ GD&ĐT" text="Đồng hồ, audio phát một lần, chấm điểm ngay khi nộp." badge="183 đề" cta="Vào phòng thi" large />
            </Reveal>
            <Reveal delay={100}>
              <FeatureCard to={gate('/app/mistakes', '/auth/register')} photo={PHOTOS.lecture} icon={<AlertTriangle />} iconClass="bg-amber-300 text-slate-900" title="Sổ tay lỗi sai" text="Câu sai tự lưu, luyện lại đúng chỗ yếu." />
            </Reveal>
            <Reveal delay={200}>
              <FeatureCard to={gate('/app/review', '/auth/register')} photo={PHOTOS.books} icon={<RotateCcw />} iconClass="bg-violet-500" title="Flashcard SM-2" text="600 từ Business, nhắc ôn đúng ngày." />
            </Reveal>
            <Reveal delay={150}>
              <FeatureCard to="/courses" photo={PHOTOS.classroom} icon={<Users />} iconClass="bg-emerald-500" title="Lớp học với giáo viên" text="Mã mời, bài tập, chấm theo rubric." />
            </Reveal>
            <Reveal delay={250} className="md:col-span-2">
              <FeatureCard to={gate('/app/learning-path', '/auth/register')} photo={PHOTOS.meeting} icon={<Compass />} iconClass="bg-sky-500" title="Lộ trình 3 chặng" text="Tự chia tuần theo ngày thi của bạn.">
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['Nền tảng · 4 tuần', 'Chuyên sâu · 5 tuần', 'Thực chiến · 3 tuần'].map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm text-xs font-semibold text-white">
                      {t}
                    </span>
                  ))}
                </div>
              </FeatureCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= TOEIC vs VSTEP ================= */}
      <section className="relative isolate max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
        <div aria-hidden className="night-divider -z-10" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -left-[15vw] top-1/3 w-[600px] h-[500px] bg-indigo-500/10 blur-[150px]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -right-[15vw] top-1/3 w-[600px] h-[500px] bg-violet-500/10 blur-[150px]" />
        <Reveal>
          <SectionTitle dark eyebrow="Hai kỳ thi, một nền tảng" title={<>Bạn thi <span className="text-indigo-300">TOEIC</span> hay <span className="text-violet-400">VSTEP</span>?</>} description="Chọn kỳ thi khi bắt đầu, có thể đổi bất kỳ lúc nào. Mọi tiến độ được giữ nguyên." />
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6">
          {HOME_EXAM_TRACKS.map((t, i) => (
            <Reveal key={t.id} delay={i * 120} className="h-full">
              <ExamTrackCard track={t} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= COURSES STRIP ================= */}
      <section className="relative isolate py-16 md:py-20">
        <div aria-hidden className="night-divider -z-10" />
        <div aria-hidden className="night-grid -z-10" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full left-1/2 -translate-x-1/2 top-1/3 w-[900px] h-[420px] bg-fuchsia-600/15 blur-[150px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <SectionTitle dark align="left" eyebrow="Khoá học" title={<>Lộ trình học, <span className="hero-gradient-text">video có bản ghi.</span></>} description="Nhấn vào từ trong transcript để tra nghĩa. Mỗi bài có quiz củng cố." />
            <Button to="/courses" variant="white" rightIcon={<ArrowRight className="w-4 h-4" />} className="!border-white/20 !bg-white/10 !text-white hover:!bg-white hover:!text-slate-900">
              Tất cả khoá học
            </Button>
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_COURSES.slice(0, 3).map((c, i) => (
              <Link key={c.id} to={`/courses/${c.id}`} className={cn('glass-night block rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 card-hover', i === 1 && 'lg:-translate-y-3')}>
                <Img src={c.coverUrl} alt={c.title} ratio="video" fallbackClass="bg-slate-800" />
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <Badge tone={c.examType === 'TOEIC' ? 'indigo' : 'violet'} solid>
                      {c.examType}
                    </Badge>
                    <Badge tone={c.isFree ? 'emerald' : 'amber'} solid>
                      {c.isFree ? 'Miễn phí' : 'VIP'}
                    </Badge>
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mt-3 leading-snug">{c.title}</h3>
                  <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-semibold">
                    <span className="flex items-center gap-2">
                      <Avatar name={c.teacherName} src={pravatar(40 + i)} size="xs" /> {c.teacherName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-300 fill-current" /> {c.rating} · {c.lessonsCount} bài
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="relative isolate max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
        <div aria-hidden className="night-divider -z-10" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full left-1/2 -translate-x-1/2 top-[30%] w-[1000px] h-[480px] bg-violet-600/20 blur-[160px]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -right-[10vw] bottom-0 w-[420px] h-[420px] bg-amber-400/10 blur-[140px]" />
        <Reveal>
          <SectionTitle dark eyebrow="Học viên nói gì" title={<>Điểm số thật, <span className="hero-gradient-text">người thật.</span></>} description="Ba trong số hàng nghìn học viên đã tăng điểm trong năm nay." />
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass-night relative rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
              <Quote className="w-8 h-8 text-violet-400/60 absolute top-6 right-6" />
              <div className="flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 leading-relaxed mt-4">"{t.quote}"</p>
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} src={t.avatar} size="md" />
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold">{t.score}</span>
              </div>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ================= PRICING SHORT ================= */}
      <section className="relative isolate max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -left-[10vw] top-0 w-[520px] h-[420px] bg-fuchsia-500/20 blur-[150px]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full right-0 top-1/4 w-[420px] h-[380px] bg-indigo-500/20 blur-[140px]" />
        <Reveal>
          <div className="glass-night rounded-3xl p-7 md:p-10 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-300">Bảng giá</span>
              <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white mt-3">
                Bắt đầu miễn phí. <span className="hero-gradient-text">Nâng cấp khi cần.</span>
              </h3>
              <p className="text-slate-400 mt-3 max-w-xl">Gói Free đủ để thi xếp lớp, luyện Part và dùng sổ tay lỗi sai. Gói VIP mở kho đề 2025 và không giới hạn flashcard.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PRICING_PLANS.map((p) => (
                <Link key={p.id} to="/pricing" className={cn('rounded-2xl border p-4 text-center hover:-translate-y-1 transition', p.highlight ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white border-white/20 shadow-[0_20px_40px_-20px_rgba(250,83,48,0.8)]' : 'bg-white/5 border-white/10 text-white')}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">{p.name}</p>
                  <p className="font-display text-lg font-extrabold mt-1">{p.price === 0 ? '0đ' : formatCurrency(p.price).replace(/\s/g, '')}</p>
                  <p className={cn('text-[10px] mt-0.5', p.highlight ? 'text-white/80' : 'text-slate-400')}>{p.period}</p>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative isolate overflow-hidden border-t border-white/10">
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full left-1/4 -top-20 w-[700px] h-[500px] bg-violet-600/25 blur-[160px]" />
        <div aria-hidden className="pointer-events-none absolute -z-10 rounded-full -right-20 bottom-0 w-[520px] h-[420px] bg-amber-400/15 blur-[150px]" />
        <ThreeBackground variant="globe" dark className="opacity-70" offsetX={0.6} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid lg:grid-cols-[1fr_380px] gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight text-balance text-white">
              Kỳ thi tiếp theo của bạn là <span className="hero-gradient-text">khi nào?</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-xl">Nhập ngày thi, làm bài xếp lớp 15 phút. Bạn sẽ có lộ trình tới ngày đó ngay hôm nay.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button to="/auth/register" size="xl" variant="gradient" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Tạo tài khoản miễn phí
              </Button>
              <Button to="/score-converter" size="xl" variant="white" leftIcon={<Target className="w-5 h-5" />} className="!border-white/20 !bg-white/10 !text-white hover:!bg-white hover:!text-slate-900">
                Quy đổi điểm mục tiêu
              </Button>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
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
          <div className="night-photo rotate-[-2deg] hidden lg:block">
            <Img src={PHOTOS.graduation} alt="Tốt nghiệp" ratio="4/3" fallbackClass="bg-slate-800" />
          </div>
        </div>
      </section>
      <span className="hidden">
        <BookOpen />
      </span>
    </div>
  );
};
