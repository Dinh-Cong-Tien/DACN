import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/shared/utils';
import { useAuthStore } from '@/shared/stores/authStore';
import { CommandPalette, StaffUiContext } from '@/shared/components/ui';
import { UpgradeDialog } from '@/shared/components/vip/UpgradeDialog';
import { PageTransition } from '@/shared/components/motion';
import { PageBackdrop } from './PageBackdrop';
import { StaffHeader } from './StaffHeader';
import { StaffFooter } from './StaffFooter';
import { RouteProgress, BackToTop } from '@/shared/components/layout/ScrollExtras';
import { ChatWidget } from '@/shared/components/support';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  end?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface AppShellProps {
  groups: NavGroup[];
  brandTagline: string;
  theme?: 'light' | 'dark';
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose';
  headerLabel: string;
  settingsTo?: string;
  profileTo?: string;
  notificationsTo?: string;
  showStreak?: boolean;
  topExtra?: React.ReactNode;
  /** Giao diện giáo viên: header viền mảnh, menu thả xuống viền mảnh (nền chung như trang học viên) */
  workspace?: boolean;
  /** Thay menu chữ mặc định trên header bằng menu riêng của vai trò (giáo viên) */
  headerNav?: React.ReactNode;
}

/** Khung khu quản lý: StaffHeader · nội dung · StaffFooter (footer chuẩn như website học viên) */
export const AppShell: React.FC<AppShellProps> = (props) => {
  const { groups, brandTagline, settingsTo, notificationsTo, workspace } = props;
  const user = useAuthStore((s) => s.user);
  return (
    <div className={cn('portal relative min-h-screen flex flex-col font-sans text-slate-800', workspace && 'staff-ui')}>
      <PageBackdrop />
      <StaffHeader {...props} />

      {/* ===== Nội dung ===== */}
      <main className={cn('flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 min-w-0', workspace ? 'pb-10 md:pb-14' : 'pb-24 md:pb-12')}>
        <StaffUiContext.Provider value={Boolean(workspace)}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </StaffUiContext.Provider>
      </main>

      {workspace && <StaffFooter groups={groups} brandTagline={brandTagline} settingsTo={settingsTo} notificationsTo={notificationsTo} showSystemStatus={user?.role === 'ADMIN'} />}

      <RouteProgress />
      {/* chỉ học viên có kênh chat hỗ trợ; nút đẩy lên trên thanh điều hướng đáy ở mobile */}
      {user?.role === 'STUDENT' ? (
        <>
          <BackToTop className="bottom-[10.25rem] md:bottom-[5.75rem]" />
          <ChatWidget raised="md" preferChat />
        </>
      ) : (
        <BackToTop className="bottom-20 md:bottom-5" />
      )}
      <CommandPalette />
      <UpgradeDialog />
    </div>
  );
};
