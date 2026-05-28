export interface AgentPublic {
  id: number;
  name: string;
  agentCode: string;
  branch: string;
  club: string;
  licenceNo: string;
  agSince: string | null;
  renewalDate: string | null;
  pan: string;
  mobile: string;
  email: string;
  photo: string;
  slogan: string;
  newPortal: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  mobile?: string;
  email?: string;
  photo?: string;
  slogan?: string;
  address?: string;
}
