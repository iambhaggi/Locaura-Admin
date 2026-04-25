const mongoose = require('mongoose');
const { connectAdminMongoDB } = require('../config/database');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'users'
});

const createUserModel = async () => {
  const adminConnection = await connectAdminMongoDB();
  return adminConnection.model('User', UserSchema);
};

module.exports = {
  createUserModel,
  UserSchema,
};
