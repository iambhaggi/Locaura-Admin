const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const NotificationSchema = new mongoose.Schema(
  {
    recipient_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    recipient_role: { type: String, enum: ['consumer', 'retailer', 'rider'], required: true },

    type: {
      type: String,
      enum: [
        'ORDER_PLACED', 'ORDER_ACCEPTED', 'ORDER_PACKED',
        'ORDER_SHIPPED', 'ORDER_DELIVERED', 'PAYMENT_CONFIRMED',
        'NEW_DELIVERY_AVAILABLE'
      ],
      required: true
    },

    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Map, of: mongoose.Schema.Types.Mixed },

    is_read: { type: Boolean, default: false, index: true },
    read_at: { type: Date },
    sent_via_fcm: { type: Boolean, default: false }
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient_id: 1, createdAt: -1 });

const createNotificationModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Notification', NotificationSchema);
};

module.exports = { createNotificationModel, NotificationSchema };