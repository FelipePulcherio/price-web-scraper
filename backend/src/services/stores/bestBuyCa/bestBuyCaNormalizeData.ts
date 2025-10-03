import {
  IDiscoverStore,
  IDiscoverImage,
  IDiscoverItem,
  IDiscoverShortCategory,
} from '@/interfaces/interfaces';
import {
  IBestBuySearchAPIData,
  IBestBuyAvailabilityAPIData,
  IBestBuyDetailAPIData,
} from './types';
import storesConfig from '../config';

function containsIgnoredWord(name: string): boolean {
  return storesConfig.filters.ignoreKeywords.some((word) =>
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

      const store: IDiscoverStore[] = [
        {
          name: 'BEST BUY CA',
          url: `https://bestbuy.ca${product.productUrl}`,
          specificId: product.sku,
        },
      ];

      // TO DO: Category mapping for BEST BUY CA
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

      const discoveredImages: IDiscoverImage[] = product.highResImage
        ? [{ url: product.highResImage }]
        : [];

      const newItem: IDiscoverItem = {
        name: product.name,
        stores: store,
        price: product.salePrice,
        ...(discoveredImages.length > 0 && { images: discoveredImages }),
      };

      // console.log(`✅ Kept: ${product.sku} - ${product.name}`);
      discoveredItems.push(newItem);
    });
  });

  console.log(
    `BEST BUY CA: ${discoveredItems.length} items normalized from search.`
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

  console.log(
    `BEST BUY CA: ${discoveredItems.length} items normalized from availability.`
  );

  return filteredItems;
}

export function cleanNameFromModel(name: string, model: string): string {
  // Escape regex special chars from model string
  const escapedModel = model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Regex: match model with optional surrounding brackets/parentheses/dashes/spaces
  const regex = new RegExp(
    `\\s*[-()\\[\\]]*\\s*${escapedModel}\\s*[-()\\[\\]]*\\s*`,
    'i'
  );

  const cleaned = name
    .replace(regex, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleaned;
}

function normalizeDetailData({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: IBestBuyDetailAPIData[];
}): IDiscoverItem[] {
  // Build quick lookup by SKU
  const detailBySku = new Map(
    apiResponse.map((detail) => [detail.sku, detail])
  );

  const enrichedItems = discoveredItems
    .map((item) => {
      const sku = item.stores[0].specificId;
      if (!sku) return null;

      const detail = detailBySku.get(sku);
      if (!detail) return null;

      // Apply availability filter
      const purchasable = detail.isPurchasable;
      const correctSeller = detail.sellerId === 'bbyca';

      if (!purchasable || !correctSeller) return null;

      // Add new data to item
      const enriched: IDiscoverItem = {
        ...item,
        name: cleanNameFromModel(detail.name, detail.modelNumber) ?? item.name,
        images: item.images ?? [{ url: detail.additionalMedia[0].url }],
        model: detail.modelNumber ?? item.model,
        brand: detail.brandName ?? item.brand,
      };

      return enriched;
    })
    .filter((i): i is IDiscoverItem => i !== null);

  console.log(
    `BEST BUY CA: ${enrichedItems.length}/${discoveredItems.length} items normalized from detail API.`
  );

  return enrichedItems;
}

export default function ({
  type,
  discoveredItems,
  apiResponse,
}: {
  type: 'search' | 'availability';
  discoveredItems: IDiscoverItem[];
  apiResponse: IBestBuySearchAPIData[] | IBestBuyDetailAPIData[];
}): IDiscoverItem[] {
  if (type === 'search') {
    discoveredItems = normalizeSearchData({
      discoveredItems,
      apiResponse: apiResponse as IBestBuySearchAPIData[],
    });
  } else {
    discoveredItems = normalizeDetailData({
      discoveredItems,
      apiResponse: apiResponse as IBestBuyDetailAPIData[],
    });
  }

  return discoveredItems;
}
