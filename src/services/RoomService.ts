import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pagedResponse";
import type { RoomReq, RoomRes } from "../model/Room";

const END_POINT = "/Room";

export const RoomService = {
  getRooms: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedResponse<RoomRes>>> => {
    return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
  },

  getAllRooms: async (): Promise<ApiResponse<RoomRes[]>> => {
    return await apiClient.get(`${END_POINT}/all`);
  },

  getRoomById: async (id: number): Promise<ApiResponse<RoomRes>> => {
    return await apiClient.get(`${END_POINT}/${id}`);
  },

  postRoom: async (data: RoomReq): Promise<ApiResponse<RoomRes>> => {
    return await apiClient.post(`${END_POINT}`, data);
  },

  putRoom: async (id: number, data: RoomReq): Promise<ApiResponse<RoomRes>> => {
    return await apiClient.put(`${END_POINT}/${id}`, data);
  },

  deleteRoom: async (id: number): Promise<ApiResponse<any>> => {
    return await apiClient.delete(`${END_POINT}/${id}`);
  },
};
