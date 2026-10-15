import React from 'react';
import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';

export const AppProviders: React.FC = () => {
  return (
    <QueryProvider>
      <RouterProvider />
    </QueryProvider>
  );
};
