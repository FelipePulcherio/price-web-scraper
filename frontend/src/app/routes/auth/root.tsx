import { Outlet } from 'react-router';

export const ErrorBoundary = () => {
  return <div>Something went wrong in auth pages!</div>;
};

const AuthRoot = () => {
  return <Outlet />;
};

export default AuthRoot;
