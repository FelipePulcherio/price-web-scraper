import { agendaScraper, agendaPostProcess } from '../index.js';
import searchAllStores from '../../services/stores/searchAllStores.js';
import {
  createOrUpdateDiscoveredItems,
  createEvent,
} from '../../database/operations/dbCreate.js';

agendaScraper.define('searchAllStores', async (job) => {
  const { query } = job.attrs.data as { query: string };

  try {
    // 1) Scrape data
    console.log(
      `[Agenda - Search All Stores]: Running job searchAllStores for query "${query}"`
    );
    const items = await searchAllStores({ query });

    // 2) Save discovered items in DB
    console.log(`[Agenda - Search All Stores]: Saving items in DB.`);
    const newItems = await createOrUpdateDiscoveredItems(items);

    // 3) Save new events in DB
    console.log(`[Agenda - Search All Stores]: Saving events in DB.`);
    await createEvent(newItems, 'SCRAPER');

    // 4) Start new job with created/updated ids
    const createdIds = newItems
      .filter((item) => item.id)
      .map((item) => item.id!) as number[];

    if (createdIds.length > 0) {
      await agendaPostProcess.now('createItemImages', { itemIds: createdIds });

      console.log(
        `[Agenda - Search All Stores]: Job createItemImages posted for ${createdIds.length} items.`
      );
    }

    // 5) Finish
    console.log(
      `[Agenda - Search All Stores]: Finished job for query "${query}" with ${items.length} items.`
    );
  } catch (err) {
    console.error(
      `[Agenda - Search All Stores]: Failed job for query "${query}"`,
      err
    );
  }
});
