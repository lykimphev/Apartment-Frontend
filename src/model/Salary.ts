import type { StaffRes } from "./Staff";

export interface SalaryRes {
  id: number;
  staffId?: number;
  staff?: StaffRes;
  date?: string;
  salaryAmount?: number;
  note?: string;
  createDate?: string;
  createBy?: number;
}

export interface SalaryReq {
  staffId?: number;
  date?: string;
  salaryAmount?: number;
  note?: string;
  createBy?: number;
}
