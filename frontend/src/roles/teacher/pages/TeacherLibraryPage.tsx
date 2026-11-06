import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { useLibCourses, useLibGrammar, useLibSpeaking, useLibTests, useLibVocab, useLibWriting } from '@/shared/api/teacher';
import { partName, promptName } from '@/shared/constants/teacher';
import type { AssignmentTarget, ExamType } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Panel, TBtn, TPageHead, tbl } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';
import { useDictationList } from '@/shared/api/learner';
import { appLocale } from '@/shared/i18n';
import { CourseLessonList } from '../components/CourseLessonList';

type Kind = 'courses' | 'tests' | 'practice';

const COPY: Record<Kind, { title: string; sub: string }> = {
  courses: { title: 'Khoá học', sub: 'Đúng các khoá học viên đang học, chia 3 mục TOEIC, VSTEP, Tiếng Anh THPT. Mỗi khoá gồm bài giảng và các lớp học khoá đó: mở lớp cho khoá, tích chọn bài để giao cho lớp.' },
  tests: { title: 'Đề thi thử, Viết & Nói', sub: 'Đề trắc nghiệm (thi thử TOEIC, VSTEP) chấm tự động và đề tự luận (Viết, Nói) nộp về bàn chấm của giáo viên.' },
  practice: { title: 'Ngữ pháp, Từ vựng & Chép chính tả', sub: 'Chủ điểm ngữ pháp kèm bài tập chấm tự động, bộ flashcard từ vựng và bài nghe chép chính tả.' },
};

/** Đường dẫn cũ (trước khi gộp mục) → trang mới */
const LEGACY: Record<string, string> = {
  grammar: '/teacher/library/practice?tab=grammar',
  vocabulary: '/teacher/library/practice?tab=vocab',
  'writing-speaking': '/teacher/library/tests?tab=writing',
};

/** Thanh tab có nhóm: mỗi nhóm một nhãn nhỏ, các tab trong nhóm đứng cạnh nhau */
const GroupTabs: React.FC<{ groups: { label: string; tabs: { key: string; label: string; count?: number }[] }[]; value: string; onChange: (k: string) => void }> = ({ groups, value, onChange }) => (
  <div className="flex flex-wrap gap-3">
    {groups.map((g) => (
      <div key={g.label} className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
        <p className="px-2 pb-1 pt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{g.label}</p>
        <div className="flex gap-1" role="tablist">
          {g.tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)} className={cn('inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors', value === t.key ? 'bg-indigo-600 text-white shadow-[0_6px_14px_-8px_rgba(79,70,229,0.8)]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
              {t.label}
              {t.count !== undefined && <span className={cn('text-[11px] tabular-nums', value === t.key ? 'text-white/80' : 'text-slate-400')}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/** Mục chính · nhóm của khoá (TOEIC / VSTEP / Tiếng Anh THPT) */
const TRACK_NAME: Record<string, string> = { TOEIC: 'TOEIC', VSTEP: 'VSTEP', THPT: 'Tiếng Anh THPT' };
const trackOf = (c: { track?: string; trackGroup?: string }) => [c.track && TRACK_NAME[c.track], c.trackGroup].filter(Boolean).join(' · ') || 'Chưa xếp mục';

/** Trạng thái tải chung cho từng khối dữ liệu thư viện */
const QueryGate: React.FC<{ q: { isLoading: boolean; error: unknown; refetch: () => unknown }; children: React.ReactNode }> = ({ q, children }) =>
  q.isLoading ? <TLoading /> : q.error ? <TError error={q.error} onRetry={() => q.refetch()} /> : <>{children}</>;

const PreviewLink: React.FC<{ href: string }> = ({ href }) => (
  <a href={href} target="_blank" rel="noreferrer" title="Xem như học viên" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
    <ExternalLink className="h-4 w-4" />
  </a>
);

/** undefined = chế độ xem/thẩm định (trưởng bộ môn): ẩn mọi nút giao bài */
type Assign = ((t: AssignmentTarget) => void) | undefined;

/** Kho học liệu của giáo viên: cùng nội dung học viên đang dùng, mỗi mục có "Xem như học viên" và "Giao bài" */
export interface LibraryPageProps {
  /** Đường dẫn gốc của kho, vd. /teacher/library, /head/library */
  base?: string;
  /** false: chế độ thẩm định (trưởng bộ môn), chỉ xem như học viên, không giao bài */
  canAssign?: boolean;
  /** Ghi đè tiêu đề / mô tả từng mục */
  copy?: Partial<Record<Kind, { title: string; sub: string }>>;
  eyebrow?: string;
}

export const TeacherLibraryPage: React.FC<LibraryPageProps> = ({ base = '/teacher/library', canAssign = true, copy: copyOverride, eyebrow: eyebrowProp }) => {
  const { kind = 'courses' } = useParams();
  const [params] = useSearchParams();
  // nhãn khớp menu: Khoá học › Khoá học TOEIC; Luyện tập › …
  const eyebrow = eyebrowProp ?? (kind === 'courses' ? 'Khoá học' : 'Luyện tập');
  const trackTitle = kind === 'courses' ? ({ toeic: 'Khoá học TOEIC', vstep: 'Khoá học VSTEP', thpt: 'Tiếng Anh THPT' } as Record<string, string>)[params.get('muc') ?? ''] : undefined;
  const copy = copyOverride?.[kind as Kind] ?? COPY[kind as Kind];
  useDocumentTitle(copy?.title ?? 'Học liệu');
  const navigate = useNavigate();
  if (LEGACY[kind]) return <Navigate to={LEGACY[kind].replace('/teacher/library', base)} replace />;
  // giáo viên: khoá học (kèm các lớp của khoá) ở trang Khoá học & Lớp
  if (kind === 'courses' && base.endsWith('/library')) return <Navigate to={`${base.replace(/\/library$/, '/courses')}${window.location.search}`} replace />;
  if (!copy) return <Navigate to={`${base}/courses`} replace />;

  const assign: Assign = canAssign ? (target) => navigate('/teacher/assignments', { state: { assign: target } }) : undefined;

  return (
    <div className="space-y-6">
      <TPageHead crumbs={[{ label: eyebrow }, { label: trackTitle ?? copy.title }]} title={trackTitle ?? copy.title} sub={copy.sub} />
      {kind === 'courses' && <CoursesView assign={assign} />}
      {kind === 'tests' && <TestsView assign={assign} />}
      {kind === 'practice' && <PracticeView assign={assign} />}
    </div>
  );
};

/** Ngữ pháp & Từ vựng: hai tab, tab Từ vựng lọc thêm theo kỳ thi */
const PracticeView: React.FC<{ assign: Assign }> = ({ assign }) => {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'vocab' ? 'vocab' : params.get('tab') === 'dictation' ? 'dictation' : 'grammar';
  const vocabExam = params.get('exam');
  const grammarQ = useLibGrammar();
  const vocabQ = useLibVocab();
  const dictationQ = useDictationList();
  const grammarList = grammarQ.data ?? [];
  const allVocab = vocabQ.data ?? [];
  const vocab = allVocab.filter((v) => !vocabExam || (v.examType ?? 'TOEIC') === vocabExam);
  return (
    <div className="space-y-5">
      <GroupTabs
        value={tab === 'vocab' ? `vocab-${vocabExam ?? 'all'}` : tab}
        onChange={(k) => setParams(k === 'grammar' || k === 'dictation' ? { tab: k } : k === 'vocab-all' ? { tab: 'vocab' } : { tab: 'vocab', exam: k.slice(6) }, { replace: true })}
        groups={[
          { label: 'Ngữ pháp', tabs: [{ key: 'grammar', label: 'Chủ điểm ngữ pháp', count: grammarList.length }] },
          {
            label: 'Từ vựng',
            tabs: [
              { key: 'vocab-all', label: 'Tất cả bộ từ', count: allVocab.length },
              { key: 'vocab-TOEIC', label: 'TOEIC' },
              { key: 'vocab-VSTEP', label: 'VSTEP' },
            ],
          },
          { label: 'Nghe', tabs: [{ key: 'dictation', label: 'Chép chính tả', count: dictationQ.data?.length }] },
        ]}
      />
      {tab === 'dictation' ? (
        <QueryGate q={dictationQ}>
          <Panel title="Bài chép chính tả" sub="Học viên nghe và chép từng câu; điểm là % chép đúng, chấm tự động" flush>
            <div className="overflow-x-auto">
              <table className={tbl.table}>
                <thead className={tbl.thead}>
                  <tr>
                    <th className={tbl.th}>Bài nghe</th>
                    <th className={tbl.th}>Mức độ</th>
                    <th className={cn(tbl.th, 'text-right')}>Số câu</th>
                    <th className={tbl.th} />
                  </tr>
                </thead>
                <tbody>
                  {(dictationQ.data ?? []).map((d) => (
                    <tr key={d.id} className={tbl.tr}>
                      <td className={cn(tbl.td, 'font-medium text-slate-900')}>{d.title}</td>
                      <td className={cn(tbl.td, 'text-slate-600')}>{d.level ?? '—'}</td>
                      <td className={cn(tbl.td, 'text-right tabular-nums')}>{d.segments?.length ?? '—'}</td>
                      <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                        <PreviewLink href={`/app/dictation?passage=${d.id}`} />
                        {assign && (
                          <TBtn size="sm" onClick={() => assign({ kind: 'DICTATION', passageId: d.id })}>
                            Giao bài
                          </TBtn>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </QueryGate>
      ) : tab === 'grammar' ? (
        <QueryGate q={grammarQ}>
        <Panel title="Chủ điểm ngữ pháp" sub="Học viên làm bài tập sau mỗi chủ điểm, chấm tự động" flush>
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Chủ điểm</th>
                  <th className={tbl.th}>Nhóm</th>
                  <th className={tbl.th}>Trình độ</th>
                  <th className={cn(tbl.th, 'text-right')}>Số câu</th>
                  <th className={cn(tbl.th, 'text-right')}>Đã giao</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {grammarList.map((g) => (
                  <tr key={g.id} className={tbl.tr}>
                    <td className={cn(tbl.td, 'min-w-[280px]')}>
                      <p className="font-medium text-slate-900">{g.title}</p>
                      <p className="line-clamp-1 text-[12px] text-slate-500">{g.summary}</p>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{g.category}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{g.level ?? '—'}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{g.questionsCount || '—'}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{g.usedCount} lần</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                      <PreviewLink href={`/app/grammar/${g.slug}`} />
                      {assign && (
                        <TBtn size="sm" onClick={() => assign({ kind: 'GRAMMAR', slug: g.slug })}>
                          Giao bài
                        </TBtn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        </QueryGate>
      ) : (
        <QueryGate q={vocabQ}>
        <Panel title="Bộ flashcard từ vựng" sub="Học viên ôn theo lịch ngắt quãng, giáo viên theo dõi số từ đã thuộc" flush>
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Bộ từ vựng</th>
                  <th className={tbl.th}>Dùng cho</th>
                  <th className={cn(tbl.th, 'text-right')}>Số từ</th>
                  <th className={cn(tbl.th, 'text-right')}>Đã giao</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {vocab.map((v) => (
                  <tr key={v.id} className={tbl.tr}>
                    <td className={cn(tbl.td, 'font-medium text-slate-900')}>{v.name}</td>
                    <td className={cn(tbl.td, 'text-slate-600')}>{v.examType ?? 'Chung'}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{v.wordsCount}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{v.usedCount} lần</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                      <PreviewLink href={`/app/vocabulary/flashcards/${v.slug}`} />
                      {assign && (
                        <TBtn size="sm" onClick={() => assign({ kind: 'VOCAB', topicId: v.slug })}>
                          Giao bài
                        </TBtn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        </QueryGate>
      )}
    </div>
  );
};

/** Đề tự luận Viết / Nói */
const EssayList: React.FC<{ kind: 'writing' | 'speaking'; assign: Assign }> = ({ kind, assign }) => {
  const writingQ = useLibWriting();
  const speakingQ = useLibSpeaking();
  const q = kind === 'writing' ? writingQ : speakingQ;
  const [exam, setExam] = useState<ExamType | 'ALL'>('ALL');
  const [limit, setLimit] = useState(30);
  const source = (q.data ?? []).filter((p) => exam === 'ALL' || p.examType === exam);
  const rows = source.slice(0, limit).map((p) => {
    const cfg = p.taskConfig ?? {};
    const minutes = cfg.minutes ?? (cfg.responseSec ? Math.max(1, Math.round(cfg.responseSec / 60)) : undefined);
    const meta = [p.examType, minutes ? `${minutes} phút` : '', cfg.minWords ? `tối thiểu ${cfg.minWords} từ` : '', p.usedCount ? `đã giao ${p.usedCount} lần` : ''].filter(Boolean).join(' · ');
    return kind === 'writing'
      ? { id: p.id, name: promptName(p, 'WRITING'), meta, prompt: p.prompt, href: `/app/writing?task=${p.id}`, target: { kind: 'WRITING', taskId: p.id } as AssignmentTarget }
      : { id: p.id, name: promptName(p, 'SPEAKING'), meta, prompt: p.prompt, href: `/app/speaking?part=${p.id}`, target: { kind: 'SPEAKING', partId: p.id } as AssignmentTarget };
  });
  return (
    <QueryGate q={q}>
    <Panel
      title={kind === 'writing' ? 'Đề Viết' : 'Đề Nói'}
      sub={`${source.length} đề · bài nộp về Bàn chấm bài, chấm theo tiêu chí, thang 10`}
      action={
        <select value={exam} onChange={(e) => (setExam(e.target.value as ExamType | 'ALL'), setLimit(30))} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[13px] text-slate-700" aria-label="Lọc theo kỳ thi">
          <option value="ALL">Tất cả</option>
          <option value="TOEIC">TOEIC</option>
          <option value="VSTEP">VSTEP</option>
        </select>
      }
      flush
    >
      {rows.length === 0 && <TEmpty title="Chưa có đề nào" />}
      <ul className="divide-y divide-slate-100">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">
                {r.name} <span className="font-normal text-slate-500">· {r.meta}</span>
              </p>
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600">{r.prompt}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <PreviewLink href={r.href} />
              {assign && (
                <TBtn size="sm" onClick={() => assign(r.target)}>
                  Giao bài
                </TBtn>
              )}
            </div>
          </li>
        ))}
      </ul>
      {source.length > limit && (
        <div className="border-t border-slate-100 px-5 py-3 text-center">
          <TBtn size="sm" variant="ghost" onClick={() => setLimit((n) => n + 30)}>
            Xem thêm {Math.min(30, source.length - limit)} đề
          </TBtn>
        </div>
      )}
    </Panel>
    </QueryGate>
  );
};

const CoursesView: React.FC<{ assign: Assign }> = ({ assign }) => {
  const me = useAuthStore((s) => s.user?.fullName);
  const [params, setParams] = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(params.get('open'));
  useEffect(() => {
    const id = params.get('open');
    setOpenId(id);
    if (id) requestAnimationFrame(() => document.getElementById(`course-${id}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }, [params]);
  const [picked, setPicked] = useState<string[]>([]);
  const coursesQ = useLibCourses();
  const all = coursesQ.data ?? [];
  // lọc theo 3 mục chính giống trang Khoá học của học viên (?muc=)
  const track = params.get('muc')?.toUpperCase();
  const courses = all.filter((c) => !track || c.track === track);
  const count = (t: string) => all.filter((c) => c.track === t).length;

  return (
    <QueryGate q={coursesQ}>
    <div className="space-y-5">
    <GroupTabs
      value={track ?? 'all'}
      onChange={(k) => setParams(k === 'all' ? {} : { muc: k.toLowerCase() }, { replace: true })}
      groups={[{ label: 'Mục khoá học', tabs: [{ key: 'all', label: 'Tất cả', count: all.length }, ...Object.entries(TRACK_NAME).map(([key, label]) => ({ key, label, count: count(key) }))] }]}
    />
    <Panel flush>
      {courses.length === 0 && <TEmpty title="Chưa có khoá học nào được xuất bản" />}
      <div className="overflow-x-auto">
        <table className={tbl.table}>
          <thead className={tbl.thead}>
            <tr>
              <th className={tbl.th}>Khoá học</th>
              <th className={tbl.th}>Nhóm</th>
              <th className={tbl.th}>Trình độ</th>
              <th className={cn(tbl.th, 'text-right')}>Số bài</th>
              <th className={cn(tbl.th, 'text-right')}>Học viên</th>
              <th className={tbl.th}>Giáo viên phụ trách</th>
              <th className={tbl.th} />
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const open = openId === c.id;
              const lessons = c.sections.flatMap((s) => s.lessons);
              return (
                <React.Fragment key={c.id}>
                  <tr id={`course-${c.id}`} className={cn(tbl.tr, 'cursor-pointer scroll-mt-24', open && 'bg-slate-50')} onClick={() => (setOpenId(open ? null : c.id), setPicked([]))}>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2">
                        {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                        <span className="font-medium text-slate-900">{c.title}</span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{trackOf(c)}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{c.level ?? '—'}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.lessonsCount}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.studentsCount.toLocaleString(appLocale())}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>
                      {c.teacherName ?? '—'}
                      {c.teacherName && c.teacherName === me && <span className="ml-1.5 text-[12px] text-indigo-700">(bạn)</span>}
                    </td>
                    <td className={cn(tbl.td, 'text-right')} onClick={(e) => e.stopPropagation()}>
                      <PreviewLink href={`/courses/${c.slug}`} />
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={7} className="border-b border-slate-200 bg-slate-50/60 px-4 pb-4 pt-1">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[13px] text-slate-500">{assign ? 'Tích chọn bài rồi giao cho lớp. Học viên học xong và đạt bài tập sau bài thì bài giao tự chấm điểm.' : `${lessons.length} bài theo đúng thứ tự học viên học. Mỗi bài có bài tập sau bài, học viên đạt điểm yêu cầu mới mở bài tiếp.`}</p>
                          {assign && (
                            <TBtn size="sm" variant="primary" disabled={!picked.length} onClick={() => assign({ kind: 'LESSON', courseId: c.slug, lessonIds: lessons.filter((l) => picked.includes(l.id)).map((l) => l.id) })}>
                              Giao {picked.length || ''} bài đã chọn
                            </TBtn>
                          )}
                        </div>
                        <CourseLessonList course={c} picked={picked} onToggle={assign ? (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])) : undefined} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
    </div>
    </QueryGate>
  );
};

const TestsView: React.FC<{ assign: Assign }> = ({ assign }) => {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab') ?? params.get('exam');
  const tab = raw === 'VSTEP' || raw === 'writing' || raw === 'speaking' ? raw : 'TOEIC';
  const exam: ExamType = tab === 'VSTEP' ? 'VSTEP' : 'TOEIC';
  const testsQ = useLibTests();
  const writingQ = useLibWriting();
  const speakingQ = useLibSpeaking();
  const all = testsQ.data ?? [];
  const tests = all.filter((t) => t.examType === exam);
  return (
    <div className="space-y-5">
      <GroupTabs
        value={tab}
        onChange={(k) => setParams({ tab: k }, { replace: true })}
        groups={[
          {
            label: 'Đề trắc nghiệm · chấm tự động',
            tabs: [
              { key: 'TOEIC', label: 'Thi thử TOEIC', count: all.filter((t) => t.examType === 'TOEIC').length },
              { key: 'VSTEP', label: 'Thi thử VSTEP', count: all.filter((t) => t.examType === 'VSTEP').length },
            ],
          },
          {
            label: 'Đề tự luận · giáo viên chấm',
            tabs: [
              { key: 'writing', label: 'Đề Viết', count: writingQ.data?.length },
              { key: 'speaking', label: 'Đề Nói', count: speakingQ.data?.length },
            ],
          },
        ]}
      />
      {tab === 'writing' || tab === 'speaking' ? (
        <EssayList kind={tab} assign={assign} />
      ) : (
      <QueryGate q={testsQ}>
      <Panel title={`Đề thi thử ${exam}`} sub="Giao full đề hoặc chọn Part và đặt thời gian khi giao" flush>
        {tests.length === 0 && <TEmpty title={`Chưa có đề ${exam} nào được xuất bản`} />}
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Đề thi</th>
                <th className={tbl.th}>Phần thi</th>
                <th className={tbl.th}>Trình độ</th>
                <th className={cn(tbl.th, 'text-right')}>Câu</th>
                <th className={cn(tbl.th, 'text-right')}>Phút</th>
                <th className={cn(tbl.th, 'text-right')}>Lượt làm</th>
                <th className={tbl.th} />
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} className={tbl.tr}>
                  <td className={cn(tbl.td, 'min-w-[240px]')}>
                    <p className="font-medium text-slate-900">{t.title}</p>
                    <p className="text-[12px] text-slate-500">
                      {t.year ? `${t.year} · ` : ''}
                      {t.isFree ? 'Miễn phí cho học viên' : 'Gói VIP'} · đã giao {t.usedCount} lần
                    </p>
                  </td>
                  <td className={cn(tbl.td, 'max-w-[240px] text-slate-600')}>{t.parts.map((p) => partName(p.id)).join(', ')}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{t.level ?? '—'}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{t.totalQuestions}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{t.durationMin}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{t.attemptsCount.toLocaleString(appLocale())}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                    <PreviewLink href={`/app/mock-tests/${t.slug}`} />
                    {assign && (
                      <TBtn size="sm" onClick={() => assign({ kind: 'EXAM', testId: t.slug, setup: { mode: 'FULL', parts: t.parts.map((p) => p.id), minutes: t.durationMin } })}>
                        Giao bài
                      </TBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      </QueryGate>
      )}
    </div>
  );
};
