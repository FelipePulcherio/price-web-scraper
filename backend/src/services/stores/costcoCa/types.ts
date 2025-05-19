export interface ICostcoAuthAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: string;
}

export interface ICostcoSearchAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: {
    response: ICostcoSearchAPIData;
  };
}

export interface ICostcoSearchAPIData {
  docs: ICostcoItem[];
  numFound: number;
  start?: number;
  numFoundExact?: boolean;
}

export interface ICostcoItem {
  item_product_marketing_statement: string;
  Model_attr: string[];
  item_member_only: boolean;
  item_number: string;
  Model_descriptive: string[];
  item_manufacturing_skus: string[];
  content_type: string[];
  Brand_attr: string[];
  categoryPath_ss: string[];
  group_id: string;
  item_name: string;
  name: string;
  description: string;
  image: string;
  deliveryStatus: 'in stock';
  hasSingleSku: boolean;
  item_location_pricing_salePrice: number;
  minSalePrice: number;
  maxSalePrice: number;
  isItemInStock: boolean;
  images: string[];
}
