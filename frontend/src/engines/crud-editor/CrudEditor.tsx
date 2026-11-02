import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Download, Filter, MoreHorizontal } from 'lucide-react';
import { Button, Card, Column, ConfirmDialog, DataTable, Dropdown, Field, Input, Modal, Pagination, SearchInput, Select, Textarea, Switch, MenuItem } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils';

export type FieldType = 'text' | 'number' | 'email' | 'textarea' | 'select' | 'toggle' | 'date';

export interface CrudField<T> {
  key: keyof T & string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  colSpan?: 1 | 2;
}

export interface CrudFilter<T> {
  key: keyof T & string;
  label: string;
  options: { value: string; label: string }[];
}

export interface CrudEditorProps<T extends { id: string }> {
  title?: string;
  description?: string;
  rows: T[];
  columns: Column<T>[];
  fields: CrudField<T>[];
  filters?: CrudFilter<T>[];
  searchKeys?: (keyof T & string)[];
  pageSize?: number;
  createLabel?: string;
  entityName?: string;
  rowActions?: (row: T) => MenuItem[];
  onChange?: (rows: T[]) => void;
  toolbarExtra?: React.ReactNode;
  idPrefix?: string;
  defaultValues?: Partial<T>;
  readOnly?: boolean;
  dense?: boolean;
  selectable?: boolean;
  bulkActions?: (ids: string[], clear: () => void) => React.ReactNode;
  /** Từ khoá tìm kiếm ban đầu (vd. từ ?q= trên URL) */
  initialSearch?: string;
  /** Lưu qua API: trả về bản ghi đã lưu (có id thật). Lỗi ném ra → giữ form + báo lỗi. */
  onCreate?: (values: Partial<T>) => Promise<T>;
  onUpdate?: (row: T, values: Partial<T>) => Promise<T>;
  onDelete?: (row: T) => Promise<unknown>;
  /** Đang tải dữ liệu lần đầu */
  loading?: boolean;
  /** Ẩn nút tạo mới (mặc định theo readOnly) */
  canCreate?: boolean;
  /** Dòng nào được sửa / xoá (vd chỉ nội dung nháp của tác giả). Mặc định theo readOnly */
  canEditRow?: (row: T) => boolean;
  canDeleteRow?: (row: T) => boolean;
}

/**
 * CRUD Editor Engine: bảng dữ liệu + tìm kiếm + lọc + phân trang + form tạo/sửa + xoá.
 * Dùng chung cho Admin/Head Teacher/Teacher qua config columns & fields.
 */
export function CrudEditor<T extends { id: string }>({
  title,
  description,
  rows: initialRows,
  columns,
  fields,
  filters = [],
  searchKeys = [],
  pageSize = 8,
  createLabel = 'Thêm mới',
  entityName = 'bản ghi',
  rowActions,
  onChange,
  toolbarExtra,
  idPrefix = 'new',
  defaultValues,
  readOnly,
  canCreate = !readOnly,
  canEditRow,
  canDeleteRow,
  dense,
  selectable,
  bulkActions,
  initialSearch = '',
  onCreate,
  onUpdate,
  onDelete,
  loading,
}: CrudEditorProps<T>) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [search, setSearch] = useState(initialSearch);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<T | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<T | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Dữ liệu từ API đến sau lần render đầu → đồng bộ lại
  useEffect(() => setRows(initialRows), [initialRows]);

  const commit = (next: T[]) => {
    setRows(next);
    onChange?.(next);
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (s && searchKeys.length) {
        const hit = searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(s));
        if (!hit) return false;
      }
      for (const f of filters) {
        const v = filterValues[f.key];
        if (v && String(r[f.key]) !== v) return false;
      }
      return true;
    });
  }, [rows, search, searchKeys, filters, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...(defaultValues ?? {}) });
    setErrors({});
    setFormOpen(true);
  };
  const openEdit = (row: T) => {
    setEditing(row);
    setForm({ ...row });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && (form[f.key] === undefined || form[f.key] === '' || form[f.key] === null)) e[f.key] = 'Trường này là bắt buộc';
      if (f.type === 'email' && form[f.key] && !/^\S+@\S+\.\S+$/.test(String(form[f.key]))) e[f.key] = 'Email không hợp lệ';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Đã có lỗi xảy ra');

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        const saved = onUpdate ? await onUpdate(editing, form as Partial<T>) : ({ ...editing, ...form } as T);
        commit(rows.map((r) => (r.id === editing.id ? saved : r)));
        toast.success('Đã cập nhật', `${entityName} đã được lưu.`);
      } else {
        const values = { ...(defaultValues ?? {}), ...form } as Partial<T>;
        const saved = onCreate ? await onCreate(values) : ({ ...values, id: `${idPrefix}-${Date.now().toString(36)}` } as T);
        commit([saved, ...rows]);
        toast.success('Đã tạo mới', `${entityName} mới đã được thêm.`);
        setPage(1);
      }
      setFormOpen(false);
    } catch (e) {
      toast.error('Không lưu được', errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      if (onDelete) await onDelete(deleting);
      commit(rows.filter((r) => r.id !== deleting.id));
      toast.success('Đã xoá', `${entityName} đã bị xoá khỏi hệ thống.`);
    } catch (e) {
      toast.error('Không xoá được', errMsg(e));
    } finally {
      setDeleting(null);
    }
  };

  const exportCsv = () => {
    const header = columns.map((c) => (typeof c.header === 'string' ? c.header : c.key)).join(',');
    const body = filtered.map((r) => columns.map((c) => JSON.stringify((r as Record<string, unknown>)[c.key] ?? '')).join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(title ?? 'export').replace(/\s+/g, '_')}.csv`;
    a.click();
    toast.info('Đang tải xuống', `Xuất ${filtered.length} dòng ra CSV.`);
  };

  const editable = (row: T) => (canEditRow ? canEditRow(row) : !readOnly);
  const deletable = (row: T) => (canDeleteRow ? canDeleteRow(row) : !readOnly);

  const actionCol: Column<T> = {
    key: '__actions',
    header: '',
    width: '56px',
    align: 'right',
    render: (row) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Dropdown
          trigger={
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }
          items={[
            ...(editable(row) ? [{ label: 'Chỉnh sửa', icon: <Pencil />, onClick: () => openEdit(row) }] : []),
            ...(rowActions ? rowActions(row) : []),
            ...(deletable(row) ? [{ divider: true, label: '' }, { label: 'Xoá', icon: <Trash2 />, danger: true, onClick: () => setDeleting(row) }] : []),
          ]}
        />
      </div>
    ),
  };

  const toggleSel = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-black text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
        </div>
      )}

      <Card padding="sm" className="animate-fade-down">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            {searchKeys.length > 0 && (
              <div className="sm:w-72">
                <SearchInput
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  inputSize="sm"
                />
              </div>
            )}
            {filters.map((f) => (
              <div key={f.key} className="sm:w-44">
                <Select
                  inputSize="sm"
                  placeholder={f.label}
                  options={f.options}
                  value={filterValues[f.key] ?? ''}
                  onChange={(e) => {
                    setFilterValues((v) => ({ ...v, [f.key]: e.target.value }));
                    setPage(1);
                  }}
                />
              </div>
            ))}
            {filters.length > 0 && Object.values(filterValues).some(Boolean) && (
              <Button size="sm" variant="ghost" leftIcon={<Filter className="w-4 h-4" />} onClick={() => setFilterValues({})}>
                Xoá lọc
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {toolbarExtra}
            <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={exportCsv}>
              CSV
            </Button>
            {canCreate && (
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
                {createLabel}
              </Button>
            )}
          </div>
        </div>
        {selectable && selected.size > 0 && bulkActions && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 animate-fade-down">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">{selected.size} đã chọn</span>
            {bulkActions(Array.from(selected), () => setSelected(new Set()))}
          </div>
        )}
      </Card>

      <DataTable<T>
        columns={[...columns, actionCol]}
        rows={pageRows}
        dense={dense}
        selectable={selectable}
        selected={selected}
        onToggle={toggleSel}
        onRowClick={readOnly && !canEditRow ? undefined : (row) => (editable(row) ? openEdit(row) : undefined)}
        emptyTitle={loading ? 'Đang tải dữ liệu…' : `Chưa có ${entityName}`}
        emptyDescription={search ? 'Thử từ khoá khác hoặc xoá bộ lọc.' : `Nhấn "${createLabel}" để tạo ${entityName} đầu tiên.`}
        className="animate-fade-up"
      />

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filtered.length} pageSize={pageSize} />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Chỉnh sửa ${entityName}` : `Tạo ${entityName} mới`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={save} loading={saving}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => {
            const value = form[f.key];
            const common = { label: f.label, required: f.required, hint: f.hint, error: errors[f.key], placeholder: f.placeholder };
            const span = f.colSpan === 2 ? 'md:col-span-2' : '';
            if (f.type === 'textarea')
              return (
                <div key={f.key} className={cn('md:col-span-2', span)}>
                  <Textarea {...common} value={String(value ?? '')} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} />
                </div>
              );
            if (f.type === 'select')
              return (
                <div key={f.key} className={span}>
                  <Select {...common} options={f.options ?? []} placeholder={f.placeholder ?? 'Chọn...'} value={String(value ?? '')} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} />
                </div>
              );
            if (f.type === 'toggle')
              return (
                <div key={f.key} className={cn('pt-6', span)}>
                  <Field error={errors[f.key]}>
                    <Switch checked={Boolean(value)} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} label={f.label} description={f.hint} />
                  </Field>
                </div>
              );
            return (
              <div key={f.key} className={span}>
                <Input
                  {...common}
                  type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : 'text'}
                  value={value === undefined || value === null ? '' : String(value)}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                />
              </div>
            );
          })}
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} danger title={`Xoá ${entityName}?`} message="Hành động này không thể hoàn tác. Dữ liệu liên quan có thể bị ảnh hưởng." confirmText="Xoá vĩnh viễn" />
    </div>
  );
}
