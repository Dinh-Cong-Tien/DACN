import { ThreeBackground } from '@/shared/components/three/ThreeBackground';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Headphones, PenLine, Sparkles, ShieldCheck } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { PracticeEngine } from '@/engines';
import { Button, Card, Badge, Avatar } from '@/shared/components/ui';
import { Reveal, Doodles } from '@/shared/components/motion';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';
import { TOEIC_PART2, TOEIC_PART5, VSTEP_READING } from '@/shared/mocks';

type Pack = 'TOEIC' | 'VSTEP';

/**
 * Học thử miễn phí — không cần tài khoản.
 * Khách chọn bộ mẫu, làm ngay với PracticeEngine (giải thích tức thì), xong mới được mời đăng ký để lưu kết quả.
 */
export const TryPage: React.FC = () => {
  useDocumentTitle('Học thử miễn phí');
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const [pack, setPack] = useState<Pack | null>(null);
  const [done, setDone] = useState<{ correct: number; total: number } | null>(null);

  const questions = useMemo(() => (pack === 'VSTEP' ? [...VSTEP_READING] : [...TOEIC_PART2.slice(0, 2), ...TOEIC_PART5.slice(0, 5)]), [pack]);

  // ===== Bước 3: kết quả + mời đăng ký =====
  if (done) {
    const pct = Math.round((done.correct / done.total) * 100);
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
          <Reveal className="space-y-5">
            <Badge tone="emerald" size="md">
              Hoàn thành bài học thử
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.05]">
              Bạn đúng {done.correct}/{done.total} câu <span className="mark">({pct}%)</span>.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              {pct >= 70 ? 'Nền tảng của bạn khá tốt. ' : 'Có vài lỗi đáng để xem lại. '}
              Tạo tài khoản miễn phí để lưu kết quả này, làm bài xếp lớp 15 phút và nhận lộ trình học theo ngày thi của bạn.
            </p>
            <ul className="space-y-2.5">
              {['Lưu các câu sai vào Sổ tay lỗi sai, nhắc ôn đúng lúc', 'Lộ trình 3 chặng theo ngày thi và mục tiêu điểm', '3 đề thi thử chuẩn ETS mỗi tuần, hoàn toàn miễn phí'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              {isAuth ? (
                <Button to="/" size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Vào trang học của tôi
                </Button>
              ) : (
                <>
                  <Button to="/auth/register?next=%2Fonboarding%2Fgoal" size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Tạo tài khoản miễn phí
                  </Button>
                  <Button to="/auth/login" size="lg" variant="outline">
                    Tôi đã có tài khoản
                  </Button>
                </>
              )}
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  setDone(null);
                  setPack(null);
                }}
              >
                Làm bộ khác
              </Button>
            </div>
          </Reveal>
          <Reveal delay={120} className="photo-frame tilt-2">
            <Img src={PHOTOS.graduation} alt="Học viên OrbiLingo" ratio="4/3" fallbackClass="bg-indigo-200" />
          </Reveal>
        </div>
      </div>
    );
  }

  // ===== Bước 2: làm bài =====
  if (pack) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 portal">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Học thử · không cần tài khoản</p>
            <h1 className="font-display text-2xl font-bold text-slate-900">{pack === 'VSTEP' ? 'VSTEP Reading — bài đọc mẫu' : 'TOEIC — Part 2 & Part 5 mẫu'}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPack(null)}>
            Chọn bộ khác
          </Button>
        </div>
        <PracticeEngine title={pack === 'VSTEP' ? 'VSTEP mẫu' : 'TOEIC mẫu'} questions={questions} exitTo="/try" onFinishPractice={(s) => setDone({ correct: s.correct, total: s.total })} />
      </div>
    );
  }

  // ===== Bước 1: chọn bộ mẫu =====
  return (
    <div className="relative overflow-hidden">
      <ThreeBackground variant="particles" className="opacity-50" />
      <Doodles />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="max-w-2xl space-y-5 animate-fade-up">
          <span className="sticker">Miễn phí · Không cần tài khoản</span>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.02]">
            Học thử <span className="mark-coral mark">5 phút</span>, xem bạn hợp cách học này không.
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">Chọn một bộ câu hỏi mẫu. Mỗi câu trả lời xong sẽ hiện ngay đáp án và lời giải, đúng như khi học thật. Không cần đăng ký, không cần thẻ.</p>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {[21, 22, 23, 24].map((n) => (
                <Avatar key={n} name={`HV ${n}`} src={pravatar(n)} size="sm" ring />
              ))}
            </div>
            <span>
              <b className="text-slate-900">1.240</b> người đã học thử hôm nay
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {[
            {
              key: 'TOEIC' as Pack,
              title: 'TOEIC — Part 2 & Part 5',
              desc: '2 câu nghe hỏi-đáp (audio phát một lần) và 5 câu hoàn thành câu về từ loại, giới từ, thì động từ.',
              meta: ['7 câu', '≈ 5 phút', 'Nghe + Đọc'],
              icon: <Headphones className="w-5 h-5" />,
              photo: PHOTOS.headphones,
              tone: 'bg-indigo-600',
            },
            {
              key: 'VSTEP' as Pack,
              title: 'VSTEP — Bài đọc mẫu B1–B2',
              desc: 'Một bài đọc về urban farming với 3 câu: ý chính, từ vựng trong ngữ cảnh và chi tiết.',
              meta: ['3 câu', '≈ 4 phút', 'Đọc hiểu'],
              icon: <PenLine className="w-5 h-5" />,
              photo: PHOTOS.writing,
              tone: 'bg-violet-500',
            },
          ].map((p, i) => (
            <Reveal key={p.key} delay={i * 100}>
              <button onClick={() => setPack(p.key)} className="group text-left w-full rounded-3xl overflow-hidden bg-white border-2 border-slate-900 shadow-hard card-hard-hover">
                <div className="relative">
                  <Img src={p.photo} alt={p.title} ratio="video" fallbackClass="bg-indigo-100" />
                  <span className={`absolute top-4 left-4 w-11 h-11 rounded-xl ${p.tone} text-white border-2 border-slate-900 flex items-center justify-center`}>{p.icon}</span>
                </div>
                <div className="p-6 space-y-3">
                  <h2 className="font-display text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{p.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.meta.map((m) => (
                      <Badge key={m} tone="slate">
                        {m}
                      </Badge>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 pt-1">
                    Bắt đầu ngay <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Card className="grid sm:grid-cols-3 gap-6" padding="lg">
            {[
              { icon: <Clock className="w-5 h-5" />, t: 'Không giới hạn thời gian', d: 'Học thử không tính giờ. Phòng thi thật mới có đồng hồ.' },
              { icon: <Sparkles className="w-5 h-5" />, t: 'Giải thích từng câu', d: 'Sai ở đâu biết ngay ở đó: ngữ pháp, từ vựng hay bẫy nghe.' },
              { icon: <ShieldCheck className="w-5 h-5" />, t: 'Không lưu gì cả', d: 'Muốn lưu kết quả và nhận lộ trình thì tạo tài khoản sau khi làm xong.' },
            ].map((f) => (
              <div key={f.t} className="flex gap-3">
                <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">{f.icon}</span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{f.t}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.d}</p>
                </div>
              </div>
            ))}
          </Card>
        </Reveal>

        <p className="text-center text-sm text-slate-500 mt-8">
          Đã có tài khoản?{' '}
          <Link to="/auth/login" className="font-bold text-indigo-700 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};
