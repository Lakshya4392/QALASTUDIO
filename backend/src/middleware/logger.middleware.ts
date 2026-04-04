import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Define log levels based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create Winston logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'qala-studios-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport in development
if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request ID generation for tracing
let requestIdCounter = 0;
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || `req-${++requestIdCounter}-${Date.now()}`;
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.userId,
      requestId: (req as any).requestId,
    };

    if (res.statusCode >= 500) {
      logger.error('Request failed', { ...logData });
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', { ...logData });
    } else {
      logger.info('Request completed', { ...logData });
    }
  });

  next();
};

export default logger;
