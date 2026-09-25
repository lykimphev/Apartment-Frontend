import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { PaySlipRes, PaySlipReq } from "../model/PaySlip";

const END_POINT = "/PaySlip";

export const PaySlipService = {
  getPaySlips: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<PaySlipRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllPaySlips: async (): Promise<ApiResponse<PaySlipRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getPaySlipById: async (id: number): Promise<ApiResponse<PaySlipRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  createPaySlip: async (data: PaySlipReq): Promise<ApiResponse<PaySlipRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  updatePaySlip: async (id: number, data: PaySlipReq): Promise<ApiResponse<PaySlipRes>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deletePaySlip: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
