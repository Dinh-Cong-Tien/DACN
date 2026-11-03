import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useStudentAttempt } from '@/shared/api/teacher';
import { partName } from '@/shared/constants/teacher';
import { Drawer } from '@/shared/components/ui';
import { cn, formatDateTime } from '@/shared/utils';
import { Meter, TTabs } from './TeacherKit';

const mmss = (sec: number) => `${Math.floor(sec / 60)} phút ${String(sec % 60).padStart(2, '0')} giây`;

/** Chi tiết một lượt làm bài của học viên — cùng nội dung trang Kết quả bài thi của học viên: theo Part + từng câu */
export const StudentAttemptDrawer: React.FC<{ studentId?: string; attemptId?: string; studentName?: string; onClose: () => void; /** '/head' cho trưởng bộ môn, admin */ apiBase?: string }> = ({ studentId, attemptId, studentName, onClose, apiBase }) => {
  const { data: d, isLoading, isError } = useStudentAttempt(studentId, attemptId, apiBase);
  const [filter, setFilter] = useState<'wrong' | 'all'>('wrong');
  const answers = (d?.answers ?? []).filter((a) => filter === 'all' || a.isCorrect === false);
  const wrong = (d?.answers ?? []).filter((a) => a.isCorrect === false).length;

  return (
    <Drawer open={!!attemptId} onClose={onClose} title={d?.title ?? 'Kết quả làm bài'} width="max-w-2xl">
      {!d ? (
        <p className="py-10 text-center text-sm text-slate-500">{isError ? 'Không tải được kết quả.' : isLoading ? 'Đang tải…' : ''}</p>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            {studentName && <span className="font-medium text-slate-900">{studentName}</span>} · {d.modeLabel}
            {d.submittedAt && ` · ${formatDateTime(d.submittedAt)}`} · {mmss(d.summary.durationSec)}
          </p>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Điểm', d.summary.maxScore ? `${d.summary.score}/${d.summary.maxScore}` : String(d.summary.score)],
              ['Đúng', `${d.summary.correct}/${d.summary.total}`],
              ...(d.summary.listening !== undefined ? [['Listening', String(d.summary.listening)]] : []),
              ...(d.summary.reading !== undefined ? [['Reading', String(d.summary.reading)]] : []),
              ...(d.cefr ? [['CEFR', d.cefr]] : []),
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-200 px-3 py-2.5">
                <dt className="text-[12px] text-slate-500">{k}</dt>
                <dd className="font-display text-lg font-extrabold tabular-nums text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>

          {!!d.partResults?.length && (
            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-slate-700">Theo Part</h3>
              <ul className="space-y-2">
                {d.partResults.map((p) => {
                  const pct = p.total ? Math.round((p.correct / p.total) * 100) : 0;
                  return (
                    <li key={p.part} className="grid grid-cols-[110px_1fr_70px] items-center gap-3 text-sm">
                      <span className="text-slate-700">{partName(p.part)}</span>
                      <Meter value={pct} tone={pct < 50 ? 'red' : pct < 75 ? 'amber' : 'green'} />
                      <span className="text-right tabular-nums text-slate-600">
                        {p.correct}/{p.total}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <TTabs
              value={filter}
              onChange={(k) => setFilter(k as 'wrong' | 'all')}
              items={[
                { key: 'wrong', label: 'Câu sai', count: wrong },
                { key: 'all', label: 'Tất cả câu', count: d.answers.length },
              ]}
            />
            <ol className="mt-3 space-y-3">
              {answers.map((a) => (
                <li key={a.questionId} className="rounded-xl border border-slate-200 p-3">
                  <p className="flex items-center gap-2 text-[12px] text-slate-500">
                    <span className="font-semibold text-slate-700">Câu {a.no}</span>
                    {a.part && <span>· {partName(a.part)}</span>}
                    {a.isCorrect === true && <span className="ml-auto inline-flex items-center gap-1 text-emerald-600"><Check className="h-3.5 w-3.5" /> Đúng</span>}
                    {a.isCorrect === false && <span className="ml-auto inline-flex items-center gap-1 text-rose-600"><X className="h-3.5 w-3.5" /> Sai</span>}
                    {a.isCorrect === null && <span className="ml-auto text-slate-400">{a.grading ? `Đã chấm ${a.grading.totalScore}` : 'Chưa chấm'}</span>}
                  </p>
                  {a.passageTitle && <p className="mt-1 text-[12px] text-slate-400">{a.passageTitle}</p>}
                  {a.stem && <p className="mt-1.5 whitespace-pre-line text-sm text-slate-800">{a.stem}</p>}
                  {a.options.length > 0 && (
                    <ul className="mt-2 grid gap-1">
                      {a.options.map((o) => (
                        <li
                          key={o.key}
                          className={cn(
                            'flex gap-2 rounded-lg px-2.5 py-1.5 text-[13px]',
                            o.key === a.correctKey ? 'bg-emerald-500/10 text-emerald-800' : o.key === a.selectedKey ? 'bg-rose-500/10 text-rose-700' : 'text-slate-600'
                          )}
                        >
                          <span className="w-4 font-semibold">{o.key}</span>
                          <span className="flex-1">{o.text || '—'}</span>
                          {o.key === a.selectedKey && <span className="text-[11px] font-medium">Học viên chọn</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!a.options.length && a.textAnswer && <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-700">{a.textAnswer}</p>}
                  {a.audioUrl && <audio controls src={a.audioUrl} className="mt-2 h-9 w-full" />}
                  {a.explanation && <p className="mt-2 border-t border-slate-100 pt-2 text-[12px] leading-relaxed text-slate-500">{a.explanation}</p>}
                </li>
              ))}
              {!answers.length && <li className="py-6 text-center text-sm text-slate-500">{filter === 'wrong' ? 'Học viên không sai câu nào.' : 'Lượt này chưa có câu trả lời.'}</li>}
            </ol>
          </section>
        </div>
      )}
    </Drawer>
  );
};
