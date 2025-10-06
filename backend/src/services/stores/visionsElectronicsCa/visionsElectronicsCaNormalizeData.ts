import {
  IDiscoverStore,
  IDiscoverImage,
  IDiscoverItem,
  IDiscoverShortCategory,
} from '@/interfaces/interfaces';
import {
  IVisionsElectronicsSearchAPIData,
  IVisionsElectronicsItem,
  IVisionsElectronicsDiscountAPIData,
} from './types';
import storesConfig from '../config';

function containsIgnoredWord(name: string): boolean {
  return storesConfig.filters.ignoreKeywords.some((word) =>
    name.toLowerCase().includes(word.toLowerCase())
  );
}

function extractImage(image: string): string {
  return image.split('?')[0];
}

function extractBrand(product: IVisionsElectronicsItem): string | undefined {
  const brandName = product.brands?.trim();
  return brandName || undefined;
}

function normalizeSearchData({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: IVisionsElectronicsSearchAPIData;
}): IDiscoverItem[] {
  apiResponse.results[0].hits.forEach((product) => {
    // Data to be ignored
    if (
      product.type_id === 'bundle' ||
      product.in_stock === 0 ||
      containsIgnoredWord(product.name) ||
      containsIgnoredWord(typeof product.sku === 'string' ? product.sku : '')
    ) {
      // console.log(
      //   `⛔ Filtered out: ${product.sku} (${product.objectID}) - ${product.name}`
      // );

      return;
    }

    const store: IDiscoverStore[] = [
      {
        name: 'VISIONS ELECTRONICS CA',
        url: product.url,
        specificId: product.objectID,
      },
    ];

    // TO DO: Category mapping for VISIONS ELECTRONICS CA
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

    const discoveredImages: IDiscoverImage[] = [
      {
        url: extractImage(product.image_url),
      },
    ];

    const newItem: IDiscoverItem = {
      name: product.name,
      images: discoveredImages,
      stores: store,
      price: product.price.CAD.default,
      ...(typeof product.sku === 'string' ? { model: product.sku } : {}),
      ...(extractBrand(product) ? { brand: extractBrand(product) } : {}),
    };

    // console.log(
    //   `✅ Kept: ${product.sku} (${product.objectID}) - ${product.name}`
    // );
    // console.dir(newItem, { depth: null });

    discoveredItems.push(newItem);
  });

  console.log(
    `VISIONS ELECTRONICS CA: ${discoveredItems.length} items normalized from search.`
  );

  return discoveredItems;
}

function visionsElectronicsCaPriceCalculator(
  originalPrice: number,
  discountString: string
): number {
  // '$200 Discount In-Cart!'

  const match = discountString.match(/\$([\d,.]+)/);
  if (!match || !match[1]) return originalPrice;

  const discountAmount = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(discountAmount)) return originalPrice;

  return Math.max(Math.round((originalPrice - discountAmount) * 100) / 100, 0);
}

function normalizeDiscountData({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: IVisionsElectronicsDiscountAPIData[];
}): IDiscoverItem[] {
  const updatedItems: IDiscoverItem[] = discoveredItems.map((item) => {
    const specificId = item.stores[0]?.specificId;
    if (!specificId) return item;

    const discountData = apiResponse.find(
      (entry) => entry.objectId === specificId
    );

    if (!discountData) return item;

    const label = discountData.imagePosition;

    // Skip if empty or doesn't contain a discount
    if (!label || !label.includes('Discount')) return item;

    return {
      ...item,
      price: visionsElectronicsCaPriceCalculator(item.price!, label),
    };
  });

  console.log(
    `VISIONS ELECTRONICS CA: ${updatedItems.length} items normalized from discount.`
  );

  // console.dir(updatedItems, { depth: null });

  return updatedItems;
}

export default function ({
  type,
  discoveredItems,
  apiResponse,
}: {
  type: 'search' | 'discount';
  discoveredItems: IDiscoverItem[];
  apiResponse:
    | IVisionsElectronicsSearchAPIData
    | IVisionsElectronicsDiscountAPIData[];
}): IDiscoverItem[] {
  if (type === 'search') {
    discoveredItems = normalizeSearchData({
      discoveredItems,
      apiResponse: apiResponse as IVisionsElectronicsSearchAPIData,
    });
  } else {
    discoveredItems = normalizeDiscountData({
      discoveredItems,
      apiResponse: apiResponse as IVisionsElectronicsDiscountAPIData[],
    });
  }

  return discoveredItems;
}
