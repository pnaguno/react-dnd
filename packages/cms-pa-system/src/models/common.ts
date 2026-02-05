/**
 * Common types and interfaces for CMS Electronic PA Submission System
 * Requirements: 1.1, 1.3
 */

/**
 * Unique identifier for PA requests
 */
export type PARequestId = string;

/**
 * ISO 8601 DateTime string
 */
export type DateTime = string;

/**
 * Codeable Concept following FHIR standard
 * Represents a value that is usually supplied by providing a reference to one or more terminologies
 */
export interface CodeableConcept {
  coding: Coding[];
  text?: string;
}

/**
 * Coding following FHIR standard
 * A reference to a code defined by a terminology system
 */
export interface Coding {
  system: string;
  code: string;
  display?: string;
  version?: string;
}

/**
 * Contact Information
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  fax?: string;
  address?: Address;
}

/**
 * Address Information
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Human Name
 */
export interface HumanName {
  family: string;
  given: string[];
  prefix?: string[];
  suffix?: string[];
  text?: string;
}

/**
 * Identifier
 * A unique identifier for an entity
 */
export interface Identifier {
  system: string;
  value: string;
  type?: CodeableConcept;
}

/**
 * Reference to another resource
 */
export interface Reference {
  reference: string;
  type?: string;
  display?: string;
}

/**
 * Period of time
 */
export interface Period {
  start: DateTime;
  end?: DateTime;
}

/**
 * Quantity with unit
 */
export interface Quantity {
  value: number;
  unit: string;
  system?: string;
  code?: string;
}
