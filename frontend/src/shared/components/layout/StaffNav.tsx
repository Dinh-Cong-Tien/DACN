import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils';
import { STAFF_TOP_ICON } from './staffIcons';
import { NavIconTile, NavTopIcon } from './NavIcon';
import { useT } from '@/shared/i18n';

export interface StaffMenuLink {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  /** Nhãn nhóm trong dropdown, hiện ở mục đầu tiên của nhóm */
  group?: string;
  badge?: string;
  /** Chỉ sáng khi đúng đường dẫn (không tính trang con), vd. "Tất cả lớp" */
  exact?: boolean;
  /** Đường dẫn khác cũng thuộc mục này (vd. các tab con dùng chung một trang) */
  also?: string[];
}

export interface StaffMenu {
  label: string;
  to?: string;
  /** Icon cấp 1; mặc định tra theo nhãn trong STAFF_TOP_ICON */
  icon?: LucideIcon;
  badge?: string;
  /** Trang khác cũng thuộc mục này (vd lớp học nằm trong Khoá học & Lớp) */
  activeOn?: string[];
  children?: StaffMenuLink[];
}

/** Mục con đang mở: khớp đường dẫn, và khớp cả query nếu link có query */
const isHere = (link: StaffMenuLink, pathname: string, search: string) => {
  if (link.also?.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  const [path, query] = link.to.split('?');
  if (pathname !== path && (link.exact || !pathname.startsWith(`${path}/`))) return false;
  if (!query) return !search || Boolean(link.exact);
  const cur = new URLSearchParams(search);
  return [...new URLSearchParams(query)].every(([k, v]) => cur.get(k) === v);
};

const topCls = (active: boolean) => cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-slate-900/[0.06] text-indigo-700' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900');

const Count: React.FC<{ n: string }> = ({ n }) => <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded px-1 text-[10px] font-semibold text-white bg-rose-500">{n}</span>;

const DROPDOWN_W = 340;


/** Menu header khu vực quản lý: mục đơn hoặc dropdown có mô tả, nhóm, đếm số */
export const StaffNav: React.FC<{ menus: StaffMenu[]; label: string }> = ({ menus, label }) => {
  const { pathname, search } = useLocation();
  const t = useT();
  /** Menu xổ ra từ mép trái nút của nó (không đè lên mục bên cạnh); nếu sẽ tràn mép phải màn hình thì chỉ lùi sang trái đúng phần tràn */
  const [shift, setShift] = React.useState<Record<string, number>>({});
  const measure = (key: string) => (e: React.SyntheticEvent<HTMLDivElement>) => {
    const left = e.currentTarget.getBoundingClientRect().left;
    const over = Math.max(0, Math.ceil(left + DROPDOWN_W + 16 - window.innerWidth));
    setShift((s) => (s[key] === over ? s : { ...s, [key]: over }));
  };
  return (
    <nav className="hidden items-center gap-0.5 md:flex" aria-label={t(label)}>
      {menus.map((m) => {
        if (!m.children)
          return (
            <NavLink key={m.label} to={m.to!} className={({ isActive }) => topCls(isActive)}>
              <NavTopIcon icon={m.icon ?? STAFF_TOP_ICON[m.label]} />
              {t(m.label)}
              {m.badge && <Count n={m.badge} />}
            </NavLink>
          );
        const active = (m.to && pathname.startsWith(m.to.split('?')[0])) || m.activeOn?.some((p) => pathname.startsWith(p)) || m.children.some((c) => isHere(c, pathname, search));
        return (
          <div key={m.label} className="group/menu relative" onMouseEnter={measure(m.label)} onFocus={measure(m.label)}>
            <button type="button" className={topCls(Boolean(active))} aria-haspopup="true">
              <NavTopIcon icon={m.icon ?? STAFF_TOP_ICON[m.label]} />
              {t(m.label)}
              {m.badge && <Count n={m.badge} />}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover/menu:rotate-180" />
            </button>
            <div className={cn('pointer-events-none absolute top-full z-50 pt-2 opacity-0 transition-opacity duration-150 group-focus-within/menu:pointer-events-auto group-focus-within/menu:opacity-100 group-hover/menu:pointer-events-auto group-hover/menu:opacity-100')} style={{ left: -(shift[m.label] ?? 0) }}>
              <div className={cn('rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(16,24,40,0.25)]', 'w-[320px]')} style={{ width: DROPDOWN_W }}>
                {m.children.map((c, i) => {
                  const here = isHere(c, pathname, search);
                  const head = c.group && c.group !== m.children![i - 1]?.group;
                  return (
                    <React.Fragment key={c.to + c.label}>
                      {head && <p className={cn('px-2.5 pb-1 pt-2 text-[12px] font-medium text-slate-400', i > 0 && 'mt-1 border-t border-slate-100')}>{t(c.group)}</p>}
                      <Link to={c.to} className={cn('group/item flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors', here ? 'bg-slate-100' : 'hover:bg-slate-50')}>
                        <NavIconTile icon={c.icon} active={here} />
                        <span className="min-w-0 flex-1">
                          <span className={cn('flex items-center gap-2 text-sm font-medium', here ? 'text-indigo-700' : 'text-slate-900')}>
                            <span className="truncate">{t(c.label)}</span>
                            {c.badge && <Count n={c.badge} />}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{t(c.desc)}</span>
                        </span>
                      </Link>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
};
