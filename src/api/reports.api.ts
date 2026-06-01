import apiClient from '@/lib/axios';
import {
  CashflowEntry,
  CashInOutEntry,
  PolicyStatusSnapshot,
  CalendarEntry,
} from '@/types/report.types';

export const reportsApi = {
  getCashflow: async (familyCode: string): Promise<CashflowEntry[]> => {
    const res = await apiClient.get<{ data: CashflowEntry[] }>('/reports/cashflow', { params: { familyCode } });
    return res.data.data;
  },
  getCashInOut: async (): Promise<CashInOutEntry[]> => {
    const res = await apiClient.get<{ data: CashInOutEntry[] }>('/reports/cashinout');
    return res.data.data;
  },
  getStatus: async (familyCode: string): Promise<PolicyStatusSnapshot[]> => {
    const res = await apiClient.get<{ data: PolicyStatusSnapshot[] }>('/reports/status', { params: { familyCode } });
    return res.data.data;
  },
  getCalendar: async (familyCode: string): Promise<CalendarEntry[]> => {
    const res = await apiClient.get<{ data: CalendarEntry[] }>('/reports/calendar', { params: { familyCode } });
    return res.data.data;
  },
  refresh: async (familyCode: string): Promise<void> => {
    await apiClient.post('/reports/refresh', { familyCode });
  },
};
