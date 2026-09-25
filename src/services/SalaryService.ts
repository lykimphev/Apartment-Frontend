import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { SalaryRes, SalaryReq } from "../model/Salary";

const END_POINT = "/Salary";

export const SalaryService = {
  getSalaries: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<SalaryRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllSalaries: async (): Promise<ApiResponse<SalaryRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getSalaryById: async (id: number): Promise<ApiResponse<SalaryRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  getSalaryByStaffId: async (staffId: number): Promise<ApiResponse<SalaryRes>> => {
    return await apiClient.get(`${END_POINT}/staff/${staffId}`);
  },

  createSalary: async (data: SalaryReq): Promise<ApiResponse<SalaryRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  updateSalary: async (id: number, data: SalaryReq): Promise<ApiResponse<SalaryRes>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deleteSalary: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
