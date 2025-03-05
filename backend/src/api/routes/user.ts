import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  // GET /api/v1/users/me
  // Used when user tries to keep connected
  route.get(
    '/me',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('GET /api/v1/users/me');
      // console.log(req.body);

      // New user without a token
      // Won't crash the app but the result is null
      if (!req.token) {
        res
          .status(200)
          .json(
            resFormatter(true, ['User not authenticated'], req.currentUser)
          );
      } else {
        res
          .status(200)
          .json(resFormatter(true, ['User authenticated'], req.currentUser));
      }

      try {
      } catch (error) {
        // console.error('Error fetching user:', error);
        next(error); // Pass errors to middleware
      }
    }
  );
};
