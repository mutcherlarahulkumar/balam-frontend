export interface Commission {
  id: number;
  policyNo: number;
  billDate: string | null;
  firstComm: number;
  secondComm: number;
  thirdComm: number;
  bonusComm: number;
  singleComm: number;
  subComm: number;
  payDate: string | null;
}

export interface CreateCommissionRequest {
  policyNo: number;
  billDate: string;
  firstComm?: number;
  secondComm?: number;
  thirdComm?: number;
  bonusComm?: number;
  singleComm?: number;
  payDate?: string;
}

export interface CommissionCurrentMonth {
  month: string;
  totalCommission: number;
  policiesBilled: number;
}

export interface CommissionYearly {
  year: number;
  firstYear: number;
  renewal: number;
  bonus: number;
  gross: number;
}

export interface CommissionSummary {
  currentMonth: CommissionCurrentMonth;
  yearly: CommissionYearly[];
}

export interface CommissionCalculateResponse {
  policyNo: number;
  premium: number;
  planNo: string;
  year: number;
  baseCommissionPct: number;
  bonusCommissionPct: number;
  totalPct: number;
  estimatedCommission: number;
  note: string;
}
