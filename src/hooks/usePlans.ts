import { useQuery } from '@tanstack/react-query';
import { plansApi, PlanListParams } from '@/api/plans.api';

export const PLAN_KEYS = {
  all: ['plans'] as const,
  list: (params: PlanListParams) => ['plans', 'list', params] as const,
};

export function usePlans(params: PlanListParams = {}) {
  return useQuery({
    queryKey: PLAN_KEYS.list(params),
    queryFn: () => plansApi.list(params),
    staleTime: 10 * 60 * 1000,
  });
}
