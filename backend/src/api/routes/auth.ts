import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { createUser } from '@/database/operations/dbCreate';
import resFormatter from '@/helpers/apiResponseFormatter';
import { IUser } from '@/interfaces/interfaces';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  // POST /api/v1/auth/signup
  route.post(
    '/signup',
    middlewares.validateSignup,
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('POST /api/v1/auth/signup Request Body:', req.body);

      try {
        const newUser = await createUser(req.body);
        res
          .status(201)
          .json(resFormatter(true, ['User registered successfully'], newUser));
      } catch (error) {
        // Pass errors to middlewares.errorHandler
        next(error);
      }
    }
  );

  // POST /api/v1/auth/signin
  route.post(
    '/signin',
    middlewares.validateSignin,
    middlewares.verifyPassword,
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('POST /api/v1/auth/signin Request Body:', req.body);
      try {
        const user = req.user as IUser;

        // Create token
        const token = jwt.sign(
          {
            id: user.id,
            name: user.firstName,
            role: user.role,
          },
          config.jwt.secret,
          { expiresIn: config.jwt.maxAge }
        );

        console.log('Token is fine!');

        // Attach token to cookie
        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: config.jwt.maxAge * 1000,
        });

        res.status(200).json(
          resFormatter(true, ['User logged in successfully'], {
            user: user.id,
          })
        );
      } catch (error) {
        // Pass errors to middlewares.errorHandler
        next(error);
      }
    }
  );
};
