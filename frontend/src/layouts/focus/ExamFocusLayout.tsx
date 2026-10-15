import React from 'react';
import { Outlet } from 'react-router-dom';

export const ExamFocusLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
