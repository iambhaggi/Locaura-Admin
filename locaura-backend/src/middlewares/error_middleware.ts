import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Standard Error Response Middleware
 * Captures all errors and sends a JSON response with success: false
 */
const error_handler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];

    if (!(err instanceof ApiError)) {
        // If it's a generic error, log it
        console.error("Unhandled Error:", err);
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        data: null,
        errors: errors
    });
};

export { error_handler };
