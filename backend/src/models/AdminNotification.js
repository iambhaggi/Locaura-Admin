const mongoose = require('mongoose');
const { connectAdminMongoDB } = require('../config/database');

const AdminNotificationSchema = new mongoose.Schema(
  {
    recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', index: true },

    type: {
      type: String,
      enum: [
        'DATABASE_CHANGE',
        'AUDIT_LOG',
        'SYSTEM_ALERT',
        'USER_ACTIVITY',
        'SECURITY_EVENT'
      ],
      required: true
    },

    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Map, of: mongoose.Schema.Types.Mixed },

    is_read: { type: Boolean, default: false, index: true },
    read_at: { type: Date },

    // Link to related audit log if applicable
    audit_log_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AuditLog' },

    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    }
  },
  { timestamps: true }
);

AdminNotificationSchema.index({ recipient_id: 1, createdAt: -1 });
AdminNotificationSchema.index({ is_read: 1, createdAt: -1 });
AdminNotificationSchema.index({ type: 1, createdAt: -1 });

const createAdminNotificationModel = async () => {
  const adminConnection = await connectAdminMongoDB();
  return adminConnection.model('AdminNotification', AdminNotificationSchema);
};

module.exports = { createAdminNotificationModel, AdminNotificationSchema };