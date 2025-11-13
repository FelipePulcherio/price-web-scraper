import { decodoAxiosClient as axiosClient } from '../storesApiClient.js';
import {
  IBestBuySearchAPIResponse,
  IBestBuySearchAPIData,
  IBestBuyAvailabilityAPIResponse,
  IBestBuyAvailabilityAPIData,
  IBestBuyDetailAPIResponse,
  IBestBuyDetailAPIData,
} from './types.js';
import { IDiscoverItem } from '../../../interfaces/interfaces.js';
import utils from '../utils/index.js';
import bestBuyCaNormalizeData from './bestBuyCaNormalizeData.js';

import { promises as fs } from 'fs';
import path from 'path';

function buildBestBuySearchUrl({
  query,
  page,
}: {
  query: string;
  page: number;
}): string {
  const apiUrlBase = `https://www.bestbuy.ca/api/v2/json/search?currentRegion=BC&lang=en-CA&page=${page}&pageSize=100&path=custom0productcondition%3ABrand%20New%3Bsoldandshippedby0enrchstring%3ABest%20Buy&query=query%20here&exp=labels%2Csearch_abtesting_personalization_epsilon%3Ab0%2Csearch_abtesting_personalization_zeta%3Ab1&isPLP=true&sortBy=price&sortDir=asc`;
  const formattedQuery = utils.formatQuery({ query, separator: '%20' });
  return apiUrlBase.replace('query%20here', formattedQuery);
}

async function fetchSearchAPI({
  apiUrl,
}: {
  apiUrl: string;
}): Promise<IBestBuySearchAPIResponse> {
  // Api for searching an item
  // Needs Headers
  // Works by string (with %20 separator) and id (refer to "sku")
  try {
    const apiResponse: IBestBuySearchAPIResponse = await axiosClient.get(
      apiUrl,
      {
        method: 'GET',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
      }
    );

    // console.log(`BEST BUY CA: Search API Called.`);

    return apiResponse;
  } catch (err) {
    throw new utils.FetchFailedError(
      'Failed to fetch data from BEST BUY CA search.',
      err
    );
  }
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  page?: number
): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      console.warn(
        `BEST BUY CA: [Page ${page}] Attempt ${attempt + 1} failed.`
      );
      attempt++;
      if (attempt > retries) {
        console.warn(
          `BEST BUY CA: [Page ${page}] Failed after ${retries + 1} attempts.`
        );
        // console.error(err);
        throw err;
      }
      await utils.randomizedDelay({ initialTime: 500, finalTime: 1500 });
    }
  }

  throw new Error('Unreachable code in fetchWithRetry');
}

async function fetchAllSearchPagesLinear({
  query,
}: {
  query: string;
}): Promise<IBestBuySearchAPIData[]> {
  let allResponses: IBestBuySearchAPIData[] = [];

  const searchUrl: string = buildBestBuySearchUrl({ query, page: 1 });

  console.log('BEST BUY CA: Search API Called. Fetching Page #1.');
  const firstApiResponse = await fetchSearchAPI({ apiUrl: searchUrl });

  allResponses.push(firstApiResponse.data);
  const { totalPages } = firstApiResponse.data;

  for (let i = 2; i <= totalPages; i++) {
    await utils.randomizedDelay({ initialTime: 1500, finalTime: 3000 });

    const nextPageUrl = buildBestBuySearchUrl({ query, page: i });
    let success = false;
    let attempts = 0;

    // Blind retry if a page fails for whatever reason
    while (!success && attempts < 3) {
      try {
        console.log(
          `BEST BUY CA: Search API Called. Fetching Page #${i}. Attempt ${
            attempts + 1
          }`
        );
        const response = await fetchSearchAPI({ apiUrl: nextPageUrl });
        if (response) {
          allResponses.push(response.data);
          success = true;
        }
      } catch (err) {
        attempts++;
        if (attempts === 3) {
          console.warn(
            `BEST BUY CA: Failed to fetch page ${i} after 3 attempts. Skipping.`
          );
        } else {
          await utils.randomizedDelay({ initialTime: 1500, finalTime: 3000 });
        }
      }
    }
  }

  return allResponses;
}

async function fetchAllSearchPagesParallel({
  query,
}: {
  query: string;
}): Promise<IBestBuySearchAPIData[]> {
  const searchUrl: string = buildBestBuySearchUrl({ query, page: 1 });

  // Run once to find totalPages
  console.log('BEST BUY CA: Search API Called.');
  const firstApiResponse = await fetchWithRetry(
    () => fetchSearchAPI({ apiUrl: searchUrl }),
    2,
    1
  );

  const { totalPages } = firstApiResponse.data;

  console.log(`BEST BUY CA: Search API will call ${totalPages} pages.`);

  if (totalPages <= 1) return [firstApiResponse.data];

  const pagePromises = Array.from({ length: totalPages - 1 }, (_, i) => {
    const page = i + 2;
    const nextPageUrl = buildBestBuySearchUrl({ query, page });

    return (async () => {
      try {
        const response = await fetchWithRetry(
          () => fetchSearchAPI({ apiUrl: nextPageUrl }),
          2,
          page
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.warn(
          `BEST BUY CA: [Page ${page}] Failed to fetch after 3 attempts.`
        );
        return { success: false };
      }
    })();
  });

  const results = await Promise.allSettled(pagePromises);

  const successfulResponses: IBestBuySearchAPIData[] = results
    .filter(
      (
        res
      ): res is PromiseFulfilledResult<{
        success: true;
        data: IBestBuySearchAPIData;
      }> => res.status === 'fulfilled' && res.value.success
    )
    .map((res) => res.value.data);

  console.log(
    `BEST BUY CA: Successfully fetched ${
      successfulResponses.length + 1
    }/${totalPages} page(s).`
  );

  return [...[firstApiResponse.data], ...successfulResponses];
}

function chunkSkuStringsFromApiResponses({
  discoveredItems,
}: {
  discoveredItems: IDiscoverItem[];
}): string[] {
  const allSkus: string[] = [];
  const maxChunkSize = 96;
  const chunks: string[] = [];

  discoveredItems.forEach((item) => {
    const specificId = item.stores[0].specificId;
    if (specificId) {
      allSkus.push(specificId);
    }
  });

  for (let i = 0; i < allSkus.length; i += maxChunkSize) {
    const chunk = allSkus.slice(i, i + maxChunkSize).join('%7C');
    chunks.push(chunk);
  }

  // console.log(`BEST BUY CA: Created ${chunks.length} chunk(s) of SKUs`);
  // chunks.forEach((chunk, index) => {
  //   console.log(
  //     `Chunk #${index + 1} (${chunk.split('%7C').length} SKUs): ${chunk}`
  //   );
  // });

  return chunks;
}

function buildBestBuyAvailabilityUrl({
  skuChunk,
}: {
  skuChunk: string;
}): string {
  const apiUrlBase =
    'https://www.bestbuy.ca/ecomm-api/availability/products?accept=application%2Fvnd.bestbuy.simpleproduct.v1%2Bjson&accept-language=en-CA&skus=skus%7Chere';
  return apiUrlBase.replace('skus%7Chere', skuChunk);
}

async function fetchAvailabilityAPI({
  apiUrl,
}: {
  apiUrl: string;
}): Promise<IBestBuyAvailabilityAPIResponse> {
  // Api for checking availability of 1 or many items (limit is 96)
  // Needs Headers
  // Works by string with %7C separator
  try {
    const apiResponse: IBestBuyAvailabilityAPIResponse = await axiosClient.get(
      apiUrl,
      {
        method: 'GET',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
      }
    );

    return apiResponse;
  } catch (err) {
    throw new utils.FetchFailedError(
      'Failed to fetch data from BEST BUY CA availability.',
      err
    );
  }
}

async function fetchAllAvailabilityPagesLinear({
  discoveredItems,
}: {
  discoveredItems: IDiscoverItem[];
}): Promise<IBestBuyAvailabilityAPIData[]> {
  let allAvailabilityResponses: IBestBuyAvailabilityAPIData[] = [];
  let success = false;
  let attempts = 0;

  const skuChunks = chunkSkuStringsFromApiResponses({ discoveredItems });

  for (let i = 0; i < skuChunks.length; i++) {
    await utils.randomizedDelay({ initialTime: 1500, finalTime: 3000 });
    const nextPageUrl: string = buildBestBuyAvailabilityUrl({
      skuChunk: skuChunks[i],
    });

    // Blind retry if a page fails for whatever reason
    while (!success && attempts < 3) {
      try {
        console.log(
          `BEST BUY CA: Availability API Called. Fetching Chunk #${i + 1}/${
            skuChunks.length
          }. Attempt ${attempts + 1}`
        );
        const response = await fetchAvailabilityAPI({ apiUrl: nextPageUrl });
        if (response) {
          allAvailabilityResponses.push(response.data);
          success = true;
        }
      } catch (err) {
        attempts++;
        if (attempts === 3) {
          console.warn(
            `BEST BUY CA: Failed to fetch Chunk #${
              i + 1
            } after 3 attempts. Skipping.`
          );
        } else {
          await utils.randomizedDelay({ initialTime: 1500, finalTime: 3000 });
        }
      }
    }
  }

  return allAvailabilityResponses;
}

async function fetchAllAvailabilityPagesParallel({
  discoveredItems,
}: {
  discoveredItems: IDiscoverItem[];
}): Promise<IBestBuyAvailabilityAPIData[]> {
  const skuChunks = chunkSkuStringsFromApiResponses({ discoveredItems });

  console.log(
    `BEST BUY CA: Availability API will call ${skuChunks.length} pages.`
  );

  const availabilityFetchPromises = skuChunks.map((chunk, idx) =>
    (async () => {
      const nextPageUrl: string = buildBestBuyAvailabilityUrl({
        skuChunk: chunk,
      });

      try {
        const response = await fetchWithRetry(
          () => fetchAvailabilityAPI({ apiUrl: nextPageUrl }),
          2,
          idx + 1
        );
        return { success: true as const, data: response.data };
      } catch (err) {
        return { success: false as const };
      }
    })()
  );

  const results = await Promise.allSettled(availabilityFetchPromises);

  const successfulResponses: IBestBuyAvailabilityAPIData[] = results
    .filter(
      (
        res
      ): res is PromiseFulfilledResult<{
        success: true;
        data: IBestBuyAvailabilityAPIData;
      }> => res.status === 'fulfilled' && res.value.success
    )
    .map((res) => res.value.data);

  console.log(
    `BEST BUY CA: Availability API successfully fetched ${successfulResponses.length}/${skuChunks.length} pages.`
  );

  return successfulResponses;
}

function buildBestBuyDetailUrl({ sku }: { sku: string }): string {
  const apiUrlBase =
    'https://www.bestbuy.ca/api/v2/json/product/skuHere?currentRegion=BC&lang=en-CA';
  return apiUrlBase.replace('skuHere', sku);
}

async function fetchDetailAPI({
  apiUrl,
}: {
  apiUrl: string;
}): Promise<IBestBuyDetailAPIResponse> {
  // Api for checking detail of 1 item (limit is 1)
  // Needs Headers
  // Works by sku string
  try {
    const apiResponse: IBestBuyDetailAPIResponse = await axiosClient.get(
      apiUrl,
      {
        method: 'GET',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
      }
    );

    return apiResponse;
  } catch (err) {
    throw new utils.FetchFailedError(
      'Failed to fetch data from BEST BUY CA detail.',
      err
    );
  }
}

function allSkusFromApiResponses({
  discoveredItems,
}: {
  discoveredItems: IDiscoverItem[];
}): string[] {
  const allSkus: string[] = [];

  discoveredItems.forEach((item) => {
    const specificId = item.stores[0].specificId;
    if (specificId) {
      allSkus.push(specificId);
    }
  });

  return allSkus;
}

async function fetchAllDetailPagesParallel({
  discoveredItems,
}: {
  discoveredItems: IDiscoverItem[];
}): Promise<IBestBuyDetailAPIData[]> {
  const skus = allSkusFromApiResponses({ discoveredItems });

  console.log(`BEST BUY CA: Detail API will call ${skus.length} pages.`);

  const detailFetchPromises = skus.map((sku, i) =>
    (async () => {
      const nextPageUrl: string = buildBestBuyDetailUrl({
        sku,
      });

      try {
        const response = await fetchWithRetry(
          () => fetchDetailAPI({ apiUrl: nextPageUrl }),
          2,
          i + 1
        );
        return { success: true as const, data: response.data };
      } catch (err) {
        return { success: false as const };
      }
    })()
  );

  const results = await Promise.allSettled(detailFetchPromises);

  const successfulResponses: IBestBuyDetailAPIData[] = results
    .filter(
      (
        res
      ): res is PromiseFulfilledResult<{
        success: true;
        data: IBestBuyDetailAPIData;
      }> => res.status === 'fulfilled' && res.value.success
    )
    .map((res) => res.value.data);

  console.log(
    `BEST BUY CA: Detail API successfully fetched ${successfulResponses.length}/${skus.length} pages.`
  );

  return successfulResponses;
}

export default async function bestBuyCaSearch({
  query,
}: {
  query: string;
}): Promise<IDiscoverItem[]> {
  // Best Buy runs a lot of APIs to retrieve chunks of info.
  // Search API does not give all info. Only sku, name, url, price, main image, category ids
  // TO DO: Run item detail API (single sku) to get more images, model, brand, upc, availability
  // OPTIONAL TO DO: Setup crawler to run variants API -> This returns all related skus (different sizes, color, etc.)

  const allSearchResponses = await fetchAllSearchPagesParallel({ query });

  // For debbuging
  // const inputPath = path.resolve(__dirname, 'bestbuy-results.json');
  // const file = await fs.readFile(inputPath, 'utf-8');
  // const allSearchResponses: IBestBuySearchAPIData[] = JSON.parse(file);

  // await utils.saveAsJson({
  //   fileName: 'bestbuy-results.json',
  //   toBeSaved: allSearchResponses,
  // });

  let discoveredItems: IDiscoverItem[] = bestBuyCaNormalizeData({
    type: 'search',
    discoveredItems: [],
    apiResponse: allSearchResponses,
  });

  const allDetailResponses = await fetchAllDetailPagesParallel({
    discoveredItems,
  });

  discoveredItems = bestBuyCaNormalizeData({
    type: 'detail',
    discoveredItems,
    apiResponse: allDetailResponses,
  });

  return discoveredItems;
}
