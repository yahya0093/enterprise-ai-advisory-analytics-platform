export const BRANCHES: string[] = [];

export type Source = "Online" | "Offline";
export type BranchType = "Franchise" | "Owned" | "Packages";

export interface DailyRecord {
  date: string;
  branch: string;
  source: Source;
  branchType: BranchType;
  customers: number;
  newCustomers: number;
  returnCustomers: number;
  orders: number;
  revenue: number;
  billAfterDiscount: number;
}

export const ALL_DATES = ["2026-01-01", "2026-05-31"];
export const RECORDS: DailyRecord[] = [];