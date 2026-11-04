import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils';
import { useAuthStore } from '@/shared/stores/authStore';
import { CommandPalette } from '@/shared/components/ui';
import { UpgradeDialog } from '@/shared/components/vip/UpgradeDialog';
import { PageTransition } from '@/shared/components/motion';
import { ScrollProgress, BackToTop, RouteProgress } from '@/shared/components/layout/ScrollExtras';
import { ChatWidget } from '@/shared/components/support';
import { PageBackdrop } from '@/shared/components/layout/PageBackdrop';
import { SiteHeader } from '@/shared/components/layout/SiteHeader';
import { SiteFooter } from '@/shared/components/layout/SiteFooter';

interface GuestLayoutProps {
  /** Bọc nội dung trong container (dùng cho các trang học viên /app/*) */
  contained?: boolean;
}

/**
 * Layout chung của toàn website: khách và học viên dùng cùng một header.
 * - Mọi người dùng chung menu chính (TOEIC, VSTEP, Khoá học, Thi thử, Công cụ, Bảng giá, Kinh nghiệm) như Study4/Prep.
 * - Chưa đăng nhập: Đăng nhập / Học thử miễn phí.
 * - Học viên: Khoá học / Thi thử / Bảng vinh danh mở trang của học viên (appTo); tìm kiếm, chuông, avatar mở "Góc học tập"
 *   (toàn bộ mục học tập), nút "Vào học". Mobile có thêm thanh điều hướng đáy.
 * - Giáo viên / Trưởng bộ môn / Admin: avatar + nút vào trang quản lý.
 */
export const GuestLayout: React.FC<GuestLayoutProps> = ({ contained }) => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isStudent = useAuthStore((s) => s.isAuthenticated()) && user?.role === 'STUDENT';
  const overHero = location.pathname === '/';

  return (
    <div className={cn('relative min-h-screen flex flex-col font-sans text-slate-800', contained && 'portal')}>
      {/* Nền giống trang chủ (trang chủ tự vẽ nền đêm riêng) */}
      {!overHero && <PageBackdrop />}

      <SiteHeader />

      <ScrollProgress />
      <RouteProgress />
      {/* học viên có thanh điều hướng đáy dưới lg → đẩy 2 nút nổi lên trên */}
      <BackToTop className={isStudent ? 'bottom-[10.25rem] lg:bottom-[5.75rem]' : undefined} />
      <ChatWidget raised={isStudent ? 'lg' : undefined} preferChat={isStudent} />
      <CommandPalette />
      <UpgradeDialog />

      <main className={cn('flex-1', contained && 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-24 lg:pb-12')}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <SiteFooter />
    </div>
  );
};
