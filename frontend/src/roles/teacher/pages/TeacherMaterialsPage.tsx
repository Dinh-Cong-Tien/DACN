import React, { useState } from 'react';
import { Upload, FileText, Video, Music, File, Trash2, ExternalLink, Link2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { fileHref, teacherApi, useMaterials, useTeacherClasses, useTeacherMutation, type MaterialType, type TMaterial } from '@/shared/api/teacher';
import { cn, formatDate } from '@/shared/utils';
import { ConfirmDialog, Input, Modal, Select } from '@/shared/components/ui';
import { Figures, TBtn, TPageHead, TTabs, inputCls, tbl } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';

const ICON: Record<MaterialType, React.ElementType> = { VIDEO: Video, PDF: FileText, DOC: File, AUDIO: Music, LINK: Link2 };
const LABEL: Record<MaterialType, string> = { VIDEO: 'Video', PDF: 'PDF', DOC: 'Word', AUDIO: 'Audio', LINK: 'Liên kết' };
const MAX_UPLOAD_MB = 25;

/** Đoán loại tài liệu theo đường dẫn */
const typeOf = (url: string): MaterialType => {
  const u = url.toLowerCase();
  if (/youtu\.?be|vimeo|\.mp4|\.webm|\.mov/.test(u)) return 'VIDEO';
  if (/\.mp3|\.wav|\.m4a/.test(u)) return 'AUDIO';
  if (/\.pdf/.test(u)) return 'PDF';
  if (/\.docx?|docs\.google\.com\/document/.test(u)) return 'DOC';
  return 'LINK';
};

export const TeacherMaterialsPage: React.FC = () => {
  useDocumentTitle('Tài liệu lớp');
  const classes = useTeacherClasses().data ?? [];
  const [classId, setClassId] = useState('');
  const { data: list = [], isLoading, error, refetch } = useMaterials(classId || undefined);
  const [deleting, setDeleting] = useState<TMaterial | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ classId: '', title: '', url: '', type: 'LINK' as MaterialType });
  const [mode, setMode] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const add = useTeacherMutation(teacherApi.addMaterial);
  const uploadFile = useTeacherMutation(teacherApi.uploadMaterial);
  const remove = useTeacherMutation(teacherApi.deleteMaterial);
  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? '—';

  const openAdd = () => {
    setForm({ classId: classId || classes[0]?.id || '', title: '', url: '', type: 'LINK' });
    setFile(null);
    setOpen(true);
  };
  const save = () => {
    if (!form.classId) return toast.error('Chọn lớp nhận tài liệu');
    if (mode === 'file') {
      if (!file) return toast.error('Chọn tệp cần tải lên');
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return toast.error(`Tệp vượt quá ${MAX_UPLOAD_MB} MB`, 'Hãy nén tệp hoặc dán đường dẫn Google Drive.');
      const title = form.title.trim() || file.name.replace(/\.[^.]+$/, '');
      return uploadFile.mutate(
        { classId: form.classId, title, file },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success('Đã tải tài liệu lên', `Lớp ${className(form.classId)} nhận được thông báo.`);
          },
          onError: (e) => toast.error('Không tải lên được tài liệu', errorMessage(e)),
        }
      );
    }
    if (!form.title.trim()) return toast.error('Vui lòng nhập tên tài liệu');
    if (!/^https?:\/\/\S+$/.test(form.url.trim())) return toast.error('Đường dẫn chưa hợp lệ', 'Nhập link bắt đầu bằng http:// hoặc https://');
    add.mutate(
      { classId: form.classId, title: form.title.trim(), type: form.type, fileUrl: form.url.trim() },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success('Đã thêm tài liệu', `Lớp ${className(form.classId)} nhận được thông báo.`);
        },
        onError: (e) => toast.error('Không thêm được tài liệu', errorMessage(e)),
      }
    );
  };

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Học liệu' }, { label: 'Tài liệu lớp' }]}
        title="Tài liệu lớp"
        sub="Tài liệu riêng của từng lớp: slide, bài mẫu, audio, video quay buổi học. Học viên mở ở mục Lớp của tôi."
        actions={
          <TBtn variant="primary" icon={<Upload />} onClick={openAdd} disabled={!classes.length}>
            Thêm tài liệu
          </TBtn>
        }
      />

      <Figures
        items={[
          { label: 'Tài liệu', value: list.length, note: classId ? className(classId) : 'tất cả các lớp' },
          { label: 'Video / audio', value: list.filter((m) => m.type === 'VIDEO' || m.type === 'AUDIO').length, note: 'bài giảng, file nghe' },
          { label: 'Lượt học viên tải', value: list.reduce((a, m) => a + m.downloads, 0), note: 'tính từ đầu khoá' },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'sm:w-64')} aria-label="Lọc theo lớp">
          <option value="">Tất cả lớp</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-[13px] text-slate-500">Thêm bằng đường dẫn Google Drive, OneDrive, YouTube… đã chia sẻ quyền xem</p>
      </div>

      {isLoading ? (
        <TLoading />
      ) : error ? (
        <TError error={error} onRetry={() => refetch()} />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          {list.length === 0 ? (
            <TEmpty title="Chưa có tài liệu" sub="Bấm “Thêm tài liệu” để chia sẻ slide, bài mẫu hoặc video cho lớp." />
          ) : (
            <div className="overflow-x-auto">
              <table className={tbl.table}>
                <thead className={tbl.thead}>
                  <tr>
                    <th className={tbl.th}>Tên tài liệu</th>
                    <th className={tbl.th}>Lớp</th>
                    <th className={tbl.th}>Loại</th>
                    <th className={cn(tbl.th, 'text-right')}>Dung lượng</th>
                    <th className={tbl.th}>Ngày thêm</th>
                    <th className={cn(tbl.th, 'text-right')}>Lượt tải</th>
                    <th className={tbl.th} />
                  </tr>
                </thead>
                <tbody>
                  {list.map((m) => {
                    const Icon = ICON[m.type] ?? File;
                    return (
                      <tr key={m.id} className={tbl.tr}>
                        <td className={tbl.td}>
                          <span className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="font-medium text-slate-900">{m.title}</span>
                          </span>
                        </td>
                        <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{className(m.classId)}</td>
                        <td className={cn(tbl.td, 'text-slate-600')}>{LABEL[m.type] ?? m.type}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{m.size}</td>
                        <td className={cn(tbl.td, 'tabular-nums text-slate-600')}>{formatDate(m.uploadedAt)}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums')}>{m.downloads}</td>
                        <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                          {m.fileUrl && (
                            <a href={fileHref(m.fileUrl)} target="_blank" rel="noreferrer" title="Mở tài liệu" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button type="button" title="Xoá" onClick={() => setDeleting(m)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-500/10 hover:text-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Thêm tài liệu"
        description={mode === 'file' ? `Tải tệp từ máy (PDF, Word, PowerPoint, Excel, MP3, MP4, ảnh · tối đa ${MAX_UPLOAD_MB} MB). Chỉ thành viên lớp mở được.` : 'Học viên trong lớp nhận thông báo và mở được tài liệu ngay.'}
        icon={<Upload />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={save} disabled={add.isPending || uploadFile.isPending}>
              {add.isPending || uploadFile.isPending ? 'Đang lưu…' : mode === 'file' ? 'Tải lên' : 'Thêm tài liệu'}
            </TBtn>
          </>
        }
      >
        <div className="space-y-4">
          <TTabs value={mode} onChange={(k) => setMode(k as 'file' | 'link')} items={[{ key: 'file', label: 'Tải tệp lên' }, { key: 'link', label: 'Dán đường dẫn' }]} />
          <Select label="Lớp" options={classes.map((c) => ({ value: c.id, label: c.name }))} value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} />
          {mode === 'file' && (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-indigo-400">
              <Upload className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">{file ? file.name : 'Chọn tệp từ máy'}</span>
              <span className="text-[12px] text-slate-500">{file ? `${(file.size / 1048576).toFixed(1)} MB` : `Tối đa ${MAX_UPLOAD_MB} MB`}</span>
              <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp3,.m4a,.wav,.mp4,.webm,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          )}
          <Input label="Tên tài liệu" required={mode === 'link'} placeholder={mode === 'file' ? 'Mặc định lấy theo tên tệp' : 'VD: Slide buổi 5 — Part 3'} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          {mode === 'link' && <Input label="Đường dẫn" required placeholder="https://drive.google.com/…" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value, type: typeOf(e.target.value) }))} />}
          {mode === 'link' && <Select label="Loại" options={[{ value: 'PDF', label: 'PDF' }, { value: 'VIDEO', label: 'Video' }, { value: 'DOC', label: 'Tài liệu Word' }, { value: 'AUDIO', label: 'Audio' }, { value: 'LINK', label: 'Liên kết khác' }]} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MaterialType }))} />}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            const d = deleting;
            remove.mutate(d.id, { onSuccess: () => toast.success('Đã xoá tài liệu', d.title), onError: (e) => toast.error('Không xoá được tài liệu', errorMessage(e)) });
          }
          setDeleting(null);
        }}
        danger
        title="Xoá tài liệu?"
        message={deleting?.title}
        confirmText="Xoá"
      />
    </div>
  );
};
