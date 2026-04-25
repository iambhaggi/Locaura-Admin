const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const ProductAttributeSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true }, value: { type: String, required: true, trim: true } },
  { _id: false }
);

const ParentProductSchema = new mongoose.Schema(
  {
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true },
    categories: { type: [String], default: [] },

    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    brand: { type: String, trim: true },
    description: { type: String },

    product_attributes: { type: [ProductAttributeSchema], default: [] },

    base_price: { type: Number, required: true, min: 0 },
    base_compare_at_price: { type: Number, min: 0 },

    cover_images: { type: [String], default: [] },

    gender: { type: String, enum: ['men', 'women', 'unisex', 'kids', 'boys', 'girls'] },
    tags: [{ type: String, lowercase: true, trim: true }],

    status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
    is_featured: { type: Boolean, default: false },

    total_stock: { type: Number, default: 0 },
    color_count: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    total_reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ChildProductSchema = new mongoose.Schema(
  {
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true },
    categories: { type: [String], default: [] },

    color: { type: String, trim: true },
    color_hex: { type: String, trim: true },
    size: { type: String, trim: true },
    length: { type: String, trim: true },
    custom_variation_attributes: { type: [ProductAttributeSchema], default: [] },

    sku: { type: String, required: true, trim: true },
    barcode: { type: String, trim: true },
    variant_label: { type: String, default: '' },

    price: { type: Number, required: true, min: 0 },
    compare_at_price: { type: Number, min: 0 },
    cost_price: { type: Number, min: 0, select: false },

    stock_quantity: { type: Number, required: true, default: 0, min: 0 },
    reserved_quantity: { type: Number, default: 0, min: 0 },

    images: { type: [String], default: [] },

    weight_grams: { type: Number },
    length_cm: { type: Number },
    width_cm: { type: Number },
    height_cm: { type: Number },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for Parent
ParentProductSchema.index({ store_id: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, brand: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, gender: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, is_featured: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, tags: 1 });
ParentProductSchema.index({ store_id: 1, total_stock: 1 });
ParentProductSchema.index({ store_id: 1, base_price: 1 });
ParentProductSchema.index({ store_id: 1, rating: -1 });
ParentProductSchema.index({
  name: 'text', brand: 'text', tags: 'text', 'product_attributes.value': 'text'
});

// Indexes for Child
ChildProductSchema.index({ parent_id: 1, is_active: 1 });
ChildProductSchema.index({ parent_id: 1, color: 1, is_active: 1 });
ChildProductSchema.index({ parent_id: 1, size: 1, is_active: 1 });
ChildProductSchema.index({ store_id: 1, sku: 1 }, { unique: true });
ChildProductSchema.index({ store_id: 1, is_active: 1 });
ChildProductSchema.index({ store_id: 1, color: 1, is_active: 1 });
ChildProductSchema.index({ barcode: 1 }, { sparse: true });
ChildProductSchema.index({ _id: 1, stock_quantity: 1, reserved_quantity: 1 });

const createProductModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Product', ParentProductSchema);
};

const createChildProductModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('ChildProduct', ChildProductSchema);
};

module.exports = { createProductModel, createChildProductModel, ParentProductSchema, ChildProductSchema };