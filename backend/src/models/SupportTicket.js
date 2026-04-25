const mongoose = require('mongoose');
const { connectAdminMongoDB } = require('../config/database');

const SupportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  raisedBy: {
    type: String,
    enum: ['user', 'retailer', 'delivery_partner'],
    required: true
  },
  raisedById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId
  },
  category: {
    type: String
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  collection: 'support_tickets'
});

const createSupportTicketModel = async () => {
  const adminConnection = await connectAdminMongoDB();
  return adminConnection.model('SupportTicket', SupportTicketSchema);
};

module.exports = {
  createSupportTicketModel,
  SupportTicketSchema,
};
