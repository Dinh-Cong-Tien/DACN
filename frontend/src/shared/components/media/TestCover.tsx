import React, { useState } from 'react';
import { cn } from '@/shared/utils';
import { unsplash } from './Img';

/** Ảnh bìa kiểu sách đề thật: TOEIC = môi trường công sở (đúng ngữ cảnh đề), VSTEP = học đường */
const PHOTO_IDS = {
  TOEIC: [
    '1497366216548-37526070297c', // văn phòng
    '1552664730-d307ca884978', // họp nhóm
    '1521737711867-e3b97375f902', // làm việc nhóm
    '1515378791036-0648a3ef77b2', // laptop
    '1486312338219-ce68d2c6f44d', // gõ phím
    '1506784983877-45594efa4cbe', // bàn làm việc
    '1484704849700-f032a568e944', // tai nghe
    '1543269865-cbf427effbad', // trao đổi
  ],
  VSTEP: [
    '1541339907198-e08756dedf3f', // khuôn viên
    '1513258496099-48168024aec0', // thư viện
    '1522202176988-66273c2fd55f', // học nhóm
    '1517486808906-6ca8b3f04846', // sinh viên
    '1497633762265-9d179a990aa6', // sách
    '1456513080510-7bf3a84b82f8', // ghi chép
    '1529070538774-1843cb3265df', // giảng đường
    '1434030216411-0b793f4b4173', // viết bài
  ],
} as const;

/** Màu nhấn theo bộ đề (dải màu gáy sách + nhãn), cùng bộ cùng màu */
const ACCENTS = ['#2dd4bf', '#60a5fa', '#f59e0b', '#f472b6', '#a78bfa', '#4ade80'];

const hash = (s: string) => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Bìa đề thi khi đề chưa có ảnh bìa riêng: ảnh thật + lớp phủ tối + tiêu đề như bìa sách luyện thi */
export const TestCover: React.FC<{ examType: string; title: string; totalQuestions?: number; durationMinutes?: number; year?: number | string; level?: string; className?: string }> = ({
  examType,
  title,
  totalQuestions,
  durationMinutes,
  year,
  level,
  className,
}) => {
  const [failed, setFailed] = useState(false);
  const m = title.match(/(.*?)[\s—–-]*\bTest\s*(\d+)\s*$/i);
  const series = (m ? m[1] : title).trim() || examType;
  const num = m ? Number(m[2]) : null;
  const ids = examType === 'VSTEP' ? PHOTO_IDS.VSTEP : PHOTO_IDS.TOEIC;
  // các test liên tiếp trong cùng bộ lấy ảnh khác nhau
  const photo = unsplash(ids[(hash(series) + (num ?? hash(title))) % ids.length], 800, 450);
  const accent = ACCENTS[hash(series) % ACCENTS.length];
  const meta = [totalQuestions && `${totalQuestions} câu`, durationMinutes && `${durationMinutes} phút`, level, year].filter(Boolean).join(' · ');

  return (
    <div className={cn('absolute inset-0 overflow-hidden text-white', className)} style={{ background: '#1e293b' }}>
      {!failed && <img src={photo} alt="" loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />}
      {/* Lớp phủ: tối dần xuống dưới để chữ luôn đọc được trên mọi ảnh */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,6,23,.9) 0%, rgba(2,6,23,.45) 55%, rgba(2,6,23,.1) 100%)' }} />
      {/* Dải màu gáy sách */}
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: accent }} />

      <div className="relative flex h-full flex-col justify-end p-4 pl-5">
        <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
          {series}
        </p>
        <p className="font-display text-[30px] font-extrabold leading-tight drop-shadow-sm">{num ? `Test ${num}` : series}</p>
        {meta && <p className="mt-0.5 text-[12px] font-medium text-white/75">{meta}</p>}
      </div>
    </div>
  );
};
