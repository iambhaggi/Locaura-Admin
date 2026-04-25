const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const ReviewSchema = new mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    consumer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true },

    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    body: { type: String, trim: true },
    images: { type: [String], default: [] },

    helpful_votes: { type: Number, default: 0 },
    is_verified_purchase: { type: Boolean, default: true },
    is_hidden: { type: Boolean, default: false },

    reply: {
      text: { type: String, trim: true },
      replied_at: { type: Date }
    }
  },
  { timestamps: true }
);

// Indexes
ReviewSchema.index({ store_id: 1, rating: -1 });
ReviewSchema.index({ product_id: 1, rating: -1 });
ReviewSchema.index({ consumer_id: 1, order_id: 1 }, { unique: true });

const createReviewModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Review', ReviewSchema);
};

module.exports = { createReviewModel, ReviewSchema };