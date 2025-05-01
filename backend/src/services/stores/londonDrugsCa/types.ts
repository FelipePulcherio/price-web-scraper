export interface ILondonDrugsAuthAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: {};
}

export interface ILondonDrugsSearchAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: string;
}

export interface ILondonDrugsSearchAPIData {
  products: ILondonDrugsItem[];
  query: string;
  // searchParams: {
  //   q: string;
  //   pageSize: string;
  // };
  startIndex: number;
  totalCount: number;
  pageCount: number;
  pageSize: number;
}

export interface ILondonDrugsItem {
  productCode: string;
  supportedFulfilmentTypes: string[];
  isAvailable: boolean;
  inventory?: {
    onlineStockLevel: number;
  };
  variationProductCode?: string;
  productName: string;
  productShortDescription: string;
  primaryImage: {
    // id: string | null;
    // altText: string | null;
    imageUrl: string;
    // slug: string | null;
    // imageLabel: string | null;
    // videoUrl: string | null;
    // mediaType: string | null;
  };
  price?: {
    price: number;
    salePrice: number | null;
    listPrice: number;
  };
  priceRange?: {
    lower: {
      salePrice: number | null;
      listPrice: number;
    };
    upper: {
      salePrice: number | null;
      listPrice: number;
    };
  };
  // options: [];
  brand: {
    name?: string;
    url?: string;
  };
  specifications: {
    code: string;
    name: string;
    // isHidden: boolean;
    // propertyType: string;
    // description: string;
    // isMultiValue: boolean;
    value?: {
      name: string;
      value: string;
    };
    values?: {
      name: string;
      value: string;
    }[];
  }[];
  // badges?: string[];
  variationProductName?: string;
  bvRating?: string;
  bvReviewCount?: string;
  // deliverySafetyStock?: number;
  // pickUpSafetyStock?: number;
  // productCategoryTree: {
  //   productCategoryTree: {
  //     categoryId: number;
  //     name: string;
  //     categoryCode: string;
  //   }[];
  // };
  // variants?: [];
  // deliveryWarningStock?: number;
  // pickUpWarningStock?: number;
  // maxOrderableQuantity?: number;
  // status?: string;
}
