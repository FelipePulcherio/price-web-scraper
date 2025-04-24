import { axiosClient } from '../storesApiClient';
import {
  IBestBuySearchAPIResponse,
  IBestBuySearchAPIData,
  IBestBuyAvailabilityAPIResponse,
  IBestBuyAvailabilityAPIData,
} from './types';
import { IDiscoverItem } from '@/interfaces/interfaces';
import formatQuery from '../utils/formatQuery';
import randomizedDelay from '../utils/randomizedDelay';
import bestBuyCaNormalizeData from './bestBuyCaNormalizeData';

import saveAsJson from '../utils/saveAsJson';
import { promises as fs } from 'fs';
import path from 'path';

function buildBestBuySearchUrl({ query }: { query: string }): string {
  const apiUrlBase =
    'https://www.bestbuy.ca/api/v2/json/search?currentRegion=BC&lang=en-CA&page=1&pageSize=100&path=custom0productcondition%3ABrand%20New%3Bsoldandshippedby0enrchstring%3ABest%20Buy&query=query%20here&exp=labels%2Csearch_abtesting_personalization_epsilon%3Ab0%2Csearch_abtesting_personalization_zeta%3Ab1&isPLP=true&sortBy=price&sortDir=asc';
  const formattedQuery = formatQuery({ query, separator: '%20' });
  return apiUrlBase.replace('query%20here', formattedQuery);
}

async function fetchSearchAPI({
  apiUrl,
}: {
  apiUrl: string;
}): Promise<IBestBuySearchAPIResponse | null> {
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

    // console.log(
    //   `Best Buy Search API Called. Page: ${apiResponse.data.currentPage}. Results: ${apiResponse.data.products.length}.`
    // );

    return apiResponse;
  } catch (err) {
    console.error('Error fetching Best Buy data (Search):', err);
    return null;
  }
}

async function fetchAllSearchPages({
  query,
}: {
  query: string;
}): Promise<IBestBuySearchAPIData[] | null> {
  let allResponses: IBestBuySearchAPIData[] = [];

  const searchUrl: string = buildBestBuySearchUrl({ query });

  console.log('BB API Called. Fetching Page #1.');
  const firstApiResponse = await fetchSearchAPI({ apiUrl: searchUrl });

  if (!firstApiResponse) return null;

  allResponses.push(firstApiResponse.data);
  const { totalPages } = firstApiResponse.data;

  for (let i = 2; i <= totalPages; i++) {
    await randomizedDelay({ initialTime: 5000, finalTime: 10000 });
    const nextPageUrl = searchUrl.replace(`page=${i - 1}`, `page=${i}`);

    console.log(`BB Search API Called. Fetching Page #${i}.`);
    const response = await fetchSearchAPI({ apiUrl: nextPageUrl });
    if (response) allResponses.push(response.data);
  }

  return allResponses;
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

  // console.log(`✔ Created ${chunks.length} chunk(s) of SKUs`);
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
}): Promise<IBestBuyAvailabilityAPIResponse | null> {
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

    // console.log(
    //   `Best Buy Availability API Called. Results: ${apiResponse.data.availabilities.length}.`
    // );

    return apiResponse;
  } catch (err) {
    console.error('Error fetching Best Buy data (Availability):', err);
    return null;
  }
}

async function fetchAllAvailabilityPages({
  discoveredItems,
}: {
  discoveredItems: IDiscoverItem[];
}): Promise<IBestBuyAvailabilityAPIData[] | null> {
  let allAvailabilityResponses: IBestBuyAvailabilityAPIData[] = [];

  const skuChunks = chunkSkuStringsFromApiResponses({ discoveredItems });

  for (let i = 0; i < skuChunks.length; i++) {
    await randomizedDelay({ initialTime: 5000, finalTime: 10000 });
    const nextPageUrl: string = buildBestBuyAvailabilityUrl({
      skuChunk: skuChunks[i],
    });

    console.log(
      `BB Availability API Called. Fetching Chunk #${i + 1} / ${
        skuChunks.length
      }.`
    );

    const response = await fetchAvailabilityAPI({ apiUrl: nextPageUrl });
    if (response) allAvailabilityResponses.push(response.data);
  }

  return allAvailabilityResponses;
}

export default async function bestBuyCaSearch({
  query,
}: {
  query: string;
}): Promise<IDiscoverItem[] | null> {
  // Best Buy runs a lot of APIs to retrieve chunks of info.
  // Search API does not give all info. Only sku, name, url, price, main image, category ids
  // TO DO: Run item detail API (single sku) to get more images, model, brand, upc, availability
  // OPTIONAL TO DO: Setup crawler to run variants API -> This returns all related skus (different sizes, color, etc.)

  const allSearchResponses = await fetchAllSearchPages({ query });
  if (!allSearchResponses) return null;

  // For debbuging
  // const inputPath = path.resolve(__dirname, 'bestbuy-results.json');
  // const file = await fs.readFile(inputPath, 'utf-8');
  // const allSearchResponses: IBestBuySearchAPIData[] = JSON.parse(file);

  // await saveAsJson({
  //   fileName: 'bestbuy-results.json',
  //   toBeSaved: allSearchResponses,
  // });

  let discoveredItems: IDiscoverItem[] = bestBuyCaNormalizeData({
    type: 'search',
    discoveredItems: [],
    apiResponse: allSearchResponses,
  });

  const allAvailabilityResponses = await fetchAllAvailabilityPages({
    discoveredItems,
  });
  if (!allAvailabilityResponses) return null;

  discoveredItems = bestBuyCaNormalizeData({
    type: 'availability',
    discoveredItems,
    apiResponse: allAvailabilityResponses,
  });

  return discoveredItems;
}
