import React, { useState } from 'react';
import { cn } from '@/shared/utils';

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Màu nền dự phòng khi ảnh lỗi (class tailwind) */
  fallbackClass?: string;
  ratio?: 'video' | 'square' | '4/3' | '3/4' | 'auto';
  wrapperClass?: string;
}

/** Ảnh có skeleton khi tải và nền màu dự phòng khi lỗi (ảnh Unsplash/pravatar ngoài mạng) */
export const Img: React.FC<ImgProps> = ({ fallbackClass = 'bg-indigo-200', ratio = 'auto', wrapperClass, className, alt = '', ...rest }) => {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const r = { video: 'aspect-video', square: 'aspect-square', '4/3': 'aspect-[4/3]', '3/4': 'aspect-[3/4]', auto: '' }[ratio];
  return (
    <div className={cn('relative overflow-hidden', r, wrapperClass, state !== 'ok' && fallbackClass)}>
      {state === 'loading' && <div className="absolute inset-0 skeleton rounded-none" />}
      {state === 'error' && (
        <div className="absolute inset-0 bg-lines opacity-60" />
      )}
      <img
        alt={alt}
        loading="lazy"
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
        className={cn('w-full h-full object-cover transition-opacity duration-500', state === 'ok' ? 'opacity-100' : 'opacity-0', className)}
        {...rest}
      />
    </div>
  );
};

/** Ảnh Unsplash theo id, kích thước tuỳ chọn */
export const unsplash = (id: string, w = 900, h?: number) => `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ''}&q=75&auto=format&fit=crop`;

/** Avatar người thật (pravatar) theo seed 1–70 */
export const pravatar = (n: number) => `https://i.pravatar.cc/160?img=${((n - 1) % 70) + 1}`;

export const PHOTOS = {
  heroStudents: unsplash('1523240795612-9a054b0db644', 1200),
  studying: unsplash('1522202176988-66273c2fd55f', 1000),
  library: unsplash('1513258496099-48168024aec0', 1000),
  writing: unsplash('1434030216411-0b793f4b4173', 1000),
  classroom: unsplash('1524178232363-1fb2b075b655', 1000),
  discussion: unsplash('1543269865-cbf427effbad', 1000),
  notes: unsplash('1456513080510-7bf3a84b82f8', 1000),
  lecture: unsplash('1529070538774-1843cb3265df', 1000),
  laptop: unsplash('1515378791036-0648a3ef77b2', 1000),
  headphones: unsplash('1484704849700-f032a568e944', 1000),
  books: unsplash('1497633762265-9d179a990aa6', 1000),
  desk: unsplash('1506784983877-45594efa4cbe', 1000),
  office: unsplash('1497366216548-37526070297c', 1000),
  meeting: unsplash('1552664730-d307ca884978', 1000),
  team: unsplash('1521737711867-e3b97375f902', 1000),
  flatlay: unsplash('1503676260728-1c00da094a0b', 1000),
  students2: unsplash('1517486808906-6ca8b3f04846', 1000),
  graduation: unsplash('1523580494863-6f3031224c94', 1000),
  campus: unsplash('1541339907198-e08756dedf3f', 1000),
  typing: unsplash('1486312338219-ce68d2c6f44d', 1000),
};
