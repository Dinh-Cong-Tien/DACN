import React from 'react';
import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';
import { ToastContainer } from '@/shared/components/ui';

export const AppProviders: React.FC = () => {
  return (
    <QueryProvider>
      <RouterProvider />
      <ToastContainer />
    </QueryProvider>
  );
};
