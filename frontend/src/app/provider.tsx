import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { queryConfig } from '@/lib/reactQuery';
import { AuthLoader } from '@/lib/auth';
import { ErrorBoundary } from 'react-error-boundary';
import { MainErrorFallback } from '@/components/errors/main';

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      })
  );

  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AuthLoader
          renderLoading={() => (
            <div className='size-screen flex items-center justify-center'></div>
          )}
        >
          {children}
        </AuthLoader>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
