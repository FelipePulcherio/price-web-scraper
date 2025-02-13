import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import { createUser } from '@/database/operations/dbCreate';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  // POST /api/v1/auth/signup
  route.post('/signup', middlewares.validateSignup, async (req, res, next) => {
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
  });

  app.use(middlewares.errorHandler);
};
