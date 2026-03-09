import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Logger } from './utils/logger';
import auth_routes from './routes/auth_routes';
import store_routes from './routes/store.routes';

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
app.use('/api/v1/auth', auth_routes);
app.use('/api/v1/stores', store_routes);

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    Logger.success(`Server is running on http://localhost:${port}`, 'Server');
  });
}

export default app;
// sample log
// Logger.info('This is an info message', 'Sample');
// Logger.success('This is a success message', 'Sample');
// Logger.warn('This is a warning message', 'Sample');
// Logger.error('This is an error message', 'Sample');
