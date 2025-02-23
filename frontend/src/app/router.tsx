import { createBrowserRouter, RouterProvider } from 'react-router';
import { paths } from '@/config/paths';

import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from './routes/root';

import {
  default as AuthRoot,
  ErrorBoundary as AuthRootErrorBoundary,
} from './routes/auth/root';

import LandingRoute from './routes/landing';
import AllCategoriesRoute from './routes/allCategories';
import SearchRoute from './routes/search';
import ItemRoute from './routes/item';
import LoginRoute from './routes/auth/login';
import RegisterRoute from './routes/auth/register';

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.root.path,
      element: <AppRoot />,
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        { path: paths.root.path, element: <LandingRoute /> },
        { path: paths.allCategories.path, element: <AllCategoriesRoute /> },
        { path: paths.search.path, element: <SearchRoute /> },
        { path: paths.item.path, element: <ItemRoute /> },
      ],
    },
    {
      path: paths.auth.login.path,
      element: <AuthRoot />,
      ErrorBoundary: AuthRootErrorBoundary,
      children: [{ path: paths.auth.login.path, element: <LoginRoute /> }],
    },
    {
      path: paths.auth.register.path,
      element: <AuthRoot />,
      ErrorBoundary: AuthRootErrorBoundary,
      children: [
        { path: paths.auth.register.path, element: <RegisterRoute /> },
      ],
    },
  ]);

export const AppRouter = () => {
  const router = createAppRouter();
  return <RouterProvider router={router} />;
};
