/**
 * Submission-related data models
 * Requirements: 1.1, 1.3
 */

import { DateTime } from './common';
import { SubmissionMethod } from './enums';

/**
 * Submission Details
 * Information about the electronic submission of a PA request
 */
export interface SubmissionDetails {
  submittedAt: DateTime;
  submissionMethod: SubmissionMethod;
  payerEndpoint: string;
  trackingId: string;
  transmissionId?: string;
  responseReceivedAt?: DateTime;
  responseDetails?: SubmissionResponse;
  retryCount?: number;
  lastRetryAt?: DateTime;
}

/**
 * Submission Response
 */
export interface SubmissionResponse {
  status: 'accepted' | 'rejected' | 'pending';
  responseCode?: string;
  responseMessage?: string;
  payerReferenceId?: string;
  receivedAt: DateTime;
  additionalInfo?: Record<string, any>;
}

/**
 * Submission Result
 */
export interface SubmissionResult {
  success: boolean;
  trackingId?: string;
  error?: SubmissionError;
  timestamp: DateTime;
}

/**
 * Submission Error
 */
export interface SubmissionError {
  code: string;
  message: string;
  category: 'validation' | 'network' | 'authentication' | 'authorization' | 'system' | 'payer';
  retryable: boolean;
  details?: any;
}
