import { scraperMain } from './scraperMain';
import { IScraperItem, IScraperStore, IEvent } from '@/interfaces/interfaces';

// FUNCTIONS
export async function scraperWorker(
  itemData: IScraperItem[]
): Promise<IEvent[]> {
  // Restructure data with focus in store
  const storeMap = new Map<number, IScraperStore>();

  itemData.forEach((item) => {
    item.stores.forEach((store) => {
      if (!storeMap.has(store.id)) {
        storeMap.set(store.id, {
          id: store.id,
          name: store.name,
          items: [],
        });
      }

      storeMap.get(store.id)!.items.push({
        id: item.id,
        url: store.url,
        price: store.price,
      });
    });
  });

  const stores: IScraperStore[] = Array.from(storeMap.values());

  // console.log(stores);
  // console.log('========================================');
  // console.log(stores[0]);
  // console.log('========================================');
  // console.log(stores[0].items);
  // console.log('========================================');
  // console.log(stores[0].items[0]);
  // console.log('========================================');

  // FOR DEVELOPMENT: Run one by one, always waiting the last Promise to resolve before starting a new scraperMain() call.
  // const eventsArray: IEvent[] = [];
  // for (const store of stores) {
  //   try {
  //     const events = await scraperMain({ storeSet: store });
  //     eventsArray.push(...events);
  //   } catch (error) {
  //     console.error(`Error scraping ${store.name}: ${error}`);
  //     // Continue to the next store ...
  //   }
  // }
  // return eventsArray;

  // FOR PRODUCTION: If everything is working as intended, run all scraperMain() at the same time.
  const events = await Promise.all(
    stores.map(async (store) => {
      try {
        return await scraperMain({ storeSet: store });
      } catch (error) {
        console.error(`Error scraping ${store.name}: ${error}`);
        return [];
      }
    })
  );

  return events.flat();
}
