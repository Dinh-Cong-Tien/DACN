import React, { useMemo, useState } from 'react';
import { BadgeCheck, Clock, Pencil, RotateCcw, Wallet, CreditCard, Check } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_PAYMENTS, PRICING_PLANS, REVENUE_MONTHLY } from '@/shared/mocks';
import type { PaymentTxn, PricingPlan } from '@/shared/types';
import { Button, ConfirmDialog, Input, Modal, Switch } from '@/shared/components/ui';
import { LineChart } from '@/shared/components/charts/Charts';
import { cn, formatCurrency, formatDateTime } from '@/shared/utils';
import { Figures, Panel, Status, TBtn, TPageHead, inputCls, tbl, type StatusTone } from '@/roles/teacher/components/TeacherKit';

const TXN_STATUS: Record<PaymentTxn['status'], { label: string; tone: StatusTone }> = { PAID: { label: 'Thành công', tone: 'green' }, PENDING: { label: 'Chờ xác nhận', tone: 'amber' }, REFUNDED: { label: 'Đã hoàn tiền', tone: 'gray' }, FAILED: { label: 'Thất bại', tone: 'red' } };
const METHOD: Record<PaymentTxn['method'], string> = { MOMO: 'MoMo', VNPAY: 'VNPay', CARD: 'Thẻ quốc tế', BANK: 'Chuyển khoản' };
const planName = (id: string) => PRICING_PLANS.find((p) => p.id === id)?.name ?? id;
const vnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

type Plan = PricingPlan & { active: boolean };

/** Gói VIP học viên mua ở trang Bảng giá: doanh thu, giao dịch, chỉnh giá gói */
export const AdminBillingPage: React.FC = () => {
  useDocumentTitle('Gói VIP & thanh toán');
  const [txns, setTxns] = useState<PaymentTxn[]>(MOCK_PAYMENTS);
  const [plans, setPlans] = useState<Plan[]>(PRICING_PLANS.map((p) => ({ ...p, active: true })));
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [editing, setEditing] = useState<Plan | null>(null);
  const [price, setPrice] = useState('');
  const [refund, setRefund] = useState<PaymentTxn | null>(null);

  const rows = useMemo(() => txns.filter((t) => (!status || t.status === status) && (!method || t.method === method)), [txns, status, method]);
  const thisMonth = txns.filter((t) => t.createdAt.startsWith('2026-11') && t.status === 'PAID').reduce((a, t) => a + t.amount, 0);
  const setTxn = (id: string, s: PaymentTxn['status']) => setTxns((ts) => ts.map((t) => (t.id === id ? { ...t, status: s } : t)));

  return (
    <div className="space-y-6">
      <TPageHead crumbs={[{ label: 'Vận hành' }, { label: 'Gói VIP & thanh toán' }]} title="Gói VIP & thanh toán" sub="Các gói học viên mua ở trang Bảng giá. Thanh toán chuyển khoản cần xác nhận thủ công trước khi kích hoạt VIP." />
      <Figures
        items={[
          { label: 'Doanh thu tháng 10', value: `${REVENUE_MONTHLY.revenue[5].toLocaleString('vi-VN')} tr`, icon: Wallet, tone: 'emerald', note: `+${Math.round((REVENUE_MONTHLY.revenue[5] / REVENUE_MONTHLY.revenue[4] - 1) * 100)}% so với tháng 9` },
          { label: 'Đầu tháng 11', value: vnd(thisMonth), icon: CreditCard, tone: 'indigo', note: `${txns.filter((t) => t.createdAt.startsWith('2026-11') && t.status === 'PAID').length} giao dịch thành công` },
          { label: 'Chờ xác nhận', value: txns.filter((t) => t.status === 'PENDING').length, icon: Clock, tone: 'amber', note: 'Chuyển khoản ngân hàng' },
          { label: 'Hoàn tiền', value: txns.filter((t) => t.status === 'REFUNDED').length, icon: RotateCcw, tone: 'rose', note: 'Trong 30 ngày' },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2 [&>*]:min-w-0">
        <Panel title="Doanh thu theo tháng" sub="Triệu đồng, 6 tháng gần nhất">
          <LineChart ariaLabel="Doanh thu theo tháng" labels={REVENUE_MONTHLY.labels} series={[{ name: 'Doanh thu', values: REVENUE_MONTHLY.revenue }]} unit=" tr" format={(v) => v.toLocaleString('vi-VN')} height={240} />
        </Panel>
        <Panel title="Số gói bán ra" sub="Theo tháng, từng gói">
          <LineChart
            ariaLabel="Số gói bán ra theo tháng"
            labels={REVENUE_MONTHLY.labels}
            series={[
              { name: 'VIP TOEIC', values: REVENUE_MONTHLY.vipToeic },
              { name: 'VSTEP Master', values: REVENUE_MONTHLY.vstepMaster },
            ]}
            unit=" gói"
            height={240}
          />
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
                <Switch checked={p.active} onChange={(v) => { setPlans((ps) => ps.map((x) => (x.id === p.id ? { ...x, active: v } : x))); toast.success(v ? 'Đã mở bán gói' : 'Đã ngừng bán gói', p.name); }} label="Đang bán" />
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
                  <td className={cn(tbl.td, 'whitespace-nowrap font-mono text-[12px] text-slate-600')}>{t.id}</td>
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
                      <TBtn size="sm" variant="primary" icon={<BadgeCheck />} onClick={() => { setTxn(t.id, 'PAID'); toast.success('Đã xác nhận thanh toán', `${t.userName} được kích hoạt ${planName(t.planId)}`); }}>
                        Xác nhận
                      </TBtn>
                    )}
                    {t.status === 'PAID' && (
                      <TBtn size="sm" variant="ghost" onClick={() => setRefund(t)}>
                        Hoàn tiền
                      </TBtn>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-500">
                    Không có giao dịch phù hợp.
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
              onClick={() => {
                if (!editing) return;
                setPlans((ps) => ps.map((x) => (x.id === editing.id ? { ...x, price: Number(price) } : x)));
                toast.success('Đã cập nhật giá', `${editing.name}: ${vnd(Number(price))}`);
                setEditing(null);
              }}
            >
              Lưu
            </Button>
          </>
        }
      >
        <Input label={`Giá (VNĐ) ${editing?.period ?? ''}`} type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(e.target.value)} />
      </Modal>

      <ConfirmDialog
        open={!!refund}
        onClose={() => setRefund(null)}
        danger
        title="Hoàn tiền giao dịch?"
        message={refund ? `Hoàn ${vnd(refund.amount)} cho ${refund.userName} qua ${METHOD[refund.method]}. Tài khoản sẽ trở về gói Free.` : undefined}
        confirmText="Hoàn tiền"
        onConfirm={() => {
          if (!refund) return;
          setTxn(refund.id, 'REFUNDED');
          toast.warning('Đã hoàn tiền', `${refund.id} · ${refund.userName}`);
          setRefund(null);
        }}
      />
    </div>
  );
};
