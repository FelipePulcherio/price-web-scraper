import express, { Express } from 'express';
import dotenv from 'dotenv';
import { prisma } from './config/config';
import { createServer, Server } from 'http';
import process from 'process';
import apiRoutes from './routes/api';
import { startAgenda } from './schedule/scheduler';

dotenv.config();

const app: Express = express();
const port: string | number = process.env.PORT || 3000;
const httpServer: Server = createServer(app);

// Middleware
app.use(express.json());

// Routes
app.use('/api', apiRoutes(prisma));

async function startServer() {
  // Database connection
  try {
    await prisma.$connect;
    console.log('Database connection estabilished.');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  // Server start
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
