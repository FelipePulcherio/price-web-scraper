import errorHandler from './errorHandler';
import { validateSignup, validateSignin, validateSearch } from './validation';
import verifyPassword from './verifyPassword';
import isAuth from './isAuth';
import attachCurrentUser from './attachCurrentUser';

export default {
  errorHandler,
  validateSignup,
  validateSignin,
  validateSearch,
  verifyPassword,
  isAuth,
  attachCurrentUser,
};
