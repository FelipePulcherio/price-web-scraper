import express from 'express';
import { PrismaClient } from '@prisma/client';
import { IAPI } from '../types/types';
import { createUser } from '../database/operations/dbCreate';

function apiResponse<T>(success: boolean, message: string, data: T): IAPI<T> {
  return {
    timestamp: new Date(),
    success,
    message,
    data,
  };
}

const apiRoutes = (prisma: PrismaClient) => {
  const router = express.Router();
  const v1Router = express.Router();

  // POST /api/v1/auth/register
  // Used when user try to create an account
  v1Router.post('/auth/register', async (req, res) => {
    try {
      console.log('POST /api/v1/auth/register Request Body:');
      console.log(req.body);

      const newUser = await createUser(prisma, req.body);
      res
        .status(201)
        .json(apiResponse(true, 'User registered successfully', newUser));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('POST /api/v1/auth/register', errorMessage);

      // Errors
      if (errorMessage.includes('already in use')) {
        res.status(409).json(apiResponse(false, errorMessage, null));
      }
      // All other errors
      else {
        res.status(500).json(apiResponse(false, 'Internal server error', null));
      }
    }
  });

  // Prefix v1 routes
  router.use('/v1', v1Router);

  return router;
};

export default apiRoutes;
