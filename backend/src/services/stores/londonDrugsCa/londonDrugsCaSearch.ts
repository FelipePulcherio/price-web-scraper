import { CookieJar } from 'tough-cookie';
import { axiosClient } from '../storesApiClient';
import {
  ILondonDrugsAuthAPIResponse,
  ILondonDrugsSearchAPIData,
  ILondonDrugsSearchAPIResponse,
} from './types';
import { IDiscoverItem } from '@/interfaces/interfaces';
import utils from '../utils';
import londonDrugsCaParseData from './londonDrugsCaParseData';
import londonDrugsCaNormalizeData from './londonDrugsCaNormalizeData';

import { promises as fs } from 'fs';
import path from 'path';

const londondDrugsCaJar = new CookieJar();

async function getAuth(): Promise<void> {
  try {
    // Retrieve cookies from auth api
    const url = 'https://www.londondrugs.com/api/auth/session';
    const apiResponse: ILondonDrugsAuthAPIResponse = await axiosClient.get(
      url,
      {
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

    // console.log(apiResponse.headers['set-cookie']);

    const cookieHeader = apiResponse.headers['set-cookie'];
    if (cookieHeader) {
      cookieHeader.forEach((cookie: string) =>
        londondDrugsCaJar.setCookieSync(cookie, 'https://www.londondrugs.com')
      );
    }

    if (!cookieHeader) {
      throw new utils.CookieExtractionError(
        'Cookies not found from LONDON DRUGS CA auth response.'
      );
    }

    // console.log('LONDON DRUGS CA: Auth acquired.');

    return;
  } catch (err) {
    throw new utils.AuthError('Failed to get auth from LONDON DRUGS CA.', err);
  }
}

function buildLondonDrugsSearchUrl({
  query,
  pageSize,
}: {
  query: string;
  pageSize: number;
}): string {
  const apiUrlBase = `https://www.londondrugs.com/search?pageSize=${pageSize}&q=query%20here`;
  const formattedQuery = utils.formatQuery({ query, separator: '%20' });
  return apiUrlBase.replace('query%20here', formattedQuery);
}

async function fetchSearchAPI({
  apiUrl,
  checkAuth,
}: {
  apiUrl: string;
  checkAuth: boolean;
}): Promise<ILondonDrugsSearchAPIResponse> {
  // Api for searching an item
  // Needs Headers
  // Works by string (with %20 separator) and id (refer to "productCode")

  try {
    const headers: Record<string, string> = {
      Accept: '*/*',
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      Rsc: '1',
    };

    if (checkAuth) {
      try {
        headers.Cookie = await londondDrugsCaJar.getCookieString(
          'https://www.londondrugs.com'
        );
      } catch (err) {
        throw new utils.CookieExtractionError(
          'Failed to retrieve LONDON DRUGS CA cookies from jar.'
        );
      }
    }

    const apiResponse: ILondonDrugsSearchAPIResponse = await axiosClient.get(
      apiUrl,
      {
        method: 'GET',
        headers,
      }
    );

    console.log(`LONDON DRUGS CA: Search API Called.`);

    return apiResponse;
  } catch (err) {
    throw new utils.FetchFailedError(
      'Failed to fetch data from LONDON DRUGS CA search.',
      err
    );
  }
}

export default async function londonDrugsCaSearch({
  checkAuth,
  query,
}: {
  checkAuth: boolean;
  query: string;
}): Promise<IDiscoverItem[]> {
  const pageSize: number = 1600;
  if (checkAuth) {
    await getAuth();
  }

  const searchUrl: string = buildLondonDrugsSearchUrl({ query, pageSize });
  const firstApiResponse = await fetchSearchAPI({
    apiUrl: searchUrl,
    checkAuth,
  });

  // await fs.writeFile('londondrugs-results.txt', firstApiResponse.data, 'utf-8');

  const parsedData: ILondonDrugsSearchAPIData = londonDrugsCaParseData({
    apiResponse: firstApiResponse.data,
    pageSize,
  });

  // await utils.saveAsJson({
  //   fileName: 'londondrugs-parsed.json',
  //   toBeSaved: parsedData,
  // });
  // console.dir(JSON.parse(parsedData), { depth: null });

  let discoveredItems: IDiscoverItem[] = londonDrugsCaNormalizeData({
    discoveredItems: [],
    apiResponse: parsedData,
  });

  return discoveredItems;
}
