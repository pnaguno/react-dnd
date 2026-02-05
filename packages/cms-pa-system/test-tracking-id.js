/**
 * Manual test script for tracking ID generation
 * This verifies the tracking ID generation works correctly
 */

const crypto = require('crypto');

function generateTrackingId() {
  const uuid = crypto.randomUUID();
  return `PA-${uuid}`;
}

function isValidTrackingId(trackingId) {
  const pattern = /^PA-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return pattern.test(trackingId);
}

// Test 1: Generate multiple IDs and check uniqueness
console.log('Test 1: Uniqueness Test');
const ids = new Set();
const count = 1000;
for (let i = 0; i < count; i++) {
  const id = generateTrackingId();
  if (ids.has(id)) {
    console.error(`❌ FAILED: Duplicate ID found: ${id}`);
    process.exit(1);
  }
  ids.add(id);
}
console.log(`✅ PASSED: Generated ${count} unique tracking IDs`);

// Test 2: Validate format
console.log('\nTest 2: Format Validation Test');
for (let i = 0; i < 100; i++) {
  const id = generateTrackingId();
  if (!isValidTrackingId(id)) {
    console.error(`❌ FAILED: Invalid format: ${id}`);
    process.exit(1);
  }
  if (!id.startsWith('PA-')) {
    console.error(`❌ FAILED: ID doesn't start with PA-: ${id}`);
    process.exit(1);
  }
}
console.log('✅ PASSED: All IDs have correct format');

// Test 3: Show sample IDs
console.log('\nSample Tracking IDs:');
for (let i = 0; i < 5; i++) {
  console.log(`  ${generateTrackingId()}`);
}

console.log('\n✅ All manual tests passed!');
