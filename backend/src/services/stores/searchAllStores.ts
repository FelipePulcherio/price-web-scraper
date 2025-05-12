import axios from 'axios';
import utils from './utils';
import { IDiscoverItem } from '@/interfaces/interfaces';

import bestBuyCaSearch from './bestBuyCa/bestBuyCaSearch';
import canadaComputersCaSearch from './canadaComputersCa/canadaComputersCaSearch';
import costcoCaSearch from './costcoCa/costcoCaSearch';
import londonDrugsCaSearch from './londonDrugsCa/londonDrugsCaSearch';
import visionsElectronicsCaSearch from './visionsElectronicsCa/visionsElectronicsCaSearch';

function isAuthRelatedError(error: unknown): boolean {
  if (
    error instanceof utils.FetchFailedError &&
    axios.isAxiosError(error.cause)
  ) {
    const status = error.cause.response?.status;
    return status === 401 || status === 403;
  }

  return false;
}

function isRetriableAxiosStatus(
  error: unknown,
  retriableStatusCodes: number[]
): boolean {
  if (axios.isAxiosError(error)) {
    return retriableStatusCodes.includes(error.response?.status ?? 0);
  }
  return false;
}

function isRetriableError(err: unknown): boolean {
  if (err instanceof utils.AuthError || err instanceof utils.ParsingError) {
    return true;
  }

  if (
    err instanceof utils.FetchFailedError &&
    isRetriableAxiosStatus(err.cause, [429, 499, 500])
  ) {
    return true;
  }

  return false;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  storeName: string
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;

      const canRetry = isRetriableError(err);

      if (attempt === retries || !canRetry) throw err;

      console.warn(
        `${storeName}: Retry attempt #${attempt}/${retries} failed. Retrying in a few seconds.`
      );
      await utils.randomizedDelay({ initialTime: 5000, finalTime: 10000 });
    }
  }
  throw new Error('Unreachable code in retryWithBackoff.');
}

async function tryStoreWithOptionalAuth(
  storeFn: (args: {
    checkAuth: boolean;
    query: string;
  }) => Promise<IDiscoverItem[]>,
  query: string,
  retries: number = 3,
  storeName: string
): Promise<IDiscoverItem[]> {
  try {
    const items = await retryWithBackoff(
      () => storeFn({ checkAuth: false, query }),
      retries,
      storeName
    );
    return items ?? ([] as IDiscoverItem[]);
  } catch (err) {
    if (isAuthRelatedError(err)) {
      try {
        const items = await retryWithBackoff(
          () => storeFn({ checkAuth: true, query }),
          retries,
          storeName
        );
        return items ?? ([] as IDiscoverItem[]);
      } catch (err) {
        console.error(
          `${storeName}: Auth retry failed. Results not obtained.`,
          err
        );
        return [] as IDiscoverItem[];
      }
    }
    console.error(`${storeName}: Store failed. Results not obtained.`, err);
    return [] as IDiscoverItem[];
  }
}

async function retryLayer({
  query,
}: {
  query: string;
}): Promise<IDiscoverItem[]> {
  const results: IDiscoverItem[][] = (await Promise.all([
    // Stores without auth
    retryWithBackoff(() => bestBuyCaSearch({ query }), 3, 'BEST BUY CA').catch(
      () => []
    ),
    retryWithBackoff(
      () => canadaComputersCaSearch({ query }),
      3,
      'CANADA COMPUTERS CA'
    ).catch(() => []),

    // Stores with optional auth fallback
    tryStoreWithOptionalAuth(londonDrugsCaSearch, query, 3, 'LONDON DRUGS CA'),
    tryStoreWithOptionalAuth(costcoCaSearch, query, 3, 'COSTCO CA'),
    tryStoreWithOptionalAuth(
      visionsElectronicsCaSearch,
      query,
      3,
      'VISIONS ELECTRONICS CA'
    ),
  ])) as IDiscoverItem[][];

  return results.flat();
}

export default async function searchAllStores({
  query,
}: {
  query: string;
}): Promise<IDiscoverItem[]> {
  const allResults: IDiscoverItem[] = await retryLayer({ query });
  return allResults;
}
