import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { ExchangeReq, ExchangeRes } from "../model/Exchange";

const END_POINT = "/Exchange";

export const ExchangeService = {
  getAll: async (): Promise<ApiResponse<ExchangeRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getActive: async (): Promise<ApiResponse<ExchangeRes>> => {
    return await apiClient.get(`${END_POINT}/active`);
  },

  create: async (data: ExchangeReq): Promise<ApiResponse<ExchangeRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },
};
