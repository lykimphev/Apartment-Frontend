import type { StaffRes } from "./Staff";

export interface PaySlipRes {
  id: number;
  staffId?: number;
  staff?: StaffRes;
  date?: string;
  salary?: number;
  vat?: number;
  penalty?: number;
  bonus?: number;
  totalSalary?: number;
  note?: string;
  createDate?: string;
  createBy?: number;
}

export interface PaySlipReq {
  staffId?: number;
  date?: string;
  salary?: number;
  vat?: number;
  penalty?: number;
  bonus?: number;
  note?: string;
  createBy?: number;
}
