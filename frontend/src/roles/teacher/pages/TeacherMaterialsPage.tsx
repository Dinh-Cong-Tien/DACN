import React, { useRef, useState } from 'react';
import { Upload, FileText, Video, Music, File, Trash2, Download } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_MATERIALS, MOCK_CLASSES } from '@/shared/mocks';
import type { Material } from '@/shared/types';
import { cn, formatDate } from '@/shared/utils';
import { ConfirmDialog } from '@/shared/components/ui';
import { Figures, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';

const ICON: Record<Material['type'], React.ElementType> = { VIDEO: Video, PDF: FileText, DOC: File, AUDIO: Music };
const LABEL: Record<Material['type'], string> = { VIDEO: 'Video', PDF: 'PDF', DOC: 'Word', AUDIO: 'Audio' };

const fmtSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const typeOf = (name: string): Material['type'] => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['mp4', 'webm', 'mov'].includes(ext)) return 'VIDEO';
  if (['mp3', 'wav', 'm4a'].includes(ext)) return 'AUDIO';
  if (ext === 'pdf') return 'PDF';
  return 'DOC';
};

export const TeacherMaterialsPage: React.FC = () => {
  useDocumentTitle('Tài liệu lớp');
  const [rows, setRows] = useState<Material[]>(MOCK_MATERIALS);
  const [classId, setClassId] = useState('');
  const [drag, setDrag] = useState(false);
  const [deleting, setDeleting] = useState<Material | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = rows.filter((m) => !classId || m.classId === classId);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const target = classId || MOCK_CLASSES[0].id;
    const added: Material[] = Array.from(files).map((f) => ({ id: `mt-${Date.now().toString(36)}-${f.name.length}`, classId: target, title: f.name, type: typeOf(f.name), size: fmtSize(f.size), uploadedAt: new Date().toISOString().slice(0, 10), downloads: 0 }));
    setRows((r) => [...added, ...r]);
    toast.success(`Đã tải lên ${added.length} tài liệu`, `Lớp ${MOCK_CLASSES.find((c) => c.id === target)?.name}`);
  };

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Học liệu' }, { label: 'Tài liệu lớp' }]}
        title="Tài liệu lớp"
        sub="File riêng của từng lớp: slide, bài mẫu, audio, video quay buổi học. Học viên tải ở mục Lớp của tôi."
        actions={
          <TBtn variant="primary" icon={<Upload />} onClick={() => inputRef.current?.click()}>
            Tải lên
          </TBtn>
        }
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <Figures
        items={[
          { label: 'Tài liệu', value: list.length, note: classId ? MOCK_CLASSES.find((c) => c.id === classId)?.name : 'tất cả các lớp' },
          { label: 'Video / audio', value: list.filter((m) => m.type === 'VIDEO' || m.type === 'AUDIO').length, note: 'bài giảng, file nghe' },
          { label: 'Lượt học viên tải', value: list.reduce((a, m) => a + m.downloads, 0), note: 'tính từ đầu khoá' },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputCls, 'sm:w-64')} aria-label="Lọc theo lớp">
          <option value="">Tất cả lớp</option>
          {MOCK_CLASSES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-[13px] text-slate-500">File tải lên khi đang lọc sẽ vào đúng lớp đó · MP4, PDF, DOCX, MP3 · tối đa 500 MB</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn('rounded-lg border bg-white transition-colors', drag ? 'border-dashed border-indigo-500 bg-indigo-500/[0.03]' : 'border-slate-200')}
      >
        {list.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">Chưa có tài liệu. Kéo thả file vào đây để tải lên.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Tên tài liệu</th>
                  <th className={tbl.th}>Lớp</th>
                  <th className={tbl.th}>Loại</th>
                  <th className={cn(tbl.th, 'text-right')}>Dung lượng</th>
                  <th className={tbl.th}>Ngày tải lên</th>
                  <th className={cn(tbl.th, 'text-right')}>Lượt tải</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {list.map((m) => {
                  const Icon = ICON[m.type];
                  return (
                    <tr key={m.id} className={tbl.tr}>
                      <td className={tbl.td}>
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="font-medium text-slate-900">{m.title}</span>
                        </span>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{MOCK_CLASSES.find((c) => c.id === m.classId)?.name ?? '—'}</td>
                      <td className={cn(tbl.td, 'text-slate-600')}>{LABEL[m.type]}</td>
                      <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{m.size}</td>
                      <td className={cn(tbl.td, 'tabular-nums text-slate-600')}>{formatDate(m.uploadedAt)}</td>
                      <td className={cn(tbl.td, 'text-right tabular-nums')}>{m.downloads}</td>
                      <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                        <button type="button" title="Tải xuống" onClick={() => toast.info('Đang tải xuống', m.title)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
                          <Download className="h-4 w-4" />
                        </button>
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

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            setRows((r) => r.filter((x) => x.id !== deleting.id));
            toast.success('Đã xoá tài liệu');
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
