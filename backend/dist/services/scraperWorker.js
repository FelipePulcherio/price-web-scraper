"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraperWorker = scraperWorker;
const scraperMain_1 = require("./scraperMain");
// FUNCTIONS
async function scraperWorker(itemData) {
    // Restructure data with focus in store
    const storeMap = new Map();
    itemData.forEach((item) => {
        item.stores.forEach((store) => {
            if (!storeMap.has(store.id)) {
                storeMap.set(store.id, {
                    id: store.id,
                    name: store.name,
                    items: [],
                });
            }
            storeMap.get(store.id).items.push({
                id: item.id,
                url: store.url,
                price: store.price,
            });
        });
    });
    const stores = Array.from(storeMap.values());
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
    const events = await Promise.all(stores.map(async (store) => {
        try {
            return await (0, scraperMain_1.scraperMain)({ storeSet: store });
        }
        catch (error) {
            console.error(`Error scraping ${store.name}: ${error}`);
            return [];
        }
    }));
    return events.flat();
}
//# sourceMappingURL=scraperWorker.js.map