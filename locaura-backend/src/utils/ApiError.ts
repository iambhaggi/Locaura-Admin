/**
 * Custom Error class for API responses
 * This ensures all errors have a consistent structure
 */
class ApiError extends Error {
    public statusCode: number;
    public success: boolean;
    public message: string;
    public errors: any[];
    public data: any;

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: any[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
