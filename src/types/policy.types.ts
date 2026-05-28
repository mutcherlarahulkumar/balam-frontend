import { PaymentMode, PolicyStatus, FUPStatus, NEFTStatus } from './common.types';

export interface PolicyListItem {
  id: number;
  policyNo: number;
  familyCode: string;
  clientName: string;
  planNo: string;
  planName: string;
  term: number;
  ppt: number;
  premium: number;
  sumAssured: number;
  paymentMode: PaymentMode;
  nextPremium: string | null;
  matDate: string | null;
  status: PolicyStatus;
  fupStatus: FUPStatus;
  daysUntilLapse: number;
}

export interface CreatePolicyRequest {
  policyNo: number;
  familyCode: string;
  persCode: string;
  planNo: string;
  issueDate: string;
  matDate: string;
  term: number;
  ppt: number;
  sumAssured: number;
  premium: number;
  paymentMode: PaymentMode;
  nextPremium: string;
  nominee: string;
  relation: string;
  branch?: string;
  neft?: NEFTStatus;
  dab?: number;
  termRider?: number;
}

export interface UpdatePolicyRequest {
  status?: PolicyStatus;
  nominee?: string;
  relation?: string;
  neft?: NEFTStatus;
  nextPremium?: string;
  fupStatus?: string;
}

export interface PolicyFilters {
  status?: PolicyStatus;
  familyCode?: string;
  dueThisMonth?: boolean;
  lapsingIn?: number;
  page?: number;
  limit?: number;
}
