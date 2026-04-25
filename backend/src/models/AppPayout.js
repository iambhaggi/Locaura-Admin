const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const PayoutSchema = new mongoose.Schema(
  {
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },

    period: {
      from: { type: Date, required: true },
      to: { type: Date, required: true }
    },

    total_orders: { type: Number, required: true, default: 0 },
    total_revenue: { type: Number, required: true, default: 0 },
    platform_fee: { type: Number, required: true, default: 0 },
    net_payout: { type: Number, required: true, default: 0 },

    status: { type: String, required: true },

    payout_reference: { type: String },
    paid_at: { type: Date }
  },
  { timestamps: true }
);

PayoutSchema.index({ store_id: 1, 'period.from': 1, 'period.to': 1 });

const createPayoutModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Payout', PayoutSchema);
};

module.exports = { createPayoutModel, PayoutSchema };