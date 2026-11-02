import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useGate } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';
import type { MockTestSummary } from '@/shared/types';

/**
 * Danh sách đề thi dạng bảng (kiểu trang luyện đề thật): tên đề, phần thi, số câu, thời gian, lượt làm, quyền truy cập.
 * Trên mobile mỗi đề thành một hàng 2 dòng.
 */
export const TestList: React.FC<{ tests: MockTestSummary[] }> = ({ tests }) => {
  const gate = useGate();
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="hidden md:table-header-group bg-slate-100/60 text-left text-[13px] text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Đề thi</th>
            <th className="px-4 py-3 font-medium">Phần thi</th>
            <th className="px-4 py-3 font-medium text-right">Số câu</th>
            <th className="px-4 py-3 font-medium text-right">Thời gian</th>
            <th className="px-4 py-3 font-medium text-right">Lượt làm</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tests.map((t) => (
            <tr key={t.id} className="group hover:bg-slate-50">
              <td className="px-5 py-4">
                <Link to={gate(`/app/mock-tests/${t.slug}`)} className="font-medium text-slate-900 group-hover:text-indigo-700">
                  {t.title}
                </Link>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Mức {t.level} · {t.year}
                  <span className="md:hidden">
                    {' '}
                    · {t.totalQuestions} câu · {t.durationMinutes} phút
                  </span>
                </p>
              </td>
              <td className="hidden md:table-cell px-4 py-4 text-slate-600">{t.parts.join(', ')}</td>
              <td className="hidden md:table-cell px-4 py-4 text-right tabular-nums text-slate-700">{t.totalQuestions}</td>
              <td className="hidden md:table-cell px-4 py-4 text-right tabular-nums text-slate-700">{t.durationMinutes} phút</td>
              <td className="hidden md:table-cell px-4 py-4 text-right tabular-nums text-slate-500">{formatNumber(t.attempts)}</td>
              <td className="px-5 py-4 text-right">
                {t.isFree ? (
                  <Link to={gate(`/app/mock-tests/${t.slug}`)} className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3.5 text-[13px] font-semibold text-slate-900 hover:border-indigo-600 hover:text-indigo-700">
                    Làm bài
                  </Link>
                ) : (
                  <Link to="/pricing" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 text-[13px] font-semibold text-amber-800 hover:bg-amber-100">
                    <Lock className="w-3.5 h-3.5" /> Gói VIP
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
