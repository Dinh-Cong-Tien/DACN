import React, { useMemo, useState } from 'react';
import { History, Download, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '@/shared/mocks';
import type { AppRole, AuditLog } from '@/shared/types';
import { formatDateTime, ROLE_LABEL } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, Chip, Column, DataTable, PageHeader, Pagination, SearchInput, Select, StatCard, Tone } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

const SEVERITY: Record<AuditLog['severity'], { tone: Tone; label: string }> = {
  INFO: { tone: 'slate', label: 'INFO' },
  WARN: { tone: 'amber', label: 'WARN' },
  CRITICAL: { tone: 'rose', label: 'CRITICAL' },
};
const ROLE_TONE: Record<AppRole, Tone> = { GUEST: 'slate', STUDENT: 'indigo', TEACHER: 'emerald', HEAD_TEACHER: 'amber', ADMIN: 'rose' };
const PAGE_SIZE = 8;

const columns: Column<AuditLog>[] = [
  { key: 'createdAt', header: 'Thời gian', render: (l) => <span className="text-xs text-slate-600 whitespace-nowrap">{formatDateTime(l.createdAt)}</span> },
  {
    key: 'actor',
    header: 'Người thực hiện',
    render: (l) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-800 text-sm">{l.actor}</span>
        <Badge tone={ROLE_TONE[l.role]} size="xs">
          {ROLE_LABEL[l.role]}
        </Badge>
      </div>
    ),
  },
  { key: 'action', header: 'Hành động', render: (l) => <Badge tone="indigo" size="xs" className="font-mono">{l.action}</Badge> },
  { key: 'target', header: 'Đối tượng', render: (l) => <span className="text-xs text-slate-600">{l.target}</span> },
  { key: 'ip', header: 'IP', render: (l) => <span className="font-mono text-[11px] text-slate-500">{l.ip}</span> },
  { key: 'severity', header: 'Mức độ', render: (l) => <Badge tone={SEVERITY[l.severity].tone} solid={l.severity === 'CRITICAL'} size="xs">{SEVERITY[l.severity].label}</Badge> },
];

export const AdminAuditLogsPage: React.FC = () => {
  useDocumentTitle('Nhật ký hệ thống');
  const [severity, setSeverity] = useState<string>('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return MOCK_AUDIT_LOGS.filter((l) => (!severity || l.severity === severity) && (!role || l.role === role) && (!s || [l.actor, l.target, l.action].some((v) => v.toLowerCase().includes(s))));
  }, [severity, role, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const count = (s: AuditLog['severity']) => MOCK_AUDIT_LOGS.filter((l) => l.severity === s).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký hệ thống (Audit)"
        icon={<History />}
        description="Lưu vết mọi thao tác nhạy cảm: thay đổi phân quyền, khoá tài khoản, sửa cấu hình, xoá dữ liệu."
        actions={
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast.info('Đang xuất CSV', `${filtered.length} bản ghi theo bộ lọc hiện tại.`)}>
            Xuất CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Tổng bản ghi" value={MOCK_AUDIT_LOGS.length} tone="indigo" icon={<History />} />
        <StatCard label="Thông tin" value={count('INFO')} tone="slate" icon={<Info />} />
        <StatCard label="Cảnh báo" value={count('WARN')} tone="amber" icon={<AlertTriangle />} />
        <StatCard label="Nghiêm trọng" value={count('CRITICAL')} tone="rose" icon={<ShieldAlert />} />
      </div>

      <Card padding="sm" className="animate-fade-down">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="lg:w-72">
            <SearchInput
              inputSize="sm"
              placeholder="Tìm theo người dùng, hành động, đối tượng..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="lg:w-48">
            <Select
              inputSize="sm"
              placeholder="Tất cả vai trò"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              options={(['ADMIN', 'HEAD_TEACHER', 'TEACHER', 'STUDENT', 'GUEST'] as AppRole[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Chip active={severity === ''} onClick={() => { setSeverity(''); setPage(1); }}>
              Tất cả
            </Chip>
            {(Object.keys(SEVERITY) as AuditLog['severity'][]).map((s) => (
              <Chip key={s} active={severity === s} tone={SEVERITY[s].tone} onClick={() => { setSeverity(s); setPage(1); }}>
                {SEVERITY[s].label}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      <DataTable<AuditLog> columns={columns} rows={rows} emptyTitle="Không có bản ghi phù hợp" emptyDescription="Thử thay đổi bộ lọc hoặc từ khoá." className="animate-fade-up" />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
    </div>
  );
};
