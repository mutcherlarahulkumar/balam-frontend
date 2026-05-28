export interface Loan {
  id: number;
  policyNo: number;
  loanDate: string | null;
  loanAmount: number;
  interestDueDate: string | null;
  loanInterest: number;
  details: string;
}

export interface CreateLoanRequest {
  policyNo: number;
  loanDate: string;
  loanAmount: number;
  interestDueDate: string;
  loanInterest?: number;
}
