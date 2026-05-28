export interface FUPDueItem {
  policyNo: number;
  clientName: string;
  mobile: string;
  planName: string;
  premium: number;
  nextPremium: string | null;
  daysOverdue: number;
  paymentMode: string;
  lapseDate: string | null;
  daysUntilLapse: number;
}

export interface UpdateFUPRequest {
  policyNo: number;
  oldFup: string;
  newFup: string;
  reason?: string;
}

export interface MultipleDue {
  id: number;
  policyNo: number;
  dueDate: string | null;
  instNo: number;
  intAmt: number;
  validUpto: string | null;
  totalAmt: number;
}

export interface FUPHistory {
  id: number;
  policyNo: number;
  oldFup: string | null;
  newFup: string | null;
  updatedBy: string;
  updatedAt: string | null;
}
