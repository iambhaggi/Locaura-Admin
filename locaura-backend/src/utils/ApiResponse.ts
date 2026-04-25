/**
 * Standard API response class
 * Ensures all responses have success, message and data fields
 */
// describe status codes 
// 200 OK - Request succeeded
// 201 Created - Resource created
// 204 No Content - Request succeeded but no content to return
// 400 Bad Request - Invalid request
// 401 Unauthorized - Invalid credentials
// 403 Forbidden - Insufficient permissions
// 404 Not Found - Resource not found
// 409 Conflict - Resource already exists
// 500 Internal Server Error - Unexpected error
class ApiResponse<T> {
    public success: boolean;
    public message: string;
    public data: T | null;

    constructor(statusCode: number, data: T | null, message: string = "Success") {
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }
}

export { ApiResponse };
