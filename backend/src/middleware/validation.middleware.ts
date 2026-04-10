import { Request, Response, NextFunction } from 'express';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates that all required environment variables are set
 * Throws error if any critical variable is missing
 */
export const validateEnvironment = (): void => {
  // Only truly critical vars — app cannot function without these
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL',
  ];

  // Optional but warn if missing
  const optionalEnvVars = [
    'ZOHO_EMAIL',
    'ZOHO_APP_PASSWORD',
    'CLOUDINARY_CLOUD_NAME',
    'REDIS_URL',
  ];

  const missing: string[] = [];
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar] || process.env[envVar]?.trim() === '') {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Check your .env file and ensure all required variables are set.`
    );
  }

  // Warn about optional missing vars
  optionalEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Optional env var not set: ${envVar} — related features will be disabled`);
    }
  });

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret === 'fallback-secret' || jwtSecret === 'secret' || jwtSecret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET is too weak. Use at least 32 random characters.');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be at least 32 characters long in production');
    }
  }

  console.log('✅ Environment validation passed');
};

/**
 * Request size limiter middleware
 * Prevents large payload DoS attacks
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] as string || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request payload too large',
      maxSize: '10MB'
    });
  }

  next();
};

/**
 * Production-only middleware - enforce HTTPS
 */
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    if (protocol !== 'https') {
      return res.redirect(`https://${req.get('host')}${req.originalUrl}`);
    }

    // HSTS header
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
};
