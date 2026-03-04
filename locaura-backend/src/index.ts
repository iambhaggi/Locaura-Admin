import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Logger } from './utils/logger';


const app = express();
const port = process.env.PORT || 8000;

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


// Start the server
app.listen(port, () => {
  Logger.success(`Server is running on http://localhost:${port}`, 'Server');
});
// sample log
// Logger.info('This is an info message', 'Sample');
// Logger.success('This is a success message', 'Sample');
// Logger.warn('This is a warning message', 'Sample');
// Logger.error('This is an error message', 'Sample');
