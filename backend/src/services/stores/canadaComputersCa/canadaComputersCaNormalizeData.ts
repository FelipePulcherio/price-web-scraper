import {
  IDiscoverStore,
  IDiscoverImage,
  IDiscoverItem,
  IDiscoverShortCategory,
} from '@/interfaces/interfaces';
import { ICanadaComputersSearchAPIData, ICanadaComputersImage } from './types';
import storesConfig from '../config';

function containsIgnoredWord(name: string): boolean {
  return storesConfig.filters.ignoreKeywords.some((word) =>
    name.toLowerCase().includes(word.toLowerCase())
  );
}

function extractImages(images: ICanadaComputersImage[]): IDiscoverImage[] {
  const originUrls = new Set<string>();

  images.forEach((img) => {
    Object.values(img.bySize).forEach((sizeVariant) => {
      if (sizeVariant.origin_url) {
        originUrls.add(sizeVariant.origin_url);
      }
    });
  });

  return Array.from(originUrls).map((referenceUrl) => ({ referenceUrl }));
}

function normalizeSearchData({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: ICanadaComputersSearchAPIData;
}): IDiscoverItem[] {
  apiResponse.products.forEach((product) => {
    // Data to be ignored
    if (
      product.active !== 1 ||
      !product.stock_availability.online ||
      containsIgnoredWord(product.name)
    ) {
      // console.log(
      //   `⛔ Filtered out: ${product.id} (${product.reference}) - ${product.name}`
      // );
      return;
    }

    const store: IDiscoverStore[] = [
      {
        name: 'CANADA COMPUTERS CA',
        url: product.url,
        specificId: product.reference,
      },
    ];

    // TO DO: Category mapping for CANADA COMPUTERS CA
    const discoveredCategory: IDiscoverShortCategory[] = [
      {
        name: 'DEFAULT',
        hasDepth: true,
      },
    ];

    const discoveredSubCategory: IDiscoverShortCategory[] = [
      {
        name: 'DEFAULT',
        hasDepth: true,
      },
    ];

    const discoveredSubSubCategory: IDiscoverShortCategory[] = [
      {
        name: 'DEFAULT',
        hasDepth: false,
      },
    ];

    const newItem: IDiscoverItem = {
      name: product.name,
      images: extractImages(product.images),
      stores: store,
      price: product.price_amount,
      model: product.mpn,
      brand: product.manufacturer_name,
    };

    // console.log(
    //   `✅ Kept: ${product.id} (${product.reference}) - ${product.name}`
    // );
    // console.dir(newItem, { depth: null });

    discoveredItems.push(newItem);
  });

  console.log(
    `CANADA COMPUTERS CA: ${discoveredItems.length} items normalized from search.`
  );

  return discoveredItems;
}

export default function ({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: ICanadaComputersSearchAPIData;
}): IDiscoverItem[] {
  discoveredItems = normalizeSearchData({
    discoveredItems,
    apiResponse: apiResponse,
  });

  return discoveredItems;
}
