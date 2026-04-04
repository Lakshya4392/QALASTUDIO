import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * Authentication middleware - protects admin routes
 * Throws 401 if token is missing or invalid
 * Now supports both Authorization header and httpOnly cookie
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Try to get token from Authorization header first, then from cookie (admin or user)
  const authHeader = req.headers.authorization;
  let token = authHeader?.replace('Bearer ', '');

  if (!token && req.cookies) {
    token = req.cookies.auth_token || req.cookies.user_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Critical: JWT_SECRET must be set in production
    console.error('CRITICAL: JWT_SECRET environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    (req as any).user = decoded; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role-based access control middleware
 * @param allowedRoles - Array of allowed admin roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
