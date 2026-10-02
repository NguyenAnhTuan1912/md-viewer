import { useEffect, type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toast';
import { useThemeStore } from '@/features/theme/store/theme-store';
import { queryClient } from '@/app/providers/query-client';

export function AppProvider({ children }: PropsWithChildren) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme={isDarkMode ? 'dark' : 'light'} />
      {children}
    </QueryClientProvider>
  );
}
