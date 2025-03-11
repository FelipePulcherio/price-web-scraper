import 'module-alias/register';
import express, { Express } from 'express';
import process from 'process';
import config from '@/config';
import { startAgenda } from './schedule/scheduler';

async function startServer() {
  const app: Express = express();

  // Import loaders
  await require('./loaders').default({ expressApp: app });

  // Server start
  const server = app.listen(config.port, () => {
    console.log(`[Server]: Server is listening on port: ${config.port}`);
  });

  app.get('/test', (req, res) => {
    res.json({ message: 'API Server is running!' });
  });

  function gracefulShutdown(): void {
    console.log('Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  }

  // Graceful shutdown
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  // Agenda start
  startAgenda();
}

// Function calls
startServer();
