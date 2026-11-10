import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Headphones, Play, Square, Check, ArrowRight, RotateCcw, Trophy, Eye, EyeOff, Volume2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, ProgressBar, RingProgress, StatCard, Textarea } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { cn } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';
import { submitDictation, useDictationList, useDictationPassage } from '@/shared/api/learner';
import { useQueryClient } from '@tanstack/react-query';

interface DictationItem {
  id: string;
  text: string;
  textVi?: string;
  level: 'Dễ' | 'Vừa' | 'Khó';
  topic: string;
}

/** Bậc CEFR của bài nghe → độ khó hiển thị */
const LEVEL_OF = (cefr?: string | null): DictationItem['level'] => (!cefr || cefr === 'A1' || cefr === 'A2' ? 'Dễ' : cefr === 'B1' ? 'Vừa' : 'Khó');

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s']/g, '').split(/\s+/).filter(Boolean);

export const StudentDictationPage: React.FC = () => {
  useDocumentTitle('Nghe chép chính tả');
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [showVi, setShowVi] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [plays, setPlays] = useState(0);
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const qc = useQueryClient();
  const typedAll = useRef<string[]>([]);
  const started = useRef(Date.now());
  // Bài nghe thật trong ngân hàng (passages DICTATION); mỗi câu của bài là một lượt chép
  const { data: list = [] } = useDictationList();
  const [passageIdx, setPassageIdx] = useState(0);
  // Bài giáo viên giao: /app/dictation?passage=<id>&assignment=<id> → mở đúng bài, nộp kèm mã bài tập
  const [params] = useSearchParams();
  const assignedPassage = params.get('passage');
  const assignmentId = params.get('assignment') ?? undefined;
  useEffect(() => {
    if (!assignedPassage || !list.length) return;
    const i = list.findIndex((p) => p.id === assignedPassage);
    if (i >= 0) setPassageIdx(i);
  }, [assignedPassage, list]);
  const passageId = list[passageIdx]?.id;
  const { data: passage, isLoading } = useDictationPassage(passageId);
  const ITEMS: DictationItem[] = useMemo(
    () =>
      (passage?.segments ?? [])
        .filter((s) => s.text.trim())
        .map((s, i) => ({ id: `${passage!.id}-${i}`, text: s.text.trim(), level: LEVEL_OF(passage!.level as string | undefined), topic: String(passage!.title ?? '').split(' — ')[0] || 'Nghe hiểu' })),
    [passage]
  );
  useEffect(() => {
    setIndex(0);
    setResults([]);
    setFinished(false);
    setInput('');
    setChecked(false);
    typedAll.current = [];
    started.current = Date.now();
  }, [passageId]);

  const item = ITEMS[index] ?? { id: 'empty', text: '', level: 'Dễ' as const, topic: '' };
  const target = useMemo(() => normalize(item.text), [item]);
  const typed = useMemo(() => normalize(input), [input]);

  const diff = useMemo(() => target.map((w, i) => ({ word: item.text.split(/\s+/)[i] ?? w, ok: typed[i] === w })), [target, typed, item]);
  const accuracy = target.length ? Math.round((diff.filter((d) => d.ok).length / target.length) * 100) : 0;

  const speak = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(item.text);
      u.lang = 'en-US';
      u.rate = rate;
      u.onend = u.onerror = () => setPlaying(false);
      setPlaying(true);
      window.speechSynthesis.speak(u);
      setPlays((p) => p + 1);
    } catch {
      toast.error('Trình duyệt không hỗ trợ phát âm');
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };
  // dừng đọc khi đổi câu / rời trang
  useEffect(() => stop, [index, passageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const check = () => {
    if (!input.trim()) return toast.warning('Hãy nhập câu bạn nghe được');
    setChecked(true);
    if (accuracy === 100) toast.success('Chính xác 100%!', 'Tai nghe của bạn rất tốt.');
  };

  const next = () => {
    const r = [...results, accuracy];
    setResults(r);
    typedAll.current.push(input.trim());
    setInput('');
    setChecked(false);
    setShowVi(false);
    setPlays(0);
    if (index + 1 < ITEMS.length) setIndex((i) => i + 1);
    else {
      setFinished(true);
      // Lưu kết quả cả bài (exam_attempts DICTATION) để tính thời gian học, streak, lịch sử
      if (passageId)
        submitDictation({ passageId, typedText: typedAll.current.join(' '), timeSpentSec: Math.round((Date.now() - started.current) / 1000), assignmentId: passageId === assignedPassage ? assignmentId : undefined })
          .then(() => ['progress', 'attempts', 'assignments'].forEach((k) => qc.invalidateQueries({ queryKey: ['learner', k] })))
          .catch(() => undefined);
    }
  };

  const nextPassage = () => list.length && setPassageIdx((i) => (i + 1) % list.length);

  const restart = () => {
    setIndex(0);
    setInput('');
    setChecked(false);
    setResults([]);
    setFinished(false);
    setPlays(0);
  };

  if (finished) {
    const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
    return (
      <div className="max-w-2xl mx-auto">
        <Card hard padding="lg" className="text-center space-y-5 animate-scale-in">
          <div className="relative inline-flex">
            <RingProgress value={avg} size={150} stroke={12} tone={avg >= 80 ? 'emerald' : avg >= 50 ? 'amber' : 'violet'}>
              <div>
                <p className="font-display text-3xl font-extrabold text-slate-900">{avg}%</p>
                <p className="text-[10px] font-extrabold uppercase text-slate-500">Trung bình</p>
              </div>
            </RingProgress>
            <span className="absolute -top-2 -right-2 w-11 h-11 rounded-xl bg-amber-300 border-2 border-slate-900 flex items-center justify-center shadow-hard-sm animate-bounce-soft">
              <Trophy className="w-5 h-5 text-slate-900" />
            </span>
          </div>
          <div>
            <h3 className="font-display text-2xl font-extrabold text-slate-900">Hoàn thành {ITEMS.length} câu!</h3>
            <p className="text-sm text-slate-600 mt-1">Nghe chép chính tả giúp bạn bắt âm cuối, nối âm và từ chức năng — những thứ dễ bị bỏ sót trong Part 2–4.</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {results.map((r, i) => (
              <div key={i} className={cn('rounded-xl border-2 border-slate-900 p-2 text-center animate-pop', r >= 80 ? 'bg-emerald-200' : r >= 50 ? 'bg-amber-200' : 'bg-violet-200')} style={{ animationDelay: `${i * 60}ms` }}>
                <p className="font-display text-sm font-extrabold text-slate-900">{r}%</p>
                <p className="text-[10px] font-bold text-slate-700">Câu {i + 1}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={restart}>
              Luyện lại
            </Button>
            <Button to="/app/practice">Về luyện tập</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<Headphones />}
        title={
          <>
            Nghe chép <span className="mark-teal mark">chính tả</span>
          </>
        }
        description="Nghe câu tiếng Anh và gõ lại chính xác từng từ. Hệ thống so khớp từng từ và chỉ ra chỗ bạn nghe sót."
        actions={
          list.length > 1 ? (
            <Button variant="outline" size="sm" leftIcon={<ArrowRight className="w-4 h-4" />} onClick={nextPassage}>
              Đổi bài nghe
            </Button>
          ) : undefined
        }
      />
      {!ITEMS.length && <p className="text-sm text-slate-500 mb-4">{isLoading || !list.length ? 'Đang tải bài nghe…' : 'Bài nghe chưa có câu nào.'}</p>}

      <Stagger className="grid grid-cols-3 gap-4 mb-6" step={70}>
        <StatCard label="Tiến độ" value={`${index + 1}/${ITEMS.length}`} icon={<Headphones />} tone="indigo" />
        <StatCard label="Độ chính xác TB" value={results.length ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : 0} suffix="%" icon={<Check />} tone="emerald" />
        <StatCard label="Lượt nghe câu này" value={plays} icon={<Volume2 />} tone="amber" hint="Thi thật chỉ nghe 1 lần" />
      </Stagger>

      <div className="max-w-3xl mx-auto space-y-4">
        <ProgressBar value={(index / Math.max(1, ITEMS.length)) * 100} size="sm" />
        <Card key={item.id}>
          <CardHeader
            title={`Câu ${index + 1}`}
            subtitle={`Chủ đề ${item.topic} · ${target.length} từ`}
            action={
              <Badge tone={item.level === 'Dễ' ? 'emerald' : item.level === 'Vừa' ? 'amber' : 'violet'}>
                {item.level}
              </Badge>
            }
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={playing ? stop : speak}
              aria-label={playing ? 'Dừng' : plays ? 'Nghe lại' : 'Nghe câu'}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {playing ? <Square className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{playing ? 'Đang phát…' : plays ? 'Nghe lại' : 'Nghe câu'}</p>
              <p className="text-xs text-slate-500">{plays ? `Đã nghe ${plays} lần` : 'Chưa nghe lần nào'} · Ctrl + Space để nghe lại</p>
            </div>
            <div role="radiogroup" aria-label="Tốc độ đọc" className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              {[0.75, 1, 1.25].map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={rate === r}
                  onClick={() => setRate(r)}
                  className={cn('rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors', rate === r ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900')}
                >
                  {r}×
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Textarea label="Bạn nghe được gì?" placeholder="Gõ lại câu vừa nghe…" hint="Ctrl + Enter để kiểm tra" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (!e.ctrlKey && !e.metaKey) return;
                if (e.key === ' ') { e.preventDefault(); speak(); }
                else if (e.key === 'Enter' && !checked) { e.preventDefault(); check(); }
              }} disabled={checked} className={cn(checked && (accuracy === 100 ? 'border-emerald-500' : 'border-amber-400'))} />
          </div>

          {checked && (
            <div className="mt-4 space-y-3 animate-fade-up">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Kết quả so khớp <span className="font-normal text-slate-500">· từ tô đỏ là chỗ nghe sót hoặc sai</span></p>
                <Badge tone={accuracy >= 80 ? 'emerald' : accuracy >= 50 ? 'amber' : 'violet'} solid size="md">
                  {accuracy}% chính xác
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-base leading-relaxed">
                {diff.map((d, i) => (
                  <span key={i} className={cn('rounded px-1 font-medium', d.ok ? 'text-slate-800' : 'bg-rose-500/15 text-rose-600 underline decoration-rose-400 underline-offset-4')}>
                    {d.word}
                  </span>
                ))}
              </div>
              {item.textVi && (
                <>
                  <button onClick={() => setShowVi((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:underline">
                    {showVi ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showVi ? 'Ẩn nghĩa' : 'Xem nghĩa tiếng Việt'}
                  </button>
                  {showVi && <p className="text-sm text-slate-600 italic animate-fade-in">"{item.textVi}"</p>}
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200">
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={() => { setInput(''); setChecked(false); }}>
              Nhập lại
            </Button>
            {checked ? (
              <Button variant={index + 1 < ITEMS.length ? 'primary' : 'success'} rightIcon={<ArrowRight className="w-4 h-4" />} onClick={next}>
                {index + 1 < ITEMS.length ? 'Câu tiếp theo' : 'Xem tổng kết'}
              </Button>
            ) : (
              <Button leftIcon={<Check className="w-4 h-4" />} onClick={check}>
                Kiểm tra
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
