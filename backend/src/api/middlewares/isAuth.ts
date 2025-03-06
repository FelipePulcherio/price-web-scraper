import { NextFunction, Request } from 'express';
import { expressjwt, TokenGetter } from 'express-jwt';
import { Algorithm } from 'jsonwebtoken';
import config from '@/config';

const getTokenFromHeader = (req: Request) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  // console.log('Token or Bearer not found');
  return undefined;
};

const isAuth = expressjwt({
  secret: config.jwt.secret,
  algorithms: [config.jwt.algorithm as Algorithm],
  requestProperty: 'token',
  getToken: getTokenFromHeader as TokenGetter,
  credentialsRequired: false, // Allows requests without a token (Handles new User)
});

export default isAuth;
