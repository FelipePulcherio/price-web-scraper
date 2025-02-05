import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer, Server } from 'http';
import process from 'process';
import { startAgenda } from './schedule/scheduler';

dotenv.config();

const app: Express = express();
const port: string | number = process.env.PORT || 3000;
const httpServer: Server = createServer(app);

async function startServer() {
  try {
    httpServer.listen(port, () => {
      console.log(`[Server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Function calls
startServer();
startAgenda();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
