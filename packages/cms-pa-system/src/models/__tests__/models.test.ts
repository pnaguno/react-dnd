/**
 * Unit tests for data models
 * Validates model structure and type safety
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
} from '../index';

describe('Data Models', () => {
  describe('Enums', () => {
    it('should have correct PAStatus values', () => {
      expect(PAStatus.DRAFT).toBe('draft');
      expect(PAStatus.PENDING_VALIDATION).toBe('pending-validation');
      expect(PAStatus.VALIDATED).toBe('validated');
      expect(PAStatus.SUBMITTED).toBe('submitted');
      expect(PAStatus.IN_REVIEW).toBe('in-review');
      expect(PAStatus.APPROVED).toBe('approved');
      expect(PAStatus.DENIED).toBe('denied');
      expect(PAStatus.MORE_INFO_REQUIRED).toBe('more-info-required');
      expect(PAStatus.CANCELLED).toBe('cancelled');
      expect(PAStatus.ERROR).toBe('error');
    });

    it('should have correct Priority values', () => {
      expect(Priority.URGENT).toBe('urgent');
      expect(Priority.STANDARD).toBe('standard');
    });

    it('should have correct SubmissionMethod values', () => {
      expect(SubmissionMethod.FHIR).toBe('fhir');
      expect(SubmissionMethod.X12).toBe('x12');
    });

    it('should have correct WorkflowState values', () => {
      expect(WorkflowState.PENDING).toBe('pending');
      expect(WorkflowState.IN_PROGRESS).toBe('in-progress');
      expect(WorkflowState.COMPLETED).toBe('completed');
      expect(WorkflowState.FAILED).toBe('failed');
      expect(WorkflowState.PAUSED).toBe('paused');
    });

    it('should have correct AuditAction values', () => {
      expect(AuditAction.CREATE).toBe('create');
      expect(AuditAction.UPDATE).toBe('update');
      expect(AuditAction.SUBMIT).toBe('submit');
      expect(AuditAction.APPROVE).toBe('approve');
      expect(AuditAction.DENY).toBe('deny');
    });

    it('should have correct AuditOutcome values', () => {
      expect(AuditOutcome.SUCCESS).toBe('success');
      expect(AuditOutcome.FAILURE).toBe('failure');
      expect(AuditOutcome.PARTIAL).toBe('partial');
    });
  });

  describe('PARequest Interface', () => {
    it('should create a valid PARequest object', () => {
      const now = new Date().toISOString();
      
      const paRequest: PARequest = {
        id: 'PA-12345',
        status: PAStatus.DRAFT,
        priority: Priority.STANDARD,
        patient: {
          id: 'patient-123',
          demographics: {
            name: {
              family: 'Doe',
              given: ['John'],
            },
            birthDate: '1980-01-01',
            gender: 'male',
            address: {
              line1: '123 Main St',
              city: 'Springfield',
              state: 'IL',
              postalCode: '62701',
              country: 'US',
            },
          },
          memberId: 'MEM123456',
          coverageInfo: [],
        },
        requestingProvider: {
          npi: '1234567890',
          name: {
            family: 'Smith',
            given: ['Jane'],
          },
          organization: {
            id: 'org-123',
            name: 'Springfield Medical Center',
            identifier: [],
            address: {
              line1: '456 Hospital Rd',
              city: 'Springfield',
              state: 'IL',
              postalCode: '62701',
              country: 'US',
            },
            active: true,
          },
          contactInfo: {
            phone: '555-0100',
            email: 'dr.smith@example.com',
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
        createdAt: now,
        updatedAt: now,
      };

      expect(paRequest.id).toBe('PA-12345');
      expect(paRequest.status).toBe(PAStatus.DRAFT);
      expect(paRequest.priority).toBe(Priority.STANDARD);
      expect(paRequest.patient.id).toBe('patient-123');
      expect(paRequest.requestingProvider.npi).toBe('1234567890');
    });
  });

  describe('CreatePARequestInput Interface', () => {
    it('should create a valid CreatePARequestInput object', () => {
      const input: CreatePARequestInput = {
        priority: Priority.URGENT,
        patient: {
          id: 'patient-456',
          demographics: {
            name: {
              family: 'Johnson',
              given: ['Mary'],
            },
            birthDate: '1975-05-15',
            gender: 'female',
            address: {
              line1: '789 Oak Ave',
              city: 'Chicago',
              state: 'IL',
              postalCode: '60601',
              country: 'US',
            },
          },
          memberId: 'MEM789012',
          coverageInfo: [],
        },
        requestingProvider: {
          npi: '9876543210',
          name: {
            family: 'Brown',
            given: ['Robert'],
          },
          organization: {
            id: 'org-456',
            name: 'Chicago Health System',
            identifier: [],
            address: {
              line1: '321 Medical Plaza',
              city: 'Chicago',
              state: 'IL',
              postalCode: '60601',
              country: 'US',
            },
            active: true,
          },
          contactInfo: {
            phone: '555-0200',
          },
        },
        serviceRequest: {
          serviceType: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '363679005',
              display: 'Imaging',
            }],
          },
          diagnosis: [],
          procedure: [],
          supportingDocumentation: [],
        },
      };

      expect(input.priority).toBe(Priority.URGENT);
      expect(input.patient.id).toBe('patient-456');
      expect(input.requestingProvider.npi).toBe('9876543210');
    });
  });

  describe('UpdatePARequestInput Interface', () => {
    it('should create a valid UpdatePARequestInput object with partial updates', () => {
      const update: UpdatePARequestInput = {
        status: PAStatus.VALIDATED,
        priority: Priority.URGENT,
        notes: 'Updated priority to urgent',
      };

      expect(update.status).toBe(PAStatus.VALIDATED);
      expect(update.priority).toBe(Priority.URGENT);
      expect(update.notes).toBe('Updated priority to urgent');
    });

    it('should allow partial patient updates', () => {
      const update: UpdatePARequestInput = {
        patient: {
          memberId: 'NEW-MEM-ID',
        },
      };

      expect(update.patient?.memberId).toBe('NEW-MEM-ID');
    });
  });

  describe('PARequestSearchCriteria Interface', () => {
    it('should create valid search criteria', () => {
      const criteria: PARequestSearchCriteria = {
        status: [PAStatus.SUBMITTED, PAStatus.IN_REVIEW],
        priority: [Priority.URGENT],
        patientId: 'patient-123',
        submittedAfter: '2024-01-01T00:00:00Z',
        limit: 50,
        offset: 0,
      };

      expect(criteria.status).toHaveLength(2);
      expect(criteria.priority).toContain(Priority.URGENT);
      expect(criteria.patientId).toBe('patient-123');
      expect(criteria.limit).toBe(50);
    });

    it('should allow empty search criteria', () => {
      const criteria: PARequestSearchCriteria = {};
      expect(criteria).toBeDefined();
    });
  });

  describe('Patient Interface', () => {
    it('should create a valid Patient object', () => {
      const patient: Patient = {
        id: 'patient-789',
        demographics: {
          name: {
            family: 'Williams',
            given: ['Sarah', 'Jane'],
            prefix: ['Dr.'],
          },
          birthDate: '1990-12-25',
          gender: 'female',
          address: {
            line1: '555 Elm Street',
            line2: 'Apt 3B',
            city: 'Boston',
            state: 'MA',
            postalCode: '02101',
            country: 'US',
          },
          telecom: {
            phone: '555-0300',
            email: 'sarah.williams@example.com',
          },
        },
        memberId: 'MEM-WILLIAMS-001',
        coverageInfo: [{
          id: 'coverage-1',
          identifier: [{
            system: 'http://example.org/coverage',
            value: 'COV-12345',
          }],
          status: 'active',
          beneficiary: 'patient-789',
          payor: {
            id: 'payor-1',
            name: 'Blue Cross Blue Shield',
            identifier: 'BCBS-001',
          },
        }],
      };

      expect(patient.id).toBe('patient-789');
      expect(patient.demographics.name.given).toHaveLength(2);
      expect(patient.coverageInfo).toHaveLength(1);
      expect(patient.coverageInfo[0].status).toBe('active');
    });
  });

  describe('Provider Interface', () => {
    it('should create a valid Provider object', () => {
      const provider: Provider = {
        npi: '1122334455',
        name: {
          family: 'Anderson',
          given: ['Michael'],
          suffix: ['MD'],
        },
        organization: {
          id: 'org-789',
          name: 'Boston Medical Associates',
          identifier: [{
            system: 'http://example.org/org',
            value: 'ORG-789',
          }],
          address: {
            line1: '100 Medical Center Dr',
            city: 'Boston',
            state: 'MA',
            postalCode: '02101',
            country: 'US',
          },
          active: true,
        },
        contactInfo: {
          phone: '555-0400',
          email: 'dr.anderson@bma.example.com',
          fax: '555-0401',
        },
        specialty: 'Cardiology',
        qualification: [{
          code: 'MD',
          issuer: 'State Medical Board',
        }],
      };

      expect(provider.npi).toBe('1122334455');
      expect(provider.specialty).toBe('Cardiology');
      expect(provider.qualification).toHaveLength(1);
    });
  });

  describe('Type Safety', () => {
    it('should enforce PAStatus enum values', () => {
      const status: PAStatus = PAStatus.APPROVED;
      expect(Object.values(PAStatus)).toContain(status);
    });

    it('should enforce Priority enum values', () => {
      const priority: Priority = Priority.URGENT;
      expect(Object.values(Priority)).toContain(priority);
    });

    it('should enforce SubmissionMethod enum values', () => {
      const method: SubmissionMethod = SubmissionMethod.FHIR;
      expect(Object.values(SubmissionMethod)).toContain(method);
    });
  });
});
