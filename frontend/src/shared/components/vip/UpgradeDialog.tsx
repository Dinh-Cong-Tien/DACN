import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, Copy, Crown, Landmark, Loader2, ShieldCheck } from 'lucide-react';
import { Modal } from '@/shared/components/ui';
import { usePlans, type PlanDto } from '@/shared/api/cms';
import { useBilling, useCancelOrder, useCreateOrder, type PayTo } from '@/shared/api/learner';
import { errorMessage } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast, useUiStore } from '@/shared/stores/uiStore';
import { cn, formatDate, formatVnd } from '@/shared/utils';
import './vip.css';

export const vnd = formatVnd;
/** Số ngày của một chu kỳ, đọc từ chuỗi "/ 30 ngày" */
export const daysOf = (period: string) => Number(period.match(/\d+/)?.[0] ?? 30);
/** Giá quy ra mỗi tháng (làm tròn nghìn) */
export const perMonth = (p: { price: number; period: string }) => Math.round((p.price * 30) / daysOf(p.period) / 1000) * 1000;

type Order = { orderCode: string; planName: string; amount: number; discount: number; transferNote?: string };
const STEPS = ['Chọn gói', 'Chuyển khoản', 'Kích hoạt VIP'];

const copy = (label: string, text: string) => {
  if (!navigator.clipboard?.writeText) return toast.info(label, text);
  navigator.clipboard.writeText(text).then(
    () => toast.success(`Đã sao chép ${label.toLowerCase()}`, text),
    () => toast.info(label, text)
  );
};

const Steps: React.FC<{ at: number }> = ({ at }) => (
  <ol className="vip-steps" aria-label="Các bước nâng cấp">
    {STEPS.map((s, i) => (
      <li key={s} className={cn(i < at && 'is-done', i === at && 'is-current')} aria-current={i === at ? 'step' : undefined}>
        <span className="vip-steps__dot">{i < at ? <Check aria-hidden /> : i + 1}</span>
        <span className="vip-steps__label">{s}</span>
      </li>
    ))}
  </ol>
);

const PlanOption: React.FC<{ plan: PlanDto; checked: boolean; onSelect?: () => void }> = ({ plan, checked, onSelect }) => (
  <label className={cn('vip-plan', checked && 'is-checked', !onSelect && 'is-static')}>
    {onSelect && <input type="radio" name="vip-plan" className="sr-only" checked={checked} onChange={onSelect} />}
    <span className="vip-plan__radio" aria-hidden />
    <span className="min-w-0 flex-1">
      <span className="vip-plan__name">
        {plan.name}
        {(plan.badge || plan.highlight) && <span className="vip-plan__tag">{plan.badge ?? 'Đề xuất'}</span>}
      </span>
      <span className="vip-plan__desc">{plan.description}</span>
    </span>
    <span className="vip-plan__price">
      <b>{vnd(plan.price)}</b>
      <small>{plan.period}</small>
      {daysOf(plan.period) > 31 && <small>≈ {vnd(perMonth(plan))}/tháng</small>}
    </span>
  </label>
);

const Row: React.FC<{ label: string; value: string; copyable?: boolean; strong?: boolean }> = ({ label, value, copyable, strong }) => (
  <div className="vip-row">
    <dt>{label}</dt>
    <dd className={cn(strong && 'is-strong')}>
      <span className="min-w-0 break-all">{value}</span>
      {copyable && (
        <button type="button" className="vip-copy" onClick={() => copy(label, value)} aria-label={`Sao chép ${label.toLowerCase()}`}>
          <Copy aria-hidden />
        </button>
      )}
    </dd>
  </div>
);

/** Bước 2: thông tin chuyển khoản của đơn đang chờ */
const PayStep: React.FC<{ order: Order; payTo: PayTo | null | undefined }> = ({ order, payTo }) => (
  <div className="space-y-4">
    <dl className="vip-card">
      <Row label="Gói" value={order.planName} />
      <Row label="Mã đơn" value={order.orderCode} copyable />
      {order.discount > 0 && <Row label="Giảm giá" value={`− ${vnd(order.discount)}`} />}
      <Row label="Số tiền" value={vnd(order.amount)} strong />
    </dl>
    {payTo ? (
      <div>
        <p className="vip-sub">
          <Landmark aria-hidden /> Chuyển khoản tới
        </p>
        <dl className="vip-card">
          {payTo.bankName && <Row label="Ngân hàng" value={payTo.bankName} />}
          <Row label="Số tài khoản" value={payTo.accountNo} copyable strong />
          {payTo.accountName && <Row label="Chủ tài khoản" value={payTo.accountName} />}
          <Row label="Số tiền" value={String(order.amount)} copyable />
          <Row label="Nội dung" value={order.transferNote ?? order.orderCode} copyable strong />
        </dl>
        <p className="vip-hint">Ghi đúng nội dung chuyển khoản để hệ thống đối soát. Gói VIP được kích hoạt ngay khi quản trị viên xác nhận giao dịch — trang này tự cập nhật.</p>
      </div>
    ) : (
      <p className="vip-hint vip-hint--warn">
        Thông tin tài khoản nhận đang được cập nhật. Vui lòng liên hệ <a href="mailto:hello@orbilingo.vn">hello@orbilingo.vn</a> kèm mã đơn <b>{order.orderCode}</b> để được hướng dẫn thanh toán.
      </p>
    )}
  </div>
);

/**
 * Hộp thoại nâng cấp VIP dùng chung (mở bằng openUpgrade()): chọn gói → tạo đơn → thông tin chuyển khoản → tự nhận khi gói được kích hoạt.
 * Khách: xem gói + đăng ký / đăng nhập. Tài khoản không phải học viên: báo gói chỉ dành cho học viên.
 */
export const UpgradeDialog: React.FC = () => {
  const req = useUiStore((s) => s.upgrade);
  const setUpgrade = useUiStore((s) => s.setUpgrade);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const navigate = useNavigate();
  const location = useLocation();
  const open = !!req;
  const isStudent = user?.role === 'STUDENT';

  const { data: plans = [] } = usePlans();
  const paid = useMemo(() => plans.filter((p) => p.price > 0 && p.code), [plans]);
  const billing = useBilling({ poll: open && isStudent, enabled: open && isStudent });
  const createOrder = useCreateOrder();
  const cancelOrder = useCancelOrder();

  const [code, setCode] = useState<string>();
  const [coupon, setCoupon] = useState('');
  const [step, setStep] = useState<'plans' | 'pay'>('plans');
  const [created, setCreated] = useState<Order | null>(null);

  const pendingTxn = billing.data?.transactions.find((t) => t.status === 'PENDING');
  const pending: Order | null = pendingTxn ? { orderCode: pendingTxn.orderCode, planName: pendingTxn.planName, amount: pendingTxn.amount, discount: pendingTxn.discount, transferNote: pendingTxn.transferNote } : null;
  const order = pending ?? created;
  const activated = isStudent && (user?.plan === 'VIP' || billing.data?.plan === 'VIP');

  // mở hộp thoại: đang có đơn chờ → vào thẳng bước chuyển khoản; chọn sẵn gói đề xuất
  useEffect(() => {
    if (!open) return;
    setCreated(null);
    setCoupon('');
    setStep('plans');
  }, [open]);
  useEffect(() => {
    if (open && pendingTxn) setStep('pay');
  }, [open, pendingTxn?.orderCode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open || !paid.length) return;
    const asked = req?.planCode && paid.find((p) => p.code === req.planCode);
    const forExam = req?.exam && paid.find((p) => p.entitlements?.MOCK_TEST_VIP?.exam === req.exam);
    setCode((asked || forExam || paid.find((p) => p.highlight) || paid[0]).code);
  }, [open, paid, req?.exam, req?.planCode]);
  // admin xác nhận thanh toán trong lúc đang mở → cập nhật gói ngay
  useEffect(() => {
    if (billing.data?.plan === 'VIP' && user?.plan !== 'VIP') updateUser({ plan: 'VIP' });
  }, [billing.data?.plan, user?.plan, updateUser]);

  const close = () => setUpgrade(null);
  const selected = paid.find((p) => p.code === code);
  const next = encodeURIComponent(location.pathname + location.search);

  const submit = () => {
    if (!selected?.code) return;
    createOrder
      .mutateAsync({ planCode: selected.code, method: 'BANK', ...(coupon.trim() ? { couponCode: coupon.trim() } : {}) })
      .then((o) => {
        setCreated({ orderCode: o.orderCode, planName: selected.name, amount: o.amount, discount: o.discount ?? 0, transferNote: o.transferNote });
        setStep('pay');
      })
      .catch((e) => toast.error('Chưa tạo được đơn', errorMessage(e)));
  };
  const changePlan = () => {
    if (!pending) return setStep('plans');
    cancelOrder
      .mutateAsync(pending.orderCode)
      .then(() => {
        setCreated(null);
        setStep('plans');
      })
      .catch((e) => toast.error('Chưa huỷ được đơn', errorMessage(e)));
  };

  const head = (
    <div className="vip-hero">
      <span className="vip-hero__icon">
        <Crown aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="vip-hero__eyebrow">OrbiLingo VIP</p>
        <h2 className="vip-hero__title">{activated ? 'Bạn đang dùng gói VIP' : req?.subject ? `Mở khoá ${req.subject}` : 'Nâng cấp lên gói VIP'}</h2>
        <p className="vip-hero__text">{activated ? 'Toàn bộ nội dung VIP đã được mở.' : (req?.reason ?? 'Mở toàn bộ kho đề VIP, thêm lượt luyện tập và giáo viên chấm bài.')}</p>
      </div>
    </div>
  );

  let body: React.ReactNode;
  let footer: React.ReactNode;
  if (activated) {
    const sub = billing.data?.subscription;
    body = (
      <div className="vip-done">
        <CheckCircle2 aria-hidden />
        <p>
          Gói <b>{sub?.planName ?? 'VIP'}</b> đang hoạt động{sub?.endsAt ? ` đến ${formatDate(sub.endsAt)}` : ''}.
        </p>
      </div>
    );
    footer = (
      <button type="button" className="vip-cta" onClick={close}>
        Tiếp tục học
      </button>
    );
  } else if (!user || !isStudent) {
    body = (
      <div className="space-y-2.5">
        {paid.map((p) => (
          <PlanOption key={p.id} plan={p} checked={!!p.highlight} />
        ))}
        {user && <p className="vip-hint">Gói VIP dành cho tài khoản học viên.</p>}
      </div>
    );
    footer = user ? (
      <button type="button" className="vip-btn" onClick={close}>
        Đóng
      </button>
    ) : (
      <>
        <button type="button" className="vip-btn" onClick={() => (close(), navigate(`/auth/login?next=${next}`))}>
          Đăng nhập
        </button>
        <button type="button" className="vip-cta" onClick={() => (close(), navigate(`/auth/register?next=${next}`))}>
          Tạo tài khoản miễn phí
        </button>
      </>
    );
  } else if (step === 'pay' && order) {
    body = (
      <>
        <Steps at={1} />
        <PayStep order={order} payTo={billing.data?.payTo} />
      </>
    );
    footer = (
      <>
        <button type="button" className="vip-btn mr-auto" disabled={cancelOrder.isPending} onClick={changePlan}>
          {pending ? 'Huỷ đơn, chọn gói khác' : 'Chọn gói khác'}
        </button>
        <button
          type="button"
          className="vip-cta"
          onClick={() => {
            close();
            toast.info('Đang chờ xác nhận thanh toán', `Đơn ${order.orderCode} — bạn sẽ nhận thông báo khi gói VIP được kích hoạt.`);
          }}
        >
          Tôi đã chuyển khoản
        </button>
      </>
    );
  } else {
    body = (
      <>
        <Steps at={0} />
        <fieldset className="space-y-2.5">
          <legend className="sr-only">Chọn gói VIP</legend>
          {paid.length ? paid.map((p) => <PlanOption key={p.id} plan={p} checked={p.code === code} onSelect={() => setCode(p.code)} />) : <p className="vip-hint">Đang tải các gói…</p>}
        </fieldset>
        {selected && selected.features.some((f) => f.included) && (
          <ul className="vip-perks">
            {selected.features
              .filter((f) => f.included)
              .map((f) => (
                <li key={f.text}>
                  <Check aria-hidden /> {f.text}
                </li>
              ))}
          </ul>
        )}
        <label className="vip-coupon">
          <span>Mã giảm giá</span>
          <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Nếu có" maxLength={30} />
        </label>
        <p className="vip-trust">
          <ShieldCheck aria-hidden /> Thanh toán một lần bằng chuyển khoản, không tự động gia hạn.
        </p>
      </>
    );
    footer = (
      <>
        <button type="button" className="vip-btn" onClick={close}>
          Để sau
        </button>
        <button type="button" className="vip-cta" disabled={!selected || createOrder.isPending} onClick={submit}>
          {createOrder.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {selected ? `Tiếp tục · ${vnd(selected.price)}` : 'Tiếp tục'}
        </button>
      </>
    );
  }

  return (
    <Modal open={open} onClose={close} size="md" footer={footer}>
      <div className="space-y-5 pt-1">
        {head}
        {body}
      </div>
    </Modal>
  );
};
