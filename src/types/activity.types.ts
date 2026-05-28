import { ActivityType, ActivityStatus } from './common.types';

export interface Activity {
  id: number;
  clientId: number;
  activityDate: string | null;
  activityTime: string | null;
  activityType: ActivityType;
  details: string;
  reminderDate: string | null;
  reminderTime: string | null;
  status: ActivityStatus;
}

export interface CreateActivityRequest {
  clientId: number;
  activityType: ActivityType;
  activityDate: string;
  activityTime?: string;
  details?: string;
  reminderDate?: string;
  reminderTime?: string;
  status?: ActivityStatus;
}
