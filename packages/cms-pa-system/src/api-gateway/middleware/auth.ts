/**
 * Authentication middleware using JWT
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { logger } from '../../infrastructure/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    npi?: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    try {
      const decoded = jwt.verify(token, config.security.jwtSecret) as any;
      
      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        npi: decoded.npi,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication token has expired',
        });
        return;
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid authentication token',
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during authentication',
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}
