import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, LifeBuoy, Mail, Phone, Settings, Bell } from 'lucide-react';
import { Logo } from '@/shared/components/ui';
import { useAdminSystem } from '@/shared/api/admin';
import type { NavGroup } from './AppShell';
import { academicTerm } from '@/shared/constants/staff';

export interface StaffFooterProps {
  /** Các nhóm menu của vai trò — mỗi nhóm thành một cột liên kết nhanh */
  groups: NavGroup[];
  brandTagline: string;
  settingsTo?: string;
  notificationsTo?: string;
  /** Hiện trạng thái dịch vụ (chỉ quản trị viên cần biết) */
  showSystemStatus?: boolean;
}

/** Footer khu vực quản lý (giáo viên, trưởng bộ môn, quản trị): cùng nền tối với footer website học viên */
export const StaffFooter: React.FC<StaffFooterProps> = ({ groups, brandTagline, settingsTo, notificationsTo, showSystemStatus }) => {
  // Trạng thái dịch vụ đo thật (chỉ admin gọi API hệ thống)
  const sys = useAdminSystem(!!showSystemStatus);
  const degraded = sys.data?.services.filter((s) => s.status !== 'UP').length ?? 0;
  const support = [
    settingsTo && { to: settingsTo, label: 'Cài đặt tài khoản', icon: Settings },
    notificationsTo && { to: notificationsTo, label: 'Thông báo', icon: Bell },
    { to: '/help', label: 'Trung tâm trợ giúp', icon: LifeBuoy },
    { to: '/faq', label: 'Câu hỏi thường gặp', icon: HelpCircle },
  ].filter(Boolean) as { to: string; label: string; icon: typeof Bell }[];

  return (
    <footer className="relative mt-6 overflow-hidden border-t border-white/10 bg-slate-950 pb-16 text-slate-300 md:pb-0">
      <div aria-hidden className="bg-dots absolute inset-0 opacity-10" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
        <div className="space-y-4 lg:w-80 lg:shrink-0">
          <Logo size="md" dark tagline={brandTagline} />
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">Nền tảng luyện thi TOEIC và VSTEP: quản lý lớp học, giao bài, chấm điểm và theo dõi tiến độ học viên trên cùng một hệ thống.</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-amber-300" /> Hỗ trợ kỹ thuật: 0236 555 0199
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-amber-300" /> support@orbilingo.vn
            </li>
          </ul>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
          {groups.map((g) => (
            <FooterColumn key={g.title ?? g.items[0]?.to} title={g.title ?? brandTagline} links={g.items.map((i) => ({ to: i.to, label: i.label }))} />
          ))}
          <FooterColumn title="Hỗ trợ" links={support} />
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 md:flex-row md:text-left lg:px-8">
          <span>© {new Date().getFullYear()} OrbiLingo · Đồ án chuyên ngành, Khoa CNTT. Bảo lưu mọi quyền.</span>
          {showSystemStatus ? (
            <span className="flex items-center gap-1.5">
              <span className={sys.isError ? 'h-2 w-2 rounded-full bg-rose-500' : !sys.data ? 'h-2 w-2 rounded-full bg-slate-500' : degraded ? 'h-2 w-2 rounded-full bg-amber-400' : 'h-2 w-2 animate-pulse rounded-full bg-emerald-400'} />
              {sys.isError ? 'Không kết nối được máy chủ API' : !sys.data ? 'Đang kiểm tra trạng thái…' : degraded ? `${degraded} dịch vụ đang chậm, hệ thống vẫn hoạt động` : 'Hệ thống hoạt động ổn định'} · Phiên bản 1.0
            </span>
          ) : (
            <span>Phiên bản 1.0 · {academicTerm().label}</span>
          )}
        </div>
      </div>
    </footer>
  );
};

const FooterColumn: React.FC<{ title: string; links: { to: string; label: string; icon?: typeof Bell }[] }> = ({ title, links }) => (
  <div className="min-w-0">
    <h4 className="font-display mb-4 text-sm font-bold text-white">{title}</h4>
    <ul className="space-y-2.5 text-sm">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className="inline-flex items-center gap-2 transition hover:translate-x-0.5 hover:text-amber-300">
            {l.icon && <l.icon className="h-3.5 w-3.5 text-slate-500" />}
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
