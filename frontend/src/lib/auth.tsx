import { z } from 'zod';
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router';

import { paths } from '@/config/paths';

import { api } from './apiClient';
import { IAPI, AuthUser } from '@/types/interfaces';

// APIs, Schemas and types
// Login
const getUser = async (): Promise<AuthUser> => {
  const response = await api.get('/users/me');
  return response.data;
};

const logout = async (): Promise<AuthUser> => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const loginInputSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

const loginWithEmailAndPassword = (
  data: LoginInput
): Promise<IAPI<AuthUser>> => {
  return api.post('/auth/signin', data);
};

// Register
export const registerInputSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: 'First name must be at least 2 characters.',
    })
    .max(50),
  lastName: z
    .string()
    .min(2, {
      message: 'Last name must be at least 2 characters.',
    })
    .max(50),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z
    .string()
    .regex(/^[0-9]*$/, {
      message: 'Please use only numbers.',
    })
    .min(10, {
      message: 'Phone number must be at least 10 characters.',
    })
    .max(15),
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters.',
    })
    .regex(
      // eslint-disable-next-line no-useless-escape
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]).+$/,
      {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one symbol.',
      }
    ),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (
  data: RegisterInput
): Promise<IAPI<AuthUser>> => {
  return api.post('/auth/signup', data);
};

// Routes

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithEmailAndPassword(data);
    return response.data;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await registerWithEmailAndPassword(data);
    return response.data;
  },
  logoutFn: logout,
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const location = useLocation();

  if (!user.data) {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    );
  }

  return children;
};
