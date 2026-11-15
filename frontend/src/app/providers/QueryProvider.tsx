import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtime } from '@/shared/api/realtime';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

/** Mở kết nối WebSocket một lần cho cả app (cập nhật số liệu theo thời gian thực vào cache) */
const Realtime: React.FC = () => {
  useRealtime();
  return null;
};

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Realtime />
      {children}
    </QueryClientProvider>
  );
};
