import config from '@/config';
import { Agenda } from '@hokify/agenda';
import { IScraperItem, IEvent } from '@/interfaces/interfaces';
import { deleteScraperCollection } from '@/database/operations/dbDelete';
import { getAllItemsForScraper } from '@/database/operations/dbRead';
import { scraperWorker } from '../services/scraperWorker';
import { createEvent } from '@/database/operations/dbCreate';
// import { analyzerComparison } from '../analyzer/analyzerComparison';

// Create new instance of Agenda
const scraperAgenda = new Agenda({
  db: { address: config.mongoUri, collection: config.agenda.dbCollection },
});

// Define new job for scraping data: "Scraper"
scraperAgenda.define('Scraper', async (job) => {
  console.log('Scheduler: Job "Scraper" running...');

  // STEP 1: Get information from DB
  const allItems: IScraperItem[] = await getAllItemsForScraper();

  // STEP 2: Save the result in job data
  job.attrs.data = allItems;
  await job.save();

  // STEP 3: Call scraper worker
  const events: IEvent[] = await scraperWorker(allItems);
  console.log('Scheduler: Scraping done.');

  // console.log(events);
  // console.log(events.length);
  // console.log(stores[0].items);

  // STEP 4: Create new Events on DB
  await createEvent(events);
  console.log('Scheduler: Creating events done.');
  console.log('Scheduler: Job "Scraper" completed!');
});

// Schedule the "Scraper" job to run every X hours
const runJobs = async () => {
  await scraperAgenda.every('12 hours', 'Scraper');
};

// Start Agenda
export async function startAgenda(): Promise<void> {
  // Delete all documents in 'Scraper' collection
  console.log('Scheduler: Clearing previous "Scraper" schedules');
  await deleteScraperCollection();

  // Actually start scraperAgenda
  await scraperAgenda.start();
  await runJobs();
  console.log('Scheduler: Agenda started!');
}

// Handle graceful shutdown (.on)
async function gracefulShutdown() {
  await scraperAgenda.stop();
  console.log('Scheduler: Agenda stopped!');
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
