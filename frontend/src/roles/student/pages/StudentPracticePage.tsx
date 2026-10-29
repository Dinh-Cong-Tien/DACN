import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Headphones, BookOpen, ArrowRight, Target, Zap, CheckCircle2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Card, CardHeader, PageHeader, ProgressBar, Tabs, StatCard } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { TOEIC_PARTS_INFO, QUESTIONS_BY_PART, SKILL_SCORES } from '@/shared/mocks';
import { cn } from '@/shared/utils';

const VSTEP_CARDS = [
  { id: 'VSTEP_LISTENING', name: 'Listening', nameVi: 'Kỹ năng Nghe', skill: 'Listening', description: '3 phần: thông báo, hội thoại, bài giảng. Nghe một lần duy nhất.', tone: 'from-sky-500 to-cyan-500' },
  { id: 'VSTEP_READING', name: 'Reading', nameVi: 'Kỹ năng Đọc', skill: 'Reading', description: '4 bài đọc độ khó tăng dần B1 → C1, mỗi bài 10 câu.', tone: 'from-emerald-500 to-teal-500' },
];

const PART_GRADIENT = ['from-indigo-500 to-violet-500', 'from-sky-500 to-cyan-500', 'from-violet-500 to-fuchsia-500', 'from-teal-500 to-emerald-500', 'from-amber-400 to-orange-500', 'from-rose-500 to-pink-500', 'from-orange-500 to-amber-500'];

export const StudentPracticePage: React.FC = () => {
  useDocumentTitle('Luyện tập kỹ năng');
  const [tab, setTab] = useState('TOEIC');
  const totalQ = Object.values(QUESTIONS_BY_PART).reduce((a, q) => a + q.length, 0);
  const avg = Math.round(SKILL_SCORES.reduce((a, s) => a + s.score, 0) / SKILL_SCORES.length);

  return (
    <div>
      <PageHeader icon={<Layers />} title="Luyện tập theo kỹ năng" description="Làm từng Part với phản hồi tức thì và giải thích chi tiết. Mọi câu sai tự động được lưu vào Sổ tay lỗi sai." actions={<Tabs variant="pill" value={tab} onChange={setTab} items={[{ key: 'TOEIC', label: 'TOEIC' }, { key: 'VSTEP', label: 'VSTEP' }]} />} />

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" step={70}>
        <StatCard label="Câu hỏi có sẵn" value={totalQ} icon={<Layers />} tone="indigo" />
        <StatCard label="Độ chính xác TB" value={avg} suffix="%" icon={<Target />} tone="emerald" delta={4} deltaLabel="tuần này" />
        <StatCard label="Câu đã luyện" value={1284} icon={<CheckCircle2 />} tone="violet" />
        <StatCard label="Combo tốt nhất" value={9} icon={<Zap />} tone="amber" />
      </Stagger>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div>
          {tab === 'TOEIC' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOEIC_PARTS_INFO.map((p, i) => {
                const count = QUESTIONS_BY_PART[p.id]?.length ?? 0;
                const acc = SKILL_SCORES[i]?.score ?? 0;
                const Icon = p.skill === 'Listening' ? Headphones : BookOpen;
                return (
                  <Link key={p.id} to={`/app/practice/session/${p.id}`} className="group block animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <Card hover className="h-full relative overflow-hidden" padding="sm">
                      <div className={cn('absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500', PART_GRADIENT[i])} />
                      <div className="flex items-start gap-3 relative">
                        <span className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:-rotate-6', PART_GRADIENT[i])}>
                          <Icon className="w-5 h-5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900">{p.name}</p>
                            <Badge tone={p.skill === 'Listening' ? 'sky' : 'emerald'} size="xs">
                              {p.skill}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-slate-700">{p.nameVi}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition shrink-0 mt-1" />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 relative">
                        <ProgressBar value={acc} size="sm" tone={acc >= 75 ? 'emerald' : acc >= 60 ? 'amber' : 'rose'} className="flex-1" />
                        <span className="text-xs font-bold text-slate-600 shrink-0">{acc}% đúng</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 relative">
                        {count} câu mẫu · {p.questions} câu trong đề thật
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VSTEP_CARDS.map((p, i) => {
                const count = QUESTIONS_BY_PART[p.id]?.length ?? 0;
                const Icon = p.skill === 'Listening' ? Headphones : BookOpen;
                return (
                  <Link key={p.id} to={`/app/practice/session/${p.id}`} className="group block animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <Card hover className="h-full relative overflow-hidden">
                      <div className={cn('absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500', p.tone)} />
                      <span className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-md mb-3', p.tone)}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <p className="font-black text-slate-900 text-lg">VSTEP {p.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{count} câu mẫu</span>
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                          Luyện ngay <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
              <Card className="md:col-span-2 bg-slate-50/60 border-dashed animate-fade-up" style={{ animationDelay: '200ms' }}>
                <p className="text-sm font-bold text-slate-800">Writing & Speaking</p>
                <p className="text-xs text-slate-500 mt-1">Hai kỹ năng tự luận có không gian luyện riêng với đề mẫu và nộp bài cho giáo viên.</p>
                <div className="flex gap-2 mt-3">
                  <Link to="/app/writing" className="text-xs font-bold text-indigo-600 hover:underline">
                    Luyện Viết →
                  </Link>
                  <Link to="/app/speaking" className="text-xs font-bold text-indigo-600 hover:underline">
                    Luyện Nói →
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </div>

        <Card className="h-fit animate-slide-in-right">
          <CardHeader title="Độ chính xác theo Part" subtitle="30 ngày gần nhất" icon={<Target />} />
          <div className="space-y-3">
            {SKILL_SCORES.map((s, i) => (
              <div key={s.skill} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <ProgressBar value={s.score} label={s.skill} showValue size="sm" tone={s.score >= 75 ? 'emerald' : s.score >= 60 ? 'amber' : 'rose'} />
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
            <b>Gợi ý:</b> Part 7 và Part 4 đang thấp nhất. Hãy luyện 10 câu mỗi ngày hoặc dùng <Link to="/app/drills" className="font-bold underline">Luyện điểm yếu</Link>.
          </div>
        </Card>
      </div>
    </div>
  );
};
