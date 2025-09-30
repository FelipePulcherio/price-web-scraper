import { Agenda } from '@hokify/agenda';
import config from '@/config';
import searchAllStores from '@/services/stores/searchAllStores';

// Create new instance of Agenda
const scraperScheduler = new Agenda({
  db: { address: config.mongoUri, collection: config.agenda.dbCollection },
});

scraperScheduler.define('searchAllStores', async (job) => {
  const { query } = job.attrs.data as { query: string };

  try {
    console.log(`[Agenda]: Running job searchAllStores for query "${query}"`);
    const items = await searchAllStores({ query });

    // Save discovered items into DB
    // await saveDiscoveredItems(query, items);

    console.log(
      `[Agenda]: Finished job searchAllStores for query "${query}" with ${items.length} items.`
    );
  } catch (err) {
    console.error(
      `[Agenda]: Failed job searchAllStores for query "${query}"`,
      err
    );
  }
});

export async function startScraperScheduler() {
  await scraperScheduler.start();
  console.log('[Agenda]: scraperScheduler instance is running.');
}

export default scraperScheduler;
