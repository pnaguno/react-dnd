/**
 * API Gateway with authentication and rate limiting
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { logger } from '../infrastructure/logger';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { paRequestRoutes } from './routes/pa-requests';
import { workflowRoutes } from './routes/workflows';
import { configRoutes } from './routes/config';
import { healthRoutes } from './routes/health';

export async function startApiGateway(): Promise<void> {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Health check (no auth required)
  app.use('/health', healthRoutes);

  // API routes with authentication
  const apiRouter = express.Router();
  apiRouter.use(authMiddleware);

  // Mount service routes
  apiRouter.use('/pa-requests', paRequestRoutes);
  apiRouter.use('/workflows', workflowRoutes);
  apiRouter.use('/config', configRoutes);

  app.use(`/api/${config.apiVersion}`, apiRouter);

  // Error handling
  app.use(errorHandler);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found',
    });
  });

  // Start server
  const server = app.listen(config.port, () => {
    logger.info(`API Gateway listening on port ${config.port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down API Gateway...');
    server.close(() => {
      logger.info('API Gateway shut down');
    });
  });
}