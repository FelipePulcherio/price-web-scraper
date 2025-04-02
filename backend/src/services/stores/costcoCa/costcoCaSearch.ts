import { CookieJar } from 'tough-cookie';
import { axiosClient } from '../storesApiClient';

// Cookie jar per store
const costcoCaJar = new CookieJar();

export default async function costcoCaSearchByQuery() {
  try {
    // Retrieve cookies from main site: https://www.costco.ca/
    const url = 'https://www.costco.ca/s?keyword=tv%20C65';
    const initialResponse = await axiosClient.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
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
    if (!apiKeyMatch) throw new Error('API key not found');

    const apiKey = apiKeyMatch[1];

    // console.log('Extracted API Key:', apiKey);

    const cookieHeader = await costcoCaJar.getCookieString(
      'https://www.costco.ca'
    );

    // console.log('Cookies:', cookieHeader);

    // Actual api for searching an item
    // Needs Headers, Cookies and X-Api-Key
    // Works by string (with + separator) and id (refer to "item_number")
    const apiUrl =
      'https://search.costco.ca/api/apps/www_costco_ca/query/www_costco_ca_search?expoption=def&q=tv+lg+65&locale=en-CA&start=0&expand=false&loc=656-bd%2C548-wh%2C559-wm%2C792-dz%2C792-wm%2C894_0-cwt%2C894_0-edi%2C894_0-membership%2C894_0-mpt%2C894_0-otw%2C894_0-spc%2C894_1-edi%2C894_1-mpt%2C946-wm%2C9894-wcs%2C993-dz%2C993-wm&whloc=548-wh';

    const apiResponse = await axiosClient.get(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Origin: 'https://www.costco.ca',
        Referer: 'https://www.costco.ca/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'X-Api-Key': apiKey,
        Cookie: cookieHeader,
      },
    });

    console.log('Costco API Response:', apiResponse.data);

    return apiResponse.data;
  } catch (err) {
    console.error('Error fetching Costco data:', err);
  }
}
