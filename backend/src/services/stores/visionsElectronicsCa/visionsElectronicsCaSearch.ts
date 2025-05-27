import { axiosClient } from '../storesApiClient';
import {
  IVisionsElectronicsAuthAPIResponse,
  IVisionsElectronicsSearchAPIResponse,
  IVisionsElectronicsDiscountAPIResponse,
  IVisionsElectronicsDiscountAPIData,
} from './types';
import { IDiscoverItem } from '@/interfaces/interfaces';
import utils from '../utils';
import visionsElectronicsCaNormalizeData from './visionsElectronicsCaNormalizeData';

import { promises as fs } from 'fs';
import path from 'path';

let applicationId: string = 'ROBTRSQZ7A';
let apiKey: string =
  'MjgzZmI5N2QzYjUwNTQ1MTI5NDY2NmJkY2YyZTUwZDdiMDEwMjQ5MjEzMjBkMzZmOWVkN2Y5ODU5NmE5OTM1MHRhZ0ZpbHRlcnM9';

interface getAuthReturn {
  applicationId: string;
  apiKey: string;
}

async function getAuth(): Promise<getAuthReturn> {
  try {
    const url = 'https://www.visions.ca/';
    const authResponse: IVisionsElectronicsAuthAPIResponse =
      await axiosClient.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
        },
      });

    // Extract ApplicationId and apiKey from response HTML
    const match = authResponse.data.match(
      /"extensionVersion":"\d+\.\d+\.\d+","applicationId":"(.*?)","indexName":"visions_productiondefault","apiKey":"(.*?)"/
    );

    if (!match) {
      throw new utils.ParsingError(
        'Failed to get Application ID or API Key from VISIONS ELECTRONICS CA.'
      );
    }

    applicationId = match[1];
    apiKey = match[2];

    console.log('Extracted ApplicationId:', applicationId);
    console.log('Extracted Api Key:', apiKey);

    return { applicationId, apiKey };
  } catch (err) {
    throw new utils.AuthError(
      'Failed to get auth from VISIONS ELECTRONICS CA.',
      err
    );
  }
}

function buildVisionsElectronicsSearchUrl(): string {
  return `https://robtrsqz7a-dsn.algolia.net/1/indexes/*/queries`;
}

function buildVisionsElectronicsApiBody({
  query,
  pageSize,
}: {
  query: string;
  pageSize: number;
}) {
  const body = {
    requests: [
      {
        indexName: 'visions_productiondefault_products',
        params: `hitsPerPage=${pageSize}&page=0&query=${query}`,
      },
    ],
  };
  return body;
}

async function fetchSearchAPI({
  query,
  pageSize,
}: {
  query: string;
  pageSize: number;
}): Promise<IVisionsElectronicsSearchAPIResponse> {
  // Api for searching an item
  // Needs Headers + Application ID + API Key + Body
  // Works by string (without separator)

  const apiUrl: string = buildVisionsElectronicsSearchUrl();
  const apiBody = buildVisionsElectronicsApiBody({ query, pageSize });

  try {
    const apiResponse: IVisionsElectronicsSearchAPIResponse =
      await axiosClient.post(apiUrl, apiBody, {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
          'x-algolia-application-id': applicationId,
          'x-algolia-api-key': apiKey,
        },
      });

    console.log(`VISIONS ELECTRONICS CA: Search API Called.`);

    return apiResponse;
  } catch (err) {
    throw new utils.FetchFailedError(
      'Failed to fetch data from VISIONS ELECTRONICS CA search.',
      err
    );
  }
}

async function fetchDiscountAPI({
  objectId,
}: {
  objectId: string;
}): Promise<IVisionsElectronicsDiscountAPIData> {
  // Api for getting an item special discount

  const apiUrl: string = `https://www.visions.ca/wpproductlabels/product/labels/product_id/${objectId}`;

  try {
    const apiResponse: IVisionsElectronicsDiscountAPIResponse =
      await axiosClient.get(apiUrl, {
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
      });

    console.log(`VISIONS ELECTRONICS CA: Discount API Called.`);

    return {
      ...apiResponse.data,
      objectId,
    };
  } catch (err) {
    throw new utils.FetchFailedError(
      'Failed to fetch data from VISIONS ELECTRONICS CA discount.',
      err
    );
  }
}

function extractIdStringsFromApiResponses({
  discoveredItems,
}: {
  discoveredItems: IDiscoverItem[];
}): string[] {
  const allIds: string[] = [];

  discoveredItems.forEach((item) => {
    const specificId = item.stores[0].specificId;
    if (specificId) {
      allIds.push(specificId);
    }
  });

  // console.log(`VISIONS ELECTRONICS CA: Extracted ${allIds.length} IDs.`);

  return allIds;
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  id?: string
): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[ID: ${id}] Attempt ${attempt + 1} failed.`);
      console.error(err);
      attempt++;
      if (attempt > retries) {
        console.error(`[ID: ${id}] Failed after ${retries + 1} attempts.`, err);
        throw err;
      }
      await utils.randomizedDelay({ initialTime: 2000, finalTime: 4000 });
    }
  }

  throw new Error('Unreachable code in fetchWithRetry');
}

async function fetchAllDiscountPages({
  discoveredItems,
}: {
  discoveredItems: IDiscoverItem[];
}): Promise<IVisionsElectronicsDiscountAPIData[]> {
  const ids = extractIdStringsFromApiResponses({ discoveredItems });
  // console.dir(ids, { maxArrayLength: null });
  const allDiscountResponses: IVisionsElectronicsDiscountAPIData[] = [];

  for (const id of ids) {
    try {
      const result = await fetchWithRetry(
        () => fetchDiscountAPI({ objectId: id }),
        2,
        id
      );
      allDiscountResponses.push(result);
    } catch (err) {
      console.warn(`[ID: ${id}] Failed to fetch after 3 attempts.`);
      continue;
    }

    // Optional: add a small wait between requests to reduce proxy pressure
    await utils.randomizedDelay({ initialTime: 300, finalTime: 700 });
  }

  console.log(
    `VISIONS ELECTRONICS CA: Successfully fetched ${allDiscountResponses.length}/${ids.length} discount pages.`
  );

  return allDiscountResponses;
}

export default async function visionsElectronicsCaSearch({
  checkAuth,
  query,
}: {
  checkAuth: boolean;
  query: string;
}): Promise<IDiscoverItem[]> {
  const pageSize: number = 1000;
  if (checkAuth) {
    await getAuth();
  }

  const allSearchResponses = await fetchSearchAPI({
    query,
    pageSize,
  });

  let discoveredItems: IDiscoverItem[] = visionsElectronicsCaNormalizeData({
    type: 'search',
    discoveredItems: [],
    apiResponse: allSearchResponses.data,
  });

  // await utils.saveAsJson({
  //   fileName: 'visionselectronics-search.json',
  //   toBeSaved: allSearchResponses.data,
  // });

  const allDiscountResponses = await fetchAllDiscountPages({
    discoveredItems,
  });

  discoveredItems = visionsElectronicsCaNormalizeData({
    type: 'discount',
    discoveredItems,
    apiResponse: allDiscountResponses,
  });

  return discoveredItems;
}
