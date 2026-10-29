import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Logo, Stepper } from '@/shared/components/ui';
import { FloatingBlobs, PageTransition } from '@/shared/components/motion';
import { useAuthStore } from '@/shared/stores/authStore';

const STEPS = [
  { path: '/onboarding/goal', label: 'Mục tiêu', description: 'Kỳ thi bạn hướng tới' },
  { path: '/onboarding/target', label: 'Điểm số', description: 'Mục tiêu & ngày thi' },
  { path: '/onboarding/schedule', label: 'Lịch học', description: 'Thời gian mỗi ngày' },
  { path: '/onboarding/skills', label: 'Kỹ năng', description: 'Tự đánh giá' },
  { path: '/onboarding/placement-test', label: 'Xếp lớp', description: 'Bài test 15 phút' },
  { path: '/onboarding/placement-result', label: 'Kết quả', description: 'Lộ trình của bạn' },
];

export const OnboardingLayout: React.FC = () => {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const current = Math.max(
    0,
    STEPS.findIndex((s) => pathname.startsWith(s.path))
  );
  const isTest = pathname.includes('placement-test');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      <FloatingBlobs className="opacity-50" />
      <header className="relative z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="sm" tagline="Thiết lập lộ trình cá nhân" to="/" />
          <div className="flex items-center gap-3">
            {user && <span className="hidden sm:block text-xs font-semibold text-slate-500">Xin chào, {user.fullName.split(' ').slice(-1)[0]} 👋</span>}
            <Link to="/app/dashboard" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition" title="Bỏ qua, vào Dashboard">
              <X className="w-5 h-5" />
            </Link>
          </div>
        </div>
        {!isTest && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <Stepper steps={STEPS.map((s) => ({ label: s.label, description: s.description }))} current={current} />
          </div>
        )}
      </header>
      <main className="relative z-10 flex-1 flex items-start justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-4xl">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
};
