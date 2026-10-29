import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, RotateCcw, Flame, Volume2, Plus, Layers } from 'lucide-react';
import { MOCK_VOCAB, VOCAB_TOPICS } from '@/shared/mocks';
import type { VocabWord } from '@/shared/types';
import { cn, formatDate } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { Badge, Button, Card, Chip, Input, Modal, PageHeader, ProgressBar, SearchInput, StatCard, EmptyState, Textarea } from '@/shared/components/ui';

const STATUS_META: Record<VocabWord['status'], { label: string; tone: 'amber' | 'sky' | 'emerald' }> = {
  LEARNING: { label: 'Đang học', tone: 'amber' },
  REVIEWING: { label: 'Đang ôn', tone: 'sky' },
  MASTERED: { label: 'Đã thuộc', tone: 'emerald' },
};

const speak = (word: string) => {
  try {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
};

export const StudentVocabularyPage: React.FC = () => {
  useDocumentTitle('Từ vựng & Flashcard');
  const user = useAuthStore((s) => s.user);
  const [words, setWords] = useState<VocabWord[]>(MOCK_VOCAB);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ word: '', meaning: '', example: '' });

  const now = Date.now();
  const due = words.filter((w) => new Date(w.nextReviewAt).getTime() <= now);
  const mastered = words.filter((w) => w.status === 'MASTERED');

  const list = useMemo(
    () =>
      words.filter((w) => {
        if (status !== 'ALL' && w.status !== status) return false;
        const s = search.trim().toLowerCase();
        return !s || w.word.toLowerCase().includes(s) || w.meaningVi.toLowerCase().includes(s);
      }),
    [words, status, search]
  );

  const addWord = () => {
    if (!form.word.trim() || !form.meaning.trim()) {
      toast.error('Thiếu thông tin', 'Nhập từ và nghĩa tiếng Việt.');
      return;
    }
    const w: VocabWord = {
      id: `w-${Date.now()}`,
      word: form.word.trim(),
      ipa: '',
      pos: 'word',
      meaningVi: form.meaning.trim(),
      example: form.example.trim(),
      topic: 'Sổ từ cá nhân',
      status: 'LEARNING',
      nextReviewAt: new Date().toISOString(),
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
    };
    setWords((s) => [w, ...s]);
    setForm({ word: '', meaning: '', example: '' });
    setAddOpen(false);
    toast.success('Đã thêm từ mới', `"${w.word}" sẽ xuất hiện trong lịch ôn hôm nay.`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Từ vựng & Flashcard"
        icon={<BookOpen />}
        description="Học từ theo chủ đề, ôn tập bằng flashcard với thuật toán ngắt quãng SM-2."
        actions={
          <>
            <Button variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
              Thêm từ
            </Button>
            <Button variant="gradient" leftIcon={<RotateCcw className="w-4 h-4" />} to="/app/vocabulary/flashcards" disabled={due.length === 0}>
              Ôn {due.length} thẻ đến hạn
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Tổng số từ" value={words.length} icon={<BookOpen />} tone="indigo" />
        <StatCard label="Đã thuộc" value={mastered.length} icon={<CheckCircle2 />} tone="emerald" hint={`${Math.round((mastered.length / words.length) * 100)}% kho từ`} />
        <StatCard label="Cần ôn hôm nay" value={due.length} icon={<RotateCcw />} tone="amber" hint="Theo lịch SM-2" />
        <StatCard label="Chuỗi ngày" value={user?.streak ?? 0} suffix="ngày" icon={<Flame />} tone="rose" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" /> Chủ đề từ vựng
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {VOCAB_TOPICS.map((t, i) => (
            <Card key={t.id} padding="sm" className="card-hover animate-fade-up relative overflow-hidden group" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={cn('absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500', t.gradient)} />
              <div className="relative flex items-start gap-3">
                <span className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br text-2xl flex items-center justify-center shadow-md shrink-0', t.gradient)}>{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{t.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {t.learned}/{t.total} từ đã học
                  </p>
                  <ProgressBar value={(t.learned / t.total) * 100} size="sm" className="mt-2" tone={t.learned === 0 ? 'slate' : 'indigo'} />
                </div>
              </div>
              <Button to={`/app/vocabulary/flashcards/${t.id}`} size="sm" variant={t.learned === 0 ? 'outline' : 'soft'} fullWidth className="mt-4 relative">
                {t.learned === 0 ? 'Bắt đầu học' : 'Ôn flashcard'}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-bold text-slate-900">Sổ từ của tôi</h2>
        <Card padding="sm">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="md:w-72">
              <SearchInput inputSize="sm" placeholder="Tìm từ hoặc nghĩa..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Chip active={status === 'ALL'} onClick={() => setStatus('ALL')}>
                Tất cả ({words.length})
              </Chip>
              {(Object.keys(STATUS_META) as VocabWord['status'][]).map((k) => (
                <Chip key={k} active={status === k} onClick={() => setStatus(k)} tone={STATUS_META[k].tone}>
                  {STATUS_META[k].label} ({words.filter((w) => w.status === k).length})
                </Chip>
              ))}
            </div>
          </div>
        </Card>
        {list.length === 0 ? (
          <Card>
            <EmptyState title="Không tìm thấy từ nào" description="Thử từ khoá khác hoặc thêm từ mới vào sổ." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.map((w, i) => (
              <Card key={w.id} padding="sm" className="animate-fade-up flex items-start gap-3" style={{ animationDelay: `${i * 40}ms` }}>
                <button onClick={() => speak(w.word)} className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 hover:bg-indigo-600 hover:text-white transition">
                  <Volume2 className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-slate-900">{w.word}</p>
                    {w.ipa && <span className="text-[11px] font-mono text-slate-400">{w.ipa}</span>}
                    <span className="text-[11px] italic text-slate-400">{w.pos}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">{w.meaningVi}</p>
                  {w.example && <p className="text-xs text-slate-500 italic mt-0.5 truncate">"{w.example}"</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge tone={STATUS_META[w.status].tone} size="xs" dot>
                      {STATUS_META[w.status].label}
                    </Badge>
                    <Badge tone="slate" size="xs">
                      {w.topic}
                    </Badge>
                    <span className="text-[10px] text-slate-400 ml-auto">Ôn: {new Date(w.nextReviewAt).getTime() <= now ? 'Hôm nay' : formatDate(w.nextReviewAt)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Thêm từ mới"
        description="Từ mới sẽ được đưa vào lịch ôn ngắt quãng ngay hôm nay."
        icon={<Plus />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={addWord}>Lưu từ</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Từ tiếng Anh" required placeholder="ví dụ: negotiate" value={form.word} onChange={(e) => setForm((s) => ({ ...s, word: e.target.value }))} />
          <Input label="Nghĩa tiếng Việt" required placeholder="đàm phán" value={form.meaning} onChange={(e) => setForm((s) => ({ ...s, meaning: e.target.value }))} />
          <Textarea label="Câu ví dụ" placeholder="They negotiated a better contract." value={form.example} onChange={(e) => setForm((s) => ({ ...s, example: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
};
