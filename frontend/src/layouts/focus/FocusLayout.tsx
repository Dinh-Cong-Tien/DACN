import React from 'react';
import { Outlet } from 'react-router-dom';

export const FocusLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
