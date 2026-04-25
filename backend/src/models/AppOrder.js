const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const OrderItemSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    product_name: { type: String, required: true },
    variant_sku: { type: String, required: true },
    variant_label: { type: String, required: true },
    image_url: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
    total_price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const StatusEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    updated_by: { type: mongoose.Schema.Types.ObjectId, required: true },
    actor_role: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    order_number: { type: String, unique: true, required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    consumer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true, index: true },
    delivery_partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },

    items: { type: [OrderItemSchema], default: () => [], required: true },

    pricing: {
      subtotal: { type: Number, required: true },
      delivery_fee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    delivery_address: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },

    payment: {
      method: { type: String, enum: ['COD', 'UPI', 'CARD', 'WALLET', 'NETBANKING'], required: true },
      status: { type: String, required: true },
      reference: { type: String },
      paid_at: { type: Date },
    },

    status: { type: String, required: true },
    status_history: { type: [StatusEventSchema], default: () => [] },

    special_instructions: { type: String },
    estimated_delivery_at: { type: Date },
    delivered_at: { type: Date },
  },
  { timestamps: true }
);

// Indexes
OrderSchema.index({ store_id: 1, status: 1 });
OrderSchema.index({ consumer_id: 1, createdAt: -1 });
OrderSchema.index({ delivery_partner_id: 1, status: 1 });
OrderSchema.index({ store_id: 1, createdAt: -1 });
OrderSchema.index({ 'delivery_address.location': '2dsphere' });

const createOrderModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Order', OrderSchema);
};

module.exports = { createOrderModel, OrderSchema };