import { Agenda, Job } from '@hokify/agenda';
import { mongoConfig } from '../config/config';
import { IItem, IStore } from '../types/types';
import { readItemCollection } from '../db/operations/dbRead';
import {
  updateHistoryCollection,
  updateGraphCollection,
  updateItemCollection,
} from '../db/operations/dbUpdate';
import { scraperWorker } from '../scrapers/scraperWorker';
import { Types } from 'mongoose';

// Create new instance of Agenda WITHOUT MONGOOSE
const scraperAgenda = new Agenda({
  db: { address: mongoConfig.MONGO_URI, collection: 'Scheduler-jobs' },
});

// Define an interface for job "fetcher" and "scraper" data
interface FetcherJobData {
  fetcherData: IItem[];
}

// Define new job for fetching data: "fetcher"
scraperAgenda.define('fetcher', async (job: Job<FetcherJobData>) => {
  console.log('Scheduler: Job 1 "fetcher" running...');

  // Get information from DB
  const allItems: IItem[] = await readItemCollection({
    interestFields: '_id stores isActive lowestPrice',
  });

  // Store the result in job data
  job.attrs.data = { fetcherData: allItems };
  await job.save();
});

// Define new job for scraping data: "scraper"
scraperAgenda.define('scraper', async (job: Job<FetcherJobData>) => {
  console.log('Scheduler: Job 2 "scraper" Running...');

  // Access data passed from job "fetcher"
  const { fetcherData } = job.attrs.data;

  // console.log('Data received on "scraper" job:');
  // console.log('Total Items: ', fetcherData.length);
  // console.log(fetcherData[0]);

  // Call scraper worker
  const stores: IStore[] = await scraperWorker({ itemData: fetcherData });
  console.log('Scheduler: Scraper Worker Completed!');

  // console.log(stores);
  // console.log(stores.length);
  // console.log(stores[0].items);
});

// Schedule the "fetcher" job to run every X hours
const runJobs = async () => {
  await scraperAgenda.every('12 hours', 'fetcher');
};

// Set up listeners for completion
scraperAgenda.on('complete', async (job) => {
  // 'fetcher' job triggers 'scraper' job on completion
  if (job.attrs.name === 'fetcher') {
    console.log('Scheduler: Job 1 "fetcher" completed.');
    const fetcherData = (job.attrs.data as FetcherJobData).fetcherData; // Type-cast to FetcherJobData
    await scraperAgenda.now('scraper', { fetcherData });
  }

  if (job.attrs.name === 'scraper') {
    console.log('Scheduler: Job 2 "scraper" completed.');
  }
});

// Start Agenda
(async () => {
  await scraperAgenda.start();
  await runJobs();
  console.log('Scheduler: Agenda started!');
})();

// Handle graceful shutdown (.on)
async function gracefulShutdown() {
  await scraperAgenda.stop();
  console.log('Scheduler: Agenda stopped!');
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
