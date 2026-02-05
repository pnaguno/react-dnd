/**
 * Health check routes
 */

import { Router, Request, Response } from 'express';
import { getPool } from '../../infrastructure/database';

export const healthRoutes = Router();

healthRoutes.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const pool = getPool();
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        api: 'up',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    });
  }
});

healthRoutes.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all services are ready
    const pool = getPool();
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});
