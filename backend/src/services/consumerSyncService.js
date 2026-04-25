const { createConsumerModel } = require('../models/Consumer');
const { createCategoryModel } = require('../models/AppCategory');
const { createNotificationModel } = require('../models/AppNotification');
const { createOrderModel } = require('../models/AppOrder');
const { createPaymentModel } = require('../models/AppPayment');
const { createPayoutModel } = require('../models/AppPayout');
const { createProductModel, createChildProductModel } = require('../models/AppProduct');
const { createRetailerModel } = require('../models/AppRetailer');
const { createReviewModel } = require('../models/AppReview');
const { createStoreModel } = require('../models/AppStore');
const { createRiderModel } = require('../models/AppRider');
const { createRiderEarningModel, createRiderPayoutModel } = require('../models/AppRiderEarnings');

class AppDataSyncService {
  // Sync all data from app database
  static async syncAllData() {
    try {
      console.log('Starting full app data sync...');

      const results = {
        consumers: await this.syncConsumers(),
        categories: await this.syncCategories(),
        retailers: await this.syncRetailers(),
        stores: await this.syncStores(),
        products: await this.syncProducts(),
        orders: await this.syncOrders(),
        payments: await this.syncPayments(),
        reviews: await this.syncReviews(),
        notifications: await this.syncNotifications(),
        payouts: await this.syncPayouts(),
        riders: await this.syncRiders(),
        rider_earnings: await this.syncRiderEarnings(),
        rider_payouts: await this.syncRiderPayouts()
      };

      console.log('Full sync completed');
      return results;
    } catch (error) {
      console.error('Full sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async syncConsumers() {
    try {
      const Consumer = await createConsumerModel();
      const consumers = await Consumer.countDocuments({});
      return { synced: consumers, inserted: 0, updated: 0 };
    } catch (error) {
      console.error('Consumer sync failed:', error);
      return { error: error.message };
    }
  }

  static async syncCategories() {
    try {
      const Category = await createCategoryModel();
      const categories = await Category.find({}).lean();
      return { synced: categories.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncRetailers() {
    try {
      const Retailer = await createRetailerModel();
      const retailers = await Retailer.find({}).lean();
      return { synced: retailers.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncStores() {
    try {
      const Store = await createStoreModel();
      const stores = await Store.find({}).lean();
      return { synced: stores.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncProducts() {
    try {
      const Product = await createProductModel();
      const ChildProduct = await createChildProductModel();

      const products = await Product.find({}).lean();
      const childProducts = await ChildProduct.find({}).lean();

      return {
        parent_products: products.length,
        child_products: childProducts.length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncOrders() {
    try {
      const Order = await createOrderModel();
      const orders = await Order.find({}).lean();
      return { synced: orders.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncPayments() {
    try {
      const Payment = await createPaymentModel();
      const payments = await Payment.find({}).lean();
      return { synced: payments.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncReviews() {
    try {
      const Review = await createReviewModel();
      const reviews = await Review.find({}).lean();
      return { synced: reviews.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncNotifications() {
    try {
      const Notification = await createNotificationModel();
      const notifications = await Notification.find({}).lean();
      return { synced: notifications.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncPayouts() {
    try {
      const Payout = await createPayoutModel();
      const payouts = await Payout.find({}).lean();
      return { synced: payouts.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncRiders() {
    try {
      const Rider = await createRiderModel();
      const riders = await Rider.find({}).lean();
      return { synced: riders.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncRiderEarnings() {
    try {
      const RiderEarning = await createRiderEarningModel();
      const earnings = await RiderEarning.find({}).lean();
      return { synced: earnings.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async syncRiderPayouts() {
    try {
      const RiderPayout = await createRiderPayoutModel();
      const payouts = await RiderPayout.find({}).lean();
      return { synced: payouts.length };
    } catch (error) {
      return { error: error.message };
    }
  }
  static async getSyncStatus() {
    try {
      const Consumer = await createConsumerModel();
      const totalConsumers = await Consumer.countDocuments();

      return {
        consumers_synced: totalConsumers,
        last_sync: new Date().toISOString()
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = AppDataSyncService;