import { useMemo } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: paths.root.path,
      element: <AppRoot />,
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        {
          path: paths.root.path,
          lazy: () => import('./routes/landing').then(convert(queryClient)),
        },
        {
          path: paths.allCategories.path,
          lazy: () =>
            import('./routes/allCategories').then(convert(queryClient)),
        },
        {
          path: paths.search.path,
          lazy: () => import('./routes/search').then(convert(queryClient)),
        },
        {
          path: paths.item.path,
          lazy: () => import('./routes/item').then(convert(queryClient)),
        },
      ],
    },
    {
      path: paths.auth.login.path,
      element: <AuthRoot />,
      ErrorBoundary: AuthRootErrorBoundary,
      children: [
        {
          path: paths.auth.login.path,
          lazy: () => import('./routes/auth/login').then(convert(queryClient)),
        },
      ],
    },
    {
      path: paths.auth.register.path,
      element: <AuthRoot />,
      ErrorBoundary: AuthRootErrorBoundary,
      children: [
        {
          path: paths.auth.register.path,
          lazy: () =>
            import('./routes/auth/register').then(convert(queryClient)),
        },
      ],
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};
