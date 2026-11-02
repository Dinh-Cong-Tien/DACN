import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileText, Music, Video, File } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { useQueries } from '@tanstack/react-query';
import { ASSIGNMENT_TYPE_LABEL, describeTarget } from '@/shared/constants/student';
import { api, errorMessage } from '@/shared/api/client';
import { useJoinClass, useMyAssignments, useMyClasses, type ClassDetailDto } from '@/shared/api/learner';
import type { Assignment, Material, MyAssignmentState } from '@/shared/types';
import { assignmentHref, cn, formatDate, formatDateTime } from '@/shared/utils';
import { PageHeader } from '@/shared/components/ui';

type Row = Assignment & { me: MyAssignmentState };
type TabKey = 'TODO' | 'SUBMITTED' | 'GRADED';

const MAT_ICON: Record<Material['type'], React.ElementType> = { VIDEO: Video, PDF: FileText, DOC: File, AUDIO: Music };

/** Bài đã nộp đang chờ chấm, bài trắc nghiệm / bài giảng đã làm xong thì không cần giáo viên chấm */
const doneText = (r: Row) => (r.type === 'ESSAY' || r.type === 'SPEAKING' ? 'Đã nộp, chờ giáo viên chấm' : 'Đã hoàn thành');

/** Điểm hiển thị: đề full theo thang điểm, bài luyện Part / ngữ pháp theo số câu đúng, Viết / Nói thang 10 */
const scoreText = (r: Row) => (r.me.score === undefined ? '' : r.type === 'PRACTICE' || r.type === 'GRAMMAR' ? `${r.me.score} câu đúng` : r.type === 'ESSAY' || r.type === 'SPEAKING' ? `${r.me.score}/10` : String(r.me.score));

const dueText = (iso: string) => {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: `Quá hạn ${-days} ngày`, late: true };
  if (days === 0) return { text: 'Hết hạn hôm nay', late: true };
  return { text: `Còn ${days} ngày`, late: days <= 1 };
};

/**
 * Lớp của tôi: lớp đã tham gia bằng mã mời, bài giáo viên giao (bấm là mở đúng bài: phòng thi, bài giảng, đề Viết / Nói…),
 * điểm và nhận xét giáo viên trả, tài liệu lớp.
 */
export const StudentClassesPage: React.FC = () => {
  useDocumentTitle('Lớp của tôi');
  const [tab, setTab] = useState<TabKey>('TODO');
  const [code, setCode] = useState('');
  const { data: classes = [], isLoading } = useMyClasses();
  const { data: mine } = useMyAssignments();
  const joinClass = useJoinClass();
  const rows: Row[] = (mine?.assignments ?? []).filter((a) => a.status !== 'DRAFT' && mine?.states[a.id]).map((a) => ({ ...a, me: mine!.states[a.id] }));
  // Tài liệu nằm trong chi tiết từng lớp
  const details = useQueries({ queries: classes.map((c) => ({ queryKey: ['learner', 'classes', c.id], queryFn: () => api.get<ClassDetailDto>(`/learner/classes/${c.id}`) })) });
  const groups: Record<TabKey, Row[]> = {
    TODO: rows.filter((r) => r.me.status === 'TODO').sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    SUBMITTED: rows.filter((r) => r.me.status === 'SUBMITTED'),
    GRADED: rows.filter((r) => r.me.status === 'GRADED'),
  };
  const materials = details.flatMap((d) => d.data?.materials ?? []);
  // Bài trắc nghiệm được giao: gắn ?assignment= để lượt làm bài cập nhật bài nộp
  const hrefOf = (r: Row) => {
    const h = assignmentHref(r.target);
    return r.target.kind === 'EXAM' ? `${h}${h.includes('?') ? '&' : '?'}assignment=${r.id}` : h;
  };

  const join = () => {
    if (!/^ORB-[A-Z0-9]{4}$/.test(code)) return toast.error('Mã lớp chưa đúng', 'Mã có dạng ORB-XXXX, giáo viên gửi khi mở lớp.');
    joinClass.mutate(code, {
      onSuccess: (c) => {
        toast.success('Đã vào lớp', c.name);
        setCode('');
      },
      onError: (e) => toast.error('Chưa vào được lớp', errorMessage(e)),
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Lớp của tôi" description="Bài tập giáo viên giao, điểm và nhận xét, tài liệu của lớp." />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {classes.map((c) => (
          <article key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[12px] text-slate-500">
              {c.examType} · mã lớp {c.code}
            </p>
            <h2 className="mt-0.5 text-[17px] font-semibold text-slate-900">{c.name}</h2>
            <dl className="mt-3 space-y-1 text-[13px]">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-500">Giáo viên</dt>
                <dd className="text-slate-800">{c.teacherName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-500">Lịch học</dt>
                <dd className="text-slate-800">{c.schedule}</dd>
              </div>
              {c.room && (
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-slate-500">Phòng</dt>
                  <dd className="text-slate-800">{c.room}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-500">Bài cần làm</dt>
                <dd className="text-slate-800">{groups.TODO.filter((r) => r.classId === c.id).length}</dd>
              </div>
            </dl>
          </article>
        ))}
        <div className="rounded-xl border border-dashed border-slate-300 p-4">
          <h2 className="text-[15px] font-semibold text-slate-900">Vào lớp mới</h2>
          <p className="mt-1 text-[13px] text-slate-500">Nhập mã mời giáo viên gửi cho bạn.</p>
          <div className="mt-3 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} placeholder="ORB-XXXX" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 font-mono text-sm uppercase tracking-wider text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            <button type="button" onClick={join} className="h-9 rounded-md bg-indigo-600 px-3.5 text-sm font-medium text-white hover:bg-indigo-700">
              Vào lớp
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex gap-5 overflow-x-auto border-b border-slate-200" role="tablist">
          {(
            [
              ['TODO', 'Cần làm'],
              ['SUBMITTED', 'Đã nộp'],
              ['GRADED', 'Đã có điểm'],
            ] as [TabKey, string][]
          ).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('-mb-px shrink-0 border-b-2 pb-2.5 text-sm', tab === k ? 'border-indigo-600 font-medium text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800')}>
              {label} <span className="ml-1 tabular-nums text-slate-400">{groups[k].length}</span>
            </button>
          ))}
        </div>

        {groups[tab].length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">{tab === 'TODO' ? 'Bạn đã làm hết bài được giao.' : 'Chưa có bài nào.'}</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {groups[tab].map((r) => {
              const due = dueText(r.dueDate);
              return (
                <li key={r.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
                  <div className="min-w-0">
                    <p className="text-[12px] text-slate-500">
                      {r.className} · {ASSIGNMENT_TYPE_LABEL[r.type]}
                    </p>
                    <h3 className="mt-0.5 font-semibold text-slate-900">{r.title}</h3>
                    <p className="mt-0.5 text-[13px] text-slate-600">{describeTarget(r.target)}</p>
                    {r.note && tab === 'TODO' && <p className="mt-1.5 border-l-2 border-slate-200 pl-3 text-[13px] text-slate-600">Giáo viên dặn: {r.note}</p>}
                    {tab === 'GRADED' && r.me.feedback && (
                      <p className="mt-1.5 border-l-2 border-indigo-300 pl-3 text-[13px] text-slate-700">
                        <span className="text-slate-500">Nhận xét của {classes.find((c) => c.id === r.classId)?.teacherName}:</span> {r.me.feedback}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 md:justify-end">
                    {tab === 'TODO' ? (
                      <>
                        <span className="text-right text-[13px]">
                          <span className="block tabular-nums text-slate-700">Hạn {formatDateTime(r.dueDate)}</span>
                          <span className={cn('block', due.late ? 'text-rose-600' : 'text-slate-500')}>{due.text}</span>
                        </span>
                        <Link to={hrefOf(r)} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 text-sm font-medium text-white hover:bg-indigo-700">
                          Làm bài <ArrowRight className="h-4 w-4" />
                        </Link>
                      </>
                    ) : tab === 'SUBMITTED' ? (
                      <span className="text-right text-[13px]">
                        <span className="block text-slate-700">{doneText(r)}</span>
                        {r.me.submittedAt && <span className="block tabular-nums text-slate-500">Nộp lúc {formatDateTime(r.me.submittedAt)}</span>}
                      </span>
                    ) : (
                      <span className="text-right">
                        <span className="block text-lg font-semibold tabular-nums text-slate-900">{scoreText(r)}</span>
                        {r.me.submittedAt && <span className="block text-[12px] tabular-nums text-slate-500">Nộp ngày {formatDate(r.me.submittedAt)}</span>}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[17px] font-semibold text-slate-900">Tài liệu lớp</h2>
        <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {materials.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">{isLoading ? 'Đang tải…' : 'Lớp chưa có tài liệu nào.'}</li>}
          {materials.map((m) => {
            const Icon = MAT_ICON[m.type];
            return (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">{m.title}</span>
                  <span className="block text-[12px] text-slate-500">
                    {classes.find((c) => c.id === m.classId)?.name} · {m.size} · {formatDate(m.uploadedAt)}
                  </span>
                </span>
                <button type="button" onClick={() => (m.fileUrl ? window.open(m.fileUrl, '_blank', 'noopener') : toast.info('Tài liệu chưa có tệp đính kèm', m.title))} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-900">
                  <Download className="h-4 w-4" /> Tải
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
