import type { ExpenseTypeRes } from "./ExpenseType";

export interface OtherExpenseRes {
  id: number;
  date?: string;
  expenseTypeId?: number;
  expenseType?: ExpenseTypeRes;
  amount?: number;
  note?: string;
  createBy?: string;
  createDate?: string;
  image?: string;
}

export interface OtherExpenseReq {
  date?: string;
  expenseTypeId?: number;
  amount?: number;
  note?: string;
  createBy?: string;
  image?: File | null;
}
