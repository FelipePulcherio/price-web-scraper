import { Schema } from 'mongoose';

// Define interface for item
export interface IItem {
  _id: Schema.Types.ObjectId;
  name?: String;
  brand?: String;
  description?: String;
  category?: String;
  isActive: Boolean;
  stores: [
    {
      name: String;
      logo: String;
      url: String;
    }
  ];
  addDate?: Date;
  lastUpdated?: Date;
  lowestPrice: Number;
  lowestStore?: String;
  searchCount?: Number;
}

// Define interface for short item
export interface IShortItem {
  _id: Schema.Types.ObjectId;
  url: String;
  price: Number;
  lastUpdated: Date;
  status: 'OK' | 'Failed' | null;
  storeName: String;
}

// Define interface for store
export interface IStore {
  storeName: String;
  items: IShortItem[];
}

// Define interface for scraped result
export interface IScraperResult {
  store: String;
  price: Number;
  date: Date;
  moment: String;
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
