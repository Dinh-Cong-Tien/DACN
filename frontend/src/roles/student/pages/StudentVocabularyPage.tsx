import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, RotateCcw, Flame, Volume2, Plus, Layers, ArrowRight } from 'lucide-react';
import { api, errorMessage } from '@/shared/api/client';
import { useMyWords, useReviewDue, useVocabTopics } from '@/shared/api/learner';
import { useQueryClient } from '@tanstack/react-query';
import type { VocabWord } from '@/shared/types';
import { cn, formatDate } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { Badge, Button, Card, Chip, Input, Modal, PageHeader, ProgressBar, SearchInput, StatCard, EmptyState, Textarea } from '@/shared/components/ui';
import { Img, PHOTOS, unsplash } from '@/shared/components/media/Img';
import { NamedIcon } from '@/shared/components/ui/named-icon';
import { appLocale } from '@/shared/i18n';

const STATUS_META: Record<VocabWord['status'], { label: string; tone: 'amber' | 'sky' | 'emerald' }> = {
  LEARNING: { label: 'Đang học', tone: 'amber' },
  REVIEWING: { label: 'Đang ôn', tone: 'sky' },
  MASTERED: { label: 'Đã thuộc', tone: 'emerald' },
};

/** Ảnh bìa đúng ngữ cảnh cho từng bộ chủ đề TOEIC (theo slug) */
const TOPIC_PHOTO: Record<string, string> = {
  'toeic-topic-office': unsplash('1497366216548-37526070297c', 700),
  'toeic-topic-hr': unsplash('1521737711867-e3b97375f902', 700),
  'toeic-topic-meetings': unsplash('1552664730-d307ca884978', 700),
  'toeic-topic-marketing': unsplash('1460925895917-afdab827c52f', 700),
  'toeic-topic-finance': unsplash('1554224155-6726b3ff858f', 700),
  'toeic-topic-shopping': unsplash('1441986300917-64674bd600d8', 700),
  'toeic-topic-travel': unsplash('1436491865332-7a61a109cc05', 700),
  'toeic-topic-dining': unsplash('1517248135467-4c7edcad34c4', 700),
  'toeic-topic-manufacturing': unsplash('1586528116311-ad8dd3c8310d', 700),
  'toeic-topic-property': unsplash('1503387762-592deb58ef4e', 700),
  'toeic-topic-health': unsplash('1576091160399-112ba8d25d1d', 700),
  'toeic-topic-tech': unsplash('1518770660439-4636190af475', 700),
  'toeic-topic-general': unsplash('1497633762265-9d179a990aa6', 700),
  'vstep-topic-education': unsplash('1541339907198-e08756dedf3f', 700),
  'vstep-topic-environment': unsplash('1441974231531-c6227db76b6e', 700),
  'vstep-topic-health': unsplash('1571019613454-1cb2f99b2d8b', 700),
  'vstep-topic-technology': unsplash('1488590528505-98d2b5aba04b', 700),
  'vstep-topic-work': unsplash('1497366811353-6870744d04b2', 700),
  'vstep-topic-family': unsplash('1511895426328-dc8714191300', 700),
  'vstep-topic-travel': unsplash('1488646953014-85cb44e25828', 700),
  'vstep-topic-culture': unsplash('1528181304800-259b08848526', 700),
  'vstep-topic-media': unsplash('1504711434969-e33886168f5c', 700),
  'vstep-topic-economy': unsplash('1611974789855-9c2a0a7236a3', 700),
  'vstep-topic-city': unsplash('1477959858617-67f85cf4f1df', 700),
  'vstep-topic-leisure': unsplash('1461896836934-ffe607ba8211', 700),
};

/** Ảnh minh hoạ xoay vòng cho bộ từ không có ảnh riêng */
const TOPIC_PHOTOS = [PHOTOS.office, PHOTOS.team, PHOTOS.laptop, PHOTOS.desk, PHOTOS.campus, PHOTOS.library, PHOTOS.books];

/** Nhóm bộ từ trên trang: chủ đề TOEIC · từ đề thi theo Part · bộ khác (VSTEP, giáo viên tạo…) */
const GROUPS: { key: string; title: string; hint: string; match: (slug: string) => boolean }[] = [
  { key: 'topic', title: 'Từ vựng TOEIC theo chủ đề', hint: 'Từ vựng cốt lõi chia theo ngữ cảnh hay gặp trong đề', match: (s) => s.startsWith('toeic-topic-') },
  { key: 'vstep', title: 'Từ vựng VSTEP theo chủ đề', hint: 'Từ B1–C1 cho bài Viết và Nói VSTEP, chia theo đề tài hay gặp', match: (s) => s.startsWith('vstep-topic-') },
  { key: 'part', title: 'Từ vựng trong đề thi theo Part', hint: 'Từ xuất hiện trong các đề TOEIC, gom theo Part 1–7', match: (s) => s.startsWith('toeic-exam-vocab-part-') },
  { key: 'other', title: 'Bộ từ khác', hint: '', match: () => true },
];

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
  const qc = useQueryClient();
  const { data: words = [] } = useMyWords();
  const { data: VOCAB_TOPICS = [] } = useVocabTopics();
  const { data: dueData } = useReviewDue();
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ word: '', meaning: '', example: '' });

  const now = Date.now();
  const due = dueData?.words ?? words.filter((w) => new Date(w.nextReviewAt).getTime() <= now);
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
    setSaving(true);
    api
      .post<VocabWord>('/learner/vocab/custom', { word: form.word.trim(), meaning: form.meaning.trim(), example: form.example.trim() || undefined })
      .then((w) => {
        qc.invalidateQueries({ queryKey: ['learner', 'vocab'] });
        qc.invalidateQueries({ queryKey: ['learner', 'review'] });
        setForm({ word: '', meaning: '', example: '' });
        setAddOpen(false);
        toast.success('Đã thêm từ mới', `"${w.word}" sẽ xuất hiện trong lịch ôn hôm nay.`);
      })
      .catch((e) => toast.error('Chưa thêm được từ', errorMessage(e)))
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <>
            Từ vựng & <span className="mark">Flashcard</span>
          </>
        }
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
        <StatCard label="Đã thuộc" value={mastered.length} icon={<CheckCircle2 />} tone="emerald" hint={`${Math.round((mastered.length / Math.max(1, words.length)) * 100)}% sổ từ`} />
        <StatCard label="Cần ôn hôm nay" value={due.length} icon={<RotateCcw />} tone="amber" hint="Theo lịch SM-2" />
        <StatCard label="Chuỗi ngày" value={user?.streak ?? 0} suffix="ngày" icon={<Flame />} tone="violet" />
      </div>

      {GROUPS.map((g) => {
        const slugOf = (t: (typeof VOCAB_TOPICS)[number]) => (t as typeof t & { slug?: string }).slug ?? '';
        const topics = VOCAB_TOPICS.filter((t) => g.match(slugOf(t)) && !GROUPS.slice(0, GROUPS.indexOf(g)).some((x) => x.match(slugOf(t))));
        if (!topics.length) return null;
        return (
          <section key={g.key} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" /> {g.title}
                </h2>
                {g.hint && <p className="mt-0.5 text-sm text-slate-500">{g.hint}</p>}
              </div>
              <span className="text-xs font-bold text-slate-500">{topics.reduce((a, t) => a + t.total, 0).toLocaleString(appLocale())} từ · {topics.length} bộ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {topics.map((t, i) => {
            const pct = Math.round((t.learned / Math.max(1, t.total)) * 100);
            return (
              <Card key={t.id} hard hover padding="none" className="overflow-hidden animate-fade-up flex flex-col" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="relative h-32">
                  <Img src={TOPIC_PHOTO[slugOf(t)] ?? TOPIC_PHOTOS[i % TOPIC_PHOTOS.length]} alt={t.name} wrapperClass="absolute inset-0" fallbackClass="bg-indigo-200" />
                  <div className="absolute inset-0 bg-slate-900/25" />
                  <span className="absolute top-3 left-3 sticker tilt-1 !py-1 !text-[10px]">
                    <NamedIcon name={t.icon} className="mr-1 inline h-3 w-3 align-[-2px]" />
                    {t.total} từ
                  </span>
                  {pct === 0 && <span className="absolute top-3 right-3 sticker tilt-2 !bg-violet-500 !text-white !py-1 !text-[10px]">Mới</span>}
                  {pct > 0 && (
                    <span className="absolute bottom-3 right-3 font-display text-3xl font-extrabold text-white drop-shadow-[2px_2px_0_#141A2B]">{pct}%</span>
                  )}
                </div>
                <div className="p-4 border-t-2 border-slate-900 flex-1 flex flex-col gap-3">
                  <div>
                    <p className="font-display font-bold text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {t.learned}/{t.total} từ đã học
                    </p>
                  </div>
                  <ProgressBar value={pct} size="sm" tone={t.learned === 0 ? 'slate' : 'indigo'} />
                  <Button to={`/app/vocabulary/flashcards/${(t as typeof t & { slug?: string }).slug ?? t.id}`} size="sm" variant={t.learned === 0 ? 'outline' : 'primary'} fullWidth rightIcon={<ArrowRight className="w-4 h-4" />} className="mt-auto">
                    {t.learned === 0 ? 'Bắt đầu học' : 'Ôn flashcard'}
                  </Button>
                </div>
              </Card>
            );
              })}
            </div>
          </section>
        );
      })}

      <section className="space-y-4">
        <h2 className="font-display font-bold text-slate-900 text-lg">Sổ từ của tôi</h2>
        <Card hard padding="sm" tone="cream">
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
          <Card hard>
            <EmptyState title="Không tìm thấy từ nào" description="Thử từ khoá khác hoặc thêm từ mới vào sổ." />
          </Card>
        ) : (
          <div key={status + search} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.map((w, i) => {
              const isDue = new Date(w.nextReviewAt).getTime() <= now;
              return (
                <Card key={w.id} padding="sm" className={cn('animate-fade-up flex items-start gap-3 border-2', isDue ? 'border-slate-900 bg-amber-50' : 'border-slate-900/10')} style={{ animationDelay: `${i * 40}ms` }}>
                  <button onClick={() => speak(w.word)} className="w-11 h-11 rounded-xl bg-indigo-600 border-2 border-slate-900 text-white flex items-center justify-center shrink-0 shadow-hard-sm hover:-translate-y-0.5 transition" aria-label="Phát âm">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-extrabold text-slate-900 text-lg leading-none">{w.word}</p>
                      {w.ipa && <span className="text-[11px] font-mono text-indigo-700">{w.ipa}</span>}
                      <span className="text-[11px] italic text-slate-500">{w.pos}</span>
                    </div>
                    <p className="text-sm text-slate-800 font-semibold mt-1">{w.meaningVi}</p>
                    {w.example && <p className="text-xs text-slate-500 italic mt-0.5 truncate">"{w.example}"</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge tone={STATUS_META[w.status].tone} size="xs" dot>
                        {STATUS_META[w.status].label}
                      </Badge>
                      <Badge tone="slate" size="xs">
                        {w.topic}
                      </Badge>
                      <span className={cn('text-[10px] ml-auto font-bold', isDue ? 'text-violet-600' : 'text-slate-400')}>Ôn: {isDue ? 'Hôm nay' : formatDate(w.nextReviewAt)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
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
            <Button onClick={addWord} loading={saving}>
              Lưu từ
            </Button>
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
