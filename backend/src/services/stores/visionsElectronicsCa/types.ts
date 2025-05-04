export interface IVisionsElectronicsAuthAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: string;
}

export interface IVisionsElectronicsSearchAPIResponse {
  status: number;
  statusText: string;
  headers: {
    'set-cookie': string[];
  };
  data: IVisionsElectronicsSearchAPIData;
}

export interface IVisionsElectronicsSearchAPIData {
  results: [
    {
      hits: IVisionsElectronicsItem[];
      nbHits: number;
      page: number;
      nbPages: number;
      hitsPerPage: number;
      query: string;
      params: string;
      index: string;
    }
  ];
}

export interface IVisionsElectronicsItem {
  name: string;
  url: string;
  // visibility_search: number;
  type_id: string; // bundle, simple
  image_url: string;
  in_stock: number; // 0 or 1
  sku: string | string[];
  brands?: string;
  price: {
    CAD: {
      default: number;
    };
  };
  objectID: string;
}
