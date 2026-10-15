import React from 'react';
import { Outlet } from 'react-router-dom';

export const OnboardingLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b bg-white p-4 text-center font-bold">Lộ trình mục tiêu TOEIC / VSTEP</header>
      <main className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  );
};
