import { Client } from './client.types';
import { PolicyListItem } from './policy.types';

export interface Family {
  id: number;
  familyCode: string;
  headName: string;
  address: string;
  email: string;
  mobile: string;
  pincode: string;
  religion: string;
  designation: string;
}

export interface FamilyListItem {
  id: number;
  familyCode: string;
  headName: string;
  mobile: string;
  address: string;
  pincode: string;
  memberCount: number;
  policyCount: number;
}

export interface FamilyDetail extends Family {
  members: Client[];
  policies: PolicyListItem[];
}

export interface CreateFamilyRequest {
  familyCode?: string;
  headName: string;
  address?: string;
  mobile?: string;
  email?: string;
  pincode?: string;
  religion?: string;
  designation?: string;
}
