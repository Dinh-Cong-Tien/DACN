import React, { useEffect, useMemo, useState } from 'react';
import { Save, RotateCcw, Settings2, GraduationCap, Flame, Shield, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { adminApi, useAdminInvalidate, useAdminSettings } from '@/shared/api/admin';
import { errorMessage } from '@/shared/api/client';
import type { SystemSetting } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { ConfirmDialog, Switch } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';
import { IconTile, Panel, TBtn, TPageHead, inputCls, type Tone } from '@/roles/teacher/components/TeacherKit';

const GROUP_META: Record<string, { icon: React.ElementType; tone: Tone; sub: string }> = {
  Chung: { icon: Settings2, tone: 'indigo', sub: 'Tên hệ thống, đăng ký mới, chế độ bảo trì' },
  'Học tập': { icon: GraduationCap, tone: 'emerald', sub: 'Kỳ thi mặc định, hạn mức gói Free, ôn tập SRS' },
  'Động lực': { icon: Flame, tone: 'amber', sub: 'Chuỗi ngày học, điểm nỗ lực, bảng xếp hạng' },
  'Bảo mật': { icon: Shield, tone: 'rose', sub: 'Giới hạn truy cập, xác thực email, phiên đăng nhập' },
};
const metaOf = (g: string) => GROUP_META[g] ?? { icon: SlidersHorizontal, tone: 'violet' as Tone, sub: '' };
const anchor = (g: string) => `grp-${g.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').toLowerCase()}`;

type Values = Record<string, SystemSetting['value']>;
const EMPTY: SystemSetting[] = [];
const toValues = (xs: SystemSetting[]): Values => Object.fromEntries(xs.map((s) => [s.key, s.value]));

export const AdminSettingsPage: React.FC = () => {
  useDocumentTitle('Cấu hình tham số');
  const { data } = useAdminSettings();
  const refresh = useAdminInvalidate();
  const settingRows = data ?? EMPTY;
  const groups = useMemo(() => Array.from(new Set(settingRows.map((s) => s.group))), [settingRows]);
  const [activeState, setActive] = useState<string>();
  const active = activeState ?? groups[0];
  const [values, setValues] = useState<Values>({});
  const [saved, setSaved] = useState<Values>({});
  useEffect(() => {
    const v = toValues(settingRows);
    setValues(v);
    setSaved(v);
  }, [settingRows]);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const dirty = useMemo(() => settingRows.filter((s) => values[s.key] !== saved[s.key]).length, [values, saved]);
  const dirtyIn = (g: string) => settingRows.filter((s) => s.group === g && values[s.key] !== saved[s.key]).length;
  const set = (key: string, v: SystemSetting['value']) => setValues((s) => ({ ...s, [key]: v }));
  const maintenance = Boolean(values[settingRows.find((s) => /maintenance/i.test(s.key) && s.type === 'TOGGLE')?.key ?? 'maintenance_mode']);

  const save = async () => {
    const changed = Object.fromEntries(settingRows.filter((s) => values[s.key] !== saved[s.key]).map((s) => [s.key, values[s.key]]));
    setSaving(true);
    try {
      await adminApi.saveSettings(changed);
      setSaved(values);
      toast.success('Đã lưu cấu hình', `${dirty} tham số đã được cập nhật và ghi vào nhật ký hệ thống.`);
      void refresh();
    } catch (e) {
      toast.error('Không lưu được', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setValues(saved);
    setResetOpen(false);
    toast.info('Đã huỷ thay đổi', 'Các tham số trở về giá trị đang áp dụng.');
  };

  const jump = (g: string) => {
    setActive(g);
    document.getElementById(anchor(g))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderField = (s: SystemSetting) => {
    const v = values[s.key];
    switch (s.type) {
      case 'TOGGLE':
        return <Switch checked={Boolean(v)} onChange={(x) => set(s.key, x)} />;
      case 'NUMBER':
        return <input type="number" className={cn(inputCls, 'w-32 text-right tabular-nums')} value={v === undefined || v === '' ? '' : Number(v)} onChange={(e) => set(s.key, Number(e.target.value))} />;
      case 'SELECT':
        return (
          <select className={cn(inputCls, 'w-44')} value={String(v)} onChange={(e) => set(s.key, e.target.value)}>
            {(s.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      default:
        return <input className={cn(inputCls, 'w-full sm:w-56')} value={String(v)} onChange={(e) => set(s.key, e.target.value)} />;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <TPageHead
        crumbs={[{ label: 'Hệ thống' }, { label: 'Cấu hình tham số' }]}
        title="Cấu hình tham số"
        sub="Thiết lập chung, hạn mức học tập, quy tắc động lực và bảo mật. Mọi thay đổi được ghi vào nhật ký kiểm toán kèm IP người thực hiện."
        actions={
          <TBtn icon={<RotateCcw />} onClick={() => setResetOpen(true)}>
            Huỷ thay đổi
          </TBtn>
        }
      />

      {maintenance && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4">
          <IconTile icon={AlertTriangle} tone="amber" size="sm" />
          <div>
            <p className="font-display font-bold text-amber-900">Chế độ bảo trì đang bật</p>
            <p className="text-sm text-amber-800/80">Người dùng thường không thể truy cập hệ thống, chỉ tài khoản quản trị đăng nhập được. Nhớ tắt sau khi bảo trì xong.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
        {/* Mục lục */}
        <nav aria-label="Nhóm cấu hình" className="min-w-0 lg:sticky lg:top-24">
          <ul className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col lg:gap-1 lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-white lg:p-2 lg:shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {groups.map((g) => {
              const m = metaOf(g);
              const n = dirtyIn(g);
              return (
                <li key={g} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => jump(g)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors lg:border-transparent',
                      active === g ? 'border-indigo-200 bg-indigo-500/[0.07] font-semibold text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 lg:bg-transparent'
                    )}
                  >
                    <IconTile icon={m.icon} tone={m.tone} size="sm" />
                    <span className="flex-1 whitespace-nowrap">{g}</span>
                    {n > 0 && <span className="rounded-md bg-indigo-600 px-1.5 text-[11px] font-bold text-white">{n}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Nội dung */}
        <div className="min-w-0 space-y-6">
          {groups.map((g) => {
            const m = metaOf(g);
            const items = settingRows.filter((s) => s.group === g);
            return (
              <div key={g} id={anchor(g)} className="scroll-mt-24">
                <Panel flush title={g} sub={m.sub || `${items.length} tham số`} icon={m.icon} tone={m.tone} action={<span className="text-[12px] text-slate-400">{items.length} tham số</span>}>
                  <ul className="divide-y divide-slate-100">
                    {items.map((s) => {
                      const changed = values[s.key] !== saved[s.key];
                      const isMaint = s.key === 'maintenance_mode';
                      return (
                        <li key={s.key} className={cn('relative flex flex-col justify-between gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center', changed && 'bg-indigo-500/[0.04]', isMaint && maintenance && 'bg-amber-50')}>
                          {changed && <span className="absolute inset-y-0 left-0 w-[3px] bg-indigo-500" />}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                              {changed && <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">Đã sửa</span>}
                              {isMaint && maintenance && <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">Đang bật</span>}
                            </div>
                            <p className="mt-0.5 text-[13px] text-slate-500">{s.description}</p>
                            <code className="mt-1 inline-block font-mono text-[11px] text-slate-400">{s.key}</code>
                          </div>
                          <div className="shrink-0">{renderField(s)}</div>
                        </li>
                      );
                    })}
                  </ul>
                </Panel>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thanh lưu */}
      <div className={cn('fixed inset-x-4 bottom-20 z-30 transition-all duration-300 md:bottom-6 lg:left-auto lg:right-8 lg:w-[460px]', dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950 p-3 pl-5 text-white shadow-[0_20px_40px_-16px_rgba(15,23,42,0.6)] ring-1 ring-white/10">
          <p className="text-sm font-semibold">
            <span className="text-amber-300">{dirty}</span> thay đổi chưa lưu
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setValues(saved)} className="h-9 rounded-xl px-3 text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white">
              Huỷ
            </button>
            <button type="button" onClick={save} disabled={saving} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-500 px-4 text-[13px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu…' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={reset} danger title="Huỷ các thay đổi chưa lưu?" message="Các tham số sẽ trở về giá trị đang áp dụng." confirmText="Huỷ thay đổi" />
    </div>
  );
};
