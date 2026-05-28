export interface SB {
  id: number;
  policyNo: number;
  sbDueDate: string | null;
  sbAmount: number;
  instalmentNo: number;
  sbPayDate: string | null;
  chequeNo: string;
  details: string;
}

export interface CreateSBRequest {
  policyNo: number;
  sbDueDate: string;
  sbAmount: number;
  instalmentNo: number;
}

export interface MarkSBPaidRequest {
  paidDate: string;
  chequeNo?: string;
}
