import {
  IDiscoverImage,
  IDiscoverItem,
  IDiscoverShortCategory,
  IStore,
} from '@/interfaces/interfaces';
import { IBestBuySearchAPIData, IBestBuyAvailabilityAPIData } from './types';

const ignoreStrings: string[] = [
  'Bell',
  'Telus',
  'Fido',
  'Rogers',
  'Virgin',
  'Koodo',
  'Freedom',
  'Monthly',
  'Open',
];

function containsIgnoredWord(name: string): boolean {
  return ignoreStrings.some((word) =>
    name.toLowerCase().includes(word.toLowerCase())
  );
}

function normalizeSearchData({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: IBestBuySearchAPIData[];
}): IDiscoverItem[] {
  apiResponse.forEach((response) => {
    // console.log(
    //   `Page: ${response.currentPage} - Products: ${response.products.length}`
    // );

    response.products.forEach((product) => {
      // Data to be ignored
      if (
        product.salePrice === 0 ||
        !product.isVisible ||
        containsIgnoredWord(product.name)
      ) {
        // console.log(`⛔ Filtered out: ${product.sku} - ${product.name}`);
        return;
      }

      const store: IStore[] = [
        {
          name: 'BEST BUY CA',
          url: `https://bestbuy.ca${product.productUrl}`,
          specificId: product.sku,
        },
      ];

      // TO DO: Category mapping for BEST BUY CA
      const discoveredCategory: IDiscoverShortCategory[] = [
        {
          name: '',
          hasDepth: true,
        },
      ];

      const discoveredSubCategory: IDiscoverShortCategory[] = [
        {
          name: '',
          hasDepth: true,
        },
      ];

      const discoveredSubSubCategory: IDiscoverShortCategory[] = [
        {
          name: '',
          hasDepth: false,
        },
      ];

      const discoveredImages: IDiscoverImage[] = [
        {
          url: product.highResImage,
        },
      ];

      const newItem: IDiscoverItem = {
        name: product.name,
        images: discoveredImages,
        stores: store,
        price: product.salePrice,
      };

      // console.log(`✅ Kept: ${product.sku} - ${product.name}`);
      discoveredItems.push(newItem);
    });
  });

  console.log(
    'Total discovered items after normalization:',
    discoveredItems.length
  );
  return discoveredItems;
}

function normalizeAvailabilityData({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: IBestBuyAvailabilityAPIData[];
}): IDiscoverItem[] {
  const allAvailabilities = apiResponse.flatMap((res) => res.availabilities);

  const filteredItems = discoveredItems.filter((item) => {
    const sku = item.stores[0].specificId;
    if (!sku) return false;

    const availability = allAvailabilities.find(
      (availability) => availability.sku === sku
    );

    if (!availability) return false;

    return (
      availability.shipping.purchasable && availability.sellerId === 'bbyca'
    );
  });

  return filteredItems;
}

export default function ({
  type,
  discoveredItems,
  apiResponse,
}: {
  type: 'search' | 'availability';
  discoveredItems: IDiscoverItem[];
  apiResponse: IBestBuySearchAPIData[] | IBestBuyAvailabilityAPIData[];
}): IDiscoverItem[] {
  if (type === 'search') {
    discoveredItems = normalizeSearchData({
      discoveredItems,
      apiResponse: apiResponse as IBestBuySearchAPIData[],
    });
  } else {
    discoveredItems = normalizeAvailabilityData({
      discoveredItems,
      apiResponse: apiResponse as IBestBuyAvailabilityAPIData[],
    });
  }

  return discoveredItems;
}
