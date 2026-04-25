const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const RiderEarningSchema = new mongoose.Schema(
  {
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true, index: true },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },

    delivery_fee_earned: { type: Number, required: true },
    bonus: { type: Number, default: 0 },

    status: { type: String, enum: ['pending', 'settled'], default: 'pending' },
    settled_at: { type: Date }
  },
  { timestamps: true }
);

const RiderPayoutSchema = new mongoose.Schema(
  {
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true, index: true },
    period: {
      from: { type: Date, required: true },
      to: { type: Date, required: true }
    },
    total_deliveries: { type: Number, default: 0, required: true },
    total_earnings: { type: Number, default: 0, required: true },
    status: { type: String, enum: ['pending', 'processing', 'paid', 'failed'], default: 'pending' },
    payout_reference: { type: String },
    paid_at: { type: Date }
  },
  { timestamps: true }
);

RiderPayoutSchema.index({ rider_id: 1, 'period.from': 1, 'period.to': 1 });

const createRiderEarningModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('RiderEarning', RiderEarningSchema);
};

const createRiderPayoutModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('RiderPayout', RiderPayoutSchema);
};

module.exports = {
  createRiderEarningModel,
  createRiderPayoutModel,
  RiderEarningSchema,
  RiderPayoutSchema
};