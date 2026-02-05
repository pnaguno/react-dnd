/**
 * Authentication middleware tests
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { config } from '../../config';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should reject requests without authorization header', async () => {
      await authMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid token format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      await authMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should accept valid JWT tokens', async () => {
      const validToken = jwt.sign(
        {
          id: 'user-123',
          email: 'test@example.com',
          role: 'provider',
          npi: '1234567890',
        },
        config.security.jwtSecret,
        { expiresIn: '1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      await authMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe('user-123');
      expect(mockRequest.user?.email).toBe('test@example.com');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        {
          id: 'user-123',
          email: 'test@example.com',
          role: 'provider',
        },
        config.security.jwtSecret,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      await authMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication token has expired',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject tokens with invalid signature', async () => {
      const invalidToken = jwt.sign(
        {
          id: 'user-123',
          email: 'test@example.com',
          role: 'provider',
        },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${invalidToken}`,
      };

      await authMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'provider',
        npi: '1234567890',
      };
    });

    it('should allow access for users with required role', () => {
      const middleware = requireRole('provider', 'admin');

      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for users without required role', () => {
      const middleware = requireRole('admin');

      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated requests', () => {
      mockRequest.user = undefined;
      const middleware = requireRole('provider');

      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
