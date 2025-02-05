import express from 'express';
import { PrismaClient } from '@prisma/client';
import { IAPI } from '../types/types';

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
  v1Router.post('/auth/register', async (req, res) => {
    try {
      console.log('POST /api/v1/auth/register: Received.');
      res
        .status(201)
        .json(apiResponse(true, 'User registered successfully', {}));
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json(apiResponse(false, 'Internal server error', {}));
    }
  });

  // Prefix v1 routes
  router.use('/v1', v1Router);

  return router;
};

export default apiRoutes;
