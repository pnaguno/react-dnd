# CMS Electronic PA Submission System - Data Models

This directory contains all TypeScript interfaces and data models for the CMS Electronic PA Submission System.

## Overview

The data models are organized into logical modules that represent different aspects of the Prior Authorization system:

- **Core Models**: PARequest, Patient, Provider
- **Clinical Data**: Diagnosis, Procedure, ServiceRequest, DocumentReference
- **Workflow**: AutomationFlags, WorkflowContext, WorkflowDefinition
- **Audit**: AuditEntry, AuditAction, AuditOutcome
- **Submission**: SubmissionDetails, SubmissionResponse, SubmissionResult
- **Common Types**: Shared types used across models

## Requirements Mapping

This implementation satisfies:
- **Requirement 1.1**: Electronic PA Request Submission data structures
- **Requirement 1.3**: Unique tracking identifier support

## File Structure

```
models/
├── index.ts                 # Central export for all models
├── enums.ts                 # Enumerations (PAStatus, Priority, SubmissionMethod)
├── common.ts                # Common types (DateTime, Identifiers, Address, etc.)
├── pa-request.ts            # Main PARequest interface
├── patient.ts               # Patient and Coverage models
├── provider.ts              # Provider and Organization models
├── clinical.ts              # Clinical data models
├── workflow.ts              # Workflow and automation models
├── audit.ts                 # Audit trail models
├── submission.ts            # Submission-related models
└── __tests__/
    ├── models.test.ts       # Unit tests for data models
    └── type-validation.ts   # TypeScript type validation
```

## Key Interfaces

### PARequest

The main interface representing a Prior Authorization request:

```typescript
interface PARequest {
  id: PARequestId;
  status: PAStatus;
  priority: Priority;
  patient: Patient;
  requestingProvider: Provider;
  serviceRequest: ServiceRequest;
  submissionDetails?: SubmissionDetails;
  workflowState?: WorkflowContext;
  automationFlags: AutomationFlags;
  auditTrail: AuditEntry[];
  createdAt: DateTime;
  updatedAt: DateTime;
  submittedAt?: DateTime;
  version?: number;
  notes?: string;
}
```

### Enums

#### PAStatus
Tracks the lifecycle state of a PA request:
- `DRAFT` - Initial state
- `PENDING_VALIDATION` - Awaiting validation
- `VALIDATED` - Passed validation
- `SUBMITTED` - Sent to payer
- `IN_REVIEW` - Under payer review
- `APPROVED` - Approved by payer
- `DENIED` - Denied by payer
- `MORE_INFO_REQUIRED` - Additional information needed
- `CANCELLED` - Cancelled by provider
- `ERROR` - Error state

#### Priority
Determines response time requirements:
- `URGENT` - 72 hour response required
- `STANDARD` - 7 day response required

#### SubmissionMethod
Electronic transmission format:
- `FHIR` - HL7 FHIR R4 format
- `X12` - X12 278 transaction format

## Usage Examples

### Creating a PA Request

```typescript
import { CreatePARequestInput, Priority } from './models';

const input: CreatePARequestInput = {
  priority: Priority.STANDARD,
  patient: {
    id: 'patient-123',
    demographics: {
      name: { family: 'Doe', given: ['John'] },
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
    name: { family: 'Smith', given: ['Jane'] },
    organization: {
      id: 'org-123',
      name: 'Springfield Medical',
      identifier: [],
      address: { /* ... */ },
      active: true,
    },
    contactInfo: { phone: '555-0100' },
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
};
```

### Updating a PA Request

```typescript
import { UpdatePARequestInput, PAStatus } from './models';

const update: UpdatePARequestInput = {
  status: PAStatus.VALIDATED,
  notes: 'Validation completed successfully',
};
```

### Searching PA Requests

```typescript
import { PARequestSearchCriteria, PAStatus, Priority } from './models';

const criteria: PARequestSearchCriteria = {
  status: [PAStatus.SUBMITTED, PAStatus.IN_REVIEW],
  priority: [Priority.URGENT],
  submittedAfter: '2024-01-01T00:00:00Z',
  limit: 50,
  offset: 0,
};
```

## FHIR Alignment

The data models are designed to align with HL7 FHIR R4 resources:

- **PARequest** → FHIR Claim resource
- **Patient** → FHIR Patient resource
- **Provider** → FHIR Practitioner resource
- **Organization** → FHIR Organization resource
- **Coverage** → FHIR Coverage resource
- **ServiceRequest** → FHIR ServiceRequest resource
- **Diagnosis** → FHIR Condition resource
- **Procedure** → FHIR Procedure resource
- **DocumentReference** → FHIR DocumentReference resource

## Type Safety

All models are fully typed with TypeScript for compile-time type checking:

- Enums prevent invalid status values
- Required fields are enforced at compile time
- Optional fields are clearly marked with `?`
- Partial types support incremental updates
- Union types restrict values to valid options

## Testing

Unit tests are provided in `__tests__/models.test.ts` to verify:
- Enum values are correct
- Interfaces can be instantiated with valid data
- Type safety is enforced
- Partial updates work correctly
- Search criteria are flexible

Run tests with:
```bash
npm test models.test.ts
```

## Standards Compliance

The data models comply with:
- **CMS-0057-F**: Final rule requirements for electronic PA
- **HL7 FHIR R4**: Fast Healthcare Interoperability Resources
- **Da Vinci PAS**: Prior Authorization Support implementation guide
- **X12 278**: Health Care Services Review transaction
- **HIPAA**: Privacy and security requirements

## Future Enhancements

Potential future additions:
- Additional clinical data types (lab results, imaging)
- Enhanced workflow states for complex scenarios
- Integration with additional FHIR resources
- Support for bulk operations
- Real-time notification models
