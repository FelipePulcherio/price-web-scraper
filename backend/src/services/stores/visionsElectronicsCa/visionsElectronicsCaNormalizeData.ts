import {
  IDiscoverImage,
  IDiscoverItem,
  IDiscoverShortCategory,
  IStore,
} from '@/interfaces/interfaces';
import {
  IVisionsElectronicsSearchAPIData,
  IVisionsElectronicsItem,
} from './types';

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
  'Openbox',
  'Display',
];

function containsIgnoredWord(name: string): boolean {
  return ignoreStrings.some((word) =>
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

    const store: IStore[] = [
      {
        name: 'VISIONS ELECTRONICS CA',
        url: product.url,
        specificId: product.objectID,
      },
    ];

    // TO DO: Category mapping for VISIONS ELECTRONICS CA
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
    `VISIONS ELECTRONICS CA: ${discoveredItems.length} items normalized from availability.`
  );

  return discoveredItems;
}

export default function ({
  discoveredItems,
  apiResponse,
}: {
  discoveredItems: IDiscoverItem[];
  apiResponse: IVisionsElectronicsSearchAPIData;
}): IDiscoverItem[] {
  discoveredItems = normalizeSearchData({
    discoveredItems,
    apiResponse: apiResponse,
  });

  return discoveredItems;
}
