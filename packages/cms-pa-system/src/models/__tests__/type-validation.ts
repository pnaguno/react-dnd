/**
 * Type validation script
 * This file validates that all types compile correctly
 * Run with: npx tsc --noEmit type-validation.ts
 */

import {
  PARequest,
  PAStatus,
  Priority,
  SubmissionMethod,
  WorkflowState,
  Patient,
  Provider,
  CreatePARequestInput,
  UpdatePARequestInput,
  PARequestSearchCriteria,
  AuditAction,
  AuditOutcome,
  Coverage,
  ServiceRequest,
  AutomationFlags,
  AuditEntry,
} from '../index';

// Test 1: Create a complete PARequest object
const testPARequest: PARequest = {
  id: 'PA-TEST-001',
  status: PAStatus.DRAFT,
  priority: Priority.STANDARD,
  patient: {
    id: 'patient-001',
    demographics: {
      name: {
        family: 'Test',
        given: ['Patient'],
      },
      birthDate: '1980-01-01',
      gender: 'male',
      address: {
        line1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'US',
      },
    },
    memberId: 'MEM-001',
    coverageInfo: [],
  },
  requestingProvider: {
    npi: '1234567890',
    name: {
      family: 'Provider',
      given: ['Test'],
    },
    organization: {
      id: 'org-001',
      name: 'Test Organization',
      identifier: [],
      address: {
        line1: '456 Provider Ave',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'US',
      },
      active: true,
    },
    contactInfo: {
      phone: '555-0100',
    },
  },
  serviceRequest: {
    serviceType: {
      coding: [{
        system: 'http://snomed.info/sct',
        code: '387713003',
        display: 'Surgical procedure',
      }],
    },
    diagnosis: [],
    procedure: [],
    supportingDocumentation: [],
  },
  automationFlags: {
    autoPopulateEnabled: true,
    autoAttachDocuments: true,
    autoSubmitEnabled: false,
    requiresManualReview: true,
    eligibilityVerificationRequired: true,
  },
  auditTrail: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Test 2: Create input types
const createInput: CreatePARequestInput = {
  priority: Priority.URGENT,
  patient: testPARequest.patient,
  requestingProvider: testPARequest.requestingProvider,
  serviceRequest: testPARequest.serviceRequest,
};

// Test 3: Update input types
const updateInput: UpdatePARequestInput = {
  status: PAStatus.VALIDATED,
  priority: Priority.URGENT,
};

// Test 4: Search criteria
const searchCriteria: PARequestSearchCriteria = {
  status: [PAStatus.SUBMITTED, PAStatus.IN_REVIEW],
  priority: [Priority.URGENT],
  limit: 50,
};

// Test 5: Enum values
const allStatuses: PAStatus[] = [
  PAStatus.DRAFT,
  PAStatus.PENDING_VALIDATION,
  PAStatus.VALIDATED,
  PAStatus.SUBMITTED,
  PAStatus.IN_REVIEW,
  PAStatus.APPROVED,
  PAStatus.DENIED,
  PAStatus.MORE_INFO_REQUIRED,
  PAStatus.CANCELLED,
  PAStatus.ERROR,
];

const allPriorities: Priority[] = [
  Priority.URGENT,
  Priority.STANDARD,
];

const allSubmissionMethods: SubmissionMethod[] = [
  SubmissionMethod.FHIR,
  SubmissionMethod.X12,
];

// Test 6: Coverage type
const coverage: Coverage = {
  id: 'cov-001',
  identifier: [{
    system: 'http://example.org/coverage',
    value: 'COV-12345',
  }],
  status: 'active',
  beneficiary: 'patient-001',
  payor: {
    id: 'payor-001',
    name: 'Test Insurance',
    identifier: 'INS-001',
  },
};

// Test 7: Audit entry
const auditEntry: AuditEntry = {
  id: 'audit-001',
  timestamp: new Date().toISOString(),
  action: AuditAction.CREATE,
  actor: {
    id: 'user-001',
    type: 'user',
    name: 'Test User',
  },
  resource: {
    type: 'PARequest',
    id: 'PA-TEST-001',
  },
  outcome: AuditOutcome.SUCCESS,
};

console.log('✓ All type validations passed');
console.log('✓ PARequest interface is correctly defined');
console.log('✓ All enums are properly typed');
console.log('✓ Supporting interfaces compile successfully');
