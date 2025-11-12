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
import randomLetters from '../utils/randomLetters';

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
        },
      ];

      const discoveredSubCategory: IDiscoverShortCategory[] = [
        {
          name: 'DEFAULT',
        },
      ];

      const discoveredSubSubCategory: IDiscoverShortCategory[] = [
        {
          name: 'DEFAULT',
        },
      ];

      const newItem: IDiscoverItem = {
        name: product.name,
        stores: store,
        price: product.salePrice,
        categories: discoveredCategory,
        subCategories: discoveredSubCategory,
        subSubCategories: discoveredSubSubCategory,
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

function cleanName(name: string, model?: string): string {
  let cleanedName = name;

  // 1) Remove model if present (with optional parentheses or brackets around it)
  if (model) {
    const modelRegex = new RegExp(
      `(\\(|\\[|\\s|-)?${model}(\\)|\\]|\\s|-)?`,
      'gi'
    );
    cleanedName = cleanedName.replace(modelRegex, '').trim();
  }

  // 2) Remove " - Only at Best Buy" (case-insensitive, safe with/without spaces)
  cleanedName = cleanedName.replace(/\s*-\s*Only at Best Buy/gi, '').trim();

  // 3) Collapse multiple spaces into one
  cleanedName = cleanedName.replace(/\s{2,}/g, ' ');

  return cleanedName;
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

      // Add image information
      const discoveredImages: IDiscoverImage[] = [
        ...(detail.additionalMedia?.map((media) => ({
          name: randomLetters(5),
          referenceUrl: media.url,
        })) ?? []),
      ];

      // Add new data to item
      const enriched: IDiscoverItem = {
        ...item,
        name: cleanName(detail.name, detail.modelNumber) ?? item.name,
        images: discoveredImages,
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
  type: 'search' | 'availability' | 'detail';
  discoveredItems: IDiscoverItem[];
  apiResponse: IBestBuySearchAPIData[] | IBestBuyDetailAPIData[];
}): IDiscoverItem[] {
  if (type === 'search') {
    discoveredItems = normalizeSearchData({
      discoveredItems,
      apiResponse: apiResponse as IBestBuySearchAPIData[],
    });
  } else if (type === 'detail') {
    discoveredItems = normalizeDetailData({
      discoveredItems,
      apiResponse: apiResponse as IBestBuyDetailAPIData[],
    });
  } else {
  }

  return discoveredItems;
}
