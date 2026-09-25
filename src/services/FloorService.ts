import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { FloorReq } from "../model/FloorReq";
import type { FloorRes } from "../model/FloorRes";

const END_POINT = "/Floor";

export const FloorService = {
  getFloorByPage: async (
    page: number,
    pageSize: number
  ): Promise<ApiResponse<PagedResponse<FloorRes>>> => {
    return await apiClient.get(
      `${END_POINT}?page=${page}&pageSize=${pageSize}`
    );
  },
  getAllFloors: async (): Promise<ApiResponse<FloorRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },
  getFloorById: async (floorId: number): Promise<ApiResponse<FloorRes>> => {
    return await apiClient.get(`${END_POINT}/${floorId}`);
  },

  postFloor: async (data: FloorReq): Promise<ApiResponse<FloorRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  putFloor: async (
    floorId: number,
    data: FloorReq
  ): Promise<ApiResponse<FloorRes>> => {
    return await apiClient.put(`${END_POINT}/${floorId}`, data);
  },

  deleteFloor: async (floorId: number): Promise<ApiResponse<FloorRes>> => {
    return await apiClient.delete(`${END_POINT}/${floorId}`);
  },
};
