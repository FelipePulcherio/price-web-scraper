import axios from 'axios';
import utils from './utils';
import storesConfig from './config';
import { IDiscoverItem, IDiscoverImage, IStore } from '@/interfaces/interfaces';

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
    isRetriableAxiosStatus(err.cause, [408, 429, 499, 500, 502, 504, 522])
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

function normalizeModel(model: string): string {
  return model.replace(/[-\s]/g, '').toLowerCase();
}

function modelsLooselyMatch(a: string, b: string): boolean {
  const aNorm = normalizeModel(a);
  const bNorm = normalizeModel(b);

  const shorter = aNorm.length <= bNorm.length ? aNorm : bNorm;
  const longer = aNorm.length > bNorm.length ? aNorm : bNorm;

  // Require a minimum length to avoid false positive matches
  if (shorter.length < 6) return false;

  // Accept prefix or strong substring match
  return longer.startsWith(shorter) || longer.includes(shorter);
}

function isSameProduct(a: IDiscoverItem, b: IDiscoverItem): boolean {
  // Rule 0: Do not merge items from the same store
  const storeNamesA = new Set(a.stores.map((s) => s.name.toLowerCase()));
  for (const store of b.stores) {
    if (storeNamesA.has(store.name.toLowerCase())) {
      return false;
    }
  }

  // Rule 1: Exact model match
  if (a.model && b.model && a.model.toLowerCase() === b.model.toLowerCase()) {
    return true;
  }

  // Rule 1.5: Looser model match (handles suffixes, dashes, etc.)
  if (a.model && b.model && modelsLooselyMatch(a.model, b.model)) {
    return true;
  }

  // Rule 2: Check if b.model appears inside a.name (or vice versa)
  if (b.model && a.name.toLowerCase().includes(b.model.toLowerCase())) {
    return true;
  }
  if (a.model && b.name.toLowerCase().includes(a.model.toLowerCase())) {
    return true;
  }

  // Rule 3: Weak fallback: normalized name + brand match
  const aKey = `${a.brand?.toLowerCase().trim() ?? ''}_${a.name
    .toLowerCase()
    .trim()}`;
  const bKey = `${b.brand?.toLowerCase().trim() ?? ''}_${b.name
    .toLowerCase()
    .trim()}`;
  return aKey === bKey;
}

function mergeItemData(
  base: IDiscoverItem,
  incoming: IDiscoverItem
): IDiscoverItem {
  // Merge stores (move incoming price into store object)
  const incomingStores: IStore[] = incoming.stores.map((store) => ({
    ...store,
    price: incoming.price,
  }));

  // Merge images, avoiding duplicates
  const imageUrls = new Set(base.images?.map((img) => img.url) ?? []);
  const newImages: IDiscoverImage[] = [...(base.images ?? [])];

  for (const img of incoming.images ?? []) {
    if (!imageUrls.has(img.url)) {
      newImages.push(img);
      imageUrls.add(img.url);
    }
  }

  const updated: IDiscoverItem = {
    ...base,
    stores: [...base.stores, ...incomingStores],
    images: newImages,
  };

  // Enrich name (prioritize store source)
  updated.name = prioritizeName(base, incoming);

  // Enrich model/brand (only if missing in base)
  if (!base.model)
    updated.model = prioritizeModelOrBrand('model', base, incoming);
  if (!base.brand)
    updated.brand = prioritizeModelOrBrand('brand', base, incoming);

  delete updated.price;

  return updated;
}

function getSourcePriority(storeName: string, list: string[]): number {
  const index = list.indexOf(storeName.toUpperCase());
  return index === -1 ? list.length : index;
}

function prioritizeName(a: IDiscoverItem, b: IDiscoverItem): string {
  const aPriority = getSourcePriority(
    a.stores[0].name,
    storesConfig.priority.storeName
  );
  const bPriority = getSourcePriority(
    b.stores[0].name,
    storesConfig.priority.storeName
  );
  return aPriority <= bPriority ? a.name : b.name;
}

function prioritizeModelOrBrand(
  field: 'model' | 'brand',
  a: IDiscoverItem,
  b: IDiscoverItem
): string | undefined {
  const aValue = a[field];
  const bValue = b[field];

  if (aValue && !bValue) return aValue;
  if (!aValue && bValue) return bValue;

  const aPriority = getSourcePriority(
    a.stores[0].name,
    storesConfig.priority.modelBrand
  );
  const bPriority = getSourcePriority(
    b.stores[0].name,
    storesConfig.priority.modelBrand
  );

  return aPriority <= bPriority ? aValue : bValue;
}

function deduplicationLayer(items: IDiscoverItem[]): IDiscoverItem[] {
  const merged: IDiscoverItem[] = [];

  for (const incoming of items) {
    const matchIndex = merged.findIndex((existing) =>
      isSameProduct(existing, incoming)
    );

    if (matchIndex === -1) {
      // Move price into store object
      const storeWithPrice = incoming.stores.map((store) => ({
        ...store,
        price: incoming.price,
      }));

      const cleaned: IDiscoverItem = {
        ...incoming,
        stores: storeWithPrice,
      };

      delete cleaned.price;
      merged.push(cleaned);
    } else {
      // Merge with existing
      const existing = merged[matchIndex];
      merged[matchIndex] = mergeItemData(existing, incoming);
    }
  }

  console.log(
    `✔ Deduplication complete: input ${items.length} → output ${merged.length}`
  );
  return merged;
}

export default async function searchAllStores({
  query,
}: {
  query: string;
}): Promise<IDiscoverItem[]> {
  const allRawResults: IDiscoverItem[] = await retryLayer({ query });

  const mergedResults: IDiscoverItem[] = deduplicationLayer(allRawResults);

  // await utils.saveAsJson({
  //   fileName: 'merged-results.json',
  //   toBeSaved: mergedResults,
  // });

  return mergedResults;
}
