import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { errorMessage } from '@/shared/api/client';
import { Panel, TBtn } from './TeacherKit';

/** Khung chờ tải dữ liệu */
export const TLoading: React.FC<{ label?: string; className?: string }> = ({ label = 'Đang tải dữ liệu…', className }) => (
  <Panel className={className}>
    <p className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </p>
  </Panel>
);

/** Lỗi tải dữ liệu, có nút thử lại */
export const TError: React.FC<{ error: unknown; onRetry?: () => void; className?: string }> = ({ error, onRetry, className }) => (
  <Panel className={className}>
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-rose-500" />
      <p className="text-sm text-slate-700">{errorMessage(error)}</p>
      {onRetry && (
        <TBtn size="sm" onClick={onRetry}>
          Thử lại
        </TBtn>
      )}
    </div>
  </Panel>
);

/** Ô trống trong khung */
export const TEmpty: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="px-4 py-10 text-center">
    <p className="font-semibold text-slate-900">{title}</p>
    {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);
