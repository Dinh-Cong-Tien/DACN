import React, { useMemo, useRef, useState } from 'react';
import { Target, Play, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, ProgressBar, RadarChart } from '@/shared/components/ui';
import { PracticeEngine } from '@/engines';
import { MISTAKE_CAUSE_LABEL } from '@/shared/constants/student';
import { api, errorMessage } from '@/shared/api/client';
import { startAttempt, submitAttempt, useMistakes, useProgress } from '@/shared/api/learner';
import { getCorrectKey } from '@/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import type { IQuestion, MistakeCause } from '@/shared/types';
import { cn } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

const SIZES = [5, 10, 15];
// Ước tính thời gian làm: ~45 giây/câu
const minutesFor = (n: number) => Math.max(1, Math.round(n * 0.75));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const StudentDrillsPage: React.FC = () => {
  useDocumentTitle('Luyện điểm yếu');
  const [size, setSize] = useState(10);
  const [cause, setCause] = useState<MistakeCause | 'ALL'>('ALL');
  const [questions, setQuestions] = useState<IQuestion[] | null>(null);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const { data: allMistakes = [] } = useMistakes({ resolved: false });
  const { data: progress } = useProgress();
  const RADAR_SKILLS = progress?.radar ?? [];
  const SKILL_SCORES = progress?.skillScores ?? [];

  const openMistakes = useMemo(() => allMistakes.filter((m) => cause === 'ALL' || m.cause === cause), [cause, allMistakes]);
  const totalOpen = allMistakes.length;
  const causeRows: { key: MistakeCause | 'ALL'; label: string; count: number }[] = [
    { key: 'ALL', label: 'Tất cả', count: totalOpen },
    ...(Object.keys(MISTAKE_CAUSE_LABEL) as MistakeCause[])
      .map((c) => ({ key: c, label: MISTAKE_CAUSE_LABEL[c].label, count: allMistakes.filter((m) => m.cause === c).length }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count),
  ];
  const weakest = [...SKILL_SCORES].sort((a, b) => a.score - b.score).slice(0, 3);
  // Phiên bổ sung câu cùng dạng (exam_attempts PART_SESSION) + map câu sai → mistakeId để cập nhật SM-2
  const extra = useRef<{ attemptId: string; ids: Set<string> } | null>(null);
  const mistakeOf = useRef(new Map<string, string>());
  const wrong = useRef(new Map<string, string>());

  const start = async () => {
    const chosen = shuffle(openMistakes).slice(0, size);
    const base = chosen.map((m) => m.question);
    mistakeOf.current = new Map(chosen.map((m) => [m.question.id, m.id]));
    wrong.current.clear();
    extra.current = null;
    let pool: IQuestion[] = [];
    const need = size - base.length;
    if (need > 0) {
      // Part yếu nhất (theo dữ liệu thật), mặc định Part 5
      const weakPart = weakest[0]?.skill.startsWith('Part ') ? `PART_${weakest[0].skill.slice(5)}` : 'PART_5';
      setBusy(true);
      try {
        const r = await startAttempt({ parts: [weakPart], questionCount: need });
        pool = r.test.sections.flatMap((s) => s.questions).filter((q) => !mistakeOf.current.has(q.id));
        extra.current = { attemptId: r.attempt.id, ids: new Set(pool.map((q) => q.id)) };
      } catch (e) {
        toast.error('Chưa lấy được câu bổ sung', errorMessage(e));
      } finally {
        setBusy(false);
      }
    }
    const set = [...shuffle(base), ...pool];
    if (!set.length) return toast.info('Chưa có câu để luyện', 'Hãy làm bài luyện tập hoặc thi thử trước.');
    setQuestions(set);
    toast.info('Đã tạo bộ luyện', `${base.length} câu từ Sổ tay lỗi sai + ${pool.length} câu cùng dạng.`);
  };

  const finish = async () => {
    try {
      // Câu từ sổ lỗi sai: ôn SM-2 (đúng 4, sai 1)
      for (const [qid, mid] of mistakeOf.current) await api.post('/learner/review', { mistakeId: mid, quality: wrong.current.has(qid) ? 1 : 4 });
      // Câu bổ sung: nộp lượt luyện để chấm và lưu câu sai mới
      if (extra.current && questions) {
        const ex = extra.current;
        const answers = questions.filter((q) => ex.ids.has(q.id)).map((q) => ({ questionId: q.id, selectedKey: wrong.current.get(q.id) ?? getCorrectKey(q) }));
        await submitAttempt(ex.attemptId, answers);
        extra.current = null;
      }
      ['review', 'mistakes', 'progress', 'attempts'].forEach((k) => qc.invalidateQueries({ queryKey: ['learner', k] }));
    } catch (e) {
      toast.error('Chưa lưu được kết quả luyện', errorMessage(e));
    }
  };

  if (questions) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setQuestions(null)}>
          Tạo bộ khác
        </Button>
        <PracticeEngine
          title="Luyện điểm yếu"
          questions={questions}
          exitTo="/app/drills"
          onMistakeRecorded={(qid, key) => wrong.current.set(qid, key)}
          onFinishPractice={() => void finish()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<Target />}
        title={
          <>
            Luyện <span className="mark-coral mark">điểm yếu</span>
          </>
        }
        description="Tạo bộ câu hỏi bám sát đúng các lỗi bạn hay mắc, bổ sung thêm câu cùng dạng từ ngân hàng để củng cố."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <div className="space-y-5">
          <Card padding="none" className="animate-fade-up overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-slate-900/10">
              <h2 className="font-display text-lg font-bold text-slate-900">Thiết lập bộ luyện</h2>
              <p className="text-sm text-slate-500 mt-0.5">Chọn số câu và nhóm lỗi muốn tập trung</p>
            </div>
            <div className="px-6 py-5 space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Số câu hỏi</p>
                {/* Segmented control: 1 khung, mục chọn nền đặc, không bóng đổ */}
                <div role="radiogroup" className="inline-grid grid-cols-3 rounded-xl border border-slate-900/15 p-1 gap-1">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      role="radio"
                      aria-checked={size === s}
                      onClick={() => setSize(s)}
                      className={cn('min-w-[88px] rounded-lg px-4 py-2 text-left transition-colors', size === s ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100')}>
                      <span className="block text-sm font-bold">{s} câu</span>
                      <span className={cn('block text-[11px]', size === s ? 'text-white/75' : 'text-slate-500')}>{minutesFor(s)} phút</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Nhóm nguyên nhân</p>
                {/* Danh sách chọn 1: nhãn + số câu + thanh tỉ lệ trên tổng lỗi chưa xử lý */}
                <div role="radiogroup" className="rounded-xl border border-slate-900/10 divide-y divide-slate-900/10">
                  {causeRows.map((r) => {
                    const on = cause === r.key;
                    return (
                      <button
                        key={r.key}
                        role="radio"
                        aria-checked={on}
                        onClick={() => setCause(r.key)}
                        className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors first:rounded-t-xl last:rounded-b-xl', on ? 'bg-indigo-600/10' : 'hover:bg-slate-900/[0.04]')}>
                        <span className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0', on ? 'border-indigo-600' : 'border-slate-300')}>
                          {on && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                        </span>
                        <span className={cn('text-sm w-36 shrink-0', on ? 'font-bold text-slate-900' : 'font-medium text-slate-700')}>{r.label}</span>
                        <span className={cn('flex-1 h-1.5 rounded-full bg-slate-900/[0.06] overflow-hidden max-sm:hidden', r.key === 'ALL' && 'invisible')}>
                          <span className="block h-full rounded-full bg-slate-400" style={{ width: `${totalOpen ? (r.count / totalOpen) * 100 : 0}%` }} />
                        </span>
                        <span className="text-sm tabular-nums text-slate-600 w-10 text-right ml-auto">{r.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-900/10 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                <b className="text-slate-900">{size} câu</b> · {Math.min(openMistakes.length, size)} từ sổ lỗi sai
                {size > openMistakes.length && <> · {size - openMistakes.length} câu cùng dạng</>} · khoảng {minutesFor(size)} phút
              </p>
              <Button variant="primary" leftIcon={<Play className="w-4 h-4" />} onClick={() => void start()} loading={busy}>
                Bắt đầu luyện
              </Button>
            </div>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <CardHeader title="Câu sẽ xuất hiện" subtitle={`${openMistakes.length} câu đang chờ luyện lại`} />
            <div className="space-y-2">
              {openMistakes.slice(0, 6).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-900/10 hover:bg-slate-900/[0.03] transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="font-display text-sm font-extrabold text-slate-300 w-6">{String(i + 1).padStart(2, '0')}</span>
                  <Badge tone={MISTAKE_CAUSE_LABEL[m.cause].tone} size="xs">
                    {MISTAKE_CAUSE_LABEL[m.cause].label}
                  </Badge>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1 flex-1">{m.question.stem}</p>
                  <span className="text-[10px] font-extrabold text-slate-500">x{m.count}</span>
                </div>
              ))}
              {openMistakes.length === 0 && <p className="text-sm text-slate-500 text-center py-3 font-semibold">Không có câu sai trong nhóm này — bộ luyện sẽ lấy câu cùng dạng từ ngân hàng.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="flex flex-col items-center animate-slide-in-right">
            <div className="self-stretch">
              <h3 className="font-display font-bold text-slate-900">Bản đồ năng lực</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tính từ các bài bạn đã làm</p>
            </div>
            <RadarChart data={RADAR_SKILLS} size={230} tone="violet" />
            {RADAR_SKILLS.some((s) => s.hasData === false) && <p className="self-stretch text-xs text-slate-500 border-t border-slate-900/10 pt-3">Chưa có dữ liệu: {RADAR_SKILLS.filter((s) => s.hasData === false).map((s) => s.label).join(', ')}</p>}
          </Card>
          <Card className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <CardHeader title="3 Part yếu nhất" />
            <div className="space-y-3">
              {weakest.length === 0 && <p className="text-xs text-slate-500">Chưa có dữ liệu luyện tập.</p>}
              {weakest.map((s) => (
                <ProgressBar key={s.skill} value={s.score} label={s.skill} showValue size="sm" tone="violet" />
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-semibold">Mục tiêu: đưa mỗi Part lên ≥ 75% trước ngày thi.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
