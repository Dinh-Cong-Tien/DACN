import React from 'react';
import { cn } from '@/shared/utils';

/** Bìa chữ cho đề thi chưa có ảnh bìa: kỳ thi, tên đề, số câu, thời gian — đều lấy từ dữ liệu đề */
export const TestCover: React.FC<{ examType: string; title: string; totalQuestions?: number; durationMinutes?: number; className?: string }> = ({ examType, title, totalQuestions, durationMinutes, className }) => {
  const m = title.match(/(.*?)[\s—–-]*\bTest\s*(\d+)\s*$/i);
  return (
    <div className={cn('absolute inset-0 flex flex-col justify-end p-4', examType === 'TOEIC' ? 'bg-indigo-50 text-indigo-950' : 'bg-emerald-50 text-emerald-950', className)}>
      <p className="text-xs font-semibold opacity-70 line-clamp-1">{m ? m[1] : examType}</p>
      <p className="font-display text-3xl font-extrabold leading-tight line-clamp-2">{m ? `Test ${m[2]}` : title}</p>
      {(totalQuestions || durationMinutes) && (
        <p className="mt-1 text-xs font-medium opacity-70">{[totalQuestions && `${totalQuestions} câu`, durationMinutes && `${durationMinutes} phút`].filter(Boolean).join(' · ')}</p>
      )}
    </div>
  );
};
