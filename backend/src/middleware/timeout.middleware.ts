import { Request, Response, NextFunction } from 'express';

/**
 * Request timeout middleware
 * Prevents requests from hanging indefinitely
 *
 * Timeouts (adjust based on expected operation times):
 * - General API: 30 seconds
 * - Database queries: 10 seconds (configured in Prisma)
 * - Long operations: 60 seconds (file uploads, processing)
 */

// Timeout configurations (in milliseconds)
export const TIMEOUTS = {
  GENERAL: 30 * 1000,      // 30 seconds for most API calls
  DATABASE: 10 * 1000,     // 10 seconds for DB queries
  LONG_OPERATION: 60 * 1000, // 60 seconds for long-running tasks
  AUTH: 5 * 1000,          // 5 seconds for login/logout
} as const;

/**
 * Timeout middleware that rejects requests after specified duration
 */
export const timeout = (milliseconds: number): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip timeout for health check and webhooks (if any)
    if (req.path === '/api/health' || req.path === '/api/webhooks') {
      return next();
    }

    res.setHeader('X-Timeout', `${milliseconds}ms`);

    // Set timeout on response
    res.setTimeout(milliseconds, () => {
      // This callback fires when timeout is reached
      if (!res.headersSent) {
        res.status(504).json({
          error: 'Request timeout',
          message: 'The request took too long to complete',
          timeout: `${milliseconds}ms`
        });
      } else {
        // Headers already sent, just destroy connection
        res.destroy();
      }
    });

    next();
  };
};

/**
 * Database query timeout (no-op for now, Prisma manages its own timeouts)
 * Kept for API compatibility
 */
export const databaseTimeout = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Database-Timeout', `${TIMEOUTS.DATABASE}ms`);
  next();
};
