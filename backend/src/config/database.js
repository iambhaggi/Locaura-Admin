const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connections only
let appConnection = null;
let adminConnection = null;

const connectAppMongoDB = async () => {
  try {
    if (appConnection) return appConnection;
    appConnection = await mongoose.createConnection(process.env.APP_MONGO_URI);
    console.log('✓ App MongoDB connected (source data)');
    return appConnection;
  } catch (error) {
    console.error('✗ App MongoDB connection error:', error);
    throw error;
  }
};

const connectAdminMongoDB = async () => {
  try {
    if (adminConnection) return adminConnection;
    adminConnection = await mongoose.createConnection(process.env.ADMIN_MONGO_URI);
    console.log('✓ Admin MongoDB connected (admin data storage)');
    return adminConnection;
  } catch (error) {
    console.error('✗ Admin MongoDB connection error:', error);
    throw error;
  }
};

module.exports = {
  connectAppMongoDB,
  connectAdminMongoDB
};
