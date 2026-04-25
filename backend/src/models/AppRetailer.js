const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const RetailerSchema = new mongoose.Schema(
  {
    retailer_name: { type: String },
    pan_card: { type: String, sparse: true },

    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    phone_verified: { type: Boolean, default: false },
    email_verified: { type: Boolean, default: false },

    otp: { type: String },
    otp_expiry: { type: Date },

    fcm_token: { type: String },
  },
  { timestamps: true }
);

const createRetailerModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Retailer', RetailerSchema);
};

module.exports = { createRetailerModel, RetailerSchema };