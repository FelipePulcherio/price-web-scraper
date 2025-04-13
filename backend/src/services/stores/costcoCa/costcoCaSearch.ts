import { CookieJar } from 'tough-cookie';
import { axiosClient } from '../storesApiClient';
import { ICostcoAuthAPI, ICostcoSearchAPI } from './types';
import { IDiscoverItem } from '@/interfaces/interfaces';
import formatQuery from '../utils/formatQuery';
import costcoCaNormalizeData from './costcoCaNormalizeData';

const costcoCaJar = new CookieJar();
let apiKey: string = '';

async function getAuth(): Promise<string | null> {
  try {
    // Retrieve cookies from main site: https://www.costco.ca/
    const url = 'https://www.costco.ca/s?keyword=tv%20C65';
    const initialResponse: ICostcoAuthAPI = await axiosClient.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
      },
    });

    // console.log(initialResponse.headers['set-cookie']);

    const setCookieHeader = initialResponse.headers['set-cookie'];
    if (setCookieHeader) {
      setCookieHeader.forEach((cookie: string) =>
        costcoCaJar.setCookieSync(cookie, 'https://www.costco.ca')
      );
    }

    // Extract API key from response HTML
    const apiKeyMatch = initialResponse.data.match(
      /{\\\"key\\\":\\\"apikey\\\",\\\"value\\\":\\\"(.*?)\\\"}/
    );

    if (!apiKeyMatch) {
      throw new Error('API key not found.');
    }

    const apiKey = apiKeyMatch[1];

    // console.log('Extracted API Key:', apiKey);

    return apiKey;
  } catch (err) {
    console.error('Error getting Costco auth:', err);
    return null;
  }
}

export default async function costcoCaSearch({
  checkAuth,
  query,
}: {
  checkAuth: boolean;
  query: string;
}): Promise<IDiscoverItem[] | null> {
  if (checkAuth) {
    const newApiKey = await getAuth();

    if (!newApiKey) {
      return null;
    }

    apiKey = newApiKey;
  }

  const cookieHeader = await costcoCaJar.getCookieString(
    'https://www.costco.ca'
  );

  // console.log('Cookies:', cookieHeader);

  try {
    // Actual api for searching an item
    // Needs Headers, Cookies and X-Api-Key
    // Works by string (with + separator) and id (refer to "item_number")
    const apiUrlBase =
      'https://search.costco.ca/api/apps/www_costco_ca/query/www_costco_ca_search?expoption=def&q=query+here&locale=en-CA&start=0&expand=false&loc=656-bd%2C548-wh%2C559-wm%2C792-dz%2C792-wm%2C894_0-cwt%2C894_0-edi%2C894_0-membership%2C894_0-mpt%2C894_0-otw%2C894_0-spc%2C894_1-edi%2C894_1-mpt%2C946-wm%2C9894-wcs%2C993-dz%2C993-wm&whloc=548-wh&fq=%7B!tag%3Ditem_program_eligibility%7Ditem_program_eligibility%3A(%22ShipIt%22)';

    const formattedQuery = formatQuery({ query, separator: '+' });

    const apiUrl = apiUrlBase.replace('query+here', formattedQuery);

    const apiResponse: ICostcoSearchAPI = await axiosClient.get(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        Connection: 'keep-alive',
        Origin: 'https://www.costco.ca',
        Referer: 'https://www.costco.ca/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'X-Api-Key': apiKey,
        Cookie: cookieHeader,
      },
    });

    const discoveredItems: IDiscoverItem[] = costcoCaNormalizeData({
      apiResponse,
    });

    console.log('Costco API Response:');
    console.dir(discoveredItems, { depth: null });

    return discoveredItems;
  } catch (err) {
    console.error('Error fetching Costco data:', err);
    return null;
  }
}
