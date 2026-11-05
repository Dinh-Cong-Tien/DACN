import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Target, Zap, CheckCircle2, Headphones, BookOpen } from 'lucide-react';
import { useDocumentTitle, useParamState } from '@/shared/hooks';
import { Badge, Card, CardHeader, PageHeader, ProgressBar, Tabs, StatCard } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { usePartsInfo, usePracticeOverview, useProgress } from '@/shared/api/learner';
import { cn } from '@/shared/utils';
import { appLocale } from '@/shared/i18n';

const VSTEP_CARDS = [
  { id: 'VSTEP_LISTENING', name: 'Listening', nameVi: 'Kỹ năng Nghe', skill: 'Listening', description: '3 phần: thông báo, hội thoại, bài giảng. Nghe một lần duy nhất.', photo: PHOTOS.headphones, tone: 'bg-sky-500' },
  { id: 'VSTEP_READING', name: 'Reading', nameVi: 'Kỹ năng Đọc', skill: 'Reading', description: '4 bài đọc độ khó tăng dần B1 → C1, mỗi bài 10 câu.', photo: PHOTOS.books, tone: 'bg-indigo-600' },
];

const PART_TONE = ['bg-sky-500 text-white', 'bg-indigo-600 text-white', 'bg-violet-500 text-white', 'bg-amber-300 text-slate-900', 'bg-emerald-400 text-slate-900', 'bg-lavender-500 text-white', 'bg-slate-900 text-amber-300'];

export const StudentPracticePage: React.FC = () => {
  useDocumentTitle('Luyện tập kỹ năng');
  const [tab, setTab] = useParamState('exam', ['TOEIC', 'VSTEP'], 'TOEIC');
  const { data: TOEIC_PARTS_INFO = [] } = usePartsInfo('TOEIC');
  const { data: overview } = usePracticeOverview();
  const { data: progress } = useProgress();
  const SKILL_SCORES = progress?.skillScores ?? [];
  const totalQ = overview?.total ?? 0;
  const avg = SKILL_SCORES.length ? Math.round(SKILL_SCORES.reduce((a, s) => a + s.score, 0) / SKILL_SCORES.length) : 0;
  const accOf = (label: string) => SKILL_SCORES.find((s) => s.skill === label)?.score ?? 0;
  // Gợi ý: 2 Part có độ chính xác thấp nhất (khi đã có dữ liệu)
  const weakest = [...SKILL_SCORES].sort((a, b) => a.score - b.score).slice(0, 2).map((s) => s.skill);

  return (
    <div>
      <PageHeader
        icon={<Layers />}
        title={
          <>
            Luyện tập theo <span className="mark-teal mark">kỹ năng</span>
          </>
        }
        description="Làm từng Part với phản hồi tức thì và giải thích chi tiết. Mọi câu sai tự động được lưu vào Sổ tay lỗi sai."
        actions={<Tabs variant="pill" value={tab} onChange={setTab} items={[{ key: 'TOEIC', label: 'TOEIC' }, { key: 'VSTEP', label: 'VSTEP' }]} />}
      />

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" step={70}>
        <StatCard label="Câu hỏi có sẵn" value={totalQ} icon={<Layers />} tone="indigo" />
        <StatCard label="Độ chính xác TB" value={avg} suffix="%" icon={<Target />} tone="emerald" />
        <StatCard label="Câu đã luyện" value={progress?.totals.questions ?? 0} icon={<CheckCircle2 />} tone="violet" />
        <StatCard label="Lỗi sai cần ôn" value={progress?.totals.mistakesOpen ?? 0} icon={<Zap />} tone="amber" />
      </Stagger>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div>
          {tab === 'TOEIC' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOEIC_PARTS_INFO.map((p, i) => {
                const count = overview?.byPart[p.id] ?? 0;
                const acc = accOf(`Part ${p.id.slice(5)}`);
                return (
                  <Link key={p.id} to={`/app/practice/session/${p.id}`} className="group block animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <Card hard hover className="h-full" padding="sm">
                      <div className="flex items-start gap-4">
                        <span className={cn('w-16 h-16 rounded-2xl border-2 border-slate-900 shadow-hard-sm flex items-center justify-center shrink-0 font-display text-2xl font-extrabold transition-transform group-hover:-rotate-6', PART_TONE[i])}>{String(i + 1).padStart(2, '0')}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-display font-extrabold text-slate-900 text-lg">{p.name}</p>
                            <Badge tone={p.skill === 'Listening' ? 'sky' : 'emerald'} size="xs">
                              {p.skill}
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-slate-700">{p.nameVi}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition shrink-0 mt-1" />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <ProgressBar value={acc} size="sm" tone={acc >= 75 ? 'emerald' : acc >= 60 ? 'amber' : 'violet'} className="flex-1" />
                        <span className="text-xs font-extrabold text-slate-700 shrink-0">{acc}% đúng</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold mt-2">
                        {count.toLocaleString(appLocale())} câu trong ngân hàng · {p.questions} câu trong đề thật{p.minutes ? ` · ~${p.minutes} phút` : ''}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VSTEP_CARDS.map((p, i) => {
                const count = overview?.byPart[p.id] ?? 0;
                const Icon = p.skill === 'Listening' ? Headphones : BookOpen;
                return (
                  <Link key={p.id} to={`/app/practice/session/${p.id}`} className="group block animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <Card hard hover padding="none" className="h-full overflow-hidden">
                      <div className="relative">
                        <Img src={p.photo} ratio="video" alt={p.nameVi} fallbackClass={p.tone} className="group-hover:scale-105 transition-transform duration-700" />
                        <span className={cn('absolute top-3 left-3 w-11 h-11 rounded-xl border-2 border-slate-900 text-white flex items-center justify-center shadow-hard-sm', p.tone)}>
                          <Icon className="w-5 h-5" />
                        </span>
                      </div>
                      <div className="p-5">
                        <p className="font-display font-extrabold text-slate-900 text-xl">VSTEP {p.name}</p>
                        <p className="text-sm text-slate-600 mt-1">{p.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">{count} câu mẫu</span>
                          <span className="text-xs font-extrabold text-indigo-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                            Luyện ngay <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
              <Card hard tone="cream" className="md:col-span-2 animate-fade-up" style={{ animationDelay: '200ms' }}>
                <p className="font-display text-sm font-extrabold text-slate-900">Writing & Speaking</p>
                <p className="text-xs text-slate-600 mt-1">Hai kỹ năng tự luận có không gian luyện riêng với đề mẫu và nộp bài cho giáo viên.</p>
                <div className="flex gap-3 mt-3">
                  <Link to="/app/writing" className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-700 hover:underline">
                    Luyện Viết <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/app/speaking" className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-700 hover:underline">
                    Luyện Nói <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </div>

        <Card hard className="h-fit animate-slide-in-right">
          <CardHeader title="Độ chính xác theo Part" subtitle="Tính trên các câu bạn đã làm" icon={<Target />} />
          <div className="space-y-3">
            {SKILL_SCORES.length === 0 && <p className="text-xs text-slate-500">Chưa có dữ liệu. Luyện vài câu để xem độ chính xác từng Part.</p>}
            {SKILL_SCORES.map((s, i) => (
              <div key={s.skill} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <ProgressBar value={s.score} label={s.skill} showValue size="sm" tone={s.score >= 75 ? 'emerald' : s.score >= 60 ? 'amber' : 'violet'} />
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-xl bg-amber-100 border-2 border-slate-900 text-xs text-slate-800">
            <b>Gợi ý:</b> {weakest.length ? `${weakest.join(' và ')} đang thấp nhất.` : 'Bắt đầu từ Part bạn thấy khó nhất.'} Luyện 10 câu mỗi ngày hoặc dùng{' '}
            <Link to="/app/drills" className="font-extrabold underline">
              Luyện điểm yếu
            </Link>
            .
          </div>
        </Card>
      </div>
    </div>
  );
};
