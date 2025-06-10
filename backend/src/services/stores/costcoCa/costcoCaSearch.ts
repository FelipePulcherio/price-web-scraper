import { CookieJar } from 'tough-cookie';
import { decodoAxiosClient as axiosClient } from '../storesApiClient';
import {
  ICostcoAuthAPIResponse,
  ICostcoSearchAPIResponse,
  ICostcoSearchAPIData,
} from './types';
import { IDiscoverItem } from '@/interfaces/interfaces';
import utils from '../utils';
import costcoCaNormalizeData from './costcoCaNormalizeData';

const costcoCaJar = new CookieJar();
let apiKey: string = '134a4023-68d5-4138-8e03-8353667d5fb3';

async function getAuth(): Promise<string> {
  try {
    // Retrieve cookies from main site: https://www.costco.ca/
    const url = 'https://www.costco.ca/s?keyword=tv%20C65';
    const initialResponse: ICostcoAuthAPIResponse = await axiosClient.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
      },
    });

    // console.log(initialResponse.headers['set-cookie']);

    const cookieHeader = initialResponse.headers['set-cookie'];
    if (cookieHeader) {
      cookieHeader.forEach((cookie: string) =>
        costcoCaJar.setCookieSync(cookie, 'https://www.costco.ca')
      );
    }

    if (!cookieHeader) {
      throw new utils.CookieExtractionError(
        'Cookies not found from COSTCO CA auth response.'
      );
    }

    // Extract API key from response HTML
    const apiKeyMatch = initialResponse.data.match(
      /{\\\"key\\\":\\\"apikey\\\",\\\"value\\\":\\\"(.*?)\\\"}/
    );

    if (!apiKeyMatch) {
      throw new utils.ParsingError('Failed to get api key from COSTCO CA.');
    }

    apiKey = apiKeyMatch[1];

    // console.log('Extracted API Key:', apiKey);

    return apiKey;
  } catch (err) {
    throw new utils.AuthError('Failed to get auth from COSTCO CA.', err);
  }
}

function buildCostcoCaSearchUrl({
  query,
  start,
}: {
  query: string;
  start: number;
}): string {
  const apiUrlBase = `https://search.costco.ca/api/apps/www_costco_ca/query/www_costco_ca_search?expoption=def&q=query+here&locale=en-CA&start=${start}&expand=false&loc=656-bd%2C548-wh%2C559-wm%2C792-dz%2C792-wm%2C894_0-cwt%2C894_0-edi%2C894_0-membership%2C894_0-mpt%2C894_0-otw%2C894_0-spc%2C894_1-edi%2C894_1-mpt%2C946-wm%2C9894-wcs%2C993-dz%2C993-wm&whloc=548-wh&fq=%7B!tag%3Ditem_program_eligibility%7Ditem_program_eligibility%3A(%22ShipIt%22)`;

  const formattedQuery = utils.formatQuery({ query, separator: '+' });
  return apiUrlBase.replace('query+here', formattedQuery);
}

async function fetchSearchAPI({
  checkAuth,
  apiUrl,
}: {
  checkAuth: boolean;
  apiUrl: string;
}): Promise<ICostcoSearchAPIResponse> {
  // Actual api for searching an item
  // Needs Headers, Cookies and X-Api-Key
  // Works by string (with + separator) and id (refer to "item_number")
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      Connection: 'keep-alive',
      Origin: 'https://www.costco.ca',
      Referer: 'https://www.costco.ca/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      'X-Api-Key': apiKey,
    };

    if (checkAuth) {
      try {
        headers.Cookie = await costcoCaJar.getCookieString(
          'https://www.costco.ca'
        );
      } catch (err) {
        throw new utils.CookieExtractionError(
          'Failed to retrieve COSTCO CA cookies from jar.'
        );
      }
    }

    const apiResponse: ICostcoSearchAPIResponse = await axiosClient.get(
      apiUrl,
      {
        method: 'GET',
        headers,
      }
    );

    // console.log(`COSTCO CA: Search API Called.`);

    return apiResponse;
  } catch (err) {
    throw new utils.FetchFailedError(
      'Failed to fetch data from COSTCO CA search.',
      err
    );
  }
}

async function fetchAllSearchPages({
  checkAuth,
  query,
}: {
  checkAuth: boolean;
  query: string;
}): Promise<ICostcoSearchAPIData[]> {
  const pageSize: number = 24;
  let allResponses: ICostcoSearchAPIData[] = [];

  const searchUrl: string = buildCostcoCaSearchUrl({ query, start: 0 });

  console.log('COSTCO CA: Search API Called. Fetching Page #1.');
  const firstApiResponse = await fetchSearchAPI({
    checkAuth,
    apiUrl: searchUrl,
  });

  allResponses.push(firstApiResponse.data.response);

  const totalPages = Math.ceil(
    firstApiResponse.data.response.numFound / pageSize
  );

  for (let i = 1; i < totalPages; i++) {
    await utils.randomizedDelay({ initialTime: 1500, finalTime: 3000 });

    const nextPageStart = i * pageSize;
    const nextPageUrl = buildCostcoCaSearchUrl({ query, start: nextPageStart });
    let success = false;
    let attempts = 0;

    // Blind retry if a page fails for whatever reason
    while (!success && attempts < 3) {
      try {
        console.log(
          `COSTCO CA: Search API Called. Fetching Page #${i + 1}. Attempt ${
            attempts + 1
          }`
        );
        const response = await fetchSearchAPI({
          checkAuth,
          apiUrl: nextPageUrl,
        });
        if (response) {
          allResponses.push(response.data.response);
          success = true;
        }
      } catch (err) {
        attempts++;
        if (attempts === 3) {
          console.warn(
            `COSTCO CA: Failed to fetch page ${i} after 3 attempts. Skipping.`
          );
        } else {
          await utils.randomizedDelay({ initialTime: 1500, finalTime: 3000 });
        }
      }
    }
  }

  return allResponses;
}

export default async function costcoCaSearch({
  checkAuth,
  query,
}: {
  checkAuth: boolean;
  query: string;
}): Promise<IDiscoverItem[]> {
  if (checkAuth) {
    await getAuth();
  }

  const allSearchResponses = await fetchAllSearchPages({ checkAuth, query });

  const discoveredItems: IDiscoverItem[] = costcoCaNormalizeData({
    apiResponse: allSearchResponses,
  });

  return discoveredItems;
}
