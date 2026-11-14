import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { AIAssistantProvider } from '@/contexts/AIAssistantContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { router } from '@/router/router';
import { LoadingState } from '@/components/LoadingState';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
          <AIAssistantProvider>
            <Suspense fallback={<LoadingState variant="global" />}>
              <RouterProvider router={router} />
            </Suspense>
          </AIAssistantProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
