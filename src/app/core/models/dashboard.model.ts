export interface KpiPeriod {
  totalQuoted: number;
  approved: number;
  rejected: number;
  sent: number;
  avgHoursToQuote: number | null;
  approvalRate: number | null;
}

export interface DashboardKpisResponse {
  from: string;
  to: string;
  current: KpiPeriod;
  previous: KpiPeriod;
  previousFrom: string;
  previousTo: string;
}
