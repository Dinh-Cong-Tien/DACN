import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Search, X } from 'lucide-react';
import type { ExamType } from '@/shared/types';
import { adminApi, useAdminInvalidate, useAdminQuestions } from '@/shared/api/admin';
import type { QuestionPage, QuestionQuery, QuestionRow } from '@/shared/api/head';
import type { UseQueryResult } from '@tanstack/react-query';
import { errorMessage } from '@/shared/api/client';
import { EXAM_PARTS, partLabel } from '@/shared/constants/staff';
import { Modal } from '@/shared/components/ui';
import { TBtn, inputCls } from '@/roles/teacher/components/TeacherKit';
import { toast } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils';

type Picked = Pick<QuestionRow, 'id' | 'part' | 'stem' | 'passageTitle'>;

/** Nguồn dữ liệu của hộp thoại: mặc định là API admin; giáo viên truyền API soạn học liệu của mình */
export interface TestQuestionsSource {
  load: (id: string) => Promise<{ questions: Picked[] }>;
  save: (id: string, questionIds: string[]) => Promise<{ count: number }>;
  useBank: (q: QuestionQuery) => UseQueryResult<QuestionPage>;
  /** Trạng thái lọc ngân hàng; undefined = theo API (giáo viên: đã duyệt + câu của mình) */
  bankStatus?: string;
  onSaved?: () => void;
  bankTitle?: string;
}
const ADMIN_SOURCE: TestQuestionsSource = {
  load: (id) => adminApi.test(id),
  save: (id, ids) => adminApi.setTestQuestions(id, ids),
  useBank: useAdminQuestions,
  bankStatus: 'PUBLISHED',
};

/** Gán câu hỏi từ ngân hàng vào đề: xem danh sách hiện tại, thêm theo Part/từ khoá, bỏ, đổi thứ tự, lưu (PUT /admin/tests/:id/questions). */
export const TestQuestionsDialog: React.FC<{ test: { id: string; title: string; examType: ExamType } | null; onClose: () => void; source?: TestQuestionsSource }> = ({ test, onClose, source = ADMIN_SOURCE }) => {
  const adminRefresh = useAdminInvalidate();
  const refresh = source.onSaved ?? adminRefresh;
  const [list, setList] = useState<Picked[] | null>(null);
  const [part, setPart] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setList(null);
    setPart('');
    setQ('');
    setPage(1);
    if (!test) return;
    source
      .load(test.id)
      .then((t) => setList(t.questions.map((x) => ({ id: x.id, part: x.part, stem: x.stem, passageTitle: x.passageTitle }))))
      .catch((e) => {
        toast.error('Không tải được đề', errorMessage(e));
        onClose();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, onClose]);

  const bank = source.useBank({ examType: test?.examType, part: part || undefined, q: q.trim() || undefined, page, pageSize: 10, status: source.bankStatus });
  const inTest = useMemo(() => new Set((list ?? []).map((x) => x.id)), [list]);
  const byPart = useMemo(() => {
    const m = new Map<string, number>();
    (list ?? []).forEach((x) => m.set(x.part, (m.get(x.part) ?? 0) + 1));
    return [...m.entries()];
  }, [list]);

  const move = (i: number, d: -1 | 1) =>
    setList((l) => {
      if (!l) return l;
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const save = async () => {
    if (!test || !list) return;
    setSaving(true);
    try {
      const r = await source.save(test.id, list.map((x) => x.id));
      toast.success('Đã lưu câu hỏi của đề', `${test.title}: ${r.count} câu`);
      void refresh();
      onClose();
    } catch (e) {
      toast.error('Không lưu được', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const parts = EXAM_PARTS.filter((p) => p.exam === test?.examType);
  const totalPages = bank.data ? Math.max(1, Math.ceil(bank.data.total / 10)) : 1;

  return (
    <Modal
      open={!!test}
      onClose={onClose}
      size="xl"
      title="Câu hỏi trong đề"
      description={test ? `${test.title} · ${list?.length ?? 0} câu${byPart.length ? ' · ' + byPart.map(([p, n]) => `${partLabel(p)}: ${n}`).join(' · ') : ''}` : undefined}
      footer={
        <>
          <TBtn variant="ghost" onClick={onClose}>
            Huỷ
          </TBtn>
          <TBtn variant="primary" disabled={saving || !list} onClick={() => void save()}>
            Lưu ({list?.length ?? 0} câu)
          </TBtn>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="min-w-0">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Đang có trong đề</h3>
          <div className="max-h-[52vh] overflow-y-auto rounded-xl border border-slate-200">
            {!list ? (
              <p className="p-6 text-center text-sm text-slate-500">Đang tải…</p>
            ) : list.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">Đề chưa có câu nào. Thêm câu từ ngân hàng bên cạnh.</p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {list.map((x, i) => (
                  <li key={x.id} className="flex items-start gap-2 px-3 py-2">
                    <span className="mt-0.5 w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-400">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-indigo-700">{partLabel(x.part)}{x.passageTitle ? ` · ${x.passageTitle}` : ''}</p>
                      <p className="line-clamp-2 text-[13px] text-slate-800">{x.stem}</p>
                    </div>
                    <div className="flex shrink-0">
                      <button type="button" aria-label="Lên" onClick={() => move(i, -1)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button type="button" aria-label="Xuống" onClick={() => move(i, 1)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><ArrowDown className="h-3.5 w-3.5" /></button>
                      <button type="button" aria-label="Bỏ khỏi đề" onClick={() => setList((l) => l?.filter((y) => y.id !== x.id) ?? l)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        <section className="min-w-0">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">{source.bankTitle ?? 'Ngân hàng câu hỏi'} {test?.examType}</h3>
          <div className="mb-2 flex flex-col gap-2 sm:flex-row">
            <select aria-label="Lọc theo Part" value={part} onChange={(e) => { setPart(e.target.value); setPage(1); }} className={cn(inputCls, 'sm:w-40')}>
              <option value="">Mọi Part</option>
              {parts.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tìm theo nội dung câu hỏi" className={cn(inputCls, 'w-full pl-9')} />
            </label>
          </div>
          <div className="max-h-[46vh] overflow-y-auto rounded-xl border border-slate-200">
            {bank.isLoading ? (
              <p className="p-6 text-center text-sm text-slate-500">Đang tải…</p>
            ) : !bank.data?.items.length ? (
              <p className="p-6 text-center text-sm text-slate-500">Không có câu hỏi phù hợp.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {bank.data.items.map((x) => {
                  const added = inTest.has(x.id);
                  return (
                    <li key={x.id} className="flex items-start gap-2 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-500">{partLabel(x.part)}{x.passageTitle ? ` · ${x.passageTitle}` : ''}</p>
                        <p className="line-clamp-2 text-[13px] text-slate-800">{x.stem}</p>
                      </div>
                      <TBtn size="sm" variant={added ? 'ghost' : 'default'} disabled={added || !list} icon={added ? undefined : <Plus />} onClick={() => setList((l) => (l ? [...l, { id: x.id, part: x.part, stem: x.stem, passageTitle: x.passageTitle }] : l))}>
                        {added ? 'Đã thêm' : 'Thêm'}
                      </TBtn>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px] text-slate-500">
            <span>{bank.data ? `${bank.data.total.toLocaleString('vi-VN')} câu` : ''}</span>
            <span className="flex items-center gap-2">
              <TBtn size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</TBtn>
              {page}/{totalPages}
              <TBtn size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sau</TBtn>
            </span>
          </div>
        </section>
      </div>
    </Modal>
  );
};
