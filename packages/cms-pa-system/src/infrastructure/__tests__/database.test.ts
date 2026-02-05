/**
 * Database infrastructure tests
 */

import { Pool } from 'pg';

// Mock pg module
jest.mock('pg', () => {
  const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
  const mockConnect = jest.fn().mockResolvedValue({
    query: mockQuery,
    release: jest.fn(),
  });
  const mockPool = jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    query: mockQuery,
    end: jest.fn().mockResolvedValue(undefined),
  }));
  return { Pool: mockPool };
});

describe('Database Infrastructure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Connection', () => {
    it('should create a connection pool with correct configuration', async () => {
      const { initializeDatabase } = await import('../database');
      
      await initializeDatabase();
      
      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: expect.any(String),
          port: expect.any(Number),
          database: expect.any(String),
          user: expect.any(String),
          password: expect.any(String),
        })
      );
    });

    it('should test connection on initialization', async () => {
      const { initializeDatabase } = await import('../database');
      
      await initializeDatabase();
      
      // Verify that a test query was executed
      const poolInstance = new Pool();
      const client = await poolInstance.connect();
      expect(client.query).toHaveBeenCalled();
    });
  });

  describe('Schema Initialization', () => {
    it('should create all required tables', async () => {
      const { initializeDatabase } = await import('../database');
      
      await initializeDatabase();
      
      const poolInstance = new Pool();
      const client = await poolInstance.connect();
      
      // Verify that CREATE TABLE queries were executed
      expect(client.query).toHaveBeenCalled();
    });
  });

  describe('Query Execution', () => {
    it('should execute queries through the pool', async () => {
      const { initializeDatabase, query } = await import('../database');
      
      await initializeDatabase();
      await query('SELECT * FROM pa_requests WHERE id = $1', ['test-id']);
      
      const poolInstance = new Pool();
      expect(poolInstance.connect).toHaveBeenCalled();
    });
  });

  describe('Transaction Management', () => {
    it('should handle transactions with BEGIN, COMMIT', async () => {
      const { initializeDatabase, transaction } = await import('../database');
      
      await initializeDatabase();
      
      await transaction(async (client) => {
        await client.query('INSERT INTO pa_requests VALUES ($1)', ['test']);
        return 'success';
      });
      
      const poolInstance = new Pool();
      const client = await poolInstance.connect();
      
      // Verify BEGIN and COMMIT were called
      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error', async () => {
      const { initializeDatabase, transaction } = await import('../database');
      
      await initializeDatabase();
      
      try {
        await transaction(async (client) => {
          await client.query('INSERT INTO pa_requests VALUES ($1)', ['test']);
          throw new Error('Test error');
        });
      } catch (error) {
        // Expected error
      }
      
      const poolInstance = new Pool();
      const client = await poolInstance.connect();
      
      // Verify ROLLBACK was called
      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
