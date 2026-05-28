export interface SBScheduleEntry {
  year: number;
  benefitPct: number;
}

export interface GSTRates {
  firstYear: number;
  renewal: number;
  note: string;
}

export interface Plan {
  planNo: string;
  planName: string;
  planType: string;
  termPpt: boolean;
  sbSchedule: SBScheduleEntry[];
  stax: string;
  lapsDays: number;
  gstRates: GSTRates;
}
