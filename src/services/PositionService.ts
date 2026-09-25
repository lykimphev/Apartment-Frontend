import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { Position, PositionReq } from "../model/Position";

const END_POINT = "/Position";

export const PositionService = {
  getPositions: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<Position>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllPositions: async (): Promise<ApiResponse<Position[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getPositionById: async (id: number): Promise<ApiResponse<Position>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  createPosition: async (data: PositionReq): Promise<ApiResponse<Position>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  updatePosition: async (id: number, data: PositionReq): Promise<ApiResponse<Position>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deletePosition: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
