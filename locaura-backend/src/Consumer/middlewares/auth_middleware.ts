import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../../utils/logger';
import { AuthUser } from '../../Retailer/types/express';

export const consumer_auth_middleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authorization token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
        
        // Relax role enforcement in development/testing to allow cross-role testing
        const isProd = process.env.NODE_ENV === 'production';
        if (decoded.role !== 'consumer' && isProd) {
            Logger.warn(`Invalid role access attempted by user ID: ${decoded.id}: ${decoded.role}`, 'ConsumerAuthMiddleware');
            return res.status(403).json({ success: false, message: 'Access denied: Requires consumer privileges' });
        }

        req.user = decoded;
        Logger.info(req.user, 'ConsumerContext');
        
        next();
    } catch (error) {
        Logger.error("Error in consumer_auth_middleware: ", error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
