/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known operational errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
}
