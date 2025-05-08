import { axiosClient } from '../storesApiClient';
import qs from 'qs';
import {
  ICanadaComputersSearchAPIResponse,
  ICanadaComputersSearchAPIData,
} from './types';
import { IDiscoverItem } from '@/interfaces/interfaces';
import utils from '../utils';
import canadaComputersCaNormalizeData from './canadaComputersCaNormalizeData';

import { promises as fs } from 'fs';
import path from 'path';

function buildCanadaComputersSearchUrl(): string {
  return 'https://www.canadacomputers.com/en/search';
}

function buildCanadaComputersApiBody({
  query,
  pageSize,
}: {
  query: string;
  pageSize: number;
}) {
  const formattedQuery = utils.formatQuery({ query, separator: '+' });
  const body = {
    s: formattedQuery,
    resultsPerPage: pageSize,
  };
  return qs.stringify(body);
}

async function fetchSearchAPI({
  query,
  pageSize,
}: {
  query: string;
  pageSize: number;
}): Promise<ICanadaComputersSearchAPIResponse> {
  // Api for searching an item
  // Needs Headers + Body
  // Works by string (with + separator) and id (refer to "reference")
  const apiUrl: string = buildCanadaComputersSearchUrl();
  const apiBody = buildCanadaComputersApiBody({ query, pageSize });

  try {
    const apiResponse: ICanadaComputersSearchAPIResponse =
      await axiosClient.post(apiUrl, apiBody, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/javascript, */*',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
      });

    console.log(`CANADA COMPUTERS CA: Search API Called.`);

    return apiResponse;
  } catch (err) {
    throw new utils.FetchFailedError(
      'Failed to fetch data from CANADA COMPUTERS CA search.',
      err
    );
  }
}

export default async function canadaComputersCaSearch({
  query,
}: {
  query: string;
}): Promise<IDiscoverItem[] | null> {
  const pageSize: number = 1000;

  const allSearchResponses = await fetchSearchAPI({ query, pageSize });
  if (!allSearchResponses) return null;

  // For debbuging
  // const inputPath = path.resolve(__dirname, 'canadacomputers-results.json');
  // const file = await fs.readFile(inputPath, 'utf-8');
  // const allSearchResponses: IBestBuySearchAPIData[] = JSON.parse(file);

  // await utils.saveAsJson({
  //   fileName: 'canadacomputers-results.json',
  //   toBeSaved: allSearchResponses.data,
  // });

  let discoveredItems: IDiscoverItem[] = canadaComputersCaNormalizeData({
    discoveredItems: [],
    apiResponse: allSearchResponses.data,
  });

  return discoveredItems;
}
