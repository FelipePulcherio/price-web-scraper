import 'module-alias/register';
import express, { Express } from 'express';
import process from 'process';
import config from '@/config';
import { startAgenda } from './schedule/scheduler';
import { startScraperScheduler } from './schedule/scraperScheduler';
import bestBuyCaSearch from './services/stores/bestBuyCa/bestBuyCaSearch';
import searchAllStores from './services/stores/searchAllStores';
import visionsElectronicsCaSearch from './services/stores/visionsElectronicsCa/visionsElectronicsCaSearch';
import londonDrugsCaSearch from './services/stores/londonDrugsCa/londonDrugsCaSearch';

async function startServer() {
  const app: Express = express();

  await require('./loaders').default({ expressApp: app });

  const server = app.listen(config.port, () => {
    console.log(`[Server]: Server is listening on port: ${config.port}`);
  });

  function gracefulShutdown(): void {
    console.log('[Server]: Shutting down gracefully...');
    server.close(() => {
      console.log('[Server]: Server closed.');
      process.exit(0);
    });
  }

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  startScraperScheduler();
  // await searchAllStores({ query: 'tv' });
  // await searchAllStores({ query: 'tv samsung' });
  // await searchAllStores({ query: 'tv lg 2025' });
  // await searchAllStores({ query: 'tv tcl' });
  // await searchAllStores({ query: 'tv hisense' });
  // await searchAllStores({ query: 'tv roku' });
  // await searchAllStores({ query: 'tv smart' });
  // await searchAllStores({ query: 'ipad' });
  // await searchAllStores({ query: 'ipad 10' });
  // await searchAllStores({ query: 'ipad 11' });
  // await searchAllStores({ query: 'computer' });
  // await searchAllStores({ query: 'laptop' });
  // await searchAllStores({ query: 'iphone' });
  // await searchAllStores({ query: 'iphone 16' });
}

// Function calls
startServer();
