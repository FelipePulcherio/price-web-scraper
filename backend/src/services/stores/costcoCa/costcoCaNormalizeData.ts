import { ICostcoSearchAPIData } from './types';
import {
  IDiscoverImage,
  IDiscoverItem,
  IDiscoverShortCategory,
  IStore,
} from '@/interfaces/interfaces';

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

export default function ({
  apiResponse,
}: {
  apiResponse: ICostcoSearchAPIData[];
}): IDiscoverItem[] {
  let discoveredItems: IDiscoverItem[] = [];

  // Loop trough all docs
  apiResponse.forEach((data) => {
    data.docs.forEach((doc) => {
      const store: IStore[] = [
        {
          name: 'COSTCO CA',
          url: costcoCaUrlGenerator(doc.content_type[0], doc.group_id),
          specificId: doc.item_number,
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
          url: doc.image,
        },
      ];

      const newItem: IDiscoverItem = {
        name: doc.name,
        model: doc.Model_attr[0],
        brand: doc.Brand_attr[0],
        stores: store,
        price: costcoCaPriceCalculator(
          doc.minSalePrice,
          doc.item_product_marketing_statement
        ),
      };

      discoveredItems.push(newItem);
    });
  });

  console.log(
    `COSTCO CA: ${discoveredItems.length} items normalized from search.`
  );

  return discoveredItems;
}
