import { Router, Request, Response } from 'express';
import { createUser } from '@/database/operations/dbCreate';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  // POST /api/v1/auth/register
  // Used when user tries to create an account
  route.post('/register', async (req: Request, res: Response) => {
    try {
      console.log('POST /api/v1/auth/register Request Body:');
      console.log(req.body);

      const newUser = await createUser(req.body);
      res
        .status(201)
        .json(resFormatter(true, 'User registered successfully', newUser));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('POST /api/v1/auth/register', errorMessage);

      // Errors
      if (errorMessage.includes('already in use')) {
        res.status(409).json(resFormatter(false, errorMessage, null));
      }
      // All other errors
      else {
        res
          .status(500)
          .json(resFormatter(false, 'Internal server error', null));
      }
    }
  });
};
