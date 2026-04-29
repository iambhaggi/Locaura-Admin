const mongoose = require('mongoose');
const { connectAdminMongoDB } = require('../config/database');

const auditLogSchema = new mongoose.Schema(
  {
    // Action performed
    action: {
      type: String,
      enum: [
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'EXPORT',
        'IMPORT',
        'UPDATE_SETTINGS',
        'UPDATE_SETTINGS_CATEGORY',
        'IMPORT_SETTINGS',
        'RESET_SETTINGS',
        'APPROVE',
        'REJECT',
        'SUSPEND',
        'ACTIVATE',
        'DEACTIVATE'
      ],
      required: true,
    },

    // User who performed the action (optional for system-level sync events)
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser'
    },

    // Resource affected
    resourceType: {
      type: String,
      enum: [
        'Settings',
        'User',
        'Product',
        'Order',
        'Payment',
        'Retailer',
        'Rider',
        'Consumer',
        'Category',
        'Store',
        'SupportTicket',
        'Payout',
        'Review'
      ],
    },

    resourceId: mongoose.Schema.Types.ObjectId,

    // Changes made
    changes: {
      old: mongoose.Schema.Types.Mixed,
      new: mongoose.Schema.Types.Mixed,
    },

    // Additional context
    metadata: {
      ipAddress: String,
      userAgent: String,
      endpoint: String,
      method: String,
      statusCode: Number,
      duration: Number, // in milliseconds
      errorMessage: String,
    },

    // Status of the action
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PARTIAL'],
      default: 'SUCCESS',
    },

    // Severity level
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },

    // Description
    description: String,

    // Tags for filtering
    tags: [String],
  },
  {
    timestamps: true,
    collection: 'audit_logs',
    // Add automatic TTL for audit logs (keep 1 year by default)
    expireAfterSeconds: 31536000, // 365 days
  }
);

// Indexes for efficient querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 });
auditLogSchema.index({ 'metadata.ipAddress': 1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ tags: 1 });

const createAuditLogModel = async () => {
  const adminConnection = await connectAdminMongoDB();
  return adminConnection.model('AuditLog', auditLogSchema);
};

module.exports = {
  createAuditLogModel,
  auditLogSchema,
};
