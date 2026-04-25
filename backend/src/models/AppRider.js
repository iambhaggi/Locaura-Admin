const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const RiderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number']
    },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    profile_photo: { type: String },
    date_of_birth: { type: Date },

    phone_verified: { type: Boolean, default: false },
    otp: { type: String },
    otp_expiry: { type: Date },

    aadhaar_number: { type: String, sparse: true },
    pan_number: { type: String, sparse: true },
    driving_license_number: { type: String, sparse: true },
    driving_license_expiry: { type: Date },

    vehicle_type: { type: String, enum: ['bike', 'scooter', 'cycle'] },
    vehicle_number: { type: String },
    vehicle_rc: { type: String },

    kyc_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },

    fcm_token: { type: String },

    current_location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] }
    },

    is_online: { type: Boolean, default: false },
    is_available: { type: Boolean, default: false },
    service_radius: { type: Number, default: 5 },
    assigned_zones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Zone' }],

    total_deliveries: { type: Number, default: 0 },
    total_earnings: { type: Number, default: 0 },
    current_order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    bank_account_number: { type: String },
    ifsc_code: { type: String },
    upi_id: { type: String },

    average_rating: { type: Number, default: 0 },
    total_ratings: { type: Number, default: 0 },
    cancellation_rate: { type: Number, default: 0 },
    late_delivery_rate: { type: Number, default: 0 },

    status: { type: String, default: 'PENDING' },
    is_approved: { type: Boolean, default: false, index: true },
    approved_at: { type: Date },
    approved_by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    rejection_reason: { type: String },
    onboarded_at: { type: Date },
    last_active_at: { type: Date }
  },
  { timestamps: true }
);

// Indexes
RiderSchema.index({ phone: 1 });
RiderSchema.index({ current_location: '2dsphere' });
RiderSchema.index({ is_online: 1, is_available: 1, status: 1 });
RiderSchema.index({ current_order_id: 1 });

const createRiderModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Rider', RiderSchema);
};

module.exports = { createRiderModel, RiderSchema };