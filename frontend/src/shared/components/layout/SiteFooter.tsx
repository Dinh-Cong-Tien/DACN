import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Mail, MapPin, Phone, Instagram } from 'lucide-react';
import { Logo } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { useT } from '@/shared/i18n';
import { useResolvedTheme } from '@/shared/stores/themeStore';

export interface FooterLink {
  to: string;
  label: string;
}
export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SiteFooterProps {
  /** Dòng phụ dưới logo (khu quản lý: tên khu vực) */
  tagline?: string;
  description?: string;
  /** Các cột liên kết giữa footer (chuẩn: 2 cột) */
  columns?: FooterColumn[];
  email?: string;
  /** Liên kết nhỏ dưới cột Liên hệ */
  contactLinks?: FooterLink[];
  /** Bên phải thanh cuối: trạng thái hệ thống */
  status?: React.ReactNode;
  className?: string;
}

const PUBLIC_COLUMNS: FooterColumn[] = [
  {
    title: 'Chương trình',
    links: [
      { to: '/toeic', label: 'Luyện thi TOEIC 450–990' },
      { to: '/vstep', label: 'Luyện thi VSTEP B1–C1' },
      { to: '/courses', label: 'Khoá học kỹ năng' },
      { to: '/mock-tests?exam=TOEIC', label: 'Đề thi thử TOEIC' },
      { to: '/mock-tests?exam=VSTEP', label: 'Đề thi thử VSTEP' },
    ],
  },
  {
    title: 'Tài nguyên',
    links: [
      { to: '/score-converter', label: 'Quy đổi điểm' },
      { to: '/resources', label: 'Kho tài liệu mở' },
      { to: '/blog', label: 'Mẹo thi & Cẩm nang' },
      { to: '/leaderboard', label: 'Bảng vinh danh' },
      { to: '/faq', label: 'Câu hỏi thường gặp' },
      { to: '/help', label: 'Trung tâm trợ giúp' },
    ],
  },
];

const PUBLIC_CONTACT_LINKS: FooterLink[] = [
  { to: '/about', label: 'Giới thiệu' },
  { to: '/contact', label: 'Liên hệ' },
  { to: '/pricing', label: 'Bảng giá' },
];

/** Trạng thái mặc định ở thanh cuối */
export const FooterStatus: React.FC<{ tone?: 'ok' | 'warn' | 'error' | 'idle'; children: React.ReactNode }> = ({ tone = 'ok', children }) => (
  <span className="flex items-center gap-1.5">
    <span className={cn('h-2 w-2 rounded-full', tone === 'ok' ? 'animate-pulse bg-emerald-400' : tone === 'warn' ? 'bg-amber-400' : tone === 'error' ? 'bg-rose-500' : 'bg-slate-500')} />
    {children}
  </span>
);

/**
 * Footer chuẩn của toàn hệ thống (lấy theo footer website học viên):
 * logo + mô tả + mạng xã hội · 2 cột liên kết · cột Liên hệ · thanh bản quyền + trạng thái.
 * Khu quản lý (giáo viên, trưởng bộ môn, admin) dùng lại, chỉ đổi nội dung cột.
 */
export const SiteFooter: React.FC<SiteFooterProps> = ({
  tagline,
  description = 'Nền tảng luyện thi TOEIC và VSTEP theo lộ trình cá nhân: thi thử chuẩn, sổ tay lỗi sai, ôn tập ngắt quãng và lớp học với giáo viên.',
  columns = PUBLIC_COLUMNS,
  email = 'hello@orbilingo.vn',
  contactLinks = PUBLIC_CONTACT_LINKS,
  status,
  className,
}) => {
  const t = useT();
  // Footer theo chế độ sáng/tối: tối = nền đêm, sáng = nền kem với chữ đậm
  const dark = useResolvedTheme() === 'dark';
  const heading = dark ? 'text-white' : 'text-slate-900';
  const muted = dark ? 'text-slate-400' : 'text-slate-900';
  const accent = dark ? 'text-amber-300' : 'text-amber-600';
  const line = dark ? 'border-white/10' : 'border-slate-900/10';
  return (
  <footer className={cn('relative overflow-hidden border-t', line, dark ? 'bg-slate-950 text-slate-300' : 'bg-[#f3efe6] text-slate-900', className)}>
    <div aria-hidden className={cn('absolute inset-0 bg-dots', dark ? 'opacity-10' : 'opacity-[0.04]')} />
    <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
      <div className="space-y-4 lg:col-span-2">
        <Logo size="md" dark={dark} tagline={tagline && t(tagline)} />
        <p className={cn('max-w-sm text-sm leading-relaxed', muted)}>{t(description)}</p>
        <div className="flex items-center gap-2">
          {[Facebook, Youtube, Instagram, Mail].map((Icon, i) => (
            <a key={i} href="#" className={cn('flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-300 hover:text-slate-900', dark ? 'border-white/10 bg-white/5' : 'border-slate-900/15 bg-white text-slate-900')}>
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      {columns.map((c) => (
        <div key={c.title}>
          <h4 className={cn('font-display mb-4 text-sm font-bold', heading)}>{t(c.title)}</h4>
          <ul className="space-y-2.5 text-sm">
            {c.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={cn('inline-block transition hover:translate-x-0.5', dark ? 'hover:text-amber-300' : 'hover:text-amber-700')}>
                  {t(l.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <h4 className={cn('font-display mb-4 text-sm font-bold', heading)}>{t('Liên hệ')}</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2.5">
            <MapPin className={cn('mt-0.5 h-4 w-4 shrink-0', accent)} /> {t('54 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng')}
          </li>
          <li className="flex items-center gap-2.5">
            <Phone className={cn('h-4 w-4', accent)} /> 0236 555 0199
          </li>
          <li className="flex items-center gap-2.5">
            <Mail className={cn('h-4 w-4', accent)} /> {email}
          </li>
        </ul>
        <div className={cn('mt-4 flex gap-3 text-xs', muted)}>
          {contactLinks.map((l) => (
            <Link key={l.to} to={l.to} className={dark ? 'hover:text-white' : 'hover:text-slate-900'}>
              {t(l.label)}
            </Link>
          ))}
        </div>
      </div>
    </div>
    <div className={cn('relative border-t', line)}>
      <div className={cn("mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs md:flex-row", muted)}>
        <span>{t('© 2026 OrbiLingo · Đồ án chuyên ngành, Khoa CNTT. Bảo lưu mọi quyền.')}</span>
        <span className="flex gap-4">
          <Link to="/terms" className="hover:underline">{t('Điều khoản sử dụng')}</Link>
          <Link to="/privacy" className="hover:underline">{t('Chính sách bảo mật')}</Link>
        </span>
        {status ?? <FooterStatus>{t('Hệ thống hoạt động ổn định')}</FooterStatus>}
      </div>
    </div>
  </footer>
  );
};
