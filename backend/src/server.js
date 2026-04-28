const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database - MongoDB only
const { connectAppMongoDB, connectAdminMongoDB } = require('./config/database');

// MongoDB connections
let appMongoConnection, adminMongoConnection;

const initializeDatabases = async () => {
  try {
    // Connect to both MongoDB databases
    appMongoConnection = await connectAppMongoDB();
    adminMongoConnection = await connectAdminMongoDB();

    console.log('✓ All MongoDB connections established');

    // Start continuous sync service
    const syncService = require('./services/syncService');
    await syncService.startContinuousSync(appMongoConnection, adminMongoConnection);

    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
};

// Routes (App Data Sync + Admin Management)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/consumers', require('./routes/consumerRoutes')); // Admin consumer management
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/app/riders', require('./routes/appRiderRoutes')); // App rider routes MUST come before /api/app
app.use('/api/app', require('./routes/appDataRoutes')); // App data routes (from friend's MongoDB)
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes')); // Notification routes

// Support deployed /v1 prefix as well
app.use('/v1/auth', require('./routes/authRoutes'));
app.use('/v1/admin/auth', require('./routes/authRoutes'));
app.use('/v1/users', require('./routes/userRoutes'));
app.use('/v1/consumers', require('./routes/consumerRoutes'));
app.use('/v1/admin', require('./routes/adminRoutes'));
app.use('/v1/app/riders', require('./routes/appRiderRoutes'));
app.use('/v1/app', require('./routes/appDataRoutes'));
app.use('/v1/support', require('./routes/supportRoutes'));
app.use('/v1/settings', require('./routes/settingsRoutes'));
app.use('/v1/notifications', require('./routes/notificationRoutes')); // Notification routes

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running',
    appMongoConnected: !!appMongoConnection,
    adminMongoConnected: !!adminMongoConnection
  });
});

// Start Server
const startServer = async () => {
  try {
    await initializeDatabases();

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log(`✓ Continuous sync active: App → Admin MongoDB`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
