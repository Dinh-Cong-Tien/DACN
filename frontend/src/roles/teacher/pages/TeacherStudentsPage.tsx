import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, MessageSquarePlus, Phone, Search } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_SESSIONS, MOCK_STUDENT_NOTES, MOCK_SUBMISSIONS } from '@/shared/mocks';
import type { StudentNote } from '@/shared/types';
import { cn, formatDate, formatDateTime, timeAgo } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Meter, Panel, Status, TBtn, TPageHead, TTabs, inputCls } from '../components/TeacherKit';

const STATUS = { GOOD: ['green', 'Ổn định'], WARNING: ['amber', 'Cần nhắc'], RISK: ['red', 'Nguy cơ bỏ học'] } as const;
const NOTE_KIND: Record<StudentNote['kind'], [string, string]> = { NOTE: ['Ghi chú', 'bg-slate-100 text-slate-600'], REMINDER: ['Nhắc nhở', 'bg-amber-500/15 text-amber-700'], CONTACT: ['Đã liên hệ', 'bg-sky-500/10 text-sky-700'] };

/** Học viên: hồ sơ học tập từng bạn (điểm, chuyên cần, bài nộp) và nhật ký trao đổi của giáo viên */
export const TeacherStudentsPage: React.FC = () => {
  useDocumentTitle('Học viên');
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') === 'watch' ? 'watch' : 'all';
  const [q, setQ] = useState('');
  const [notes, setNotes] = useState<StudentNote[]>(MOCK_STUDENT_NOTES);
  const [draft, setDraft] = useState('');
  const [kind, setKind] = useState<StudentNote['kind']>('NOTE');
  const cls = MOCK_CLASSES[0];
  const done = MOCK_SESSIONS.filter((s) => s.classId === cls.id && s.status === 'DONE');
  const attendance = (id: string) => {
    const v = done.map((s) => s.attendance?.[id]).filter(Boolean);
    return v.length ? Math.round((v.filter((x) => x === 'PRESENT' || x === 'LATE').length / v.length) * 100) : 100;
  };

  const list = MOCK_CLASS_STUDENTS.filter((s) => (filter === 'all' || s.status !== 'GOOD') && s.name.toLowerCase().includes(q.toLowerCase()));
  const selected = MOCK_CLASS_STUDENTS.find((s) => s.id === params.get('id')) ?? list[0] ?? MOCK_CLASS_STUDENTS[0];
  const select = (id: string) => setParams({ ...(filter === 'watch' ? { filter } : {}), id }, { replace: true });
  const subs = MOCK_SUBMISSIONS.filter((s) => s.studentName === selected.name);
  const myNotes = notes.filter((n) => n.studentId === selected.id).sort((a, b) => b.date.localeCompare(a.date));

  const addNote = () => {
    if (!draft.trim()) return;
    setNotes((n) => [{ id: `nt-${Date.now()}`, studentId: selected.id, date: new Date().toISOString().slice(0, 10), kind, text: draft.trim() }, ...n]);
    setDraft('');
    toast.success('Đã lưu ghi chú', selected.name);
  };

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Học viên" title="Hồ sơ học viên" sub="Theo dõi từng bạn: điểm, chuyên cần, bài đã nộp và nhật ký trao đổi của giáo viên (nhắc nhở, liên hệ)." />

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
                { key: 'all', label: 'Tất cả', count: MOCK_CLASS_STUDENTS.length },
                { key: 'watch', label: 'Cần theo dõi', count: MOCK_CLASS_STUDENTS.filter((s) => s.status !== 'GOOD').length },
              ]}
            />
          </div>
          <ul className="max-h-[62vh] divide-y divide-slate-100 overflow-y-auto">
            {list.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => select(s.id)} className={cn('flex w-full items-center gap-3 px-5 py-3 text-left transition-colors', s.id === selected.id ? 'bg-indigo-500/[0.06]' : 'hover:bg-slate-50')}>
                  <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                    <span className="block text-[12px] text-slate-500">
                      Điểm {s.avgScore} · chuyên cần {attendance(s.id)}%
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
                  {cls.name} · hoạt động {timeAgo(selected.lastActive).toLowerCase()}
                </p>
                <div className="mt-2">
                  <Status tone={STATUS[selected.status][0]}>{STATUS[selected.status][1]}</Status>
                </div>
              </div>
              <div className="flex gap-2">
                <TBtn icon={<Mail />} onClick={() => toast.info('Mở email', selected.email)}>
                  Email
                </TBtn>
                <TBtn icon={<Phone />} onClick={() => setKind('CONTACT')}>
                  Ghi cuộc gọi
                </TBtn>
              </div>
            </div>
            <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100 sm:grid-cols-4 sm:divide-y-0">
              {[
                ['Điểm trung bình', String(selected.avgScore), null],
                ['Hoàn thành bài tập', `${selected.completion}%`, selected.completion],
                ['Chuyên cần', `${attendance(selected.id)}%`, attendance(selected.id)],
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

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <Panel title="Nhật ký trao đổi" sub="Chỉ giáo viên và quản lý thấy" icon={MessageSquarePlus} tone="violet">
              <div className="flex gap-2">
                <select value={kind} onChange={(e) => setKind(e.target.value as StudentNote['kind'])} className={cn(inputCls, 'w-36')} aria-label="Loại ghi chú">
                  <option value="NOTE">Ghi chú</option>
                  <option value="REMINDER">Nhắc nhở</option>
                  <option value="CONTACT">Đã liên hệ</option>
                </select>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Nội dung trao đổi" className={cn(inputCls, 'min-w-0 flex-1')} />
                <TBtn variant="primary" onClick={addNote} disabled={!draft.trim()}>
                  Lưu
                </TBtn>
              </div>
              {myNotes.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">Chưa có ghi chú nào về học viên này.</p>
              ) : (
                <ol className="mt-5 space-y-4 border-l border-slate-200 pl-4">
                  {myNotes.map((n) => (
                    <li key={n.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-500" />
                      <p className="flex items-center gap-2 text-[12px] text-slate-500">
                        {formatDate(n.date)} <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-semibold', NOTE_KIND[n.kind][1])}>{NOTE_KIND[n.kind][0]}</span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-800">{n.text}</p>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>

            <Panel title="Bài đã nộp" sub="Bài tự luận gần đây">
              {subs.length === 0 ? (
                <p className="text-sm text-slate-500">Chưa có bài tự luận nào.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {subs.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{s.assignmentTitle}</span>
                        <span className="block text-[12px] text-slate-500">{formatDateTime(s.submittedAt)}</span>
                      </span>
                      {s.score !== undefined ? (
                        <span className="font-display text-lg font-extrabold tabular-nums text-slate-900">
                          {s.score}
                          <span className="text-[12px] font-normal text-slate-400">/{s.maxScore}</span>
                        </span>
                      ) : (
                        <TBtn size="sm" to={`/teacher/grading/${s.id}`}>
                          Chấm
                        </TBtn>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};
