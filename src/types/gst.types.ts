export interface GSTCalculateResponse {
  policyNo: number;
  planNo: string;
  planType: string;
  basePremium: number;
  premiumYear: number;
  gstRate: number;
  gstAmount: number;
  totalPremium: number;
  regulation: string;
  historicalNote: string;
}
