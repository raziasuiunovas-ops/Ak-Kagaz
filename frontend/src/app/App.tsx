import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { AIAssistantProvider } from '@/contexts/AIAssistantContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { router } from '@/router/router';
import { LoadingState } from '@/components/LoadingState';
import { ToastContainer } from '@/components/ToastContainer/ToastContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2, // Увеличено с 1 до 2 для большей стабильности
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
          <ToastProvider>
            <AIAssistantProvider>
              <Suspense fallback={<LoadingState variant="global" />}>
                <RouterProvider router={router} />
              </Suspense>
              <ToastContainer />
            </AIAssistantProvider>
          </ToastProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
