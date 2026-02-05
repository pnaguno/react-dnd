/**
 * Tracking ID Generation Utility
 * Generates unique tracking identifiers for PA requests
 * Requirements: 1.3
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique tracking identifier for a PA request
 * Format: PA-{UUID}
 * 
 * @returns A unique tracking identifier string
 */
export function generateTrackingId(): string {
  const uuid = uuidv4();
  return `PA-${uuid}`;
}

/**
 * Validates that a tracking ID follows the expected format
 * 
 * @param trackingId - The tracking ID to validate
 * @returns true if the tracking ID is valid, false otherwise
 */
export function isValidTrackingId(trackingId: string): boolean {
  // Format: PA-{UUID}
  const pattern = /^PA-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return pattern.test(trackingId);
}
