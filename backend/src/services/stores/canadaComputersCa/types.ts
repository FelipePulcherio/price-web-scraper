export interface ICanadaComputersSearchAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: ICanadaComputersSearchAPIData;
}

export interface ICanadaComputersSearchAPIData {
  products: ICanadaComputersItem[];
  pagination: {
    total_items: number;
    items_shown_from: number;
    items_shown_to: number;
    current_page: number;
    pages_count: number;
    pages: {};
  };
  // rendered_products_top: string;
  // rendered_products: string;
  // rendered_products_bottom: string;
  // rendered_left: string;
  // rendered_facets: string;
  // rendered_active_filters: string;
  // js_enabled: string;
  // current_url: string;
  // result: {};
  // label: string;
  // suggests: string[];
  // sort_orders: {
  //   entity: string;
  //   field: string;
  //   direction: string;
  //   label: string;
  //   urlParameter: string;
  //   current: string;
  //   url: string;
  // }[];
  // sort_selected: boolean;
}

export interface ICanadaComputersItem {
  id: number;
  url: string;
  // condition: {
  //   type: string;
  //   label: string;
  //   schema_url: string;
  // };
  // embedded_attributes: {
  //   on_sale: number;
  //   reference: string;
  //   active: number;
  //   condition: string;
  //   name: string;
  //   delivery_in_stock: string;
  //   new: number;
  //   category: string;
  //   manufacturer_name: string;
  //   price_tax_exc: number;
  // };
  // reference_to_display: string;
  // specific_references: {
  //   UPC: string;
  //   MPN: string;
  // };
  upc: string;
  mpn: string;
  reference: string;
  main_variants: []; // TO DO: Check this
  active: number; // 1
  name: string; // "(Open Box)"
  // delivery_in_stock: string;
  // new: number;
  category: string;
  manufacturer_name: string;
  // price_tax_exc: number;
  // price_with_reduction_without_tax: number;
  // unit_price_tax_excluded: number;
  price_amount: number;
  // is_new: number; // 0
  // cc_info: {
  //   id_product: number;
  //   item_code: string;
  //   id_product_attribute: number;
  // };
  stock_availability: {
    online: boolean;
    retail: boolean;
    // online_availability: string;
    // online_info: string;
    // retail_availability: string;
    // retail_info: string;
    // retail_availability_message: string;
    // online_availability_message: string;
  };
  images: ICanadaComputersImage[];
}

export interface ICanadaComputersImage {
  bySize: {
    [size: string]: {
      url: string;
      width: string;
      height: string;
      origin_url: string;
      sources: {
        [format: string]: string;
      };
    };
  };
}
