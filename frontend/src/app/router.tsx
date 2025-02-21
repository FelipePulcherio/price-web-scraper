import { createBrowserRouter, RouterProvider } from 'react-router';
import { paths } from '@/config/paths';
import LandingRoute from './routes/landing';
import AllCategoriesRoute from './routes/app/allCategories';
import SearchRoute from './routes/app/search';
import ItemRoute from './routes/app/item';
import LoginRoute from './routes/auth/login';
import RegisterRoute from './routes/auth/register';

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.home.path,
      element: <LandingRoute />,
    },
    {
      path: paths.app.allCategories.path,
      element: <AllCategoriesRoute />,
    },
    {
      path: paths.app.search.path,
      element: <SearchRoute />,
    },
    {
      path: paths.app.item.path,
      element: <ItemRoute />,
    },
    {
      path: paths.auth.login.path,
      element: <LoginRoute />,
    },
    {
      path: paths.auth.register.path,
      element: <RegisterRoute />,
    },
  ]);

export const AppRouter = () => {
  const router = createAppRouter();
  return <RouterProvider router={router} />;
};
