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
      console.log('GET /api/v1/users/me Request Body:');
      // console.log(req.body);

      res
        .status(200)
        .json(
          resFormatter(true, ['Stores fetched successfully'], {
            user: req.currentUser,
          })
        );

      try {
      } catch (error) {
        next(error); // Pass errors to middleware
      }
    }
  );
};
