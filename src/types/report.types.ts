export interface CashflowEntry {
  year: number;
  sbAmount: number;
  maturityAmount: number;
  total: number;
}

export interface CashInOutEntry {
  year: number;
  cashIn: number;
  cashOut: number;
  net: number;
}

export interface PolicyStatusSnapshot {
  policyNo: number;
  planName: string;
  status: string;
  premiumPaid: number;
  bonus: number;
  surrenderValue: number;
  loan: number;
}

export interface CalendarEntry {
  month: string;
  policies: {
    policyNo: number;
    clientName: string;
    premium: number;
    paymentMode: string;
  }[];
  totalPremium: number;
}
