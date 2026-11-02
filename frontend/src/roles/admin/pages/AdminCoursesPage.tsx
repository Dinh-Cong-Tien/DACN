import React, { useMemo, useState } from 'react';
import { FolderTree, BookOpen, Layers, ChevronRight, Plus, Pencil, Trash2, Database, Users, Eye, ListTree, Send, Undo2, PlayCircle, FileText, ClipboardCheck } from 'lucide-react';
import type { CourseTreeNode } from '@/shared/types';
import { adminApi, useAdminCourses, useAdminCourseTree, useAdminInvalidate, type AdminTreeNode, type TreeLesson } from '@/shared/api/admin';
import { LessonDialog } from '../components/LessonDialog';
import { errorMessage } from '@/shared/api/client';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Button, ConfirmDialog, EmptyState, Input, Modal, Select, Switch, Textarea } from '@/shared/components/ui';
import { Figures, IconTile, Panel, Status, TBtn, TPageHead, type Tone } from '@/roles/teacher/components/TeacherKit';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { toast } from '@/shared/stores/uiStore';

const TYPE_META: Record<CourseTreeNode['type'], { icon: React.ElementType; tone: Tone; label: string; child: CourseTreeNode['type'] | null }> = {
  CATEGORY: { icon: FolderTree, tone: 'amber', label: 'Danh mục', child: 'COURSE' },
  COURSE: { icon: BookOpen, tone: 'indigo', label: 'Khoá học', child: 'SECTION' },
  SECTION: { icon: Layers, tone: 'emerald', label: 'Chương', child: null },
};

type Mode = { kind: 'add' | 'edit'; node: AdminTreeNode } | null;
/** Danh mục là nhóm cố định của hệ thống (enum course_category) */
const CATEGORIES = [
  { value: 'FOUNDATION', label: 'Kiến thức nền tảng' },
  { value: 'GRAMMAR', label: 'Ngữ pháp' },
  { value: 'VOCABULARY', label: 'Từ vựng' },
  { value: 'SKILL', label: 'Kỹ năng' },
  { value: 'EXAM_PREP', label: 'Luyện thi' },
];
const STATUS_VI: Record<string, { tone: 'green' | 'amber' | 'red' | 'gray'; label: string }> = {
  PUBLISHED: { tone: 'green', label: 'Công khai' },
  PENDING_REVIEW: { tone: 'amber', label: 'Chờ duyệt' },
  DRAFT: { tone: 'gray', label: 'Nháp' },
  REJECTED: { tone: 'red', label: 'Bị từ chối' },
  ARCHIVED: { tone: 'gray', label: 'Lưu trữ' },
};
const EMPTY: AdminTreeNode[] = [];
const LESSON_ICON: Record<string, React.ElementType> = { VIDEO: PlayCircle, READING: FileText, QUIZ: ClipboardCheck, CHECKPOINT: ClipboardCheck };

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

function findNode(nodes: AdminTreeNode[], id: string): AdminTreeNode | null {
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
  const treeQ = useAdminCourseTree();
  const coursesQ = useAdminCourses();
  const refresh = useAdminInvalidate();
  const tree = treeQ.data ?? EMPTY;
  const [open, setOpen] = useState<Set<string>>(new Set(['cat-FOUNDATION']));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [title, setTitle] = useState('');
  const [newType, setNewType] = useState<CourseTreeNode['type']>('COURSE');
  const [category, setCategory] = useState('FOUNDATION');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminTreeNode | null>(null);
  const [info, setInfo] = useState({ description: '', coverUrl: '', isFree: false });
  const [lessonDlg, setLessonDlg] = useState<{ sectionId: string; lesson: TreeLesson | null } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<TreeLesson | null>(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => countTree(tree), [tree]);
  const selected = (selectedId ? findNode(tree, selectedId) : null) ?? tree[0] ?? null;
  const selectedCourse = selected ? coursesQ.data?.find((c) => c.id === selected.id) : undefined;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const openAdd = (node: AdminTreeNode | null) => {
    setTitle('');
    if (node) {
      setNewType(TYPE_META[node.type].child ?? 'SECTION');
      if (node.type === 'CATEGORY') setCategory(node.category ?? 'FOUNDATION');
      setMode({ kind: 'add', node });
    } else {
      setNewType('COURSE');
      setMode({ kind: 'add', node: { id: '__root', title: 'root', type: 'CATEGORY' } });
    }
  };
  const openEdit = (node: AdminTreeNode) => {
    setTitle(node.title);
    const c = coursesQ.data?.find((x) => x.id === node.id);
    setInfo({ description: c?.description ?? '', coverUrl: c?.coverUrl ?? '', isFree: !!c?.isFree });
    setMode({ kind: 'edit', node });
  };

  const save = async () => {
    if (!mode || !title.trim()) return toast.error('Vui lòng nhập tên');
    const name = title.trim();
    setSaving(true);
    try {
      if (mode.kind === 'edit') {
        if (mode.node.type === 'COURSE') {
          if (info.coverUrl.trim() && !/^https?:\/\//i.test(info.coverUrl.trim())) throw new Error('Link ảnh bìa phải bắt đầu bằng http(s)://');
          await adminApi.updateCourse(mode.node.id, { title: name, description: info.description.trim(), coverUrl: info.coverUrl.trim() || null, isFree: info.isFree });
        }
        else if (mode.node.type === 'SECTION') await adminApi.updateSection(mode.node.id, { title: name });
        toast.success('Đã cập nhật', `"${name}" đã được lưu.`);
      } else if (newType === 'COURSE') {
        const c = await adminApi.createCourse({ title: name, category: mode.node.type === 'CATEGORY' && mode.node.id !== '__root' ? mode.node.category : category, status: 'DRAFT' });
        setOpen((o) => new Set(o).add(`cat-${c.category}`));
        setSelectedId(c.id);
        toast.success('Đã thêm khoá học', `"${name}" được tạo ở trạng thái nháp.`);
      } else {
        await adminApi.createSection({ courseId: mode.node.id, title: name });
        setOpen((o) => new Set(o).add(mode.node.id));
        toast.success('Đã thêm chương', `"${name}" đã được tạo.`);
      }
      await refresh();
      setMode(null);
    } catch (e) {
      toast.error('Không lưu được', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      if (deleting.type === 'COURSE') await adminApi.deleteCourse(deleting.id);
      else if (deleting.type === 'SECTION') await adminApi.deleteSection(deleting.id);
      if (selectedId === deleting.id) setSelectedId(null);
      toast.success('Đã xoá', `"${deleting.title}" đã bị xoá.`);
      await refresh();
    } catch (e) {
      toast.error('Không xoá được', errorMessage(e));
    } finally {
      setDeleting(null);
    }
  };

  const setCourseStatus = async (node: AdminTreeNode, status: 'PENDING_REVIEW' | 'DRAFT') => {
    setBusy(true);
    try {
      await adminApi.updateCourse(node.id, { status });
      toast.success(status === 'DRAFT' ? 'Đã chuyển về nháp' : 'Đã gửi duyệt', status === 'DRAFT' ? `"${node.title}" không còn hiển thị với học viên.` : `"${node.title}" nằm trong hàng chờ phê duyệt của Trưởng bộ môn.`);
      await refresh();
    } catch (e) {
      toast.error('Không thực hiện được', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const removeLesson = async () => {
    if (!deletingLesson) return;
    try {
      await adminApi.deleteLesson(deletingLesson.id);
      toast.success('Đã xoá bài học', deletingLesson.title);
      await refresh();
    } catch (e) {
      toast.error('Không xoá được', errorMessage(e));
    } finally {
      setDeletingLesson(null);
    }
  };

  const renderNode = (node: AdminTreeNode, depth: number) => {
    const meta = TYPE_META[node.type];
    const hasChildren = !!node.children?.length;
    const isOpen = open.has(node.id);
    const isSel = selectedId === node.id;
    return (
      <li key={`${depth}-${node.id}-${node.title}`}>
        <div
          onClick={() => setSelectedId(node.id)}
          className={cn('group relative flex cursor-pointer items-center gap-2.5 rounded-xl py-2 pr-2 transition-colors', isSel ? 'bg-indigo-500/[0.07] ring-1 ring-inset ring-indigo-500/25' : 'hover:bg-slate-50')}
          style={{ paddingLeft: 8 + depth * 24 }}
        >
          {isSel && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-indigo-500" />}
          <button
            type="button"
            aria-label={isOpen ? 'Thu gọn' : 'Mở rộng'}
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggle(node.id);
            }}
            className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-900/[0.06] hover:text-slate-700', !hasChildren && 'pointer-events-none opacity-0')}
          >
            <ChevronRight className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-90')} />
          </button>
          <IconTile icon={meta.icon} tone={meta.tone} size="sm" />
          <div className="min-w-0 flex-1">
            <p className={cn('truncate text-sm', isSel ? 'font-semibold text-slate-900' : 'font-medium text-slate-800')}>{node.title}</p>
            <p className="truncate text-xs text-slate-500">
              {meta.label}
              {node.meta ? ` · ${node.meta}` : ''}
            </p>
          </div>
          <div className="hidden items-center gap-0.5 transition sm:flex sm:opacity-0 sm:group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
            {meta.child && (
              <button type="button" onClick={() => openAdd(node)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" title={`Thêm ${TYPE_META[meta.child].label.toLowerCase()}`}>
                <Plus className="h-4 w-4" />
              </button>
            )}
            {node.type !== 'CATEGORY' && (
              <>
                <button type="button" onClick={() => openEdit(node)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-700" title="Đổi tên">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setDeleting(node)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Xoá">
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
        {hasChildren && isOpen && <ul className="mt-0.5 space-y-0.5">{node.children!.map((c) => renderNode(c, depth + 1))}</ul>}
      </li>
    );
  };

  const childType = selected ? TYPE_META[selected.type].child : null;
  const courseStatus = selectedCourse?.status ?? selected?.status;

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Nội dung · Khoá học"
        title="Cây thư mục khoá học"
        sub="Tổ chức Danh mục → Khoá học → Chương đúng như học viên thấy ở trang Khoá học. Chọn một mục để xem chi tiết và chỉnh sửa."
        actions={
          <>
            <TBtn to="/courses" icon={<Eye />}>
              Xem như học viên
            </TBtn>
            <TBtn variant="primary" icon={<Plus />} onClick={() => openAdd(null)}>
              Thêm khoá học
            </TBtn>
          </>
        }
      />

      <Figures
        items={[
          { label: 'Danh mục', value: counts.CATEGORY, note: 'nhóm khoá học', icon: FolderTree, tone: 'amber' },
          { label: 'Khoá học', value: counts.COURSE, note: `${coursesQ.data?.filter((c) => c.status === 'PUBLISHED').length ?? 0} khoá đang phát hành`, icon: BookOpen, tone: 'indigo' },
          { label: 'Chương', value: counts.SECTION, note: 'đã chia trong khoá', icon: Layers, tone: 'emerald' },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Cấu trúc nội dung" sub={`${counts.CATEGORY + counts.COURSE + counts.SECTION} mục · nhấn để xem chi tiết`} icon={ListTree} tone="indigo" className="min-w-0">
          {treeQ.isLoading ? <p className="py-8 text-center text-sm text-slate-500">Đang tải…</p> : tree.length ? <ul className="space-y-0.5">{tree.map((n) => renderNode(n, 0))}</ul> : <EmptyState icon={<Database />} title="Chưa có khoá học" description="Tạo khoá học đầu tiên để bắt đầu." compact />}
        </Panel>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)] xl:sticky xl:top-24">
          {selected ? (
            <>
              <div className="relative h-40">
                <Img src={selectedCourse?.coverUrl ?? PHOTOS.books} alt={selected.title} wrapperClass="h-full" fallbackClass="bg-slate-200" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
                  <IconTile icon={TYPE_META[selected.type].icon} tone={TYPE_META[selected.type].tone} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{TYPE_META[selected.type].label}</p>
                    <h2 className="truncate font-display text-lg font-bold text-white">{selected.title}</h2>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <dl className="divide-y divide-slate-100 text-sm">
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-slate-500">Mô tả</dt>
                    <dd className="text-right text-slate-800">{selected.meta ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-slate-500">Mục con</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">{selected.children?.length ?? 0}</dd>
                  </div>
                  {selectedCourse && (
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-slate-500">Học viên</dt>
                      <dd className="inline-flex items-center gap-1 font-semibold tabular-nums text-slate-900">
                        <Users className="h-3.5 w-3.5 text-slate-400" /> {selectedCourse.studentsCount.toLocaleString('vi-VN')}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-slate-500">Hiển thị</dt>
                    <dd>
                      {selected.type === 'CATEGORY' ? <Status tone="blue">Nhóm hệ thống</Status> : <Status tone={STATUS_VI[selected.status ?? selectedCourse?.status ?? 'PUBLISHED']?.tone ?? 'gray'}>{STATUS_VI[selected.status ?? selectedCourse?.status ?? 'PUBLISHED']?.label ?? selected.status}</Status>}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-slate-500">{selected.slug ? 'Đường dẫn' : 'Mã'}</dt>
                    <dd className="truncate font-mono text-xs text-slate-500">{selected.slug ? `/courses/${selected.slug}` : selected.id.slice(0, 8)}</dd>
                  </div>
                </dl>
                <div className="mt-4 grid gap-2">
                  {childType && (
                    <TBtn variant="primary" icon={<Plus />} onClick={() => openAdd(selected)}>
                      Thêm {TYPE_META[childType].label.toLowerCase()}
                    </TBtn>
                  )}
                  {selected.type === 'SECTION' && (
                    <TBtn variant="primary" icon={<Plus />} onClick={() => setLessonDlg({ sectionId: selected.id, lesson: null })}>
                      Thêm bài học
                    </TBtn>
                  )}
                  {selected.type === 'COURSE' && courseStatus !== 'PUBLISHED' && courseStatus !== 'PENDING_REVIEW' && (
                    <TBtn icon={<Send />} disabled={busy} onClick={() => void setCourseStatus(selected, 'PENDING_REVIEW')}>
                      Gửi Trưởng bộ môn duyệt
                    </TBtn>
                  )}
                  {selected.type === 'COURSE' && (courseStatus === 'PUBLISHED' || courseStatus === 'PENDING_REVIEW') && (
                    <TBtn variant="ghost" icon={<Undo2 />} disabled={busy} onClick={() => void setCourseStatus(selected, 'DRAFT')}>
                      Chuyển về nháp
                    </TBtn>
                  )}
                  {selected.type !== 'CATEGORY' && <div className="grid grid-cols-2 gap-2">
                    <TBtn icon={<Pencil />} onClick={() => openEdit(selected)}>
                      {selected.type === 'COURSE' ? 'Sửa' : 'Đổi tên'}
                    </TBtn>
                    <TBtn variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" icon={<Trash2 />} onClick={() => setDeleting(selected)}>
                      Xoá
                    </TBtn>
                  </div>}
                </div>
                {selected.type === 'SECTION' && (
                  <div className="mt-5">
                    <p className="mb-2 text-[13px] font-semibold text-slate-900">Bài học trong chương ({selected.lessons?.length ?? 0})</p>
                    {!selected.lessons?.length ? (
                      <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-[13px] text-slate-500">Chương chưa có bài học.</p>
                    ) : (
                      <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                        {selected.lessons.map((l, i) => {
                          const Icon = LESSON_ICON[l.type] ?? PlayCircle;
                          return (
                            <li key={l.id} className="flex items-center gap-2 px-3 py-2">
                              <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-slate-400">{i + 1}</span>
                              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-slate-800">{l.title}</p>
                                <p className="text-[11px] text-slate-500">{l.durationMin} phút{l.isFreePreview ? ' · học thử' : ''}</p>
                              </div>
                              <button type="button" title="Sửa bài" onClick={() => setLessonDlg({ sectionId: selected.id, lesson: l })} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700"><Pencil className="h-3.5 w-3.5" /></button>
                              <button type="button" title="Xoá bài" onClick={() => setDeletingLesson(l)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6">
              <EmptyState icon={<FolderTree />} title="Chọn một mục" description="Nhấn vào mục trong cây để xem chi tiết." compact />
            </div>
          )}
        </section>
      </div>

      <Modal
        open={!!mode}
        onClose={() => setMode(null)}
        title={mode?.kind === 'edit' ? (mode.node.type === 'COURSE' ? 'Sửa khoá học' : 'Đổi tên') : mode?.node.id === '__root' ? 'Thêm khoá học' : `Thêm vào "${mode?.node.title}"`}
        size={mode?.kind === 'edit' && mode.node.type === 'COURSE' ? 'md' : 'sm'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setMode(null)}>
              Huỷ
            </Button>
            <Button onClick={save} loading={saving}>{mode?.kind === 'edit' ? 'Lưu' : 'Tạo'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tên" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên..." autoFocus required />
          {mode?.kind === 'edit' && mode.node.type === 'COURSE' && (
            <>
              <Textarea label="Mô tả" rows={3} value={info.description} onChange={(e) => setInfo((x) => ({ ...x, description: e.target.value }))} />
              <Input label="Link ảnh bìa" placeholder="https://…" value={info.coverUrl} onChange={(e) => setInfo((x) => ({ ...x, coverUrl: e.target.value }))} />
              <Switch checked={info.isFree} onChange={(v) => setInfo((x) => ({ ...x, isFree: v }))} label="Khoá học miễn phí" description="Tắt để chỉ tài khoản VIP học được" />
            </>
          )}
          {mode?.kind === 'add' && mode.node.id === '__root' && (
            <Select label="Danh mục" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
          )}
          {mode?.kind === 'add' && mode.node.id !== '__root' && (
            <p className="text-xs text-slate-500">
              Sẽ tạo <b>{TYPE_META[newType].label.toLowerCase()}</b> bên trong mục đã chọn.
            </p>
          )}
        </div>
      </Modal>

      <LessonDialog open={!!lessonDlg} sectionId={lessonDlg?.sectionId ?? null} lesson={lessonDlg?.lesson ?? null} onClose={() => setLessonDlg(null)} />
      <ConfirmDialog open={!!deletingLesson} onClose={() => setDeletingLesson(null)} onConfirm={removeLesson} danger title={`Xoá bài "${deletingLesson?.title}"?`} message="Tiến độ học của học viên ở bài này sẽ không còn hiển thị." confirmText="Xoá" />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} danger title={`Xoá "${deleting?.title}"?`} message="Tất cả mục con bên trong cũng sẽ bị xoá. Hành động không thể hoàn tác." confirmText="Xoá" />
    </div>
  );
};
