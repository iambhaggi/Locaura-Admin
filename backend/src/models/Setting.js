const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  type: {
    type: String,
    enum: ['system', 'payment', 'delivery', 'content'],
    default: 'system'
  },
  description: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'settings'
});

module.exports = mongoose.model('Setting', SettingSchema);
