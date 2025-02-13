import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  // GET /api/v1/users/me
  // Used when user tries to keep connected
  route.get('/me', async (req: Request, res: Response, next: NextFunction) => {
    console.log('GET /api/v1/users/me Request Body:');
    console.log(req.body);

    try {
    } catch (error) {
      next(error); // Pass errors to middleware
    }
  });

  app.use(middlewares.errorHandler);
};
