import { Schema } from 'mongoose';

// Define interface for item schema
export interface IItem {
  _id: Schema.Types.ObjectId;
  name: String;
  brand: String;
  description: String;
  category: String;
  isActive: Boolean;
  stores: [
    {
      name: String;
      logo: String;
      url: String;
    }
  ];
  add_date: Date;
  last_updated: Date;
  lowest_price: Number;
  lowest_store: String;
  search_count: Number;
}

// Define interface for history schema
export interface IHistory {
  _id: Schema.Types.ObjectId;
  item_id: Schema.Types.ObjectId;
  data_full: [
    {
      store: String;
      price: Number;
      date: Date;
      moment: String;
    }
  ];
}

// Define interface for graph schema
export interface IGraph {
  _id: Schema.Types.ObjectId;
  item_id: Schema.Types.ObjectId;
  data_365: [
    {
      lowest_price: Number;
      lowest_store: String;
      date: Date;
    }
  ];
}
