import { ClientType, Sex } from './common.types';

export interface Client {
  id: number;
  familyCode: string;
  persCode: string;
  name: string;
  mobile: string;
  dob: string | null;
  sex: Sex;
  address: string;
  email: string;
  occupation: string;
  age: number;
  clientType: ClientType;
}

export interface CreateClientRequest {
  familyCode: string;
  persCode: string;
  name: string;
  dob?: string;
  sex?: Sex;
  mobile?: string;
  email?: string;
  occupation?: string;
  clientType?: ClientType;
  address?: string;
}
