const mongoose = require('mongoose');

// Define schemas for admin database (mirror of app data)
const AdminConsumerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  address: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'consumers' });

const AdminCategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'categories' });

const AdminRetailerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  businessType: String,
  address: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'retailers' });

const AdminProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer' },
  images: [String],
  isAvailable: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'products' });

const AdminOrderSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer' },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer' },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: String,
  deliveryLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'orders' });

const AdminPaymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer' },
  amount: Number,
  method: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'payments' });

const AdminReviewSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer' },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'reviews' });

const AdminRiderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  vehicleType: String,
  vehicleNumber: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'riders' });

const AdminRiderEarningsSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  date: { type: Date, default: Date.now },
  totalEarnings: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'rider_earnings' });

const AdminRiderPayoutSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending'
  },
  processedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'rider_payouts' });

class SyncService {
  constructor() {
    this.appConnection = null;
    this.adminConnection = null;
    this.changeStreams = [];
    this.isRunning = false;
  }

  async startContinuousSync(appConnection, adminConnection) {
    this.appConnection = appConnection;
    this.adminConnection = adminConnection;

    try {
      console.log('🔄 Starting continuous sync service...');

      // Initial sync of all data
      await this.initialSync();

      // Start change stream watchers
      await this.startChangeStreams();

      this.isRunning = true;
      console.log('✅ Continuous sync service active');

    } catch (error) {
      console.error('❌ Failed to start sync service:', error);
      throw error;
    }
  }

  async initialSync() {
    console.log('📥 Performing initial data sync...');

    const collections = [
      { name: 'consumers', schema: AdminConsumerSchema },
      { name: 'categories', schema: AdminCategorySchema },
      { name: 'retailers', schema: AdminRetailerSchema },
      { name: 'products', schema: AdminProductSchema },
      { name: 'orders', schema: AdminOrderSchema },
      { name: 'payments', schema: AdminPaymentSchema },
      { name: 'reviews', schema: AdminReviewSchema },
      { name: 'riders', schema: AdminRiderSchema },
      { name: 'rider_earnings', schema: AdminRiderEarningsSchema },
      { name: 'rider_payouts', schema: AdminRiderPayoutSchema }
    ];

    for (const collection of collections) {
      try {
        // Get data from app database using Mongoose model
        const AppModel = this.appConnection.model(collection.name, collection.schema);
        const documents = await AppModel.find({}).lean();

        if (documents.length > 0) {
          // Create model for admin database
          const AdminModel = this.adminConnection.model(collection.name, collection.schema);

          // Clear existing data and insert new
          await AdminModel.deleteMany({});
          await AdminModel.insertMany(documents);

          console.log(`✓ Synced ${documents.length} ${collection.name}`);
        } else {
          console.log(`ℹ️ No data found in ${collection.name}`);
        }
      } catch (error) {
        console.error(`❌ Error syncing ${collection.name}:`, error.message);
      }
    }

    console.log('✅ Initial sync completed');
  }

  async startChangeStreams() {
    console.log('👀 Setting up change stream watchers...');

    const collections = [
      'consumers', 'categories', 'retailers', 'products',
      'orders', 'payments', 'reviews', 'riders',
      'rider_earnings', 'rider_payouts'
    ];

    for (const collectionName of collections) {
      try {
        // Use Mongoose model to get the collection
        const AppModel = this.appConnection.model(collectionName, this.getSchemaForCollection(collectionName));
        const collection = AppModel.collection;

        // Watch for changes
        const changeStream = collection.watch();

        changeStream.on('change', async (change) => {
          await this.handleChange(collectionName, change);
        });

        // Handle errors
        changeStream.on('error', (error) => {
          console.error(`❌ Change stream error for ${collectionName}:`, error);
        });

        this.changeStreams.push(changeStream);
        console.log(`✓ Watching ${collectionName} for changes`);

      } catch (error) {
        console.error(`❌ Failed to watch ${collectionName}:`, error.message);
      }
    }
  }

  async handleChange(collectionName, change) {
    try {
      const AdminModel = this.adminConnection.model(collectionName, this.getSchemaForCollection(collectionName));

      switch (change.operationType) {
        case 'insert':
          await AdminModel.create(change.fullDocument);
          console.log(`➕ Inserted ${collectionName}: ${change.documentKey._id}`);
          break;

        case 'update':
          await AdminModel.findByIdAndUpdate(
            change.documentKey._id,
            change.updateDescription.updatedFields,
            { new: true }
          );
          console.log(`🔄 Updated ${collectionName}: ${change.documentKey._id}`);
          break;

        case 'delete':
          await AdminModel.findByIdAndDelete(change.documentKey._id);
          console.log(`🗑️ Deleted ${collectionName}: ${change.documentKey._id}`);
          break;

        case 'replace':
          await AdminModel.findByIdAndUpdate(
            change.documentKey._id,
            change.fullDocument,
            { new: true, upsert: true }
          );
          console.log(`🔄 Replaced ${collectionName}: ${change.documentKey._id}`);
          break;
      }
    } catch (error) {
      console.error(`❌ Error handling change in ${collectionName}:`, error);
    }
  }

  getSchemaForCollection(collectionName) {
    const schemas = {
      consumers: AdminConsumerSchema,
      categories: AdminCategorySchema,
      retailers: AdminRetailerSchema,
      products: AdminProductSchema,
      orders: AdminOrderSchema,
      payments: AdminPaymentSchema,
      reviews: AdminReviewSchema,
      riders: AdminRiderSchema,
      rider_earnings: AdminRiderEarningsSchema,
      rider_payouts: AdminRiderPayoutSchema
    };
    return schemas[collectionName];
  }

  async stopSync() {
    console.log('🛑 Stopping sync service...');

    this.changeStreams.forEach(stream => {
      stream.close();
    });

    this.changeStreams = [];
    this.isRunning = false;
    console.log('✅ Sync service stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      appConnected: !!this.appConnection,
      adminConnected: !!this.adminConnection,
      activeStreams: this.changeStreams.length
    };
  }
}

module.exports = new SyncService();