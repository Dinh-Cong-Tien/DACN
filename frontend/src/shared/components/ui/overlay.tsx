import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useUiStore } from '@/shared/stores/uiStore';
import { Button } from './primitives';

// ============ MODAL ============
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideClose?: boolean;
  icon?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, children, footer, size = 'md', hideClose, icon }) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 200);
      document.body.style.overflow = '';
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }[size];

  return createPortal(
    <div className={cn('fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4', closing ? 'animate-fade-in [animation-direction:reverse]' : 'animate-fade-in')} role="dialog" aria-modal>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-white rounded-t-3xl sm:rounded-3xl border border-slate-900/10 shadow-2xl flex flex-col max-h-[92vh]', w, closing ? 'animate-scale-in [animation-direction:reverse]' : 'animate-scale-in')}>
        {(title || !hideClose) && (
          <div className="flex items-start gap-3 px-6 pt-6 pb-4">
            {icon && <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>}
            <div className="flex-1 min-w-0">
              {title && <h3 className="font-display text-lg font-extrabold text-slate-900 leading-tight">{title}</h3>}
              {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            {!hideClose && (
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {children && <div className="px-6 pb-6 overflow-y-auto flex-1">{children}</div>}
        {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-3xl flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
}> = ({ open, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', danger, loading }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    icon={danger ? <AlertTriangle className="text-rose-600" /> : <Info />}
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </>
    }
  >
    {message && <div className="text-sm text-slate-600 leading-relaxed">{message}</div>}
  </Modal>
);

// ============ DRAWER ============
export const Drawer: React.FC<{ open: boolean; onClose: () => void; side?: 'left' | 'right'; title?: React.ReactNode; children: React.ReactNode; width?: string }> = ({
  open,
  onClose,
  side = 'right',
  title,
  children,
  width = 'max-w-md',
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] animate-fade-in" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('absolute top-0 bottom-0 w-full bg-white shadow-2xl flex flex-col', width, side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left')}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} aria-label="Đóng" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// ============ DROPDOWN ============
export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
}

export const Dropdown: React.FC<{ trigger: React.ReactNode; items: MenuItem[]; align?: 'left' | 'right'; className?: string; header?: React.ReactNode }> = ({ trigger, items, align = 'right', className, header }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className={cn('absolute z-50 mt-2 min-w-[200px] bg-white rounded-2xl border border-slate-900/10 shadow-card p-1.5 animate-scale-in origin-top', align === 'right' ? 'right-0' : 'left-0')}>
          {header && <div className="px-3 py-2 border-b border-slate-100 mb-1">{header}</div>}
          {items.map((it, i) =>
            it.divider ? (
              <div key={i} className="h-px bg-slate-100 my-1" />
            ) : (
              <button
                key={i}
                disabled={it.disabled}
                onClick={() => {
                  it.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition [&>svg]:w-4 [&>svg]:h-4 disabled:opacity-40',
                  it.danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                {it.icon}
                <span className="font-medium">{it.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

// ============ TOOLTIP ============
export const Tooltip: React.FC<{ content: React.ReactNode; children: React.ReactNode; side?: 'top' | 'bottom' }> = ({ content, children, side = 'top' }) => (
  <span className="relative inline-flex group/tt">
    {children}
    <span
      className={cn(
        'pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold shadow-lg opacity-0 scale-95 transition-all duration-200 group-hover/tt:opacity-100 group-hover/tt:scale-100',
        side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      )}
    >
      {content}
    </span>
  </span>
);

// ============ TOASTS ============
export const ToastContainer: React.FC = () => {
  const toasts = useUiStore((s) => s.toasts);
  const remove = useUiStore((s) => s.removeToast);
  if (!toasts.length) return null;
  const map = {
    success: { Icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
    error: { Icon: AlertCircle, cls: 'text-rose-600 bg-rose-50' },
    info: { Icon: Info, cls: 'text-indigo-600 bg-indigo-50' },
    warning: { Icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50' },
  };
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      {toasts.map((t) => {
        const { Icon, cls } = map[t.type];
        return (
          <div key={t.id} className="relative overflow-hidden flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-900/10 shadow-card animate-slide-in-right">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 animate-pop', cls)}>
              <Icon className="w-5 h-5" />
            </div>
            <span aria-hidden className="absolute left-0 bottom-0 h-1 bg-slate-900/80 animate-toast-bar" style={{ animationDuration: `${t.duration}ms` }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{t.title}</p>
              {t.message && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.message}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
};
