import { Schema, model } from 'mongoose';

// Create Schema
const graphSchema = new Schema(
  {
    _id: { type: Schema.ObjectId },
    item_id: { type: Schema.ObjectId, ref: 'Item', required: true },
    data_365: [
      {
        lowest_price: { type: Number, required: true },
        lowest_store: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
  },
  {
    collection: 'Graph',
  }
);

// Create and export model using graphSchema
module.exports = model('Graph', graphSchema);
