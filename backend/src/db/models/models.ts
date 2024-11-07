import { Schema, model } from 'mongoose';
import { IItem, IHistory, IGraph } from '../../types/types';

// Create Item Schema
const itemSchema = new Schema<IItem>(
  {
    _id: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    stores: [
      {
        name: { type: String, required: true },
        logo: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    addDate: { type: Date, required: true },
    lastUpdated: { type: Date, required: true },
    lowestPrice: { type: Number, required: true },
    lowestStore: { type: String, required: true },
    searchCount: { type: Number },
  },
  {
    collection: 'Item',
  }
);

// Create and export Item model using itemSchema
export const Item = model<IItem>('Item', itemSchema);

// Create History Schema
const historySchema = new Schema<IHistory>(
  {
    _id: { type: Schema.Types.ObjectId },
    item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    dataFull: [
      {
        store: { type: String, required: true },
        price: { type: Number, required: true },
        date: { type: Date, default: Date(), required: true },
        moment: { type: String, required: true },
      },
    ],
  },
  {
    collection: 'History',
  }
);

// Create and export History model using historySchema
export const History = model('History', historySchema);

// Create Graph Schema
const graphSchema = new Schema<IGraph>(
  {
    _id: { type: Schema.Types.ObjectId },
    item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    data365: [
      {
        lowestPrice: { type: Number, required: true },
        lowestStore: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
  },
  {
    collection: 'Graph',
  }
);

// Create and export Graph model using graphSchema
export const Graph = model('Graph', graphSchema);
