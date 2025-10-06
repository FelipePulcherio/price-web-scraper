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
  highResImage: string | null;
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

export interface IBestBuyDetailAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: IBestBuyDetailAPIData;
}

export interface IBestBuyDetailAPIData {
  additionalMedia: {
    thumbnailUrl: string;
    url: string;
    mimeType: string;
  }[];
  // altLangSeoText: string;
  availability: {
    sku: string;
    inStoreAvailability: string;
    inStoreAvailabilityText: string;
    inStoreAvailabilityUpdateDate: string;
    isAvailableOnline: boolean;
    onlineAvailability: string;
    onlineAvailabilityText: string;
    onlineAvailabilityUpdateDate: string;
    onlineAvailabilityCount: number;
    onlineAvailabilityZoneCount: number | null;
    buttonState: string;
  };
  brandName: string;
  brandThumbnailImage: string;
  bundle: any[];
  categoryName: string;
  // currentRegion: string;
  customerRating: number | null;
  customerRatingCount: number | null;
  customerReviewCount: number | null;
  ehf: number;
  // hasFreeShipping: boolean;
  // hasFrenchContent: boolean;
  // hasHomeDeliveryService: boolean;
  // hasInStorePickup: boolean;
  hasPromotion: boolean;
  // hasRebate: boolean;
  // hasWarranty: boolean;
  // hideSaleEndDate: boolean;
  // hideSavings: boolean;
  highResImage: string | null;
  // isAdvertised: boolean;
  // isAvailableForOrder: boolean;
  // isAvailableForPickup: boolean;
  // isBackorderable: boolean;
  // isClearance: boolean;
  // isFrenchCompliant: boolean;
  // isInStoreOnly: boolean;
  // isMachineTranslated: boolean;
  // isMarketplace: boolean;
  // isOnlineOnly: boolean;
  // isPreorderable: boolean;
  // isPriceEndsLabel: boolean;
  // isProductOnSale: boolean;
  isPurchasable: boolean;
  isShippable: boolean;
  // isSpecialDelivery: boolean;
  isVisible: boolean;
  longDescription: string;
  make: string;
  manufacturer: string;
  modelNumber: string;
  name: string;
  // offerId: string;
  // priceUnit: string | null;
  primaryParentCategoryId: string;
  // productType: string;
  productUrl: string;
  // recommended: any[];
  regularPrice: number;
  // related: any[];
  // relatedUpcs: any[];
  // requiredProducts: any[];
  // requiresAgeVerification: boolean;
  salePrice: number;
  // saleStartDate: string;
  seller: string | null;
  sellerId: string;
  // seoText: string;
  // warrantyAndRepairDisclosureUrl: string | null;
  // services: any[];
  // shortDescription: string;
  sku: string;
  // specialOffers: any | null;
  specs: {
    group: string;
    name: string;
    value: string;
  }[];
  // thumbnailImage: string;
  upcNumber: string;
  // videos: any[];
  // warranties: any[];
  // warrantyBenefitsMessages: any[];
  // whatsInTheBox: any[];
  // PreorderOrderDate: string;
  // PreorderReleaseDate: string | null;
  SaleEndDate: string;
}
