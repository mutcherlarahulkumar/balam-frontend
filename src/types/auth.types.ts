import { AgentPublic } from './agent.types';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  agent: AgentPublic;
  expiresAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  agentCode: string;
  password: string;
  branch: string;
  mobile: string;
  licenceNo: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshResponse {
  token: string;
  expiresAt: string;
}
