import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Logo, Stepper, Avatar } from '@/shared/components/ui';
import { PageTransition, Doodles } from '@/shared/components/motion';
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
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden">
      <Doodles />
      <header className="relative z-10 border-b-2 border-slate-900/10 bg-cream/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="sm" tagline="Thiết lập lộ trình cá nhân" to="/" />
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700">
                <Avatar name={user.fullName} src={user.avatarUrl} size="xs" />
                Xin chào, {user.fullName.split(' ').slice(-1)[0]} 👋
              </span>
            )}
            <Link to="/" className="p-2 rounded-xl border-2 border-slate-900 bg-white text-slate-700 shadow-hard-sm hover:-translate-y-0.5 transition" title="Bỏ qua, vào Dashboard">
              <X className="w-4 h-4" />
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
