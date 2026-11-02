import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { FAQS, GRAMMAR_TOPICS, MOCK_VOCAB, RESOURCES, VOCAB_TOPICS, VSTEP_SPEAKING_PARTS, VSTEP_WRITING_TASKS } from '@/shared/mocks';
import type { FaqItem, GrammarTopic, ResourceDoc, VocabTopic, VocabWord } from '@/shared/types';
import { Column } from '@/shared/components/ui';
import { CrudEditor, type CrudField, type CrudFilter } from '@/engines';
import { cn, formatNumber } from '@/shared/utils';
import { TPageHead } from '@/roles/teacher/components/TeacherKit';

type Kind = 'grammar' | 'vocab' | 'words' | 'writing' | 'speaking' | 'resources' | 'faq';

type WritingTask = (typeof VSTEP_WRITING_TASKS)[number];
type SpeakingPart = (typeof VSTEP_SPEAKING_PARTS)[number];

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
}

const define = <T extends { id: string }>(c: LearnConfig<T>) => c as unknown as LearnConfig<{ id: string }>;

const opts = (xs: string[]) => [...new Set(xs)].map((x) => ({ value: x, label: x }));
const topicOfWord = (w: VocabWord) => VOCAB_TOPICS.find((t) => t.name === w.topic)?.id;
const muted = (s: React.ReactNode) => <span className="whitespace-nowrap text-[13px] text-slate-600">{s}</span>;
const num = (n: number) => <span className="tabular-nums">{formatNumber(n)}</span>;

const CONFIG: Record<Kind, LearnConfig<{ id: string }>> = {
  grammar: define<GrammarTopic>({
    title: 'Chủ điểm ngữ pháp',
    sub: 'Các chủ điểm học viên học ở mục Ngữ pháp: lý thuyết, ví dụ và bài tập chấm tự động.',
    entityName: 'chủ điểm',
    createLabel: 'Thêm chủ điểm',
    idPrefix: 'g',
    rows: GRAMMAR_TOPICS,
    searchKeys: ['title', 'slug', 'category'],
    filters: [{ key: 'category', label: 'Nhóm', options: opts(GRAMMAR_TOPICS.map((g) => g.category)) }],
    defaultValues: { level: 'B1', category: GRAMMAR_TOPICS[0].category, questionsCount: 0, progress: 0, rules: [], summary: '' },
    columns: [
      { key: 'title', header: 'Chủ điểm', render: (r) => (
        <div className="min-w-[240px]">
          <p className="font-semibold text-slate-900">{r.title}</p>
          <p className="font-mono text-[11px] text-slate-500">/{r.slug}</p>
        </div>
      ) },
      { key: 'category', header: 'Nhóm', render: (r) => muted(r.category) },
      { key: 'level', header: 'Cấp độ', render: (r) => muted(r.level) },
      { key: 'rules', header: 'Quy tắc', align: 'right', render: (r) => num(r.rules.length) },
      { key: 'questionsCount', header: 'Câu hỏi', align: 'right', render: (r) => num(r.questionsCount) },
    ],
    fields: [
      { key: 'title', label: 'Tên chủ điểm', required: true, colSpan: 2 },
      { key: 'slug', label: 'Đường dẫn (slug)', required: true, placeholder: 'thi-hien-tai-don' },
      { key: 'category', label: 'Nhóm', type: 'select', options: opts(GRAMMAR_TOPICS.map((g) => g.category)) },
      { key: 'level', label: 'Cấp độ', placeholder: 'A2–B1' },
      { key: 'questionsCount', label: 'Số câu bài tập', type: 'number' },
      { key: 'summary', label: 'Tóm tắt', type: 'textarea', colSpan: 2 },
    ],
    preview: (r) => `/app/grammar/${r.slug}`,
  }),
  vocab: define<VocabTopic>({
    title: 'Bộ từ vựng',
    sub: 'Các bộ flashcard theo chủ đề, học viên ôn theo lịch lặp lại ngắt quãng.',
    entityName: 'bộ từ vựng',
    createLabel: 'Thêm bộ từ',
    idPrefix: 'vt',
    rows: VOCAB_TOPICS,
    searchKeys: ['name'],
    defaultValues: { icon: '📘', total: 0, learned: 0, gradient: 'from-indigo-500 to-violet-500' },
    columns: [
      { key: 'name', header: 'Bộ từ vựng', render: (r) => (
        <span className="flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg">{r.icon}</span>
          {r.name}
        </span>
      ) },
      { key: 'total', header: 'Số từ', align: 'right', render: (r) => num(r.total) },
      { key: 'words', header: 'Từ mẫu đã nhập', align: 'right', render: (r) => num(MOCK_VOCAB.filter((w) => w.topic === r.name).length) },
    ],
    fields: [
      { key: 'name', label: 'Tên bộ từ', required: true },
      { key: 'icon', label: 'Biểu tượng (emoji)' },
      { key: 'total', label: 'Số từ', type: 'number' },
    ],
    preview: (r) => `/app/vocabulary/flashcards/${r.id}`,
  }),
  words: define<VocabWord>({
    title: 'Từ vựng',
    sub: 'Từng thẻ từ: phiên âm, từ loại, nghĩa và câu ví dụ hiển thị trên flashcard.',
    entityName: 'từ',
    createLabel: 'Thêm từ',
    idPrefix: 'w',
    rows: MOCK_VOCAB,
    searchKeys: ['word', 'meaningVi', 'topic'],
    filters: [{ key: 'topic', label: 'Bộ từ', options: opts(VOCAB_TOPICS.map((t) => t.name)) }],
    defaultValues: { pos: 'noun', topic: VOCAB_TOPICS[0].name, status: 'LEARNING', nextReviewAt: new Date().toISOString(), easeFactor: 2.5, intervalDays: 0, repetitions: 0 },
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
      { key: 'topic', header: 'Bộ từ', render: (r) => muted(r.topic) },
    ],
    fields: [
      { key: 'word', label: 'Từ', required: true },
      { key: 'ipa', label: 'Phiên âm', placeholder: '/ˈwɜːd/' },
      { key: 'pos', label: 'Từ loại', type: 'select', options: opts(['noun', 'verb', 'adjective', 'adverb', 'phrase']) },
      { key: 'topic', label: 'Bộ từ', type: 'select', options: opts(VOCAB_TOPICS.map((t) => t.name)) },
      { key: 'meaningVi', label: 'Nghĩa tiếng Việt', required: true, colSpan: 2 },
      { key: 'example', label: 'Câu ví dụ', type: 'textarea', colSpan: 2 },
    ],
    preview: (r) => `/app/vocabulary/flashcards/${topicOfWord(r) ?? ''}`,
  }),
  writing: define<WritingTask>({
    title: 'Đề Luyện Viết',
    sub: 'Đề VSTEP Writing học viên làm ở mục Luyện Viết; bài nộp về bàn chấm của giáo viên theo 4 tiêu chí.',
    entityName: 'đề viết',
    createLabel: 'Thêm đề viết',
    idPrefix: 'vs-w',
    rows: VSTEP_WRITING_TASKS,
    searchKeys: ['task', 'prompt'],
    defaultValues: { task: 'Task 2 — Essay', minutes: 40, minWords: 250 },
    columns: [
      { key: 'task', header: 'Dạng đề', render: (r) => <span className="whitespace-nowrap font-semibold text-slate-900">{r.task}</span> },
      { key: 'prompt', header: 'Đề bài', render: (r) => <span className="line-clamp-2 min-w-[300px] text-[13px] text-slate-600">{r.prompt}</span> },
      { key: 'minutes', header: 'Phút', align: 'right', render: (r) => num(r.minutes) },
      { key: 'minWords', header: 'Số từ tối thiểu', align: 'right', render: (r) => num(r.minWords) },
    ],
    fields: [
      { key: 'task', label: 'Dạng đề', type: 'select', options: opts(['Task 1 — Letter / Email', 'Task 2 — Essay']), colSpan: 2 },
      { key: 'minutes', label: 'Thời gian (phút)', type: 'number' },
      { key: 'minWords', label: 'Số từ tối thiểu', type: 'number' },
      { key: 'prompt', label: 'Đề bài', type: 'textarea', required: true, colSpan: 2 },
    ],
    preview: (r) => `/app/writing?task=${r.id}`,
  }),
  speaking: define<SpeakingPart>({
    title: 'Đề Luyện Nói',
    sub: 'Đề VSTEP Speaking 3 phần học viên ghi âm ở mục Luyện Nói; giáo viên chấm theo 4 tiêu chí.',
    entityName: 'đề nói',
    createLabel: 'Thêm đề nói',
    idPrefix: 'vs-s',
    rows: VSTEP_SPEAKING_PARTS,
    searchKeys: ['part', 'prompt'],
    defaultValues: { part: 'Part 1 — Social Interaction', minutes: 3 },
    columns: [
      { key: 'part', header: 'Phần thi', render: (r) => <span className="whitespace-nowrap font-semibold text-slate-900">{r.part}</span> },
      { key: 'prompt', header: 'Đề bài', render: (r) => <span className="line-clamp-2 min-w-[300px] text-[13px] text-slate-600">{r.prompt}</span> },
      { key: 'minutes', header: 'Phút', align: 'right', render: (r) => num(r.minutes) },
    ],
    fields: [
      { key: 'part', label: 'Phần thi', type: 'select', options: opts(VSTEP_SPEAKING_PARTS.map((p) => p.part)) },
      { key: 'minutes', label: 'Thời gian (phút)', type: 'number' },
      { key: 'prompt', label: 'Đề bài', type: 'textarea', required: true, colSpan: 2 },
    ],
    preview: (r) => `/app/speaking?part=${r.id}`,
  }),
  resources: define<ResourceDoc>({
    title: 'Tài liệu mở',
    sub: 'Tài liệu tải về miễn phí ở trang Kho tài liệu của website.',
    entityName: 'tài liệu',
    createLabel: 'Thêm tài liệu',
    idPrefix: 'r',
    rows: RESOURCES,
    searchKeys: ['title', 'category'],
    filters: [
      { key: 'type', label: 'Định dạng', options: opts(['PDF', 'DOCX', 'AUDIO']) },
      { key: 'category', label: 'Nhóm', options: opts(RESOURCES.map((r) => r.category)) },
    ],
    defaultValues: { type: 'PDF', category: 'TOEIC', pages: 0, downloads: 0, size: '1 MB', description: '' },
    columns: [
      { key: 'title', header: 'Tài liệu', render: (r) => (
        <div className="min-w-[260px]">
          <p className="font-semibold text-slate-900">{r.title}</p>
          <p className="line-clamp-1 text-[12px] text-slate-500">{r.description}</p>
        </div>
      ) },
      { key: 'type', header: 'Định dạng', render: (r) => <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600">{r.type}</span> },
      { key: 'category', header: 'Nhóm', render: (r) => muted(r.category) },
      { key: 'size', header: 'Dung lượng', align: 'right', render: (r) => muted(r.size) },
      { key: 'downloads', header: 'Lượt tải', align: 'right', render: (r) => num(r.downloads) },
    ],
    fields: [
      { key: 'title', label: 'Tên tài liệu', required: true, colSpan: 2 },
      { key: 'type', label: 'Định dạng', type: 'select', options: opts(['PDF', 'DOCX', 'AUDIO']) },
      { key: 'category', label: 'Nhóm', type: 'select', options: opts(RESOURCES.map((r) => r.category)) },
      { key: 'pages', label: 'Số trang', type: 'number' },
      { key: 'size', label: 'Dung lượng' },
      { key: 'description', label: 'Mô tả', type: 'textarea', colSpan: 2 },
    ],
    preview: () => '/resources',
  }),
  faq: define<FaqItem>({
    title: 'Câu hỏi thường gặp',
    sub: 'Nội dung trang FAQ và gợi ý trả lời nhanh trong khung chat hỗ trợ.',
    entityName: 'câu hỏi',
    createLabel: 'Thêm câu hỏi',
    idPrefix: 'f',
    rows: FAQS,
    searchKeys: ['question', 'answer'],
    filters: [{ key: 'category', label: 'Nhóm', options: opts(FAQS.map((f) => f.category)) }],
    defaultValues: { category: FAQS[0].category },
    columns: [
      { key: 'question', header: 'Câu hỏi', render: (r) => (
        <div className="min-w-[300px]">
          <p className="font-semibold text-slate-900">{r.question}</p>
          <p className="line-clamp-1 text-[12px] text-slate-500">{r.answer}</p>
        </div>
      ) },
      { key: 'category', header: 'Nhóm', render: (r) => muted(r.category) },
    ],
    fields: [
      { key: 'question', label: 'Câu hỏi', required: true, colSpan: 2 },
      { key: 'category', label: 'Nhóm', type: 'select', options: opts(FAQS.map((f) => f.category)) },
      { key: 'answer', label: 'Trả lời', type: 'textarea', required: true, colSpan: 2 },
    ],
    preview: () => '/faq',
  }),
};

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
                  <span className={cn('text-[11px] tabular-nums', kind === t ? 'text-white/80' : 'text-slate-400')}>{CONFIG[t].rows.length}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CrudEditor<{ id: string }>
        key={kind}
        rows={cfg.rows}
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
