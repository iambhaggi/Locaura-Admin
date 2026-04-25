const mongoose = require('mongoose');
const { connectAdminMongoDB } = require('../config/database');

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    is_default: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: false } // [longitude, latitude]
    }
  },
  { _id: true }
);

const CartItemSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProduct', required: true },
    quantity: { type: Number, required: true, min: 1 },
    product_name: { type: String },
    brand_name: { type: String },
    price: { type: Number },
    thumb_url: { type: String },
    variant_sku: { type: String },
    variant_label: { type: String },
    size: { type: String },
    color: { type: String }
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    store_name: { type: String },
    items: { type: [CartItemSchema], default: () => [] },
    subtotal: { type: Number, default: 0 },
    platform_fee: { type: Number, default: 0 },
    delivery_fee: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  { _id: false }
);

const ConsumerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number']
    },
    otp: { type: String },
    otp_expiry: { type: Date },
    phone_verified: { type: Boolean, default: false },

    consumer_name: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },

    addresses: { type: [AddressSchema], default: () => [] },
    cart: { type: CartSchema, default: () => ({ items: [] }) },

    fcm_token: { type: String },

    status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
  },
  { timestamps: true, collection: 'consumers' }
);

const createConsumerModel = async () => {
  const adminConnection = await connectAdminMongoDB();
  return adminConnection.model('Consumer', ConsumerSchema);
};

module.exports = {
  createConsumerModel,
  ConsumerSchema,
};