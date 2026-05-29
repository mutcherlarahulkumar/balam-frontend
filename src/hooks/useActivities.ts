import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '@/api/activities.api';
import { CreateActivityRequest } from '@/types/activity.types';

export const ACTIVITY_KEYS = {
  all: ['activities'] as const,
  list: (clientId?: number) => ['activities', 'list', clientId] as const,
  today: ['activities', 'today'] as const,
};

export function useActivities(clientId?: number) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.list(clientId),
    queryFn: () => activitiesApi.list(clientId),
  });
}

export function useTodayActivities() {
  return useQuery({
    queryKey: ACTIVITY_KEYS.today,
    queryFn: () => activitiesApi.getToday(),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityRequest) => activitiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACTIVITY_KEYS.all }),
  });
}
