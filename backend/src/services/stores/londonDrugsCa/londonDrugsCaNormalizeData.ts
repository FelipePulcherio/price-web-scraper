import {
  IDiscoverStore,
  IDiscoverItem,
  IDiscoverShortCategory,
} from '@/interfaces/interfaces';
import { ILondonDrugsSearchAPIData, ILondonDrugsItem } from './types';
import storesConfig from '../config';

function containsIgnoredWord(name: string): boolean {
  return storesConfig.filters.ignoreKeywords.some((word) =>
    name.toLowerCase().includes(word.toLowerCase())
  );
}

function buildProductUrl(productName: string, productCode: string): string {
  const parsedProductName = productName
    .toLowerCase()
    .replace(/ - /g, ' ')
    .replace(/ /g, '-');
  return `https://www.londondrugs.com/products/${parsedProductName}/p/${productCode}`;
}

function extractImage(product: ILondonDrugsItem): string | undefined {
  const imageUrl = product.primaryImage?.imageUrl?.trim();
  return imageUrl || undefined;
}

function extractBrand(product: ILondonDrugsItem): string | undefined {
  const brandName = product.brand?.name?.trim();
  return brandName || undefined;
}

function extractModel(product: ILondonDrugsItem): string | undefined {
  const modelSpec = product.specifications?.find(
    (spec) => spec.name.toLowerCase() === 'model'
  );
  const modelName = modelSpec?.value?.name?.trim();
  return modelName || undefined;
}

function normalizeProductName(
  productName: string,
  model: string | undefined
): string {
  if (!model) return productName;

  let cleanedProductName = productName.replace(` - ${model}`, '');

  return cleanedProductName;
}

function normalizeSearchData({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: ILondonDrugsSearchAPIData;
}): IDiscoverItem[] {
  apiResponse.products.forEach((product) => {
    // Data to be ignored
    if (
      !product.isAvailable ||
      !product.inventory ||
      product.inventory.onlineStockLevel <= 0 ||
      !!product.priceRange ||
      containsIgnoredWord(product.productName) ||
      containsIgnoredWord(product.variationProductName ?? '')
    ) {
      // console.log(
      //   `⛔ Filtered out: ${product.productCode} - ${product.productName}`
      // );

      return;
    }

    const store: IDiscoverStore[] = [
      {
        name: 'LONDON DRUGS CA',
        url: buildProductUrl(product.productName, product.productCode),
        specificId: product.productCode,
      },
    ];

    // TO DO: Category mapping for LONDON DRUGS CA
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

    const newItem: IDiscoverItem = {
      name: normalizeProductName(product.productName, extractModel(product)),
      ...(extractImage(product)
        ? { images: [{ url: extractImage(product)! }] }
        : {}),
      stores: store,
      price:
        product.price!.salePrice ??
        product.price!.price ??
        product.price!.listPrice,
      ...(extractBrand(product) ? { brand: extractBrand(product) } : {}),
      ...(extractModel(product) ? { model: extractModel(product) } : {}),
    };

    // console.log(`✅ Kept: ${product.productCode} - ${product.productName}`);
    // console.dir(newItem, { depth: null });
    discoveredItems.push(newItem);
  });

  console.log(
    `LONDON DRUGS CA: ${discoveredItems.length} items normalized from search.`
  );

  return discoveredItems;
}

export default function ({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: ILondonDrugsSearchAPIData;
}): IDiscoverItem[] {
  discoveredItems = normalizeSearchData({
    discoveredItems,
    apiResponse,
  });

  return discoveredItems;
}
