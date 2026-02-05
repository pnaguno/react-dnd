/**
 * Workflow and automation data models
 * Requirements: 1.1, 1.3
 */

import { DateTime } from './common';
import { WorkflowState } from './enums';

/**
 * Automation Flags
 * Controls automated processing behavior
 */
export interface AutomationFlags {
  autoPopulateEnabled: boolean;
  autoAttachDocuments: boolean;
  autoSubmitEnabled: boolean;
  requiresManualReview: boolean;
  eligibilityVerificationRequired: boolean;
}

/**
 * Workflow Context
 */
export interface WorkflowContext {
  workflowId: string;
  instanceId: string;
  state: WorkflowState;
  currentStep?: string;
  variables: Record<string, any>;
  startedAt: DateTime;
  completedAt?: DateTime;
  error?: WorkflowError;
}

/**
 * Workflow Error
 */
export interface WorkflowError {
  code: string;
  message: string;
  details?: any;
  timestamp: DateTime;
}

/**
 * Workflow Definition
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  steps: WorkflowStep[];
  rules: WorkflowRule[];
  active: boolean;
}

/**
 * Workflow Step
 */
export interface WorkflowStep {
  id: string;
  name: string;
  type: 'validation' | 'enrichment' | 'submission' | 'notification' | 'decision';
  config: Record<string, any>;
  nextSteps: string[];
  errorHandling?: ErrorHandlingConfig;
}

/**
 * Workflow Rule
 */
export interface WorkflowRule {
  id: string;
  name: string;
  condition: string; // Expression to evaluate
  action: string;
  priority: number;
  active: boolean;
}

/**
 * Error Handling Configuration
 */
export interface ErrorHandlingConfig {
  retryPolicy?: RetryPolicy;
  fallbackStep?: string;
  escalationRequired: boolean;
}

/**
 * Retry Policy
 */
export interface RetryPolicy {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelayMs: number;
  maxDelayMs: number;
}
