import { scraperMain } from './scraperMain';
import { IItem, IStore } from '../types/types';

// FUNCTIONS
// Define an interface for scraperWorker props data
interface scraperWorkerProps {
  itemData: IItem[];
}

export async function scraperWorker({
  itemData,
}: scraperWorkerProps): Promise<IStore[]> {
  // Restructure data with focus in store.name
  const stores: IStore[] = [];

  itemData.forEach((item) => {
    item.stores.forEach((store) => {
      const existingStoreIndex = stores.findIndex(
        (obj) => obj.storeName === store.name
      );

      if (existingStoreIndex !== -1) {
        stores[existingStoreIndex].items.push({
          _id: item._id,
          url: store.url,
          price: 0,
          lastUpdated: new Date(),
          status: null,
          storeName: '',
        });
      } else {
        stores.push({
          storeName: store.name,
          items: [
            {
              _id: item._id,
              url: store.url,
              price: 0,
              lastUpdated: new Date(),
              status: null,
              storeName: '',
            },
          ],
        });
      }
    });
  });

  // console.log(stores);
  // console.log(stores[0]);
  // console.log(stores[0].items);

  // FOR DEVELOPMENT: Run one by one, always waiting the last Promise to resolve before starting a new scraperMain() call.
  return new Promise(async (resolve, reject) => {
    // Outside try...catch is used to handle errors in the looping part
    try {
      // loop trough all stores
      for (const storeSet of stores) {
        // Inside try...catch is used to handle errors in scraperMain().
        try {
          // Send whole storeSet to scraperMain() and wait for promise to resolve on storeSet
          await scraperMain({ storeSet: storeSet });
        } catch (error) {
          console.error(`Error scraping ${storeSet.storeName}: ${error}`);
          // More error handling here!
        }
      }

      // console.log(stores[0].items);

      resolve(stores);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

  // // FOR PRODUCTION: If everything is working as intended, run all scraperMain() at the same time.
  // return Promise.all(
  //   stores.map(async (storeSet) => {
  //     try {
  //       await scraperMain({ storeSet: storeSet });
  //       // Additional processing if needed
  //     } catch (error) {
  //       console.error(`Error scraping ${storeSet.storeName}: ${error}`);
  //       // More error handling here!
  //     }
  //   })
  // )
  //   .then(() => {
  //     console.log(stores[0].items);
  //     return stores;
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
}
