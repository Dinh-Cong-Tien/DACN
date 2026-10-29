import React, { useMemo, useState } from 'react';
import { FolderTree, BookOpen, Layers, ChevronRight, Plus, Pencil, Trash2, Database } from 'lucide-react';
import { MOCK_COURSE_TREE, MOCK_COURSES } from '@/shared/mocks';
import type { CourseTreeNode } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, Input, Modal, PageHeader, Select, StatCard, Tone } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { toast } from '@/shared/stores/uiStore';

const TYPE_META: Record<CourseTreeNode['type'], { icon: React.ElementType; tone: Tone; label: string; child: CourseTreeNode['type'] | null; cls: string }> = {
  CATEGORY: { icon: FolderTree, tone: 'amber', label: 'Danh mục', child: 'COURSE', cls: 'bg-amber-300 text-slate-900' },
  COURSE: { icon: BookOpen, tone: 'indigo', label: 'Khoá học', child: 'SECTION', cls: 'bg-indigo-600 text-white' },
  SECTION: { icon: Layers, tone: 'emerald', label: 'Chương', child: null, cls: 'bg-emerald-500 text-white' },
};

type Mode = { kind: 'add' | 'edit'; node: CourseTreeNode } | null;

function updateTree(nodes: CourseTreeNode[], id: string, fn: (n: CourseTreeNode) => CourseTreeNode | null): CourseTreeNode[] {
  return nodes.flatMap((n) => {
    if (n.id === id) {
      const r = fn(n);
      return r ? [r] : [];
    }
    return [{ ...n, children: n.children ? updateTree(n.children, id, fn) : n.children }];
  });
}

function countTree(nodes: CourseTreeNode[]): Record<CourseTreeNode['type'], number> {
  const out = { CATEGORY: 0, COURSE: 0, SECTION: 0 };
  const walk = (ns: CourseTreeNode[]) =>
    ns.forEach((n) => {
      out[n.type]++;
      if (n.children) walk(n.children);
    });
  walk(nodes);
  return out;
}

function findNode(nodes: CourseTreeNode[], id: string): CourseTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findNode(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

export const AdminCoursesPage: React.FC = () => {
  useDocumentTitle('Cây thư mục khoá học');
  const [tree, setTree] = useState<CourseTreeNode[]>(MOCK_COURSE_TREE);
  const [open, setOpen] = useState<Set<string>>(new Set(MOCK_COURSE_TREE.map((n) => n.id)));
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_COURSE_TREE[0]?.id ?? null);
  const [mode, setMode] = useState<Mode>(null);
  const [title, setTitle] = useState('');
  const [newType, setNewType] = useState<CourseTreeNode['type']>('CATEGORY');
  const [deleting, setDeleting] = useState<CourseTreeNode | null>(null);

  const counts = useMemo(() => countTree(tree), [tree]);
  const selected = selectedId ? findNode(tree, selectedId) : null;
  const selectedCourse = selected ? MOCK_COURSES.find((c) => c.id === selected.id) : undefined;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const openAdd = (node: CourseTreeNode | null) => {
    setTitle('');
    if (node) {
      setNewType(TYPE_META[node.type].child ?? 'SECTION');
      setMode({ kind: 'add', node });
    } else {
      setNewType('CATEGORY');
      setMode({ kind: 'add', node: { id: '__root', title: 'root', type: 'CATEGORY' } });
    }
  };
  const openEdit = (node: CourseTreeNode) => {
    setTitle(node.title);
    setMode({ kind: 'edit', node });
  };

  const save = () => {
    if (!mode || !title.trim()) return toast.error('Vui lòng nhập tên');
    if (mode.kind === 'edit') {
      setTree((t) => updateTree(t, mode.node.id, (n) => ({ ...n, title: title.trim() })));
      toast.success('Đã cập nhật', `"${title}" đã được lưu.`);
    } else {
      const child: CourseTreeNode = { id: `n-${Date.now().toString(36)}`, title: title.trim(), type: newType, meta: 'Mới tạo', children: newType === 'SECTION' ? undefined : [] };
      if (mode.node.id === '__root') setTree((t) => [...t, child]);
      else {
        setTree((t) => updateTree(t, mode.node.id, (n) => ({ ...n, children: [...(n.children ?? []), child] })));
        setOpen((o) => new Set(o).add(mode.node.id));
      }
      setSelectedId(child.id);
      toast.success('Đã thêm', `${TYPE_META[newType].label} "${title}" đã được tạo.`);
    }
    setMode(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setTree((t) => updateTree(t, deleting.id, () => null));
    if (selectedId === deleting.id) setSelectedId(null);
    toast.success('Đã xoá', `"${deleting.title}" và các mục con đã bị xoá.`);
    setDeleting(null);
  };

  const renderNode = (node: CourseTreeNode, depth: number, index: number) => {
    const meta = TYPE_META[node.type];
    const Icon = meta.icon;
    const hasChildren = !!node.children?.length;
    const isOpen = open.has(node.id);
    const isSel = selectedId === node.id;
    return (
      <li key={node.id} className="animate-fade-up" style={{ animationDelay: `${index * 40}ms` }}>
        <div
          onClick={() => setSelectedId(node.id)}
          className={cn('group flex items-center gap-2 pr-2 py-2 rounded-xl cursor-pointer transition-all duration-200 border-2', isSel ? 'bg-amber-100 border-slate-900 shadow-hard-sm' : 'border-transparent hover:bg-slate-100')}
          style={{ paddingLeft: 8 + depth * 22 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren || node.type !== 'SECTION') toggle(node.id);
            }}
            className={cn('w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-900/10', !hasChildren && 'opacity-0 pointer-events-none')}
          >
            <ChevronRight className={cn('w-3.5 h-3.5 transition-transform duration-300', isOpen && 'rotate-90')} />
          </button>
          <span className={cn('w-7 h-7 rounded-lg border-2 border-slate-900 flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5', meta.cls)}>
            <Icon />
          </span>
          <span className={cn('flex-1 text-sm truncate', isSel ? 'font-bold text-slate-900' : 'font-semibold text-slate-700')}>{node.title}</span>
          {node.meta && <span className="hidden sm:inline text-[11px] font-mono text-slate-500">{node.meta}</span>}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
            {meta.child && (
              <button onClick={() => openAdd(node)} className="w-7 h-7 rounded-lg hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 flex items-center justify-center" title="Thêm mục con">
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => openEdit(node)} className="w-7 h-7 rounded-lg hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 flex items-center justify-center" title="Sửa">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setDeleting(node)} className="w-7 h-7 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-700 flex items-center justify-center" title="Xoá">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {hasChildren && (
          <div className={cn('grid transition-[grid-template-rows] duration-300 ease-spring', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
            <ul className="overflow-hidden">{node.children!.map((c, i) => renderNode(c, depth + 1, i))}</ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Cây thư mục <span className="mark">khoá học</span>
          </>
        }
        icon={<FolderTree />}
        description="Tổ chức danh mục → khoá học → chương. Nhấn vào mục để xem chi tiết, di chuột để thêm/sửa/xoá."
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => openAdd(null)}>
            Thêm danh mục
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Danh mục" value={counts.CATEGORY} tone="amber" icon={<FolderTree />} />
        <StatCard label="Khoá học" value={counts.COURSE} tone="indigo" icon={<BookOpen />} />
        <StatCard label="Chương" value={counts.SECTION} tone="emerald" icon={<Layers />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <Card hard padding="sm" className="animate-fade-up">
          {tree.length ? <ul className="space-y-0.5">{tree.map((n, i) => renderNode(n, 0, i))}</ul> : <EmptyState icon={<Database />} title="Chưa có danh mục" description="Tạo danh mục đầu tiên để bắt đầu." compact />}
        </Card>

        <Card hard padding="none" className="animate-slide-in-right h-fit xl:sticky xl:top-24 overflow-hidden">
          {selected ? (
            <>
              <Img src={selectedCourse?.coverUrl ?? PHOTOS.books} alt={selected.title} ratio="video" fallbackClass="bg-amber-200" />
              <div className="p-5">
                <CardHeader
                  title={selected.title}
                  subtitle={selected.meta ?? 'Không có mô tả'}
                  icon={React.createElement(TYPE_META[selected.type].icon)}
                  action={
                    <Badge tone={TYPE_META[selected.type].tone}>
                      {TYPE_META[selected.type].label}
                    </Badge>
                  }
                />
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">ID</dt>
                    <dd className="font-mono text-xs text-slate-700">{selected.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Mục con</dt>
                    <dd className="font-mono font-bold text-slate-800">{selected.children?.length ?? 0}</dd>
                  </div>
                  {selectedCourse && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Học viên</dt>
                      <dd className="font-mono font-bold text-slate-800">{selectedCourse.studentsCount.toLocaleString('vi-VN')}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Hiển thị</dt>
                    <dd>
                      <Badge tone="emerald" dot size="xs">
                        Công khai
                      </Badge>
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-2 mt-5">
                  {TYPE_META[selected.type].child && (
                    <Button size="sm" variant="soft" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openAdd(selected)}>
                      Thêm {TYPE_META[TYPE_META[selected.type].child!].label.toLowerCase()}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => openEdit(selected)}>
                    Đổi tên
                  </Button>
                  <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleting(selected)}>
                    Xoá mục này
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState icon={<FolderTree />} title="Chọn một mục" description="Nhấn vào mục trong cây để xem chi tiết." compact />
          )}
        </Card>
      </div>

      <Modal
        open={!!mode}
        onClose={() => setMode(null)}
        title={mode?.kind === 'edit' ? 'Đổi tên' : mode?.node.id === '__root' ? 'Thêm danh mục' : `Thêm vào "${mode?.node.title}"`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMode(null)}>
              Huỷ
            </Button>
            <Button onClick={save}>{mode?.kind === 'edit' ? 'Lưu' : 'Tạo'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tên" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên..." autoFocus required />
          {mode?.kind === 'add' && mode.node.id === '__root' && (
            <Select label="Loại" value={newType} onChange={(e) => setNewType(e.target.value as CourseTreeNode['type'])} options={[{ value: 'CATEGORY', label: 'Danh mục' }]} />
          )}
          {mode?.kind === 'add' && mode.node.id !== '__root' && (
            <p className="text-xs text-slate-500">
              Sẽ tạo <b>{TYPE_META[newType].label.toLowerCase()}</b> bên trong mục đã chọn.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} danger title={`Xoá "${deleting?.title}"?`} message="Tất cả mục con bên trong cũng sẽ bị xoá. Hành động không thể hoàn tác." confirmText="Xoá" />
    </div>
  );
};
