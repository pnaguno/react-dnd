/**
 * Property-Based Tests for Tracking ID Generation
 * Feature: cms-electronic-pa-submission, Property 2: Unique Tracking Identifier Generation
 * **Validates: Requirements 1.3**
 */

import * as fc from 'fast-check';
import { generateTrackingId, isValidTrackingId } from '../tracking-id';

describe('Property 2: Unique Tracking Identifier Generation', () => {
  /**
   * Property: All generated tracking identifiers SHALL be unique across the entire system
   * 
   * This property verifies that when generating multiple tracking IDs,
   * no two IDs are ever the same, ensuring uniqueness across all PA requests.
   */
  it('should generate unique tracking identifiers for any number of requests', () => {
    fc.assert(
      fc.property(
        // Generate a random number of tracking IDs (between 1 and 1000)
        fc.integer({ min: 1, max: 1000 }),
        (count) => {
          // Generate the specified number of tracking IDs
          const trackingIds = new Set<string>();
          
          for (let i = 0; i < count; i++) {
            const trackingId = generateTrackingId();
            
            // Verify the tracking ID is valid
            expect(isValidTrackingId(trackingId)).toBe(true);
            
            // Check that this tracking ID hasn't been generated before
            expect(trackingIds.has(trackingId)).toBe(false);
            
            // Add to the set
            trackingIds.add(trackingId);
          }
          
          // Verify that we have exactly 'count' unique tracking IDs
          expect(trackingIds.size).toBe(count);
        }
      ),
      {
        numRuns: 100, // Run 100 iterations as specified in the design
        verbose: true,
      }
    );
  });

  /**
   * Property: All tracking identifiers SHALL follow the expected format
   * 
   * This property verifies that all generated tracking IDs conform to
   * the PA-{UUID} format specification.
   */
  it('should generate tracking identifiers in the correct format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (count) => {
          for (let i = 0; i < count; i++) {
            const trackingId = generateTrackingId();
            
            // Verify format: PA-{UUID}
            expect(trackingId).toMatch(/^PA-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(trackingId.startsWith('PA-')).toBe(true);
            expect(isValidTrackingId(trackingId)).toBe(true);
          }
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  /**
   * Property: Tracking identifiers SHALL remain unique across concurrent generation
   * 
   * This property simulates concurrent PA request creation and verifies
   * that tracking IDs remain unique even when generated simultaneously.
   */
  it('should generate unique tracking identifiers across concurrent operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 100 }),
        async (concurrentCount) => {
          // Simulate concurrent generation
          const promises = Array.from({ length: concurrentCount }, () =>
            Promise.resolve(generateTrackingId())
          );
          
          const trackingIds = await Promise.all(promises);
          const uniqueIds = new Set(trackingIds);
          
          // All tracking IDs should be unique
          expect(uniqueIds.size).toBe(concurrentCount);
          
          // All should be valid
          trackingIds.forEach(id => {
            expect(isValidTrackingId(id)).toBe(true);
          });
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  /**
   * Property: Tracking identifiers SHALL be non-empty strings
   * 
   * This property verifies that generated tracking IDs are always
   * valid, non-empty strings.
   */
  it('should never generate empty or invalid tracking identifiers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (count) => {
          for (let i = 0; i < count; i++) {
            const trackingId = generateTrackingId();
            
            // Should not be empty
            expect(trackingId).toBeTruthy();
            expect(trackingId.length).toBeGreaterThan(0);
            
            // Should be a string
            expect(typeof trackingId).toBe('string');
            
            // Should be valid
            expect(isValidTrackingId(trackingId)).toBe(true);
          }
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });
});
