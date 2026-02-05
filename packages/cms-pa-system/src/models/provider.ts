/**
 * Provider-related data models
 * Requirements: 1.1, 1.3
 */

import { Address, ContactInfo, HumanName, Identifier } from './common';

/**
 * Organization Information
 */
export interface Organization {
  id: string;
  name: string;
  identifier: Identifier[];
  type?: string;
  address: Address;
  telecom?: ContactInfo;
  active: boolean;
}

/**
 * Provider/Practitioner Information
 */
export interface Provider {
  npi: string; // National Provider Identifier
  name: HumanName;
  organization: Organization;
  contactInfo: ContactInfo;
  identifiers?: Identifier[];
  specialty?: string;
  qualification?: Qualification[];
}

/**
 * Provider Qualification
 */
export interface Qualification {
  identifier?: Identifier[];
  code: string;
  period?: {
    start: string;
    end?: string;
  };
  issuer?: string;
}
