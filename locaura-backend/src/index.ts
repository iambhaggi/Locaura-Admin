import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Logger } from './utils/logger';
import { error_handler } from './middlewares/error_middleware';
import auth_routes from './Retailer/routes/auth_routes';
import store_routes from './Retailer/routes/store.routes';
import product_routes from './Retailer/routes/product.routes';
import payout_routes from './Retailer/routes/payout_routes';
import consumer_auth_routes from './Consumer/routes/auth_routes';
import consumer_cart_routes from './Consumer/routes/cart_routes';
import consumer_checkout_routes from './Consumer/routes/checkout_routes';
import consumer_store_routes from './Consumer/routes/store_routes';
import consumer_category_routes from './Consumer/routes/category_routes';
import consumer_order_routes from './Consumer/routes/order_routes';
import consumer_payment_routes from './Consumer/routes/payment_routes';
import retailer_order_routes from './Retailer/routes/order_routes';
import rider_auth_routes from './Rider/routes/auth_routes';
import rider_delivery_routes from './Rider/routes/delivery_routes';
import rider_payout_routes from './Rider/routes/payout_routes';

const app = express();
const port = process.env.PORT || 3000;
const mongo_uri = process.env.NODE_ENV === 'test'
  ? 'mongodb://localhost:27017/locaura-test'
  : process.env.MONGO_URI || 'mongodb://localhost:27017/locaura';

// Connect to MongoDB
mongoose.connect(mongo_uri)
  .then(() => Logger.success(`Successfully connected to MongoDB (${process.env.NODE_ENV === 'test' ? 'Test' : 'Dev'})`, 'Database'))
  .catch((error) => Logger.error(`Initial MongoDB connection error: ${error}`, 'Database'));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use((req: Request, res: Response, next) => {
    Logger.info(`${req.method} ${req.originalUrl}`, 'Router');
    next();
  });
}

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Locaura Backend API is running.',
  });
});

// all new routes register here
app.use('/api/v1/auth', auth_routes); // Retailer auth
app.use('/api/v1/stores', store_routes); // Retailer stores
app.use('/api/v1/stores/:store_id/products', product_routes); // Retailer products
app.use('/api/v1/retailers/payouts', payout_routes); // Retailer payouts
app.use('/api/v1/retailers/orders', retailer_order_routes); // Retailer order management

app.use('/api/v1/consumers/auth', consumer_auth_routes); // Consumer auth
app.use('/api/v1/consumers/cart', consumer_cart_routes); // Consumer Cart
app.use('/api/v1/consumers/checkout', consumer_checkout_routes); // Consumer Checkout
app.use('/api/v1/consumers/stores', consumer_store_routes); // Consumer store discovery
app.use('/api/v1/consumers/categories', consumer_category_routes); // Consumer categories
app.use('/api/v1/consumers/orders', consumer_order_routes); // Consumer order history
app.use('/api/v1/consumers/payments', consumer_payment_routes); // Consumer razorpay payments

app.use('/api/v1/riders/auth', rider_auth_routes); // Rider auth
app.use('/api/v1/riders/deliveries', rider_delivery_routes); // Rider delivery routes
app.use('/api/v1/riders/payouts', rider_payout_routes); // Rider payouts

// Error handling - Add at the end of all routes
app.use(error_handler);

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    Logger.success(`Server is running on http://localhost:${port}`, 'Server');
  });
}

export default app;
