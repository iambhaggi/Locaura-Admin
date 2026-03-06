import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Logger } from './utils/logger';
import auth_routes from './routes/auth_routes';


const app = express();
const port = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI || 'mongodb://localhost:27017/locaura';

// Connect to MongoDB
mongoose.connect(mongo_uri)
  .then(() => Logger.success('Successfully connected to MongoDB', 'Database'))
  .catch((error) => Logger.error(`Initial MongoDB connection error: ${error}`, 'Database'));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Locaura Backend API is running.',
  });
});

// all new routes register here
app.use('/api/v1/auth', auth_routes);

// Start the server
app.listen(port, () => {
  Logger.success(`Server is running on http://localhost:${port}`, 'Server');
});
// sample log
// Logger.info('This is an info message', 'Sample');
// Logger.success('This is a success message', 'Sample');
// Logger.warn('This is a warning message', 'Sample');
// Logger.error('This is an error message', 'Sample');
