import { NextFunction, Request } from 'express';
import { expressjwt, TokenGetter } from 'express-jwt';
import { Algorithm } from 'jsonwebtoken';
import config from '@/config';

const getTokenFromHeader = (req: Request, next: NextFunction) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return next(new Error('Unauthorized'));
};

const isAuth = expressjwt({
  secret: config.jwt.secret,
  algorithms: [config.jwt.algorithm as Algorithm],
  requestProperty: 'token',
  getToken: getTokenFromHeader as TokenGetter,
});

export default isAuth;
