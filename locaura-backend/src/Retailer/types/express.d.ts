
export interface AuthUser {
  id: string;
  phone?: string;
  role: string;
}

/**
 * Augments the Express Request interface to include an optional authenticated user.
 * 
 * @remarks
 * This declaration extends the global Express namespace to add user information
 * to incoming requests after authentication middleware has processed them.
 * 
 * @property {AuthUser} [user] - The authenticated user object, if the request has been authenticated.
 * Will be undefined for unauthenticated requests. Can be used to extend Express objects like Request
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
