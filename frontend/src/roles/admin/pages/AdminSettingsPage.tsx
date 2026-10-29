import React, { useMemo, useState } from 'react';
import { Sliders, Save, RotateCcw, Settings2, GraduationCap, Flame, Shield } from 'lucide-react';
import { MOCK_SETTINGS } from '@/shared/mocks';
import type { SystemSetting } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Alert, Badge, Button, Card, ConfirmDialog, Input, PageHeader, Select, Switch, Tabs } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

const GROUP_ICON: Record<string, React.ReactNode> = { Chung: <Settings2 />, 'Học tập': <GraduationCap />, 'Động lực': <Flame />, 'Bảo mật': <Shield /> };

type Values = Record<string, SystemSetting['value']>;
const initialValues = (): Values => Object.fromEntries(MOCK_SETTINGS.map((s) => [s.key, s.value]));

export const AdminSettingsPage: React.FC = () => {
  useDocumentTitle('Cấu hình tham số');
  const groups = useMemo(() => Array.from(new Set(MOCK_SETTINGS.map((s) => s.group))), []);
  const [tab, setTab] = useState(groups[0]);
  const [values, setValues] = useState<Values>(initialValues);
  const [saved, setSaved] = useState<Values>(initialValues);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const dirty = useMemo(() => MOCK_SETTINGS.filter((s) => values[s.key] !== saved[s.key]).length, [values, saved]);
  const set = (key: string, v: SystemSetting['value']) => setValues((s) => ({ ...s, [key]: v }));
  const maintenance = Boolean(values.maintenance_mode);

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaved(values);
      setSaving(false);
      toast.success('Đã lưu cấu hình', `${dirty} tham số đã được cập nhật và ghi vào Audit Log.`);
    }, 600);
  };

  const reset = () => {
    setValues(initialValues());
    setResetOpen(false);
    toast.info('Đã khôi phục mặc định', 'Nhấn "Lưu cấu hình" để áp dụng.');
  };

  const renderField = (s: SystemSetting) => {
    const v = values[s.key];
    switch (s.type) {
      case 'TOGGLE':
        return <Switch checked={Boolean(v)} onChange={(x) => set(s.key, x)} />;
      case 'NUMBER':
        return <Input type="number" inputSize="sm" value={Number(v)} onChange={(e) => set(s.key, Number(e.target.value))} className="w-32" />;
      case 'SELECT':
        return <Select inputSize="sm" value={String(v)} onChange={(e) => set(s.key, e.target.value)} options={(s.options ?? []).map((o) => ({ value: o, label: o }))} className="w-44" />;
      default:
        return <Input inputSize="sm" value={String(v)} onChange={(e) => set(s.key, e.target.value)} className="w-56" />;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader title="Cấu hình tham số hệ thống" icon={<Sliders />} description="Thiết lập chung, hạn mức học tập, quy tắc động lực và bảo mật. Mọi thay đổi được ghi vào nhật ký kiểm toán." />

      {maintenance && (
        <Alert type="warning" title="Chế độ bảo trì đang BẬT">
          Người dùng thường sẽ không thể truy cập hệ thống. Chỉ tài khoản Admin đăng nhập được. Nhớ tắt sau khi hoàn tất bảo trì.
        </Alert>
      )}

      <Tabs variant="pill" value={tab} onChange={setTab} items={groups.map((g) => ({ key: g, label: g, icon: GROUP_ICON[g], count: MOCK_SETTINGS.filter((s) => s.group === g).length }))} />

      <Card padding="none" className="animate-fade-up" key={tab}>
        <ul className="divide-y divide-slate-100">
          {MOCK_SETTINGS.filter((s) => s.group === tab).map((s, i) => {
            const changed = values[s.key] !== saved[s.key];
            const isMaint = s.key === 'maintenance_mode';
            return (
              <li key={s.key} className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 transition-colors animate-fade-up', changed && 'bg-indigo-50/40', isMaint && maintenance && 'bg-amber-50/60')} style={{ animationDelay: `${i * 40}ms` }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900">{s.label}</p>
                    <span className="font-mono text-[10px] text-slate-400">{s.key}</span>
                    {changed && (
                      <Badge tone="indigo" size="xs" className="animate-pop">
                        Đã sửa
                      </Badge>
                    )}
                    {isMaint && maintenance && (
                      <Badge tone="amber" solid size="xs" className="animate-pop">
                        Đang bật
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                </div>
                <div className="shrink-0">{renderField(s)}</div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-[480px] z-30">
        <div className={cn('glass rounded-2xl p-3 flex items-center justify-between gap-3 transition-all duration-300', dirty ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90')}>
          <p className="text-xs font-semibold text-slate-600 pl-2">{dirty ? `${dirty} thay đổi chưa lưu` : 'Không có thay đổi'}</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={() => setResetOpen(true)}>
              Mặc định
            </Button>
            <Button size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={save} loading={saving} disabled={!dirty}>
              Lưu cấu hình
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={reset} danger title="Khôi phục cấu hình mặc định?" message="Toàn bộ tham số sẽ trở về giá trị ban đầu của hệ thống. Thay đổi chưa lưu sẽ bị mất." confirmText="Khôi phục" />
    </div>
  );
};
