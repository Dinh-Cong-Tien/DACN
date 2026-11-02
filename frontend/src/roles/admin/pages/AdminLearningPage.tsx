import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { adminApi, useAdminFaqs, useAdminGrammar, useAdminInvalidate, useAdminQuestions, useAdminResources, useAdminVocabTopics, useAdminWords, type AdminFaq, type AdminGrammar, type AdminResource, type AdminVocabTopic, type AdminWord } from '@/shared/api/admin';
import type { QuestionRow } from '@/shared/api/head';
import { partLabel } from '@/shared/constants/staff';
import { Column } from '@/shared/components/ui';
import { CrudEditor, type CrudField, type CrudFilter } from '@/engines';
import { cn, formatNumber } from '@/shared/utils';
import { TPageHead } from '@/roles/teacher/components/TeacherKit';

type Kind = 'grammar' | 'vocab' | 'words' | 'writing' | 'speaking' | 'resources' | 'faq';


/** Cấu hình một loại nội dung cho CRUD Editor engine */
interface LearnConfig<T extends { id: string }> {
  title: string;
  sub: string;
  entityName: string;
  createLabel: string;
  idPrefix: string;
  rows: T[];
  columns: Column<T>[];
  fields: CrudField<T>[];
  searchKeys: (keyof T & string)[];
  filters?: CrudFilter<T>[];
  defaultValues?: Partial<T>;
  /** Đường dẫn trang học viên tương ứng ("Xem như học viên") */
  preview: (row: T) => string;
  loading: boolean;
  create: (v: Partial<T>) => Promise<T>;
  update: (row: T, v: Partial<T>) => Promise<T>;
  remove: (row: T) => Promise<unknown>;
}

const define = <T extends { id: string }>(c: LearnConfig<T>) => c as unknown as LearnConfig<{ id: string }>;

const opts = (xs: string[]) => [...new Set(xs)].map((x) => ({ value: x, label: x }));
const muted = (s: React.ReactNode) => <span className="whitespace-nowrap text-[13px] text-slate-600">{s}</span>;
const num = (n: number) => <span className="tabular-nums">{formatNumber(n)}</span>;


type Data = {
  grammar: AdminGrammar[];
  topics: AdminVocabTopic[];
  words: AdminWord[];
  writing: QuestionRow[];
  speaking: QuestionRow[];
  resources: AdminResource[];
  faqs: AdminFaq[];
  loading: Record<Kind, boolean>;
};

const WRITING_PARTS = [
  { value: 'VSTEP_W1', label: 'VSTEP Task 1 — Letter / Email' },
  { value: 'VSTEP_W2', label: 'VSTEP Task 2 — Essay' },
];
const SPEAKING_PARTS = [
  { value: 'VSTEP_S1', label: 'VSTEP Part 1 — Social Interaction' },
  { value: 'VSTEP_S2', label: 'VSTEP Part 2 — Solution Discussion' },
  { value: 'VSTEP_S3', label: 'VSTEP Part 3 — Topic Development' },
];
const taskLabel = (q: QuestionRow) => `${q.examType} · ${partLabel(q.part)}`;

function buildConfig(d: Data): Record<Kind, LearnConfig<{ id: string }>> {
  const topicName = (id?: string) => d.topics.find((t) => t.id === id)?.name ?? '';
  const grammarCats = opts(d.grammar.map((g) => g.category));
  return {
    grammar: define<AdminGrammar>({
      title: 'Chủ điểm ngữ pháp',
      sub: 'Các chủ điểm học viên học ở mục Ngữ pháp: lý thuyết, ví dụ và bài tập chấm tự động.',
      entityName: 'chủ điểm',
      createLabel: 'Thêm chủ điểm',
      idPrefix: 'g',
      rows: d.grammar,
      loading: d.loading.grammar,
      searchKeys: ['title', 'slug', 'category'],
      filters: [{ key: 'category', label: 'Nhóm', options: grammarCats }],
      defaultValues: { category: d.grammar[0]?.category ?? 'Thì', summary: '' },
      columns: [
        { key: 'title', header: 'Chủ điểm', render: (r) => (
          <div className="min-w-[240px]">
            <p className="font-semibold text-slate-900">{r.title}</p>
            <p className="font-mono text-[11px] text-slate-500">/{r.slug}</p>
          </div>
        ) },
        { key: 'category', header: 'Nhóm', render: (r) => muted(r.category) },
        { key: 'level', header: 'Cấp độ', render: (r) => muted(r.level || '—') },
        { key: 'rules', header: 'Quy tắc', align: 'right', render: (r) => num(r.rules.length) },
        { key: 'questionsCount', header: 'Câu hỏi', align: 'right', render: (r) => num(r.questionsCount) },
      ],
      fields: [
        { key: 'title', label: 'Tên chủ điểm', required: true, colSpan: 2 },
        { key: 'slug', label: 'Đường dẫn (slug)', placeholder: 'thi-hien-tai-don', hint: 'Tự sinh nếu bỏ trống' },
        { key: 'category', label: 'Nhóm', required: true, placeholder: 'Thì, Mệnh đề…' },
        { key: 'level', label: 'Cấp độ', type: 'select', options: opts(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) },
        { key: 'summary', label: 'Tóm tắt', type: 'textarea', colSpan: 2 },
      ],
      preview: (r) => `/app/grammar/${r.slug}`,
      create: (v) => adminApi.createGrammar({ title: v.title, slug: v.slug || undefined, category: v.category, level: v.level || undefined, summary: v.summary ?? '' }),
      update: (r, v) => adminApi.updateGrammar(r.id, { title: v.title, slug: v.slug || undefined, category: v.category, level: v.level || undefined, summary: v.summary ?? '' }),
      remove: (r) => adminApi.deleteGrammar(r.id),
    }),
    vocab: define<AdminVocabTopic>({
      title: 'Bộ từ vựng',
      sub: 'Các bộ flashcard theo chủ đề, học viên ôn theo lịch lặp lại ngắt quãng.',
      entityName: 'bộ từ vựng',
      createLabel: 'Thêm bộ từ',
      idPrefix: 'vt',
      rows: d.topics,
      loading: d.loading.vocab,
      searchKeys: ['name'],
      defaultValues: { icon: '📘' },
      columns: [
        { key: 'name', header: 'Bộ từ vựng', render: (r) => (
          <span className="flex items-center gap-3 font-semibold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg">{r.icon}</span>
            {r.name}
          </span>
        ) },
        { key: 'examType', header: 'Kỳ thi', render: (r) => muted(r.examType ?? 'Chung') },
        { key: 'total', header: 'Số từ', align: 'right', render: (r) => num(r.total) },
      ],
      fields: [
        { key: 'name', label: 'Tên bộ từ', required: true },
        { key: 'icon', label: 'Biểu tượng (emoji)' },
      ],
      preview: (r) => `/app/vocabulary/flashcards/${r.slug ?? r.id}`,
      create: (v) => adminApi.createVocabTopic({ name: v.name, icon: v.icon || undefined }),
      update: (r, v) => adminApi.updateVocabTopic(r.id, { name: v.name, icon: v.icon || undefined }),
      remove: (r) => adminApi.deleteVocabTopic(r.id),
    }),
    words: define<AdminWord>({
      title: 'Từ vựng',
      sub: 'Từng thẻ từ: phiên âm, từ loại, nghĩa và câu ví dụ hiển thị trên flashcard. Bảng hiển thị tối đa 500 từ đầu tiên.',
      entityName: 'từ',
      createLabel: 'Thêm từ',
      idPrefix: 'w',
      rows: d.words,
      loading: d.loading.words,
      searchKeys: ['word', 'meaningVi', 'topic'],
      filters: [{ key: 'topic', label: 'Bộ từ', options: opts(d.topics.map((t) => t.name)) }],
      defaultValues: { pos: 'n', topicId: d.topics[0]?.id },
      columns: [
        { key: 'word', header: 'Từ', render: (r) => (
          <div>
            <p className="font-semibold text-slate-900">{r.word}</p>
            <p className="font-mono text-[11px] text-slate-500">{r.ipa}</p>
          </div>
        ) },
        { key: 'pos', header: 'Từ loại', render: (r) => muted(r.pos) },
        { key: 'meaningVi', header: 'Nghĩa', render: (r) => <span className="text-[13px] text-slate-700">{r.meaningVi}</span> },
        { key: 'example', header: 'Ví dụ', render: (r) => <span className="line-clamp-1 min-w-[220px] text-[13px] italic text-slate-500">{r.example}</span> },
        { key: 'topic', header: 'Bộ từ', render: (r) => muted(r.topic || '—') },
      ],
      fields: [
        { key: 'word', label: 'Từ', required: true },
        { key: 'ipa', label: 'Phiên âm', placeholder: '/ˈwɜːd/' },
        { key: 'pos', label: 'Từ loại', type: 'select', required: true, options: opts(['n', 'v', 'adj', 'adv', 'phr', 'prep', 'conj']) },
        { key: 'topicId', label: 'Bộ từ', type: 'select', options: d.topics.map((t) => ({ value: t.id, label: t.name })) },
        { key: 'meaningVi', label: 'Nghĩa tiếng Việt', required: true, colSpan: 2 },
        { key: 'example', label: 'Câu ví dụ', type: 'textarea', colSpan: 2 },
      ],
      preview: (r) => `/app/vocabulary/flashcards/${d.topics.find((t) => t.id === r.topicId)?.slug ?? ''}`,
      create: (v) => adminApi.createWord({ word: v.word, ipa: v.ipa || undefined, pos: v.pos, topicId: v.topicId || undefined, meaningVi: v.meaningVi, example: v.example || undefined }).then((w) => ({ ...w, topic: w.topic || topicName(w.topicId) })),
      update: (r, v) => adminApi.updateWord(r.id, { word: v.word, ipa: v.ipa || undefined, pos: v.pos, topicId: v.topicId || null, meaningVi: v.meaningVi, example: v.example ?? null }),
      remove: (r) => adminApi.deleteWord(r.id),
    }),
    writing: define<QuestionRow>({
      title: 'Đề Luyện Viết',
      sub: 'Đề Writing học viên làm ở mục Luyện Viết; bài nộp về bàn chấm của giáo viên theo tiêu chí.',
      entityName: 'đề viết',
      createLabel: 'Thêm đề viết',
      idPrefix: 'w',
      rows: d.writing,
      loading: d.loading.writing,
      searchKeys: ['stem', 'part'],
      filters: [{ key: 'examType', label: 'Kỳ thi', options: opts(['TOEIC', 'VSTEP']) }],
      defaultValues: { examType: 'VSTEP', part: 'VSTEP_W2', skill: 'WRITING', type: 'ESSAY' },
      columns: [
        { key: 'part', header: 'Dạng đề', render: (r) => <span className="whitespace-nowrap font-semibold text-slate-900">{taskLabel(r)}</span> },
        { key: 'stem', header: 'Đề bài', render: (r) => <span className="line-clamp-2 min-w-[300px] text-[13px] text-slate-600">{r.stem}</span> },
      ],
      fields: [
        { key: 'part', label: 'Dạng đề', type: 'select', required: true, options: WRITING_PARTS, colSpan: 2 },
        { key: 'stem', label: 'Đề bài', type: 'textarea', required: true, colSpan: 2 },
      ],
      preview: (r) => `/app/writing?task=${r.id}`,
      create: (v) => adminApi.createQuestion({ examType: 'VSTEP', part: v.part, skill: 'WRITING', type: 'ESSAY', stem: v.stem }),
      update: (r, v) => adminApi.updateQuestion(r.id, { part: v.part, stem: v.stem }),
      remove: (r) => adminApi.deleteQuestion(r.id),
    }),
    speaking: define<QuestionRow>({
      title: 'Đề Luyện Nói',
      sub: 'Đề Speaking học viên ghi âm ở mục Luyện Nói; giáo viên chấm theo tiêu chí.',
      entityName: 'đề nói',
      createLabel: 'Thêm đề nói',
      idPrefix: 's',
      rows: d.speaking,
      loading: d.loading.speaking,
      searchKeys: ['stem', 'part'],
      filters: [{ key: 'examType', label: 'Kỳ thi', options: opts(['TOEIC', 'VSTEP']) }],
      defaultValues: { examType: 'VSTEP', part: 'VSTEP_S1', skill: 'SPEAKING', type: 'SPEAKING_RESPONSE' },
      columns: [
        { key: 'part', header: 'Phần thi', render: (r) => <span className="whitespace-nowrap font-semibold text-slate-900">{taskLabel(r)}</span> },
        { key: 'stem', header: 'Đề bài', render: (r) => <span className="line-clamp-2 min-w-[300px] text-[13px] text-slate-600">{r.stem}</span> },
        { key: 'audioUrl', header: 'Audio', align: 'center', render: (r) => muted(r.audioUrl ? 'Có' : '—') },
      ],
      fields: [
        { key: 'part', label: 'Phần thi', type: 'select', required: true, options: SPEAKING_PARTS, colSpan: 2 },
        { key: 'stem', label: 'Đề bài', type: 'textarea', required: true, colSpan: 2 },
      ],
      preview: (r) => `/app/speaking?part=${r.id}`,
      create: (v) => adminApi.createQuestion({ examType: 'VSTEP', part: v.part, skill: 'SPEAKING', type: 'SPEAKING_RESPONSE', stem: v.stem }),
      update: (r, v) => adminApi.updateQuestion(r.id, { part: v.part, stem: v.stem }),
      remove: (r) => adminApi.deleteQuestion(r.id),
    }),
    resources: define<AdminResource>({
      title: 'Tài liệu mở',
      sub: 'Tài liệu tải về ở trang Kho tài liệu của website.',
      entityName: 'tài liệu',
      createLabel: 'Thêm tài liệu',
      idPrefix: 'r',
      rows: d.resources,
      loading: d.loading.resources,
      searchKeys: ['title', 'category'],
      filters: [
        { key: 'type', label: 'Định dạng', options: opts(['PDF', 'DOCX', 'AUDIO', 'VIDEO', 'LINK']) },
        { key: 'category', label: 'Nhóm', options: opts(d.resources.map((r) => r.category).filter(Boolean)) },
      ],
      defaultValues: { type: 'PDF', category: 'TOEIC', pages: 0, description: '' },
      columns: [
        { key: 'title', header: 'Tài liệu', render: (r) => (
          <div className="min-w-[260px]">
            <p className="font-semibold text-slate-900">{r.title}</p>
            <p className="line-clamp-1 text-[12px] text-slate-500">{r.description}</p>
          </div>
        ) },
        { key: 'type', header: 'Định dạng', render: (r) => <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600">{r.type}</span> },
        { key: 'category', header: 'Nhóm', render: (r) => muted(r.category || '—') },
        { key: 'size', header: 'Dung lượng', align: 'right', render: (r) => muted(r.size || '—') },
        { key: 'downloads', header: 'Lượt tải', align: 'right', render: (r) => num(r.downloads) },
      ],
      fields: [
        { key: 'title', label: 'Tên tài liệu', required: true, colSpan: 2 },
        { key: 'type', label: 'Định dạng', type: 'select', options: opts(['PDF', 'DOCX', 'AUDIO', 'VIDEO', 'LINK']) },
        { key: 'category', label: 'Nhóm', placeholder: 'TOEIC, VSTEP…' },
        { key: 'fileUrl', label: 'Đường dẫn tệp / liên kết', colSpan: 2, placeholder: 'https://…' },
        { key: 'pages', label: 'Số trang', type: 'number' },
        { key: 'isVip', label: 'Chỉ dành cho VIP', type: 'toggle' },
        { key: 'description', label: 'Mô tả', type: 'textarea', colSpan: 2 },
      ],
      preview: () => '/resources',
      create: (v) => adminApi.createResource({ title: v.title, type: v.type, category: v.category || undefined, fileUrl: v.fileUrl || undefined, pages: v.pages ? Number(v.pages) : undefined, isVip: !!v.isVip, description: v.description || undefined }),
      update: (r, v) => adminApi.updateResource(r.id, { title: v.title, type: v.type, category: v.category || null, fileUrl: v.fileUrl || null, pages: v.pages ? Number(v.pages) : null, isVip: !!v.isVip, description: v.description ?? null }),
      remove: (r) => adminApi.deleteResource(r.id),
    }),
    faq: define<AdminFaq>({
      title: 'Câu hỏi thường gặp',
      sub: 'Nội dung trang FAQ và gợi ý trả lời nhanh trong khung chat hỗ trợ.',
      entityName: 'câu hỏi',
      createLabel: 'Thêm câu hỏi',
      idPrefix: 'f',
      rows: d.faqs,
      loading: d.loading.faq,
      searchKeys: ['question', 'answer'],
      filters: [{ key: 'category', label: 'Nhóm', options: opts(d.faqs.map((f) => f.category)) }],
      defaultValues: { category: d.faqs[0]?.category ?? 'Chung', showInFaq: true },
      columns: [
        { key: 'question', header: 'Câu hỏi', render: (r) => (
          <div className="min-w-[300px]">
            <p className="font-semibold text-slate-900">{r.question}</p>
            <p className="line-clamp-1 text-[12px] text-slate-500">{r.answer}</p>
          </div>
        ) },
        { key: 'category', header: 'Nhóm', render: (r) => muted(r.category) },
        { key: 'showInChat', header: 'Chat', align: 'center', render: (r) => muted(r.showInChat ? 'Có' : '—') },
      ],
      fields: [
        { key: 'question', label: 'Câu hỏi', required: true, colSpan: 2 },
        { key: 'category', label: 'Nhóm', required: true },
        { key: 'showInChat', label: 'Dùng trả lời trong chat', type: 'toggle' },
        { key: 'answer', label: 'Trả lời', type: 'textarea', required: true, colSpan: 2 },
      ],
      preview: () => '/faq',
      create: (v) => adminApi.createFaq({ question: v.question, answer: v.answer, category: v.category, showInFaq: true, showInChat: !!v.showInChat }),
      update: (r, v) => adminApi.updateFaq(r.id, { question: v.question, answer: v.answer, category: v.category, showInChat: !!v.showInChat }),
      remove: (r) => adminApi.deleteFaq(r.id),
    }),
  };
}

const GROUPS: { label: string; tabs: Kind[] }[] = [
  { label: 'Luyện tập', tabs: ['grammar', 'vocab', 'words'] },
  { label: 'Tự luận', tabs: ['writing', 'speaking'] },
  { label: 'Website', tabs: ['resources', 'faq'] },
];
const TAB_LABEL: Record<Kind, string> = { grammar: 'Ngữ pháp', vocab: 'Bộ từ vựng', words: 'Từ vựng', writing: 'Đề Viết', speaking: 'Đề Nói', resources: 'Tài liệu mở', faq: 'FAQ' };

/** Quản trị nội dung học tập học viên đang dùng: mỗi loại là một cấu hình của CRUD Editor engine */
export const AdminLearningPage: React.FC = () => {
  const { kind = 'grammar' } = useParams();
  const navigate = useNavigate();
  const refresh = useAdminInvalidate();
  const grammar = useAdminGrammar();
  const topics = useAdminVocabTopics();
  const words = useAdminWords({ pageSize: 500 });
  const writing = useAdminQuestions({ type: 'ESSAY', pageSize: 200 });
  const speaking = useAdminQuestions({ type: 'SPEAKING_RESPONSE', pageSize: 200 });
  const resources = useAdminResources();
  const faqs = useAdminFaqs();
  const CONFIG = useMemo(
    () =>
      buildConfig({
        grammar: grammar.data ?? [],
        topics: topics.data ?? [],
        words: words.data?.items ?? [],
        writing: writing.data?.items ?? [],
        speaking: speaking.data?.items ?? [],
        resources: resources.data ?? [],
        faqs: faqs.data ?? [],
        loading: { grammar: grammar.isLoading, vocab: topics.isLoading, words: words.isLoading, writing: writing.isLoading, speaking: speaking.isLoading, resources: resources.isLoading, faq: faqs.isLoading },
      }),
    [grammar.data, topics.data, words.data, writing.data, speaking.data, resources.data, faqs.data, grammar.isLoading, topics.isLoading, words.isLoading, writing.isLoading, speaking.isLoading, resources.isLoading, faqs.isLoading]
  );
  const counts: Record<Kind, number> = { grammar: grammar.data?.length ?? 0, vocab: topics.data?.length ?? 0, words: words.data?.total ?? 0, writing: writing.data?.total ?? 0, speaking: speaking.data?.total ?? 0, resources: resources.data?.length ?? 0, faq: faqs.data?.length ?? 0 };
  const cfg = CONFIG[kind as Kind];
  useDocumentTitle(cfg?.title ?? 'Nội dung học tập');
  if (!cfg) return <Navigate to="/admin/learning/grammar" replace />;

  return (
    <div className="space-y-6">
      <TPageHead crumbs={[{ label: 'Nội dung' }, { label: cfg.title }]} title={cfg.title} sub={cfg.sub} />

      <div className="flex flex-wrap gap-3">
        {GROUPS.map((g) => (
          <div key={g.label} className="max-w-full rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
            <p className="px-2 pb-1 pt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{g.label}</p>
            <div className="flex flex-wrap gap-1" role="tablist">
              {g.tabs.map((t) => (
                <button key={t} type="button" role="tab" aria-selected={kind === t} onClick={() => navigate(`/admin/learning/${t}`)} className={cn('inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors', kind === t ? 'bg-indigo-600 text-white shadow-[0_6px_14px_-8px_rgba(79,70,229,0.8)]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
                  {TAB_LABEL[t]}
                  <span className={cn('text-[11px] tabular-nums', kind === t ? 'text-white/80' : 'text-slate-400')}>{formatNumber(counts[t])}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CrudEditor<{ id: string }>
        key={kind}
        rows={cfg.rows}
        loading={cfg.loading}
        onCreate={async (v) => {
          const r = await cfg.create(v);
          void refresh();
          return r;
        }}
        onUpdate={async (row, v) => {
          const r = await cfg.update(row, v);
          void refresh();
          return r;
        }}
        onDelete={async (row) => {
          await cfg.remove(row);
          void refresh();
        }}
        columns={cfg.columns}
        fields={cfg.fields}
        searchKeys={cfg.searchKeys}
        filters={cfg.filters}
        entityName={cfg.entityName}
        createLabel={cfg.createLabel}
        idPrefix={cfg.idPrefix}
        defaultValues={cfg.defaultValues}
        rowActions={(row) => [{ label: 'Xem như học viên', icon: <ExternalLink />, onClick: () => window.open(cfg.preview(row), '_blank', 'noopener') }]}
      />
    </div>
  );
};
