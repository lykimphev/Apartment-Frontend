import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { ExpenseTypeRes, ExpenseTypeReq } from "../model/ExpenseType";

const END_POINT = "/ExpenseType";

export const ExpenseTypeService = {
  getExpenseTypes: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<ExpenseTypeRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllExpenseTypes: async (): Promise<ApiResponse<ExpenseTypeRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getExpenseTypeById: async (id: number): Promise<ApiResponse<ExpenseTypeRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  createExpenseType: async (data: ExpenseTypeReq): Promise<ApiResponse<ExpenseTypeRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  updateExpenseType: async (id: number, data: ExpenseTypeReq): Promise<ApiResponse<ExpenseTypeRes>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deleteExpenseType: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
