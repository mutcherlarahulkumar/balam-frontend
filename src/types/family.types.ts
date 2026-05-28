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

export interface FamilyListItem extends Family {
  memberCount: number;
  policyCount: number;
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
