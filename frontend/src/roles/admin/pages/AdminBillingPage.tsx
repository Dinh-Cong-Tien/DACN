import React, { useMemo, useState } from 'react';
import { BadgeCheck, Clock, Pencil, RotateCcw, Wallet, CreditCard, Check } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import type { PaymentTxn } from '@/shared/types';
import { adminApi, useAdminBilling, useAdminInvalidate, type AdminPlan, type AdminTxn } from '@/shared/api/admin';
import { errorMessage } from '@/shared/api/client';
import { Button, Input, Modal, Switch } from '@/shared/components/ui';
import { LineChart } from '@/shared/components/charts/Charts';
import { cn, formatCurrency, formatDateTime, formatVnd } from '@/shared/utils';
import { Figures, Panel, Status, TBtn, TPageHead, inputCls, tbl, type StatusTone } from '@/roles/teacher/components/TeacherKit';
import { appLocale } from '@/shared/i18n';

const TXN_STATUS: Record<PaymentTxn['status'], { label: string; tone: StatusTone }> = { PAID: { label: 'Thành công', tone: 'green' }, PENDING: { label: 'Chờ xác nhận', tone: 'amber' }, REFUNDED: { label: 'Đã hoàn tiền', tone: 'gray' }, FAILED: { label: 'Thất bại', tone: 'red' } };
const METHOD: Record<PaymentTxn['method'], string> = { MOMO: 'MoMo', VNPAY: 'VNPay', CARD: 'Thẻ quốc tế', BANK: 'Chuyển khoản' };
const vnd = formatVnd;

type Plan = AdminPlan & { active: boolean };
const EMPTY_T: AdminTxn[] = [];

/** Gói VIP học viên mua ở trang Bảng giá: doanh thu, giao dịch, chỉnh giá gói */
export const AdminBillingPage: React.FC = () => {
  useDocumentTitle('Gói VIP & thanh toán');
  const { data, isLoading } = useAdminBilling();
  const refresh = useAdminInvalidate();
  const txns = data?.items ?? EMPTY_T;
  const plans = useMemo<Plan[]>(() => (data?.plans ?? []).map((p) => ({ ...p, active: p.isActive })), [data]);
  const planName = (id: string) => txns.find((t) => t.planId === id)?.planName ?? plans.find((p) => p.id === id)?.name ?? id;
  const R = data?.revenue ?? { labels: [], revenue: [], byPlan: [] };
  const cur = R.revenue[R.revenue.length - 1] ?? 0;
  const prev = R.revenue[R.revenue.length - 2] ?? 0;
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const run = async (fn: () => Promise<unknown>, ok: string, desc?: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(ok, desc);
      await refresh();
      return true;
    } catch (e) {
      toast.error('Không thực hiện được', errorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  };
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [editing, setEditing] = useState<Plan | null>(null);
  const [price, setPrice] = useState('');
  const [refund, setRefund] = useState<PaymentTxn | null>(null);

  const rows = useMemo(() => txns.filter((t) => (!status || t.status === status) && (!method || t.method === method)), [txns, status, method]);
  const monthKey = new Date().toISOString().slice(0, 7);
  const paidThisMonth = txns.filter((t) => t.status === 'PAID' && (t.paidAt ?? t.createdAt).startsWith(monthKey));
  const thisMonth = paidThisMonth.reduce((a, t) => a + t.amount, 0);
  const recentRefunds = txns.filter((t) => t.status === 'REFUNDED' && Date.now() - new Date(t.refundedAt ?? t.createdAt).getTime() < 30 * 86400_000).length;

  return (
    <div className="space-y-6">
      <TPageHead crumbs={[{ label: 'Vận hành' }, { label: 'Gói VIP & thanh toán' }]} title="Gói VIP & thanh toán" sub="Các gói học viên mua ở trang Bảng giá. Thanh toán chuyển khoản cần xác nhận thủ công trước khi kích hoạt VIP." />
      <Figures
        items={[
          { label: 'Doanh thu tháng này', value: `${cur.toLocaleString(appLocale())} tr`, icon: Wallet, tone: 'emerald', note: prev ? `${cur >= prev ? '+' : ''}${Math.round((cur / prev - 1) * 100)}% so với tháng trước` : 'triệu đồng' },
          { label: 'Đã thu tháng này', value: vnd(thisMonth), icon: CreditCard, tone: 'indigo', note: `${paidThisMonth.length} giao dịch thành công` },
          { label: 'Chờ xác nhận', value: data?.summary.pending ?? 0, icon: Clock, tone: 'amber', note: 'cần xác nhận thủ công' },
          { label: 'Hoàn tiền', value: recentRefunds, icon: RotateCcw, tone: 'rose', note: `Trong 30 ngày · ${data?.summary.activeVip ?? 0} gói VIP đang hiệu lực` },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2 [&>*]:min-w-0">
        <Panel title="Doanh thu theo tháng" sub="Triệu đồng, 6 tháng gần nhất">
          {R.revenue.some(Boolean) ? <LineChart ariaLabel="Doanh thu theo tháng" labels={R.labels} series={[{ name: 'Doanh thu', values: R.revenue }]} unit=" tr" format={(v) => v.toLocaleString(appLocale())} height={240} /> : <p className="py-16 text-center text-sm text-slate-500">Chưa có giao dịch thành công trong 6 tháng gần nhất.</p>}
        </Panel>
        <Panel title="Số gói bán ra" sub="Theo tháng, từng gói">
          {R.byPlan.some((p) => p.counts.some(Boolean)) ? (
            <LineChart ariaLabel="Số gói bán ra theo tháng" labels={R.labels} series={R.byPlan.map((p) => ({ name: p.name, values: p.counts }))} unit=" gói" height={240} />
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">Chưa có gói nào được bán.</p>
          )}
        </Panel>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-slate-900">Các gói đang bán</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className={cn('flex flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]', p.highlight ? 'border-indigo-300 ring-4 ring-indigo-500/10' : 'border-slate-200/80', !p.active && 'opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-[17px] font-bold text-slate-900">{p.name}</p>
                  <p className="mt-0.5 text-[13px] text-slate-500">{p.description}</p>
                </div>
                {p.badge && <span className="shrink-0 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">{p.badge}</span>}
              </div>
              <p className="mt-4 font-display text-[1.7rem] font-extrabold tabular-nums text-slate-900">
                {formatCurrency(p.price)} <span className="text-sm font-medium text-slate-500">{p.price ? p.period : ''}</span>
              </p>
              <ul className="mt-3 flex-1 space-y-1.5 text-[13px]">
                {p.features.filter((f) => f.included).slice(0, 4).map((f) => (
                  <li key={f.text} className="flex gap-2 text-slate-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {f.text}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <Switch checked={p.active} onChange={(v) => void run(() => adminApi.updatePlan(p.code, { isActive: v }), v ? 'Đã mở bán gói' : 'Đã ngừng bán gói', p.name)} label="Đang bán" />
                {p.price > 0 && (
                  <TBtn size="sm" icon={<Pencil />} onClick={() => { setEditing(p); setPrice(String(p.price)); }}>
                    Sửa giá
                  </TBtn>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Panel
        title="Giao dịch"
        sub={`${rows.length} giao dịch`}
        flush
        action={
          <div className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(inputCls, 'h-9 w-[150px] max-sm:w-[132px]')} aria-label="Trạng thái">
              <option value="">Mọi trạng thái</option>
              {Object.entries(TXN_STATUS).map(([k, s]) => (
                <option key={k} value={k}>
                  {s.label}
                </option>
              ))}
            </select>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={cn(inputCls, 'h-9 w-[168px] max-sm:hidden')} aria-label="Phương thức">
              <option value="">Mọi phương thức</option>
              {Object.entries(METHOD).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Mã</th>
                <th className={tbl.th}>Học viên</th>
                <th className={tbl.th}>Gói</th>
                <th className={cn(tbl.th, 'text-right')}>Số tiền</th>
                <th className={tbl.th}>Phương thức</th>
                <th className={tbl.th}>Thời gian</th>
                <th className={tbl.th}>Trạng thái</th>
                <th className={tbl.th} />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className={tbl.tr}>
                  <td className={cn(tbl.td, 'whitespace-nowrap font-mono text-[12px] text-slate-600')}>{t.orderCode}</td>
                  <td className={cn(tbl.td, 'min-w-[180px]')}>
                    <p className="font-medium text-slate-900">{t.userName}</p>
                    <p className="text-[12px] text-slate-500">{t.email}</p>
                  </td>
                  <td className={cn(tbl.td, 'whitespace-nowrap')}>{planName(t.planId)}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-right font-semibold tabular-nums')}>{vnd(t.amount)}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{METHOD[t.method]}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{formatDateTime(t.createdAt)}</td>
                  <td className={tbl.td}>
                    <Status tone={TXN_STATUS[t.status].tone}>{TXN_STATUS[t.status].label}</Status>
                  </td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                    {t.status === 'PENDING' && (
                      <TBtn size="sm" variant="primary" icon={<BadgeCheck />} disabled={busy} onClick={() => void run(() => adminApi.confirmPayment(t.id), 'Đã xác nhận thanh toán', `${t.userName} được kích hoạt ${planName(t.planId)}`)}>
                        Xác nhận
                      </TBtn>
                    )}
                    {t.status === 'PAID' && (
                      <TBtn size="sm" variant="ghost" onClick={() => { setRefund(t); setReason(''); }}>
                        Hoàn tiền
                      </TBtn>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-500">
                    {isLoading ? 'Đang tải…' : 'Không có giao dịch phù hợp.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Sửa giá gói ${editing?.name ?? ''}`}
        description="Giá mới áp dụng cho giao dịch tạo sau khi lưu; học viên đang dùng gói không bị ảnh hưởng."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Huỷ</Button>
            <Button
              disabled={!Number(price)}
              loading={busy}
              onClick={async () => {
                if (!editing) return;
                if (await run(() => adminApi.updatePlan(editing.code, { price: Math.round(Number(price)) }), 'Đã cập nhật giá', `${editing.name}: ${vnd(Number(price))}`)) setEditing(null);
              }}
            >
              Lưu
            </Button>
          </>
        }
      >
        <Input label={`Giá (VNĐ) ${editing?.period ?? ''}`} type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(e.target.value)} />
      </Modal>

      <Modal
        open={!!refund}
        onClose={() => setRefund(null)}
        title="Hoàn tiền giao dịch?"
        description={refund ? `Hoàn ${vnd(refund.amount)} cho ${refund.userName} qua ${METHOD[refund.method]}. Gói kích hoạt từ giao dịch này sẽ bị huỷ.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRefund(null)}>Huỷ</Button>
            <Button
              variant="danger"
              loading={busy}
              disabled={reason.trim().length < 3}
              onClick={async () => {
                if (!refund) return;
                if (await run(() => adminApi.refundPayment(refund.id, reason.trim()), 'Đã hoàn tiền', `${(refund as AdminTxn).orderCode} · ${refund.userName}`)) setRefund(null);
              }}
            >
              Hoàn tiền
            </Button>
          </>
        }
      >
        <Input label="Lý do hoàn tiền" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Học viên mua nhầm gói" required />
      </Modal>
    </div>
  );
};
