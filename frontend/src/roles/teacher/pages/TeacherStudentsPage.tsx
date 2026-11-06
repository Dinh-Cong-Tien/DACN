import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight, Mail, MessageSquarePlus, Phone, Search, Trash2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useStudentProfile, useTeacherClasses, useTeacherMutation, useTeacherStudents } from '@/shared/api/teacher';
import type { StudentNote } from '@/shared/types';
import { cn, formatDate, formatDateTime, timeAgo } from '@/shared/utils';
import { Avatar, ConfirmDialog } from '@/shared/components/ui';
import { Meter, Panel, Status, TBtn, TPageHead, TTabs, inputCls } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';
import { StudentAttemptDrawer } from '../components/StudentAttemptDrawer';
import { MistakesPanel, SelfStudyPanel } from '../components/StudentInsights';

const STATUS = { GOOD: ['green', 'Ổn định'], WARNING: ['amber', 'Cần nhắc'], RISK: ['red', 'Nguy cơ bỏ học'] } as const;
const NOTE_KIND: Record<StudentNote['kind'], [string, string]> = { NOTE: ['Ghi chú', 'bg-slate-100 text-slate-600'], REMINDER: ['Nhắc nhở', 'bg-amber-500/15 text-amber-700'], CONTACT: ['Đã liên hệ', 'bg-sky-500/10 text-sky-700'] };

/** Học viên: hồ sơ học tập từng bạn (điểm, chuyên cần, bài nộp) và nhật ký trao đổi của giáo viên */
export const TeacherStudentsPage: React.FC = () => {
  useDocumentTitle('Học viên');
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') === 'watch' ? 'watch' : 'all';
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState('');
  const [kind, setKind] = useState<StudentNote['kind']>('NOTE');
  const noteInput = React.useRef<HTMLInputElement>(null);
  const studentsQ = useTeacherStudents();
  const all = studentsQ.data ?? [];
  const classes = useTeacherClasses().data ?? [];

  const list = all.filter((s) => (filter === 'all' || s.status !== 'GOOD') && s.name.toLowerCase().includes(q.toLowerCase()));
  const selected = all.find((s) => s.id === params.get('id')) ?? list[0] ?? all[0];
  const profile = useStudentProfile(selected?.id);
  const createNote = useTeacherMutation((v: { studentId: string; kind: StudentNote['kind']; text: string }) => teacherApi.addNote(v.studentId, { kind: v.kind, text: v.text }));
  const [deletingNote, setDeletingNote] = useState<{ id: string; text: string } | null>(null);
  const [attemptId, setAttemptId] = useState<string>();
  const removeNote = useTeacherMutation(teacherApi.deleteNote);
  const select = (id: string) => setParams({ ...(filter === 'watch' ? { filter } : {}), id }, { replace: true });

  if (studentsQ.isLoading) return <TLoading />;
  if (studentsQ.error) return <TError error={studentsQ.error} onRetry={() => studentsQ.refetch()} />;
  if (!selected) {
    return (
      <div className="space-y-6">
        <TPageHead eyebrow="Khoá học & Lớp · Học viên" title="Hồ sơ học viên" />
        <Panel>
          <TEmpty title="Chưa có học viên nào" sub="Học viên tham gia lớp của bạn bằng mã mời sẽ hiện ở đây." action={<TBtn to="/teacher/classes">Mở lớp học</TBtn>} />
        </Panel>
      </div>
    );
  }

  const classNames = selected.classIds.map((id) => classes.find((c) => c.id === id)?.name).filter(Boolean).join(', ');
  const subs = (profile.data?.submissions ?? []).filter((x) => x.submittedAt);
  const myNotes = [...(profile.data?.notes ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const att = selected.attendanceRate;

  const addNote = () => {
    if (!draft.trim()) return;
    const who = selected;
    createNote.mutate(
      { studentId: who.id, kind, text: draft.trim() },
      {
        onSuccess: () => {
          setDraft('');
          toast.success('Đã lưu ghi chú', who.name);
        },
        onError: (e) => toast.error('Không lưu được ghi chú', errorMessage(e)),
      }
    );
  };

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Khoá học & Lớp · Học viên" title="Hồ sơ học viên" sub="Theo dõi từng bạn: điểm, chuyên cần, bài đã nộp và nhật ký trao đổi của giáo viên (nhắc nhở, liên hệ)." />

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Panel flush className="lg:sticky lg:top-20">
          <div className="space-y-3 px-5 pt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm học viên" className={cn(inputCls, 'w-full pl-9')} />
            </div>
            <TTabs
              value={filter}
              onChange={(k) => setParams(k === 'watch' ? { filter: k } : {}, { replace: true })}
              items={[
                { key: 'all', label: 'Tất cả', count: all.length },
                { key: 'watch', label: 'Cần theo dõi', count: all.filter((s) => s.status !== 'GOOD').length },
              ]}
            />
          </div>
          {list.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">Không có học viên phù hợp.</p>}
          <ul className="max-h-[62vh] divide-y divide-slate-100 overflow-y-auto">
            {list.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => select(s.id)} className={cn('flex w-full items-center gap-3 px-5 py-3 text-left transition-colors', s.id === selected.id ? 'bg-indigo-500/[0.06]' : 'hover:bg-slate-50')}>
                  <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                    <span className="block text-[12px] text-slate-500">
                      Điểm {s.avgScore || '—'} · chuyên cần {s.attendanceRate === null ? '—' : `${s.attendanceRate}%`}
                    </span>
                  </span>
                  <Status tone={STATUS[s.status][0]}>{''}</Status>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)]">
            <div className="flex flex-col gap-4 bg-gradient-to-r from-indigo-500/[0.08] via-indigo-500/[0.03] to-transparent p-5 sm:flex-row sm:items-center">
              <Avatar name={selected.name} src={selected.avatarUrl} size="xl" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl font-extrabold text-slate-900">{selected.name}</h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  {classNames || 'Lớp của bạn'} · hoạt động {timeAgo(selected.lastActive).toLowerCase()}
                </p>
                <div className="mt-2">
                  <Status tone={STATUS[selected.status][0]}>{STATUS[selected.status][1]}</Status>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${selected.email}`} className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 [&_svg]:h-4 [&_svg]:w-4">
                  <Mail /> Email
                </a>
                <TBtn
                  icon={<Phone />}
                  onClick={() => {
                    setKind('CONTACT');
                    noteInput.current?.focus();
                  }}
                >
                  Ghi cuộc gọi
                </TBtn>
              </div>
            </div>
            <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100 sm:grid-cols-4 sm:divide-y-0">
              {[
                ['Điểm trung bình', selected.avgScore ? String(selected.avgScore) : '—', null],
                ['Hoàn thành bài tập', `${selected.completion}%`, selected.completion],
                ['Chuyên cần', att === null ? '—' : `${att}%`, att],
                ['Ngày học liên tục', String(selected.streak), null],
              ].map(([l, v, m]) => (
                <div key={l as string} className="px-5 py-4">
                  <dt className="text-[13px] text-slate-500">{l}</dt>
                  <dd className="mt-1 font-display text-xl font-extrabold tabular-nums text-slate-900">{v}</dd>
                  {m !== null && <Meter value={m as number} tone={(m as number) < 65 ? 'red' : (m as number) < 80 ? 'amber' : 'green'} className="mt-2" />}
                </div>
              ))}
            </dl>
          </section>

          {profile.data?.self && <SelfStudyPanel self={profile.data.self} />}

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <Panel title="Nhật ký trao đổi" sub="Chỉ giáo viên và quản lý thấy" icon={MessageSquarePlus} tone="violet">
              <div className="flex gap-2">
                <select value={kind} onChange={(e) => setKind(e.target.value as StudentNote['kind'])} className={cn(inputCls, 'w-36')} aria-label="Loại ghi chú">
                  <option value="NOTE">Ghi chú</option>
                  <option value="REMINDER">Nhắc nhở</option>
                  <option value="CONTACT">Đã liên hệ</option>
                </select>
                <input ref={noteInput} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Nội dung trao đổi" className={cn(inputCls, 'min-w-0 flex-1')} />
                <TBtn variant="primary" onClick={addNote} disabled={!draft.trim() || createNote.isPending}>
                  Lưu
                </TBtn>
              </div>
              {profile.isLoading ? (
                <p className="mt-5 text-sm text-slate-500">Đang tải…</p>
              ) : myNotes.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">Chưa có ghi chú nào về học viên này.</p>
              ) : (
                <ol className="mt-5 space-y-4 border-l border-slate-200 pl-4">
                  {myNotes.map((n) => (
                    <li key={n.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-500" />
                      <p className="flex items-center gap-2 text-[12px] text-slate-500">
                        {formatDate(n.date)} <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-semibold', NOTE_KIND[n.kind][1])}>{NOTE_KIND[n.kind][0]}</span>
                        <button type="button" title="Xoá ghi chú" onClick={() => setDeletingNote({ id: n.id, text: n.text })} className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-800">{n.text}</p>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>

            <Panel title="Bài đã nộp" sub="Bài tập được giao trong lớp của bạn">
              {subs.length === 0 ? (
                <p className="text-sm text-slate-500">{profile.isLoading ? 'Đang tải…' : 'Chưa nộp bài nào.'}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {subs.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{s.assignmentTitle}</span>
                        <span className="block text-[12px] text-slate-500">{formatDateTime(s.submittedAt)}{s.status === 'LATE' ? ' · nộp muộn' : ''}</span>
                      </span>
                      {s.score !== undefined ? (
                        <span className="font-display text-lg font-extrabold tabular-nums text-slate-900">
                          {s.score}
                          <span className="text-[12px] font-normal text-slate-400">/{s.maxScore}</span>
                        </span>
                      ) : s.type === 'ESSAY' || s.type === 'SPEAKING' ? (
                        <TBtn size="sm" to={`/teacher/grading/${s.id}`}>
                          Chấm
                        </TBtn>
                      ) : (
                        <span className="text-[12px] text-slate-500">Chờ điểm</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <Panel title="Lịch sử làm bài" sub="Thi thử, luyện Part, chép chính tả gần đây">
              {(profile.data?.attempts.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">{profile.isLoading ? 'Đang tải…' : 'Học viên chưa làm bài nào.'}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {profile.data!.attempts.slice(0, 8).map((a) => (
                    <li key={a.id} className="first:pt-0 last:pb-0">
                      <button type="button" onClick={() => setAttemptId(a.id)} className="group flex w-full items-center justify-between gap-3 rounded-lg py-2.5 text-left hover:bg-slate-50" title="Xem chi tiết từng câu">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{a.testTitle}</span>
                        <span className="block text-[12px] text-slate-500">
                          {a.submittedAt ? formatDateTime(a.submittedAt) : ''}
                          {a.correct !== undefined ? ` · đúng ${a.correct}/${a.total}` : ''}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-display text-lg font-extrabold tabular-nums text-slate-900">{a.score ?? '—'}</span>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                      </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <MistakesPanel causes={profile.data?.mistakeCauses} weakTags={profile.data?.weakTags} loading={profile.isLoading} />
          </div>
        </div>
      </div>
      <StudentAttemptDrawer studentId={selected?.id} studentName={selected?.name} attemptId={attemptId} onClose={() => setAttemptId(undefined)} />
      <ConfirmDialog
        open={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={() => {
          const d = deletingNote;
          if (d) removeNote.mutate(d.id, { onSuccess: () => toast.success('Đã xoá ghi chú'), onError: (e) => toast.error('Không xoá được ghi chú', errorMessage(e)) });
          setDeletingNote(null);
        }}
        title="Xoá ghi chú?"
        message={deletingNote ? `"${deletingNote.text.slice(0, 120)}${deletingNote.text.length > 120 ? '…' : ''}"` : ''}
        confirmText="Xoá"
        danger
      />
    </div>
  );
};
