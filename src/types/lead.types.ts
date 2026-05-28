export interface Lead {
  id: number;
  leadId: string;
  searchTerm: string;
  name: string;
  mobile: string;
  address: string;
  status: number;
  dateAdded: string | null;
}

export interface CreateLeadRequest {
  name: string;
  mobile: string;
  address?: string;
  searchTerm?: string;
}
