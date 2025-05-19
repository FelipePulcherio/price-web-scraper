import { ICostcoSearchAPIData, ICostcoItem } from './types';
import {
  IDiscoverStore,
  IDiscoverImage,
  IDiscoverItem,
  IDiscoverShortCategory,
} from '@/interfaces/interfaces';
import storesConfig from '../config';

function containsIgnoredWord(name: string): boolean {
  return storesConfig.filters.ignoreKeywords.some((word) =>
    name.toLowerCase().includes(word.toLowerCase())
  );
}

function costcoCaUrlGenerator(contentType: string, groupId: string): string {
  return `https://www.costco.ca/.${contentType}.${groupId}.html`;
}

function costcoCaPriceCalculator(
  minSalePrice: number,
  marketingStatement: string
): number {
  // '' | 'LIMITED TIME OFFER' | '10% OFF IN CART' | '$150 OFF IN CART' | '$800 OFF' | 'HOT BUY' | 'LAST CHANCE' | 'NEW LOWER PRICE'

  // Check for 'XX% OFF IN CART'
  const percentMatch = marketingStatement.match(/(\d+)%\s+OFF\s+IN\s+CART/i);
  if (percentMatch) {
    const discountPercent = parseInt(percentMatch[1], 10);
    const discountAmount = minSalePrice * ((100 - discountPercent) / 100);
    return Math.max(Math.round(discountAmount * 100) / 100, 0);
  }

  // Check for '$XX OFF IN CART'
  const fixedMatch = marketingStatement.match(/\$([\d,]+)\s+OFF\s+IN\s+CART/i);
  if (fixedMatch) {
    const discountFixed = parseFloat(fixedMatch[1].replace(/,/g, ''));
    return Math.max(Math.round((minSalePrice - discountFixed) * 100) / 100, 0);
  }

  return minSalePrice;
}

function extractBrand(product: ICostcoItem): string | undefined {
  const brandName = product.Brand_attr?.[0]?.trim();
  return brandName || undefined;
}

function extractModel(product: ICostcoItem): string | undefined {
  const modelName = product?.Model_attr?.[0]?.trim();
  return modelName || undefined;
}

export default function ({
  apiResponse,
}: {
  apiResponse: ICostcoSearchAPIData[];
}): IDiscoverItem[] {
  let discoveredItems: IDiscoverItem[] = [];

  // Loop trough all docs
  apiResponse.forEach((data) => {
    data.docs.forEach((product) => {
      // Data to be ignored
      if (containsIgnoredWord(product.item_name)) {
        // console.log(
        //   `⛔ Filtered out: ${product.item_number} - ${product.item_name}`
        // );
        return;
      }

      const store: IDiscoverStore[] = [
        {
          name: 'COSTCO CA',
          url: costcoCaUrlGenerator(product.content_type[0], product.group_id),
          specificId: product.item_number,
        },
      ];

      // TO DO: Category mapping for COSTCO CA
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

      // Image is modified. Not suited for direct use.
      const discoveredImages: IDiscoverImage[] = [
        {
          url: product.image,
        },
      ];

      const newItem: IDiscoverItem = {
        name: product.item_name,
        stores: store,
        price: costcoCaPriceCalculator(
          product.item_location_pricing_salePrice,
          product.item_product_marketing_statement
        ),
        ...(extractBrand(product) ? { brand: extractBrand(product) } : {}),
        ...(extractModel(product) ? { model: extractModel(product) } : {}),
      };

      // console.log(`✅ Kept: ${product.item_number} - ${product.item_name}`);
      // console.dir(newItem, { depth: null });

      discoveredItems.push(newItem);
    });
  });

  console.log(
    `COSTCO CA: ${discoveredItems.length} items normalized from search.`
  );

  return discoveredItems;
}
