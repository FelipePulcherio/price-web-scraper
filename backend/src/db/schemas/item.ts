import { Schema, model } from 'mongoose';
import { IItem } from '../../types/types';

// Create Schema
const itemSchema = new Schema<IItem>(
  {
    _id: { type: Schema.ObjectId },
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
    add_date: { type: Date, required: true },
    last_updated: { type: Date, required: true },
    lowest_price: { type: Number, required: true },
    lowest_store: { type: String, required: true },
    search_count: { type: Number },
  },
  {
    collection: 'Item',
  }
);

// Create and export model using itemSchema
module.exports = model('Item', itemSchema);
