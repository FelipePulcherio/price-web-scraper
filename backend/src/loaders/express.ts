import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from '@/config';
import routes from '@/api';

// Code from: https://github.com/santiq/bulletproof-nodejs/
export default ({ app }: { app: express.Application }) => {
  // Use cors for integration with frontend
  const corsOptions = {
    origin: ['https://price-web-scraper-frontend.vercel.app'],
    credentials: true,
  };

  app.use(cors(corsOptions));

  // Transforms the raw string of req.body into json
  app.use(express.json());

  // Cookie parser
  app.use(cookieParser());

  // Load API routes
  app.use(config.api.prefix, routes());
  console.log(config.api.prefix);
};
