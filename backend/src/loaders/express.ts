import express from 'express';
import cors from 'cors';
import config from '@/config';
import routes from '@/api';

// Code from: https://github.com/santiq/bulletproof-nodejs/
export default ({ app }: { app: express.Application }) => {
  // Use cors for integration with frontend
  const corsOptions = {
    origin: ['http://localhost:5173'],
  };

  app.use(cors(corsOptions));

  // Transforms the raw string of req.body into json
  app.use(express.json());

  // Load API routes
  app.use(config.api.prefix, routes());
};
