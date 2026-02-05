/**
 * Enums for CMS Electronic PA Submission System
 * Requirements: 1.1, 1.3
 */

/**
 * PA Request Status
 * Tracks the lifecycle state of a Prior Authorization request
 */
export enum PAStatus {
  DRAFT = "draft",
  PENDING_VALIDATION = "pending-validation",
  VALIDATED = "validated",
  SUBMITTED = "submitted",
  IN_REVIEW = "in-review",
  APPROVED = "approved",
  DENIED = "denied",
  MORE_INFO_REQUIRED = "more-info-required",
  CANCELLED = "cancelled",
  ERROR = "error"
}

/**
 * Priority Level
 * Determines response time requirements per CMS regulations
 */
export enum Priority {
  URGENT = "urgent",    // 72 hour response required
  STANDARD = "standard" // 7 day response required
}

/**
 * Submission Method
 * Electronic transmission format used for PA submission
 */
export enum SubmissionMethod {
  FHIR = "fhir",  // HL7 FHIR R4 format
  X12 = "x12"     // X12 278 transaction format
}

/**
 * Workflow State
 * Internal workflow processing state
 */
export enum WorkflowState {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  FAILED = "failed",
  PAUSED = "paused"
}
