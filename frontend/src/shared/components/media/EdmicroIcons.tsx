import React from 'react';

/**
 * 3D Isometric Book Stack Icon matching Edmicro TOEIC style
 */
export const Books3DIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 drop-shadow-sm ${className}`}
  >
    {/* Bottom Book - Green */}
    <path d="M12 44L32 52L52 44L32 36L12 44Z" fill="#10B981" />
    <path d="M12 44L32 52V56L12 48V44Z" fill="#059669" />
    <path d="M52 44L32 52V56L52 48V44Z" fill="#047857" />
    <path d="M14 46L32 53.5L50 46V48L32 55.5L14 48V46Z" fill="#F3F4F6" />

    {/* Middle Book - Amber/Orange */}
    <path d="M12 34L32 42L52 34L32 26L12 34Z" fill="#F59E0B" />
    <path d="M12 34L32 42V46L12 38V34Z" fill="#D97706" />
    <path d="M52 34L32 42V46L52 38V34Z" fill="#B45309" />
    <path d="M14 36L32 43.5L50 36V38L32 45.5L14 38V36Z" fill="#F3F4F6" />

    {/* Top Book - Royal Blue with Bookmark */}
    <path d="M12 24L32 32L52 24L32 16L12 24Z" fill="#3B82F6" />
    <path d="M12 24L32 32V36L12 28V24Z" fill="#2563EB" />
    <path d="M52 24L32 32V36L52 28V24Z" fill="#1D4ED8" />
    <path d="M14 26L32 33.5L50 26V28L32 35.5L14 28V26Z" fill="#FFFFFF" />

    {/* Red Ribbon Bookmark */}
    <path d="M36 30.5L42 28V36L39 34L36 36V30.5Z" fill="#EF4444" />
  </svg>
);

/**
 * Cute Owl Mascot with Headset & Graduation Cap (matching Edmicro TOEIC mascot)
 */
export const OwlMascotIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 44 }) => (
  <div
    className={`relative flex items-center justify-center rounded-full bg-gradient-to-b from-sky-50 to-blue-100 border border-sky-200/80 shadow-sm ${className}`}
    style={{ width: size, height: size }}
  >
    <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Graduation Cap */}
      <path d="M18 4L6 9L18 14L30 9L18 4Z" fill="#1E3A8A" />
      <path d="M12 12V16C12 17.5 14.5 19 18 19C21.5 19 24 17.5 24 16V12" fill="#1E40AF" />
      <path d="M28 9.5V17L26.5 19V21L28 21.5L29.5 21V19L28 17" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />

      {/* Owl Body / Head */}
      <ellipse cx="18" cy="22" rx="10" ry="10" fill="#60A5FA" />
      <ellipse cx="18" cy="24" rx="7" ry="6.5" fill="#DBEAFE" />

      {/* Eyes */}
      <circle cx="14" cy="20" r="3.2" fill="#FFFFFF" />
      <circle cx="22" cy="20" r="3.2" fill="#FFFFFF" />
      <circle cx="14.5" cy="20" r="1.8" fill="#1E293B" />
      <circle cx="21.5" cy="20" r="1.8" fill="#1E293B" />
      <circle cx="15.2" cy="19.3" r="0.6" fill="#FFFFFF" />
      <circle cx="22.2" cy="19.3" r="0.6" fill="#FFFFFF" />

      {/* Beak */}
      <polygon points="18,22 16.5,24.5 19.5,24.5" fill="#F59E0B" />

      {/* Headset */}
      <path d="M8 20C8 14 12 11 18 11C24 11 28 14 28 20" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="18" width="3" height="6" rx="1.5" fill="#0369A1" />
      <rect x="26" y="18" width="3" height="6" rx="1.5" fill="#0369A1" />
      <path d="M9 23C9 27 12 28.5 15 28.5" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15.5" cy="28.5" r="1.2" fill="#0284C7" />
    </svg>
  </div>
);

/**
 * Screen / Camera Video Icon Badge (matching Edmicro TOEIC video lesson node)
 */
export const VideoBadgeIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 44 }) => (
  <div
    className={`relative flex items-center justify-center rounded-full bg-gradient-to-b from-sky-50 to-blue-100 border border-sky-200/80 shadow-sm ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="w-7 h-7 rounded-xl bg-white border border-sky-200 shadow-sm flex items-center justify-center">
      <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center">
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="ml-0.5">
          <polygon points="2,1 8,5 2,9" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  </div>
);

/**
 * Blue Circle Play Icon used for badges like Document, Video, Dictation
 */
export const BlueCirclePlayIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="8" r="8" fill="#0284C7" />
    <polygon points="6.5,4.5 11.5,8 6.5,11.5" fill="#FFFFFF" />
  </svg>
);
