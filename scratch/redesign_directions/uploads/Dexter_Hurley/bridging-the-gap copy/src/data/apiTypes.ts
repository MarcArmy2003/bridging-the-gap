import { Case, CaseStatus, UserRole } from "../models/types";

// Domain-specific API contracts for future Supabase integration.
export interface CaseCreateInput {
  incidentType: Case["incidentType"];
  narrative: string;
  severity: Case["severity"];
  studentName: string;
  guardianId: string;
}

export interface CaseUpdateInput {
  caseId: string;
  status: CaseStatus;
  actorRole: UserRole;
}

export interface AuditEventInput {
  caseId: string;
  actorRole: UserRole;
  action: string;
}

export interface AuditEventRecord extends AuditEventInput {
  id: string;
  timestamp: string;
}

export interface EscalationRecord {
  id: string;
  caseId: string;
  escalatedAt: string;
  escalatedByRole: UserRole;
  reason?: string;
}

export type FacilityType =
  | "youth_services"
  | "counseling_therapy"
  | "community_clinic"
  | "crisis_support"
  | "family_services"
  | "community_org"
  | "faith_based";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  source?: "curated" | "google_places" | "national";
  description?: string | null;
  phone?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string;
  state: string;
  zip: string;
  lat?: number | null;
  lng?: number | null;
  hours?: Record<string, any> | null;
  audience?: string[] | null;
  tags?: string[] | null;
  distanceMiles?: number | null;
  active: boolean;
  updatedAt: string;
}

export type ResourceAudience = "student" | "parent" | "family" | "all";

export type ResourceConcern =
  | "general"
  | "bullying"
  | "mental_health"
  | "family_crisis"
  | "legal_support"
  | "basic_needs";

export type ResourceDelivery = "either" | "in_person" | "virtual";

export interface FacilitySearchParams {
  query?: string;
  zipCode?: string;
  types?: FacilityType[];
  audience?: ResourceAudience;
  concern?: ResourceConcern;
  delivery?: ResourceDelivery;
}

export interface FacilitySearchResponse {
  items: Facility[];
  usedGoogleFallback: boolean;
  curatedCount: number;
  fallbackCount: number;
}

export interface FacilityDomainApi {
  searchFacilities(params: FacilitySearchParams): Promise<FacilitySearchResponse>;
  getFacilityById(id: string): Promise<Facility | null>;
  saveFacility(userId: string, facilityId: string): Promise<void>;
  getSavedFacilities(userId: string): Promise<Facility[]>;
}
