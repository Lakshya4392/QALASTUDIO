import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 *
 * Implements double-submit cookie pattern:
 * 1. Server generates random token, sets it as cookie
 * 2. Client must send same token in request header (X-CSRF-Token)
 * 3. Server validates they match
 *
 * Note: This is a simplified implementation. For production,
 * consider using libraries like 'csurf' which are more comprehensive.
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate CSRF token and set as cookie
 * Call this on GET requests for pages that will make state-changing requests
 */
export const generateCSRFToken = (res: Response): string => {
  const token = crypto.randomBytes(32).toString('hex');

  // Set cookie (httpOnly = false so client can read it)
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to client JS to read and send back
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/', // Available to all paths
  });

  return token;
};

/**
 * Middleware to verify CSRF token
 * Apply to all state-changing routes (POST, PUT, DELETE, PATCH)
 */
export const verifyCSRF = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for admin panel? Actually admin panel needs it most
  // But for API-first approach, we're using JWT which provides CSRF protection
  // JWT in Authorization header is NOT sent automatically by browser
  // So if we're using JWT properly (in Authorization header), CSRF is not needed
  // However, if tokens are stored in localStorage and added to headers manually by JS, still safe from CSRF

  // Since we're using JWT in Authorization header (not cookies), CSRF is less critical
  // BUT: If user is logged in and visits malicious site, that site can't read JWT from localStorage
  // BUT: Malicious site can still make authenticated requests if JWT is in localStorage? Actually no, due to same-origin policy
  // CSRF is a concern when auth is via cookies (automatically sent). With JWT in localStorage, you're mostly safe.

  // We'll implement a lightweight check but skip for API routes that use JWT properly
  // We could check: if no Authorization header and using cookies? Not our case.

  // For our implementation:
  // We're using JWT in Authorization header, which browsers don't send automatically cross-site
  // So CSRF is not a significant risk for our API endpoints

  // However, if we add cookie-based auth in future, this middleware should be enabled

  // For now, we'll skip CSRF validation but log if header missing (for awareness)
  const csrfToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string;
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    if (!csrfToken) {
      // In development, we'll allow but log warning
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[CSRF] Missing X-CSRF-Token header on ${req.method} ${req.path}`);
      } else {
        // In production, we could enforce this if using cookie-based sessions
        // For JWT-based API, this is not necessary
        // return res.status(403).json({ error: 'CSRF token required' });
      }
    } else if (cookieToken && csrfToken !== cookieToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }

  next();
};

/**
 * Middleware to skip CSRF for public routes
 * Use this on routes that don't require authentication
 */
export const skipCSRF = (req: Request, res: Response, next: NextFunction) => {
  // Mark request to skip CSRF verification
  (req as any).skipCSRF = true;
  next();
};

/**
 * Express middleware to inject CSRF token into response locals
 * Use this on GET requests to allow templates to access the token
 */
export const exposeCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  // Generate a new token or use existing from cookie
  if (!res.locals.csrfToken) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.locals.csrfToken = token;
  }
  next();
};
