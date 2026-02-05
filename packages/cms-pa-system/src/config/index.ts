/**
 * Configuration management for CMS PA System
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'cms_pa_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // RabbitMQ Configuration
  messageQueue: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'cms_pa_events',
    queuePrefix: process.env.RABBITMQ_QUEUE_PREFIX || 'cms_pa',
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-min',
    tlsMinVersion: process.env.TLS_MIN_VERSION || 'TLSv1.3',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // External Services
  externalServices: {
    fhirBaseUrl: process.env.FHIR_BASE_URL || 'https://api.example.com/fhir',
    x12GatewayUrl: process.env.X12_GATEWAY_URL || 'https://x12.example.com',
    eligibilityApiUrl: process.env.ELIGIBILITY_API_URL || 'https://eligibility.example.com',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/cms-pa-system.log',
  },
};

// Validate required configuration
export function validateConfig() {
  const requiredEnvVars = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate encryption key length
  if (config.security.encryptionKey.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
}