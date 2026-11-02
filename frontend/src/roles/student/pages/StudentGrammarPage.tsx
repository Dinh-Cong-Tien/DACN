import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GraduationCap, ChevronLeft, ChevronRight, Lightbulb, Target, CheckCircle2, BookOpen } from 'lucide-react';
import { useGrammarTopics } from '@/shared/api/learner';
import type { GrammarTopic } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, Chip, PageHeader, ProgressBar, SearchInput, EmptyState, Breadcrumb, RingProgress } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';

const CAT_PHOTO: Record<string, string> = { 'Thì động từ': PHOTOS.notes, 'Từ loại': PHOTOS.books, 'Giới từ': PHOTOS.writing, 'Mệnh đề': PHOTOS.library, 'Liên từ': PHOTOS.desk, 'Cấu trúc câu': PHOTOS.flatlay };

const TopicDetail: React.FC<{ topic: GrammarTopic; GRAMMAR_TOPICS: GrammarTopic[] }> = ({ topic, GRAMMAR_TOPICS }) => {
  const idx = GRAMMAR_TOPICS.findIndex((t) => t.id === topic.id);
  const prev = GRAMMAR_TOPICS[idx - 1];
  const next = GRAMMAR_TOPICS[idx + 1];
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Ngữ pháp', to: '/app/grammar' }, { label: topic.category }, { label: topic.title }]} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5">
          <Card hard tone="ink" className="animate-fade-up relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 bg-dots opacity-10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="sticker tilt-1 !bg-amber-300">{topic.category}</span>
                <Badge tone="slate" solid>
                  {topic.level}
                </Badge>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">{topic.title}</h1>
              <p className="text-slate-300 leading-relaxed mt-3">{topic.summary}</p>
            </div>
          </Card>
          {topic.rules.map((r, i) => (
            <Card key={r.title} hard className="animate-fade-up" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-indigo-600 border-2 border-slate-900 text-white font-display font-extrabold text-base flex items-center justify-center shrink-0 shadow-hard-sm">{i + 1}</span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-slate-900 text-lg">{r.title}</h3>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">{r.detail}</p>
                  <div className="mt-3 rounded-xl bg-amber-100 border-2 border-slate-900 p-3 text-sm text-slate-900 flex items-start gap-2 shadow-hard-sm">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      <b>Ví dụ:</b> <i>{r.example}</i>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          <div className="flex items-center justify-between gap-3">
            {prev ? (
              <Button to={`/app/grammar/${prev.slug}`} variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                <span className="hidden sm:inline">{prev.title}</span>
                <span className="sm:hidden">Trước</span>
              </Button>
            ) : (
              <span />
            )}
            {next && (
              <Button to={`/app/grammar/${next.slug}`} variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                <span className="hidden sm:inline">{next.title}</span>
                <span className="sm:hidden">Tiếp</span>
              </Button>
            )}
          </div>
        </div>
        <aside className="space-y-4">
          <Card hard className="text-center animate-slide-in-right">
            <RingProgress value={topic.progress} size={110} tone={topic.progress === 100 ? 'emerald' : 'indigo'} />
            <p className="font-display text-sm font-bold text-slate-900 mt-3">Tiến độ chủ điểm</p>
            <p className="text-xs text-slate-500">{topic.questionsCount} câu luyện tập</p>
            <Button to="/app/practice/session/PART_5" fullWidth className="mt-4" variant="gradient" leftIcon={<Target className="w-4 h-4" />}>
              Luyện 10 câu
            </Button>
          </Card>
          <Card hard padding="sm" tone="cream" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Cùng nhóm</p>
            <ul className="space-y-1">
              {GRAMMAR_TOPICS.filter((t) => t.category === topic.category).map((t) => (
                <li key={t.id}>
                  <Link to={`/app/grammar/${t.slug}`} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition', t.id === topic.id ? 'bg-slate-900 text-amber-300 font-bold' : 'text-slate-700 hover:bg-white')}>
                    {t.progress === 100 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <BookOpen className="w-4 h-4 opacity-60" />}
                    <span className="truncate">{t.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export const StudentGrammarPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: GRAMMAR_TOPICS = [], isLoading } = useGrammarTopics();
  const topic = slug ? GRAMMAR_TOPICS.find((t) => t.slug === slug) : undefined;
  // Bộ lọc trình độ lấy từ dữ liệu thật
  const LEVELS = useMemo(() => ['Tất cả', ...[...new Set(GRAMMAR_TOPICS.map((t) => t.level).filter(Boolean))].sort()], [GRAMMAR_TOPICS]);
  useDocumentTitle(topic ? topic.title : 'Chủ điểm ngữ pháp');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('Tất cả');

  const grouped = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = GRAMMAR_TOPICS.filter((t) => (level === 'Tất cả' || t.level === level) && (!s || t.title.toLowerCase().includes(s) || t.summary.toLowerCase().includes(s)));
    return list.reduce<Record<string, GrammarTopic[]>>((acc, t) => {
      (acc[t.category] ??= []).push(t);
      return acc;
    }, {});
  }, [search, level, GRAMMAR_TOPICS]);

  if (topic) return <TopicDetail topic={topic} GRAMMAR_TOPICS={GRAMMAR_TOPICS} />;
  if (slug && isLoading) return <p className="text-sm text-slate-500">Đang tải chủ điểm…</p>;

  const done = GRAMMAR_TOPICS.filter((t) => t.progress === 100).length;
  const cats = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Chủ điểm <span className="mark-teal mark">ngữ pháp</span>
          </>
        }
        icon={<GraduationCap />}
        description={isLoading ? 'Đang tải chủ điểm…' : `Đã hoàn thành ${done}/${GRAMMAR_TOPICS.length} chủ điểm cốt lõi cho TOEIC & VSTEP.`}
      />
      <Card hard padding="sm" tone="cream" className="animate-fade-down">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="md:w-72">
            <SearchInput inputSize="sm" placeholder="Tìm chủ điểm..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((l) => (
              <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
                {l}
              </Chip>
            ))}
          </div>
        </div>
      </Card>
      {cats.length === 0 ? (
        <Card hard>
          <EmptyState icon={<GraduationCap />} title="Không có chủ điểm phù hợp" description="Thử từ khoá khác hoặc bỏ lọc trình độ." />
        </Card>
      ) : (
        cats.map((cat, ci) => (
          <section key={cat} className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-900 shadow-hard min-h-[140px] animate-fade-up" style={{ animationDelay: `${ci * 100}ms` }}>
              <Img src={CAT_PHOTO[cat] ?? PHOTOS.books} alt={cat} wrapperClass="absolute inset-0" fallbackClass="bg-indigo-200" />
              <div className="absolute inset-0 bg-slate-900/40" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <h2 className="font-display text-xl font-extrabold text-white leading-tight">{cat}</h2>
                <p className="text-xs text-amber-300 font-bold">{grouped[cat].length} chủ điểm</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped[cat].map((t, i) => (
                <Link key={t.id} to={`/app/grammar/${t.slug}`} className="block animate-fade-up" style={{ animationDelay: `${ci * 100 + i * 60}ms` }}>
                  <Card hard hover className="h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-slate-900">{t.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{t.summary}</p>
                      </div>
                      {t.progress === 100 ? (
                        <span className="w-7 h-7 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <Badge tone="slate" size="xs">
                          {t.level}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <ProgressBar value={t.progress} size="sm" tone={t.progress === 100 ? 'emerald' : t.progress > 0 ? 'indigo' : 'slate'} className="flex-1" />
                      <span className="text-[11px] font-bold text-slate-600 w-20 text-right">{t.questionsCount} câu</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};
