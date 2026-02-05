/**
 * Clinical data models for PA requests
 * Requirements: 1.1, 1.3
 */

import { CodeableConcept, DateTime, Period, Quantity, Reference } from './common';

/**
 * Diagnosis Information
 */
export interface Diagnosis {
  id?: string;
  code: CodeableConcept;
  onsetDateTime?: DateTime;
  recordedDate?: DateTime;
  severity?: CodeableConcept;
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  note?: string;
}

/**
 * Procedure Information
 */
export interface Procedure {
  id?: string;
  code: CodeableConcept;
  status: 'preparation' | 'in-progress' | 'not-done' | 'on-hold' | 'stopped' | 'completed' | 'entered-in-error' | 'unknown';
  performedDateTime?: DateTime;
  performedPeriod?: Period;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  bodySite?: CodeableConcept[];
  outcome?: CodeableConcept;
  note?: string;
}

/**
 * Document Reference for supporting documentation
 */
export interface DocumentReference {
  id: string;
  type: CodeableConcept;
  category?: CodeableConcept[];
  subject?: Reference;
  date: DateTime;
  author?: Reference[];
  description?: string;
  content: DocumentContent[];
  context?: DocumentContext;
}

/**
 * Document Content
 */
export interface DocumentContent {
  attachment: Attachment;
  format?: CodeableConcept;
}

/**
 * Attachment
 */
export interface Attachment {
  contentType: string;
  data?: string; // Base64 encoded data
  url?: string;
  size?: number;
  hash?: string; // SHA-1 hash
  title?: string;
  creation?: DateTime;
}

/**
 * Document Context
 */
export interface DocumentContext {
  encounter?: Reference[];
  event?: CodeableConcept[];
  period?: Period;
  facilityType?: CodeableConcept;
  practiceSetting?: CodeableConcept;
  sourcePatientInfo?: Reference;
  related?: Reference[];
}

/**
 * Service Request Information
 */
export interface ServiceRequest {
  serviceType: CodeableConcept;
  diagnosis: Diagnosis[];
  procedure: Procedure[];
  supportingDocumentation: DocumentReference[];
  quantity?: Quantity;
  occurrenceDateTime?: DateTime;
  occurrencePeriod?: Period;
  authoredOn?: DateTime;
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  note?: string;
}
