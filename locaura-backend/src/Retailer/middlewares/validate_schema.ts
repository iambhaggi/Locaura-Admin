import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { Logger } from '../../utils/logger';

export const validate_schema = (schema: z.ZodSchema) => {
    Logger.info(`Validating schema`, 'ValidateSchema');
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error: any) {
            if (error instanceof ZodError || error?.name === 'ZodError') {
                const issues = error.issues || error.errors || [];
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: issues.map((issue: any) => ({
                        path: issue.path?.join('.') || 'unknown',
                        message: issue.message
                    }))
                });
            }
            return res.status(500).json({ success: false, message: 'Internal Server Error during validation' });
        }
    };
};
