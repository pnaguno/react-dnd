/**
 * Audit trail data models
 * Requirements: 1.1, 1.3, 5.4
 */

import { DateTime } from './common';

/**
 * Audit Entry
 * Records all system actions and data changes for compliance
 */
export interface AuditEntry {
  id: string;
  timestamp: DateTime;
  action: AuditAction;
  actor: AuditActor;
  resource: AuditResource;
  outcome: AuditOutcome;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Action Types
 */
export enum AuditAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  SUBMIT = "submit",
  APPROVE = "approve",
  DENY = "deny",
  CANCEL = "cancel",
  VALIDATE = "validate",
  TRANSMIT = "transmit",
  RECEIVE = "receive",
  LOGIN = "login",
  LOGOUT = "logout",
  ACCESS_DENIED = "access-denied"
}

/**
 * Audit Actor
 * Entity performing the action
 */
export interface AuditActor {
  id: string;
  type: 'user' | 'system' | 'service' | 'external';
  name: string;
  role?: string;
}

/**
 * Audit Resource
 * Resource being acted upon
 */
export interface AuditResource {
  type: string;
  id: string;
  version?: string;
}

/**
 * Audit Outcome
 */
export enum AuditOutcome {
  SUCCESS = "success",
  FAILURE = "failure",
  PARTIAL = "partial"
}
