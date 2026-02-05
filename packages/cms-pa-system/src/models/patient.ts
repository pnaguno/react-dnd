/**
 * Patient-related data models
 * Requirements: 1.1, 1.3
 */

import { Address, ContactInfo, DateTime, HumanName, Identifier } from './common';

/**
 * Patient Demographics
 */
export interface PatientDemographics {
  name: HumanName;
  birthDate: string; // YYYY-MM-DD format
  gender: 'male' | 'female' | 'other' | 'unknown';
  address: Address;
  telecom?: ContactInfo;
  maritalStatus?: string;
  language?: string;
}

/**
 * Insurance Coverage Information
 */
export interface Coverage {
  id: string;
  identifier: Identifier[];
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type?: string;
  subscriber?: {
    id: string;
    name: HumanName;
    relationship: string;
  };
  beneficiary: string; // Reference to Patient
  payor: {
    id: string;
    name: string;
    identifier: string;
  };
  period?: {
    start: DateTime;
    end?: DateTime;
  };
  groupId?: string;
  planId?: string;
  network?: string;
}

/**
 * Patient Information
 */
export interface Patient {
  id: string;
  demographics: PatientDemographics;
  memberId: string;
  coverageInfo: Coverage[];
  identifiers?: Identifier[];
}
