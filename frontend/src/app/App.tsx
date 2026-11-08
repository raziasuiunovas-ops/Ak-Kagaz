import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { AIAssistantProvider } from '@/contexts/AIAssistantContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { router } from '@/router/router';

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
            <RouterProvider router={router} />
          </AIAssistantProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
