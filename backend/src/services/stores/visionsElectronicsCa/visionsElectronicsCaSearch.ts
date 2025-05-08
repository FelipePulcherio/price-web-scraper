import { axiosClient } from '../storesApiClient';
import {
  IVisionsElectronicsAuthAPIResponse,
  IVisionsElectronicsSearchAPIResponse,
} from './types';
import { IDiscoverItem } from '@/interfaces/interfaces';
import visionsElectronicsCaNormalizeData from './visionsElectronicsCaNormalizeData';

import utils from '../utils';
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

  const firstApiResponse = await fetchSearchAPI({
    query,
    pageSize,
  });

  // await utils.saveAsJson({
  //   fileName: 'visionselectronics-results.json',
  //   toBeSaved: firstApiResponse.data,
  // });

  let discoveredItems: IDiscoverItem[] = visionsElectronicsCaNormalizeData({
    discoveredItems: [],
    apiResponse: firstApiResponse.data,
  });

  return discoveredItems;
}
