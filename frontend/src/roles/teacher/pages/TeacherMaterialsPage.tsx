import React, { useRef, useState } from 'react';
import { FolderOpen, Upload, FileText, Video, Music, File, MoreHorizontal, Trash2, Download } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_MATERIALS, MOCK_CLASSES } from '@/shared/mocks';
import type { Material } from '@/shared/types';
import { cn, formatDate } from '@/shared/utils';
import { Badge, Card, Column, ConfirmDialog, DataTable, Dropdown, PageHeader, Select, StatCard } from '@/shared/components/ui';

const ICON: Record<Material['type'], React.ElementType> = { VIDEO: Video, PDF: FileText, DOC: File, AUDIO: Music };
const TONE: Record<Material['type'], string> = { VIDEO: 'bg-rose-50 text-rose-600', PDF: 'bg-indigo-50 text-indigo-600', DOC: 'bg-sky-50 text-sky-600', AUDIO: 'bg-amber-50 text-amber-600' };

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

  const cols: Column<Material>[] = [
    { key: 'title', header: 'Tài liệu', render: (r) => { const Icon = ICON[r.type]; return (<div className="flex items-center gap-3"><span className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', TONE[r.type])}><Icon className="w-4 h-4" /></span><div className="min-w-0"><p className="font-bold text-slate-900 truncate">{r.title}</p><p className="text-[11px] text-slate-500">{formatDate(r.uploadedAt)}</p></div></div>); } },
    { key: 'type', header: 'Loại', render: (r) => <Badge tone="slate" size="xs">{r.type}</Badge> },
    { key: 'classId', header: 'Lớp', render: (r) => <span className="text-xs font-semibold">{MOCK_CLASSES.find((c) => c.id === r.classId)?.name ?? '—'}</span> },
    { key: 'size', header: 'Dung lượng', align: 'center' },
    { key: 'downloads', header: 'Lượt tải', align: 'center', render: (r) => <span className="font-bold">{r.downloads}</span> },
    { key: 'actions', header: '', align: 'right', width: '56px', render: (r) => (<Dropdown trigger={<button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><MoreHorizontal className="w-4 h-4" /></button>} items={[{ label: 'Tải xuống', icon: <Download />, onClick: () => toast.info('Đang tải xuống', r.title) }, { divider: true, label: '' }, { label: 'Xoá', icon: <Trash2 />, danger: true, onClick: () => setDeleting(r) }]} />) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Tài liệu lớp" description="Tải video bài giảng, PDF, audio cho các lớp phụ trách." icon={<FolderOpen />} />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Tổng tài liệu" value={rows.length} tone="indigo" />
        <StatCard label="Video" value={rows.filter((m) => m.type === 'VIDEO').length} tone="rose" />
        <StatCard label="Lượt tải" value={rows.reduce((a, m) => a + m.downloads, 0)} tone="emerald" />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn('border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 animate-fade-up', drag ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30')}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        <div className={cn('w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center', drag ? 'bg-emerald-600 text-white animate-bounce-soft' : 'bg-emerald-50 text-emerald-600')}><Upload className="w-6 h-6" /></div>
        <p className="font-bold text-slate-900">Kéo thả file vào đây hoặc nhấn để chọn</p>
        <p className="text-xs text-slate-500 mt-1">MP4, PDF, DOCX, MP3 · tối đa 500 MB mỗi file</p>
      </div>

      <Card padding="sm" className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500">Lọc theo lớp:</span>
        <div className="w-64"><Select inputSize="sm" placeholder="Tất cả lớp" options={MOCK_CLASSES.map((c) => ({ value: c.id, label: c.name }))} value={classId} onChange={(e) => setClassId(e.target.value)} /></div>
      </Card>

      <DataTable columns={cols} rows={list} emptyTitle="Chưa có tài liệu" className="animate-fade-up" />

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => { if (deleting) { setRows((r) => r.filter((x) => x.id !== deleting.id)); toast.success('Đã xoá tài liệu'); } setDeleting(null); }} danger title="Xoá tài liệu?" message={deleting?.title} confirmText="Xoá" />
    </div>
  );
};
