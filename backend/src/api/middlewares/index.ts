import errorHandler from './errorHandler.js';
import {
  validateSignup,
  validateSignin,
  validateSearch,
} from './validation.js';
import verifyPassword from './verifyPassword.js';
import isAuth from './isAuth.js';
import attachCurrentUser from './attachCurrentUser.js';
import detachCurrentUser from './detachCurrentUser.js';

export default {
  errorHandler,
  validateSignup,
  validateSignin,
  validateSearch,
  verifyPassword,
  isAuth,
  attachCurrentUser,
  detachCurrentUser,
};
