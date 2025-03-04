import { AppProvider } from './provider';
import { AppRouter } from './router';
import { Toaster } from '@/components/ui/sonner';

export const App = () => {
  return (
    <>
      <AppProvider>
        <AppRouter />
      </AppProvider>
      <Toaster />
    </>
  );
};
