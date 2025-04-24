export interface IBestBuySearchAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: IBestBuySearchAPIData;
}

export interface IBestBuySearchAPIData {
  currentPage: number;
  total: number;
  totalPages: number;
  pageSize: number;
  products: IBestBuyItem[];
}

export interface IBestBuyItem {
  sku: string;
  name: string;
  shortDescription: string;
  customerRating: number;
  // customerRatingCount: number;
  // customerReviewCount: number;
  productUrl: string;
  // currentRegion: string;
  // hideSavings: boolean;
  // hideSaleEndDate: boolean;
  productType: string | null;
  // regularPrice: number;
  salePrice: number;
  saleEndDate: number | null;
  // thumbnailImage: string;
  primaryParentCategoryId: string;
  categoryName: string;
  // ehf: number;
  // seoText: string;
  // sellerId: string | null;
  // seller: any | null;
  highResImage: string;
  // altLangSeoText: string | null;
  // offerId: string | null;
  // priceUnit: string;
  // requiresAgeVerification: boolean;
  // groupedItems: Object;
  // isPriceEndsLabel: boolean;
  hasPromotion: boolean;
  // isAdvertised: boolean;
  // isClearance: boolean;
  // isInStoreOnly: boolean;
  // isOnlineOnly: boolean;
  isVisible: boolean;
  // isPreorderable: boolean;
  // isFrenchCompliant: boolean;
  isMarketplace: boolean;
  // hasFrenchContent: boolean;
  categoryIds: string[];
}

export interface IBestBuyAvailabilityAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: IBestBuyAvailabilityAPIData;
}

export interface IBestBuyAvailabilityAPIData {
  availabilities: IBestBuyItemAvailability[];
}

export interface IBestBuyItemAvailability {
  sku: string;
  pickup: {
    status: string;
    purchasable: boolean;
  };
  shipping: {
    status: string;
    purchasable: boolean;
  };
  sellerId: string;
  saleChannelExclusivity: string;
  scheduledDelivery: boolean;
  isGiftCard: boolean;
  isService: boolean;
}
