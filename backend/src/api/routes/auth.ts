import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { createUser } from '@/database/operations/dbCreate';
import resFormatter from '@/helpers/apiResponseFormatter';
import { AuthUser } from '@/interfaces/interfaces';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  // POST /api/v1/auth/signup
  route.post(
    '/signup',
    middlewares.validateSignup,
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('POST /api/v1/auth/signup');

      try {
        const newUser = await createUser(req.body);

        if (!newUser) {
          return next(new Error('Invalid email or password'));
        }

        // Create token
        const token = jwt.sign(
          {
            id: newUser.id,
            firstName: newUser.firstName,
            email: newUser.email,
            role: newUser.role,
          },
          config.jwt.secret,
          { expiresIn: config.jwt.maxAge } // This is in s
        );

        // Transform data
        const currentUser: AuthUser = {
          id: newUser.id || '',
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role || 'LOGGED_USER',
        };

        // Attach token to cookie
        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: config.jwt.maxAge * 1000, // This is in ms
        });

        res
          .status(201)
          .json(
            resFormatter(true, ['User registered successfully'], currentUser)
          );
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
      console.log('POST /api/v1/auth/signin');

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

        res
          .status(200)
          .json(
            resFormatter(true, ['User logged in successfully'], req.currentUser)
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
      console.log('POST /api/v1/auth/logout');

      try {
        res
          .status(200)
          .json(
            resFormatter(
              true,
              ['User logged out successfully'],
              req.currentUser
            )
          );
      } catch (error) {
        // Pass errors to middlewares.errorHandler
        return next(error);
      }
    }
  );
};
