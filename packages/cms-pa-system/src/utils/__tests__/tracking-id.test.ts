/**
 * Unit Tests for Tracking ID Generation
 * Complements property-based tests with specific examples
 */

import { generateTrackingId, isValidTrackingId } from '../tracking-id';

describe('Tracking ID Generation - Unit Tests', () => {
  describe('generateTrackingId', () => {
    it('should generate a tracking ID', () => {
      const trackingId = generateTrackingId();
      expect(trackingId).toBeDefined();
      expect(typeof trackingId).toBe('string');
      expect(trackingId.length).toBeGreaterThan(0);
    });

    it('should generate tracking IDs with PA- prefix', () => {
      const trackingId = generateTrackingId();
      expect(trackingId.startsWith('PA-')).toBe(true);
    });

    it('should generate different tracking IDs on subsequent calls', () => {
      const id1 = generateTrackingId();
      const id2 = generateTrackingId();
      const id3 = generateTrackingId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate tracking IDs in UUID v4 format', () => {
      const trackingId = generateTrackingId();
      // Remove PA- prefix and check UUID format
      const uuid = trackingId.substring(3);
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidPattern.test(uuid)).toBe(true);
    });
  });

  describe('isValidTrackingId', () => {
    it('should validate correct tracking ID format', () => {
      const trackingId = generateTrackingId();
      expect(isValidTrackingId(trackingId)).toBe(true);
    });

    it('should accept valid PA- prefixed UUID v4', () => {
      const validIds = [
        'PA-550e8400-e29b-41d4-a716-446655440000',
        'PA-6ba7b810-9dad-41d1-80b4-00c04fd430c8',
        'PA-f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ];

      validIds.forEach(id => {
        expect(isValidTrackingId(id)).toBe(true);
      });
    });

    it('should reject tracking IDs without PA- prefix', () => {
      const invalidIds = [
        '550e8400-e29b-41d4-a716-446655440000',
        'REQ-550e8400-e29b-41d4-a716-446655440000',
        'pa-550e8400-e29b-41d4-a716-446655440000', // lowercase
      ];

      invalidIds.forEach(id => {
        expect(isValidTrackingId(id)).toBe(false);
      });
    });

    it('should reject malformed UUIDs', () => {
      const invalidIds = [
        'PA-not-a-uuid',
        'PA-12345',
        'PA-',
        'PA-550e8400-e29b-41d4-a716', // incomplete
        'PA-550e8400-e29b-41d4-a716-446655440000-extra', // too long
      ];

      invalidIds.forEach(id => {
        expect(isValidTrackingId(id)).toBe(false);
      });
    });

    it('should reject empty or null values', () => {
      expect(isValidTrackingId('')).toBe(false);
      expect(isValidTrackingId('   ')).toBe(false);
    });

    it('should reject non-UUID v4 versions', () => {
      // UUID v1 (time-based)
      expect(isValidTrackingId('PA-550e8400-e29b-11d4-a716-446655440000')).toBe(false);
      // UUID v3 (MD5 hash)
      expect(isValidTrackingId('PA-550e8400-e29b-31d4-a716-446655440000')).toBe(false);
      // UUID v5 (SHA-1 hash)
      expect(isValidTrackingId('PA-550e8400-e29b-51d4-a716-446655440000')).toBe(false);
    });
  });

  describe('uniqueness', () => {
    it('should generate 100 unique tracking IDs', () => {
      const ids = new Set<string>();
      const count = 100;

      for (let i = 0; i < count; i++) {
        const id = generateTrackingId();
        ids.add(id);
      }

      expect(ids.size).toBe(count);
    });

    it('should generate 1000 unique tracking IDs', () => {
      const ids = new Set<string>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        const id = generateTrackingId();
        ids.add(id);
      }

      expect(ids.size).toBe(count);
    });
  });
});
