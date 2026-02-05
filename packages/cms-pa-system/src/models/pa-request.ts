/**
 * PA Request data model
 * Core interface for Prior Authorization requests
 * Requirements: 1.1, 1.3
 */

import { DateTime, PARequestId } from './common';
import { PAStatus, Priority } from './enums';
import { Patient } from './patient';
import { Provider } from './provider';
import { ServiceRequest } from './clinical';
import { SubmissionDetails } from './submission';
import { WorkflowContext, AutomationFlags } from './workflow';
import { AuditEntry } from './audit';

/**
 * PA Request
 * Complete Prior Authorization request with all required information
 */
export interface PARequest {
  // Identification
  id: PARequestId;
  status: PAStatus;
  priority: Priority;
  
  // Patient Information
  patient: Patient;
  
  // Provider Information
  requestingProvider: Provider;
  
  // Clinical Information
  serviceRequest: ServiceRequest;
  
  // Administrative
  submissionDetails?: SubmissionDetails;
  
  // Workflow
  workflowState?: WorkflowContext;
  automationFlags: AutomationFlags;
  
  // Audit
  auditTrail: AuditEntry[];
  
  // Timestamps
  createdAt: DateTime;
  updatedAt: DateTime;
  submittedAt?: DateTime;
  
  // Metadata
  version?: number;
  notes?: string;
}

/**
 * PA Request Creation Input
 * Minimal required data to create a new PA request
 */
export interface CreatePARequestInput {
  priority: Priority;
  patient: Patient;
  requestingProvider: Provider;
  serviceRequest: ServiceRequest;
  automationFlags?: Partial<AutomationFlags>;
  notes?: string;
}

/**
 * PA Request Update Input
 * Fields that can be updated on an existing PA request
 */
export interface UpdatePARequestInput {
  status?: PAStatus;
  priority?: Priority;
  patient?: Partial<Patient>;
  requestingProvider?: Partial<Provider>;
  serviceRequest?: Partial<ServiceRequest>;
  automationFlags?: Partial<AutomationFlags>;
  notes?: string;
}

/**
 * PA Request Search Criteria
 */
export interface PARequestSearchCriteria {
  status?: PAStatus[];
  priority?: Priority[];
  patientId?: string;
  providerId?: string;
  submittedAfter?: DateTime;
  submittedBefore?: DateTime;
  createdAfter?: DateTime;
  createdBefore?: DateTime;
  trackingId?: string;
  limit?: number;
  offset?: number;
}
