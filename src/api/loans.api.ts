import apiClient from '@/lib/axios';
import { Loan, CreateLoanRequest } from '@/types/loan.types';

export const loansApi = {
  list: async (): Promise<Loan[]> => {
    const res = await apiClient.get<Loan[]>('/loans');
    return res.data;
  },
  create: async (data: CreateLoanRequest): Promise<Loan> => {
    const res = await apiClient.post<Loan>('/loans', data);
    return res.data;
  },
};
