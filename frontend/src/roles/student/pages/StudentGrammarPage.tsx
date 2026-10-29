import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GraduationCap, ChevronLeft, ChevronRight, Lightbulb, Target, CheckCircle2, BookOpen } from 'lucide-react';
import { GRAMMAR_TOPICS } from '@/shared/mocks';
import type { GrammarTopic } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, Chip, PageHeader, ProgressBar, SearchInput, EmptyState, Breadcrumb, RingProgress } from '@/shared/components/ui';

const LEVELS = ['Tất cả', 'A2–B1', 'B1', 'A2–B2', 'B1–B2'];

const TopicDetail: React.FC<{ topic: GrammarTopic }> = ({ topic }) => {
  const idx = GRAMMAR_TOPICS.findIndex((t) => t.id === topic.id);
  const prev = GRAMMAR_TOPICS[idx - 1];
  const next = GRAMMAR_TOPICS[idx + 1];
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Ngữ pháp', to: '/app/grammar' }, { label: topic.category }, { label: topic.title }]} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5">
          <Card className="animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <Badge tone="violet">{topic.category}</Badge>
              <Badge tone="slate">{topic.level}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{topic.title}</h1>
            <p className="text-slate-600 leading-relaxed mt-3">{topic.summary}</p>
          </Card>
          {topic.rules.map((r, i) => (
            <Card key={r.title} className="animate-fade-up" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{r.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{r.detail}</p>
                  <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
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
          <Card className="text-center animate-slide-in-right">
            <RingProgress value={topic.progress} size={110} tone={topic.progress === 100 ? 'emerald' : 'indigo'} />
            <p className="text-sm font-bold text-slate-900 mt-3">Tiến độ chủ điểm</p>
            <p className="text-xs text-slate-500">{topic.questionsCount} câu luyện tập</p>
            <Button to="/app/practice/session/PART_5" fullWidth className="mt-4" leftIcon={<Target className="w-4 h-4" />}>
              Luyện 10 câu
            </Button>
          </Card>
          <Card padding="sm" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Cùng nhóm</p>
            <ul className="space-y-1">
              {GRAMMAR_TOPICS.filter((t) => t.category === topic.category).map((t) => (
                <li key={t.id}>
                  <Link to={`/app/grammar/${t.slug}`} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition', t.id === topic.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50')}>
                    {t.progress === 100 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <BookOpen className="w-4 h-4 text-slate-400" />}
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
  const topic = slug ? GRAMMAR_TOPICS.find((t) => t.slug === slug) : undefined;
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
  }, [search, level]);

  if (topic) return <TopicDetail topic={topic} />;

  const done = GRAMMAR_TOPICS.filter((t) => t.progress === 100).length;
  const cats = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <PageHeader title="Chủ điểm ngữ pháp" icon={<GraduationCap />} description={`Đã hoàn thành ${done}/${GRAMMAR_TOPICS.length} chủ điểm cốt lõi cho TOEIC & VSTEP.`} />
      <Card padding="sm" className="animate-fade-down">
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
        <Card>
          <EmptyState icon={<GraduationCap />} title="Không có chủ điểm phù hợp" description="Thử từ khoá khác hoặc bỏ lọc trình độ." />
        </Card>
      ) : (
        cats.map((cat, ci) => (
          <section key={cat} className="space-y-3">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-indigo-600" />
              {cat}
              <Badge tone="slate" size="xs">
                {grouped[cat].length}
              </Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped[cat].map((t, i) => (
                <Link key={t.id} to={`/app/grammar/${t.slug}`} className="block animate-fade-up" style={{ animationDelay: `${ci * 100 + i * 60}ms` }}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">{t.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{t.summary}</p>
                      </div>
                      {t.progress === 100 ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Badge tone="slate" size="xs">{t.level}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <ProgressBar value={t.progress} size="sm" tone={t.progress === 100 ? 'emerald' : t.progress > 0 ? 'indigo' : 'slate'} className="flex-1" />
                      <span className="text-[11px] font-bold text-slate-500 w-20 text-right">{t.questionsCount} câu</span>
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
