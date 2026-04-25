const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const PaymentSchema = new mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    consumer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true, index: true },
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    method: { type: String, enum: ['COD', 'UPI', 'CARD', 'WALLET', 'NETBANKING'], required: true },
    gateway: { type: String, enum: ['razorpay', 'manual', 'cod'], required: true },

    gateway_order_id: { type: String, sparse: true, index: true },
    gateway_payment_id: { type: String, sparse: true },
    gateway_signature: { type: String },

    status: { type: String, required: true },
    failure_reason: { type: String },

    refund_id: { type: String },
    refunded_at: { type: Date },
    refund_amount: { type: Number },

    metadata: { type: Map, of: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

const createPaymentModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Payment', PaymentSchema);
};

module.exports = { createPaymentModel, PaymentSchema };