import React from 'react';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui';
import { FloatingBlobs } from '@/shared/components/motion';
import { useDocumentTitle } from '@/shared/hooks';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Không tìm thấy trang');
  const navigate = useNavigate();
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
      <FloatingBlobs />
      <div className="relative text-center space-y-6 animate-scale-in">
        <div className="relative inline-block animate-float">
          <p className="text-[120px] md:text-[160px] font-black leading-none text-gradient select-none">404</p>
          <Compass className="w-12 h-12 text-indigo-400 absolute -top-2 -right-6 animate-spin-slow" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">Lạc đường rồi!</h1>
        <p className="text-slate-500 max-w-md mx-auto">Trang bạn tìm không tồn tại hoặc đã được di chuyển. Hãy quay về trang chủ để tiếp tục hành trình học tập.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Button to="/" variant="gradient" leftIcon={<Home className="w-4 h-4" />}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};
