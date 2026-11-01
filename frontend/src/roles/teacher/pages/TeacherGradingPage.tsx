import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, SPEAKING_CRITERIA, VSTEP_SPEAKING_PARTS, VSTEP_WRITING_TASKS, WRITING_CRITERIA } from '@/shared/mocks';
import type { Submission } from '@/shared/types';
import { cn, formatDateTime } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Panel, Status, TBtn, TPageHead, TTabs, inputCls } from '../components/TeacherKit';

const FEEDBACK_BANK = {
  ESSAY: ['Bố cục rõ, đủ mở bài – thân bài – kết bài.', 'Cần thêm ví dụ cụ thể cho mỗi luận điểm.', 'Chú ý chia động từ và mạo từ.', 'Dùng câu phức nhiều hơn để tăng điểm ngữ pháp.'],
  SPEAKING: ['Nói khá trôi chảy, ít ngập ngừng.', 'Chú ý âm cuối /s/, /t/, /d/.', 'Nên đưa lý do rồi mới so sánh các phương án.', 'Từ vựng còn lặp, thử dùng từ đồng nghĩa.'],
} as const;

const SCORE_STEPS = Array.from({ length: 21 }, (_, i) => i / 2);
const STATUS_TEXT: Record<Submission['status'], [ 'amber' | 'red' | 'green', string]> = { PENDING: ['amber', 'Chờ chấm'], LATE: ['red', 'Nộp muộn'], GRADED: ['green', 'Đã chấm'] };

/** Bàn chấm bài tự luận: đề bài đúng như học viên đã làm (Luyện Viết / Luyện Nói), chấm theo cùng bộ tiêu chí học viên nhìn thấy */
export const TeacherGradingPage: React.FC = () => {
  useDocumentTitle('Chấm bài');
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Submission[]>(MOCK_SUBMISSIONS.filter((s) => s.type === 'ESSAY' || s.type === 'SPEAKING'));
  const [tab, setTab] = useState<'TODO' | 'GRADED'>('TODO');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [playing, setPlaying] = useState(false);

  const inTab = (s: Submission) => (tab === 'GRADED' ? s.status === 'GRADED' : s.status !== 'GRADED');
  const list = subs.filter(inTab).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const selected = useMemo(() => subs.find((s) => s.id === submissionId) ?? list[0], [subs, submissionId, list]);
  const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === selected?.assignmentId);
  const criteria = selected?.type === 'SPEAKING' ? SPEAKING_CRITERIA : WRITING_CRITERIA;
  const task = assignment?.target.kind === 'WRITING' ? VSTEP_WRITING_TASKS.find((t) => t.id === (assignment.target as { taskId: string }).taskId) : undefined;
  const part = assignment?.target.kind === 'SPEAKING' ? VSTEP_SPEAKING_PARTS.find((p) => p.id === (assignment.target as { partId: string }).partId) : undefined;
  const wordCount = selected?.type === 'ESSAY' && selected.content ? selected.content.trim().split(/\s+/).length : 0;
  const filled = criteria.every((c) => scores[c.key] !== undefined);
  const avg = filled ? Math.round((criteria.reduce((a, c) => a + scores[c.key], 0) / criteria.length) * 2) / 2 : null;

  // Đổi bài: nạp lại điểm / nhận xét đã lưu
  useEffect(() => {
    setFeedback(selected?.feedback ?? '');
    setScores(selected?.score !== undefined ? Object.fromEntries(criteria.map((c) => [c.key, selected.score as number])) : {});
    setPlaying(false);
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = (release: boolean) => {
    if (!selected || avg === null) return toast.error('Chưa chấm đủ tiêu chí', 'Chọn điểm cho cả 4 tiêu chí.');
    if (release) setSubs((all) => all.map((s) => (s.id === selected.id ? { ...s, score: avg, feedback, status: 'GRADED' } : s)));
    toast.success(release ? 'Đã trả bài' : 'Đã lưu nháp điểm', `${selected.studentName} · ${avg}/10${release ? ' · học viên nhận được thông báo' : ''}`);
    if (release) {
      const nextSub = list.find((s) => s.id !== selected.id);
      if (nextSub) navigate(`/teacher/grading/${nextSub.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Giảng dạy" title="Bàn chấm bài" sub="Bài Viết và bài Nói học viên nộp từ bài tập được giao. Bài trắc nghiệm, ngữ pháp, từ vựng được chấm tự động." />

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel flush className="lg:sticky lg:top-20">
          <div className="px-4 pt-2">
            <TTabs
              value={tab}
              onChange={(k) => setTab(k as typeof tab)}
              items={[
                { key: 'TODO', label: 'Cần chấm', count: subs.filter((s) => s.status !== 'GRADED').length },
                { key: 'GRADED', label: 'Đã chấm', count: subs.filter((s) => s.status === 'GRADED').length },
              ]}
            />
          </div>
          {list.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Không còn bài nào.</p>
          ) : (
            <ul className="max-h-[65vh] divide-y divide-slate-100 overflow-y-auto">
              {list.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => navigate(`/teacher/grading/${s.id}`)} className={cn('flex w-full items-start gap-3 px-4 py-3 text-left transition-colors', selected?.id === s.id ? 'bg-indigo-500/[0.06]' : 'hover:bg-slate-50')}>
                    <Avatar name={s.studentName} src={s.avatarUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-slate-900">{s.studentName}</span>
                        {s.score !== undefined ? <span className="text-[13px] tabular-nums text-slate-700">{s.score}</span> : <span className="shrink-0 text-[12px] text-slate-500">{s.type === 'ESSAY' ? 'Viết' : 'Nói'}</span>}
                      </span>
                      <span className="block truncate text-[12px] text-slate-500">{s.assignmentTitle}</span>
                      <span className={cn('block text-[12px]', s.status === 'LATE' ? 'text-rose-600' : 'text-slate-400')}>
                        {s.status === 'LATE' ? 'Nộp muộn · ' : ''}
                        {formatDateTime(s.submittedAt)}
                      </span>
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
              title={selected.assignmentTitle}
              sub={`${selected.studentName} · ${assignment?.className ?? ''} · nộp lúc ${formatDateTime(selected.submittedAt)}`}
              action={<Status tone={STATUS_TEXT[selected.status][0]}>{STATUS_TEXT[selected.status][1]}</Status>}
            >
              {(task || part) && (
                <div className="mb-4 rounded-md bg-slate-50 px-4 py-3">
                  <p className="text-[12px] font-medium text-slate-500">
                    Đề bài · {task ? `${task.task} · ${task.minutes} phút · tối thiểu ${task.minWords} từ` : `${part!.part} · ${part!.minutes} phút`}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-800">{task?.prompt ?? part?.prompt}</p>
                </div>
              )}

              {selected.type === 'ESSAY' ? (
                <div>
                  <div className="mb-2 flex items-center justify-between text-[13px] text-slate-500">
                    <span>Bài làm</span>
                    <span className={cn('tabular-nums', task && wordCount < task.minWords && 'text-rose-600')}>
                      {wordCount} từ{task && wordCount < task.minWords ? ` · thiếu ${task.minWords - wordCount} từ` : ''}
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto whitespace-pre-line rounded-md border border-slate-200 px-5 py-4 font-serif text-[15px] leading-[1.85] text-slate-800">{selected.content}</div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-md border border-slate-200 px-4 py-3">
                  <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Tạm dừng' : 'Phát'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex h-8 items-center gap-[2px]">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <span key={i} className="flex-1 rounded-sm bg-slate-300" style={{ height: `${25 + ((i * 37) % 75)}%` }} />
                      ))}
                    </div>
                    <p className="mt-1 font-mono text-[12px] text-slate-500">{selected.content}</p>
                  </div>
                </div>
              )}
            </Panel>

            <Panel title="Chấm điểm" sub={`Thang 0–10 cho mỗi tiêu chí, điểm bài là trung bình 4 tiêu chí (làm tròn 0,5). Học viên thấy đúng các tiêu chí này ở trang Luyện ${selected.type === 'ESSAY' ? 'Viết' : 'Nói'}.`}>
              <div className="overflow-hidden rounded-md border border-slate-200">
                {criteria.map((c, i) => (
                  <div key={c.key} className={cn('flex items-center justify-between gap-4 px-4 py-2.5', i > 0 && 'border-t border-slate-100')}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{c.label}</p>
                      <p className="text-[12px] text-slate-500">{c.desc}</p>
                    </div>
                    <select value={scores[c.key] ?? ''} onChange={(e) => setScores((s) => ({ ...s, [c.key]: Number(e.target.value) }))} className={cn(inputCls, 'w-24 text-right tabular-nums')} aria-label={c.label}>
                      <option value="" disabled>
                        —
                      </option>
                      {SCORE_STEPS.map((v) => (
                        <option key={v} value={v}>
                          {v.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5">
                  <p className="text-sm font-medium text-slate-900">Điểm bài</p>
                  <p className="w-24 pr-3 text-right text-lg font-semibold tabular-nums text-slate-900">{avg === null ? '—' : avg.toFixed(1)}</p>
                </div>
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Nhận xét cho học viên</span>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder="Điểm làm tốt, lỗi cần sửa, việc nên luyện thêm" className={cn(inputCls, 'h-auto w-full py-2 leading-relaxed')} />
              </label>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-[12px] text-slate-500">Chèn nhanh:</span>
                {FEEDBACK_BANK[selected.type === 'SPEAKING' ? 'SPEAKING' : 'ESSAY'].map((f) => (
                  <button key={f} type="button" onClick={() => setFeedback((v) => (v ? `${v} ${f}` : f))} className="text-[12px] text-indigo-700 hover:underline">
                    {f}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
                <TBtn onClick={() => save(false)}>Lưu nháp</TBtn>
                <TBtn variant="primary" onClick={() => save(true)}>
                  {selected.status === 'GRADED' ? 'Cập nhật điểm' : 'Trả bài'}
                </TBtn>
              </div>
            </Panel>
          </div>
        ) : (
          <Panel>
            <p className="py-10 text-center text-sm text-slate-500">Chọn một bài ở danh sách bên trái để chấm.</p>
          </Panel>
        )}
      </div>
    </div>
  );
};
