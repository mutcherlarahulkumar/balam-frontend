import apiClient from '@/lib/axios';
import { GSTCalculateResponse } from '@/types/gst.types';

export const gstApi = {
  calculate: async (policyNo: number, premiumYear = 1): Promise<GSTCalculateResponse> => {
    const res = await apiClient.get<GSTCalculateResponse>('/gst/calculate', {
      params: { policyNo, premiumYear },
    });
    return res.data;
  },
};
