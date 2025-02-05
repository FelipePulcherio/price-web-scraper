import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import process from 'process';
import { agendaStart } from './schedule/scheduler';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const httpServer = createServer(app);

// Define main route
app.get('/', (req: Request, res: Response) => {
  res.send('Server Running.');
});

// Define server
const startServer = () => {
  httpServer.listen(port, () => {
    console.log(`[Server]: Server is running at http://localhost:${port}`);
  });
};

// Initialize server
startServer();

// Start agenda
agendaStart();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
