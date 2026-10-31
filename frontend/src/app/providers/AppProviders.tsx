import React from 'react';
import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';
import { ToastContainer } from '@/shared/components/ui';
import { SplashScreen } from '@/shared/components/layout/SplashScreen';
import { useApplyTheme } from '@/shared/stores/themeStore';

export const AppProviders: React.FC = () => {
  useApplyTheme();
  return (
    <QueryProvider>
      <RouterProvider />
      <ToastContainer />
      <SplashScreen />
    </QueryProvider>
  );
};
