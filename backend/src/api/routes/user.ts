import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

function userRoute(app: Router): void {
  app.use('/users', route);

  // GET /api/v1/users/me
  // Used when user tries to keep connected
  route.get(
    '/me',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      let message = 'User authenticated';
      console.log('GET /api/v1/users/me');
      // console.log(req.body);

      // New user without a token: won't crash the app but the
      // result will be an AuthUser with all fields blank
      if (!req.token) {
        message = 'User not authenticated';
      }

      res.status(200).json(resFormatter(true, [message], req.currentUser));

      try {
      } catch (err) {
        // Pass errors to middlewares.errorHandler
        next(err);
      }
    }
  );
}

export default userRoute;
