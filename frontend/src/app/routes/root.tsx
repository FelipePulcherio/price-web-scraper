import { Outlet } from 'react-router';
import { AppLayout } from '@/components/layouts';

export const ErrorBoundary = () => {
  return <div>Something went wrong!</div>;
};

const AppRoot = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default AppRoot;
