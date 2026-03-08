import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/express';

export const auth_middleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = decoded as AuthUser;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: 'Unauthorized', error: error });
    }
}