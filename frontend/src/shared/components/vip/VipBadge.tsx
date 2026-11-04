import React from 'react';
import { Crown, Lock } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useAuthStore } from '@/shared/stores/authStore';
import { openUpgrade, type UpgradeRequest } from '@/shared/stores/uiStore';
import './vip.css';

/** Tài khoản đang dùng gói VIP? (khách / gói Free → false) */
export const useIsVip = () => useAuthStore((s) => s.user?.plan === 'VIP');

/** Nhãn VIP thống nhất toàn site; `locked` = người xem chưa có VIP (hiện ổ khoá thay vương miện) */
export const VipBadge: React.FC<{ locked?: boolean; className?: string; label?: string }> = ({ locked, className, label = 'VIP' }) => (
  <span className={cn('vip-badge', locked && 'vip-badge--locked', className)}>
    {locked ? <Lock aria-hidden /> : <Crown aria-hidden />}
    {label}
  </span>
);

/**
 * Khung báo nội dung thuộc gói VIP (đặt trong trang chi tiết): tiêu đề, lý do, quyền lợi chính + nút mở hộp thoại nâng cấp.
 * Người đã có VIP → không hiện.
 */
export const VipNotice: React.FC<{ request: UpgradeRequest; title: string; perks?: string[]; className?: string }> = ({ request, title, perks, className }) => {
  const isVip = useIsVip();
  if (isVip) return null;
  return (
    <div className={cn('vip-notice', className)}>
      <span className="vip-notice__icon">
        <Crown aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="vip-notice__title">{title}</p>
        {request.reason && <p className="vip-notice__text">{request.reason}</p>}
        {perks?.length ? (
          <ul className="vip-notice__perks">
            {perks.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <button type="button" className="vip-cta" onClick={() => openUpgrade(request)}>
        <Crown aria-hidden /> Nâng cấp VIP
      </button>
    </div>
  );
};
