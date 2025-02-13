import puppeteer, { Browser, Page } from 'puppeteer-core';
import config from '@/config';
import { IScraperStore, IEvent } from '@/interfaces/interfaces';
// import { promises as fs } from 'fs';

// FUNCTIONS
// Define an interface for scraperWorker props data
interface scraperMainProps {
  storeSet: IScraperStore;
  retryCount?: number;
}

export async function scraperMain({
  storeSet,
  retryCount = 3,
}: scraperMainProps): Promise<IEvent[]> {
  let events: IEvent[] = [];

  return new Promise(async (resolve, reject) => {
    // Iterate trough all items
    for (const item of storeSet.items) {
      let retries = 0;
      let success = false;

      // Initialize variables outside any try...catch
      let browser: Browser | null = null;
      let page: Page | null = null;

      // Allow multiple retry
      while (!success && retries < retryCount) {
        // Main Connection Try...Catch
        try {
          console.log('Main_scraper: Connecting to Scraping Browser...');

          browser = await puppeteer.connect({
            browserWSEndpoint: config.brightData,
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

          // // Set User Agent
          // await page.setUserAgent(
          //   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          // );
        } catch (err) {
          console.error('Error connecting to browser:', err);
          return resolve([]);
          // Handle ERRORs 5** from Bright Data Here + Others related to browser/proxy
        }

        // Scraping Try...Catch
        let price = 0;
        if (browser && page) {
          try {
            switch (storeSet.name) {
              case 'AMAZON CA':
                price = await amazonScraper({
                  page: page,
                  url: item.url,
                });
                break;
              case 'BEST BUY CA':
                price = await bestbuyScraper({
                  page: page,
                  url: item.url,
                });
                break;
              case 'CANADA COMPUTERS':
                price = await canadacomputersScraper({
                  page: page,
                  url: item.url,
                });
                break;
              case 'NEW EGG CA':
                price = await neweggScraper({
                  page: page,
                  url: item.url,
                });
                break;
              case 'WALMART CA':
                price = await walmartScraper({
                  page: page,
                  url: item.url,
                });
                break;
              default:
                console.log(`Main_scraper: ${storeSet.name} not found!`);
            }

            // Save info
            events.push({
              itemId: item.id,
              storeId: storeSet.id,
              price: price,
              fromJob: 'Scraper',
              status: 'OK',
            });

            // Exit retry loop
            success = true;

            // Catch errors
          } catch (error) {
            console.error(`Error scraping ${item.url}. ${error}`);

            // Capture screenshot
            await page.screenshot({
              path: 'screenshot.jpg',
            });

            // Increment retry counter
            retries++;
            console.log(`Main_scraper: Trying again...\nRetry #${retries}`);

            // Execute independently of success/error
          } finally {
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
        // Save info
        events.push({
          itemId: item.id,
          storeId: storeSet.id,
          price: 0,
          fromJob: 'Scraper',
          status: 'FAILED',
        });

        console.error(`Main_scraper: Error scraping ${item.url}`);
        console.log('Main_scraper: Moving to next URL...');
      }
    }

    // When finish looping all items resolve
    resolve(events);
  });
}

// Define interface for props used in all specific stores scraper functions
interface storeScraperProps {
  page: Page;
  url: string;
}

async function bestbuyScraper({ page, url }: storeScraperProps) {
  //Navigate to url
  console.log(`Main_scraper (BB): Navigating to ${url}...`);
  await page.goto(url);

  console.log('Main_scraper (BB): Navigated!');

  // Wait for the selector to appear
  console.log('Main_scraper (BB): Waiting for selector...');
  await page.waitForSelector('span[data-automation="product-price"]', {
    timeout: 1 * 30 * 1000, // 30 seconds
  });

  let priceContent: string | null = null;
  let price: number | null = null;

  // Query element with price info (first match only)
  console.log('Main_scraper (BB): Scraping prices...');
  const priceLocation = await page.$(
    'span.style-module_screenReaderOnly__4QmbS.style-module_large__g5jIz'
  );

  // Check if element it exists
  if (priceLocation) {
    // Get the value from element
    priceContent = await page.evaluate(
      (element) => element.textContent,
      priceLocation
    );

    if (priceContent) {
      // Remove dollar symbol
      price = Number(Number(priceContent.split('$')[1]).toFixed(2));
      console.log(`Main_scraper (BB): Scraped value: ${price}`);
    } else {
      throw new Error(
        'Main_scraper (BB): Could not evaluate "textContent" of HTML Element.'
      );
    }
  } else {
    throw new Error('Main_scraper (BB): HTML Element not found.');
  }

  return price;
}

async function walmartScraper({ page, url }: storeScraperProps) {
  //Navigate to url
  console.log(`Main_scraper (WM): Navigating to ${url}...`);
  await page.goto(url);

  console.log('Main_scraper (WM): Navigated!');

  // // Capture screenshot
  // await page.screenshot({
  //   path: 'screenshot.jpg',
  // });

  // // Save HTML from page
  // const html = await page.content();
  // // Save the HTML content to a file
  // await fs.writeFile('output.html', html, 'utf-8');

  // const captchaFrame = page
  //   .frames()
  //   .find(
  //     (f) =>
  //       f.name() ===
  //       'destination_publishing_iframe_walmart-wmi_0_name'
  //   );

  // If captchaFrame exists, handle the captcha
  // if (captchaFrame !== undefined) {
  //   const client = await page.createCDPSession();
  //   console.log('Main_scraper (WM): Waiting captcha to solve...');
  //   const { status } = await client.send('Captcha.waitForSolve', {
  //     detectTimeout: 10000,
  //   });
  //   console.log('Main_scraper (WM): Captcha solve status:', status);
  // }

  // Wait for the selector to appear
  console.log('Main_scraper (WM): Waiting for selector...');
  await page.waitForSelector('div[data-testid="add-to-cart-section"]', {
    timeout: 1 * 30 * 1000, // 30 seconds
  });

  let priceContent: string | null = null;
  let price: number | null = null;

  // Query element with price info (first match only)
  console.log('Main_scraper (WM): Scraping prices...');
  const priceLocation = await page.$('span[itemprop="price"]');

  // Check if element it exists
  if (priceLocation) {
    // Get the value from element
    priceContent = await page.evaluate(
      (element) => element.textContent,
      priceLocation
    );

    if (priceContent) {
      // Remove dollar symbol and comma
      price = Number(Number(priceContent.replace(/[$,]/g, '')).toFixed(2));
      console.log(`Main_scraper (WM): Scraped value: ${price}`);
    } else {
      throw new Error(
        'Main_scraper (WM): Could not evaluate "textContent" of HTML Element.'
      );
    }
  } else {
    throw new Error('Main_scraper (WM): HTML Element not found.');
  }

  return price;
}

async function amazonScraper({ page, url }: storeScraperProps) {
  //Navigate to url
  console.log(`Main_scraper (AM): Navigating to ${url}...`);
  await page.goto(url);

  console.log('Main_scraper (AM): Navigated!');

  // const html = await page.content();
  // // Save the HTML content to a file
  // await fs.writeFile('output.html', html, 'utf-8');

  // const captchaFrame = page
  //   .frames()
  //   .find(
  //     (f) => f.name() === 'destination_publishing_iframe_walmart-wmi_0_name'
  //   );

  // // If captchaFrame exists, handle the captcha
  // if (captchaFrame !== undefined) {
  //   const client = await page.createCDPSession();
  //   console.log('Main_scraper (AM): Waiting captcha to solve...');
  //   const { status } = await client.send('Captcha.waitForSolve', {
  //     detectTimeout: 10000,
  //   });
  //   console.log('Main_scraper (AM): Captcha solve status:', status);
  // }

  // Wait for the selector to appear
  console.log('Main_scraper (AM): Waiting for selector...');
  await page.waitForSelector('div.a-spacing-top-mini', {
    timeout: 1 * 30 * 1000, // 30 seconds
  });

  let priceContent: string | null = null;
  let price: number | null = null;

  // Query div with price info (first match only)
  console.log('Main_scraper (AM): Scraping prices...');
  const priceLocation = await page.$(
    'div.a-spacing-top-mini>span.a-price>span.a-offscreen'
  );

  // Check if element exist
  if (priceLocation) {
    // Get the value from div
    priceContent = await page.evaluate(
      (element) => element.textContent,
      priceLocation
    );

    if (priceContent) {
      // Remove dollar symbol and comma
      price = Number(Number(priceContent.replace(/[$,]/g, '')).toFixed(2));
      console.log(`Main_scraper (AM): Scraped value: ${price}`);
    } else {
      throw new Error(
        'Main_scraper (AM): Could not evaluate "textContent" of HTML Element.'
      );
    }
  } else {
    throw new Error('Main_scraper (AM): HTML Element not found.');
  }

  return price;
}

async function canadacomputersScraper({ page, url }: storeScraperProps) {
  //Navigate to url
  console.log(`Main_scraper (CC): Navigating to ${url}...`);
  await page.goto(url);

  console.log('Main_scraper (CC): Navigated!');

  // Wait for the selector to appear
  console.log('Main_scraper (CC): Waiting for selector...');
  await page.waitForSelector('div.current-price', {
    timeout: 1 * 30 * 1000, // 30 seconds
  });

  let priceContent: string | null = null;
  let price: number | null = null;

  // Query div with price info (first match only)
  console.log('Main_scraper (CC): Scraping prices...');
  const priceLocation = await page.$(
    'div.current-price span.current-price-value'
  );

  // Check if element it exists
  if (priceLocation) {
    // Get the value from div
    priceContent = await page.evaluate(
      (element) => element.textContent.trim(),
      priceLocation
    );

    if (priceContent) {
      // Remove dollar symbol
      price = parseFloat(priceContent.replace(/[^0-9.]/g, ''));
      console.log(`Main_scraper (CC): Scraped value: ${price}`);
    } else {
      throw new Error(
        'Main_scraper (CC): Could not evaluate "textContent" of HTML Element.'
      );
    }
  } else {
    throw new Error('Main_scraper (CC): HTML Element not found.');
  }

  return price;
}

async function neweggScraper({ page, url }: storeScraperProps) {
  //Navigate to url
  console.log(`Main_scraper (NE): Navigating to ${url}...`);
  await page.goto(url);

  console.log('Main_scraper (NE): Navigated!');

  // Wait for the selector to appear
  console.log('Main_scraper (NE): Waiting for selector...');
  await page.waitForSelector('ul.price', {
    timeout: 1 * 30 * 1000, // 30 seconds
  });

  let priceContent: string | null = null;
  let price: number | null = null;

  // Query div with price info (first match only)
  console.log('Main_scraper (NE): Scraping prices...');
  const priceLocation = await page.$('li.price-current');

  // Check if element it exists
  if (priceLocation) {
    // Get the value from div
    priceContent = await page.evaluate(
      (element) => element.textContent,
      priceLocation
    );

    if (priceContent) {
      // Remove dollar symbol and comma
      price = Number(Number(priceContent.replace(/[$,]/g, '')).toFixed(2));
      console.log(`Main_scraper (NE): Scraped value: ${price}`);
    } else {
      throw new Error(
        'Main_scraper (CC): Could not evaluate "textContent" of HTML Element.'
      );
    }
  } else {
    throw new Error('Main_scraper (CC): HTML Element not found.');
  }

  return price;
}
