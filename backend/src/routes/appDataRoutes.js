const express = require('express');
const router = express.Router();
const appDataController = require('../controllers/appDataController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const adminOnly = authorize(['admin', 'super_admin']);

// Consumers
router.get('/consumers', appDataController.getConsumers);
router.post('/consumers', appDataController.createConsumer);
router.delete('/consumers/:consumerId', appDataController.deleteConsumer);

// Categories
router.get('/categories', appDataController.getCategories);

// Retailers
router.get('/retailers', appDataController.getRetailers);
router.post('/retailers', appDataController.createRetailer);
router.delete('/retailers/:retailerId', appDataController.deleteRetailer);

// Carts
router.post('/carts', appDataController.createCart);
router.delete('/carts/:consumerId', appDataController.deleteCart);

// Stores
router.post('/stores', appDataController.createStore);
router.get('/stores/pending', authenticate, adminOnly, appDataController.getPendingStores);
router.patch('/stores/:storeId/approve', authenticate, adminOnly, appDataController.approveStore);
router.patch('/stores/:storeId/reject', authenticate, adminOnly, appDataController.rejectStore);
router.get('/stores', appDataController.getStores);
router.delete('/stores/:storeId', appDataController.deleteStore);

// Products
router.get('/products', appDataController.getProducts);

// Product Variants (Child Products)
router.get('/product-variants', appDataController.getProductVariants);

// Orders
router.get('/orders', appDataController.getOrders);
router.post('/orders', appDataController.createOrder);
router.delete('/orders/:orderId', appDataController.deleteOrder);

// Payments
router.get('/payments', appDataController.getPayments);
router.post('/payments', appDataController.createPayment);
router.delete('/payments/:paymentId', appDataController.deletePayment);

// Reviews
router.get('/reviews', appDataController.getReviews);

// Payouts
router.get('/payouts', appDataController.getPayouts);
router.post('/payouts', appDataController.createPayout);
router.delete('/payouts/:payoutId', appDataController.deletePayout);

// Rider earnings / payouts collections
router.get('/riderearnings', appDataController.getRiderEarnings);
router.get('/riderpayouts', appDataController.getRiderPayouts);

module.exports = router;