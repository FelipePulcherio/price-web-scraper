import { Schema, model } from 'mongoose';
import { IHistory } from '../../types/types';

// Create Schema
const historySchema = new Schema<IHistory>(
  {
    _id: { type: Schema.ObjectId },
    item_id: { type: Schema.ObjectId, ref: 'Item', required: true },
    data_full: [
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

// Create and export model using historySchema
export const History = model('History', historySchema);
