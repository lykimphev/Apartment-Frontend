import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { OtherExpenseRes, OtherExpenseReq } from "../model/OtherExpense";

const END_POINT = "/OtherExpense";

export const OtherExpenseService = {
  getOtherExpenses: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<OtherExpenseRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllOtherExpenses: async (): Promise<ApiResponse<OtherExpenseRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getOtherExpenseById: async (id: number): Promise<ApiResponse<OtherExpenseRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  getByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<OtherExpenseRes[]>> => {
    return await apiClient.get(
      `${END_POINT}/by-date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
  },

  createOtherExpense: async (
    data: OtherExpenseReq | FormData
  ): Promise<ApiResponse<OtherExpenseRes>> => {
    let body: FormData;
    if (data instanceof FormData) {
      body = data;
    } else {
      body = new FormData();
      if (data.date) body.append("Date", data.date);
      if (data.expenseTypeId && data.expenseTypeId > 0)
        body.append("ExpenseTypeId", data.expenseTypeId.toString());
      if (data.amount !== undefined && data.amount !== null)
        body.append("Amount", data.amount.toString());
      if (data.note) body.append("Note", data.note);
      if (data.createBy) body.append("CreateBy", data.createBy);
      if (data.image) body.append("Image", data.image);
    }
    return await apiClient.post(`${END_POINT}`, body);
  },

  updateOtherExpense: async (
    id: number,
    data: OtherExpenseReq | FormData
  ): Promise<ApiResponse<OtherExpenseRes>> => {
    let body: FormData;
    if (data instanceof FormData) {
      body = data;
    } else {
      body = new FormData();
      if (data.date) body.append("Date", data.date);
      if (data.expenseTypeId && data.expenseTypeId > 0)
        body.append("ExpenseTypeId", data.expenseTypeId.toString());
      if (data.amount !== undefined && data.amount !== null)
        body.append("Amount", data.amount.toString());
      if (data.note) body.append("Note", data.note);
      if (data.createBy) body.append("CreateBy", data.createBy);
      if (data.image) body.append("Image", data.image);
    }
    return await apiClient.put(`${END_POINT}/${id}`, body);
  },

  deleteOtherExpense: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
