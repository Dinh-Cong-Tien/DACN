import React from 'react';
import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';
import { ToastContainer } from '@/shared/components/ui';
import { SplashScreen } from '@/shared/components/layout/SplashScreen';

export const AppProviders: React.FC = () => {
  return (
    <QueryProvider>
      <RouterProvider />
      <ToastContainer />
      <SplashScreen />
    </QueryProvider>
  );
};
