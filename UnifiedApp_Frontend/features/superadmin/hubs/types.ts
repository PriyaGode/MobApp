export enum HubStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface HubSummary {
  id: string;
  code: string;
  name: string;
  location: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  status: HubStatus;
}

export interface HubDetail {
  id: string;
  code: string;
  name: string;
  location: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  city?: string;
  region?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: HubStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HubCreateRequest {
  code: string;
  name: string;
  location: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  city?: string;
  region?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: HubStatus;
}

export interface HubUpdateRequest {
  name: string;
  location: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  city?: string;
  region?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: HubStatus;
}

export type HubFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface GroupedHubs {
  [city: string]: HubSummary[];
}
