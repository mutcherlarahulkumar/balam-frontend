export interface BankDetail {
  id: number;
  clientId: number;
  bankName: string;
  accountNumber: string;
  ifseCode: string;
  micrCode: string;
  familyCode: string;
  persCode: string;
  aadhar: string;
  pan: string;
  ckyc: string;
}

export interface CreateBankDetailRequest {
  bankName: string;
  accountNumber: string;
  ifseCode?: string;
  micrCode?: string;
  aadhar?: string;
  pan?: string;
  ckyc?: string;
}
