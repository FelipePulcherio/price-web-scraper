import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { createUser } from '@/database/operations/dbCreate';
import resFormatter from '@/helpers/apiResponseFormatter';
import { IAuthUser, IUser } from '@/interfaces/interfaces';

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
        // Make sure currentUser was attached
        if (!req.currentUser) {
          return next(new Error('Internal server error'));
        }

        // Create token
        const token = jwt.sign(
          {
            id: req.currentUser.id,
            firstName: req.currentUser.firstName,
            email: req.currentUser.email,
            role: req.currentUser.role,
          },
          config.jwt.secret,
          { expiresIn: config.jwt.maxAge } // This is in s
        );

        // Attach token to cookie
        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: config.jwt.maxAge * 1000, // This is in ms
        });

        res.status(200).json(
          resFormatter(true, ['User logged in successfully'], {
            user: req.currentUser,
          })
        );
      } catch (error) {
        // Pass errors to middlewares.errorHandler
        next(error);
      }
    }
  );

  // POST /api/v1/auth/logout
  route.post(
    '/logout',
    middlewares.isAuth,
    middlewares.detachCurrentUser,
    (req: Request, res: Response, next: NextFunction) => {
      console.log('POST /api/v1/auth/logout Request Body:', req.body);

      try {
        res.status(200).json(
          resFormatter(true, ['User logged out successfully'], {
            user: req.currentUser,
          })
        );
      } catch (error) {
        // Pass errors to middlewares.errorHandler
        return next(error);
      }
    }
  );
};
