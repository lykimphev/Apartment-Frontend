export interface ExpenseTypeRes {
  id: number;
  expenseTypeName?: string;
  description?: string;
  status?: string;
}

export interface ExpenseTypeReq {
  expenseTypeName: string;
  description?: string;
  status?: string;
}
