import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText, Database, Eye, FileEdit, Headphones, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { IQuestion } from '@toeic-vstep/shared';
import { useDocumentTitle } from '@/shared/hooks';
import { Modal, Pagination, SearchInput, Select } from '@/shared/components/ui';
import { QuestionRenderer } from '@/engines';
import { cn } from '@/shared/utils';
import { errorMessage } from '@/shared/api/client';
import { toast } from '@/shared/stores/uiStore';
import { authoringApi, useAuthorBank, useAuthorQuestions } from '@/shared/api/teacher';
import type { QuestionRow } from '@/shared/api/head';
import { EXAM_PARTS, partLabel, partShort, SKILL_VI, toIQuestion } from '@/shared/constants/staff';
import type { SkillType } from '@/shared/types';
import { WordImportButton } from '@/shared/components/import/WordImportDialog';
import { Figures, Panel, Status, TPageHead, TTabs, tbl } from '../components/TeacherKit';
import { appLocale } from '@/shared/i18n';

const PAGE = 20;
const STATUS_VI: Record<string, { label: string; tone: 'green' | 'amber' | 'red' | 'gray' }> = {
  PUBLISHED: { label: 'Đã xuất bản', tone: 'green' },
  PENDING_REVIEW: { label: 'Chờ duyệt', tone: 'amber' },
  REJECTED: { label: 'Cần sửa', tone: 'red' },
  DRAFT: { label: 'Nháp', tone: 'gray' },
  ARCHIVED: { label: 'Lưu trữ', tone: 'gray' },
};
const SKILL_OPTS = (['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as SkillType[]).map((s) => ({ value: s, label: SKILL_VI[s] }));

/**
 * Ngân hàng câu hỏi của giáo viên: tra cứu câu đã xuất bản (để ghép đề, giao bài) + câu của chính mình,
 * nhập đề từ file Word (tự chia Part 1–7, lưu Nháp → gửi duyệt ở "Học liệu của tôi").
 */
export const TeacherQuestionBankPage: React.FC = () => {
  useDocumentTitle('Ngân hàng câu hỏi');
  const qc = useQueryClient();
  const [tab, setTab] = useState<'bank' | 'mine'>('bank');
  const [part, setPart] = useState('');
  const [skill, setSkill] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<IQuestion | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  const query = useMemo(() => ({ page, pageSize: PAGE, part: part || undefined, skill: skill || undefined, q: q.trim() || undefined }), [page, part, skill, q]);
  const bank = useAuthorBank(tab === 'bank' ? query : { pageSize: 1 });
  const mine = useAuthorQuestions(tab === 'mine' ? query : { pageSize: 1 });
  const totals = { bank: useAuthorBank({ pageSize: 1 }).data, mine: useAuthorQuestions({ pageSize: 1 }).data };
  const cur = tab === 'bank' ? bank : mine;
  const rows: QuestionRow[] = cur.data?.items ?? [];
  const total = cur.data?.total ?? 0;
  const byPart = totals.bank?.byPart ?? [];
  const sum = (re: RegExp) => byPart.filter((b) => re.test(b.part)).reduce((a, b) => a + b.count, 0);

  const open = async (r: QuestionRow) => {
    setOpening(r.id);
    try {
      const full = await authoringApi.bankQuestion(r.id);
      setPreview(toIQuestion(full, full.passage));
    } catch (e) {
      toast.error('Không mở được câu hỏi', errorMessage(e));
    } finally {
      setOpening(null);
    }
  };
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Học liệu', to: '/teacher/library/courses' }, { label: 'Ngân hàng câu hỏi' }]}
        title="Ngân hàng câu hỏi"
        sub="Tra cứu câu hỏi đã xuất bản theo Part để ghép đề và giao bài. Nhập đề từ file Word: hệ thống tự chia câu vào Part 1–7, lưu Nháp để bạn gửi trưởng bộ môn duyệt."
        actions={
          <>
            <WordImportButton
              canChooseStatus={false}
              onDone={() => {
                setTab('mine');
                setPage(1);
                void qc.invalidateQueries({ queryKey: ['teacher'] });
              }}
            />
            <Link to="/teacher/authoring" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
              <FileEdit className="h-4 w-4" /> Học liệu của tôi
            </Link>
          </>
        }
      />
      <Figures
        items={[
          { label: 'Câu hỏi trong ngân hàng', value: (totals.bank?.total ?? 0).toLocaleString(appLocale()), note: 'đã xuất bản + câu của bạn', icon: Database, tone: 'indigo' },
          { label: 'Câu Nghe (Part 1–4)', value: sum(/TOEIC_P[1-4]|VSTEP_L/).toLocaleString(appLocale()), icon: Headphones, tone: 'sky' },
          { label: 'Câu Đọc (Part 5–7)', value: sum(/TOEIC_P[5-7]|VSTEP_R/).toLocaleString(appLocale()), icon: BookOpenText, tone: 'violet' },
          { label: 'Câu của tôi', value: (totals.mine?.total ?? 0).toLocaleString(appLocale()), note: 'soạn tay hoặc nhập từ Word', icon: FileEdit, tone: 'emerald' },
        ]}
      />
      <Panel flush>
        <div className="space-y-3 border-b border-slate-100 px-5 pt-4">
          <TTabs
            value={tab}
            onChange={(k) => {
              setTab(k as 'bank' | 'mine');
              setPage(1);
            }}
            items={[
              { key: 'bank', label: 'Ngân hàng chung', count: totals.bank?.total },
              { key: 'mine', label: 'Câu của tôi', count: totals.mine?.total },
            ]}
          />
          <div className="flex flex-col gap-2 pb-4 sm:flex-row">
            <div className="sm:w-72">
              <SearchInput value={q} onChange={(e) => resetPage(setQ)(e.target.value)} inputSize="sm" placeholder="Tìm theo nội dung câu hỏi" />
            </div>
            <div className="sm:w-48">
              <Select inputSize="sm" placeholder="Tất cả Part" value={part} onChange={(e) => resetPage(setPart)(e.target.value)} options={EXAM_PARTS.map((p) => ({ value: p.value, label: p.label }))} />
            </div>
            <div className="sm:w-40">
              <Select inputSize="sm" placeholder="Mọi kỹ năng" value={skill} onChange={(e) => resetPage(setSkill)(e.target.value)} options={SKILL_OPTS} />
            </div>
          </div>
        </div>
        {cur.isLoading ? (
          <p className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
          </p>
        ) : !rows.length ? (
          <p className="py-12 text-center text-sm text-slate-500">{tab === 'mine' ? 'Bạn chưa có câu hỏi nào — soạn trong "Học liệu của tôi" hoặc nhập từ file Word.' : 'Không có câu hỏi phù hợp bộ lọc.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Part</th>
                  <th className={tbl.th}>Câu hỏi</th>
                  <th className={cn(tbl.th, 'max-md:hidden')}>Kỹ năng</th>
                  <th className={cn(tbl.th, 'max-sm:hidden')}>Trạng thái</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const st = STATUS_VI[r.status] ?? { label: r.status, tone: 'gray' as const };
                  return (
                    <tr key={r.id} className={tbl.tr}>
                      <td className={cn(tbl.td, 'whitespace-nowrap')}>
                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-700" title={partLabel(r.part)}>
                          {partShort(r.part)}
                        </span>
                      </td>
                      <td className={cn(tbl.td, 'min-w-[220px]')}>
                        <p className="line-clamp-2 text-slate-800">{r.stem}</p>
                        {r.passageTitle && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{r.passageTitle}</p>}
                      </td>
                      <td className={cn(tbl.td, 'max-md:hidden whitespace-nowrap text-slate-600')}>{SKILL_VI[r.skill as SkillType] ?? r.skill}</td>
                      <td className={cn(tbl.td, 'max-sm:hidden')}>
                        <Status tone={st.tone}>{st.label}</Status>
                      </td>
                      <td className={cn(tbl.td, 'text-right')}>
                        <button type="button" onClick={() => open(r)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-semibold text-indigo-600 hover:bg-indigo-50" aria-label={`Xem câu ${r.stem.slice(0, 30)}`}>
                          {opening === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {total > PAGE && <Pagination page={page} totalPages={Math.ceil(total / PAGE)} onChange={setPage} total={total} pageSize={PAGE} />}

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Xem trước câu hỏi" size="lg">
        {preview && <QuestionRenderer question={preview} selectedAnswer={undefined} onSelectAnswer={() => undefined} showExplanation isReadOnly allowFlagReport={false} />}
      </Modal>
    </div>
  );
};
