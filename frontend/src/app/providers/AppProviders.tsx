import React from 'react';
import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';
import { ToastContainer } from '@/shared/components/ui';
import { SplashScreen } from '@/shared/components/layout/SplashScreen';
import { useApplyTheme } from '@/shared/stores/themeStore';
import { useApplyLang } from '@/shared/i18n';

export const AppProviders: React.FC = () => {
  useApplyTheme();
  useApplyLang();
  return (
    <QueryProvider>
      <RouterProvider />
      <ToastContainer />
      <SplashScreen />
    </QueryProvider>
  );
};
