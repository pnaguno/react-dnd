/**
 * Database connection and management
 */

import { Pool, PoolClient } from 'pg';
import { config } from '../../config';
import { logger } from '../logger';

let pool: Pool | null = null;

export async function initializeDatabase(): Promise<void> {
  try {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('Database connection established');

    // Initialize schemas
    await initializeSchemas();
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function initializeSchemas(): Promise<void> {
  const client = await getPool().connect();
  try {
    // Create PA requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pa_requests (
        id UUID PRIMARY KEY,
        status VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        patient_id VARCHAR(255) NOT NULL,
        patient_member_id VARCHAR(255),
        requesting_provider_npi VARCHAR(10) NOT NULL,
        requesting_provider_name VARCHAR(255) NOT NULL,
        service_type_code VARCHAR(50),
        service_type_display VARCHAR(255),
        submission_method VARCHAR(20),
        payer_endpoint VARCHAR(500),
        tracking_id VARCHAR(255) UNIQUE,
        workflow_state JSONB,
        automation_flags JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT valid_status CHECK (status IN (
          'draft', 'pending-validation', 'validated', 'submitted',
          'in-review', 'approved', 'denied', 'more-info-required',
          'cancelled', 'error'
        )),
        CONSTRAINT valid_priority CHECK (priority IN ('urgent', 'standard')),
        CONSTRAINT valid_submission_method CHECK (submission_method IN ('FHIR', 'X12'))
      );
    `);

    // Create indexes for PA requests
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pa_requests_status ON pa_requests(status);
      CREATE INDEX IF NOT EXISTS idx_pa_requests_patient_id ON pa_requests(patient_id);
      CREATE INDEX IF NOT EXISTS idx_pa_requests_provider_npi ON pa_requests(requesting_provider_npi);
      CREATE INDEX IF NOT EXISTS idx_pa_requests_tracking_id ON pa_requests(tracking_id);
      CREATE INDEX IF NOT EXISTS idx_pa_requests_created_at ON pa_requests(created_at);
    `);

    // Create audit trail table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_trail (
        id UUID PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(50) NOT NULL,
        actor_id VARCHAR(255) NOT NULL,
        actor_type VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        changes JSONB,
        metadata JSONB,
        ip_address INET,
        user_agent TEXT
      );
    `);

    // Create indexes for audit trail
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_trail_actor ON audit_trail(actor_id);
      CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp);
    `);

    // Create configuration table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_configuration (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        description TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create workflow rules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_rules (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        rule_type VARCHAR(50) NOT NULL,
        conditions JSONB NOT NULL,
        actions JSONB NOT NULL,
        priority INTEGER DEFAULT 0,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create payer endpoints table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payer_endpoints (
        id UUID PRIMARY KEY,
        payer_id VARCHAR(255) NOT NULL UNIQUE,
        payer_name VARCHAR(255) NOT NULL,
        fhir_endpoint VARCHAR(500),
        x12_endpoint VARCHAR(500),
        supports_fhir BOOLEAN DEFAULT false,
        supports_x12 BOOLEAN DEFAULT false,
        supports_eligibility BOOLEAN DEFAULT false,
        capabilities JSONB,
        authentication JSONB,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create retry queue table
    await client.query(`
      CREATE TABLE IF NOT EXISTS retry_queue (
        id UUID PRIMARY KEY,
        request_id UUID NOT NULL REFERENCES pa_requests(id),
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        next_retry_at TIMESTAMP WITH TIME ZONE,
        last_error TEXT,
        error_details JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_retry_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
      );
    `);

    // Create index for retry queue
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_retry_queue_next_retry ON retry_queue(next_retry_at) WHERE status = 'pending';
      CREATE INDEX IF NOT EXISTS idx_retry_queue_request_id ON retry_queue(request_id);
    `);

    logger.info('Database schemas initialized');
  } catch (error) {
    logger.error('Failed to initialize schemas:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection closed');
  }
}
