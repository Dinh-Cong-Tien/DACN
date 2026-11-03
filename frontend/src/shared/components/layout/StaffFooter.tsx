import React from 'react';
import { useAdminSystem } from '@/shared/api/admin';
import type { NavGroup } from './AppShell';
import { academicTerm } from '@/shared/constants/staff';
import { FooterStatus, SiteFooter, type FooterLink } from './SiteFooter';
import { useT } from '@/shared/i18n';

export interface StaffFooterProps {
  /** Các nhóm menu của vai trò — nhóm đầu thành cột "truy cập nhanh" */
  groups: NavGroup[];
  brandTagline: string;
  settingsTo?: string;
  notificationsTo?: string;
  /** Hiện trạng thái dịch vụ đo thật (chỉ quản trị viên cần biết) */
  showSystemStatus?: boolean;
}

/** Footer khu quản lý: dùng đúng footer chuẩn của website học viên, chỉ đổi nội dung cột theo vai trò */
export const StaffFooter: React.FC<StaffFooterProps> = ({ groups, brandTagline, settingsTo, notificationsTo, showSystemStatus }) => {
  const sys = useAdminSystem(!!showSystemStatus);
  const t = useT();
  const degraded = sys.data?.services.filter((s) => s.status !== 'UP').length ?? 0;
  const [first] = groups;
  const support = [
    settingsTo && { to: settingsTo, label: 'Cài đặt tài khoản' },
    notificationsTo && { to: notificationsTo, label: 'Thông báo' },
    { to: '/help', label: 'Trung tâm trợ giúp' },
    { to: '/faq', label: 'Câu hỏi thường gặp' },
  ].filter(Boolean) as FooterLink[];

  const status = showSystemStatus ? (
    <FooterStatus tone={sys.isError ? 'error' : !sys.data ? 'idle' : degraded ? 'warn' : 'ok'}>
      {t(sys.isError ? 'Không kết nối được máy chủ API' : !sys.data ? 'Đang kiểm tra trạng thái…' : degraded ? `${degraded} dịch vụ đang chậm, hệ thống vẫn hoạt động` : 'Hệ thống hoạt động ổn định')} · {t('Phiên bản 1.0')}
    </FooterStatus>
  ) : (
    <FooterStatus>{t('Phiên bản 1.0')} · {t(academicTerm().label)}</FooterStatus>
  );

  return (
    <SiteFooter
      className="mt-6 pb-16 md:pb-0"
      tagline={brandTagline}
      description="Nền tảng luyện thi TOEIC và VSTEP: quản lý lớp học, giao bài, chấm điểm và theo dõi tiến độ học viên trên cùng một hệ thống."
      columns={[
        { title: first?.title ?? 'Truy cập nhanh', links: (first?.items ?? []).map((i) => ({ to: i.to, label: i.label })) },
        { title: 'Hỗ trợ', links: support },
      ]}
      email="support@orbilingo.vn"
      contactLinks={[
        { to: '/', label: 'Trang chủ' },
        { to: '/about', label: 'Giới thiệu' },
        { to: '/contact', label: 'Liên hệ' },
      ]}
      status={status}
    />
  );
};
