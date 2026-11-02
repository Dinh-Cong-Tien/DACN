import React, { useMemo, useState } from 'react';
import { History, Download, Info, AlertTriangle, ShieldAlert, Search, Cog } from 'lucide-react';
import { MOCK_AUDIT_LOGS, MOCK_USERS } from '@/shared/mocks';
import type { AppRole, AuditLog } from '@/shared/types';
import { cn, formatDateTime, ROLE_LABEL } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Avatar, Pagination } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';
import { Figures, Panel, Status, TBtn, TPageHead, inputCls, tbl, type StatusTone } from '@/roles/teacher/components/TeacherKit';

const SEVERITY: Record<AuditLog['severity'], { tone: StatusTone; label: string }> = {
  INFO: { tone: 'blue', label: 'Thông tin' },
  WARN: { tone: 'amber', label: 'Cảnh báo' },
  CRITICAL: { tone: 'red', label: 'Nghiêm trọng' },
};
const ROLE_CHIP: Record<AppRole, string> = {
  GUEST: 'bg-slate-100 text-slate-600',
  STUDENT: 'bg-indigo-500/10 text-indigo-700',
  TEACHER: 'bg-emerald-500/10 text-emerald-700',
  HEAD_TEACHER: 'bg-amber-500/15 text-amber-700',
  ADMIN: 'bg-violet-500/10 text-violet-700',
};
const PAGE_SIZE = 8;
const avatarOf = (name: string) => MOCK_USERS.find((u) => u.fullName === name)?.avatarUrl;

export const AdminAuditLogsPage: React.FC = () => {
  useDocumentTitle('Nhật ký hệ thống');
  const [severity, setSeverity] = useState<AuditLog['severity'] | ''>('');
  const [role, setRole] = useState<AppRole | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return MOCK_AUDIT_LOGS.filter((l) => (!severity || l.severity === severity) && (!role || l.role === role) && (!s || [l.actor, l.target, l.action].some((v) => v.toLowerCase().includes(s))));
  }, [severity, role, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const count = (s: AuditLog['severity']) => MOCK_AUDIT_LOGS.filter((l) => l.severity === s).length;

  const sevTabs: { key: AuditLog['severity'] | ''; label: string; n: number }[] = [
    { key: '', label: 'Tất cả', n: MOCK_AUDIT_LOGS.length },
    ...(Object.keys(SEVERITY) as AuditLog['severity'][]).map((k) => ({ key: k, label: SEVERITY[k].label, n: count(k) })),
  ];

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Hệ thống' }, { label: 'Nhật ký hệ thống' }]}
        title="Nhật ký hệ thống"
        sub="Lưu vết mọi thao tác nhạy cảm: thay đổi phân quyền, khoá tài khoản, sửa cấu hình, xoá dữ liệu. Bản ghi không thể chỉnh sửa."
        actions={
          <TBtn icon={<Download />} onClick={() => toast.info('Đang xuất CSV', `${filtered.length} bản ghi theo bộ lọc hiện tại.`)}>
            Xuất CSV
          </TBtn>
        }
      />

      <Figures
        items={[
          { label: 'Tổng bản ghi', value: MOCK_AUDIT_LOGS.length, icon: History, tone: 'indigo', note: '30 ngày gần nhất' },
          { label: 'Thông tin', value: count('INFO'), icon: Info, tone: 'sky' },
          { label: 'Cảnh báo', value: count('WARN'), icon: AlertTriangle, tone: 'amber' },
          { label: 'Nghiêm trọng', value: count('CRITICAL'), icon: ShieldAlert, tone: 'rose', note: 'cần xem xét' },
        ]}
      />

      <Panel
        flush
        title="Bản ghi thao tác"
        sub={`${filtered.length} bản ghi phù hợp`}
        icon={History}
        tone="violet"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={cn(inputCls, 'w-full pl-9')}
                placeholder="Người dùng, hành động, đối tượng…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <select
              className={cn(inputCls, 'sm:w-48')}
              value={role}
              onChange={(e) => {
                setRole(e.target.value as AppRole | '');
                setPage(1);
              }}
            >
              <option value="">Tất cả vai trò</option>
              {(['ADMIN', 'HEAD_TEACHER', 'TEACHER', 'STUDENT', 'GUEST'] as AppRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1">
            {sevTabs.map((t) => (
              <button
                key={t.key || 'all'}
                type="button"
                onClick={() => {
                  setSeverity(t.key);
                  setPage(1);
                }}
                className={cn('rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors', severity === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
              >
                {t.label}
                <span className="ml-1.5 tabular-nums text-slate-400">{t.n}</span>
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-display font-bold text-slate-900">Không có bản ghi phù hợp</p>
            <p className="mt-1 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khoá.</p>
          </div>
        ) : (
          <>
            {/* Máy tính: bảng */}
            <div className="hidden overflow-x-auto md:block">
              <table className={tbl.table}>
                <thead className={tbl.thead}>
                  <tr>
                    <th className={tbl.th}>Người thực hiện</th>
                    <th className={tbl.th}>Hành động</th>
                    <th className={tbl.th}>Đối tượng</th>
                    <th className={tbl.th}>Thời gian · IP</th>
                    <th className={tbl.th}>Mức độ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id} className={cn(tbl.tr, l.severity === 'CRITICAL' && 'bg-rose-500/[0.03]')}>
                      <td className={tbl.td}>
                        <div className="flex items-center gap-3">
                          {l.actor === 'system' ? (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                              <Cog className="h-4 w-4" />
                            </span>
                          ) : (
                            <Avatar name={l.actor} src={avatarOf(l.actor)} size="sm" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{l.actor === 'system' ? 'Hệ thống' : l.actor}</p>
                            <span className={cn('mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-semibold', ROLE_CHIP[l.role])}>{l.actor === 'system' ? 'Tác vụ tự động' : ROLE_LABEL[l.role]}</span>
                          </div>
                        </div>
                      </td>
                      <td className={tbl.td}>
                        <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-slate-700">{l.action}</code>
                      </td>
                      <td className={cn(tbl.td, 'max-w-[260px] text-slate-700')}>
                        <span className="line-clamp-2">{l.target}</span>
                      </td>
                      <td className={tbl.td}>
                        <p className="whitespace-nowrap text-slate-700">{formatDateTime(l.createdAt)}</p>
                        <p className="font-mono text-[12px] text-slate-400">{l.ip}</p>
                      </td>
                      <td className={tbl.td}>
                        <Status tone={SEVERITY[l.severity].tone}>{SEVERITY[l.severity].label}</Status>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Điện thoại: danh sách */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map((l) => (
                <li key={l.id} className="flex gap-3 px-4 py-3.5">
                  <Avatar name={l.actor === 'system' ? 'Hệ thống' : l.actor} src={avatarOf(l.actor)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{l.actor === 'system' ? 'Hệ thống' : l.actor}</p>
                      <Status tone={SEVERITY[l.severity].tone}>{SEVERITY[l.severity].label}</Status>
                    </div>
                    <code className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">{l.action}</code>
                    <p className="mt-1 text-[13px] text-slate-600">{l.target}</p>
                    <p className="mt-0.5 text-[12px] text-slate-400">
                      {formatDateTime(l.createdAt)} · {l.ip}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
    </div>
  );
};
