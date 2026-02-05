/**
 * CMS Electronic PA Submission System
 * Main entry point for the application
 */

import { config } from './config';
import { logger } from './infrastructure/logger';
import { initializeDatabase } from './infrastructure/database';
import { initializeMessageQueue } from './infrastructure/message-queue';
import { startApiGateway } from './api-gateway';

async function bootstrap() {
  try {
    logger.info('Starting CMS PA Submission System...');

    // Initialize infrastructure
    await initializeDatabase();
    logger.info('Database initialized');

    await initializeMessageQueue();
    logger.info('Message queue initialized');

    // Start API Gateway
    await startApiGateway();
    logger.info(`API Gateway started on port ${config.port}`);

    logger.info('CMS PA Submission System started successfully');
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

bootstrap();
