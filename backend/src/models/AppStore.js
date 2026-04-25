const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

// Sub-schemas
const AddressSchema = new mongoose.Schema({
  shop_number: { type: String },
  building_name: { type: String },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip_code: { type: String, required: true },
  landmark: { type: String }
}, { _id: false });

const LocationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number] }
}, { _id: false });

const BankDetailsSchema = new mongoose.Schema({
  account_number: { type: String },
  ifsc_code: { type: String },
  account_holder_name: { type: String }
}, { _id: false });

const BusinessHourSchema = new mongoose.Schema({
  day: { type: String },
  open: { type: String },
  close: { type: String },
  is_closed: { type: Boolean, default: false }
}, { _id: false });

const SocialLinksSchema = new mongoose.Schema({
  instagram: { type: String },
  whatsapp: { type: String }
}, { _id: false });

const StoreSchema = new mongoose.Schema(
  {
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },

    store_name: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, lowercase: true },
    description: { type: String },
    business_type: { type: String },
    logo_url: { type: String },
    banner_url: { type: String },
    store_phone: { type: String, required: true },
    store_email: { type: String, required: true },
    social_links: { type: SocialLinksSchema, default: {} },
    address: { type: AddressSchema, default: {} },
    location: { type: LocationSchema, default: { type: 'Point', coordinates: [0, 0] } },

    bank_details: { type: BankDetailsSchema, default: {}, select: false },
    gstin: { type: String, unique: true, sparse: true },
    fssai_license: { type: String },

    store_images: [{ type: String }],
    categories: [{ type: String }],

    business_hours: [BusinessHourSchema],

    delivery_radius_km: { type: Number, default: 10 },
    min_order_amount: { type: Number, default: 0 },
    delivery_fee: { type: Number, default: 0 },

    is_delivery_available: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true, index: true },
    status: { type: String, default: 'PENDING' },
    
    // Store approval workflow
    is_approved: { type: Boolean, default: false, index: true },
    approved_at: { type: Date },
    approved_by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    rejection_reason: { type: String },
    
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Generate slug before saving
StoreSchema.pre('save', function (next) {
  if (this.isModified('store_name')) {
    this.slug = this.store_name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

// Indexes
StoreSchema.index({ location: '2dsphere' });
StoreSchema.index({ slug: 1, retailer_id: 1 }, { unique: true, sparse: true });
StoreSchema.index({ store_name: 'text', description: 'text' });

const createStoreModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Store', StoreSchema);
};

module.exports = { createStoreModel, StoreSchema };