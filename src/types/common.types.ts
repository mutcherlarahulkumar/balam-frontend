export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  message: string;
  field?: string;
}

export type PaymentMode = 'Y' | 'H' | 'Q' | 'M' | 'S';
export type PolicyStatus = 'IF' | 'LA' | 'PU' | 'SU' | 'MA' | 'CL' | 'EX';
export type FUPStatus = 'PAID' | 'DUE' | 'OVERDUE' | 'LAPSED';
export type ClientType = 'C' | 'P' | 'N';
export type Sex = 'M' | 'F' | 'O';
export type ActivityType = 'CALL' | 'MEETING' | 'DEMO' | 'EMAIL' | 'PROPOSAL' | 'MEDICAL' | 'REMINDER';
export type ActivityStatus = 'PENDING' | 'DONE' | 'CANCELLED';
export type NEFTStatus = 'YES' | 'NO';
