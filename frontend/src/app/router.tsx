import { createBrowserRouter, RouterProvider } from 'react-router';
import { paths } from '@/config/paths';
import LandingRoute from './routes/landing';

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.home.path,
      element: <LandingRoute />,
    },
  ]);

export const AppRouter = () => {
  const router = createAppRouter();
  return <RouterProvider router={router} />;
};
