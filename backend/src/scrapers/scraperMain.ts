import puppeteer, { Browser } from 'puppeteer-core';
import { brightDataConfig } from '../config/config';
import { IStore } from '../types/types';

// FUNCTIONS
// Define an interface for scraperWorker props data
interface scraperMainProps {
  storeSet: IStore;
  retryCount?: number;
}

export async function scraperMain({
  storeSet,
  retryCount = 3,
}: scraperMainProps) {
  // Global vars
  const BRIGHT_ENDPOINT = brightDataConfig.BRIGHT_ENDPOINT;

  return new Promise(async (resolve, reject) => {
    // Iterate trough all items
    for (const item of storeSet.items) {
      const url = item.url;

      let retries = 0;
      let success = false;

      // Initialize variables outside any try...catch
      let page, browser;

      // Allow multiple retry
      while (!success && retries < retryCount) {
        // Main Connection Try...Catch
        try {
          console.log('Main_scraper: Connecting to Scraping Browser...');
          browser = await puppeteer.connect({
            browserWSEndpoint: BRIGHT_ENDPOINT,
          });

          console.log('Main_scraper: Connected!');

          page = await browser.newPage();

          // Enable request interception
          await page.setRequestInterception(true);

          // Listen for requests
          page.on('request', (request) => {
            const resourceType = request.resourceType();
            switch (resourceType) {
              case 'image':
              case 'stylesheet':
              case 'font':
              case 'media':
              case 'texttrack':
              case 'xhr':
              // case 'fetch':
              case 'eventsource':
              case 'websocket':
              case 'manifest':
              case 'signedexchange':
              case 'ping':
              case 'cspviolationreport':
              case 'preflight':
                // If the request is for one of these types, block it
                request.abort();
                break;
              default:
                // If it's not one of the above types, allow it to continue
                request.continue();
                break;
            }
          });

          // Set viewport
          await page.setViewport({ width: 1024, height: 768 });

          // Set navigation timeout
          page.setDefaultNavigationTimeout(2 * 60 * 1000); // 2 minutes

          // Set User Agent
          await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          );
        } catch (err) {
          console.error(err);
          reject(err);
          // Handle ERRORs 5** from Bright Data Here + Others related to browser/proxy
        }

        // Scraping Try...Catch
        try {
          switch (storeSet.storeName) {
            case 'bestbuy.ca':
              price = await bestbuyScraper(page, url);
              break;
            case 'walmart.ca':
              price = await walmartScraper(page, url);
              break;
            default:
              console.log(`Main_scraper: ${storeSet.storeName} not found!`);
          }

          // Add the scraped price to the item in storeSet
          item.price = price;
          item.lastUpdated = new Date();
          item.status = 'OK';

          // Exit retry loop
          success = true;

          // Catch errors
        } catch (error) {
          console.error(`Error scraping ${url}: ${error}`);

          // Capture screenshot
          await page.screenshot({
            path: 'screenshot.jpg',
          });

          // Increment retry counter
          retries++;
          console.log(`Main_scraper: Trying again...\nRetry #${retries}`);

          // Execute independently of success/error
        } finally {
          if (page) {
            console.log('Main_scraper: Closing Scraping Browser...');

            // Close page and browser
            await page.close();
            await browser.close();

            console.log('Main_scraper: Closed!');
          }
        }
      }

      // If scraping failed after all retries, set price to null and status to 'failed'
      if (!success) {
        item.price = null;
        item.lastUpdated = new Date();
        item.status = 'Failed';

        console.error(`Main_scraper: Error scraping ${url}`);
        console.log('Main_scraper: Moving to next URL...');
      }
    }

    // When finish looping all items resolve
    resolve(storeSet);
  });
}
