import apiClient from '@/lib/axios';
import { Loan, CreateLoanRequest } from '@/types/loan.types';

export const loansApi = {
  list: async (policyNo?: number): Promise<Loan[]> => {
    const params = policyNo ? { policyNo } : {};
    const res = await apiClient.get<{ data: Loan[] }>('/loans', { params });
    return res.data.data;
  },
  create: async (data: CreateLoanRequest): Promise<Loan> => {
    const res = await apiClient.post<Loan>('/loans', data);
    return res.data;
  },
};
