import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils';

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
}

export interface StaffMenu {
  label: string;
  to?: string;
  badge?: string;
  children?: StaffMenuLink[];
}

/** Mục con đang mở: khớp đường dẫn, và khớp cả query nếu link có query */
const isHere = (link: StaffMenuLink, pathname: string, search: string) => {
  const [path, query] = link.to.split('?');
  if (pathname !== path && (link.exact || !pathname.startsWith(`${path}/`))) return false;
  if (!query) return !search || Boolean(link.exact);
  const cur = new URLSearchParams(search);
  return [...new URLSearchParams(query)].every(([k, v]) => cur.get(k) === v);
};

const topCls = (active: boolean) => cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-slate-900/[0.06] text-indigo-700' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900');

const Count: React.FC<{ n: string }> = ({ n }) => <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded px-1 text-[10px] font-semibold text-white bg-rose-500">{n}</span>;

/** Menu header khu vực quản lý: mục đơn hoặc dropdown có mô tả, nhóm, đếm số */
export const StaffNav: React.FC<{ menus: StaffMenu[]; label: string }> = ({ menus, label }) => {
  const { pathname, search } = useLocation();
  return (
    <nav className="hidden items-center gap-0.5 md:flex" aria-label={label}>
      {menus.map((m, mi) => {
        if (!m.children)
          return (
            <NavLink key={m.label} to={m.to!} className={({ isActive }) => topCls(isActive)}>
              {m.label}
              {m.badge && <Count n={m.badge} />}
            </NavLink>
          );
        const active = (m.to && pathname.startsWith(m.to.split('?')[0])) || m.children.some((c) => isHere(c, pathname, search));
        return (
          <div key={m.label} className="group/menu relative">
            <button type="button" className={topCls(Boolean(active))} aria-haspopup="true">
              {m.label}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover/menu:rotate-180" />
            </button>
            <div className={cn('pointer-events-none absolute top-full z-50 pt-2 opacity-0 transition-opacity duration-150 group-focus-within/menu:pointer-events-auto group-focus-within/menu:opacity-100 group-hover/menu:pointer-events-auto group-hover/menu:opacity-100', mi === menus.length - 1 ? 'right-0' : 'left-0')}>
              <div className={cn('rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(16,24,40,0.25)]', 'w-[320px]')}>
                {m.children.map((c, i) => {
                  const here = isHere(c, pathname, search);
                  const Icon = c.icon;
                  const head = c.group && c.group !== m.children![i - 1]?.group;
                  return (
                    <React.Fragment key={c.to + c.label}>
                      {head && <p className={cn('px-2.5 pb-1 pt-2 text-[12px] font-medium text-slate-400', i > 0 && 'mt-1 border-t border-slate-100')}>{c.group}</p>}
                      <Link to={c.to} className={cn('flex items-start gap-3 rounded-md px-2.5 py-2 transition-colors', here ? 'bg-slate-100' : 'hover:bg-slate-50')}>
                        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', here ? 'text-indigo-700' : 'text-slate-400')} />
                        <span className="min-w-0 flex-1">
                          <span className={cn('flex items-center gap-2 text-sm font-medium', here ? 'text-indigo-700' : 'text-slate-900')}>
                            <span className="truncate">{c.label}</span>
                            {c.badge && <Count n={c.badge} />}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{c.desc}</span>
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
