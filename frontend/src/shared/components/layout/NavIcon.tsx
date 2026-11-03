import React from 'react';
import { cn } from '@/shared/utils';

type IconType = React.ElementType;

/**
 * Icon menu (lucide-react, nét mảnh một màu) — dùng chung cho header website và khu quản lý.
 * Ô vuông bo góc nền trung tính; rê chuột / đang mở → tông thương hiệu. Màu theo biến theme nên đúng cả chế độ tối.
 */
export const NavIconTile: React.FC<{ icon?: IconType; active?: boolean; size?: 'sm' | 'md' }> = ({ icon: Icon, active, size = 'md' }) =>
  Icon ? (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-colors duration-150',
        size === 'md' ? 'h-9 w-9' : 'h-7 w-7',
        active
          ? 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20'
          : 'bg-slate-100 text-slate-500 ring-slate-200 group-hover/item:bg-indigo-500/10 group-hover/item:text-indigo-600 group-hover/item:ring-indigo-500/20'
      )}
    >
      <Icon className={size === 'md' ? 'h-[18px] w-[18px]' : 'h-4 w-4'} strokeWidth={1.75} aria-hidden />
    </span>
  ) : null;

/** Icon nhỏ cạnh nhãn menu cấp 1 — chỉ hiện khi màn hình đủ rộng */
export const NavTopIcon: React.FC<{ icon?: IconType }> = ({ icon: Icon }) => (Icon ? <Icon className="hidden h-4 w-4 shrink-0 opacity-75 min-[1440px]:block" strokeWidth={1.75} aria-hidden /> : null);
