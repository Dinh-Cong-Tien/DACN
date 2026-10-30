import { ThreeBackground } from '@/shared/components/three/ThreeBackground';
import React from 'react';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { Doodles } from '@/shared/components/motion';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { useDocumentTitle } from '@/shared/hooks';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Không tìm thấy trang');
  return (
    <div className="relative min-h-[70vh] flex items-center overflow-hidden bg-paper">
      <ThreeBackground variant="globe" className="opacity-50" offsetX={0.7} />
      <Doodles />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-[1fr_300px] gap-12 items-center">
        <div className="space-y-6 animate-fade-up">
          <span className="sticker tilt-1 !bg-amber-300">Lỗi 404</span>
          <h1 className="font-display text-6xl md:text-8xl font-extrabold text-slate-900 leading-none">
            Trang này <span className="mark-coral mark">đi lạc</span>.
          </h1>
          <p className="text-lg text-slate-600 max-w-md">Có thể đường dẫn đã đổi hoặc bạn gõ nhầm. Không sao, lộ trình học của bạn vẫn còn nguyên.</p>
          <div className="flex flex-wrap gap-3">
            <Button to="/" variant="gradient" size="lg" leftIcon={<Home className="w-4 h-4" />}>
              Về trang chủ
            </Button>
            <Button variant="outline" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => window.history.back()}>
              Quay lại
            </Button>
            <Button to="/help" variant="ghost" size="lg" leftIcon={<Search className="w-4 h-4" />}>
              Trợ giúp
            </Button>
          </div>
        </div>
        <div className="photo-frame tilt-2 animate-tilt-in hidden md:block">
          <Img src={PHOTOS.library} alt="" ratio="3/4" fallbackClass="bg-amber-200" />
        </div>
      </div>
    </div>
  );
};
