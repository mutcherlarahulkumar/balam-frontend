import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports.api';

export const REPORT_KEYS = {
  cashflow: (familyCode: string) => ['reports', 'cashflow', familyCode] as const,
  cashinout: ['reports', 'cashinout'] as const,
  status: (familyCode: string) => ['reports', 'status', familyCode] as const,
  calendar: (familyCode: string) => ['reports', 'calendar', familyCode] as const,
};

export function useCashflow(familyCode: string) {
  return useQuery({
    queryKey: REPORT_KEYS.cashflow(familyCode),
    queryFn: () => reportsApi.getCashflow(familyCode),
    enabled: !!familyCode,
  });
}

export function useCashInOut() {
  return useQuery({
    queryKey: REPORT_KEYS.cashinout,
    queryFn: () => reportsApi.getCashInOut(),
  });
}

export function useStatusReport(familyCode: string) {
  return useQuery({
    queryKey: REPORT_KEYS.status(familyCode),
    queryFn: () => reportsApi.getStatus(familyCode),
    enabled: !!familyCode,
  });
}

export function useCalendar(familyCode: string) {
  return useQuery({
    queryKey: REPORT_KEYS.calendar(familyCode),
    queryFn: () => reportsApi.getCalendar(familyCode),
    enabled: !!familyCode,
  });
}

export function useRefreshReports() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (familyCode: string) => reportsApi.refresh(familyCode),
    onSuccess: (_, familyCode) => {
      qc.invalidateQueries({ queryKey: REPORT_KEYS.cashflow(familyCode) });
      qc.invalidateQueries({ queryKey: REPORT_KEYS.status(familyCode) });
      qc.invalidateQueries({ queryKey: REPORT_KEYS.calendar(familyCode) });
    },
  });
}
