import { Outlet } from 'react-router';
import { AuthLayout } from '@/components/layouts';

export const ErrorBoundary = () => {
  return <div>Something went wrong in auth pages!</div>;
};

const AuthRoot = () => {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};

export default AuthRoot;
