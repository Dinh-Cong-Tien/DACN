import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, FileText, Megaphone, Pin, Search, Trash2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { headApi, useHeadAnnouncements, useHeadClasses, useHeadMaterials, useHeadMutation } from '@/shared/api/head';
import { Modal, Textarea } from '@/shared/components/ui';
import { cn, formatDate, staffPath } from '@/shared/utils';
import { Figures, Panel, TBtn, TPageHead, TTabs, inputCls, tbl } from '@/roles/teacher/components/TeacherKit';

const TYPE_LABEL: Record<string, string> = { VIDEO: 'Video', PDF: 'PDF', DOC: 'Tài liệu', AUDIO: 'Audio', LINK: 'Liên kết' };
type Target = { kind: 'material' | 'announcement'; id: string; title: string };

/** Tài liệu giáo viên tải lên và bảng tin lớp: rà soát nội dung, gỡ bài không phù hợp (kèm lý do gửi giáo viên) */
export const HeadClassContentPage: React.FC = () => {
  useDocumentTitle('Tài liệu & bảng tin lớp');
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'announcements' ? 'announcements' : 'materials';
  const [classId, setClassId] = useState('');
  const [q, setQ] = useState('');
  const [target, setTarget] = useState<Target>();
  const [reason, setReason] = useState('');
  const materials = useHeadMaterials();
  const anns = useHeadAnnouncements();
  const classes = useHeadClasses().data ?? [];
  const match = (r: { classId: string | null; title: string }) => (!classId || r.classId === classId) && r.title.toLowerCase().includes(q.toLowerCase());
  const mList = (materials.data ?? []).filter(match);
  const aList = (anns.data ?? []).filter(match);
  const remove = useHeadMutation((t: Target & { reason: string }) => (t.kind === 'material' ? headApi.removeMaterial(t.id, t.reason) : headApi.removeAnnouncement(t.id, t.reason)));
  const submit = async () => {
    if (!target) return;
    if (reason.trim().length < 3) return toast.error('Nhập lý do gỡ', 'Lý do được gửi tới giáo viên đã đăng.');
    try {
      await remove.mutateAsync({ ...target, reason: reason.trim() });
      toast.success('Đã gỡ', `${target.title} · đã báo giáo viên`);
      setTarget(undefined);
      setReason('');
    } catch (e) {
      toast.error('Không gỡ được', errorMessage(e));
    }
  };
  const ClassCell: React.FC<{ id: string | null; name: string; teacher: string }> = ({ id, name, teacher }) => (
    <td className={cn(tbl.td, 'whitespace-nowrap')}>
      {id ? (
        <Link to={staffPath(`/classes/${id}`)} className="text-slate-800 hover:text-indigo-700">
          {name}
        </Link>
      ) : (
        name
      )}
      <p className="text-[12px] text-slate-500">{teacher}</p>
    </td>
  );

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Giảng dạy" title="Tài liệu & bảng tin lớp" sub="Tài liệu giáo viên tải lên cho lớp và các bài đăng trên bảng tin lớp. Nội dung không phù hợp có thể gỡ, giáo viên nhận thông báo kèm lý do." />
      <Figures
        items={[
          { label: 'Tài liệu lớp', value: materials.data?.length ?? '—', note: `${(materials.data ?? []).reduce((s, m) => s + m.downloads, 0)} lượt tải`, icon: FileText, tone: 'indigo' },
          { label: 'Bài bảng tin', value: anns.data?.length ?? '—', note: `${(anns.data ?? []).filter((a) => a.pinned).length} bài ghim`, icon: Megaphone, tone: 'amber' },
        ]}
        className="lg:grid-cols-2"
      />
      <Panel flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 pt-3 lg:flex-row lg:items-end lg:justify-between">
          <TTabs
            className="border-b-0"
            value={tab}
            onChange={(k) => setParams(k === 'materials' ? {} : { tab: k }, { replace: true })}
            items={[
              { key: 'materials', label: 'Tài liệu', count: mList.length },
              { key: 'announcements', label: 'Bảng tin', count: aList.length },
            ]}
          />
          <div className="flex flex-col gap-2 pb-3 sm:flex-row">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'sm:w-56')} aria-label="Lọc theo lớp">
              <option value="">Tất cả lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="relative sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tiêu đề" className={cn(inputCls, 'w-full pl-9')} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {tab === 'materials' ? (
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Tài liệu</th>
                  <th className={tbl.th}>Lớp · Giáo viên</th>
                  <th className={tbl.th}>Loại</th>
                  <th className={cn(tbl.th, 'text-right')}>Lượt tải</th>
                  <th className={tbl.th}>Ngày đăng</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {mList.map((m) => (
                  <tr key={m.id} className={tbl.tr}>
                    <td className={tbl.td}>
                      <p className="font-medium text-slate-900">{m.title}</p>
                      <p className="text-[12px] text-slate-500">{[m.category, m.size].filter(Boolean).join(' · ')}</p>
                    </td>
                    <ClassCell id={m.classId} name={m.className} teacher={m.teacherName} />
                    <td className={tbl.td}>{TYPE_LABEL[m.type] ?? m.type}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{m.downloads}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{formatDate(m.createdAt)}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                      <span className="inline-flex gap-1.5">
                        {m.url && (
                          <TBtn size="sm" icon={<ExternalLink />} onClick={() => window.open(m.url, '_blank', 'noopener')}>
                            Mở
                          </TBtn>
                        )}
                        <TBtn size="sm" icon={<Trash2 />} onClick={() => setTarget({ kind: 'material', id: m.id, title: m.title })}>
                          Gỡ
                        </TBtn>
                      </span>
                    </td>
                  </tr>
                ))}
                {!mList.length && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      {materials.isLoading ? 'Đang tải…' : 'Chưa có tài liệu nào.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <ul className="divide-y divide-slate-100">
              {aList.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                      {a.pinned && <Pin className="h-3.5 w-3.5 text-amber-600" aria-label="Đã ghim" />}
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      <Link to={staffPath(`/classes/${a.classId}`)} className="hover:text-indigo-700">
                        {a.className}
                      </Link>{' '}
                      · {a.teacherName} · {formatDate(a.createdAt)} · {a.readCount}/{a.classSize} học viên đã đọc
                    </p>
                    <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-slate-700">{a.body}</p>
                  </div>
                  <TBtn size="sm" icon={<Trash2 />} onClick={() => setTarget({ kind: 'announcement', id: a.id, title: a.title })}>
                    Gỡ
                  </TBtn>
                </li>
              ))}
              {!aList.length && <li className="px-5 py-10 text-center text-sm text-slate-500">{anns.isLoading ? 'Đang tải…' : 'Chưa có bài đăng nào.'}</li>}
            </ul>
          )}
        </div>
      </Panel>
      <Modal
        open={!!target}
        onClose={() => setTarget(undefined)}
        title={target?.kind === 'material' ? 'Gỡ tài liệu' : 'Gỡ bài bảng tin'}
        description={target?.title}
        footer={
          <>
            <TBtn onClick={() => setTarget(undefined)}>Huỷ</TBtn>
            <TBtn variant="primary" onClick={() => void submit()} disabled={remove.isPending}>
              Gỡ và báo giáo viên
            </TBtn>
          </>
        }
      >
        <Textarea label="Lý do" required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Tài liệu có bản quyền, không được chia sẻ công khai" />
      </Modal>
    </div>
  );
};
