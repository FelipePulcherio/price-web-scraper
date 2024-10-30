import { Schema } from 'mongoose';

// Define interface for item
export interface IItem {
  _id: Schema.Types.ObjectId;
  name?: string;
  brand?: string;
  description?: string;
  category?: string;
  isActive: Boolean;
  stores: [
    {
      name: string;
      logo: string;
      url: string;
    }
  ];
  addDate?: Date;
  lastUpdated?: Date;
  lowestPrice: number;
  lowestStore?: string;
  searchCount?: number;
}

// Define interface for short item
export interface IShortItem {
  _id: Schema.Types.ObjectId;
  url: string;
  price: number;
  lastUpdated: Date;
  status: 'OK' | 'Failed' | null;
  storeName: string;
}

// Define interface for store
export interface IStore {
  storeName: string;
  items: IShortItem[];
}

// Define interface for scraped result
export interface IScraperResult {
  store: string;
  price: number;
  date: Date;
  moment: string;
}

// Define interface for history
export interface IHistory {
  _id: Schema.Types.ObjectId;
  item_id: Schema.Types.ObjectId;
  dataFull: IScraperResult[];
}

// Define interface for graph result
export interface IGraphResult {
  lowestPrice: number;
  lowestStore: string;
  date: Date;
}

// Define interface for graph
export interface IGraph {
  _id: Schema.Types.ObjectId;
  item_id: Schema.Types.ObjectId;
  data365: IGraphResult[];
}
