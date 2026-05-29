import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi } from '@/api/loans.api';
import { CreateLoanRequest } from '@/types/loan.types';

export const LOAN_KEYS = {
  all: ['loans'] as const,
};

export function useLoans() {
  return useQuery({
    queryKey: LOAN_KEYS.all,
    queryFn: () => loansApi.list(),
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLoanRequest) => loansApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOAN_KEYS.all }),
  });
}
