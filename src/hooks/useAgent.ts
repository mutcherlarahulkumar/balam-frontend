import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/api/agent.api';
import { UpdateProfileRequest } from '@/types/agent.types';

export const AGENT_KEYS = {
  profile: ['agent', 'profile'] as const,
};

export function useAgentProfile() {
  return useQuery({
    queryKey: AGENT_KEYS.profile,
    queryFn: () => agentApi.getProfile(),
  });
}

export function useUpdateAgentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => agentApi.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AGENT_KEYS.profile }),
  });
}
