import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Scale, TriangleAlert } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { headApi, useHeadInvalidate, useHeadReviews, useHeadTeachers, type HeadGradingReview } from '@/shared/api/head';
import { errorMessage } from '@/shared/api/client';
import type { GradingReview } from '@/shared/types';
import { cn, formatDateTime } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Figures, Panel, Status, TBtn, TPageHead, TTabs, inputCls, type StatusTone } from '@/roles/teacher/components/TeacherKit';
import { criteriaAvg } from './HeadTeacherDetailPage';

const SCORE_STEPS = Array.from({ length: 21 }, (_, i) => i / 2);
const STATUS: Record<GradingReview['status'], [StatusTone, string]> = { PENDING: ['amber', 'Chờ kiểm định'], AGREED: ['green', 'Đồng ý điểm GV'], ADJUSTED: ['red', 'Đã điều chỉnh'] };
const round = (v: number) => Math.round(v * 2) / 2;
const fmt = (v: number) => v.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const EMPTY: HeadGradingReview[] = [];

/** Kiểm định chấm bài: trưởng bộ môn chấm lại bài Viết/Nói giáo viên đã chấm, cùng đề và bộ tiêu chí học viên thấy, để đảm bảo chấm thống nhất giữa các lớp */
export const HeadGradingReviewPage: React.FC = () => {
  useDocumentTitle('Kiểm định chấm bài');
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const reviewsQ = useHeadReviews();
  const refresh = useHeadInvalidate();
  const teachers = useHeadTeachers().data ?? [];
  const teacherByName = (name: string) => teachers.find((t) => t.name === name);
  const reviews = reviewsQ.data ?? EMPTY;
  const [tabState, setTab] = useState<GradingReview['status']>();
  const tab = tabState ?? reviews.find((r) => r.id === reviewId)?.status ?? 'PENDING';
  const [scores, setScores] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const list = reviews.filter((r) => r.status === tab);
  const selected = useMemo(() => reviews.find((r) => r.id === reviewId && r.status === tab) ?? list[0], [reviews, reviewId, list, tab]);
  const criteria = (selected?.rubric.criteria ?? []).map((c) => ({ key: c.key, label: c.label, desc: c.description ?? '' }));
  const wordCount = selected?.type === 'ESSAY' && selected.content.trim() ? selected.content.trim().split(/\s+/).length : 0;
  const teacherAvg = criteriaAvg(selected?.teacherCriteria);
  const headAvg = criteria.length && criteria.every((c) => scores[c.key] !== undefined) ? criteriaAvg(scores) : null;
  const gap = headAvg === null ? null : Math.round((teacherAvg - headAvg) * 100) / 100;

  useEffect(() => {
    setScores(selected?.headCriteria ?? selected?.teacherCriteria ?? {});
    setNote(selected?.headNote ?? '');
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const decide = async (agree: boolean) => {
    if (!selected) return;
    if (!agree && gap === 0) return toast.error('Điểm kiểm định đang trùng điểm giáo viên', 'Chỉnh điểm ở ít nhất một tiêu chí, hoặc chọn Đồng ý điểm GV.');
    if (!agree && !note.trim()) return toast.error('Cần ghi chú lý do điều chỉnh', 'Giáo viên sẽ nhận ghi chú này cùng điểm mới.');
    const next = list.find((r) => r.id !== selected.id);
    setSaving(true);
    try {
      const r = await headApi.decideReview(selected.id, agree ? { decision: 'AGREED', note: note.trim() || undefined } : { decision: 'ADJUSTED', scores, note: note.trim() });
      toast.success(agree ? 'Đã xác nhận điểm' : 'Đã điều chỉnh điểm', agree ? `${selected.studentName} · ${fmt(round(teacherAvg))}/10` : `${selected.studentName} · ${fmt(round(teacherAvg))} → ${fmt(r.headTotal ?? round(headAvg ?? 0))} · ${selected.teacher} nhận được thông báo`);
      await refresh();
      navigate(next ? `/head/grading-review/${next.id}` : '/head/grading-review');
    } catch (e) {
      toast.error('Không lưu được kết quả kiểm định', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const done = reviews.filter((r) => r.status !== 'PENDING');
  const deviated = done.filter((r) => r.headCriteria && Math.abs(criteriaAvg(r.teacherCriteria) - criteriaAvg(r.headCriteria)) >= 1);

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Giảng dạy" title="Kiểm định chấm bài" sub="Chấm lại ngẫu nhiên bài Viết và bài Nói giáo viên đã chấm, cùng đề và bộ tiêu chí học viên thấy. Lệch từ 1 điểm trở lên sẽ được điều chỉnh và báo cho giáo viên." />

      <Figures
        items={[
          { label: 'Chờ kiểm định', value: reviews.filter((r) => r.status === 'PENDING').length, icon: Scale, tone: 'amber' },
          { label: 'Đã kiểm định', value: done.length, icon: CheckCircle2, tone: 'emerald' },
          { label: 'Lệch từ 1 điểm', value: deviated.length, note: done.length ? `${Math.round((deviated.length / done.length) * 100)}% số bài đã kiểm định` : undefined, icon: TriangleAlert, tone: 'rose' },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel flush className="lg:sticky lg:top-20">
          <div className="px-4 pt-2">
            <TTabs
              value={tab}
              onChange={(k) => (setTab(k as GradingReview['status']), navigate('/head/grading-review'))}
              items={[
                { key: 'PENDING', label: 'Chờ', count: reviews.filter((r) => r.status === 'PENDING').length },
                { key: 'AGREED', label: 'Đồng ý', count: reviews.filter((r) => r.status === 'AGREED').length },
                { key: 'ADJUSTED', label: 'Điều chỉnh', count: reviews.filter((r) => r.status === 'ADJUSTED').length },
              ]}
            />
          </div>
          {list.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">{reviewsQ.isLoading ? 'Đang tải…' : 'Không có bài nào.'}</p>
          ) : (
            <ul className="max-h-[65vh] divide-y divide-slate-100 overflow-y-auto">
              {list.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => navigate(`/head/grading-review/${r.id}`)} className={cn('flex w-full items-start gap-3 px-4 py-3 text-left transition-colors', selected?.id === r.id ? 'bg-indigo-500/[0.06]' : 'hover:bg-slate-50')}>
                    <Avatar name={r.studentName} src={r.avatarUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-slate-900">{r.studentName}</span>
                        <span className="shrink-0 text-[12px] text-slate-500">{r.type === 'ESSAY' ? 'Viết' : 'Nói'}</span>
                      </span>
                      <span className="block truncate text-[12px] text-slate-500">
                        {r.className} · GV {r.teacher}
                      </span>
                      <span className="block text-[12px] tabular-nums text-slate-400">GV chấm {fmt(round(criteriaAvg(r.teacherCriteria)))}/10</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {selected ? (
          <div className="min-w-0 space-y-6" key={selected.id}>
            <Panel
              title={selected.type === 'ESSAY' ? `Bài Viết · ${selected.rubric.name}` : `Bài Nói · ${selected.rubric.name}`}
              sub={
                <>
                  {selected.studentName} · {selected.className} · giáo viên{' '}
                  {teacherByName(selected.teacher) ? (
                    <Link to={`/head/teachers/${teacherByName(selected.teacher)!.id}`} className="text-indigo-700 hover:underline">
                      {selected.teacher}
                    </Link>
                  ) : (
                    selected.teacher
                  )}{' '}
                  chấm lúc {formatDateTime(selected.gradedAt)}
                </>
              }
              action={<Status tone={STATUS[selected.status][0]}>{STATUS[selected.status][1]}</Status>}
            >
              {selected.taskTitle && (
                <div className="mb-4 rounded-md bg-slate-50 px-4 py-3">
                  <p className="text-[12px] font-medium text-slate-500">Đề bài</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-800">{selected.taskTitle}</p>
                </div>
              )}
              {selected.type === 'ESSAY' ? (
                <div>
                  <div className="mb-2 flex items-center justify-between text-[13px] text-slate-500">
                    <span>Bài làm</span>
                    <span className="tabular-nums">{wordCount} từ</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto whitespace-pre-line rounded-md border border-slate-200 px-5 py-4 font-serif text-[15px] leading-[1.85] text-slate-800">{selected.content}</div>
                </div>
              ) : (
                <div className="space-y-2 rounded-md border border-slate-200 px-4 py-3">
                  {selected.audioUrl ? <audio controls src={selected.audioUrl} className="w-full" /> : <p className="text-sm text-slate-500">Bài nói không có tệp ghi âm.</p>}
                  {selected.content && <p className="text-[12px] text-slate-500">{selected.content}</p>}
                </div>
              )}
              <div className="mt-4 rounded-md border-l-4 border-l-indigo-400 bg-indigo-500/[0.05] px-4 py-2.5 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Nhận xét của giáo viên:</span> {selected.teacherFeedback || '—'}
              </div>
            </Panel>

            <Panel title="So sánh điểm theo tiêu chí" sub={`Thang 0–${selected.rubric.scaleMax} mỗi tiêu chí, điểm bài là trung bình các tiêu chí. Cột kiểm định mặc định lấy điểm giáo viên, chỉnh ở tiêu chí chưa hợp lý.`}>
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-slate-50 text-[12px] font-semibold text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Tiêu chí</th>
                      <th className="px-4 py-2.5 text-right">Giáo viên</th>
                      <th className="px-4 py-2.5 text-right">Kiểm định</th>
                      <th className="px-4 py-2.5 text-right">Lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((c) => {
                      const t = selected.teacherCriteria[c.key] ?? 0;
                      const h = scores[c.key];
                      const d = h === undefined ? null : t - h;
                      return (
                        <tr key={c.key} className="border-t border-slate-100">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-slate-900">{c.label}</p>
                            <p className="text-[12px] text-slate-500">{c.desc}</p>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{t.toFixed(1)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <select value={h ?? ''} disabled={selected.status !== 'PENDING'} onChange={(e) => setScores((s) => ({ ...s, [c.key]: Number(e.target.value) }))} className={cn(inputCls, 'w-24 text-right tabular-nums')} aria-label={`Điểm kiểm định ${c.label}`}>
                              {SCORE_STEPS.map((v) => (
                                <option key={v} value={v}>
                                  {v.toFixed(1)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className={cn('px-4 py-2.5 text-right tabular-nums', d && Math.abs(d) >= 1 ? 'font-semibold text-rose-600' : 'text-slate-500')}>{d === null || d === 0 ? '0' : `${d > 0 ? '+' : ''}${d.toFixed(1)}`}</td>
                        </tr>
                      );
                    })}
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">Điểm bài</td>
                      <td className="px-4 py-2.5 text-right text-lg font-semibold tabular-nums text-slate-900">{fmt(round(teacherAvg))}</td>
                      <td className="px-4 py-2.5 pr-7 text-right text-lg font-semibold tabular-nums text-slate-900">{headAvg === null ? '—' : fmt(round(headAvg))}</td>
                      <td className={cn('px-4 py-2.5 text-right font-semibold tabular-nums', gap !== null && Math.abs(gap) >= 1 ? 'text-rose-600' : 'text-emerald-700')}>{gap === null ? '—' : gap === 0 ? 'Khớp' : `${gap > 0 ? '+' : ''}${fmt(gap)}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {gap !== null && Math.abs(gap) >= 1 && selected.status === 'PENDING' && <p className="mt-3 text-[13px] text-rose-600">Giáo viên chấm {gap > 0 ? 'cao' : 'thấp'} hơn kiểm định {fmt(Math.abs(gap))} điểm, nên điều chỉnh và ghi rõ lý do.</p>}

              <label className="mt-5 block">
                <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Ghi chú gửi giáo viên</span>
                <textarea value={note} disabled={selected.status !== 'PENDING'} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Lý do điều chỉnh, tiêu chí cần bám sát hơn" className={cn(inputCls, 'h-auto w-full py-2 leading-relaxed')} />
              </label>

              {selected.status === 'PENDING' && (
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                  <TBtn disabled={saving} onClick={() => void decide(true)}>Đồng ý điểm GV</TBtn>
                  <TBtn variant="primary" disabled={saving} onClick={() => void decide(false)}>
                    Điều chỉnh điểm
                  </TBtn>
                </div>
              )}
            </Panel>
          </div>
        ) : (
          <Panel>
            <p className="py-10 text-center text-sm text-slate-500">Không còn bài nào trong mục này.</p>
          </Panel>
        )}
      </div>
    </div>
  );
};
