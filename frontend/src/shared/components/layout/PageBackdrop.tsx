import React from 'react';

/**
 * Nền chung giống trang chủ cho mọi trang khác: quầng sáng tím–hồng–teal–cam (chế độ sáng nhạt hơn)
 * + trường sao khi ở chế độ tối. Cố định sau nội dung, không bắt sự kiện chuột.
 * Màu nền gốc (gradient đêm / kem) đặt trên body trong styles/theme.css.
 */
export const PageBackdrop: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 hidden bg-stars opacity-50 dark:block" />
    <div className="absolute inset-0 hidden bg-stars-2 animate-twinkle dark:block" />
    <div className="absolute inset-0 opacity-40 dark:opacity-100">
      <div className="absolute -left-40 top-[6%] h-[560px] w-[560px] rounded-full bg-violet-500/20 blur-[140px]" />
      <div className="absolute -right-40 top-[28%] h-[520px] w-[520px] rounded-full bg-fuchsia-600/20 blur-[140px]" />
      <div className="absolute bottom-[-10%] left-1/4 h-[520px] w-[520px] rounded-full bg-indigo-500/15 blur-[140px]" />
      <div className="absolute -right-20 bottom-[8%] h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-[150px]" />
    </div>
  </div>
);
